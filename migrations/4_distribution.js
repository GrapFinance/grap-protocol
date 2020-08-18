var fs = require('fs')

// ============ Contracts ============


// Protocol
// deployed second
const GRAPImplementation = artifacts.require("GRAPDelegate");
const GRAPProxy = artifacts.require("GRAPDelegator");

// deployed third
const GRAPReserves = artifacts.require("GRAPReserves");
const GRAPRebaser = artifacts.require("GRAPRebaser");

const Gov = artifacts.require("GovernorAlpha");
const Timelock = artifacts.require("Timelock");

// deployed fourth
const GRAP_ETHPool = artifacts.require("GRAPETHPool");
const GRAP_YAMPool = artifacts.require("GRAPYAMPool");
const GRAP_YFIPool = artifacts.require("GRAPYFIPool");
const GRAP_LINKPool = artifacts.require("GRAPLINKPool");
const GRAP_MKRPool = artifacts.require("GRAPMKRPool");
const GRAP_LENDPool = artifacts.require("GRAPLENDPool");
const GRAP_COMPPool = artifacts.require("GRAPCOMPPool");
const GRAP_SNXPool = artifacts.require("GRAPSNXPool");
const GRAP_YFIIPool = artifacts.require("GRAPYFIIPool");
const GRAP_CRVPool = artifacts.require("GRAPCRVPool");

// deployed fifth
const GRAPIncentivizer = artifacts.require("GRAPIncentivizer");

// ============ Main Migration ============

const migration = async (deployer, network, accounts) => {
  await Promise.all([
    // deployTestContracts(deployer, network),
    deployDistribution(deployer, network, accounts),
    // deploySecondLayer(deployer, network)
  ]);
}

module.exports = migration;

// ============ Deploy Functions ============


