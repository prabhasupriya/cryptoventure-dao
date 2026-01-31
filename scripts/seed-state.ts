import { ethers } from "hardhat";

async function main() {
  const [deployer, whale, member1, member2, member3, recipient] = await ethers.getSigners();
  
  // Replace with your deployed address after running deploy.ts
  const DAO_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS"; 
  const dao = await ethers.getContractAt("DAOGovernance", DAO_ADDRESS);

  console.log("--- Starting State Seeding ---");

  // 1. Members Join (Simulating varying stakes)
  console.log("Staking ETH for members...");
  await dao.connect(whale).deposit({ value: ethers.parseEther("500") });   // Large stake
  await dao.connect(member1).deposit({ value: ethers.parseEther("50") });  // Medium stake
  await dao.connect(member2).deposit({ value: ethers.parseEther("10") });  // Small stake
  await dao.connect(member3).deposit({ value: ethers.parseEther("5") });   // Small stake

  // 2. Delegation Simulation
  console.log("Member 3 delegating to Member 2...");
  await dao.connect(member3).delegate(member2.address);

  // 3. Create Sample Proposals
  console.log("Creating proposals...");
  
  // Proposal 0: High Conviction (Strategic)
  await dao.connect(whale).propose(
    0, 
    recipient.address, 
    ethers.parseEther("100"), 
    "Acquire 100 ETH worth of Governance Tokens in Partner Protocol"
  );

  // Proposal 1: Experimental (Grants)
  await dao.connect(member1).propose(
    1, 
    member2.address, 
    ethers.parseEther("5"), 
    "Community Grant for UI/UX Redesign"
  );

  // 4. Simulate Voting Activity
  console.log("Simulating votes...");
  // Whale votes FOR Proposal 0
  await dao.connect(whale).castVote(1, 1); 
  // Member 1 and 2 vote FOR Proposal 1
  await dao.connect(member1).castVote(2, 1);
  await dao.connect(member2).castVote(2, 1);

  console.log("--- Seeding Complete: DAO is now active with 4 members and 2 proposals ---");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});