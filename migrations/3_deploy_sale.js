var SafeMath = artifacts.require("./SafeMath.sol");
var Pausable = artifacts.require("./Pausable.sol");
var Ownable = artifacts.require("./Ownable.sol");
var Destructible = artifacts.require("./Destructible.sol");

var Token = artifacts.require("./Token.sol");
var Sale = artifacts.require("./Sale.sol");

module.exports = function(deployer) {
  deployer.deploy(SafeMath);
  deployer.deploy(Pausable);
  deployer.deploy(Ownable);
  deployer.deploy(Destructible);
  deployer.deploy(Token);

  deployer.link(SafeMath, Sale);
  deployer.link(Pausable, Sale);
  deployer.link(Ownable, Sale);
  deployer.link(Destructible, Sale);
  deployer.link(Token, Sale);

  deployer.deploy(Sale);
};
