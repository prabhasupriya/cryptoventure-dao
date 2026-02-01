import { expect } from "chai";
import { ethers } from "hardhat";

describe("CryptoVentures DAO - Governance", function () {
  async function deployGovernanceFixture() {
    const [owner, member1, member2, recipient] = await ethers.getSigners();
    const DAOGovernance = await ethers.getContractFactory("DAOGovernance");
    // CAST TO ANY HERE
    const dao = (await DAOGovernance.deploy()) as any;
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
    
    await dao.connect(member1).propose(2, recipient.address, ethers.parseEther("1"), "Test");
    await dao.connect(member1).castVote(1, 1); 
    
    // Using a simpler block mine for stability
    await ethers.provider.send("hardhat_mine", ["0xC500"]); 
    
    await dao.queue(1);
    
    await expect(dao.connect(owner).execute(1)).to.be.revertedWith("Timelock"); 
    
    await ethers.provider.send("evm_increaseTime", [86401]); // 1 day + 1 sec
    await ethers.provider.send("evm_mine", []);

    await expect(dao.connect(owner).execute(1)).to.emit(dao, "ProposalExecuted");
  });
});