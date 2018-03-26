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

import '../math/SafeMath.sol';
import './IERC20Basic.sol';
import '../managed/Pausable.sol';
import '../storage/BasicTokenStorage.sol';


contract BasicToken is IERC20Basic, TokenLedger, BasicTokenStorage, Pausable {

  using SafeMath for uint256;

  event Transfer(address indexed _tokenholder, address indexed _tokenrecipient, uint256 _value);
  event BulkTransfer(address indexed _tokenholder, uint256 _howmany);
  event Overflow(address indexed _tokenrecipient, uint256 _balance, uint256 _amount);
  event InsufficientFunds(address indexed _tokenholder, address indexed _tokenrecipient, uint256 _balance, uint256 _amount);


  /// @dev Return the total token supply

  function totalSupply() public view whenNotPaused returns (uint256) {

     return totalsupply;

  }

  /// @dev transfer token for a specified address
  /// @param _to The address to transfer to.
  /// @param _value The amount to be transferred.

  function transfer(address _to, uint256 _value) public whenNotPaused returns (bool) {

     /// No transfers to 0x0 address, use burn instead, if implemented
     require(_to != address(0));

     /// No useless operations
     require(msg.sender != _to);

     /// This will revert if not enough funds
     balances[msg.sender] = balances[msg.sender].sub(_value);

     /// _to might be a completely new address, so check and store if so
     trackAddresses(_to);

     /// This will revert on overflow
     balances[_to] = balances[_to].add(_value);

     /// Emit the Transfer event
     Transfer(msg.sender, _to, _value);

     return true;

  }

  /// @dev bulkTransfer tokens to a list of specified addresses, not an ERC20 function
  /// @param _tos The list of addresses to transfer to.
  /// @param _values The list of amounts to be transferred.

  function bulkTransfer(address[] _tos, uint256[] _values) public whenNotPaused ifAuthorized(msg.sender, BULKTRANSFER) returns (bool) {

      BulkTransfer(msg.sender, _tos.length);

      uint256 sourceBalance = balances[msg.sender];

      /// Temporarily set balance to 0 to mitigate the possibility of re-entrancy attacks

      balances[msg.sender] = 0;

      for (uint256 i = 0; i < _tos.length; i++) {

             /// No transfers to 0x0 address, use burn instead, if implemented

             if (_tos[i] == address(0))
                 /// We do not revert in a bulk transfer function as that would scuttle all transfers
                 continue;


             uint256 currentValue = _values[i];

             /// Cannot revert if not enough funds in bulkTransfer, just break out of the loop

             if (currentValue > sourceBalance) {

                 /// This would exit the function with bulkTransfer only partially done, should we revert instead?

                 InsufficientFunds(msg.sender, _tos[i], sourceBalance, currentValue);

                 /// Set to the remaining balance

                 balances[msg.sender] = sourceBalance;

                 return true;

             }

             /// Cannot revert on overflow for a single address in bulkTransfer, just skip it

             if (balances[_tos[i]] + currentValue < balances[_tos[i]]) {

                  Overflow(_tos[i], balances[_tos[i]], currentValue);

                  continue;

             }

             /// Reduce the available balance, we checked above there was enough

             sourceBalance = sourceBalance - currentValue;

             /// Increment _tos[i]'s balance

             balances[_tos[i]] = balances[_tos[i]] + currentValue;

             /// _tos[i] might be a completely new address, so check and store if so
             /// If there is no need to track which addresses own this token, comment the next line out

             trackAddresses(_tos[i]);

             /// Emit the Transfer event
             Transfer(msg.sender, _tos[i], currentValue);

      }

      /// Set to the remaining balance

      balances[msg.sender] = sourceBalance;

      return true;

  }


  /// @dev Gets balance of the specified account.
  /// @param _tokenholder Address of interest
  /// @return Balance for the passed address

  function balanceOf(address _tokenholder) public view whenNotPaused returns (uint256 balance) {

     return balances[_tokenholder];

  }

}
