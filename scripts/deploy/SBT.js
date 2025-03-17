const { ethers } = require("hardhat")
require('dotenv').config();

async function deploy_SBT(name,symbol,SBTMinterCA,signer) {
    console.log(`SBT Contract Deploy 진행 ....`);
    const SBT = await ethers.getContractFactory("SBT");
    const sbt = await SBT.connect(signer).deploy(name,symbol,SBTMinterCA);
    console.log("SBT contract: " + sbt.address);

    return sbt.address;

}

module.exports = {deploy_SBT}
