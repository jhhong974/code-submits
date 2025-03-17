import { ethers, providers, Signer } from 'ethers';
import DefaultSBT from "../../../artifacts/contracts/SBT/DefaultSBT.sol/DefaultSBT.json"

export class DefaultSBTLib {
    private provider: providers.JsonRpcProvider;
    private contract: ethers.Contract;
    public DefaultSBTCA: string;

    constructor(
        DefaultSBTCA: string,
        provider: providers.JsonRpcProvider,
    ) {
        this.provider = provider;
        this.DefaultSBTCA = DefaultSBTCA;
        this.contract = new ethers.Contract(DefaultSBTCA, DefaultSBT.abi, this.provider);
    }

    async owner(): Promise<string> {
        return await this.contract.owner();
    }

    async balanceOf(owner:string) : Promise<BigInt> {
        return await this.contract.balanceOf(owner);
    }

    async tokenURI(tokenId:number) : Promise<string> {
        return await this.contract.tokenURI(tokenId);
    }

    async safeMint(to : string, uri: string, signer : Signer): Promise<string> {
        const txInfo = await this.contract.connect(signer).safeMint(to,uri)
        const receipt = await txInfo.wait();
        return receipt;
    }
}