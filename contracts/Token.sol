pragma solidity ^0.4.11;

import "../lib/SafeMath.sol";

// see https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20-token-standard.md
contract Token {
    using SafeMath for uint256;

    // internal state
    mapping (address => uint256) private balances;
    mapping (address => mapping (address => uint256)) private allowed;

    // internal constants
    // XXX: Solidity creates constant functions () for these constants
    string public constant name = "Intimate Token";
    uint8 public constant decimals = 0;
    string public constant symbol = "ITM";
    string public constant version = '1.0';
    uint256 public constant totalSupply = 100000000;

    event Transfer (address indexed from, address indexed to, uint256 value);
    event Approval (address indexed owner, address indexed spender, uint256 value);

    function Token () public {
        balances[msg.sender] = totalSupply;
        Transfer(0x0, msg.sender, totalSupply);
    }

    // see https://github.com/OpenZeppelin/zeppelin-solidity/blob/8e01dd14f9211239213ae7bd4c6af92dd18d4ab7/contracts/token/BasicToken.sol#L22
    function transfer (address _to, uint256 _value) public returns (bool) {
        require(_to != address(0));
        require(_value <= balances[msg.sender]);

        // SafeMath.sub will throw if there is not enough balance.
        balances[msg.sender] = balances[msg.sender].sub(_value);
        balances[_to] = balances[_to].add(_value);
        Transfer(msg.sender, _to, _value);
        return true;
    }

    function balanceOf (address _owner) public constant returns (uint256 balance) {
        return balances[_owner];
    }

    // see https://github.com/OpenZeppelin/zeppelin-solidity/blob/8e01dd14f9211239213ae7bd4c6af92dd18d4ab7/contracts/token/StandardToken.sol#L26
    function transferFrom (address _from, address _to, uint256 _value) public returns (bool) {
        require(_to != address(0));
        require(_value <= balances[_from]);
        require(_value <= allowed[_from][msg.sender]);

        balances[_from] = balances[_from].sub(_value);
        balances[_to] = balances[_to].add(_value);
        allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_value);
        Transfer(_from, _to, _value);
        return true;
    }

    function approve (address _spender, uint256 _value) public returns (bool) {
        allowed[msg.sender][_spender] = _value;
        Approval(msg.sender, _spender, _value);
        return true;
    }

    function allowance (address _owner, address _spender) public constant returns (uint256 remaining) {
        return allowed[_owner][_spender];
    }
}