async function deployDistribution(deployer, network, accounts) {
  console.log(network)
  let grap = await GRAPProxy.deployed();
  let yReserves = await GRAPReserves.deployed()
  let yRebaser = await GRAPRebaser.deployed()
  let tl = await Timelock.deployed();
  let gov = await Gov.deployed();
  if (network != "test") {
    await deployer.deploy(GRAP_ETHPool);
    await deployer.deploy(GRAP_YAMPool);
    await deployer.deploy(GRAP_YFIPool);
    await deployer.deploy(GRAPIncentivizer);
    await deployer.deploy(GRAP_LINKPool);
    await deployer.deploy(GRAP_MKRPool);
    await deployer.deploy(GRAP_LENDPool);
    await deployer.deploy(GRAP_COMPPool);
    await deployer.deploy(GRAP_SNXPool);
    await deployer.deploy(GRAP_YFIIPool);
    await deployer.deploy(GRAP_CRVPool);

    let eth_pool = new web3.eth.Contract(GRAP_ETHPool.abi, GRAP_ETHPool.address);
    let yam_pool = new web3.eth.Contract(GRAP_YAMPool.abi, GRAP_YAMPool.address);
    let yfi_pool = new web3.eth.Contract(GRAP_YFIPool.abi, GRAP_YFIPool.address);
    let lend_pool = new web3.eth.Contract(GRAP_LENDPool.abi, GRAP_LENDPool.address);
    let mkr_pool = new web3.eth.Contract(GRAP_MKRPool.abi, GRAP_MKRPool.address);
    let snx_pool = new web3.eth.Contract(GRAP_SNXPool.abi, GRAP_SNXPool.address);
    let comp_pool = new web3.eth.Contract(GRAP_COMPPool.abi, GRAP_COMPPool.address);
    let link_pool = new web3.eth.Contract(GRAP_LINKPool.abi, GRAP_LINKPool.address);
    let yfii_pool = new web3.eth.Contract(GRAP_YFIIPool.abi, GRAP_YFIIPool.address);
    let crv_pool = new web3.eth.Contract(GRAP_CRVPool.abi, GRAP_CRVPool.address);
    let ycrv_pool = new web3.eth.Contract(GRAPIncentivizer.abi, GRAPIncentivizer.address);

    console.log("setting distributor");
    await Promise.all([
        eth_pool.methods.setRewardDistribution("0x00007569643bc1709561ec2E86F385Df3759e5DD").send({from: "0x00007569643bc1709561ec2E86F385Df3759e5DD", gas: 100000}),
        yam_pool.methods.setRewardDistribution("0x00007569643bc1709561ec2E86F385Df3759e5DD").send({from: "0x00007569643bc1709561ec2E86F385Df3759e5DD", gas: 100000}),
        yfi_pool.methods.setRewardDistribution("0x00007569643bc1709561ec2E86F385Df3759e5DD").send({from: "0x00007569643bc1709561ec2E86F385Df3759e5DD", gas: 100000}),
        lend_pool.methods.setRewardDistribution("0x00007569643bc1709561ec2E86F385Df3759e5DD").send({from: "0x00007569643bc1709561ec2E86F385Df3759e5DD", gas: 100000}),
        mkr_pool.methods.setRewardDistribution("0x00007569643bc1709561ec2E86F385Df3759e5DD").send({from: "0x00007569643bc1709561ec2E86F385Df3759e5DD", gas: 100000}),
        snx_pool.methods.setRewardDistribution("0x00007569643bc1709561ec2E86F385Df3759e5DD").send({from: "0x00007569643bc1709561ec2E86F385Df3759e5DD", gas: 100000}),
        comp_pool.methods.setRewardDistribution("0x00007569643bc1709561ec2E86F385Df3759e5DD").send({from: "0x00007569643bc1709561ec2E86F385Df3759e5DD", gas: 100000}),
        link_pool.methods.setRewardDistribution("0x00007569643bc1709561ec2E86F385Df3759e5DD").send({from: "0x00007569643bc1709561ec2E86F385Df3759e5DD", gas: 100000}),
        yfii_pool.methods.setRewardDistribution("0x00007569643bc1709561ec2E86F385Df3759e5DD").send({from: "0x00007569643bc1709561ec2E86F385Df3759e5DD", gas: 100000}),
        crv_pool.methods.setRewardDistribution("0x00007569643bc1709561ec2E86F385Df3759e5DD").send({from: "0x00007569643bc1709561ec2E86F385Df3759e5DD", gas: 100000}),
        ycrv_pool.methods.setRewardDistribution("0x00007569643bc1709561ec2E86F385Df3759e5DD").send({from: "0x00007569643bc1709561ec2E86F385Df3759e5DD", gas: 100000}),
      ]);

    let twenty = web3.utils.toBN(10**3).mul(web3.utils.toBN(10**18)).mul(web3.utils.toBN(200));
    let one_five = web3.utils.toBN(10**3).mul(web3.utils.toBN(10**18)).mul(web3.utils.toBN(1500));

    console.log("transfering and notifying");
    console.log("eth");
    await Promise.all([
      grap.transfer(GRAP_ETHPool.address, twenty.toString()),
      grap.transfer(GRAP_YAMPool.address, twenty.toString()),
      grap.transfer(GRAP_YFIPool.address, twenty.toString()),
      grap.transfer(GRAP_LENDPool.address, twenty.toString()),
      grap.transfer(GRAP_MKRPool.address, twenty.toString()),
      grap.transfer(GRAP_SNXPool.address, twenty.toString()),
      grap.transfer(GRAP_COMPPool.address, twenty.toString()),
      grap.transfer(GRAP_LINKPool.address, twenty.toString()),
      grap.transfer(GRAP_YFIIPool.address, twenty.toString()),
      grap.transfer(GRAP_CRVPool.address, twenty.toString()),
      grap._setIncentivizer(GRAPIncentivizer.address),
    ]);

    await Promise.all([
      eth_pool.methods.notifyRewardAmount(twenty.toString()).send({from:"0x00007569643bc1709561ec2E86F385Df3759e5DD"}),
      yam_pool.methods.notifyRewardAmount(twenty.toString()).send({from:"0x00007569643bc1709561ec2E86F385Df3759e5DD"}),
      yfi_pool.methods.notifyRewardAmount(twenty.toString()).send({from:"0x00007569643bc1709561ec2E86F385Df3759e5DD"}),
      lend_pool.methods.notifyRewardAmount(twenty.toString()).send({from:"0x00007569643bc1709561ec2E86F385Df3759e5DD"}),
      mkr_pool.methods.notifyRewardAmount(twenty.toString()).send({from:"0x00007569643bc1709561ec2E86F385Df3759e5DD"}),
      snx_pool.methods.notifyRewardAmount(twenty.toString()).send({from:"0x00007569643bc1709561ec2E86F385Df3759e5DD"}),
      comp_pool.methods.notifyRewardAmount(twenty.toString()).send({from:"0x00007569643bc1709561ec2E86F385Df3759e5DD"}),
      link_pool.methods.notifyRewardAmount(twenty.toString()).send({from:"0x00007569643bc1709561ec2E86F385Df3759e5DD"}),
      yfii_pool.methods.notifyRewardAmount(twenty.toString()).send({from:"0x00007569643bc1709561ec2E86F385Df3759e5DD"}),
      crv_pool.methods.notifyRewardAmount(twenty.toString()).send({from:"0x00007569643bc1709561ec2E86F385Df3759e5DD"}),

      // incentives is a minter and prepopulates itself.
      ycrv_pool.methods.notifyRewardAmount("0").send({from: "0x00007569643bc1709561ec2E86F385Df3759e5DD", gas: 500000}),
    ]);

    await Promise.all([
      eth_pool.methods.setRewardDistribution(Timelock.address).send({from: "0x00007569643bc1709561ec2E86F385Df3759e5DD", gas: 100000}),
      yam_pool.methods.setRewardDistribution(Timelock.address).send({from: "0x00007569643bc1709561ec2E86F385Df3759e5DD", gas: 100000}),
      yfi_pool.methods.setRewardDistribution(Timelock.address).send({from: "0x00007569643bc1709561ec2E86F385Df3759e5DD", gas: 100000}),
      lend_pool.methods.setRewardDistribution(Timelock.address).send({from: "0x00007569643bc1709561ec2E86F385Df3759e5DD", gas: 100000}),
      mkr_pool.methods.setRewardDistribution(Timelock.address).send({from: "0x00007569643bc1709561ec2E86F385Df3759e5DD", gas: 100000}),
      snx_pool.methods.setRewardDistribution(Timelock.address).send({from: "0x00007569643bc1709561ec2E86F385Df3759e5DD", gas: 100000}),
      comp_pool.methods.setRewardDistribution(Timelock.address).send({from: "0x00007569643bc1709561ec2E86F385Df3759e5DD", gas: 100000}),
      link_pool.methods.setRewardDistribution(Timelock.address).send({from: "0x00007569643bc1709561ec2E86F385Df3759e5DD", gas: 100000}),
      yfii_pool.methods.setRewardDistribution(Timelock.address).send({from: "0x00007569643bc1709561ec2E86F385Df3759e5DD", gas: 100000}),
      crv_pool.methods.setRewardDistribution(Timelock.address).send({from: "0x00007569643bc1709561ec2E86F385Df3759e5DD", gas: 100000}),
      ycrv_pool.methods.setRewardDistribution(Timelock.address).send({from: "0x00007569643bc1709561ec2E86F385Df3759e5DD", gas: 100000}),
    ]);
    await Promise.all([
      eth_pool.methods.transferOwnership(Timelock.address).send({from: "0x00007569643bc1709561ec2E86F385Df3759e5DD", gas: 100000}),
      yam_pool.methods.transferOwnership(Timelock.address).send({from: "0x00007569643bc1709561ec2E86F385Df3759e5DD", gas: 100000}),
      yfi_pool.methods.transferOwnership(Timelock.address).send({from: "0x00007569643bc1709561ec2E86F385Df3759e5DD", gas: 100000}),
      lend_pool.methods.transferOwnership(Timelock.address).send({from: "0x00007569643bc1709561ec2E86F385Df3759e5DD", gas: 100000}),
      mkr_pool.methods.transferOwnership(Timelock.address).send({from: "0x00007569643bc1709561ec2E86F385Df3759e5DD", gas: 100000}),
      snx_pool.methods.transferOwnership(Timelock.address).send({from: "0x00007569643bc1709561ec2E86F385Df3759e5DD", gas: 100000}),
      comp_pool.methods.transferOwnership(Timelock.address).send({from: "0x00007569643bc1709561ec2E86F385Df3759e5DD", gas: 100000}),
      link_pool.methods.transferOwnership(Timelock.address).send({from: "0x00007569643bc1709561ec2E86F385Df3759e5DD", gas: 100000}),
      yfii_pool.methods.transferOwnership(Timelock.address).send({from: "0x00007569643bc1709561ec2E86F385Df3759e5DD", gas: 100000}),
      crv_pool.methods.transferOwnership(Timelock.address).send({from: "0x00007569643bc1709561ec2E86F385Df3759e5DD", gas: 100000}),
      ycrv_pool.methods.transferOwnership(Timelock.address).send({from: "0x00007569643bc1709561ec2E86F385Df3759e5DD", gas: 100000}),
    ]);
  }

  await Promise.all([
    grap._setPendingGov(Timelock.address),
    yReserves._setPendingGov(Timelock.address),
    yRebaser._setPendingGov(Timelock.address),
  ]);

  await Promise.all([
      tl.executeTransaction(
        GRAPProxy.address,
        0,
        "_acceptGov()",
        "0x",
        0
      ),

      tl.executeTransaction(
        GRAPReserves.address,
        0,
        "_acceptGov()",
        "0x",
        0
      ),

      tl.executeTransaction(
        GRAPRebaser.address,
        0,
        "_acceptGov()",
        "0x",
        0
      ),
  ]);
  await tl.setPendingAdmin(Gov.address);
  await gov.__acceptAdmin();
  await gov.__abdicate();
}
