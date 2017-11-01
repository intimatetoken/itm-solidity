// see https://raw.githubusercontent.com/OpenZeppelin/zeppelin-solidity/8e01dd14f9211239213ae7bd4c6af92dd18d4ab7/contracts/lifecycle/Pausable.sol
// XXX: paused state changed to internal
// XXX: pause/unpause changed to external
pragma solidity 0.4.18;

import "./Ownable.sol";

contract Pausable is Ownable {
  event Pause();
  event Unpause();

  bool internal paused = false;
  modifier whenNotPaused() { require(!paused); _; }
  modifier whenPaused() { require(paused); _; }

  function pause() onlyOwner whenNotPaused external {
    paused = true;
    Pause();
  }

  function unpause() onlyOwner whenPaused external {
    paused = false;
    Unpause();
  }
}
