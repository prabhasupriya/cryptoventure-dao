// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IGovernance {
    enum ProposalType { HighConviction, Experimental, Operational }
    enum ProposalState { Pending, Active, Defeated, Succeeded, Queued, Executed, Canceled }

    struct Proposal {
        uint256 id;
        address proposer;
        ProposalType proposalType;
        address recipient;
        uint256 amount;
        string description;
        uint256 startBlock;
        uint256 endBlock;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 votesAbstain;
        bool executed;
        mapping(address => bool) hasVoted;
    }

    struct Member {
        uint256 stake;
        address delegate;
    }

    event ProposalCreated(uint256 indexed id, address indexed proposer, ProposalType pType, uint256 amount);
    event VoteCast(uint256 indexed id, address indexed voter, uint8 support, uint256 weight);
    event ProposalQueued(uint256 indexed id, uint256 eta);
    event ProposalExecuted(uint256 indexed id);

    function getVotingPower(address member) external view returns (uint256);
    function propose(ProposalType pType, address recipient, uint256 amount, string calldata description) external returns (uint256);
    function castVote(uint256 proposalId, uint8 support) external;
    function queue(uint256 proposalId) external;
    function execute(uint256 proposalId) external;
    function getProposalState(uint256 proposalId) external view returns (ProposalState);
}