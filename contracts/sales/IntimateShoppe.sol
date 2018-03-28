/*
 * Created by: alexo (Big Deeper Advisors, Inc)
 * For: Input Strategic Partners (ISP) and Intimate.io
 *
 * Derived from some public sources and substantially extended/adapted for intimate's use.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
 * TITLE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE COPYRIGHT HOLDERS OR ANYONE DISTRIBUTING THE
 * SOFTWARE BE LIABLE FOR ANY DAMAGES OR OTHER LIABILITY, WHETHER IN CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

pragma solidity ^0.4.18;

import '../math/SafeMath.sol';
import '../auth/Authorized.sol';
import '../managed/Pausable.sol';

import '../token/RecoverCurrency.sol';
import '../token/IERC20Basic.sol';
import '../token/IERC20.sol';


contract IntimateShoppe is Pausable, RecoverCurrency {

  using SafeMath for uint256;

  /// List of contributors, i.e. msg.sender(s) who has sent in Ether

  address[] internal contributors;

  /// List of contributions for each contributor

  mapping (address => uint256[]) internal contributions;

  event Transfer(address indexed _from, address indexed _to, uint256 _value);

  /// @dev event for token purchase logging
  /// @param _seller_wallet_address account that sends tokens
  /// @param _buyer_address who got the tokens in exchange for ether
  /// @param _value weis paid for purchase
  /// @param _amount of tokens purchased

  event ITMTokenPurchase(address indexed _seller_wallet_address, address indexed _buyer_address, uint256 _value, uint256 _amount);

  /// @dev Starting and ending times for sale period

  event SetPeriod(uint256 _startTime, uint256 _endTime);


  /// The ITM token object
  IERC20 public token;

  /// address of the ITM token
  address public token_address;

  /// start and end timestamps in between which investments are allowed (both inclusive)
  uint256 public startTime;
  uint256 public endTime;

  /// address where funds are collected, it could a simple address or multi-sig wallet contract
  address public wallet_address;

  /// how many token units a buyer gets per wei
  uint256 public rate = 600;

  /// upper limit for tokens to be sold in this public offering
  /// NOTE: Since decimals are set at 1e18, if one sets a limit of one(1) ITM, this number should be
  /// 1 * 1e18
  uint256 public capTokens;

  /// Maxiumum acceptable Ether amount 
  uint256 public maxValue = 100 ether;

  /// Minimum acceptable Ether amount, 1 ITM worth
  uint256 public minValue = uint256(1 ether)/600;

  /// amount of raised money in wei
  uint256 public weiRaised = 0;
  uint256 public tokensSold = 0;

  /// High water line for contract balance
  uint256 internal highWater = 1 ether;

  /// What round it is
  uint8 public round = 0;

  /// @param _timeFromNow is the amount of time in seconds to wait from deployment to start accepting Ether
  /// @param _duration is the period of time in seconds how long the sale would last, so if a sale lasts 1 month
  /// then the _duration = 30(31)*24*60*60 seconds

  function IntimateShoppe(

          uint256 _timeFromNow, 
          uint256 _duration, 
          uint256 _rate, 
          address _wallet_address, 
          address _token_address, 
          uint256 _cap,
          uint8 _round) public Authorized() {

    require(_timeFromNow >= 0 && _duration > 0);
    require(_rate > 0);
    require(_wallet_address != address(0x0));
    require(_token_address != address(0x0));
    require(_cap > 0);

    round = _round;

    startTime = now + _timeFromNow;
    endTime = now + _timeFromNow + _duration;

    rate = _rate;
    capTokens = _cap;
    wallet_address = _wallet_address;
    token_address = _token_address;
    token = IERC20(token_address);

  }

  /// @dev Log contributors and their contributions
  /// @param _sender A Contributor's address
  /// @param _value Amount of Ether said contributor sent

  function trackContributions(address _sender, uint256 _value) internal {
       if (contributions[_sender].length == 0)
           contributors.push(_sender);
       contributions[_sender].push(_value);
  }

  /// @dev Retrieve contributors
  /// @return A list of contributors

  function getContributors() external view ifAuthorized(msg.sender, APHRODITE) returns (address[]) {

      return contributors;

  }

  /// @dev Retrieve contributions by a single contributor 
  /// @param _contributor The account associated with contributions
  /// @return A list of ether amounts that _contributor sent in
  /// Using the function above one can get a list first, and then get individual Ether payments
  /// and aggregate them if needed

  function getContributionsForAddress(address _contributor) external view ifAuthorized(msg.sender, APHRODITE) returns (uint256[]) {

      return contributions[_contributor];

  }

  /// @dev If a sale is done using multiple rounds, allowing for better pricing structure, depending on
  /// on market demand and value of the ITM token. Is also set via the constructor
  /// @param _round Round label/count

  function setRound(uint8 _round) public ifAuthorized(msg.sender, APHRODITE) {

      round = _round;

  }

  /// @dev Sets the maximum Value in Ether to purchase tokens
  /// @param _maxValue Amount in wei

  function setMaxValue(uint256 _maxValue) public ifAuthorized(msg.sender, APHRODITE) {

      /// Cannot be modified once sale is ongoing
      require(now < startTime || now > endTime);
      maxValue = _maxValue;

  }

  /// @dev Sets the mininum Value in Ether to purchase tokens
  /// @param _minValue Amount in wei

  function setMinValue(uint256 _minValue) public ifAuthorized(msg.sender, APHRODITE) {

      /// Cannot be modified once sale is ongoing
      require(now < startTime || now > endTime);
      minValue = _minValue;

  }


  /// @dev Reset the starting and ending times for the next round
  /// @param _timeFromNow Start of the sale round
  /// @param _duration End of the sale round

  function setTimes(uint256 _timeFromNow, uint256 _duration) public ifAuthorized(msg.sender, APHRODITE) {

       /// Can't reset times if sale ongoing already, make sure everything else is set before
       require(now < startTime || now > endTime);

       require(_timeFromNow >= 0 && _duration > 0);
       startTime  = now + _timeFromNow;
       endTime = startTime + _duration;
       SetPeriod(startTime, endTime);

  }


  /// @dev Set the cap, i.e. how many token units  we will sell in this round
  /// @param _capTokens How many token units are offered in a round

  function setCap(uint256 _capTokens) public ifAuthorized(msg.sender, APHRODITE) {

     /// Cannot be modified once sale is ongoing
     require(now < startTime || now > endTime);
     require(_capTokens  > 0);
     capTokens = _capTokens;

  }

  /// @dev Set the rate, i.e. how many units per wei do we give
  /// @param _rate How many token units are offered for 1 wei, 1 or more.

  function setRate(uint256 _rate) public ifAuthorized(msg.sender, APHRODITE) {

     /// Cannot be modified once sale is ongoing
     require(now < startTime || now > endTime);
     require(_rate  > 0);
     rate = _rate;

  }

  /// @dev Change the wallet address
  /// @param _wallet_address replacement wallet address

  function changeCompanyWallet(address _wallet_address) public ifAuthorized(msg.sender, APHRODITE) {

     wallet_address = _wallet_address;

  }

  /// @dev highWater determines at what contract balance Ether is forwarded to wallet_address
  /// @return highWater

  function getHighWater() public view ifAuthorized(msg.sender, APHRODITE) returns (uint256) {

     return highWater;

  }

  /// @dev Set the high water line/ceiling
  /// @param _highWater Sets the threshold to shift Ether to another address

  function setHighWater(uint256 _highWater) public ifAuthorized(msg.sender, APHRODITE) {

     highWater = _highWater;

  }


  /// fallback function used to buy tokens

  function () payable public {

    /// Make certain msg.value sent is within permitted bounds
    require(msg.value >= minValue && msg.value <= maxValue);
    backTokenOwner();

  }

  /// @dev Main purchase function

  function backTokenOwner() whenNotPaused internal {

    // Within the current sale period
    require(now >= startTime && now <= endTime);

    // Transfer Ether from this contract to the company's or foundation's wallet_address

    if (this.balance >= highWater)
        //wallet_address.transfer(msg.value);
        if (wallet_address.call.value(this.balance)())
           Transfer(this, wallet_address, this.balance);

    /// Keep data about buyers's addresses and amounts
    /// If this functionality is not wanted, comment out the next line
    trackContributions(msg.sender, msg.value);

    uint256 tokens = msg.value.mul(rate);

    /// Transfer purchased tokens to the public buyer

    /// Note that the address authorized to control the token contract needs to set "wallet_address" allowance
    /// using ERC20 approve function before this contract can transfer tokens.
   
    if (token.transferFrom(wallet_address, msg.sender, tokens)) {

        weiRaised = weiRaised.add(msg.value);
        tokensSold = tokensSold.add(tokens);
        ITMTokenPurchase(wallet_address, msg.sender, msg.value, tokens);

        // Check the cap and revert if exceeded
        require(tokensSold <= capTokens);

    }

  }

}

