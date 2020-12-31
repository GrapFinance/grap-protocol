// ============ Contracts ============

// Token
// deployed first
const OLIVImplementation = artifacts.require("OLIVDelegate");
const OLIVProxy = artifacts.require("OLIVDelegator");

// Rs
// deployed second
const OLIVReserves = artifacts.require("OLIVReserves");
const OLIVRebaser = artifacts.require("OLIVRebaser");

// ============ Main Migration ============

const migration = async (deployer, network, accounts) => {
  await Promise.all([
    deployRs(deployer, network),
  ]);
};

module.exports = migration;

// ============ Deploy Functions ============


async function deployRs(deployer, network) {
  let reserveToken = "0xdF5e0e81Dff6FAF3A7e52BA697820c5e32D806A8";
  let uniswap_factory = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
  await deployer.deploy(OLIVReserves, reserveToken, OLIVProxy.address);
  await deployer.deploy(OLIVRebaser,
      OLIVProxy.address,
      reserveToken,
      uniswap_factory,
      OLIVReserves.address
  );
  let rebase = new web3.eth.Contract(OLIVRebaser.abi, OLIVRebaser.address);

  let pair = await rebase.methods.uniswap_pair().call();
  console.log("OLIVProxy address is " + OLIVProxy.address);
  console.log("Uniswap pair is " + pair);
  let oliv = await OLIVProxy.deployed();
  await oliv._setRebaser(OLIVRebaser.address);
  let reserves = await OLIVReserves.deployed();
  await reserves._setRebaser(OLIVRebaser.address)
}
