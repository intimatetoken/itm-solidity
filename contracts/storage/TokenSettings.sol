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

contract TokenSettings is AuthorizedList, Authorized {

    /// These strings should be set temporarily for testing on Rinkeby/Ropsten/Kovan to somethin else
    /// to avoid people squatting on names
    /// Change back to "intimate" and "ITM" for mainnet deployment

    string public name = "intimate";
    string public symbol = "ITM";

    uint256 public INITIAL_SUPPLY = 100000000 * 10**18;  // 100 million of subdivisible tokens
    uint8 public constant decimals = 18;


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
}
