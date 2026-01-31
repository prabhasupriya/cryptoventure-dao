// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./VotingPowerCalculator.sol";
import "./Timelock.sol";
import "../treasury/Treasury.sol";
import "../interfaces/IGovernance.sol";

contract DAOGovernance is IGovernance, Timelock, Treasury {
    using VotingPowerCalculator for uint256;

    uint256 public constant MIN_PROPOSAL_STAKE = 5 ether;
    uint256 private _proposalCount;

    struct Thresholds {
        uint256 approvalPct;
        uint256 quorumPct;
        uint256 delay;
    }

    mapping(ProposalType => Thresholds) public typeConfigs;

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        
        typeConfigs[ProposalType.HighConviction] = Thresholds(60, 40, 7 days);
        typeConfigs[ProposalType.Experimental] = Thresholds(50, 25, 3 days);
        typeConfigs[ProposalType.Operational] = Thresholds(50, 15, 1 days);
    }

    /// @notice Calculates the total voting power of a member including delegations
    /// @param memberAddr The address of the DAO member
    /// @return Total voting power (Square Root of Stake + Delegated Power)
    function getVotingPower(address memberAddr) public view override returns (uint256) {
        uint256 stake = members[memberAddr].stake;
        return VotingPowerCalculator.calculatePower(stake) + delegatedPower[memberAddr];
    }

    /// @notice Creates a new proposal for treasury allocation
    /// @param pType The category of the proposal (High-Conviction, Experimental, Operational)
    /// @param recipient The address to receive funds if the proposal passes
    /// @param amount The amount of ETH to be transferred from the treasury
    /// @param description A brief summary of the proposal goal
    /// @return id The unique ID of the newly created proposal
    function propose(
        ProposalType pType, 
        address recipient, 
        uint256 amount, 
        string calldata description
    ) external override returns (uint256) {
        require(getVotingPower(msg.sender) >= VotingPowerCalculator.calculatePower(MIN_PROPOSAL_STAKE), "Stake low");
        
        _proposalCount++;
        uint256 id = _proposalCount;
        
        Proposal storage p = proposals[id];
        p.id = id;
        p.proposer = msg.sender;
        p.recipient = recipient;
        p.amount = amount;
        p.description = description;
        p.proposalType = pType;
        p.startBlock = block.number;
        p.endBlock = block.number + 50400;

        emit ProposalCreated(id, msg.sender, pType, amount);
        return id;
    }

    /// @notice Casts a vote on an active proposal
    /// @param proposalId The ID of the proposal to vote on
    /// @param support 0 for Against, 1 for For, 2 for Abstain
    function castVote(uint256 proposalId, uint8 support) external override {
        require(getProposalState(proposalId) == ProposalState.Active, "Not active");
        Proposal storage p = proposals[proposalId];
        require(!p.hasVoted[msg.sender], "Voted");

        uint256 weight = getVotingPower(msg.sender);
        p.hasVoted[msg.sender] = true;

        if (support == 1) p.votesFor += weight;
        else if (support == 0) p.votesAgainst += weight;
        else p.votesAbstain += weight;

        emit VoteCast(proposalId, msg.sender, support, weight);
    }

    /// @notice Moves a successful proposal into the Timelock queue
    /// @param proposalId The ID of the passed proposal
    function queue(uint256 proposalId) external override {
        require(getProposalState(proposalId) == ProposalState.Succeeded, "Not passed");
        Proposal storage p = proposals[proposalId];
        uint256 delay = typeConfigs[p.proposalType].delay;
        _queue(proposalId, delay);
        emit ProposalQueued(proposalId, block.timestamp + delay);
    }

    /// @notice Executes a queued proposal after the timelock expires
    /// @param proposalId The ID of the proposal to execute
    function execute(uint256 proposalId) external override onlyRole(DEFAULT_ADMIN_ROLE) nonReentrant {
        require(isReady(proposalId), "Timelock");
        Proposal storage p = proposals[proposalId];
        require(!p.executed, "Executed");

        p.executed = true;
        _sendFunds(payable(p.recipient), p.amount);
        emit ProposalExecuted(proposalId);
    }

    /// @notice Returns the current lifecycle state of a proposal
    /// @param proposalId The ID of the proposal
    /// @return Current state (Active, Succeeded, Defeated, etc.)
    function getProposalState(uint256 proposalId) public view override(IGovernance, Timelock) returns (ProposalState) {
        Proposal storage p = proposals[proposalId];
        if (p.executed) return ProposalState.Executed;
        if (timestamps[proposalId] != 0) return ProposalState.Queued;
        if (block.number <= p.endBlock && block.number >= p.startBlock) return ProposalState.Active;

        Thresholds memory config = typeConfigs[p.proposalType];
        uint256 totalVotes = p.votesFor + p.votesAgainst + p.votesAbstain;
        
        if (totalVotes == 0) return ProposalState.Defeated;
        
        if ((p.votesFor * 100) / totalVotes >= config.approvalPct) {
            return ProposalState.Succeeded;
        }
        return ProposalState.Defeated;
    }
}