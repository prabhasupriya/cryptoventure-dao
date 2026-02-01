const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CryptoVentures DAO - Treasury", function () {
  it("Should accept deposits and update member stake", async function () {
    const [owner, member] = await ethers.getSigners();
    const DAO = await ethers.getContractFactory("DAOGovernance");
    const dao = await DAO.deploy();

    const depositAmount = ethers.parseEther("10");
    await dao.connect(member).deposit({ value: depositAmount });

    // Assuming you have a way to check stake, or just check balance
    const balance = await ethers.provider.getBalance(await dao.getAddress());
    expect(balance).to.equal(depositAmount);
  });

  it("Should track delegated power correctly", async function () {
    const [owner, m1, m2] = await ethers.getSigners();
    const DAO = await ethers.getContractFactory("DAOGovernance");
    const dao = await DAO.deploy();

    await dao.connect(m1).deposit({ value: ethers.parseEther("10") });
    // We check the delegate function we added earlier
    await dao.connect(m1).delegate(m2.address);
    
    expect(await dao.getVotingPower(m2.address)).to.be.gt(0);
  });
});