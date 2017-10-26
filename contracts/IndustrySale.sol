pragma solidity 0.4.18;

import "../lib/Ownable.sol";
import "../lib/Destructible.sol";
import "../lib/Pausable.sol";

import "../lib/SafeMath.sol";
import "./Token.sol";

contract IndustrySale is Ownable, Destructible, Pausable {
	using SafeMath for uint256;

	// internal state
	Token private token;
	mapping(address => uint256) private allocatedMap;
	uint256 private allocatedSum = 0;

	// internal constants
	uint256 private constant END_TIME = 1517454000430; // 'Thu Feb 01 2018 14:00:00 GMT+1100 (AEDT)'
	uint256 private constant UNLOCK_TIME = 1519873200430; // 'Thu Mar 01 2018 14:00:00 GMT+1100 (AEDT)'
	uint256 private constant WEI_PER_TOKEN = 1000;

	// modifiers
	modifier beforeEnd () { require(now < END_TIME); _; } // XXX: `now` can be manipulated by a miner, still ~OK
	modifier afterEnd () { require(now >= END_TIME); _; }
	modifier afterUnlock () { require(now >= UNLOCK_TIME); _; }

	modifier ifIsOKAddress (address a) { require(a != address(0)); _; }
	modifier ifIsOKValue (uint256 x) { require(x >= WEI_PER_TOKEN); _; }
	modifier ifIsAllocatedTokens (address a) { require(allocatedMap[a] > 0); _; }

	// events
	event LogAllocation (address indexed by, address indexed to, uint256 wei, uint256 tokens);
	event LogClaim (address indexed by, address indexed to, uint256 tokens);

	// constructor (TODO: verify as only callable once)
	function IndustrySale (address tokenAddr) public ifIsOKAddress(tokenAddr) {
		token = Token(tokenAddr);
	}

	// functions (private)
	// @dev ignores msg.sender, assigns msg.value*WEI_PER_TOKEN tokens to `addr`
	function _assign (address addr)
		whenNotPaused
		beforeEnd
		ifIsOKAddress(addr) // no unspendable allocations
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

	// @dev ignores msg.sender, transfers any tokens allocated for addr, to addr
	function _claim (address addr)
		whenNotPaused
		afterEnd
		afterUnlock
		ifIsAllocatedTokens(addr)
	private {
		uint256 count = allocatedMap[addr];
		allocatedMap[addr] = 0;
		assert(token.transfer(addr, count));

		LogClaim(msg.sender, addr, count);
	}

	// functions (external payable)
	function () external payable { _assign(msg.sender); } // XXX: non-simple, >2300 gas
	function buy () external payable { _assign(msg.sender); }
	function buyFor (address addr) external payable { _assign(addr); }

	// functions (external)
	function withdraw () external { _claim(msg.sender); }
	function withdrawFor (address addr) external { _claim(addr); }
}
