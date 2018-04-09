require('dotenv').config()
require('babel-register')
require('eth-gas-reporter')

const ganache = require("ganache-cli")
const HDWalletProvider = require("truffle-hdwallet-provider")

let mnemonic = process.env.MNEMONIC
let infuraAccessToken = process.env.INFURA_ACCESS_TOKEN

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
    ropsten:  {
      network_id: 3,
      gas: 4600000,
      provider() {
        return new HDWalletProvider(mnemonic, `https://ropsten.infura.io/${infuraAccessToken}`)
      },
    },
    kovan: {
      network_id: 42,
      gas: 4712388,
      gasPrice: 25000000000,
      provider() {
        return new HDWalletProvider(mnemonic, `https://kovan.infura.io/${infuraAccessToken}`)
      },
    },
    rinkeby: {
      host: "wall",
      port: 8546,
      network_id: "4", // Match rinkeby
      gas: 4710000,
      gasPrice: 1e8
    },
    test: {
      network_id: "*",
      provider: ganache.provider(),
      test: true,
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
