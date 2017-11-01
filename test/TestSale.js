const helpers = require('./helpers')

/**
 * A user sends 10 ETH to the contract address, it uses the fallback function,
 * the user is assigned 6000 ITM, and,
 * when enough time passes, can then withdraw it (to themselves)
 */
contract('Sale', async function (accounts) {

  let token, sale, owner, buyer, helper

  before(async function () {
    owner = accounts[0]
    buyer = accounts[1]

    let obj = await helpers.init(owner)
    token = obj.token
    sale = obj.sale
    helper = obj.helper
  });

  it('A user sends 10 ETH to the contract address (with fallback function)', async function () {
    let deposit = await sale.sendTransaction({
      value: web3.toWei(10, "ether"),
      from: buyer
    })
  })

  it('the user is assigned 6000 ITM', async function () {
    let assigned = await sale.assignedFor.call(buyer)

    assert.equal(assigned.valueOf(), 6000)
  })

  it('when enough time passes, can then withdraw it (to themselves)', async function () {
    await helpers.setTime('2018-03-01 14:00:00+11')

    let txn = await sale.withdraw({ from: buyer })
  })

})
