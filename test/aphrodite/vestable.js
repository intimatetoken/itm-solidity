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
const TokenVesting = artifacts.require('zeppelin-solidity/contracts/token/ERC20/TokenVesting.sol');

const BigNumber = web3.BigNumber;
const { BULKTRANSFER, increaseTime, assertRevert, increaseTimeTo, duration, latestTime, log } = require('../globals');

contract('Aphrodite', accounts => {

    const aphrodite = accounts[0];
    const cupid = accounts[1];
    const human = accounts[2];
    const centaur = accounts[3];
    const human2 = accounts[4];
    const human3 = accounts[5];
    const human4 = accounts[6];

    describe('vestable', () => {

        it('should linearly release tokens during vesting period', async function () {
            const start = latestTime() + duration.minutes(1);
            const cliff = duration.years(1);
            const vestingDuration = duration.years(2);;
            const amount = new BigNumber(1000);

            const token = await Aphrodite.new();
            const vesting = await TokenVesting.new(human, start, cliff, vestingDuration, true, { from: aphrodite });
            await token.transfer(vesting.address, amount, { from: aphrodite});

            const vestingPeriod = vestingDuration - cliff;
            const checkpoints = 4;
        
            for (let i = 1; i <= checkpoints; i++) {
              const now = start + cliff + i * (vestingPeriod / checkpoints);
              await increaseTimeTo(now);
        
              await vesting.release(token.address);
              const balance = await token.balanceOf(human);
              const expectedVesting = amount.mul(now - start).div(vestingDuration).floor();
        
              assert.equal(balance.toNumber(), expectedVesting.toNumber());
            }
          });
    });
});