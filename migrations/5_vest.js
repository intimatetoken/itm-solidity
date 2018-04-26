var Token = artifacts.require("./Aphrodite.sol")
var Sale = artifacts.require("./IntimateShoppe.sol")
var Vesting = artifacts.require('./TokenVesting.sol')

let networks = require('../truffle').networks
const sha3 = require('solidity-sha3').default

const APHRODITE = sha3('Goddess of Love!')

module.exports = async function(deployer, network, accounts) {
  // let token = await Token.deployed()
  // await token.approve(Sale.address, '594730524e18');
  // await token.toggleAuthorization(Sale.address, APHRODITE)

  await deployer.deploy(
    Vesting,
    '0xE2e4370573C0D7a5b99772D90BD0A89c7d476e60', // address _beneficiary, 0xE2e4370573C0D7a5b99772D90BD0A89c7d476e60
    1532595600, // uint256 _start, 07/26/2018 @ 9:00am
    0, // uint256 _cliff, 0 (vesting starts straight away)
    31536000, // uint256 _duration, 1 year
    true, // bool _revocable, 
  )

  // await token.transfer(Vesting.address, '750000e18')
};
