import {
  Yam
} from "../index.js";
import * as Types from "../lib/types.js";
import {
  addressMap
} from "../lib/constants.js";
import {
  decimalToString,
  stringToDecimal
} from "../lib/Helpers.js"


export const oliv = new Yam(
  "http://localhost:8545/",
  // "http://127.0.0.1:9545/",
  "1001",
  true, {
    defaultAccount: "",
    defaultConfirmations: 1,
    autoGasMultiplier: 1.5,
    testing: false,
    defaultGas: "6000000",
    defaultGasPrice: "1000000000000",
    accounts: [],
    ethereumNodeTimeout: 10000
  }
)
const oneEther = 10 ** 18;

describe("post-deployment", () => {
  let snapshotId;
  let user;

  beforeAll(async () => {
    const accounts = await oliv.web3.eth.getAccounts();
    oliv.addAccount(accounts[0]);
    user = accounts[0];
    snapshotId = await oliv.testing.snapshot();
  });

  beforeEach(async () => {
    await oliv.testing.resetEVM("0x2");
  });

  describe("supply ownership", () => {

    test("owner balance", async () => {
      let balance = await oliv.contracts.oliv.methods.balanceOf(user).call();
      expect(balance).toBe(oliv.toBigN(7000000).times(oliv.toBigN(10**18)).toString())
    });

    test("pool balances", async () => {
      let ycrv_balance = await oliv.contracts.oliv.methods.balanceOf(oliv.contracts.ycrv_pool.options.address).call();

      expect(ycrv_balance).toBe(oliv.toBigN(1500000).times(oliv.toBigN(10**18)).times(oliv.toBigN(1)).toString())

      let yfi_balance = await oliv.contracts.oliv.methods.balanceOf(oliv.contracts.yfi_pool.options.address).call();

      expect(yfi_balance).toBe(oliv.toBigN(250000).times(oliv.toBigN(10**18)).times(oliv.toBigN(1)).toString())

      let ampl_balance = await oliv.contracts.oliv.methods.balanceOf(oliv.contracts.ampl_pool.options.address).call();

      expect(ampl_balance).toBe(oliv.toBigN(250000).times(oliv.toBigN(10**18)).times(oliv.toBigN(1)).toString())

      let eth_balance = await oliv.contracts.oliv.methods.balanceOf(oliv.contracts.eth_pool.options.address).call();

      expect(eth_balance).toBe(oliv.toBigN(250000).times(oliv.toBigN(10**18)).times(oliv.toBigN(1)).toString())

      let snx_balance = await oliv.contracts.oliv.methods.balanceOf(oliv.contracts.snx_pool.options.address).call();

      expect(snx_balance).toBe(oliv.toBigN(250000).times(oliv.toBigN(10**18)).times(oliv.toBigN(1)).toString())

      let comp_balance = await oliv.contracts.oliv.methods.balanceOf(oliv.contracts.comp_pool.options.address).call();

      expect(comp_balance).toBe(oliv.toBigN(250000).times(oliv.toBigN(10**18)).times(oliv.toBigN(1)).toString())

      let lend_balance = await oliv.contracts.oliv.methods.balanceOf(oliv.contracts.lend_pool.options.address).call();

      expect(lend_balance).toBe(oliv.toBigN(250000).times(oliv.toBigN(10**18)).times(oliv.toBigN(1)).toString())

      let link_balance = await oliv.contracts.oliv.methods.balanceOf(oliv.contracts.link_pool.options.address).call();

      expect(link_balance).toBe(oliv.toBigN(250000).times(oliv.toBigN(10**18)).times(oliv.toBigN(1)).toString())

      let mkr_balance = await oliv.contracts.oliv.methods.balanceOf(oliv.contracts.mkr_pool.options.address).call();

      expect(mkr_balance).toBe(oliv.toBigN(250000).times(oliv.toBigN(10**18)).times(oliv.toBigN(1)).toString())

    });

    test("total supply", async () => {
      let ts = await oliv.contracts.oliv.methods.totalSupply().call();
      expect(ts).toBe("10500000000000000000000000")
    });

    test("init supply", async () => {
      let init_s = await oliv.contracts.oliv.methods.initSupply().call();
      expect(init_s).toBe("10500000000000000000000000000000")
    });
  });

  describe("contract ownership", () => {

    test("oliv gov", async () => {
      let gov = await oliv.contracts.oliv.methods.gov().call();
      expect(gov).toBe(oliv.contracts.timelock.options.address)
    });

    test("rebaser gov", async () => {
      let gov = await oliv.contracts.rebaser.methods.gov().call();
      expect(gov).toBe(oliv.contracts.timelock.options.address)
    });

    test("reserves gov", async () => {
      let gov = await oliv.contracts.reserves.methods.gov().call();
      expect(gov).toBe(oliv.contracts.timelock.options.address)
    });

    test("timelock admin", async () => {
      let gov = await oliv.contracts.timelock.methods.admin().call();
      expect(gov).toBe(oliv.contracts.gov.options.address)
    });

    test("gov timelock", async () => {
      let tl = await oliv.contracts.gov.methods.timelock().call();
      expect(tl).toBe(oliv.contracts.timelock.options.address)
    });

    test("gov guardian", async () => {
      let grd = await oliv.contracts.gov.methods.guardian().call();
      expect(grd).toBe("0x0000000000000000000000000000000000000000")
    });

    test("pool owner", async () => {
      let owner = await oliv.contracts.eth_pool.methods.owner().call();
      expect(owner).toBe(oliv.contracts.timelock.options.address)
    });

    test("incentives owner", async () => {
      let owner = await oliv.contracts.ycrv_pool.methods.owner().call();
      expect(owner).toBe(oliv.contracts.timelock.options.address)
    });

    test("pool rewarder", async () => {
      let rewarder = await oliv.contracts.eth_pool.methods.rewardDistribution().call();
      expect(rewarder).toBe(oliv.contracts.timelock.options.address)
    });
  });

  describe("timelock delay initiated", () => {
    test("timelock delay initiated", async () => {
      let inited = await oliv.contracts.timelock.methods.admin_initialized().call();
      expect(inited).toBe(true);
    })
  })
})
