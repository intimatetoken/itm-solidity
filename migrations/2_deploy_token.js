var SafeMath = artifacts.require("./SafeMath.sol");
var Pausable = artifacts.require("./Pausable.sol");
var Ownable = artifacts.require("./Ownable.sol");
var Destructible = artifacts.require("./Destructible.sol");
var Console = artifacts.require("./Console.sol");

var Sale = artifacts.require("./Sale.sol");
var Token = artifacts.require("./Token.sol");

module.exports = function(deployer) {

  deployer.deploy([SafeMath, Pausable, Ownable, Destructible, Console]);

  deployer.link(SafeMath, [Token, Sale])
  deployer.link(Console, [Token, Sale])
  deployer.link(Pausable, Sale)
  deployer.link(Ownable, Sale)
  deployer.link(Destructible, Sale)

  deployer.deploy(Token).then(() => {
    deployer.link(Token, Sale)
    return deployer.deploy(Sale, Token.address)
  })

  // deployer.then(() => Token.new())
  //         .then(instance => {
  //           deployer.link(instance, Sale)
  //           Sale.new(instance.address)
  //         })
};
