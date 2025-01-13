require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  paths: {
    artifacts: './src/artifacts', // Corrected typo here
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
  },
};
