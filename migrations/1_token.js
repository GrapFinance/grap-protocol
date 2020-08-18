// ============ Contracts ============

// Token
// deployed first
const GRAPImplementation = artifacts.require("GRAPDelegate");
const GRAPProxy = artifacts.require("GRAPDelegator");

// ============ Main Migration ============

const migration = async (deployer, network, accounts) => {
  await Promise.all([
    deployToken(deployer, network),
  ]);
};

module.exports = migration;

// ============ Deploy Functions ============


async function deployToken(deployer, network) {
  await deployer.deploy(GRAPImplementation);
  if (network != "mainnet") {
    await deployer.deploy(GRAPProxy,
      "GRAP",
      "GRAP",
      18,
      "9000000000000000000000000", // print extra few mil for user
      GRAPImplementation.address,
      "0x"
    );
  } else {
    await deployer.deploy(GRAPProxy,
      "GRAP",
      "GRAP",
      18,
      "2000000000000000000000000",
      GRAPImplementation.address,
      "0x"
    );
  }

}
