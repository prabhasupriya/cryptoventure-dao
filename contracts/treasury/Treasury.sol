// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "../interfaces/IGovernance.sol";
import "../governance/VotingPowerCalculator.sol";

/**
 * @title DAO Treasury
 * @notice Manages member stakes, voting power delegation, and fund distribution.
 * @dev Implements ReentrancyGuard for secure fund releases and AccessControl for permissioning.
 */
abstract contract Treasury is ReentrancyGuard, AccessControl, IGovernance {
    using VotingPowerCalculator for uint256;

    // Mapping to store member staking data
    mapping(address => Member) internal members; 
    
    // Mapping to store voting power received via delegation
    mapping(address => uint256) internal delegatedPower;

    // Tracks if a member has already delegated their power to prevent double-voting
    mapping(address => bool) public hasDelegated;

    event FundsReceived(address indexed from, uint256 amount);
    event FundsReleased(address indexed to, uint256 amount);
    event PowerDelegated(address indexed from, address indexed to, uint256 amount);

    /**
     * @notice Allows users to stake ETH into the DAO to gain voting power.
     * @dev Increases the user's stake in the members mapping.
     */
    function deposit() external payable {
        require(msg.value > 0, "Must stake some ETH");
        members[msg.sender].stake += msg.value;
        emit FundsReceived(msg.sender, msg.value);
    }

    /**
     * @notice Fallback function to accept ETH sent directly to the contract.
     */
    receive() external payable {
        emit FundsReceived(msg.sender, msg.value);
    }

    /**
     * @notice Internal function to release funds to a recipient.
     * @dev Uses low-level call for gas efficiency and compatibility.
     * @param recipient The address receiving the ETH.
     * @param amount The amount of ETH to send.
     */
    function _sendFunds(address payable recipient, uint256 amount) internal {
        require(address(this).balance >= amount, "Treasury: Insufficient balance");
        
        // Checks-Effects-Interactions pattern: state is handled in DAOGovernance
        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Treasury: Transfer failed");
        
        emit FundsReleased(recipient, amount);
    }

    /**
     * @notice Returns the current balance of the treasury.
     * @return Total ETH held in the contract.
     */
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @notice Delegates the caller's square-root voting power to another address.
     * @dev Edge case handling: Prevents multiple delegations from the same user.
     * @param to The address receiving the voting power.
     */
    function delegate(address to) external {
        require(to != msg.sender, "Cannot delegate to self");
        require(!hasDelegated[msg.sender], "Already delegated");
        
        uint256 power = VotingPowerCalculator.calculatePower(members[msg.sender].stake);
        require(power > 0, "No power to delegate");
        
        hasDelegated[msg.sender] = true;
        delegatedPower[to] += power;
        
        emit PowerDelegated(msg.sender, to, power);
    }
}