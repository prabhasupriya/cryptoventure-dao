const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CryptoVentures DAO - Governance", function () {
  async function deployGovernanceFixture() {
    const [owner, member1, member2, recipient] = await ethers.getSigners();
    const DAOGovernance = await ethers.getContractFactory("DAOGovernance");
    const dao = await DAOGovernance.deploy();
    return { dao, owner, member1, member2, recipient };
  }

  it("Should calculate weighted voting power (Whale Defense)", async function () {
    const { dao, member1, member2 } = await deployGovernanceFixture();
    await dao.connect(member1).deposit({ value: ethers.parseEther("100") });
    await dao.connect(member2).deposit({ value: ethers.parseEther("1") });

    const power1 = await dao.getVotingPower(member1.address);
    const power2 = await dao.getVotingPower(member2.address);

    expect(power1).to.equal(10000000000n); 
    expect(power2).to.equal(1000000000n);
  });

  it("Should prevent execution before timelock expires", async function () {
    const { dao, owner, member1, recipient } = await deployGovernanceFixture();
    await dao.connect(member1).deposit({ value: ethers.parseEther("30") }); 
    
    // Using ProposalType.Operational (2) for faster testing
    await dao.connect(member1).propose(2, recipient.address, ethers.parseEther("1"), "Test");
    
    // castVote(id, 1) where 1 is 'For'
    await dao.connect(member1).castVote(1, 1); 
    
    // End voting period (50400 blocks as per your contract)
    await ethers.provider.send("hardhat_mine", ["0xC500"]); 
    
    await dao.queue(1);
    
    // Should revert because delay for Operational is 1 day
    await expect(dao.connect(owner).execute(1)).to.be.revertedWith("Timelock"); 
    
    // Increase time by 1 day
    await ethers.provider.send("evm_increaseTime", [1 * 24 * 60 * 60 + 1]);
    await ethers.provider.send("evm_mine");

    await expect(dao.connect(owner).execute(1)).to.emit(dao, "ProposalExecuted");
  });
});