require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.4",
  paths: {
    artifacts: "./src/contract/artifacts",
    sources: "./src/contract/contracts",
    cache: "./src/contract/cache",
    tests: "./src/contract/test"
  },
  networks: {
    sepolia: {
      url: "https://sepolia.infura.io/v3/2e5775eb41aa490991bff9eb183e1122",
      accounts: [
        "0a6bbab2d0fb0d7b049ae0d8de395f4cfe9c3783ad302c56f21676fcc34f4fbe",
      ],
    }
  },
};
