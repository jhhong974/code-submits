import { Orderlibs } from "./libs/Order";
import { dataGenerator } from "./libs/dataGenerator";
import { TxForwarderLibs } from "./libs/TxForwarder";
import { DKAlibs } from "./libs/DKA";
import { SBTLibs } from "./libs/SBT";
import { BigNumber, ethers } from 'ethers';
import * as format from './libs/typedData';
import 'dotenv/config'

const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER);
const sigMaker = new dataGenerator(provider);
const orderContract = new Orderlibs(process.env.ORDER, provider);
const forwarderContract = new TxForwarderLibs(process.env.FORWARDER, provider);
const DKA = new DKAlibs(process.env.TOKEN, provider);

const walletShipper = new ethers.Wallet(process.env.SHIPPER_KEY);
const walletCarrier = new ethers.Wallet(process.env.CARRIER_KEY);
const walletForwarder = new ethers.Wallet(process.env.ADMIN_KEY);

async function fwCreateOrder(){
    const createData = await orderContract.createOrder(
        walletShipper.address, //shipper address
        1100000000, // 출발지 주소 (법정동 코드)
        1100000000, // 도작지 주소 (법정동 코드)
        100, // 물품 무게
        ethers.utils.parseEther('1000'), // 금액
        0, // 만료시간,
        false,
        false,
        '1' // 서버의 orderNo
    );
        
    const walletSigner = walletForwarder.connect(provider);

    //2770 data 생성
    const req = await sigMaker.forwardData(walletShipper.address, process.env.ORDER, createData)
    
    //2770 data를 위임서비스이용자(원 Msg.sender)가 서명
    const sig = await forwarderContract.signMetaTx(req, walletShipper.connect(provider));
    
    await forwarderContract.execute(req, sig, walletSigner);
}

async function fwSelectOrder(_orderId: number, reward: BigNumber) {
    let orderId:number = +ethers.utils.hexValue(_orderId)
    const orderData = await sigMaker.matchingData(orderId, walletCarrier.address, reward); // 캐리어의 주문 서명
    const permitDataCarrier = await sigMaker.permitCarrierData(orderId, walletCarrier.address); // 캐리어의 담보 서명
    const permitDataShipper = await sigMaker.permitShipperData(orderId, walletShipper.address, reward); // 화주의 보상 서명

    const selectData = await orderContract.selectOrder(
        orderId,
        orderData,
        await walletCarrier._signTypedData(format.order_domain((await provider.getNetwork()).chainId, process.env.ORDER), format.order_types(), orderData),
        permitDataCarrier,
        await walletCarrier._signTypedData(format.permit_domain((await provider.getNetwork()).chainId, process.env.TOKEN), format.permit_types(), permitDataCarrier),
        permitDataShipper,
        await walletShipper._signTypedData(format.permit_domain((await provider.getNetwork()).chainId, process.env.TOKEN), format.permit_types(), permitDataShipper)
    );
    //tx forwarder
    const walletSigner = walletForwarder.connect(provider);
    //2770 data 생성
    const req = await sigMaker.forwardData(walletShipper.address, process.env.ORDER, selectData)
    //2770 data를 위임서비스이용자(원 Msg.sender)가 서명
    const sig = await forwarderContract.signMetaTx(req, walletShipper.connect(provider));
    await forwarderContract.execute(req, sig, walletSigner);
}

async function fwPickOrderWithOutSig(orderId: number) {
    const pickUpData = await orderContract.pickOrderWithOutSig(orderId);

    //tx forwarder
    const walletSigner = walletForwarder.connect(provider);
    //2770 data 생성
    const req = await sigMaker.forwardData(walletCarrier.address, process.env.ORDER, pickUpData)
    //2770 data를 위임서비스이용자(원 Msg.sender)가 서명
    const sig = await forwarderContract.signMetaTx(req, walletCarrier.connect(provider));
    await forwarderContract.execute(req, sig, walletSigner);
}

async function fwCompleteOrderWithOutSig(orderId: number) {
    const completeData = await orderContract.completeOrderWithOutSig(orderId);

    const walletSigner = walletForwarder.connect(provider);
    //2770 data 생성
    const req = await sigMaker.forwardData(walletCarrier.address, process.env.ORDER, completeData)
    //2770 data를 위임서비스이용자(원 Msg.sender)가 서명
    const sig = await forwarderContract.signMetaTx(req, walletCarrier.connect(provider));
    await forwarderContract.execute(req, sig, walletSigner);
}

