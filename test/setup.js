var Sale = artifacts.require("./Sale.sol")
var Token = artifacts.require("./Token.sol")
var TestHelper = artifacts.require("./TestHelper.sol")

module.exports = async function (owner) {
  let token = await Token.deployed()
  let sale = await Sale.deployed()
  let helper = await TestHelper.deployed()

  let transfer = await token.transfer(sale.address, 400000, { from: owner });

  return {
    token,
    sale,
    transfer,
    helper
  }
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
