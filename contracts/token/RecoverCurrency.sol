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

import "./IERC20Basic.sol";
import "../auth/Authorized.sol";

/// @title Authorized account can reclaim ERC20Basic tokens.

contract RecoverCurrency is AuthorizedList, Authorized {

  event Transfer(address indexed _from, address indexed _to, uint256 _value);

  function recoverEther() external ifAuthorized(msg.sender, APHRODITE) {

    if (msg.sender.call.value(this.balance)())
       Transfer(this, msg.sender, this.balance);

  }

  /// @dev Reclaim all ERC20Basic compatible tokens
  /// @param _address The address of the token contract
   
  function recoverToken(address _address) external ifAuthorized(msg.sender, APHRODITE) {

    require(_address != address(0));
    IERC20Basic token = IERC20Basic(_address);
    uint256 balance = token.balanceOf(address(this));
    token.transfer(msg.sender, balance);

  }

}
