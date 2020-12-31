// ============ Contracts ============

// Token
// deployed first
const OLIVImplementation = artifacts.require("OLIVDelegate");
const OLIVProxy = artifacts.require("OLIVDelegator");

// ============ Main Migration ============

const migration = async (deployer, network, accounts) => {
  await Promise.all([
    deployToken(deployer, network),
  ]);
};

module.exports = migration;

// ============ Deploy Functions ============


async function deployToken(deployer, network) {
  await deployer.deploy(OLIVImplementation);
  await deployer.deploy(OLIVProxy,
    "OLIV",
    "OLIV",
    18,
    "2000000000000000000000000",
    OLIVImplementation.address,
    "0x"
  );
}
