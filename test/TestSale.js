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

    console.log('now', (await token.getNow.call()).valueOf())
    let time = web3.increaseTime(10563057, (timeAdjustment) => {
      console.log('time adjusted is ' + timeAdjustment)
    })
    await sale.noop()

    console.log('buyer before', (await token.balanceOf(buyer)).valueOf())
    console.log('sale before', (await token.balanceOf(sale.address)).valueOf())
    console.log('owner before', (await token.balanceOf(owner)).valueOf())

    let txn = await sale.withdraw({ from: buyer })

    console.log('buyer after', (await token.balanceOf(buyer)).valueOf())
    console.log('sale after', (await token.balanceOf(sale.address)).valueOf())
    console.log('owner after', (await token.balanceOf(owner)).valueOf())

    console.log('token address', token.address)
    console.log('now at end of sale', (await token.getNow.call()).valueOf())

  })

})
