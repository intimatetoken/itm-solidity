var Token = artifacts.require("./StandardToken.sol")
var Sale = artifacts.require("./IntimateShoppe.sol")
let networks = require('../truffle').networks

module.exports = async function(deployer, network, accounts) {
  await deployer.deploy(Token)

  await deployer.deploy(
    Sale,
    0, // uint256 _timeFromNow, 
    1209600, // uint256 _duration, 
    1, // uint256 _rate, 
    accounts[0], // address _wallet_address, 
    Token.address, // address _token_address, 
    10, // uint256 _cap,
    1, // uint8 _round
  )
};
