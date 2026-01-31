import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("Timelock & Security", function () {
  it("Should allow Guardian to cancel a queued proposal", async function () {
    const [admin, member, recipient] = await ethers.getSigners();
    const DAO = await ethers.getContractFactory("DAOGovernance");
    const dao = await DAO.deploy();

    await dao.connect(member).deposit({ value: ethers.parseEther("10") });
    await dao.connect(member).propose(0, recipient.address, ethers.parseEther("1"), "Malicious Proposal");
    
    // Fast forward to finish voting
    await time.mine(50405);
    await dao.queue(1);
    
    // Guardian (admin) cancels it
    await expect(dao.connect(admin).cancel(1))
      .to.emit(dao, "ProposalCanceled");
  });
});