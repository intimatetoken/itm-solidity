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
const BULKTRANSFER = sha3('Bulk Transfer User.');

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


contract('Aphrodite', accounts => {

    const aphrodite = accounts[0];
    const cupid = accounts[1];
    const human = accounts[2];
    const centaur = accounts[3];
    const human2 = accounts[4];



    it ('can get Ether balance for accounts', async () => {

       console.log(web3.eth.getBalance(aphrodite).toNumber());
       console.log(web3.eth.getBalance(cupid).toNumber());

    });


    it ('cannot approve whenPaused', async () => {

        var token = await Aphrodite.new();

        console.log("token address = " + token.address);

        const paused = await token.pause();

        try {
            const tx = await token.approve(cupid, '42');
            assert.fail();
        } catch (error) {
            assertRevert(error);
        }


    });

    it ('can approve && retrive allowance whenNotPaused', async () => {

        var token = await Aphrodite.new();

        console.log("token address = " + token.address);

        const tx = await token.approve(cupid, '42000000000000000000');
        assert.notEqual(tx, 0x0);

        var allowed = await token.allowance(aphrodite, cupid);

        console.log("Allowance Aphrodite has given to Cupid = " + allowed.toNumber());

        assert.equal(allowed, 42000000000000000000);

    });

    it ('can approve && transferFrom whenNotPaused', async () => {

        var token = await Aphrodite.new();
        const vest = (await token.totalVestingSupply()).toNumber();

        console.log("token address = " + token.address);

        const tx = await token.approve(cupid, '42000000000000000000');
        assert.notEqual(tx, 0x0);

        var allowed = await token.allowance(aphrodite, cupid);

        console.log("Allowance Aphrodite has given to Cupid = " + allowed.toNumber());

        assert.equal(allowed, 42000000000000000000);

        const tx1 = token.transferFrom(aphrodite, human, 1000, {from: cupid});

        assert.notEqual(tx1, 0x0);
        assert.equal(await token.balanceOf(human), 1000);
        assert.equal((await token.balanceOf(aphrodite)).toNumber() + vest, 1e26 - 1000);

    });

    it ('can approve before pause() but not transferFrom whenPaused', async () => {

        var token = await Aphrodite.new();

        console.log("token address = " + token.address);

        const tx = await token.approve(human, '2000');
        assert.notEqual(tx, 0x0);

        var allowed = await token.allowance(aphrodite, human);

        console.log("Allowance Aphrodite has given to Human = " + allowed.toNumber());

        assert.equal(allowed, 2000);

        const paused = await token.pause();
        try {
            const tx1 = await token.transferFrom(aphrodite, cupid, '1000', {from: human});
            assert.notEqual(tx1, 0x0);
            assert.fail();
        } catch (error) {
            assertRevert(error);
        }

    });

    it ('cannot transfer tokens whenPaused', async () => {

        var token = await Aphrodite.new();

        console.log("token address = " + token.address);

        console.log((await token.balanceOf(aphrodite)).toNumber());

        const paused = await token.pause();
        try {
            const tx = await token.transfer(cupid, '42');

            var bal = (await token.balanceOf(cupid)).toNumber();

            console.log("Cupid's balance = " + bal);

            assert.fail();

        } catch (error) {
            assertRevert(error);
        }

    });

    it ('cannot transfer more tokens than balance', async () => {

        var token = await Aphrodite.new();

        console.log("token address = " + token.address);

        console.log("Aphrodiate's balance = ", (await token.balanceOf(aphrodite)).toNumber());

        try {
            const tx = await token.transfer(cupid, '1e30');

            var bal = (await token.balanceOf(cupid)).toNumber();

            console.log("Cupid's balance = " + bal);

            assert.fail();

        } catch (error) {
            assertRevert(error);
        }

    });

    it ('can transfer tokens whenNotPaused', async () => {

        var token = await Aphrodite.new();

        console.log("token address = " + token.address);

        console.log((await token.balanceOf(aphrodite)).toNumber());

        await token.transfer(cupid, '42');

        var bal = (await token.balanceOf(cupid)).toNumber();

        console.log("Cupid's balance = " + bal);

        assert.equal(bal, 42);

    });

    it('can bulk transfer', async () => {

        var token = await Aphrodite.new();

        var bal = (await token.balanceOf(aphrodite)).toNumber();
        const vest = (await token.totalVestingSupply()).toNumber();

        assert.equal(bal + vest, '1e26');

        var addresses = [];
        var amounts = [];

        addresses.push(cupid);
        amounts.push(1000);
        addresses.push(human);
        amounts.push(1000000);
        addresses.push(centaur);
        amounts.push(1000000000);

        bal = bal - 1000000000 - 1000000 - 1000;
 
        await token.bulkTransfer(addresses, amounts);

        console.log("Account list = " + await token.returnAccounts());

        assert.equal(await token.balanceOf(aphrodite), bal);
        assert.equal(await token.balanceOf(cupid), 1000);
        assert.equal(await token.balanceOf(human), 1000000);
        assert.equal(await token.balanceOf(centaur), 1000000000);

    });

    it('With permission a regular user can bulk transfer', async () => {

        var token = await Aphrodite.new();

        var bal = (await token.balanceOf(aphrodite)).toNumber();
        const vest = (await token.totalVestingSupply()).toNumber();

        assert.equal(bal + vest, '1e26');

        var addresses = [];
        var amounts = [];

        addresses.push(cupid);
        amounts.push(1000);
        addresses.push(human);
        amounts.push(1000000);
        addresses.push(centaur);
        amounts.push(1000000000);

        /// Aphrodite transfers all tokens to centaur
        await token.transfer(human2, bal);

        bal = bal - 1000000000 - 1000000 - 1000;

        await token.toggleAuthorization(human2, BULKTRANSFER);
        console.log("Human2 bulkTransfer authorization is " + await token.isAuthorized(human2, BULKTRANSFER));
        assert.equal(await token.isAuthorized(human2, BULKTRANSFER), true);
        await token.bulkTransfer(addresses, amounts, {from: human2});

        console.log("Account list = " + await token.returnAccounts());

        assert.equal(await token.balanceOf(aphrodite), 0);
        assert.equal(await token.balanceOf(cupid), 1000);
        assert.equal(await token.balanceOf(human), 1000000);
        assert.equal(await token.balanceOf(centaur), 1000000000);

    });


    it ('can replace name/symbol && retrieve their values', async () => {

        var token = await Aphrodite.new();

        const name = await token.setName('Venus');
        const symbol = await token.setSymbol('Eros');

        assert.equal(await token.name(), 'Venus');
        assert.equal(await token.symbol(), 'Eros');

    });

    it ('can retrieve totalSupply and balanceOf', async () => {

        var token = await Aphrodite.new();

        const total = (await token.totalSupply()).toNumber();
        const bal = (await token.balanceOf(aphrodite)).toNumber();
        console.log("Vesting supply = " + (await token.totalVestingSupply()).toNumber());
        const vest = (await token.totalVestingSupply()).toNumber();

        assert.equal(0,0);
        assert.equal(total, '1e26');
        assert.equal(bal + vest, '1e26');

    });

    it ('can recover lost Ether', async () => {

        var token = await Aphrodite.new();
        const tx = await web3.eth.sendTransaction({from: aphrodite, to: token.address, value: web3.toWei(1, 'ether')});
        assert.notEqual(tx, 0x0);

       console.log(web3.eth.getBalance(token.address).toNumber());
       assert.equal(web3.eth.getBalance(token.address), web3.toWei(1, 'ether'));

       await token.recoverEther();
        
       console.log(web3.eth.getBalance(token.address).toNumber());
       assert.equal(web3.eth.getBalance(token.address), web3.toWei(0, 'ether'));

    });

    it ('can recover lost Tokens', async () => {

        var token = await Aphrodite.new();
        var lostToken = await Aphrodite.new();
        const vest = (await token.totalVestingSupply()).toNumber();

        await lostToken.transfer(token.address, '42000000000');

        var bal = (await lostToken.balanceOf(token.address)).toNumber();
        console.log("Token's balance = " + bal);

        console.log((await lostToken.balanceOf(aphrodite)).toString());

        await token.recoverToken(lostToken.address, {from: aphrodite});

        console.log((await lostToken.balanceOf(aphrodite)).toNumber());
        assert.equal((await lostToken.balanceOf(aphrodite)).toNumber() + vest, '1e26');
        assert.equal((await lostToken.balanceOf(token.address)).toNumber(), '0');

    });

    it ('can vest over time && spend vested tokens', async () => {

        var token = await Aphrodite.new();
        console.log(await token.returnVestingAddresses());
        var beneficiaries = await token.returnVestingAddresses();

        var addr = await token.vestingFundsAddress();
        console.log("Vesting Funds address = " + addr);

        for (var i = 0; i < beneficiaries.length; i++) {
           //console.log("Loop = " + beneficiaries[i]);
           console.log("Loop = " + await token.returnVestingRecord(beneficiaries[i]));
        }
        await token.vest();
        for (var i = 0; i < beneficiaries.length; i++) {
           console.log("Loop = " + await token.allowance(addr, beneficiaries[i]));
        }
        // About 1.5 years
        increaseTime(47304000-48*3600);
        await token.vest();
        
        for (var i = 0; i < beneficiaries.length; i++) {
           console.log("Loop = " + await token.allowance(addr, beneficiaries[i]));
        }
        for (var j = 0; j < 24; j++) {
                // One(1) month
                increaseTime(5270400/2);
                await token.vest();
                for (var i = 0; i < beneficiaries.length; i++) {
                      console.log("Current allowance = " + await token.allowance(addr, beneficiaries[i]));
                }
        }
        console.log("Total funds for vesting = " + await token.balanceOf(addr));
        for (var i = 0; i < beneficiaries.length; i++) {
           var allowed = await token.allowance(addr, beneficiaries[i]);
           await token.transferFrom(addr, beneficiaries[i], allowed.toNumber(), {from: beneficiaries[i]});
        }
        for (var i = 0; i < beneficiaries.length; i++) {
           console.log(beneficiaries[i] + "'s balance = " + await token.balanceOf(beneficiaries[i]));
        }
        console.log("Total funds for vesting post distribution = " + await token.balanceOf(addr));
        assert.equal(await token.balanceOf(addr), 0);

    });

    it ('can revoke yet unvested tokens', async () => {
        
        var token = await Aphrodite.new();
        console.log("Before revocation = " + await token.returnVestingAddresses());
        var beneficiaries = await token.returnVestingAddresses();

        var addr = await token.vestingFundsAddress();
        await token.revoke(human);
        console.log("After revocation = " + await token.returnVestingAddresses());
        console.log("Total funds for vesting after revocation = " + await token.balanceOf(addr));
        assert.equal(beneficiaries.length - 1, (await token.numberVestingRecords()));

    });

    it ('can create a new vesting record', async () => {

        var token = await Aphrodite.new();
        console.log("Before vesting record addition = " + await token.returnVestingAddresses());
        var beneficiaries = await token.returnVestingAddresses();

        var addr = await token.vestingFundsAddress();
        await token.addVestingRecord(centaur, 1.2e22, 0, 365*24*3600, 2*365*24*3600, 365*2*3600);
        console.log("After addition = " + await token.returnVestingAddresses());
        console.log("Total funds for vesting after addition = " + await token.balanceOf(addr));
        assert.equal(beneficiaries.length + 1, (await token.numberVestingRecords()));
        assert.equal(await token.balanceOf(addr), 7.2e22);

    });

});

