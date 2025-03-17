import {ethers,providers,Signer} from 'ethers';
import SBT from "../../../artifacts/contracts/SBT/SBT.sol/SBT.json"


export class SBTLibs {
    private provider: providers.JsonRpcProvider;
    private contract: ethers.Contract;
    public SBTCA: string;

    constructor(
        SBTCA: string,
        provider: providers.JsonRpcProvider,
    ) {
        this.provider = provider;
        this.SBTCA = SBTCA;
        this.contract = new ethers.Contract(SBTCA, SBT.abi, this.provider);
    }

    async balanceOf(owner:string) : Promise<BigInt> {
        return await this.contract.balanceOf(owner);
    }

    async ownerOf(tokenId:string|number) : Promise<string> {
        return await this.contract.ownerOf(tokenId);
    }

    async locked(tokenId:string|number) : Promise<boolean> {
        return await this.contract.locked(tokenId);
    }

    async tokenURI(tokenId:string|number) : Promise<string> {
        return await this.contract.tokenURI(tokenId);
    }

    async tokenByIndex(index:string|number) : Promise<BigInt> {
        return await this.contract.tokenByIndex(index);
    }

    async tokenOfOwnerByIndex(owner:string,index:string|number) : Promise<BigInt> {
        return await this.contract.tokenOfOwnerByIndex(owner,index);
    }

    async name() : Promise<string> {
        return await this.contract.name();
    }

    async symbol() : Promise<string> {
        return await this.contract.symbol();
    }

    async totalSupply() : Promise<BigInt> {
        return await this.contract.totalSupply();
    }
    
}

