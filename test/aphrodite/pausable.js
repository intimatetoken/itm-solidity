/*
 * Created by Input Strategic Partners (ISP) and Intimate.io
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
 * TITLE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE COPYRIGHT HOLDERS OR ANYONE DISTRIBUTING THE
 * SOFTWARE BE LIABLE FOR ANY DAMAGES OR OTHER LIABILITY, WHETHER IN CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

'use strict';

const Aphrodite = artifacts.require('../contracts/Intimate.io/token/Aphrodite.sol');

const { BULKTRANSFER, increaseTime, assertRevert, log } = require('../globals');

contract('Aphrodite', accounts => {

    const aphrodite = accounts[0];
    const cupid = accounts[1];
    const human = accounts[2];
    const centaur = accounts[3];
    const human2 = accounts[4];

    describe('pausable', () => {
        it('cannot approve whenPaused', async () => {
            const token = await Aphrodite.new();
            log("token address = " + token.address);
            const paused = await token.pause();

            try {
                const tx = await token.approve(cupid, '42');
                assert.fail();
            } catch (error) {
                assertRevert(error);
            }


        });

        it('can approve && retrive allowance whenNotPaused', async () => {
            const token = await Aphrodite.new();
            log("token address = " + token.address);
            const tx = await token.approve(cupid, '42000000000000000000');
            assert.notEqual(tx, 0x0);

            const allowed = await token.allowance(aphrodite, cupid);

            log("Allowance Aphrodite has given to Cupid = " + allowed.toNumber());

            assert.equal(allowed, 42000000000000000000);

        });

        it('can approve && transferFrom whenNotPaused', async () => {
            const token = await Aphrodite.new();

            log("token address = " + token.address);

            const tx = await token.approve(cupid, '42000000000000000000');
            assert.notEqual(tx, 0x0);

            const allowed = await token.allowance(aphrodite, cupid);

            log("Allowance Aphrodite has given to Cupid = " + allowed.toNumber());

            assert.equal(allowed, 42000000000000000000);

            const tx1 = token.transferFrom(aphrodite, human, 1000, { from: cupid });

            assert.notEqual(tx1, 0x0);
            assert.equal(await token.balanceOf(human), 1000);
            assert.equal((await token.balanceOf(aphrodite)).toNumber(), 1e26 - 1000);

        });

        it('can approve before pause() but not transferFrom whenPaused', async () => {
            const token = await Aphrodite.new();

            log("token address = " + token.address);

            const tx = await token.approve(human, '2000');
            assert.notEqual(tx, 0x0);

            const allowed = await token.allowance(aphrodite, human);

            log("Allowance Aphrodite has given to Human = " + allowed.toNumber());

            assert.equal(allowed, 2000);

            const paused = await token.pause();
            try {
                const tx1 = await token.transferFrom(aphrodite, cupid, '1000', { from: human });
                assert.notEqual(tx1, 0x0);
                assert.fail();
            } catch (error) {
                assertRevert(error);
            }
        });

        it('cannot transfer tokens whenPaused', async () => {
            const token = await Aphrodite.new();
            log("token address = " + token.address);

            log((await token.balanceOf(aphrodite)).toNumber());

            const paused = await token.pause();
            try {
                const tx = await token.transfer(cupid, '42');
                const bal = (await token.balanceOf(cupid)).toNumber();
                log("Cupid's balance = " + bal);
                assert.fail();
            } catch (error) {
                assertRevert(error);
            }
        });

        it('can transfer tokens whenNotPaused', async () => {
            const token = await Aphrodite.new();
            log("token address = " + token.address);
            log((await token.balanceOf(aphrodite)).toNumber());

            await token.transfer(cupid, '42');

            const bal = (await token.balanceOf(cupid)).toNumber();
            log("Cupid's balance = " + bal);

            assert.equal(bal, 42);
        });
    });
});