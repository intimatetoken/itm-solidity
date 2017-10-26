// see https://raw.githubusercontent.com/OpenZeppelin/zeppelin-solidity/8e01dd14f9211239213ae7bd4c6af92dd18d4ab7/contracts/lifecycle/Destructible.sol
// XXX: Destructible constructor changed to not payable
// XXX: destroy changed to external
// XXX: destroyAndSend removed
pragma solidity ^0.4.11;

import "./Ownable.sol";

contract Destructible is Ownable {
  function destroy() onlyOwner external {
    selfdestruct(owner);
  }
}
