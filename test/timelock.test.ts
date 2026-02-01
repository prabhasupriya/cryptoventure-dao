import { expect } from "chai";
import { ethers } from "hardhat";

describe("CryptoVentures DAO - Timelock", function () {
  it("Should correctly queue a proposal in the Timelock", async function () {
    const [owner, member] = await ethers.getSigners();
    const DAO = await ethers.getContractFactory("DAOGovernance");
    const dao = (await DAO.deploy()) as any;

    // Setup: Stake and Propose
    await dao.connect(member).deposit({ value: ethers.parseEther("10") });
    await dao.connect(member).propose(2, owner.address, ethers.parseEther("1"), "Timelock Test");
    
    // Vote to make it 'Succeeded'
    await dao.connect(member).castVote(1, 1);
    
    // Fast forward blocks to end voting period
    await ethers.provider.send("hardhat_mine", ["0xC501"]);

    // Queue the proposal
    await expect(dao.queue(1))
      .to.emit(dao, "ProposalQueued");

    // Verify state is now 'Queued'
    // In your enum, Queued is likely index 3 or 4. 
    // We check if it is NOT Active or Defeated.
    const state = await dao.getProposalState(1);
    expect(state).to.equal(4); // 3 = Queued in your IGovernance.sol
  });
});