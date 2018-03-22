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

pragma solidity ^0.4.18;

import '../auth/Authorized.sol';
import './TokenSettings.sol';
import './AllowancesLedger.sol';
import './TokenLedger.sol';

/// Collect all the state variables for the token's functions into a single contract

contract BasicTokenStorage is AuthorizedList, Authorized, TokenSettings, AllowancesLedger, TokenLedger {


  /// @dev Ensure that authorization is set

  function BasicTokenStorage() public Authorized() TokenSettings() AllowancesLedger() TokenLedger() { }

  /// @dev Keep track of addresses seen before, push new ones into accounts list
  /// @param _tokenholder address to check for "newness"

  function trackAddresses(address _tokenholder) internal {

    if (!seenBefore[_tokenholder]) {
        seenBefore[_tokenholder] = true;
        accounts.push(_tokenholder);
    }

  }


}
