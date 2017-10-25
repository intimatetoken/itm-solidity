pragma solidity 0.4.18;

import "./SafeMath.sol";
import "./Token.sol";

// minimal Owner/Destructible,  omits `destroyAndSend` and `transferOwnership`
contract OwnedAndDestructible {
	address internal owner;

	function OwnedAndDestructible () public {
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

// Destructible in the event that ETH is sent to this contract via `selfdestruct`, and therefore not forwarded
contract TokenSale is OwnedAndDestructible {
	using SafeMath for uint256;

	Token private token;

	// internal state
	mapping(address => uint256) private allocatedMap;
	uint256 private allocatedSum = 0;

	// internal constants
	uint256 private constant END_TIME = 1517454000430; // 'Thu Feb 01 2018 14:00:00 GMT+1100 (AEDT)'
	uint256 private constant WEI_PER_TOKEN = 1000;

	// modifiers
	modifier beforeEnd () { require(now < END_TIME); _; } // XXX: `now` can be manipulated by a miner, still ~OK
	modifier afterEnd () { require(now >= END_TIME); _; }

	modifier ifIsOKAddress (address a) { require(a != 0x00); _; }
	modifier ifIsOKValue (uint256 x) { require(x >= WEI_PER_TOKEN); _; }
	modifier ifIsAllocatedTokens (address a) { require(allocatedMap[a] > 0); _; }

	// events
	event LogAllocation (address indexed from, address indexed to, uint256 wei, uint256 tokens);

	// constructor (TODO: verify as only callable once)
	function TokenSale (address addressForTokenContract) public ifIsOKAddress(addressForTokenContract) {
		token = Token(addressForTokenContract);
	}

	// TODO: add circuit breaker
	// functions (private)
	function _buyFor (address addr)
		beforeEnd
		ifIsOKAddress(addr) // no unusable addresses
		ifIsOKValue(msg.value)
	private {
		// enforce that there remains unallocated tokens
		uint256 available = token.balanceOf(this);
		require(allocatedSum < available); // no over-allocation

		// enforce that there are enough for this sale
		uint256 wanted = msg.value.div(WEI_PER_TOKEN);
		assert(wanted > 0); // should never happen, see ifIsOKValue

		uint256 unallocatedSum = available.sub(allocatedSum);
		require(unallocatedSum >= wanted);

		// add the wanted tokens to any existing balance
		uint256 addrBalanceOld = allocatedMap[addr]; // if not exists, defaults to zero
		uint256 addrBalanceNew = addrBalanceOld.add(wanted);

		// add the wanted tokens to the contracts running total
		uint256 allocatedSumNew = allocatedSum.add(wanted);
		assert(allocatedSumNew <= available); // should never happen
		// ... nothing exploded! good!

		// state updates before transfers (best practice, due to malicious fallbacks)
		allocatedMap[addr] = addrBalanceNew;
		allocatedSum = allocatedSumNew;

		// forward the funds to the owner
		owner.transfer(msg.value);

		LogAllocation(msg.sender, addr, msg.value, wanted);
	}

	function _withdrawFor (address addr)
		afterEnd
		ifIsallocatedTokens(addr)
	private {
		uint256 count = allocatedMap[addr];
		allocatedMap[addr] = 0;
		token.transfer(addr, count);
	}

	// functions (external payable)
	function () external payable { _buyFor(msg.sender); } // XXX: non-simple, >2300 gas
	function buy () external payable { _buyFor(msg.sender); }
	function buyFor (address addr) external payable { _buyFor(addr); }

	// functions (external)
	function withdraw () external { _withdrawFor(msg.sender); }
	function withdrawFor (address addr) external { _withdrawFor(addr); }
}
