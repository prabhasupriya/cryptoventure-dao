# CryptoVentures DAO Governance System

## 🚀 Project Overview
CryptoVentures DAO is a decentralized investment protocol designed to manage treasury allocations collectively. This system solves common DAO pain points such as decision bottlenecks, whale dominance, and security risks. By implementing **Square Root Weighted Voting** and a **Multi-Tier Proposal Lifecycle**, the protocol ensures fair representation and operational efficiency.



##  Core Features

### 1. Weighted Voting (Whale Dominance Prevention)
To prevent "plutocracy" where a few large holders control all decisions, this system uses a Square Root Voting mechanism.

**Formula:**
$$Voting Power = \sqrt{Stake} \times 10^9$$

**Impact:** A member with 100 ETH has 10x the power of a 1 ETH holder, rather than 100x. This balances influence between large investors and the community.

### 2. Multi-Tier Proposal Strategy
The system categorizes fund allocations into three risk levels, each with its own Quorum, Approval Threshold, and Timelock delay:

| Proposal Type | Fund Allocation | Approval % | Quorum % | Timelock |
| :--- | :--- | :--- | :--- | :--- |
| **High-Conviction** | 60% | 60% | 40% | 7 Days |
| **Experimental** | 30% | 50% | 25% | 3 Days |
| **Operational** | 10% | 50% | 15% | 1 Day |

### 3. Secure Proposal Lifecycle
Every proposal follows a strict state-machine transition:
**Pending** → **Active** → **Succeeded/Defeated** → **Queued** → **Executed**



##  Technical Architecture

* **`DAOGovernance.sol`**: The core logic handling proposal creation, voting, and state management.
* **`VotingPowerCalculator.sol`**: A gas-optimized library implementing the Babylonian method for square roots.
* **`Timelock.sol`**: Enforces a mandatory cooling-off period to prevent flash-governance attacks.
* **`Treasury.sol`**: Manages ETH holdings and handles power delegation.



##  Setup & Testing

### Installation
```bash
npm install
npx hardhat compile
Running Tests
To verify the system integrity, run the specialized test suite:

Bash
npx hardhat test
Verified Test Results:

✅ Governance: Verified square root voting math (Whale Defense).

✅ Execution: Confirmed execution is blocked until the Timelock expires.

✅ Timelock: Successfully queued proposals and verified state transitions.

✅ Delegation: Confirmed voting power can be moved between addresses.

🔒 Security Design Decisions
Role-Based Access Control (RBAC): Powers are separated between Proposers, Voters, and the Admin (Executor).

npx hardhat coverage
having a coverage of 90 percent 
```
### Local Deployment Proof
The system was successfully deployed and seeded on a local Hardhat network.
```bash
npx hardhat run scripts/deploy.ts --network localhost

npx hardhat node


- **DAOGovernance Address:** `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- **Network:** Hardhat Localhost (ChainID: 31337)
- **Status:** Deployed & Seeded (3 Members, 2 Proposals created)

```
* **'Timelock Safeguard'** : All passed proposals must wait in a public queue before execution.

* **Re-entrancy Protection**: All fund transfers utilize nonReentrant modifiers and follow the Checks-Effects-Interactions pattern.

## Demo Video
Watch the full system walkthrough here: https://youtu.be/Ajq8c-aP1t0