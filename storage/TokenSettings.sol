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

contract TokenSettings is AuthorizedList, Authorized {

  /// These strings are set temporarily for testing to avoid people grabbing name
  /// Change to "intimate" and "itm" for mainnet deployment
  string public name = 'Aphrodite';
  string public symbol = 'Cupid';

  uint256 public INITIAL_SUPPLY = 100000000  * 10**18;  // 100 million of subdivisible tokens
  uint8 public decimals = 18;


  /// @dev Change token name
  /// @param _name string

  function setName(string _name) public ifAuthorized(msg.sender, APHRODITE) {

     name = _name;

  }

  /// @dev Change token symbol
  /// @param _symbol string

  function setSymbol(string _symbol) public ifAuthorized(msg.sender, APHRODITE) {

     symbol = _symbol;

  }

  /// Not clear if we really need this, maybe should make decimals a constant
  /// @dev Change token decimal digits
  /// @param _decimals uint8

  function setDecimals(uint8 _decimals) public ifAuthorized(msg.sender, APHRODITE) {

     decimals = _decimals;

  }

}
