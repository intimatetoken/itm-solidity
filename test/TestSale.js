const setup = require('./setup')

/**
 * A user sends 10 ETH to the contract address, it uses the fallback function,
 * the user is assigned 6000 ITM, and,
 * when enough time passes, can then withdraw it (to themselves)
 */
contract('Sale', async function (accounts) {

  let token, sale, owner, buyer

  before(async function () {
    owner = accounts[0]
    buyer = accounts[1]

    let obj = await setup(owner)
    token = obj.token
    sale = obj.sale
  });

  it('A user sends 10 ETH to the contract address (with fallback function)', async function () {
    let deposit = await sale.sendTransaction({
      value: web3.toWei(10, "ether"),
      from: buyer
    })

    console.log('value', deposit.logs[0].args.value.valueOf())
    console.log('tokens', deposit.logs[0].args.tokens.valueOf())
    console.log('rate', deposit.logs[0].args.rate.valueOf())
  })

  it('the user is assigned 6000 ITM', async function () {
    let assigned = await sale.assignedFor.call(buyer)

    assert.equal(assigned.valueOf(), 6000)
  })

  it('when enough time passes, can then withdraw it (to themselves)', async function () {

    let now = await sale.getNow.call()
    console.log('now', now.valueOf())

    let time = web3.evm.increaseTime(10563057, async function () {

      await sale.noop()

      let afterNow = await sale.getNow.call()
      console.log('after now', afterNow.valueOf())

      let balanceBefore = await token.balanceOf(buyer)
      console.log('b before', balanceBefore.valueOf())

      let txn = await sale.withdraw({ from: buyer })

      let balanceAfter = await token.balanceOf(buyer)
      console.log('b after', balanceAfter.valueOf())
      })
  })

});
