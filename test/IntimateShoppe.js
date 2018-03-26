/*
 * Created by: alexo (Big Deeper Advisors, Inc)
 * For: Input Strategic Partners (ISP) and Intimate.io
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
 * TITLE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE COPYRIGHT HOLDERS OR ANYONE DISTRIBUTING THE
 * SOFTWARE BE LIABLE FOR ANY DAMAGES OR OTHER LIABILITY, WHETHER IN CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

'use strict';

const Aphrodite = artifacts.require('../contracts/Intimate.io/token/Aphrodite.sol');
const IntimateShoppe = artifacts.require('../contracts/Intimate.io/sales/IntimateShoppe.sol');

//const abi = require('ethereumjs-abi');
//const fs = require('fs');

const sha3 = require('solidity-sha3').default;

const APHRODITE = sha3('Goddess of Love!');
const CUPID = sha3('Aphrodite\'s Little Helper.');

const assertRevert = function(error) {
  if (error.message.search('revert') == -1) {
    assert.fail('Call expected to revert; error was ' + error);
  }
}


const increaseTime = addSeconds => web3.currentProvider.send({ jsonrpc: "2.0", method: "evm_increaseTime", params: [addSeconds], id: 0 })

var vestingFunds = '0xDeededBabeCafe'


const mine = () => web3.currentProvider.send({ jsonrpc: "2.0", method: "evm_mine", params: [], id: 0 })

const netid = () => web3.currentProvider.send({ jsonrpc: "2.0", method: "net_version", params: [], id: 67 })

var network = Object()
// List of addresses
network["1"] = 0x1    // mainnet address
network["3"] = 0x2    // ropsten
network["4"] = 0x3    // rinkeby
network["42"] = 0x4   // kovan

function getAddressFromNetwork(table) {

    var id = netid()['result']

   if (parseInt(id) > 42)
      // Testrpc
      return 0x5
   return table[id]

}


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


contract('IntimateShoppe', accounts => {

    const aphrodite = accounts[0];
    const cupid = accounts[1];
    const human = accounts[2];
    const centaur = accounts[3];


    it ('can get Ether balance for accounts', async () => {

       console.log(web3.eth.getBalance(aphrodite).toNumber());
       console.log(web3.eth.getBalance(cupid).toNumber());

    });

    it ('can set permissions', async () => {

       var token = await Aphrodite.new();
       var shoppe = await IntimateShoppe.new(1, 6000000, 600, aphrodite, token.address, '5e25', 0);

       await shoppe.toggleAuthorization(human, CUPID);
       assert.equal(await shoppe.isAuthorized(human, CUPID), true);

    });


    it ('can buy tokens from the shoppe', async () => {

       var token = await Aphrodite.new();

       /// Start sale immediately
       /// Sale lasts 2 minutes
       /// The exchange rate is 600 tokens per Ether
       /// Use Centaur;s address as the beneficiary wallet
       /// The address of the token thus contract is selling
       /// Token cap is 50% of totalSupply

       var shoppe = await IntimateShoppe.new(1, 6000000, 600, aphrodite, token.address, '5e25', 0);
       console.log("IntimateShoppe's address = " + shoppe.address);


        // We are approving the token shoppe to spend some tokens in the wallet
       // which happens to be aphrodite at the moment
       await token.approve(shoppe.address, '5e25');

       console.log("Aphrodite's token balance = " + await token.balanceOf(aphrodite));
       console.log("allowance given to Shoppe contract = " + await token.allowance(aphrodite, shoppe.address));
       assert.equal((await token.allowance(aphrodite, shoppe.address)).toNumber(), '5e25');

       var aphroditeBalance = (await web3.eth.getBalance(aphrodite)).toNumber();
       console.log("wallet balance before = " + aphroditeBalance);

       const tx = await web3.eth.sendTransaction({gas: 500000, from: human, to: shoppe.address, 
                    value: web3.toWei(3, 'ether')});
       assert.notEqual(tx, 0x0);
       console.log("Human's ether balance after purchase = " + web3.eth.getBalance(human).toNumber());

       var tokensBought = await token.balanceOf(human);
       console.log("Human bought ITM tokens = " + tokensBought);
       assert.equal(tokensBought.toNumber(), 600*(web3.toWei(3, 'ether')));

       const tx1 = await web3.eth.sendTransaction({gas: 500000, from: centaur, to: shoppe.address, 
                    value: web3.toWei(0.25, 'ether')});
       const tx2 = await web3.eth.sendTransaction({gas: 500000, from: centaur, to: shoppe.address, 
                    value: web3.toWei(0.5, 'ether')});
       assert.notEqual(tx1, 0x0);
       assert.notEqual(tx2, 0x0);

       console.log("Centaur's ether balance after purchase = " + web3.eth.getBalance(centaur).toNumber());

       tokensBought = await token.balanceOf(centaur);
       console.log("Centaur bought ITM tokens = " + tokensBought);
       assert.equal(tokensBought.toNumber(), 600*(web3.toWei(0.75, 'ether')));

       console.log("Accounts list = " + await token.returnAccounts());

       console.log("Contract's ether balance after purchase = " + web3.eth.getBalance(shoppe.address).toNumber());
       assert.equal(web3.eth.getBalance(shoppe.address).toNumber(), web3.toWei(0.75, 'ether'));

       console.log(await shoppe.getContributionsForAddress(centaur));

       /// Make sure that totals for Ether received and tokens sold are correct
       assert.equal((await shoppe.weiRaised()).toNumber(), web3.toWei(3.75, 'ether'));
       assert.equal((await shoppe.tokensSold()).toNumber(), 600*web3.toWei(3.75, 'ether'));

    });

    it ('cannot buy tokens from the shoppe before the sale started', async () => {

       var token = await Aphrodite.new();

       var shoppe = await IntimateShoppe.new(3000000, 6000000, 600, aphrodite, token.address, '5e25', 0);
       console.log("IntimateShoppe's address = " + shoppe.address);

       await token.approve(shoppe.address, '5e25');

       console.log("Aphrodite's token balance = " + await token.balanceOf(aphrodite));
       console.log("allowance given to Shoppe contract = " + await token.allowance(aphrodite, shoppe.address));
       assert.equal((await token.allowance(aphrodite, shoppe.address)).toNumber(), '5e25');

       var aphroditeBalance = (await web3.eth.getBalance(aphrodite)).toNumber();
       console.log("wallet balance before = " + aphroditeBalance);

       try {
           const tx = await web3.eth.sendTransaction({gas: 500000, from: human, to: shoppe.address,
                    value: web3.toWei(3, 'ether')});
           assert.notEqual(tx, 0x0);
           assert.fail();
       } catch (error) {
           assertRevert(error);
       }
       console.log("Human's ether balance after purchase = " + web3.eth.getBalance(human).toNumber());


    });

    it ('cannot buy tokens from the shoppe after sale ended', async () => {

       var token = await Aphrodite.new();

       var shoppe = await IntimateShoppe.new(1, 6000000, 600, aphrodite, token.address, '5e25', 0);
       console.log("IntimateShoppe's address = " + shoppe.address);

       await token.approve(shoppe.address, '5e25');

       console.log("Aphrodite's token balance = " + await token.balanceOf(aphrodite));
       console.log("allowance given to Shoppe contract = " + await token.allowance(aphrodite, shoppe.address));
       assert.equal((await token.allowance(aphrodite, shoppe.address)).toNumber(), '5e25');

       var aphroditeBalance = (await web3.eth.getBalance(aphrodite)).toNumber();
       console.log("wallet balance before = " + aphroditeBalance);

       increaseTime(8000000);
       try {
           const tx = await web3.eth.sendTransaction({gas: 500000, from: human, to: shoppe.address,
                    value: web3.toWei(3, 'ether')});
           assert.notEqual(tx, 0x0);
           assert.fail();
       } catch (error) {
           assertRevert(error);
       }
       console.log("Human's ether balance after purchase = " + web3.eth.getBalance(human).toNumber());


    });
 
    it ('can set maximum value for purchase before sale starts', async () => {

       var token = await Aphrodite.new();

       var shoppe = await IntimateShoppe.new(300000, 600000, 600, aphrodite, token.address, '5e25', 0);
       console.log("IntimateShoppe's address = " + shoppe.address);


       await shoppe.setMaxValue(web3.toWei(42, 'ether'));
       assert.equal((await shoppe.maxValue()).toNumber(), '42000000000000000000');

    });

    it ('cannot change maximum value while the sale is ongong', async () => {

       var token = await Aphrodite.new();

       var shoppe = await IntimateShoppe.new(1, 6000000, 600, aphrodite, token.address, '5e25', 0);
       console.log("IntimateShoppe's address = " + shoppe.address);

       increaseTime(300000);

       try {
           await shoppe.setMaxValue(web3.toWei(42, 'ether'));
           assert.equal((await shoppe.maxValue()).toNumber(), '42000000000000000000');
           assert.fail();
      } catch (error) {
          assertRevert(error);
      }

    });

    it ('can set minimum value for purchase before sale starts', async () => {

       var token = await Aphrodite.new();

       var shoppe = await IntimateShoppe.new(300000, 600000, 600, aphrodite, token.address, '5e25', 0);
       console.log("IntimateShoppe's address = " + shoppe.address);


       await shoppe.setMinValue(web3.toWei(0.25, 'ether'));
       assert.equal((await shoppe.minValue()).toNumber(), '250000000000000000');

    });

    it ('cannot change minimum value if the sale is ongong', async () => {

       var token = await Aphrodite.new();

       var shoppe = await IntimateShoppe.new(1, 6000000, 600, aphrodite, token.address, '5e25', 0);
       console.log("IntimateShoppe's address = " + shoppe.address);

       increaseTime(300000);

       try {
           await shoppe.setMinValue(web3.toWei(0.25, 'ether'));
           assert.equal((await shoppe.minValue()).toNumber(), '250000000000000000');
           assert.fail();
       } catch (error) {
           assertRevert(error);
       }

    });

    it ('can set the maximum token cap before sale starts', async () => {

       var token = await Aphrodite.new();

       var shoppe = await IntimateShoppe.new(300000, 600000, 600, aphrodite, token.address, '40000000000000000000000000', 0);
       console.log("IntimateShoppe's address = " + shoppe.address);

       await shoppe.setCap(web3.toWei(40000000, 'ether'));
       assert.equal((await shoppe.capTokens()).toNumber(), '40000000000000000000000000');

    });

    it ('cannot change the maximum token cap during sale', async () => {

       var token = await Aphrodite.new();

       var shoppe = await IntimateShoppe.new(1, 6000000, 600, aphrodite, token.address, '40000000000000000000000000', 0);
       console.log("IntimateShoppe's address = " + shoppe.address);

       increaseTime(300000);

       try {
           await shoppe.setCap(web3.toWei(40000000, 'ether'));
           assert.equal((await shoppe.capTokens()).toNumber(), '40000000000000000000000000');
      } catch (error) {
           assertRevert(error);
      }

    });

    it ('can set the high water mark to shift ether to a wallet', async () => {

       var token = await Aphrodite.new();

       var shoppe = await IntimateShoppe.new(1, 6000000, 600, aphrodite, token.address, '5e25', 0);
       console.log("IntimateShoppe's address = " + shoppe.address);

       await shoppe.setHighWater(web3.toWei(12, 'ether'));
       assert.equal((await shoppe.getHighWater()).toNumber(), 12*1e18);

    });

    it ('cannot change the beginning and end of the sale once sale started and has not ended', async () => {

       var token = await Aphrodite.new();

       var shoppe = await IntimateShoppe.new(1, 6000000, 600, aphrodite, token.address, '40000000000000000000000000', 0);
       console.log("IntimateShoppe's address = " + shoppe.address);

       increaseTime(300000);

       try {
           await shoppe.setTimes(10000, 8000000);
           assert.fail();
      } catch (error) {
           assertRevert(error);
      }

    });

    it ('can change the beginning and end if there is no active sale going on' , async () => {

       var token = await Aphrodite.new();

       var shoppe = await IntimateShoppe.new(1, 6000000, 600, aphrodite, token.address, '5e25', 0);
       console.log("IntimateShoppe's address = " + shoppe.address);

       increaseTime(8000000);

       const tx = await shoppe.setTimes(10000, 5000000);
       assert.notEqual(tx, 0x0);

    });

});

