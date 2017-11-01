var SafeMath = artifacts.require("./SafeMath.sol")
var Pausable = artifacts.require("./Pausable.sol")
var Ownable = artifacts.require("./Ownable.sol")
var Destructible = artifacts.require("./Destructible.sol")

var TestHelper = artifacts.require("./TestHelper.sol")

var Sale = artifacts.require("./Sale.sol")
var Token = artifacts.require("./Token.sol")

module.exports = function(deployer, network) {

  deployer.deploy([SafeMath, Pausable, Ownable, Destructible])

  deployer.link(SafeMath, [Token, Sale])
  deployer.link(Pausable, Sale)
  deployer.link(Ownable, Sale)
  deployer.link(Destructible, Sale)

  deployer.deploy(Token).then(() => {
    deployer.link(Token, Sale)
    return deployer.deploy(Sale, Token.address)
  })

  if (network != 'live') {
    deployer.deploy(TestHelper)
  }
};
