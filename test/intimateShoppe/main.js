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

const { CUPID, increaseTime, assertRevert, log } = require('../globals');

contract('IntimateShoppe', accounts => {

    const aphrodite = accounts[0];
    const cupid = accounts[1];
    const human = accounts[2];
    const centaur = accounts[3];


    it ('can get Ether balance for accounts', async () => {

       log(web3.eth.getBalance(aphrodite).toNumber());
       log(web3.eth.getBalance(cupid).toNumber());

    });

    it ('can set permissions', async () => {

       const token = await Aphrodite.new();
       const shoppe = await IntimateShoppe.new(1, 6000000, 600, aphrodite, token.address, '5e25', 0);

       await shoppe.toggleAuthorization(human, CUPID);
       assert.equal(await shoppe.isAuthorized(human, CUPID), true);

    });


    it ('can buy tokens from the shoppe', async () => {

       const token = await Aphrodite.new();

       /// Start sale immediately
       /// Sale lasts 6000000 seconds
       /// The exchange rate is 600 tokens per Ether
       /// Use Aphrodite's address as the beneficiary wallet
       /// The address of the token this contract is selling
       /// Token cap is 50% of totalSupply

       const shoppe = await IntimateShoppe.new(1, 6000000, 600, aphrodite, token.address, '5e25', 0);
       log("IntimateShoppe's address = " + shoppe.address);


       /// We are approving the token shoppe to spend some tokens in the wallet
       /// which happens to be aphrodite at the moment
       await token.approve(shoppe.address, '5e25');

       log("Aphrodite's token balance = " + await token.balanceOf(aphrodite));
       log("allowance given to Shoppe contract = " + await token.allowance(aphrodite, shoppe.address));
       assert.equal((await token.allowance(aphrodite, shoppe.address)).toNumber(), '5e25');

       const aphroditeBalance = (await web3.eth.getBalance(aphrodite)).toNumber();
       log("wallet balance before = " + aphroditeBalance);

       const tx = await web3.eth.sendTransaction({gas: 500000, from: human, to: shoppe.address, 
                    value: web3.toWei(3, 'ether')});
       assert.notEqual(tx, 0x0);
       log("Human's ether balance after purchase = " + web3.eth.getBalance(human).toNumber());

       let tokensBought = await token.balanceOf(human);
       log("Human bought ITM tokens = " + tokensBought);
       assert.equal(tokensBought.toNumber(), 600*(web3.toWei(3, 'ether')));

       const tx1 = await web3.eth.sendTransaction({gas: 500000, from: centaur, to: shoppe.address, 
                    value: web3.toWei(0.25, 'ether')});
       const tx2 = await web3.eth.sendTransaction({gas: 500000, from: centaur, to: shoppe.address, 
                    value: web3.toWei(0.5, 'ether')});
       assert.notEqual(tx1, 0x0);
       assert.notEqual(tx2, 0x0);

       log("Centaur's ether balance after purchase = " + web3.eth.getBalance(centaur).toNumber());

       tokensBought = await token.balanceOf(centaur);
       log("Centaur bought ITM tokens = " + tokensBought);
       assert.equal(tokensBought.toNumber(), 600*(web3.toWei(0.75, 'ether')));

       log("Accounts list = " + await token.returnAccounts());

       log("Contract's ether balance after purchase = " + web3.eth.getBalance(shoppe.address).toNumber());
       assert.equal(web3.eth.getBalance(shoppe.address).toNumber(), web3.toWei(0.75, 'ether'));

       log(await shoppe.getContributionsForAddress(centaur));

       /// Make sure that totals for Ether received and tokens sold are correct
       assert.equal((await shoppe.weiRaised()).toNumber(), web3.toWei(3.75, 'ether'));
       assert.equal((await shoppe.tokensSold()).toNumber(), 600*web3.toWei(3.75, 'ether'));

    });

    it ('cannot buy tokens from the shoppe before the sale started', async () => {

       const token = await Aphrodite.new();

       const shoppe = await IntimateShoppe.new(3000000, 6000000, 600, aphrodite, token.address, '5e25', 0);
       log("IntimateShoppe's address = " + shoppe.address);

       await token.approve(shoppe.address, '5e25');

       log("Aphrodite's token balance = " + await token.balanceOf(aphrodite));
       log("allowance given to Shoppe contract = " + await token.allowance(aphrodite, shoppe.address));
       assert.equal((await token.allowance(aphrodite, shoppe.address)).toNumber(), '5e25');

       const aphroditeBalance = (await web3.eth.getBalance(aphrodite)).toNumber();
       log("wallet balance before = " + aphroditeBalance);

       try {
           const tx = await web3.eth.sendTransaction({gas: 500000, from: human, to: shoppe.address,
                    value: web3.toWei(3, 'ether')});
           assert.notEqual(tx, 0x0);
           assert.fail();
       } catch (error) {
           assertRevert(error);
       }
       log("Human's ether balance after purchase = " + web3.eth.getBalance(human).toNumber());


    });

    it ('cannot buy tokens from the shoppe after sale ended', async () => {

       const token = await Aphrodite.new();

       const shoppe = await IntimateShoppe.new(1, 6000000, 600, aphrodite, token.address, '5e25', 0);
       log("IntimateShoppe's address = " + shoppe.address);

       await token.approve(shoppe.address, '5e25');

       log("Aphrodite's token balance = " + await token.balanceOf(aphrodite));
       log("allowance given to Shoppe contract = " + await token.allowance(aphrodite, shoppe.address));
       assert.equal((await token.allowance(aphrodite, shoppe.address)).toNumber(), '5e25');

       const aphroditeBalance = (await web3.eth.getBalance(aphrodite)).toNumber();
       log("wallet balance before = " + aphroditeBalance);

       increaseTime(8000000);
       try {
           const tx = await web3.eth.sendTransaction({gas: 500000, from: human, to: shoppe.address,
                    value: web3.toWei(3, 'ether')});
           assert.notEqual(tx, 0x0);
           assert.fail();
       } catch (error) {
           assertRevert(error);
       }
       log("Human's ether balance after purchase = " + web3.eth.getBalance(human).toNumber());


    });
 
    it ('can set maximum value for purchase before sale starts', async () => {

       const token = await Aphrodite.new();

       const shoppe = await IntimateShoppe.new(300000, 600000, 600, aphrodite, token.address, '5e25', 0);
       log("IntimateShoppe's address = " + shoppe.address);


       await shoppe.setMaxValue(web3.toWei(42, 'ether'));
       assert.equal((await shoppe.maxValue()).toNumber(), '42000000000000000000');

    });

    it ('cannot change maximum value while the sale is ongong', async () => {

       const token = await Aphrodite.new();

       const shoppe = await IntimateShoppe.new(1, 6000000, 600, aphrodite, token.address, '5e25', 0);
       log("IntimateShoppe's address = " + shoppe.address);

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

       const token = await Aphrodite.new();

       const shoppe = await IntimateShoppe.new(300000, 600000, 600, aphrodite, token.address, '5e25', 0);
       log("IntimateShoppe's address = " + shoppe.address);


       await shoppe.setMinValue(web3.toWei(0.25, 'ether'));
       assert.equal((await shoppe.minValue()).toNumber(), '250000000000000000');

    });

    it ('cannot change minimum value if the sale is ongong', async () => {

       const token = await Aphrodite.new();

       const shoppe = await IntimateShoppe.new(1, 6000000, 600, aphrodite, token.address, '5e25', 0);
       log("IntimateShoppe's address = " + shoppe.address);

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

       const token = await Aphrodite.new();

       const shoppe = await IntimateShoppe.new(300000, 600000, 600, aphrodite, token.address, '40000000000000000000000000', 0);
       log("IntimateShoppe's address = " + shoppe.address);

       await shoppe.setCap(web3.toWei(40000000, 'ether'));
       assert.equal((await shoppe.capTokens()).toNumber(), '40000000000000000000000000');

    });

    it ('cannot change the maximum token cap during sale', async () => {

       const token = await Aphrodite.new();

       const shoppe = await IntimateShoppe.new(1, 6000000, 600, aphrodite, token.address, '40000000000000000000000000', 0);
       log("IntimateShoppe's address = " + shoppe.address);

       increaseTime(300000);

       try {
           await shoppe.setCap(web3.toWei(40000000, 'ether'));
           assert.equal((await shoppe.capTokens()).toNumber(), '40000000000000000000000000');
      } catch (error) {
           assertRevert(error);
      }

    });

    it ('can set the high water mark to shift ether to a wallet', async () => {

       const token = await Aphrodite.new();

       const shoppe = await IntimateShoppe.new(1, 6000000, 600, aphrodite, token.address, '5e25', 0);
       log("IntimateShoppe's address = " + shoppe.address);

       await shoppe.setHighWater(web3.toWei(12, 'ether'));
       assert.equal((await shoppe.getHighWater()).toNumber(), 12*1e18);

    });

    it ('cannot change the beginning and end of the sale once sale started and has not ended', async () => {

       const token = await Aphrodite.new();

       const shoppe = await IntimateShoppe.new(1, 6000000, 600, aphrodite, token.address, '40000000000000000000000000', 0);
       log("IntimateShoppe's address = " + shoppe.address);

       increaseTime(300000);

       try {
           await shoppe.setTimes(10000, 8000000);
           assert.fail();
      } catch (error) {
           assertRevert(error);
      }

    });

    it ('can change the beginning and end if there is no active sale going on' , async () => {

       const token = await Aphrodite.new();

       const shoppe = await IntimateShoppe.new(1, 6000000, 600, aphrodite, token.address, '5e25', 0);
       log("IntimateShoppe's address = " + shoppe.address);

       increaseTime(8000000);

       const tx = await shoppe.setTimes(10000, 5000000);
       assert.notEqual(tx, 0x0);

    });

});

