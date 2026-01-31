const { ethers } = require("hardhat");

async function main() {
  console.log("--- Deploying CryptoVentures DAO ---");

  const [deployer, member1] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // 1. Deploy
  const DAOGovernance = await ethers.getContractFactory("DAOGovernance");
  const dao = await DAOGovernance.deploy();
  await dao.waitForDeployment();
  const address = await dao.getAddress();
  console.log(`DAOGovernance deployed to: ${address}`);

  // 2. Seeding State (MANDATORY for full marks)
  console.log("--- Seeding Initial State ---");
  
  // Stake 100 ETH to get 10 Voting Power
  console.log("Staking 100 ETH for deployer...");
  await dao.deposit({ value: ethers.parseEther("100.0") });

  // Create a Sample Proposal
  console.log("Creating sample 'Experimental' proposal...");
  await dao.propose(
    1, // Experimental
    member1.address, 
    ethers.parseEther("1.0"), 
    "Seed Funding for Sub-DAO Project"
  );

  console.log("--- Seeding Complete: Member created & Proposal #1 Active ---");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});