import { BigNumber, ethers } from 'ethers';
import * as format from './typedData';
import DKA from "../../../artifacts/contracts/DKA.sol/DKA.json"

export class DKAlibs {
    instance: any;
    interface: any;

    constructor(address: string, provider: any) {
        this.instance = new ethers.Contract(address, DKA.abi, provider);
        this.interface = ethers.Contract.getInterface(DKA.abi);
    }

        
    async balanceOf(userAddress: string): Promise<number> {
        const amount = await this.instance.balanceOf(userAddress);
        return amount;
    }

    async totalSupply(): Promise<number> {
        const totalAmount = await this.instance.totalSupply();
        return totalAmount;
    }

    async getNonce(orderId: number, userAddress: string): Promise<number> {
        const nonce = await this.instance.getNonce(orderId, userAddress);
        return nonce;
    }

    async transfer(receiver: string, value: number): Promise<any> {
        const rawdata = await this.interface.encodeFunctionData(
            'transfer',
            [receiver, value],
        );
        return rawdata;
    }

    async approve(spender: string, value: number): Promise<any> {
        const rawdata = await this.interface.encodeFunctionData(
            'approve',
            [spender, value],
        );
        return rawdata;
    }

    async transferFrom(sender:string, receiver: string, value: number): Promise<any> {
        const rawdata = await this.interface.encodeFunctionData(
            'transferFrom',
            [sender, receiver, value],
        );
        return rawdata;
    }

    async permit(owner: string, spender: string, value: BigNumber, deadline: number, signature: string): Promise<string> {
        const rawdata = await this.interface.encodeFunctionData(
            'permit',
            [owner, spender, value, deadline, signature],
        );
        return rawdata;
    }

    async permitLodis(orderId:number, owner: string, spender: string, value: BigNumber, deadline: number, signature: string): Promise<string> {
        const rawdata = await this.interface.encodeFunctionData(
            'permitLodis',
            [orderId, owner, spender, value, deadline, signature],
        );
        return rawdata;
    }
}