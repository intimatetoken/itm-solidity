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

const sha3 = require('solidity-sha3').default;

module.exports = {
    APHRODITE: sha3('Goddess of Love!'),
    CUPID: sha3('Aphrodite\'s Little Helper.'),
    BULKTRANSFER: sha3('Bulk Transfer User.'),

    assertRevert: function (error) {
        if (error.message.search('revert') == -1) {
            assert.fail('Call expected to revert; error was ' + error);
        }
    },

    increaseTime: addSeconds => web3.currentProvider.send({ jsonrpc: "2.0", method: "evm_increaseTime", params: [addSeconds], id: 0 }),

    vestingFunds: '0xDeededBabeCafe',

    mine: () => web3.currentProvider.send({ jsonrpc: "2.0", method: "evm_mine", params: [], id: 0 }),

    netid: () => web3.currentProvider.send({ jsonrpc: "2.0", method: "net_version", params: [], id: 67 }),

    network: {
        "1": 0x1,    // mainnet address
        "3": 0x2,    // ropsten
        "4": 0x3,    // rinkeby
        "42": 0x4    // kovan
    },

    getAddressFromNetwork: (table) => {
        const id = netid()['result'];
        if (parseInt(id) > 42) {
            // Testrpc
            return 0x5;
        }
        return table[id];
    },

    sleep: (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};