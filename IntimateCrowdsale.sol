pragma solidity ^0.4.16;

import "./IntimateToken.sol";

/**
 * @title Ownable
 * @dev The Ownable contract has an owner address, and provides basic authorization control
 * functions, this simplifies the implementation of "user permissions".
 */
contract Ownable {
  address public owner;

  event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

  /**
   * @dev The Ownable constructor sets the original `owner` of the contract to the sender
   * account.
   */
  function Ownable() {
    owner = msg.sender;
  }

  /**
   * @dev Throws if called by any account other than the owner.
   */
  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  /**
   * @dev Allows the current owner to transfer control of the contract to a newOwner.
   * @param newOwner The address to transfer ownership to.
   */
  function transferOwnership(address newOwner) onlyOwner public {
    require(newOwner != address(0));
    OwnershipTransferred(owner, newOwner);
    owner = newOwner;
  }
}

/**
 * @title Destructible
 * @dev Base contract that can be destroyed by owner. All funds in contract will be sent to the owner.
 */
contract Destructible is Ownable {

  /**
   * @dev Transfers the current balance to the owner and terminates the contract.
   */
  function destroy() onlyOwner public {
    selfdestruct(owner);
  }

  function destroyAndSend(address _recipient) onlyOwner public {
    selfdestruct(_recipient);
  }
}

contract IntimateCrowdsale is Destructible {
    IntimateToken public tokenReward;
    mapping(address => uint256) public balanceOf;
    
    uint public salePeriod = 14 days;
    
    uint public totalAmountRaised = 0;
    uint public fundingGoal = 10000 * 1 ether;

    event FundTransfer (address _backer, uint _amount, bool _isContribution);

// StateMachine <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    enum Stages {
        NotStarted,
        InProgress,
        Finished
    }

    uint startTime = 0;                   // public for dev
    Stages stage = Stages.NotStarted;     // public for dev

    modifier atStage (Stages _stage) {
        require(stage == _stage);
        _;
    }
    
    modifier transitionNext () {
        _;
        stage = Stages(uint(stage) + 1);
    }
    
    modifier timedTransitions () {
        require(stage > Stages.NotStarted);
        uint diff = now - startTime;
        if (diff >= salePeriod && stage != Stages.Finished) {
            stage = Stages.Finished;
        }
        _;
    }
// StateMachine >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 

    function IntimateCrowdsale (address _addressOfTokenUsedAsReward)
    {
        require(_addressOfTokenUsedAsReward != 0x0);
        tokenReward = IntimateToken(_addressOfTokenUsedAsReward);
    }

    function () payable 
    timedTransitions 
    atStage(Stages.InProgress) 
    {
        uint amount = msg.value;
        
        // require(amount >= 0.1 ether);

        totalAmountRaised += amount;
        balanceOf[msg.sender] += amount;
        tokenReward.transfer(msg.sender, amount / calculatePrice());
        
        FundTransfer(msg.sender, amount, true);
    }
    
    function calculatePrice () internal constant returns (uint price) {
        return 0.001 * 1 ether; // ??????????????
    }
    
    function startPresale ()
    onlyOwner
    atStage(Stages.NotStarted)
    transitionNext 
    {
        startTime = now;
    }
    
    function minutesToEnd () constant returns (uint _time) {
        require(stage > Stages.NotStarted && stage < Stages.Finished);
        uint endTime = startTime + salePeriod;
        uint toEndTime = endTime - now;
        return toEndTime <= salePeriod ? toEndTime / 1 minutes : 0;
    }
    
    function currentBalance () constant returns (uint _balance) {
        return this.balance;
    }
    
    function isGoalReached() constant returns (bool _isReached) {
        return totalAmountRaised >= fundingGoal;
    }
    
    function safeWithdrawal ()
    timedTransitions
    atStage(Stages.Finished)
    {
        if (isGoalReached() && owner == msg.sender) {
            uint amountRaised = this.balance;
            owner.transfer(amountRaised);
            tokenReward.transfer(owner, tokenReward.balanceOf(this));
            
            FundTransfer(owner, amountRaised, false);
        }
        
        if( ! isGoalReached()) {
            uint amount = balanceOf[msg.sender];
            require(amount > 0);
            msg.sender.transfer(amount);
            
            FundTransfer(msg.sender, amount, false);
        }
    }
}
