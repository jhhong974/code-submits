const { ethers } = require("ethers");
const { deployLogic, deployProxy } = require("./initialize");
const logic = require('../../artifacts/contracts/SBTMinter.sol/SBTMinter.json')
const proxy = require('../../artifacts/@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol/ERC1967Proxy.json')

async function deploy_SBTMinter(OrderRulesCA,signer) {
    console.log(`SBTMinte Contract Deploy 진행 ....`);
    const logicCA = await deployLogic(signer,logic.abi,logic.bytecode);

    const LogicFactory = new ethers.ContractFactory(logic.abi,logic.bytecode,signer);
    let data = LogicFactory.interface.encodeFunctionData("initialize",[OrderRulesCA]);
    const proxyCA = await deployProxy(signer,proxy.abi,proxy.bytecode,logicCA,data)
    
    console.log(`SBTMinter Proxy Contract : ${proxyCA}`);
    return proxyCA;
}


module.exports = {deploy_SBTMinter}
