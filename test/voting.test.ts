import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("Voting & Delegation", function () {
  async function deployFixture() {
    const [owner, m1, m2] = await ethers.getSigners();
    const DAO = await ethers.getContractFactory("DAOGovernance");
    const dao = await DAO.deploy();
    return { dao, owner, m1, m2 };
  }

  it("Should correctly calculate weighted voting power (Whale Defense)", async function () {
    const { dao, m1 } = await loadFixture(deployFixture);
    await dao.connect(m1).deposit({ value: ethers.parseEther("100") });
    
    const power = await dao.getVotingPower(m1.address);
    // sqrt(100 * 10^18) = 10 * 10^9
    expect(power).to.equal(10000000000n);
  });

  it("Should handle automatic power transfer on delegation", async function () {
    const { dao, m1, m2 } = await loadFixture(deployFixture);
    await dao.connect(m1).deposit({ value: ethers.parseEther("1") });
    
    const m1Power = await dao.getVotingPower(m1.address);
    await dao.connect(m1).delegate(m2.address);
    
    expect(await dao.getVotingPower(m2.address)).to.equal(m1Power);
  });
});