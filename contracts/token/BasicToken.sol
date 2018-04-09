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
import "./IERC20Basic.sol";
import "../managed/Pausable.sol";
import "../managed/Freezable.sol";
import "../storage/BasicTokenStorage.sol";


contract BasicToken is IERC20Basic, BasicTokenStorage, Pausable, Freezable {

    using SafeMath for uint256;

    event Transfer(address indexed _tokenholder, address indexed _tokenrecipient, uint256 _value);
    event BulkTransfer(address indexed _tokenholder, uint256 _howmany);

    /// @dev Return the total token supply
    function totalSupply() public view whenNotPaused returns (uint256) {
        return totalsupply;
    }

    /// @dev transfer token for a specified address
    /// @param _to The address to transfer to.
    /// @param _value The amount to be transferred.
    function transfer(address _to, uint256 _value) public whenNotPaused notFrozen returns (bool) {

        /// No transfers to 0x0 address, use burn instead, if implemented
        require(_to != address(0));

        /// No useless operations
        require(msg.sender != _to);

        /// This will revert if not enough funds
        balances[msg.sender] = balances[msg.sender].sub(_value);

        if (balances[msg.sender] == 0) {
            removeSeenAddress(msg.sender);
        }

        /// _to might be a completely new address, so check and store if so
        trackAddresses(_to);

        /// This will revert on overflow
        balances[_to] = balances[_to].add(_value);

        /// Emit the Transfer event
        emit Transfer(msg.sender, _to, _value);

        return true;
    }

    /// @dev bulkTransfer tokens to a list of specified addresses, not an ERC20 function
    /// @param _tos The list of addresses to transfer to.
    /// @param _values The list of amounts to be transferred.
    function bulkTransfer(address[] _tos, uint256[] _values) public whenNotPaused notFrozen ifAuthorized(msg.sender, BULKTRANSFER) returns (bool) {

        require (_tos.length == _values.length);

        uint256 sourceBalance = balances[msg.sender];

        /// Temporarily set balance to 0 to mitigate the possibility of re-entrancy attacks
        balances[msg.sender] = 0;

        for (uint256 i = 0; i < _tos.length; i++) {
            uint256 currentValue = _values[i];
            address _to = _tos[i];
            require(_to != address(0));
            require(currentValue <= sourceBalance);

            sourceBalance = sourceBalance.sub(currentValue);
            balances[_to] = balances[_to].add(currentValue);

            trackAddresses(_to);

            emit Transfer(msg.sender, _tos[i], currentValue);
        }

        /// Set to the remaining balance
        balances[msg.sender] = sourceBalance;

        emit BulkTransfer(msg.sender, _tos.length);

        if (balances[msg.sender] == 0) {
            removeSeenAddress(msg.sender);
        }

        return true;
    }


    /// @dev Gets balance of the specified account.
    /// @param _tokenholder Address of interest
    /// @return Balance for the passed address
    function balanceOf(address _tokenholder) public view whenNotPaused returns (uint256 balance) {
        require(!isFrozen(_tokenholder));
        return balances[_tokenholder];
    }
}
