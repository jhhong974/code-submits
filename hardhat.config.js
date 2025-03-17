require("@nomicfoundation/hardhat-toolbox");
require("@openzeppelin/hardhat-upgrades")
require("@nomicfoundation/hardhat-foundry");
// require("solidity-coverage");


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks: {
    development: {
      url: "http://127.0.0.1:8545/",
      initialBaseFeePerGas:0,
      gas:2000000
    },
  },
  solidity: {
    version:"0.8.18",
    settings: {
        optimizer: {
        enabled: true,
      }
    },
  }
};
