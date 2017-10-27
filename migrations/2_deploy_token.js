var SafeMath = artifacts.require("./SafeMath.sol");
var Pausable = artifacts.require("./Pausable.sol");
var Ownable = artifacts.require("./Ownable.sol");
var Destructible = artifacts.require("./Destructible.sol");

var Sale = artifacts.require("./Sale.sol");
var Token = artifacts.require("./Token.sol");

module.exports = async function(deployer) {

  deployer.deploy([SafeMath, Pausable, Ownable, Destructible]);

  deployer.link(SafeMath, [Token, Sale]);
  deployer.link(Pausable, Sale);
  deployer.link(Ownable, Sale);
  deployer.link(Destructible, Sale);
  deployer.link(Token, Sale);

  deployer.then(() => Token.new())
          .then(instance => Sale.new(instance.address))
};
