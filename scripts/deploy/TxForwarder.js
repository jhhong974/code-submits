const { ethers } = require("hardhat")
require('dotenv').config();

async function deploy_TxForwarder(signer) {
    console.log(`TxForwarder Contract Deploy 진행 ....`);
    const _txForwarder = await ethers.getContractFactory('TxForwarder');
    const txForwarder = await _txForwarder.connect(signer).deploy()
    await txForwarder.deployed()
    console.log(`txForwarder Address : ${txForwarder.address}`);

    return txForwarder.address;

}

module.exports = {deploy_TxForwarder}
