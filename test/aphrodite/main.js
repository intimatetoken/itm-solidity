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
            const vest = (await token.totalVestingSupply()).toNumber();

            assert.equal(bal + vest, '1e26');

            const addresses = [];
            const amounts = [];

            addresses.push(cupid);
            amounts.push(1000);
            addresses.push(human);
            amounts.push(1000000);
            addresses.push(centaur);
            amounts.push(1000000000);

            bal = bal - 1000000000 - 1000000 - 1000;

            await token.bulkTransfer(addresses, amounts);

            log("Account list = " + await token.returnAccounts());

            assert.equal(await token.balanceOf(aphrodite), bal);
            assert.equal(await token.balanceOf(cupid), 1000);
            assert.equal(await token.balanceOf(human), 1000000);
            assert.equal(await token.balanceOf(centaur), 1000000000);

        });

        it('With permission a regular user can bulk transfer', async () => {

            const token = await Aphrodite.new();

            let bal = (await token.balanceOf(aphrodite)).toNumber();
            const vest = (await token.totalVestingSupply()).toNumber();

            assert.equal(bal + vest, '1e26');

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
            log("Vesting supply = " + (await token.totalVestingSupply()).toNumber());
            const vest = (await token.totalVestingSupply()).toNumber();

            assert.equal(0, 0);
            assert.equal(total, '1e26');
            assert.equal(bal + vest, '1e26');

        });

        it('can recover lost Ether', async () => {

            const token = await Aphrodite.new();
            const tx = await web3.eth.sendTransaction({ from: aphrodite, to: token.address, value: web3.toWei(1, 'ether') });
            assert.notEqual(tx, 0x0);

            log(web3.eth.getBalance(token.address).toNumber());
            assert.equal(web3.eth.getBalance(token.address), web3.toWei(1, 'ether'));

            await token.recoverEther();

            log(web3.eth.getBalance(token.address).toNumber());
            assert.equal(web3.eth.getBalance(token.address), web3.toWei(0, 'ether'));

        });

        it('can recover lost Tokens', async () => {

            const token = await Aphrodite.new();
            const lostToken = await Aphrodite.new();
            const vest = (await token.totalVestingSupply()).toNumber();

            await lostToken.transfer(token.address, '42000000000');

            const bal = (await lostToken.balanceOf(token.address)).toNumber();
            log("Token's balance = " + bal);

            log((await lostToken.balanceOf(aphrodite)).toString());

            await token.recoverToken(lostToken.address, { from: aphrodite });

            log((await lostToken.balanceOf(aphrodite)).toNumber());
            assert.equal((await lostToken.balanceOf(aphrodite)).toNumber() + vest, '1e26');
            assert.equal((await lostToken.balanceOf(token.address)).toNumber(), '0');

        });

        it('can vest over time && spend vested tokens', async () => {

            const token = await Aphrodite.new();
            log(await token.returnVestingAddresses());
            const beneficiaries = await token.returnVestingAddresses();

            const addr = await token.vestingFundsAddress();
            log("Vesting Funds address = " + addr);

            for (let i = 0; i < beneficiaries.length; i++) {
                //log("Loop = " + beneficiaries[i]);
                log("Loop = " + await token.returnVestingRecord(beneficiaries[i]));
            }
            await token.vest();
            for (let i = 0; i < beneficiaries.length; i++) {
                log("Loop = " + await token.allowance(addr, beneficiaries[i]));
            }
            // About 1.5 years
            increaseTime(47304000 - 48 * 3600);
            await token.vest();

            for (let i = 0; i < beneficiaries.length; i++) {
                log("Loop = " + await token.allowance(addr, beneficiaries[i]));
            }
            for (let j = 0; j < 24; j++) {
                // One(1) month
                increaseTime(5270400 / 2);
                await token.vest();
                for (let i = 0; i < beneficiaries.length; i++) {
                    log("Current allowance = " + await token.allowance(addr, beneficiaries[i]));
                }
            }
            log("Total funds for vesting = " + await token.balanceOf(addr));
            for (let i = 0; i < beneficiaries.length; i++) {
                const allowed = await token.allowance(addr, beneficiaries[i]);
                await token.transferFrom(addr, beneficiaries[i], allowed.toNumber(), { from: beneficiaries[i] });
            }
            for (let i = 0; i < beneficiaries.length; i++) {
                log(beneficiaries[i] + "'s balance = " + await token.balanceOf(beneficiaries[i]));
            }
            log("Total funds for vesting post distribution = " + await token.balanceOf(addr));
            assert.equal(await token.balanceOf(addr), 0);

        });

        it('can revoke yet unvested tokens', async () => {

            const token = await Aphrodite.new();
            log("Before revocation = " + await token.returnVestingAddresses());
            const beneficiaries = await token.returnVestingAddresses();

            const addr = await token.vestingFundsAddress();
            await token.revoke(human);
            log("After revocation = " + await token.returnVestingAddresses());
            log("Total funds for vesting after revocation = " + await token.balanceOf(addr));
            assert.equal(beneficiaries.length - 1, (await token.numberVestingRecords()));

        });

        it('can create a new vesting record', async () => {

            const token = await Aphrodite.new();
            log("Before vesting record addition = " + await token.returnVestingAddresses());
            const beneficiaries = await token.returnVestingAddresses();

            const addr = await token.vestingFundsAddress();
            await token.addVestingRecord(centaur, 1.2e22, 0, 365 * 24 * 3600, 2 * 365 * 24 * 3600, 365 * 2 * 3600);
            log("After addition = " + await token.returnVestingAddresses());
            log("Total funds for vesting after addition = " + await token.balanceOf(addr));
            assert.equal(beneficiaries.length + 1, (await token.numberVestingRecords()));
            assert.equal(await token.balanceOf(addr), 7.2e22);

        });
    });
});