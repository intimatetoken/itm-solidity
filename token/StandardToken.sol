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
import './IERC20.sol';
import '../managed/Pausable.sol';
import '../storage/BasicTokenStorage.sol';
import './BasicToken.sol';


contract StandardToken is IERC20Basic, BasicToken, IERC20 {

   using SafeMath for uint256;

   event Approval(address indexed _tokenholder, address indexed _tokenspender, uint256 _value);

   /// @dev Implements ERC20 transferFrom from one address to another
   /// @param _from The source address  for tokens
   /// @param _to The destination address for tokens
   /// @param _value The number/amount to transfer

   function transferFrom(address _from, address _to, uint256 _value) public whenNotPaused returns (bool) {

     // Don't send tokens to 0x0 address, use burn function that updates totalSupply
     // and don't waste gas sending tokens to yourself
     require(_to != address(0) && _from != _to);

     /// This will revert if _value is larger than the allowance
     allowances[_from][msg.sender] = allowances[_from][msg.sender].sub(_value);

     balances[_from] = balances[_from].sub(_value);

     /// _to might be a completely new address, so check and store if so
     trackAddresses(_to);

     balances[_to] = balances[_to].add(_value);

     /// Emit the Transfer event
     Transfer(_from, _to, _value);

     return true;

   }


   /// @dev Approve the passed address to spend the specified amount of tokens on behalf of msg.sender.
   /// @param _tokenspender The address which will spend the funds.
   /// @param _value The amount of tokens to be spent.
  
   function approve(address _tokenspender, uint256 _value) public whenNotPaused returns (bool) {

      require(_tokenspender != address(0) && msg.sender != _tokenspender);

      /// To mitigate reentrancy race condition, set allowance for _tokenspender to 0
      /// first and then set the new value
      /// https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729

      require((_value == 0) || (allowances[msg.sender][_tokenspender] == 0));

      /// Allow _tokenspender to transfer up to _value in tokens from msg.sender

      allowances[msg.sender][_tokenspender] = _value;

      /// Emit the Approval event
      Approval(msg.sender, _tokenspender, _value);

      return true;

   }


   /// @dev Function to check the amount of tokens that a spender can spend
   /// @param _tokenholder Token owner account address
   /// @param _tokenspender Account address authorized to transfer tokens
   /// @return Amount of tokens still available to _tokenspender to transfer.

   function allowance(address _tokenholder, address _tokenspender) public view whenNotPaused returns (uint256) {

      return allowances[_tokenholder][_tokenspender];

   }

}


