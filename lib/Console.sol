pragma solidity ^0.4.10;

// Enables event logging of the format `console.log('descriptive string', variable)`,
// without having to worry about the variable type (as long as an event has been declared for that type in the
// Console contract.

contract Console {
    event LogUint(string, uint);
    function log(string s , uint x) {
        LogUint(s, x);
    }

    event LogInt(string, int);
    function log(string s , int x) {
        LogInt(s, x);
    }

    event LogBytes(string, bytes);
    function log(string s , bytes x) {
        LogBytes(s, x);
    }

    event LogBytes32(string, bytes32);
    function log(string s , bytes32 x) {
        LogBytes32(s, x);
    }

    event LogAddress(string, address);
    function log(string s , address x) {
        LogAddress(s, x);
    }

    event LogBool(string, bool);
    function log(string s , bool x) {
        LogBool(s, x);
    }
}
