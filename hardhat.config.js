require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  paths:{
    artifacts:'./src/artifacs',
  },
  networks:{
    Hardhat:{
      chainId:1337
    }
  }
};
