const { ethers } = require("hardhat")
require('dotenv').config();

async function deploy_Order(orderid,OrderRulesCA,TxForwarderCA,signer) {
    console.log(`Order Contract Deploy 진행 ....`);
    const Order = await ethers.getContractFactory("Order");
    const order = await Order.connect(signer).deploy(orderid,OrderRulesCA, TxForwarderCA);
    await order.deployed();
    console.log("Order contract: " + order.address);

    return order.address;

}

module.exports = {deploy_Order}
