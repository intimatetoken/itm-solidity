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

pragma solidity 0.4.18;

import '../math/SafeMath.sol';
import '../auth/Authorized.sol';
import '../storage/BasicTokenStorage.sol';
import '../token/StandardToken.sol';
//import '../storage/VestingLedger.sol';


contract VestingToken is AuthorizedList, Authorized, StandardToken {

    using SafeMath for uint256;

    address public constant vestingFunds = 0xDeededBabeCafe;

    /// Vesting event, which account and how much was vested
    event Vesting(address indexed _beneficiary, uint256 _value);

    /// Revocation event
    event RevokeTokenGrant(address indexed _beneficiary);

    /// Event to set up a new vesting record
    event NewVestingPeriod(address indexed _beneficiary, 
                           uint256 _amount, 
                           uint256 start, 
                           uint256 cliff,
                           uint256 duration,
                           uint256 tunit
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
    VestingRecord [] internal vestingRecords;

    mapping (address => uint256) public vestingSchedule;


    /// @dev Contract constructor singleton, initialize known vesting schedule

    function VestingToken() public {

      /// Put all the init code here for vesting periods 

      uint256 _start = now;

      /// 0x1, 0x2, 0x3, etc... are example addresses, replace with real ones

      /// President's vesting schedule
      vestingRecords.push(VestingRecord({ 
                 beneficiary: 0x1, 
                 amount:      uint256(42) * 10**18, 
                 start:       _start, 
                 cliff:       1.5 years, 
                 duration:    2 years,
                 tunit:       1 years/12
      }));
      NewVestingPeriod( 0x1, uint256(42) * 10**18, now, 1.5 years, 4 years, 1 years/12 );

      /// CTO's vesting schedule
      vestingRecords.push(VestingRecord({ 
                 beneficiary: 0x2, 
                 amount:      uint256(21) * 10**18, 
                 start:       _start, 
                 cliff:       1.5 years, 
                 duration:    2 years,
                 tunit:       1 years/12
      }));
      NewVestingPeriod( 0x2, uint256(21) * 10**18, now, 1.5 years, 4 years, 1 years/12 );

      /// CFO's vesting schedule
      vestingRecords.push(VestingRecord({ 
                 beneficiary: 0x3, 
                 amount:      uint256(21) * 10**18, 
                 start:       _start, 
                 cliff:       1.5 years, 
                 duration:    2 years,
                 tunit:       1 years/12
      }));
      NewVestingPeriod( 0x3, uint256(21) * 10**18, now, 1.5 years, 4 years, 1 years/12 );

      /// Adviser's vesting schedule
      vestingRecords.push(VestingRecord({ 
                 beneficiary: 0x4, 
                 amount:      uint256(10) * 10**18, 
                 start:       _start, 
                 cliff:       1 years/4, 
                 duration:    1 years,
                 tunit:       1 years/12
      }));
      NewVestingPeriod( 0x4, uint256(10) * 10**18, now, 1 years, 3 years, 1 years/12 );

      uint256 vestingTotal;
      for (uint256 i = 0; i < vestingRecords.length; i++) {
          vestingTotal = vestingTotal.add(vestingRecords[i].amount);
      }

      /// Move vesting funds from the contract creator to vestingFunds address
      ///balances[msg.sender] = balances[msg.sender].sub(vestingTotal);
      balances[vestingFunds] = vestingTotal;
      

    }

    /// @dev Delete a vesting record if the _beneficary is no longer entitled to the remaining tokens

    function revoke(address _beneficiary) public ifAuthorized(msg.sender, APHRODITE) returns (bool success) {

      /// Don't waste gas if there is nothing to do
      require(vestingRecords.length > 0);

      /// Current block timestamp
      uint256 present = now;

      /// Run the vesting function first to ensure that the _beneficiary gets whatever has already been accrued
      /// and then find and remove that vesting record
      vest();

      /// Since the number of addresses that need to vest is small, no worrying about block gas limit

      for (uint256 i = 0; i < vestingRecords.length; i++) {

          VestingRecord memory vr = vestingRecords[i];
          if (_beneficiary == vr.beneficiary) {
                vestingRecords[i] = vestingRecords[vestingRecords.length - 1];
                vestingRecords.length--;
                break;
          }

      }

      RevokeTokenGrant(_beneficiary);

      return true;

    }



    function vest() public ifAuthorized(msg.sender, APHRODITE) returns (bool success) {

      /// Don't waste gas if there is nothing to do
      require(vestingRecords.length > 0);

      /// Current block timestamp
      uint256 present = now;

      /// Since the number of addresses that need to vest is small, no worrying about block gas limit

      for (uint256 i = 0; i < vestingRecords.length; i++) {


          VestingRecord memory vr = vestingRecords[i];

          if (present < vr.start.add(vr.cliff)) {
               continue;
          }

          /// First we retrieve the current allowance for this beneficiary
          /// Assuming the beneficiary has not spent any tokens it would be the same as amount vested

          var allowed = allowances[vestingFunds][vr.beneficiary];

          /// If allowance is greater than 0, we saved it in allowed
          allowances[vestingFunds][vr.beneficiary] = 0;

          uint256 amount = 0;
          if (present >= vr.start.add(vr.duration)) {
              amount = vr.amount;
          }
          else 
              amount = (vr.amount.mul(present.sub(vr.start.add(vr.cliff)))/vr.duration.mul(vr.tunit)).mul(vr.tunit);


          /// Update the amount to the remaining amount, 
          vestingRecords[i] = VestingRecord({
               beneficiary: vr.beneficiary,
               amount: vr.amount.sub(amount),
               start: vr.start,
               cliff: vr.cliff,
               /// Compute remaining time
               duration: vr.start.add(vr.cliff).add(vr.duration).sub(present),
               tunit: vr.tunit
          });

          /// After this transaction is mined vr.beneficiary can use transferFrom to spend additional amount of tokens
          allowances[vestingFunds][vr.beneficiary] = allowed.add(amount);

          /// Emit Vesting event, with beneficary address and amount
          Vesting(vr.beneficiary, amount);

          /// Since vesting occurs by raising a spending allowance, also emit the Approval event
          Approval(vestingFunds, vr.beneficiary, amount);

      }

      return true;

    }

    function numberVestingRecords() public view ifAuthorized(msg.sender, APHRODITE) returns (uint256) {

      return vestingRecords.length;

    }

    function returnVestingRecords() public view ifAuthorized(msg.sender, APHRODITE) returns (VestingRecord[]) {

      return vestingRecords;

    }


    /// @dev Add a vesting record,m dynamically after the contract gets deployed
    /// We don't supply the start time, that gets filled from "now"
    /// @param _beneficiary Address to receive vested funds
    /// @param _amount The amount to be vested.
    /// @param _cliff Amount of time to pass before any vesting happens 
    /// @param _duration Total time from the start to have have vested the entire _amount
    /// @param _tunit How often vesting happens

    function addVestingRecord(

                              /// The address that would have its allowance set 
                              address _beneficiary,

                              /// Total amount due beneficiary, if fully vested
                              uint256 _amount,

                              /// Time needed to pass before any funds get vested, offset from start
                              uint256 _cliff,

                              /// Total time needed to fully vest
                              uint256 _duration,

                              /// Unit of time, like 1 month, etc...
                              uint256 _tunit 

                             ) public ifAuthorized(msg.sender, APHRODITE) returns (bool) {

        require(_beneficiary != address(0));

        uint256 _start = now;

        vestingRecords.push(VestingRecord({
                     beneficiary: _beneficiary,
                     amount: _amount,
                     start: _start,
                     duration: _duration,
                     cliff: _cliff,
                     tunit: _tunit}));

        // Store VestingRecord index in a map for easy access
        vestingSchedule[_beneficiary] = vestingRecords.length - 1;

        /// Emit Vesting Period event
        NewVestingPeriod( _beneficiary, _amount, _start, _cliff, _duration, _tunit );

        return true;

    }

}

