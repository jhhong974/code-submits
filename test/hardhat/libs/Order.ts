import { BigNumber, ethers } from 'ethers';
import Order from "../../../artifacts/contracts/Order.sol/Order.json"

export class Orderlibs {
    instance: any;
    interface: any;

    constructor(address: string, provider: any) {
        this.instance = new ethers.Contract(address, Order.abi, provider);
        this.interface = ethers.Contract.getInterface(Order.abi);
    }

    async getOrderId(): Promise<number> {
        const id = await this.instance.getOrderId();
        return id;
    }
    async getNonce(orderId: number, userAddress: string): Promise<number> {
        const nonce = await this.instance.getNonce(orderId, userAddress);
        return nonce;
    }

    async getOrder(id: number): Promise<any> {
        const order = await this.instance.getOrder(id);
        return order;
    }

    async getRecord(user: string): Promise<any> {
        const record = await this.instance.getRecord(user);
        return record;
    }

    async signatureData(orderId: number, signer: string): Promise<any> {
        const data = await this.instance.getOrder(orderId);
        const nonce = await this.instance.getNonce(orderId, signer);

        const sigData = {
            "orderId": data[0],
            "shipper": data[1],
            "carrier": data[2],
            "departure": data[3],
            "destination": data[4],
            "packageWeight": data[5],
            "packagePrice": data[6],
            "reward": data[7],
            "collateral": data[8],
            "expiredDate": data[11],
            "nonce": nonce
        };

        return sigData;
    }

    async cancelOrderBeforeMatch(orderId: number): Promise<string> {
        const rawdata = await this.interface.encodeFunctionData(
            'cancelOrderBeforeMatch',
            [orderId],
        );
        return rawdata;
    }

    async cancelOrderBeforePickUp(orderId: number): Promise<string> {
        const rawdata = await this.interface.encodeFunctionData(
            'cancelOrderBeforePickUp',
            [orderId],
        );
        return rawdata;
    }

    async cancelOrderByFault(
        orderId: number,
        signer: string,
        cancelSig: string,
    ): Promise<string> {

        const rawdata = await this.interface.encodeFunctionData('cancelOrderByFault', [
            orderId,
            await this.signatureData(orderId, signer),
            cancelSig
        ]);
        return rawdata;
    }

    async createOrder(
        shipper: string,
        departure: number, 
        destination: number,
        weight: number,
        price: BigNumber,
        expiredDate: number,
        ispickContact: boolean,        
        iscompContact: boolean,
        extraData: string
    ): Promise<string> {
        const rawdata = await this.interface.encodeFunctionData('createOrder', [
            shipper,
            ethers.utils.hexZeroPad(ethers.utils.hexlify(departure), 32),
            ethers.utils.hexZeroPad(ethers.utils.hexlify(destination), 32),
            ethers.utils.hexZeroPad(ethers.utils.hexlify(weight), 32),
            price,
            expiredDate,
            ispickContact,
            iscompContact,
            extraData
        ]);
        return rawdata;
    }

    async selectOrder(
        orderId: number,
        carrierOrderData: any,
        carrierOrderSig: string,
        carrierPermitData: any,
        carrierCollateralSig: string,
        shipperPermitData: any,
        shipperRewardSig: string,
    ): Promise<string> {
        const rawdata = await this.interface.encodeFunctionData('selectOrder', [
            orderId,
            carrierOrderData,
            carrierOrderSig,
            carrierPermitData,
            carrierCollateralSig,
            shipperPermitData,
            shipperRewardSig
        ]);
        return rawdata;
    }

    async pickOrder(
        orderId: number,
        signer: string,
        shipperMsg: string,
    ): Promise<string> {
        
        const rawdata = await this.interface.encodeFunctionData('pickOrder', [
            orderId,
            await this.signatureData(orderId, signer),
            shipperMsg
        ]);
        return rawdata;
    }

    async pickOrderWithOutSig(
        orderId: number
    ): Promise<string> {
        const rawdata = await this.interface.encodeFunctionData('pickOrderWithOutSig', [
            orderId
        ]);
        return rawdata;
    }

    async delayPickUp(
        orderId: number
    ): Promise<string> {
        const rawdata = await this.interface.encodeFunctionData('delayPickUp', [
            orderId
        ]);
        return rawdata;
    }

    async completeOrder(
        orderId: number,
        signer: string,
        shipper712Sig: string,
    ): Promise<string> {
        const rawdata = await this.interface.encodeFunctionData('completeOrder', [
            orderId,
            await this.signatureData(orderId, signer),
            shipper712Sig
        ]);
        return rawdata;
    }

    async completeOrderWithOutSig(
        orderId: number
    ): Promise<string> {
        const rawdata = await this.interface.encodeFunctionData('completeOrderWithOutSig', [
            orderId
        ]);
        return rawdata;
    }

    async expiredOrder(
        orderId: number
    ): Promise<string> {
        const rawdata = await this.interface.encodeFunctionData('expiredOrder', [
            orderId
        ]);
        return rawdata;
    }
}