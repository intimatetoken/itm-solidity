var Token = artifacts.require("./Aphrodite.sol")
var Sale = artifacts.require("./IntimateShoppe.sol")
let networks = require('../truffle').networks
const sha3 = require('solidity-sha3').default

const APHRODITE = sha3('Goddess of Love!')

module.exports = async function(deployer, network, accounts) {
  await deployer.deploy(Token)

  await deployer.deploy(
    Sale,
    1524733200, // uint256 _startTime, 04/26/2018 @ 9:00am
    3628800, // uint256 _duration, 6 weeks
    600, // uint256 _rate, 600 per ETH
    accounts[0], // address _wallet_address, 
    Token.address, // address _token_address, 
    '594730524e18', // uint256 _cap, 600M - 5,269,476 sold in presale
    0, // uint8 _round
  )

  let token = await Token.deployed()
  await token.approve(Sale.address, '5e25');
  await token.toggleAuthorization(Sale.address, APHRODITE)
};
