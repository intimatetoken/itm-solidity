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

pragma solidity ^0.4.21;

import "../auth/Authorized.sol";

contract TokenLedger is AuthorizedList, Authorized {

    mapping(address => uint256) public balances;
    uint256 public totalsupply;

    struct SeenAddressRecord {
        bool seen;
        uint256 accountArrayIndex;
    }

    // Iterable accounts
    address[] internal accounts;
    mapping(address => SeenAddressRecord) internal seenBefore;

    /// @dev Keeping track of addresses in an array is useful as mappings are not iterable
    /// @return Number of addresses holding this token
    function numberAccounts() public view ifAuthorized(msg.sender, APHRODITE) returns (uint256) {
        return accounts.length;
    }

    /// @dev Keeping track of addresses in an array is useful as mappings are not iterable
    function returnAccounts() public view ifAuthorized(msg.sender, APHRODITE) returns (address[] holders) {
        return accounts;
    }

    function balanceOf(uint256 _id) public view ifAuthorized(msg.sender, CUPID) returns (uint256 balance) {
        require (_id < accounts.length);
        return balances[accounts[_id]];
    }
}
