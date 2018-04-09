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

import "../math/SafeMath.sol";
import "../auth/Authorized.sol";
import "./RecoverCurrency.sol";
import "./StandardToken.sol";

contract Aphrodite is AuthorizedList, Authorized, RecoverCurrency, StandardToken {

    event DonationAccepted(address indexed _from, uint256 _value);

    /// @dev Constructor that gives msg.sender/creator all of existing tokens.
    function Aphrodite() Authorized()  public {
    
        /// We need to initialize totalsupply and creator's balance
        totalsupply = INITIAL_SUPPLY;
        balances[msg.sender] = INITIAL_SUPPLY;

        /// Record that the creator is a holder of this token
        trackAddresses(msg.sender);
    }

    /// @dev If one prefers to not accept Ether, comment out the next iine out or put revert(); inside
    function () public payable { emit DonationAccepted(msg.sender, msg.value); }

}