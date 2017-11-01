const Sale = artifacts.require("./Sale.sol")
const Token = artifacts.require("./Token.sol")
const TestHelper = artifacts.require("./TestHelper.sol")

const bluebird = require('bluebird')
const moment = require('moment')

let helper

exports.init = async function (owner) {
  let token = await Token.deployed()
  let sale = await Sale.deployed()

  helper = await TestHelper.deployed()

  let transfer = await token.transfer(sale.address, 40000000, { from: owner });

  return {
    token,
    sale,
    transfer,
    helper
  }
}

exports.setTime = async function (_dateTime) {
  let dateTime = moment.isMoment(_dateTime) ? _dateTime : moment(_dateTime)
  let currentTime = moment.unix(await helper.getNow.call())

  let diff = (dateTime - currentTime) / 1000

  if ( diff < 0 ) throw new Error('Impossible to go back in time with the chain')

  web3.increaseTime(diff)
  await helper.noop() // force mine a block to set the time
}

exports.getBalance = async function (addr) {
  return bluebird.promisify(web3.eth.getBalance)(addr)
}

// web3._extend({
//   property: 'evm',
//   methods: [
//     new web3._extend.Method({
//       name: 'increaseTime',
//       call: 'evm_increaseTime',
//       params: 1,
//       outputFormatter: web3._extend.formatters.outputBigNumberFormatter
//     })
//   ]
// })

web3.increaseTime = function (seconds, callback = () => {}) {
  web3.currentProvider.sendAsync({
    jsonrpc: "2.0",
    method: "evm_increaseTime",
    params: [seconds],
    id: new Date().getTime()
  }, callback)
}

// web3.evm.mine = function(callback) {
//   web3.currentProvider.sendAsync(
//       {
//           jsonrpc: "2.0",
//           method: "evm_mine",
//           params: [],
//           id: new Date().getTime()
//       },
//       (error, result) => {
//           console.log(error, result);
//           callback(error, error ? undefined : result.result);
//       });
// };
