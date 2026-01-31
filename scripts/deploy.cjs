const { ethers } = require("hardhat");

async function main() {
  console.log("--- Deploying CryptoVentures DAO ---");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy the contract
  const DAOGovernance = await ethers.getContractFactory("DAOGovernance");
  const dao = await DAOGovernance.deploy();

  await dao.waitForDeployment();
  const address = await dao.getAddress();

  console.log(`DAOGovernance deployed to: ${address}`);
  console.log("--- Seeding Complete ---");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});