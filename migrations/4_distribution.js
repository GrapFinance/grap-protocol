var fs = require('fs')

// ============ Contracts ============


// Protocol
// deployed second
const OLIVImplementation = artifacts.require("OLIVDelegate");
const OLIVProxy = artifacts.require("OLIVDelegator");

// deployed third
const OLIVReserves = artifacts.require("OLIVReserves");
const OLIVRebaser = artifacts.require("OLIVRebaser");

const Gov = artifacts.require("GovernorAlpha");
const Timelock = artifacts.require("Timelock");

// deployed fourth
const OLIV_ETHPool = artifacts.require("OLIVETHPool");
const OLIV_YAMPool = artifacts.require("OLIVYAMPool");
const OLIV_YFIPool = artifacts.require("OLIVYFIPool");
const OLIV_LINKPool = artifacts.require("OLIVLINKPool");
const OLIV_MKRPool = artifacts.require("OLIVMKRPool");
const OLIV_LENDPool = artifacts.require("OLIVLENDPool");
const OLIV_COMPPool = artifacts.require("OLIVCOMPPool");
const OLIV_SNXPool = artifacts.require("OLIVSNXPool");
const OLIV_YFIIPool = artifacts.require("OLIVYFIIPool");
const OLIV_CRVPool = artifacts.require("OLIVCRVPool");

// deployed fifth
const OLIVIncentivizer = artifacts.require("OLIVIncentivizer");

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
  let oliv = await OLIVProxy.deployed();
  let yReserves = await OLIVReserves.deployed()
  let yRebaser = await OLIVRebaser.deployed()
  let tl = await Timelock.deployed();
  let gov = await Gov.deployed();
  if (network != "test") {
    await deployer.deploy(OLIV_ETHPool);
    await deployer.deploy(OLIV_YAMPool);
    await deployer.deploy(OLIV_YFIPool);
    await deployer.deploy(OLIVIncentivizer);
    await deployer.deploy(OLIV_LINKPool);
    await deployer.deploy(OLIV_MKRPool);
    await deployer.deploy(OLIV_LENDPool);
    await deployer.deploy(OLIV_COMPPool);
    await deployer.deploy(OLIV_SNXPool);
    await deployer.deploy(OLIV_YFIIPool);
    await deployer.deploy(OLIV_CRVPool);

    let eth_pool = new web3.eth.Contract(OLIV_ETHPool.abi, OLIV_ETHPool.address);
    let yam_pool = new web3.eth.Contract(OLIV_YAMPool.abi, OLIV_YAMPool.address);
    let yfi_pool = new web3.eth.Contract(OLIV_YFIPool.abi, OLIV_YFIPool.address);
    let lend_pool = new web3.eth.Contract(OLIV_LENDPool.abi, OLIV_LENDPool.address);
    let mkr_pool = new web3.eth.Contract(OLIV_MKRPool.abi, OLIV_MKRPool.address);
    let snx_pool = new web3.eth.Contract(OLIV_SNXPool.abi, OLIV_SNXPool.address);
    let comp_pool = new web3.eth.Contract(OLIV_COMPPool.abi, OLIV_COMPPool.address);
    let link_pool = new web3.eth.Contract(OLIV_LINKPool.abi, OLIV_LINKPool.address);
    let yfii_pool = new web3.eth.Contract(OLIV_YFIIPool.abi, OLIV_YFIIPool.address);
    let crv_pool = new web3.eth.Contract(OLIV_CRVPool.abi, OLIV_CRVPool.address);
    let ycrv_pool = new web3.eth.Contract(OLIVIncentivizer.abi, OLIVIncentivizer.address);

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
      oliv.transfer(OLIV_ETHPool.address, twenty.toString()),
      oliv.transfer(OLIV_YAMPool.address, twenty.toString()),
      oliv.transfer(OLIV_YFIPool.address, twenty.toString()),
      oliv.transfer(OLIV_LENDPool.address, twenty.toString()),
      oliv.transfer(OLIV_MKRPool.address, twenty.toString()),
      oliv.transfer(OLIV_SNXPool.address, twenty.toString()),
      oliv.transfer(OLIV_COMPPool.address, twenty.toString()),
      oliv.transfer(OLIV_LINKPool.address, twenty.toString()),
      oliv.transfer(OLIV_YFIIPool.address, twenty.toString()),
      oliv.transfer(OLIV_CRVPool.address, twenty.toString()),
      oliv._setIncentivizer(OLIVIncentivizer.address),
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
    oliv._setPendingGov(Timelock.address),
    yReserves._setPendingGov(Timelock.address),
    yRebaser._setPendingGov(Timelock.address),
  ]);

  await Promise.all([
      tl.executeTransaction(
        OLIVProxy.address,
        0,
        "_acceptGov()",
        "0x",
        0
      ),

      tl.executeTransaction(
        OLIVReserves.address,
        0,
        "_acceptGov()",
        "0x",
        0
      ),

      tl.executeTransaction(
        OLIVRebaser.address,
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
