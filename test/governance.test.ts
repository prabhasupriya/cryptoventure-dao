import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("CryptoVentures DAO", function () {
  async function deployGovernanceFixture() {
    const [owner, member1, member2, recipient] = await ethers.getSigners();
    const DAOGovernance = await ethers.getContractFactory("DAOGovernance");
    const dao = await DAOGovernance.deploy();
    return { dao, owner, member1, member2, recipient };
  }

  it("Should calculate weighted voting power (Whale Defense)", async function () {
    const { dao, member1, member2 } = await loadFixture(deployGovernanceFixture);

    // Member 1 deposits 100 ETH, Member 2 deposits 1 ETH
    await dao.connect(member1).deposit({ value: ethers.parseEther("100") });
    await dao.connect(member2).deposit({ value: ethers.parseEther("1") });

    const power1 = await dao.getVotingPower(member1.address);
    const power2 = await dao.getVotingPower(member2.address);

    // sqrt(100) = 10, sqrt(1) = 1. 
    // Even though M1 has 100x the ETH, they only have 10x the power.
    expect(power1).to.equal(BigInt(Math.sqrt(100 * 10**18)));
    expect(power2).to.equal(BigInt(Math.sqrt(1 * 10**18)));
  });

  it("Should prevent execution before timelock expires", async function () {
    const { dao, member1, recipient } = await loadFixture(deployGovernanceFixture);
    
    await dao.connect(member1).deposit({ value: ethers.parseEther("20") });
    await dao.propose(0, recipient.address, ethers.parseEther("1"), "Test");
    
    // Fast forward blocks for voting
    await time.mine(50402); 
    
    await dao.queue(1);
    
    // Attempt to execute immediately should fail
    await expect(dao.execute(1)).to.be.revertedWith("Timelock active");
    
    // Fast forward 7 days (HighConviction delay)
    await time.increase(7 * 24 * 60 * 60);
    
    await expect(dao.execute(1)).to.emit(dao, "ProposalExecuted");
  });
});