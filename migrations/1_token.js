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
  await deployer.deploy(GRAPProxy,
    "GRAP",
    "GRAP",
    18,
    "2000000000000000000000000",
    GRAPImplementation.address,
    "0x"
  );
}
