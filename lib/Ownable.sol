// see https://raw.githubusercontent.com/OpenZeppelin/zeppelin-solidity/8e01dd14f9211239213ae7bd4c6af92dd18d4ab7/contracts/ownership/Ownable.sol
// XXX: removed transferOwnership and OwnershipTransferred
// XXX: owner state changed to internal
pragma solidity 0.4.18;

contract Ownable {
  address internal owner;

  function Ownable() public {
    owner = msg.sender;
  }

  modifier onlyOwner() { require(msg.sender == owner); _; }
}
