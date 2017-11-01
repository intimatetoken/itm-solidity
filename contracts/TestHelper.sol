pragma solidity 0.4.15;

contract TestHelper {

    function getNow () public constant returns (uint time) {
        return now;
    }

    function noop () external { }

}
