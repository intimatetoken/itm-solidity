var Token = artifacts.require("./Token.sol");
var Sale = artifacts.require("./Sale.sol");
var TestHelper = artifacts.require("./TestHelper.sol");

contract('Token', function(accounts) {

  it('should put 100M ITM in the first account', async function() {
    let token = await Token.deployed()
    let sale = await Sale.deployed()
    let helper = await TestHelper.deployed()

    // console.log('token address', token.address)
    // console.log('now', (await helper.getNow.call()).valueOf())

    let balance = await token.balanceOf.call(accounts[0]);

    // console.log('owner balance', (await token.balanceOf.call(accounts[0])).valueOf())
    // console.log('buyer balance', (await token.balanceOf.call(accounts[1])).valueOf())
    // console.log('token balance', (await token.balanceOf.call(token.address)).valueOf())
    // console.log('sale balance', (await token.balanceOf.call(sale.address)).valueOf())

    // assert.equal(balance.valueOf(), 100000000, "100000000 wasn't in the first account");
    balance.should.be.bignumber.equal(100000000)
  });

  // @todo put ERC-20 tests here

});
