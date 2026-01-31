# CryptoVentures DAO Governance System

##  Project Overview
CryptoVentures DAO is a decentralized investment protocol designed to manage treasury allocations collectively. This system solves common DAO pain points such as decision bottlenecks, whale dominance, and security risks. By implementing **Square Root Weighted Voting** and a **Multi-Tier Proposal Lifecycle**, the protocol ensures fair representation and operational efficiency.



##  Core Features

### 1. Weighted Voting (Whale Dominance Prevention)
To prevent "plutocracy" where a few large holders control all decisions, this system uses a Square Root Voting mechanism:

**Formula:** $$Voting Power = \sqrt{Stake}$$

**Impact:** A member with 100 ETH has 10x the power of a 1 ETH holder, rather than 100x. This balances influence between whales and the community.



### 2. Multi-Tier Proposal Strategy
The system categorizes fund allocations into three risk levels, each with its own Quorum, Approval Threshold, and Timelock delay:

| Proposal Type | Fund Allocation | Approval % | Quorum % | Timelock |
| :--- | :--- | :--- | :--- | :--- |
| **High-Conviction** | 60% | 60% | 40% | 7 Days |
| **Experimental** | 30% | 50% | 25% | 3 Days |
| **Operational** | 10% | 50% | 15% | 1 Day |

### 3. Secure Proposal Lifecycle
Every proposal follows a strict state-machine transition to ensure security and transparency:
**Pending** → **Active** → **Succeeded/Defeated** → **Queued** → **Executed**





##  Technical Architecture

* **`DAOGovernance.sol`**: The core logic handling proposal creation, voting, and state management.
* **`VotingPowerCalculator.sol`**: A gas-optimized library implementing the Babylonian method for square roots.
* **`Timelock.sol`**: Enforces a mandatory cooling-off period after a vote passes to prevent flash-governance attacks.
* **`Treasury.sol`**: Manages the DAO's ETH holdings and executes approved fund transfers.



##  Setup & Deployment

### Installation
```bash
npm install

npx hardhat compile
Local Deployment
Start a local node:


npx hardhat node
Run the deployment and seeding script:

npx hardhat run scripts/deploy.cjs --network localhost
Live Interaction Proof (Console Results)

```
### Installation
During testing on a local Hardhat network, the following results were verified:

* **'Stake Management'**: Deposited 100 ETH successfully into the Treasury.

* **'Weighted Power'**: Verified that 100 ETH stake resulted in 10.0 Voting Power, confirming the anti-whale mechanism.

* **'Proposal Creation'**: Successfully initialized an Experimental proposal with a 3-day timelock.

* **'State Verification'**: Confirmed Proposal State 1 (Active) immediately after creation.

### Security Design Decisions
* **'Role-Based Access Control (RBAC)'**: Separated powers between PROPOSER, VOTER, EXECUTOR, and GUARDIAN.

* **'Emergency Stop'**: A GUARDIAN role can cancel malicious proposals during the Timelock period.*

* **'Re-entrancy Protection'**: All fund transfers use the nonReentrant modifier and follow the Checks-Effects-Interactions pattern.

### Demo Video
[Link to /https://youtu.be/Ajq8c-aP1t0]