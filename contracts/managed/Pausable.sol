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

contract Pausable is AuthorizedList, Authorized {

    event Pause();
    event Unpause();


    /// @dev We deploy in UNpaused state, should it be paused?
    bool public paused = false;

    /// Make sure access control is initialized
    function Pausable() public AuthorizedList() Authorized() { }


    /// @dev modifier to allow actions only when the contract IS NOT paused
    modifier whenNotPaused {
        require(!paused);
        _;
    }


    /// @dev modifier to allow actions only when the contract is paused
    modifier whenPaused {
        require(paused);
        _;
    }


    /// @dev called by an authorized msg.sender to pause, triggers stopped state
    /// Multiple addresses may be authorized to call this method
    function pause() public whenNotPaused ifAuthorized(msg.sender, CUPID) returns (bool) {
        emit Pause();
        paused = true;

        return true;
    }


    /// @dev called by an authorized msg.sender to unpause, returns to normal state
    /// Multiple addresses may be authorized to call this method
    function unpause() public whenPaused ifAuthorized(msg.sender, CUPID) returns (bool) {
        emit Unpause();
        paused = false;
    
        return true;
    }
}

