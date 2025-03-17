import {BigNumber, ethers,providers,Signer} from 'ethers';
import OrderRules from "../../../artifacts/contracts/OrderRules.sol/OrderRules.json"
import {UpgradeLibs} from "./Upgrade";


export class OrderRulesLib extends UpgradeLibs {
    private provider: providers.JsonRpcProvider;
    private contract: ethers.Contract;
    public OrderRulesCA: string;

    constructor(
        OrderRulesCA: string,
        provider: providers.JsonRpcProvider,
    ) {
        super(OrderRulesCA,OrderRules.abi,provider);
        this.provider = provider;
        this.OrderRulesCA = OrderRulesCA;
        this.contract = new ethers.Contract(OrderRulesCA, OrderRules.abi, this.provider);
    }

    async owner() : Promise<string> {
        return await this.contract.owner();
    }

    async getPlatformFee() : Promise<BigNumber> {
        return await this.contract.getPlatformFee();
    }

    async getShipperFee() : Promise<BigNumber> {
        return await this.contract.getShipperFee();
    }
    
    async getCarrierFee() : Promise<BigNumber> {
        return await this.contract.getCarrierFee();
    }
    
    async getTimeExpiredDelayedPick() : Promise<BigNumber> {
        return await this.contract.getTimeExpiredDelayedPick();
    }
    
    async getTimeExpiredDeliveryFault() : Promise<BigNumber> {
        return await this.contract.getTimeExpiredDeliveryFault();
    }
    
    async getTimeExpiredWaitMatching() : Promise<BigNumber> {
        return await this.contract.getTimeExpiredWaitMatching();
    }
    
    async getDKATokenAddress() : Promise<string> {
        return await this.contract.getDKATokenAddress();
    }
    
    async getSBTMinterAddress() : Promise<string> {
        return await this.contract.getSBTMinterAddress();
    }
    
    async getTreasuryAddress() : Promise<string> {
        return await this.contract.getTreasuryAddress();
    }
    
    async getShipperSBTAddress() : Promise<string> {
        return await this.contract.getShipperSBTAddress();
    }
    
    async getCarrierSBTAddress() : Promise<string> {
        return await this.contract.getCarrierSBTAddress();
    }
    
    async getDefaultSBTAddress() : Promise<string> {
        return await this.contract.getDefaultSBTAddress();
    }
    
    async setPlatformFee(platformFee:string|BigNumber|number,signer:Signer) : Promise<string> {
        const txInfo = await this.contract.connect(signer).setPlatformFee(platformFee)
        const receipt = await txInfo.wait();
        return receipt;
    }
    
    async setShipperFee(shipperFee:string|BigNumber|number,signer:Signer) : Promise<string> {
        const txInfo = await this.contract.connect(signer).setShipperFee(shipperFee)
        const receipt = await txInfo.wait();
        return receipt;
    }

    async setCarrierFee(carrierFee:string|BigNumber|number,signer:Signer) : Promise<string> {
        const txInfo = await this.contract.connect(signer).setCarrierFee(carrierFee)
        const receipt = await txInfo.wait();
        return receipt;
    }

    async setCollateralPercent(collateralPercent:string|BigNumber|number,signer:Signer) : Promise<string> {
        const txInfo = await this.contract.connect(signer).setCollateralPercent(collateralPercent)
        const receipt = await txInfo.wait();
        return receipt;
    }

    async setMinReward(minReward:string|BigNumber|number,signer:Signer) : Promise<string> {
        const txInfo = await this.contract.connect(signer).setMinReward(minReward)
        const receipt = await txInfo.wait();
        return receipt;
    }

    async setTimeExpiredDelayedPick(timeExpiredDelayedPick:string|BigNumber|number,signer:Signer) : Promise<string> {
        const txInfo = await this.contract.connect(signer).setTimeExpiredDelayedPick(timeExpiredDelayedPick)
        const receipt = await txInfo.wait();
        return receipt;
    }
    
    async setTimeExpiredDeliveryFault(timeExpiredDeliveryFault:string|BigNumber|number,signer:Signer) : Promise<string> {
        const txInfo = await this.contract.connect(signer).setTimeExpiredDeliveryFault(timeExpiredDeliveryFault)
        const receipt = await txInfo.wait();
        return receipt;
    }
    
    async setTimeExpiredWaitMatching(timeExpiredWaitMatching:string|BigNumber|number,signer:Signer) : Promise<string> {
        const txInfo = await this.contract.connect(signer).setTimeExpiredWaitMatching(timeExpiredWaitMatching)
        const receipt = await txInfo.wait();
        return receipt;
    }
    
    async setTimeExpiredSpecificMatchingFailDate(timeExpiredSpecificMatchingFailDate:string|BigNumber|number,signer:Signer) : Promise<string> {
        const txInfo = await this.contract.connect(signer).setTimeExpiredSpecificMatchingFailDate(timeExpiredSpecificMatchingFailDate)
        const receipt = await txInfo.wait();
        return receipt;
    }
    
    async setTimeExpiredSpecificDeliveryFailDate(timeExpiredSpecificDeliveryFailDate:string|BigNumber|number,signer:Signer) : Promise<string> {
        const txInfo = await this.contract.connect(signer).setTimeExpiredSpecificDeliveryFailDate(timeExpiredSpecificDeliveryFailDate)
        const receipt = await txInfo.wait();
        return receipt;
    }
    
    async setDKATokenAddress(DKAToken:string,signer:Signer) : Promise<string> {
        const txInfo = await this.contract.connect(signer).setDKATokenAddress(DKAToken)
        const receipt = await txInfo.wait();
        return receipt;
    }
    
    async setSBTMinterAddress(SBTMinter:string,signer:Signer) : Promise<string> {
        const txInfo = await this.contract.connect(signer).setSBTMinterAddress(SBTMinter)
        const receipt = await txInfo.wait();
        return receipt;
    }
    
    async setTreasuryAddress(Treasury:string,signer:Signer) : Promise<string> {
        const txInfo = await this.contract.connect(signer).setTreasuryAddress(Treasury)
        const receipt = await txInfo.wait();
        return receipt;
    }
    
    async setShipperSBTAddress(ShipperSBT:string,signer:Signer) : Promise<string> {
        const txInfo = await this.contract.connect(signer).setShipperSBTAddress(ShipperSBT)
        const receipt = await txInfo.wait();
        return receipt;
    }
    
    async setCarrierSBTAddress(CarrierSBT:string,signer:Signer) : Promise<string> {
        const txInfo = await this.contract.connect(signer).setCarrierSBTAddress(CarrierSBT)
        const receipt = await txInfo.wait();
        return receipt;
    }
    
    async setDefaultSBTAddress(DefaultSBT:string,signer:Signer) : Promise<string> {
        const txInfo = await this.contract.connect(signer).setDefaultSBTAddress(DefaultSBT)
        const receipt = await txInfo.wait();
        return receipt;
    }
    
    async setOrderAddress(Order:string,signer:Signer) : Promise<string> {
        const txInfo = await this.contract.connect(signer).setOrderAddress(Order)
        const receipt = await txInfo.wait();
        return receipt;
    }
    
    
}