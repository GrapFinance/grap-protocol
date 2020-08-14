// ============ Contracts ============

// Token
// deployed first
const GRAPImplementation = artifacts.require("GRAPDelegate");
const GRAPProxy = artifacts.require("GRAPDelegator");

// Rs
// deployed second
const GRAPReserves = artifacts.require("GRAPReserves");
const GRAPRebaser = artifacts.require("GRAPRebaser");

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
  await deployer.deploy(GRAPReserves, reserveToken, GRAPProxy.address);
  await deployer.deploy(GRAPRebaser,
      GRAPProxy.address,
      reserveToken,
      uniswap_factory,
      GRAPReserves.address
  );
  let rebase = new web3.eth.Contract(GRAPRebaser.abi, GRAPRebaser.address);

  let pair = await rebase.methods.uniswap_pair().call();
  console.log("GRAPProxy address is " + GRAPProxy.address);
  console.log("Uniswap pair is " + pair);
  let grap = await GRAPProxy.deployed();
  await grap._setRebaser(GRAPRebaser.address);
  let reserves = await GRAPReserves.deployed();
  await reserves._setRebaser(GRAPRebaser.address)
}