//배송전 취소
async function fwCancelOrderBeforeMatch(orderId: number) {
    const cancelData = await orderContract.cancelOrderBeforeMatch(orderId);

    const walletSigner = walletForwarder.connect(provider);
    //2770 data 생성
    const req = await sigMaker.forwardData(walletShipper.address, process.env.ORDER, cancelData)
    //2770 data를 위임서비스이용자(원 Msg.sender)가 서명
    const sig = await forwarderContract.signMetaTx(req, walletShipper.connect(provider));
    await forwarderContract.execute(req, sig, walletSigner);
}

//배송후 취소 (캐리어도 가능)
async function fwCancelOrderBeforePickUp(orderId: number) {
    const cancelData = await orderContract.cancelOrderBeforePickUp(orderId);

    const walletSigner = walletForwarder.connect(provider);
    //2770 data 생성
    const req = await sigMaker.forwardData(walletShipper.address, process.env.ORDER, cancelData)
    //2770 data를 위임서비스이용자(원 Msg.sender)가 서명
    const sig = await forwarderContract.signMetaTx(req, walletShipper.connect(provider));
    await forwarderContract.execute(req, sig, walletSigner);
}

//픽업 후 임의 취소
//캐리어와 화주가 각각 1회씩 tx발행해야함
async function fwCancelOrderByFaultShipper(orderId: number) {
    //취소 당사자(화주)의 정보 + 서명
    const orderData = await orderContract.signatureData(orderId, walletShipper.address);
    const cancelSig = await walletShipper._signTypedData(format.order_domain((await provider.getNetwork()).chainId, process.env.ORDER), format.order_types(), orderData);

    const cancelData = await orderContract.cancelOrderByFault(orderId, walletShipper.address, cancelSig);

    const walletSigner = walletForwarder.connect(provider);
    //2770 data 생성
    const req = await sigMaker.forwardData(walletShipper.address, process.env.ORDER, cancelData)
    //2770 data를 위임서비스이용자(원 Msg.sender)가 서명
    const sig = await forwarderContract.signMetaTx(req, walletShipper.connect(provider));
    await forwarderContract.execute(req, sig, walletSigner);
}

async function fwCancelOrderByFaultCarrier(orderId: number) {
    //취소 당사자(캐리어)의 정보 + 서명
    const orderData = await orderContract.signatureData(orderId, walletCarrier.address);
    const cancelSig = await walletCarrier._signTypedData(format.order_domain((await provider.getNetwork()).chainId, process.env.ORDER), format.order_types(), orderData);

    const cancelData = await orderContract.cancelOrderByFault(orderId, walletCarrier.address, cancelSig);

    const walletSigner = walletForwarder.connect(provider);
    //2770 data 생성
    const req = await sigMaker.forwardData(walletShipper.address, process.env.ORDER, cancelData)
    //2770 data를 위임서비스이용자(원 Msg.sender)가 서명
    const sig = await forwarderContract.signMetaTx(req, walletShipper.connect(provider));
    await forwarderContract.execute(req, sig, walletSigner);
}

(async () => {
    console.log('before order......')
    console.log("Order Balance: ", ethers.utils.formatUnits(await DKA.balanceOf(process.env.ORDER), 18));
    console.log("Shipper Balance: ", ethers.utils.formatUnits(await DKA.balanceOf(walletShipper.address), 18));
    console.log("Carrier Balance: ", ethers.utils.formatUnits(await DKA.balanceOf(walletCarrier.address), 18));

    console.log("Shipper ETH: ", ethers.utils.formatEther(await provider.getBalance(walletShipper.address)));
    console.log("Carrier ETH: ", ethers.utils.formatEther(await provider.getBalance(walletCarrier.address)));
    console.log("Forwarder ETH: ", ethers.utils.formatEther(await provider.getBalance(walletForwarder.address)));


    let orderId = await orderContract.getOrderId();
    console.log(`>>> orderId : ${orderId}`);

    await fwCreateOrder()

    await fwSelectOrder(orderId, ethers.utils.parseEther('1000'))
    await fwPickOrderWithOutSig(orderId)
    await fwCompleteOrderWithOutSig(orderId)
    console.log('after order......')
    console.log("Order Balance: ", ethers.utils.formatUnits(await DKA.balanceOf(process.env.ORDER), 18));
    console.log("Shipper Balance: ", ethers.utils.formatUnits(await DKA.balanceOf(walletShipper.address), 18));
    console.log("Carrier Balance: ", ethers.utils.formatUnits(await DKA.balanceOf(walletCarrier.address), 18));

    console.log("Shipper ETH: ", ethers.utils.formatEther(await provider.getBalance(walletShipper.address)));
    console.log("Carrier ETH: ", ethers.utils.formatEther(await provider.getBalance(walletCarrier.address)));
    console.log("Forwarder ETH: ", ethers.utils.formatEther(await provider.getBalance(walletForwarder.address)));
    console.log('--------------------------------------------------------')
})()