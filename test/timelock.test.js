const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CryptoVentures DAO - Timelock", function () {
  it("Should correctly queue a proposal in the Timelock", async function () {
    const [owner, member, recipient] = await ethers.getSigners();
    const DAO = await ethers.getContractFactory("DAOGovernance");
    const dao = await DAO.deploy();

    await dao.connect(member).deposit({ value: ethers.parseEther("30") });
    // Use type 2 (Operational) for testing
    await dao.connect(member).propose(2, recipient.address, ethers.parseEther("1"), "Fast Track");
    
    await dao.connect(member).castVote(1, 1);
    await ethers.provider.send("hardhat_mine", ["0xC500"]);
    
    // Move to Timelock
    await dao.queue(1);
    
    // State 4 is 'Queued' in many DAOs, but we check if it's queued via the getter
    const state = await dao.getProposalState(1);
    expect(state).to.equal(4); // 4 = Queued
  });
});