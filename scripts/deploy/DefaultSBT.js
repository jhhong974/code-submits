const { ethers } = require("hardhat")
require('dotenv').config();

async function deploy_DefaultSBT(signer) {
    console.log(`DefaultSBT Contract Deploy 진행 ....`);
    const DefaultSBT = await ethers.getContractFactory("DefaultSBT");
    const defaultSBT = await DefaultSBT.connect(signer).deploy();
    console.log("DefaultSBT contract: " + defaultSBT.address);

    return defaultSBT.address;

}

module.exports = {deploy_DefaultSBT}
