import { BigNumber, ethers } from 'ethers';
import * as format from './typedData';
import TxForwarder from "../../../artifacts/contracts/TxForwarder.sol/TxForwarder.json"
import Order from "../../../artifacts/contracts/Order.sol/Order.json"
import DKA from "../../../artifacts/contracts/DKA.sol/DKA.json"

export class dataGenerator {
    tokenContract: any;
    orderContract: any;
    forwarderContract: any;

    constructor(provider: any) {
        this.tokenContract = new ethers.Contract(process.env.TOKEN, DKA.abi, provider);
        this.orderContract = new ethers.Contract(process.env.ORDER, Order.abi, provider);
        this.forwarderContract = new ethers.Contract(process.env.FORWARDER, TxForwarder.abi, provider);
    }
    
    async matchingData(orderId: number, signer: string, reward: BigNumber) {
        const data = await this.orderContract.getOrder(orderId);
        const order_nonce = await this.orderContract.getNonce(orderId, signer);

        const orderData = {
            "orderId": data[0],
            "shipper": data[1],
            "carrier": signer,
            "departure": data[3],
            "destination": data[4],
            "packageWeight": data[5],
            "packagePrice": data[6],
            "reward": reward,
            "collateral": data[8],
            "expiredDate": data[11],
            "nonce": order_nonce
        };

        return orderData;
    }

    async permitCarrierData(orderId: number, signer: string) {
        const data = await this.orderContract.getOrder(orderId);

        const permit_nonce = await this.tokenContract.getNonce(orderId, signer);
        const permitData = format.permit_message(signer, this.orderContract.address, data[8], permit_nonce, 4114285804);

        return permitData;
    }

    async permitShipperData(orderId: number, signer: string, reward: BigNumber) {
        const permit_nonce = await this.tokenContract.getNonce(orderId, signer);

        const permitData = format.permit_message(signer, this.orderContract.address, reward, permit_nonce, 4114285804);

        return permitData;
    }

    async permitSig(owner: string, spender: string, value: BigNumber) {
        const permit_nonce = await this.tokenContract.nonces(owner);

        const permitData = format.permit_message(owner, spender, value, permit_nonce, 4114285804);

        return permitData;
    }

    async forwardData(from: string, to: string, inputData: string) {
        return {
            from: from,
            to: to,
            value: 0,
            gas:1500000,
            nonce: await this.forwarderContract.getNonce(from),
            data: inputData
        }
    }
}