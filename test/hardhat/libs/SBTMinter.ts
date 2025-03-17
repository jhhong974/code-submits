import { ethers, providers, Signer } from 'ethers';
import SBTMinter from "../../../artifacts/contracts/SBTMinter.sol/SBTMinter.json"
import { UpgradeLibs } from './Upgrade';

export type SBTInfo = {
    tier: string | number | bigint;
    requirement: string | number | bigint;
    uri: string;
}

export class SBTMinterLib extends UpgradeLibs {
    private provider: providers.JsonRpcProvider;
    private contract: ethers.Contract;
    public SBTMinterCA: string;

    constructor(
        SBTMinterCA: string,
        provider: providers.JsonRpcProvider,
    ) {
        super(SBTMinterCA, SBTMinter.abi, provider);
        this.provider = provider;
        this.SBTMinterCA = SBTMinterCA;
        this.contract = new ethers.Contract(SBTMinterCA, SBTMinter.abi, this.provider);
    }

    async owner(): Promise<string> {
        return await this.contract.owner();
    }

    async getShipperRules(): Promise<SBTInfo[]> {
        const res = await this.contract.getShipperRules();
        return res.map((res: SBTInfo) => { return { tier: res.tier, requirement: res.requirement, uri: res.uri } });
    }

    async getShipperRuleByTier(tier: number | string): Promise<SBTInfo> {
        const res:SBTInfo = await this.contract.getShipperRuleByTier(tier);
        return { tier: res.tier, requirement: res.requirement, uri: res.uri };
    }

    async getCarrierRules(): Promise<SBTInfo[]> {
        const res = await this.contract.getCarrierRules();
        return res.map((res: SBTInfo) => { return { tier: res.tier, requirement: res.requirement, uri: res.uri } });
    }

    async getCarrierRuleByTier(tier: number | string): Promise<SBTInfo> {
        const res:SBTInfo = await this.contract.getCarrierRuleByTier(tier);
        return { tier: res.tier, requirement: res.requirement, uri: res.uri };
    }

    async upgradeShipperRules(rule: SBTInfo, signer: Signer): Promise<string> {
        const _rule = Object.values(rule);
        const txInfo = await this.contract.connect(signer).upgradeShipperRules(_rule)
        const receipt = await txInfo.wait();
        return receipt;
    }

    async upgradeCarrierRules(rule: SBTInfo, signer: Signer): Promise<string> {
        const _rule = Object.values(rule);
        const txInfo = await this.contract.connect(signer).upgradeCarrierRules(_rule)
        return await txInfo.wait();
    }

    async upgradeBulkShipperRules(rules: SBTInfo[], signer: Signer): Promise<any> {
        const _rules = Object.values(rules).map((data) => Object.values(data))
        const txInfo = await this.contract.connect(signer).upgradeBulkShipperRules(_rules)
        return  await txInfo.wait();
    }

    async upgradeBulkCarrierRules(rules: SBTInfo[], signer: Signer): Promise<any> {
        const _rules = Object.values(rules).map((data) => Object.values(data))
        const txInfo = await this.contract.connect(signer).upgradeBulkCarrierRules(rules)
        console.log(txInfo);
        
        return await txInfo.wait();
    }
}