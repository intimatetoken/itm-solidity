pragma solidity 0.4.18;

import "./SafeMath.sol";
import "./Token.sol";

contract OwnedAndDestructible {
	address internal owner;

	function OwnedAndDestructible () external {
		owner = msg.sender;
	}

	modifier onlyOwner () {
		require(msg.sender == owner);
		_; // ... wrapped function
	}

	function destroy () onlyOwner external {
		selfdestruct(owner);
	}
}

// Destructible in the event that ETH is sent to this contract by `selfdestruct`
contract TokenSale is OwnedAndDestructible {
	Token private token;

	// internal state
	mapping(address => uint256) private assignedMap;
	uint256 private assignedSum;

	// internal constants
	uint256 private WEI_PER_TOKEN;
	uint256 private END_TIME;

	// modifiers
	modifier beforeEnd () { require(now < endTime); _; }
	modifier afterEnd () { require(now >= endTime); _; }
	modifier afterEndAnd1Year { require(now >= (endTime + 365 days)); _; } // +365 days should never overflow

	modifier ifIsOKAddress (address a) { require(a != 0x00); _; }
	modifier ifIsOKValue (uint256 x) { require(x > 0); _; }
	modifier ifIsAssignedTokens (address a) { require(assignedMap[a] > 0); _; }

	// events
	event LogAssignment (address indexed from, address indexed to, uint256 tokens);

	// constructor
	function TokenSale (address addressForTokenContract, uint256 weiPerToken, uint256 endTime) external {
		token = Token(addressForTokenContract);

		WEI_PER_TOKEN = weiPerToken;
		END_TIME = endTime;
	}

	// functions (private)
	function _buyFor (address addr)
		beforeEnd
		ifIsOKAddress(addr) // no unusable addresses
		ifIsOKValue(msg.value)
	private {
		// enforce that there _are_ unassigned tokens
		uint256 available = token.balanceOf(this);
		require(available > assignedSum)

		// enforce that there are enough for this sale
		uint256 wanted = msg.value.div(WEI_PER_TOKEN);
		uint256 unassigned = available.sub(assignedSum);
		require(unassigned >= wanted);

		// add the wanted tokens to any existing balance
		uint256 addrBalanceOld = assignedMap[addr];
		uint256 addrBalanceNew = addrBalanceOld.add(wanted);

		// add the wanted tokens to the contracts running total
		uint256 assignedSumNew = assignedSum.add(wanted);
		// ... nothing exploded! good!

		// state updates before transfers (best practice, due to malicious fallbacks)
		assignedMap[addr] = addrNew;
		assignedSum = assignedSumNew;

		// forward the funds to the owner
		owner.transfer(msg.value);

		LogAssignment(msg.sender, addr, numberOfTokens);
	}

	function _withdrawFor (address addr)
		afterEnd
		ifIsAssignedTokens(addr)
	private {
		uint256 count = assignedMap[addr];
		assignedMap[addr] = 0;
		token.transfer(addr, count);
	}

	function _recoverFor (address addr)
		afterEndAnd1Year
		onlyOwner
		ifIsAssignedTokens(addr)
	private {
		uint256 count = assignedMap[addr];
		assignedMap[addr] = 0;
		token.transfer(owner, count);
	}

	// functions (external)
	function () external payable { _buyFor(msg.sender); } // XXX: non-simple, >2300 gas
	function buyFor (address addr) external payable { _buyFor(beneficiary); }
	function withdraw () external { _withdrawFor(msg.sender); }
	function withdrawFor (address addr) external { _withdrawFor(addr); }
	function recover (address addr) external { _recoverFor(addr); }
}
