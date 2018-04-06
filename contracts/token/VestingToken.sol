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

import "../math/SafeMath.sol";
import "../auth/Authorized.sol";
import "../storage/BasicTokenStorage.sol";
import "../token/StandardToken.sol";

contract VestingToken is AuthorizedList, Authorized, VestingLedger, StandardToken {

    using SafeMath for uint256;

    /// @dev Contract constructor singleton, initialize known vesting schedule
    function VestingToken() public {

        /// Put all the init code here for vesting periods 
        uint256 _start = now;

        /// If vesting will be done manually, this section should be commented out
        /// intimate's team should carefully examine the schedule and change the starting
        /// times or other periods according to their requirements
      
        /// The amounts are TEST amounts, HAVE TO REPLACE WITH REAL numbers!!!!!!!!!!!!!!!

        /// testrpc -m "uncle despair bomb pelican keep stereo rely police defense meat head deposit"
        /// run the line above to generate the same test accounts
        /// (0) 0xf606622a1812c773c9d7b9996f2a984b34459e12
        /// (1) 0x8d02bb228e63418b66a06313d4bb61c7ae5b9e6c
        /// (2) 0x328eb8b84d09ed15753e78833a4a5ebfddda4f9e
        /// (3) 0x8c0596698832dff65370ca1bd907309aaa644c30
        /// (4) 0xa9b3873db714de4946e6b720469b1971c12605a1

        /// TEST ACCOUNTS MUST BE REPLACED WITH REAL ADDRESSES BEFORE DEPLOYMENT!!!!!!!!!!!!!!!

        /// Additional vesting records can be added as needed

        /// To define vesting records with starting times in the past, a required number of
        /// of weeks, days, years have to be subtracted from the _start variable
        /// for example "start: _start - 1 years" means 1 year before the contract deployment
        /// If the deployment is April 11th, 2018, then the vesting record start was on April 11, 2017

        /// President's vesting schedule
        vestingRecords.push(VestingRecord({ 
            beneficiary: 0x8d02bb228E63418b66a06313D4bB61C7aE5b9e6C,
            amount: uint256(24000) * 10**18,
            start: _start,
            cliff: 1.5 years,
            duration: 2 years,
            tunit: 1 years/12
        }));
        emit NewVestingPeriod(0x8d02bb228E63418b66a06313D4bB61C7aE5b9e6C, uint256(24000) * 10**18, _start, 1.5 years, 2 years, 1 years/12);
        vestingSchedule[0x8d02bb228e63418b66a06313d4bb61c7ae5b9e6c] = vestingRecords.length;

        /// CTO's vesting schedule
        vestingRecords.push(VestingRecord({ 
            beneficiary: 0x328EB8b84D09ed15753e78833a4A5EbfDdda4F9e,
            amount: uint256(12000) * 10**18,
            start: _start,
            cliff: 1.5 years,
            duration: 2 years,
            tunit: 1 years/12
        }));
        emit NewVestingPeriod(0x328eb8b84d09ed15753e78833a4a5ebfddda4f9e, uint256(12000) * 10**18, _start, 1.5 years, 2 years, 1 years/12);
        vestingSchedule[0x328eb8b84d09ed15753e78833a4a5ebfddda4f9e] = vestingRecords.length;

        /// CFO's vesting schedule
        vestingRecords.push(VestingRecord({ 
            beneficiary: 0x8c0596698832dff65370ca1bd907309aaa644c30,
            amount: uint256(12000) * 10**18,
            start: _start,
            cliff: 1.5 years,
            duration: 2 years,
            tunit: 1 years/12
        }));
        emit NewVestingPeriod(0x8c0596698832dff65370ca1bd907309aaa644c30, uint256(12000) * 10**18, _start, 1.5 years, 2 years, 1 years/12);
        vestingSchedule[0x8c0596698832dff65370ca1bd907309aaa644c30] = vestingRecords.length;

        /// Adviser's vesting schedule
        vestingRecords.push(VestingRecord({ 
            beneficiary: 0xa9b3873db714de4946e6b720469b1971c12605a1,
            amount: uint256(12000) * 10**18,
            start: _start,
            cliff: 1 years/4,
            duration: 1 years,
            tunit: 1 years/12
        }));
        emit NewVestingPeriod(0xa9b3873db714de4946e6b720469b1971c12605a1, uint256(12000) * 10**18, _start, 1 years/4, 1 years, 1 years/12);
        vestingSchedule[0xa9b3873db714de4946e6b720469b1971c12605a1] = vestingRecords.length;

        uint256 vestingTotal;
        for (uint256 i = 0; i < vestingRecords.length; i++) {
            vestingTotal = vestingTotal.add(vestingRecords[i].amount);
        }

        /// Funds would be deducted from the contract creator's balance in the token constructor
        balances[vestingFunds] = vestingTotal;
      

    }

    function vestingFundsAddress() public view ifAuthorized(msg.sender, CUPID) returns (address) {
        return vestingFunds;
    }


    /// @dev The amnount of tokens left in the vesting account
    /// @return uint256
    function totalVestingSupply() public view returns (uint256 vestingBalance) {
        return balances[vestingFunds];
    }


    /// @dev Delete a vesting record if the _beneficary is no longer entitled to the remaining tokens
    /// Only the addresses with the highest authority are allowed to invoke this action
    function revoke(address _beneficiary) public ifAuthorized(msg.sender, APHRODITE) returns (bool success) {

        /// Don't waste gas if there is nothing to do
        require (vestingSchedule[_beneficiary] > 0);

        /// Run the vesting function first to ensure that the _beneficiary gets whatever has already been accrued
        /// and then remove that vesting record
        vest();

        VestingRecord memory vr = vestingRecords[vestingSchedule[_beneficiary] - 1];

        /// Reduce vestingFunds appropriately
        if (vr.amount > 0) {
            balances[vestingFunds] = balances[vestingFunds].sub(vr.amount);
            balances[msg.sender] = balances[msg.sender].add(vr.amount);
            emit Transfer(vestingFunds, msg.sender, vr.amount);
        }

        emit RevokeTokenGrant(_beneficiary, vr.amount);

        vestingRecords[vestingSchedule[_beneficiary] - 1] = vestingRecords[vestingRecords.length - 1];
        vestingSchedule[_beneficiary] = 0;
        vestingRecords.length--;

        return true;

    }


    /// @dev Run the vesting logic. Check all the vesting records and increases allowances by vested amounts
    /// @return boolean for success
    function vest() public ifAuthorized(msg.sender, CUPID) returns (bool success) {

        /// Don't waste gas if there is nothing to do
        require(vestingRecords.length > 0);

        /// If there are no funds left there is nothing to do
        require(balances[vestingFunds] > 0);

        /// Current block timestamp
        uint256 present = now;

        /// Since the number of addresses that need to vest is small, no worrying about block gas limit
        for (uint256 i = 0; i < vestingRecords.length; i++) {

            VestingRecord memory vr = vestingRecords[i];

            if (present < vr.start.add(vr.cliff) || vr.amount == 0) {
                continue;
            }

            /// First we retrieve the current allowance for this beneficiary
            /// Assuming the beneficiary has not spent any tokens it would be the same as amount vested
            uint256 allowed = allowances[vestingFunds][vr.beneficiary];

            /// If allowance is greater than 0, we saved it in allowed
            allowances[vestingFunds][vr.beneficiary] = 0;

            uint256 amount = 0;
            if (present >= vr.start.add(vr.cliff).add(vr.duration)) {
                if (vr.amount > 0) {
                    amount = vr.amount;
                } else {
                    continue;
                }
            } else {
                amount = vr.amount.mul(present.sub(vr.start.add(vr.cliff))/vr.tunit)/(vr.duration/vr.tunit);
            }


            /// Update the amount to the remaining amount and duration to remaining duration

            /// Compute remaining time
            uint256 newDuration = 0;
            if (present < vr.start.add(vr.cliff).add(vr.duration)) {
                newDuration = vr.start.add(vr.cliff).add(vr.duration) - present;
            }

            vestingRecords[i] = VestingRecord({
                beneficiary: vr.beneficiary,
                amount: vr.amount.sub(amount),
                start: present,
                cliff: 0,
                duration: newDuration,
                tunit: vr.tunit
            });
          

            /// After this transaction is mined vr.beneficiary can use transferFrom to spend additional amount of tokens
            allowances[vestingFunds][vr.beneficiary] = allowed.add(amount);

            /// Emit Vesting event, with beneficary address and amount
            emit Vesting(vr.beneficiary, amount);

            /// Since vesting occurs by raising a spending allowance, also emit the Approval event
            emit Approval(vestingFunds, vr.beneficiary, amount);

        }

        return true;
    }

    /// @dev Get the number of current vesting beneficiaries
    function numberVestingRecords() public view ifAuthorized(msg.sender, CUPID) returns (uint256) {
        return vestingRecords.length;
    }

    /// @dev Get a list of vesting beneficiaries
    function returnVestingAddresses() public view ifAuthorized(msg.sender, CUPID) returns (address[]) {

        address[] accounts;

        for (uint256 i = 0; i < vestingRecords.length; i++) {
            accounts.push(vestingRecords[i].beneficiary);
        }

        return accounts;
    }

    function returnVestingRecord(address _beneficiary) public view ifAuthorized(msg.sender, CUPID) returns (

                                               /// The address that would have its allowance set 
                                               address beneficiary,
                 
                                               /// Total amount due beneficiary, if fully vested
                                               uint256 amount,
                 
                                               /// Start of this vesting period
                                               uint256 start,

                                               /// Time needed to pass before any funds get vested, offset from start
                                               uint256 cliff,

                                               /// Total time needed to fully vest
                                               uint256 duration,

                                               /// Unit of time, like 1 month, etc...
                                               uint256 tunit 
                                                                                                              ) {
        /// It has to exist 
        require(vestingSchedule[_beneficiary] > 0);

        VestingRecord memory vr = vestingRecords[vestingSchedule[_beneficiary] - 1];

        beneficiary = vr.beneficiary; 
        amount = vr.amount; 
        start = vr.start; 
        cliff = vr.cliff; 
        duration = vr.duration; 
        tunit = vr.tunit;

    }


    /// @dev Add a vesting record, dynamically after the contract gets deployed
    /// @param _beneficiary Address to receive vested funds. The address that would have its allowance set
    /// @param _amount The amount to be vested. Total amount due beneficiary, if fully vested.
    /// @param _start Start of this vesting period. Starting time or 0 to use "now"
    /// @param _cliff Amount of time to pass before any vesting happens, offset from start
    /// @param _duration Total time from the start to have have vested the entire _amount
    /// @param _tunit How often vesting happens (Unit of time, like 1 month, etc...)
    function addVestingRecord(
        address _beneficiary,
        uint256 _amount,
        uint256 _start,
        uint256 _cliff,
        uint256 _duration,
        uint256 _tunit) public ifAuthorized(msg.sender, APHRODITE) returns (bool) {

        require(_beneficiary != address(0));

        uint256 _actualStart = _start == 0 ? now : _start;

        vestingRecords.push(VestingRecord({
            beneficiary: _beneficiary,
            amount: _amount,
            start: _actualStart,
            duration: _duration,
            cliff: _cliff,
            tunit: _tunit
        }));

        /// Store VestingRecord index in a map for easy access
        vestingSchedule[_beneficiary] = vestingRecords.length;

        /// Add funds to the vesting account
        transfer(vestingFunds, _amount);

        /// Emit Vesting Period event
        emit NewVestingPeriod(_beneficiary, _amount, _actualStart, _cliff, _duration, _tunit);

        return true;
    }
}

