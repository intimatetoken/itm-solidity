pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Token.sol";

contract TestToken {

  function testInitialBalanceUsingDeployedContract() {
    Token itm = Token(DeployedAddresses.Token());

    uint expected = 100000000;

    Assert.equal(itm.balanceOf(tx.origin), expected, "Owner should have 100000000 ITM initially");
  }

}
