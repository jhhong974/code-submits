import {BigNumber, ethers,providers,Signer} from 'ethers';
import Treasury from "../../../artifacts/contracts/Treasury.sol/Treasury.json"
import {UpgradeLibs} from "./Upgrade";


export class TreasuryLib extends UpgradeLibs {
    private provider: providers.JsonRpcProvider;
    private contract: ethers.Contract;
    public TreasuryCA: string;

    constructor(
        TreasuryCA: string,
        provider: providers.JsonRpcProvider,
    ) {
        super(TreasuryCA,Treasury.abi,provider);
        this.provider = provider;
        this.TreasuryCA = TreasuryCA;
        this.contract = new ethers.Contract(TreasuryCA, Treasury.abi, this.provider);
    }

    async owner() : Promise<string> {
        return await this.contract.owner();
    }

    async getTotalAmount() : Promise<BigNumber> {
        return await this.contract.getTotalAmount();
    }

    async withdraw(to:string,amount:string|BigNumber,signer:Signer) : Promise<string> {
        const txInfo = await this.contract.connect(signer).withdraw(to,amount);
        const receipt = await txInfo.wait();
        return receipt;
    }
}