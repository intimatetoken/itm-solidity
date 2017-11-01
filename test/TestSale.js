const helpers = require('./helpers')

const chai = require('chai')
chai.use(require('chai-bignumber')())
chai.should()

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

    balance = await helpers.getBalance(owner)

    let obj = await helpers.init(owner)
    token = obj.token
    sale = obj.sale
    helper = obj.helper
  });

  it('A user sends 10 ETH to the contract address and is recieved by the owner', async function () {
    // Arrange.
    let beforeBalance = await helpers.getBalance(owner)

    // Act.
    let deposit = await sale.sendTransaction({
      value: web3.toWei(10, "ether"),
      from: buyer
    })

    // Assert.
    let afterBalance = await helpers.getBalance(owner)
    let diff = afterBalance.sub(beforeBalance)
    diff.should.be.bignumber.equal(web3.toWei(10, "ether"))
  })

  it('the user is assigned 6000 ITM', async function () {
    let assigned = await sale.assignedFor.call(buyer)

    assigned.should.be.bignumber.equal(6000)
  })

  it('when enough time passes, can then withdraw it (to themselves)', async function () {
    // Arrange.
    await helpers.setTime('2018-03-01 14:00:00+11')

    // Act.
    let txn = await sale.withdraw({ from: buyer })

    let buyerBalance = await token.balanceOf.call(buyer)
    let saleBalance = await token.balanceOf.call(sale.address)

    // Assert.
    buyerBalance.should.be.bignumber.equal(6000)
    saleBalance.should.be.bignumber.equal(40000000 - 6000)
  })

})
