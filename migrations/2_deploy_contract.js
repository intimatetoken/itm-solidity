var Token = artifacts.require("./StandardToken.sol")
var Sale = artifacts.require("./IntimateShoppe.sol")
let networks = require('../truffle').networks

module.exports = async function(deployer, network, accounts) {
  await deployer.deploy(Token)

  await deployer.deploy(
    Sale,
    1523372145, // uint256 _startTime, 04/10/2018 @ 2:55pm
    3628800, // uint256 _duration, 6 weeks
    600, // uint256 _rate, 600 per ETH
    accounts[0], // address _wallet_address, 
    Token.address, // address _token_address, 
    '5e25', // uint256 _cap,
    0, // uint8 _round
  )
};
