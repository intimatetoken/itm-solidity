var Sale = artifacts.require("./Sale.sol");
var Token = artifacts.require("./Token.sol");

contract('Sale', function(accounts) {

  it('should transfer 40M from the token to the sale', async function() {
    let token = await Token.deployed()
    let sale = await Sale.deployed()

    console.log(token.address)
    let transfer = await token.transfer.call(sale.address, 40000000, { from: token.address });

    // let balance = await token.balanceOf.call(token.address);
    let accountBalance = await token.balanceOf.call(accounts[0]);
    let saleBalance = await token.balanceOf.call(sale.address);
    let tokenBalance = await token.balanceOf.call(token.address);
    console.log({
      accountBalance: accountBalance.valueOf(),
      saleBalance: saleBalance.valueOf(),
      tokenBalance: tokenBalance.valueOf()
    })
  });

  // @todo put ERC-20 tests here

});
