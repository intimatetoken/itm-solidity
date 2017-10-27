var Token = artifacts.require("./Token.sol");

contract('Token', function(accounts) {

  it('should put 100M ITM in the first account', async function() {
    let instance = await Token.deployed()
    let balance = await instance.balanceOf.call(accounts[0]);

    assert.equal(balance.valueOf(), 100000000, "100000000 wasn't in the first account");
  });

  // @todo put ERC-20 tests here

});
