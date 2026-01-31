// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ITreasury
 * @notice Interface for the DAO Treasury management system.
 */
interface ITreasury {
    // Events for transparency
    event FundsReceived(address indexed from, uint256 amount);
    event FundsReleased(address indexed to, uint256 amount);

    /**
     * @notice Allows the contract to receive ETH.
     */
    receive() external payable;

    /**
     * @notice Returns the current ETH balance of the treasury.
     */
    function getBalance() external view returns (uint256);

    /**
     * @notice Logic to transfer funds. In a real DAO, this would be 
     * restricted to the Governance contract via the 'onlyOwner' or 'onlyRole' modifier.
     */
    function _sendFunds(address payable recipient, uint256 amount) external;
}