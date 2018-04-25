var Token = artifacts.require("./Aphrodite.sol")
var Sale = artifacts.require("./IntimateShoppe.sol")
let networks = require('../truffle').networks
const sha3 = require('solidity-sha3').default

const APHRODITE = sha3('Goddess of Love!')

module.exports = async function(deployer, network, accounts) {
  await deployer.deploy(Token)
};
