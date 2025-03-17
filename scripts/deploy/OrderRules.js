const { ethers } = require("ethers");
const { deployLogic, deployProxy } = require("./initialize");
const logic = require('../../artifacts/contracts/OrderRules.sol/OrderRules.json')
const proxy = require('../../artifacts/@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol/ERC1967Proxy.json')

async function deploy_OrderRules(signer) {
    console.log(`OrderRules Contract Deploy 진행 ....`);
    const logicCA = await deployLogic(signer,logic.abi,logic.bytecode);

    const LogicFactory = new ethers.ContractFactory(logic.abi,logic.bytecode,signer);
    let data = LogicFactory.interface.encodeFunctionData("initialize",[]);
    const proxyCA = await deployProxy(signer,proxy.abi,proxy.bytecode,logicCA,data)
    
    console.log(`OrderRules Proxy Contract : ${proxyCA}`);
    return proxyCA;
}


module.exports = {deploy_OrderRules}