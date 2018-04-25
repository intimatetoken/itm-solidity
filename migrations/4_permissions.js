var Token = artifacts.require("./Aphrodite.sol")
var Sale = artifacts.require("./IntimateShoppe.sol")
let networks = require('../truffle').networks
const sha3 = require('solidity-sha3').default

const APHRODITE = sha3('Goddess of Love!')

module.exports = async function(deployer, network, accounts) {
  let token = await Token.deployed()
  await token.approve(Sale.address, '594730524e18');
  await token.toggleAuthorization(Sale.address, APHRODITE)
};
