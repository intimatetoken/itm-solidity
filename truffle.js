require('babel-register')
require('eth-gas-reporter')
module.exports = {
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  },
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*", // Match any network id
      gasPrice: 1e8
    },
    ropsten: {
      host: "wall",
      port: 8547,
      network_id: "3", // Match ropsten
      gas: 4000000,
      gasPrice: 1e8
    },
    rinkeby: {
      host: "wall",
      port: 8546,
      network_id: "4", // Match rinkeby
      gas: 4710000,
      gasPrice: 1e8
    },
    mainnet: {
      host: "wall",
      port: 8545,
      network_id: "1", // Match mainnet
      gas: 7000000,
      gasPrice: 1e9
    }
  },
  mocha: {
    //reporter: 'eth-gas-reporter'
  }
};
