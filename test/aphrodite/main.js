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

const { BULKTRANSFER, increaseTime, assertRevert, log } = require('../globals');

contract('Aphrodite', accounts => {

    const aphrodite = accounts[0];
    const cupid = accounts[1];
    const human = accounts[2];
    const centaur = accounts[3];
    const human2 = accounts[4];

    describe('main', () => {
        it('can get Ether balance for accounts', async () => {
            log(web3.eth.getBalance(aphrodite).toNumber());
            log(web3.eth.getBalance(cupid).toNumber());
        });

        it('owner is listed in seen accounts', async () => {
            const token = await Aphrodite.new();
            const accounts = await token.returnAccounts();
            assert.equal(accounts.length, 1);
            assert.equal(accounts[0], aphrodite);
        });

        it('seen accounts are cleaned', async () => {
            const token = await Aphrodite.new();
            await token.transfer(human, 1000, { from: aphrodite });
            await token.transfer(centaur, 1000, { from: aphrodite });
            await token.transfer(cupid, 1000, { from: aphrodite });
            const accounts = await token.returnAccounts();
            assert.equal(accounts.length, 4);
            assert.equal(accounts[0], aphrodite);
            assert.equal(accounts[1], human);
            assert.equal(accounts[2], centaur);
            assert.equal(accounts[3], cupid);

            await token.transfer(human, 1000, { from: cupid });
            await token.transfer(human, 1000, { from: centaur });
            const accounts2 = await token.returnAccounts();
            assert.equal(accounts2.length, 2);
            assert.equal(accounts2[0], aphrodite);
            assert.equal(accounts2[1], human);
        });

        it('cannot transfer more tokens than balance', async () => {
            const token = await Aphrodite.new();

            log("token address = " + token.address);
            log("Aphrodiate's balance = ", (await token.balanceOf(aphrodite)).toNumber());

            try {
                const tx = await token.transfer(cupid, '1e30');
                const bal = (await token.balanceOf(cupid)).toNumber();
                log("Cupid's balance = " + bal);
                assert.fail();
            } catch (error) {
                assertRevert(error);
            }
        });

        it('can bulk transfer', async () => {
            const token = await Aphrodite.new();

            let bal = (await token.balanceOf(aphrodite)).toNumber();

            assert.equal(bal, '1e26');

            const addresses = [cupid, human, centaur];
            const amounts = [1000, 1000000, 1000000000];

            bal = bal - 1000000000 - 1000000 - 1000;

            await token.bulkTransfer(addresses, amounts);

            log("Account list = " + await token.returnAccounts());

            assert.equal(await token.balanceOf(aphrodite), bal);
            assert.equal(await token.balanceOf(cupid), 1000);
            assert.equal(await token.balanceOf(human), 1000000);
            assert.equal(await token.balanceOf(centaur), 1000000000);

        });

        it('cannot bulk transfer with mismatched arrays', async () => {
            const token = await Aphrodite.new();

            const addresses = [cupid, human, centaur];
            const amounts = [1000, 1000000];

            try {
                await token.bulkTransfer(addresses, amounts);
                assert.fail();
            } catch (error) {
                assertRevert(error);
            }
        });

        it('cannot bulk transfer to self', async () => {
            const token = await Aphrodite.new();

            const addresses = [cupid, aphrodite, centaur];
            const amounts = [1000, 1000, 1000];

            try {
                await token.bulkTransfer(addresses, amounts);
                assert.fail();
            } catch (error) {
                assertRevert(error);
            }
        });

        it('bulk transfer reverts on 0x0', async () => {
            const token = await Aphrodite.new();

            const addresses = [cupid, 0x0, centaur];
            const amounts = [1000, 1000000, 1000000000];

            try {
                await token.bulkTransfer(addresses, amounts);
                assert.fail();
            } catch (error) {
                assertRevert(error);
            }
        });

        it('bulk transfer reverts on insufficient funds', async () => {
            const token = await Aphrodite.new();
            const aphroditeBalance = (await token.balanceOf(aphrodite)).toNumber();

            const addresses = [cupid, human, centaur];
            const amounts = [aphroditeBalance / 2, aphroditeBalance / 2, aphroditeBalance / 2];

            try {
                await token.bulkTransfer(addresses, amounts);
                assert.fail();
            } catch (error) {
                assertRevert(error);
            }
        });

        it('With permission a regular user can bulk transfer', async () => {
            const token = await Aphrodite.new();

            let bal = (await token.balanceOf(aphrodite)).toNumber();

            assert.equal(bal, '1e26');

            const addresses = [];
            const amounts = [];

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
            log("Human2 bulkTransfer authorization is " + await token.isAuthorized(human2, BULKTRANSFER));
            assert.equal(await token.isAuthorized(human2, BULKTRANSFER), true);
            await token.bulkTransfer(addresses, amounts, { from: human2 });

            log("Account list = " + await token.returnAccounts());
            assert.equal((await token.returnAccounts()).length, 4);

            assert.equal(await token.balanceOf(aphrodite), 0);
            assert.equal(await token.balanceOf(cupid), 1000);
            assert.equal(await token.balanceOf(human), 1000000);
            assert.equal(await token.balanceOf(centaur), 1000000000);

        });

        it('can replace name/symbol && retrieve their values', async () => {
            const token = await Aphrodite.new();

            const name = await token.setName('Venus');
            const symbol = await token.setSymbol('Eros');

            assert.equal(await token.name(), 'Venus');
            assert.equal(await token.symbol(), 'Eros');

        });

        it('can retrieve totalSupply and balanceOf', async () => {
            const token = await Aphrodite.new();

            const total = (await token.totalSupply()).toNumber();
            const bal = (await token.balanceOf(aphrodite)).toNumber();

            assert.equal(0, 0);
            assert.equal(total, '1e26');
            assert.equal(bal, '1e26');

        });

        it('can recover lost Ether', async () => {
            const token = await Aphrodite.new();
            const tx = await web3.eth.sendTransaction({ from: aphrodite, to: token.address, value: web3.toWei(1, 'ether') });
            assert.notEqual(tx, 0x0);

            log(web3.eth.getBalance(token.address).toNumber());
            assert.equal(web3.eth.getBalance(token.address), web3.toWei(1, 'ether'));

            const result = await token.recoverEther();
            assert.equal(result.logs.length, 1);
            assert.equal(result.logs[0].event, 'EtherRecovered');

            log(web3.eth.getBalance(token.address).toNumber());
            assert.equal(web3.eth.getBalance(token.address), web3.toWei(0, 'ether'));

        });

        it('can recover lost Tokens', async () => {
            const token = await Aphrodite.new();
            const lostToken = await Aphrodite.new();

            await lostToken.transfer(token.address, '42000000000');

            const bal = (await lostToken.balanceOf(token.address)).toNumber();
            log("Token's balance = " + bal);

            log((await lostToken.balanceOf(aphrodite)).toString());

            await token.recoverToken(lostToken.address, { from: aphrodite });

            log((await lostToken.balanceOf(aphrodite)).toNumber());
            assert.equal((await lostToken.balanceOf(aphrodite)).toNumber(), '1e26');
            assert.equal((await lostToken.balanceOf(token.address)).toNumber(), '0');

        });
    });
});