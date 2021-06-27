// ============ Contracts ============

// Token
// deployed first
const RUPXImplementation = artifacts.require("RUPXDelegate");
const RUPXProxy = artifacts.require("RUPXDelegator");

// ============ Main Migration ============

const migration = async (deployer, network, accounts) => {
  await Promise.all([
    deployToken(deployer, network),
  ]);
};

module.exports = migration;

// ============ Deploy Functions ============


async function deployToken(deployer, network) {
  await deployer.deploy(RUPXImplementation);
  await deployer.deploy(RUPXProxy,
    "RUPX",
    "RUPX",
    18,
    "100000000000000000000000000",
    RUPXImplementation.address,
    "0x"
  );
}
