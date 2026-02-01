import { expect } from "chai";
import { ethers } from "hardhat";

describe("CryptoVentures DAO - Voting", function () {
  it("Should handle automatic power transfer on delegation", async function () {
    const [owner, m1, m2] = await ethers.getSigners();
    const DAO = await ethers.getContractFactory("DAOGovernance");
    // CAST TO ANY HERE
    const dao = (await DAO.deploy()) as any; 

    await dao.connect(m1).deposit({ value: ethers.parseEther("1") });
    const initialPower = await dao.getVotingPower(m1.address);
    
    await dao.connect(m1).delegate(m2.address);
    
    const m2Power = await dao.getVotingPower(m2.address);
    expect(m2Power).to.be.at.least(initialPower);
  });
});