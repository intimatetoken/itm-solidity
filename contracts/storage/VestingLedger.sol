/*
 * Created by: alexo (Big Deeper Advisors, Inc)
 * For: Input Strategic Partners (ISP) and Intimate.io
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
 * TITLE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE COPYRIGHT HOLDERS OR ANYONE DISTRIBUTING THE
 * SOFTWARE BE LIABLE FOR ANY DAMAGES OR OTHER LIABILITY, WHETHER IN CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

pragma solidity ^0.4.21;

import "../auth/Authorized.sol";

contract VestingLedger is AuthorizedList, Authorized {

    /// It is not an Ethereum compliant address, and can be used only internally
    /// It also means that it is impossible to pull funds from it without going
    /// through the vesting process
    address public constant vestingFunds = 0xDeededBabeCafe;

    /// Vesting event, which account and how much was vested
    event Vesting(address indexed _beneficiary, uint256 _value);

    /// Revocation event
    event RevokeTokenGrant(address indexed _beneficiary, uint256 _unvestedamount);

    /// Event to set up a new vesting record
    event NewVestingPeriod(address indexed _beneficiary,
                           uint256 _amount,
                           uint256 _start,
                           uint256 _cliff,
                           uint256 _duration,
                           uint256 _tunit
    );


    struct VestingRecord {

        // The address that eventually gets the dough
        address beneficiary;

        // Total amount, if fully vested
        uint256 amount;

        // Vesting period start
        uint256 start;

        // Time needed to pass before any vesting casn happen
        uint256 cliff;

        // In months or days, a number of "tunit"s
        uint256 duration;

        // Time unit, like 1 month, 1 week, 1 day, etc...
        uint256 tunit;

    }

    // An array in case we need to loop over all vesting records, which we do need to do.
    VestingRecord[] internal vestingRecords;

    mapping (address => uint256) public vestingSchedule;
}
