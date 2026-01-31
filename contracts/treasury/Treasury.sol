// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "../interfaces/IGovernance.sol";

// Inherit IGovernance so the Structs are recognized
abstract contract Treasury is ReentrancyGuard, AccessControl, IGovernance {
    // These mappings are used by DAOGovernance for voting power
    mapping(address => Member) internal members; 
    mapping(address => uint256) internal delegatedPower;

    event FundsReceived(address from, uint256 amount);
    event FundsReleased(address to, uint256 amount);

    // Function to allow members to deposit/stake ETH
    function deposit() external payable {
        require(msg.value > 0, "Must stake some ETH");
        members[msg.sender].stake += msg.value;
        emit FundsReceived(msg.sender, msg.value);
    }

    receive() external payable {
        emit FundsReceived(msg.sender, msg.value);
    }

    function _sendFunds(address payable recipient, uint256 amount) internal {
        require(address(this).balance >= amount, "Treasury: Insufficient balance");
        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Treasury: Transfer failed");
        emit FundsReleased(recipient, amount);
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}