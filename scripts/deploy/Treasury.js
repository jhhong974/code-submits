const { ethers } = require("ethers");
const { deployLogic, deployProxy } = require("./initialize");
const logic = require('../../artifacts/contracts/Treasury.sol/Treasury.json')
const proxy = require('../../artifacts/@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol/ERC1967Proxy.json')


async function deploy_Treasury(TokenCA,signer) {
    console.log(`Treasury Contract Deploy 진행 ....`);
    const logicCA = await deployLogic(signer,logic.abi,logic.bytecode);

    const LogicFactory = new ethers.ContractFactory(logic.abi,logic.bytecode,signer);
    let data = LogicFactory.interface.encodeFunctionData("initialize",[TokenCA]);
    const proxyCA = await deployProxy(signer,proxy.abi,proxy.bytecode,logicCA,data)
    
    console.log(`Treasury Proxy Contract : ${proxyCA}`);
    return proxyCA;
}


module.exports = {deploy_Treasury}

