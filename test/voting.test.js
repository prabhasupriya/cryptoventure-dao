const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CryptoVentures DAO - Voting", function () {
  it("Should handle automatic power transfer on delegation", async function () {
    const [owner, m1, m2] = await ethers.getSigners();
    const DAO = await ethers.getContractFactory("DAOGovernance");
    const dao = await DAO.deploy();

    await dao.connect(m1).deposit({ value: ethers.parseEther("1") });
    // Power of 1 ETH = 1 * 10^9
    const initialPower = await dao.getVotingPower(m1.address);
    
    // This will now work because we added 'delegate' to Treasury.sol
    await dao.connect(m1).delegate(m2.address);
    
    const m2Power = await dao.getVotingPower(m2.address);
    expect(m2Power).to.be.at.least(initialPower);
  });
});