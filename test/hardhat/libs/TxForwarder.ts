import {ethers,providers,Signer} from 'ethers';
import * as format from './typedData';
import TxForwarder from "../../../artifacts/contracts/TxForwarder.sol/TxForwarder.json"

type metaTx = { 
    from:string,
    to:string,
    value:string|number,
    gas:string|number,
    nonce:number,
    data:string
 }

export class TxForwarderLibs {
    private provider: providers.JsonRpcProvider;
    private contract: ethers.Contract;
    public TxForwarderCA: string;
    interface:any;
    constructor(
        TxForwarderCA: string,
        provider: providers.JsonRpcProvider,
    ) {
        this.provider = provider;
        this.interface = ethers.Contract.getInterface(TxForwarder.abi);
        this.TxForwarderCA = TxForwarderCA;
        this.contract = new ethers.Contract(TxForwarderCA, TxForwarder.abi, this.provider);
    }

    async getNonce(address:string) : Promise<BigInt> {
        return await this.contract.getNonce(address);
    }

    async signMetaTx(req:metaTx,signer:ethers.Wallet):Promise<string> {
        const domain = format.forwardRequest_domain(this.provider.network.chainId,this.TxForwarderCA);
        const types = format.forwardRequest_types();
        return signer._signTypedData(domain,types,req);
    }

    async execute(req:metaTx, signature:string,signer:Signer): Promise<string> {
        const txInfo = await this.contract.connect(signer).execute(Object.values(req), signature, {gasLimit: 2000000})
        const receipt = await txInfo.wait();
        const receiptData = JSON.stringify(receipt, null, 4);
        return receiptData;
    }

    async owner() : Promise<string> {
        return await this.contract.owner();
    }

    async transferOwnership(newOwner:string,signer:Signer) : Promise<string> {
        return await this.contract.connect(signer).transferOwnership(newOwner);
    }
}

