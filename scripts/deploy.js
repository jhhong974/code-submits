const fs = require("fs")
const { ethers, artifacts } = require("hardhat");
const { deploy_TxForwarder } = require("./deploy/TxForwarder");
const { deploy_OrderRules } = require("./deploy/OrderRules");
const { deploy_Order } = require("./deploy/Order");
const { deploy_SBTMinter } = require("./deploy/SBTMinter");
const { deploy_SBT } = require("./deploy/SBT");
const { deploy_Treasury } = require("./deploy/Treasury");
const { deploy_DefaultSBT } = require("./deploy/DefaultSBT");
const { encodeSBTTokenURL, initUpgradeCarrierRules, initUpgradeShipperRules } = require("./setSBTURI/setSbtUri");
const _OrderRules = artifacts.readArtifactSync('OrderRules')


async function main() {
    const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER);
    const shipper = new ethers.Wallet(process.env.SHIPPER_KEY,provider);
    const carrier = new ethers.Wallet(process.env.CARRIER_KEY,provider);
    const admin = new ethers.Wallet(process.env.ADMIN_KEY,provider);

    console.log(`----------------------------------------------------`);
    console.log('시작하기 전 잔금 확인 ....');
    console.log(`....Admin: [${await ethers.provider.getBalance(admin.address)}]`);
    console.log(`....Shipper: [${await ethers.provider.getBalance(shipper.address)}]`);
    console.log(`....Carrier: [${await ethers.provider.getBalance(carrier.address)}]`);
    console.log(`----------------------------------------------------\n`);

    const TxForwarderCA = await deploy_TxForwarder(admin);
    const OrderRulesCA = await deploy_OrderRules(admin)
    const OrderCA = await deploy_Order(1,OrderRulesCA,TxForwarderCA,admin);
    const SBTMinterCA = await deploy_SBTMinter(OrderRulesCA,admin);
    
    /** --------------------- set SBT Token URI ---------------------*/    
    let TOKENURI = encodeSBTTokenURL("DEV","Lodis Sbt Carrier");
    await initUpgradeCarrierRules(SBTMinterCA,admin,TOKENURI);
    TOKENURI = encodeSBTTokenURL("DEV","Lodis Sbt Shipper");
    await initUpgradeShipperRules(SBTMinterCA,admin,TOKENURI);
    /** -------------------------------------------------------------*/   

    const SBTShipperCA = await deploy_SBT("LodisSbtShipper","LSS",SBTMinterCA,admin)
    const SBTCarrierCA = await deploy_SBT("LodisSbtCarrier","LSC",SBTMinterCA,admin)
    const DefaultSBTCA = await deploy_DefaultSBT(admin);

    /** --------------------- fxDKA 배포 파트 ---------------------*/    
    const DKA = await ethers.getContractFactory("DKA");
    const dka = await DKA.connect(admin).deploy(TxForwarderCA,OrderRulesCA);
    await dka.connect(admin).transfer(shipper.address,ethers.utils.parseEther('20000'))
    await dka.connect(admin).transfer(carrier.address,ethers.utils.parseEther('20000'))
    console.log(`DKA Contract : ${dka.address}`)
    console.log('DKA 잔금 확인 ....');
    console.log(`....Shipper: [${await dka.balanceOf(shipper.address)}]`);
    console.log(`....Carrier: [${await dka.balanceOf(carrier.address)}]`);
    const TOKENADDRESS = dka.address;
    /** ---------------------------------------------------------*/    

    const TreasuryCA = await deploy_Treasury(TOKENADDRESS,admin);
    let address = { TxForwarderCA, OrderRulesCA, OrderCA, SBTMinterCA, TreasuryCA,DefaultSBTCA, SBTShipperCA, SBTCarrierCA,DKA:TOKENADDRESS }
    fs.writeFileSync('contracts.json',JSON.stringify(address,null,4));
    
    const OrderRules = new ethers.Contract(OrderRulesCA,_OrderRules.abi,admin)
    await OrderRules.setDKATokenAddress(dka.address);
    await OrderRules.setOrderAddress(OrderCA);
    await OrderRules.setTreasuryAddress(TreasuryCA);
    await OrderRules.setSBTMinterAddress(SBTMinterCA);
    await OrderRules.setShipperSBTAddress(SBTShipperCA);
    await OrderRules.setCarrierSBTAddress(SBTCarrierCA);

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});