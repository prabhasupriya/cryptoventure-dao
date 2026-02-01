import { expect } from "chai";
import { ethers } from "hardhat";

describe("CryptoVentures DAO - Treasury", function () {
  it("Should accept deposits and update member stake", async function () {
    const [owner, member] = await ethers.getSigners();
    const DAO = await ethers.getContractFactory("DAOGovernance");
    const dao = (await DAO.deploy()) as any;

    const depositAmount = ethers.parseEther("10");
    await dao.connect(member).deposit({ value: depositAmount });

    const balance = await ethers.provider.getBalance(await dao.getAddress());
    expect(balance).to.equal(depositAmount);
  });

  it("Should track delegated power correctly", async function () {
    const [owner, m1, m2] = await ethers.getSigners();
    const DAO = await ethers.getContractFactory("DAOGovernance");
    const dao = (await DAO.deploy()) as any;

    // m1 stakes 25 ETH (Power = 5,000,000,000)
    await dao.connect(m1).deposit({ value: ethers.parseEther("25") });
    
    // m1 delegates to m2
    await dao.connect(m1).delegate(m2.address);
    
    const m2Power = await dao.getVotingPower(m2.address);
    expect(m2Power).to.equal(5000000000n);
  });

  it("Should prevent double-delegation (Edge Case)", async function () {
    const [owner, m1, m2, m3] = await ethers.getSigners();
    const DAO = await ethers.getContractFactory("DAOGovernance");
    const dao = (await DAO.deploy()) as any;

    await dao.connect(m1).deposit({ value: ethers.parseEther("5") });
    await dao.connect(m1).delegate(m2.address);
    
    // Second attempt should fail based on our Treasury.sol logic
    await expect(dao.connect(m1).delegate(m3.address)).to.be.revertedWith("Already delegated");
  });
});