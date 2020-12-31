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

describe("rebase_tests", () => {
  let snapshotId;
  let user;
  let new_user;
  // let unlocked_account = "0x0eb4add4ba497357546da7f5d12d39587ca24606";
  let unlocked_account = "0x681148725731f213b0187a3cbef215c291d85a3e";

  beforeAll(async () => {
    const accounts = await oliv.web3.eth.getAccounts();
    oliv.addAccount(accounts[0]);
    user = accounts[0];
    new_user = accounts[1];
    snapshotId = await oliv.testing.snapshot();
  });

  beforeEach(async () => {
    await oliv.testing.resetEVM("0x2");
    let a = await oliv.contracts.ycrv.methods.transfer(user, "2000000000000000000000000").send({
      from: unlocked_account
    });
  });

  describe("rebase", () => {
    test("user has ycrv", async () => {
      let bal0 = await oliv.contracts.ycrv.methods.balanceOf(user).call();
      expect(bal0).toBe("2000000000000000000000000");
    });
    test("create pair", async () => {
      await oliv.contracts.uni_fact.methods.createPair(
        oliv.contracts.ycrv.options.address,
        oliv.contracts.oliv.options.address
      ).send({
        from: user,
        gas: 8000000
      })
    });
    test("mint pair", async () => {
      await oliv.contracts.oliv.methods.approve(
        oliv.contracts.uni_router.options.address,
        -1
      ).send({
        from: user,
        gas: 80000
      });
      await oliv.contracts.ycrv.methods.approve(
        oliv.contracts.uni_router.options.address,
        -1
      ).send({
        from: user,
        gas: 80000
      });

      await oliv.contracts.uni_router.methods.addLiquidity(
        oliv.contracts.oliv.options.address,
        oliv.contracts.ycrv.options.address,
        10000000,
        10000000,
        10000000,
        10000000,
        user,
        1596740361 + 100000000
      ).send({
        from: user,
        gas: 8000000
      });
      let pair = await oliv.contracts.uni_fact.methods.getPair(
        oliv.contracts.oliv.options.address,
        oliv.contracts.ycrv.options.address
      ).call();
      oliv.contracts.uni_pair.options.address = pair;
      let bal = await oliv.contracts.uni_pair.methods.balanceOf(user).call();
      expect(oliv.toBigN(bal).toNumber()).toBeGreaterThan(100)
    });
    test("init_twap", async () => {
      await oliv.contracts.oliv.methods.approve(
        oliv.contracts.uni_router.options.address,
        -1
      ).send({
        from: user,
        gas: 80000
      });
      await oliv.contracts.ycrv.methods.approve(
        oliv.contracts.uni_router.options.address,
        -1
      ).send({
        from: user,
        gas: 80000
      });

      await oliv.contracts.uni_router.methods.addLiquidity(
        oliv.contracts.oliv.options.address,
        oliv.contracts.ycrv.options.address,
        100000,
        100000,
        100000,
        100000,
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 8000000
      });
      let pair = await oliv.contracts.uni_fact.methods.getPair(
        oliv.contracts.oliv.options.address,
        oliv.contracts.ycrv.options.address
      ).call();
      oliv.contracts.uni_pair.options.address = pair;
      let bal = await oliv.contracts.uni_pair.methods.balanceOf(user).call();

      // make a trade to get init values in uniswap
      await oliv.contracts.uni_router.methods.swapExactTokensForTokens(
        1000,
        100,
        [
          oliv.contracts.oliv.options.address,
          oliv.contracts.ycrv.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      await oliv.testing.increaseTime(1000);

      await oliv.contracts.rebaser.methods.init_twap().send({
        from: user,
        gas: 500000
      });



      let init_twap = await oliv.contracts.rebaser.methods.timeOfTWAPInit().call();
      let priceCumulativeLast = await oliv.contracts.rebaser.methods.priceCumulativeLast().call();
      expect(oliv.toBigN(init_twap).toNumber()).toBeGreaterThan(0);
      expect(oliv.toBigN(priceCumulativeLast).toNumber()).toBeGreaterThan(0);
    });
    test("activate rebasing", async () => {
      await oliv.contracts.oliv.methods.approve(
        oliv.contracts.uni_router.options.address,
        -1
      ).send({
        from: user,
        gas: 80000
      });
      await oliv.contracts.ycrv.methods.approve(
        oliv.contracts.uni_router.options.address,
        -1
      ).send({
        from: user,
        gas: 80000
      });

      await oliv.contracts.uni_router.methods.addLiquidity(
        oliv.contracts.oliv.options.address,
        oliv.contracts.ycrv.options.address,
        100000,
        100000,
        100000,
        100000,
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 8000000
      });
      let pair = await oliv.contracts.uni_fact.methods.getPair(
        oliv.contracts.oliv.options.address,
        oliv.contracts.ycrv.options.address
      ).call();
      oliv.contracts.uni_pair.options.address = pair;
      let bal = await oliv.contracts.uni_pair.methods.balanceOf(user).call();

      // make a trade to get init values in uniswap
      await oliv.contracts.uni_router.methods.swapExactTokensForTokens(
        1000,
        100,
        [
          oliv.contracts.oliv.options.address,
          oliv.contracts.ycrv.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      await oliv.testing.increaseTime(1000);

      await oliv.contracts.rebaser.methods.init_twap().send({
        from: user,
        gas: 500000
      });



      let init_twap = await oliv.contracts.rebaser.methods.timeOfTWAPInit().call();
      let priceCumulativeLast = await oliv.contracts.rebaser.methods.priceCumulativeLast().call();
      expect(oliv.toBigN(init_twap).toNumber()).toBeGreaterThan(0);
      expect(oliv.toBigN(priceCumulativeLast).toNumber()).toBeGreaterThan(0);

      await oliv.testing.increaseTime(12 * 60 * 60);

      await oliv.contracts.rebaser.methods.activate_rebasing().send({
        from: user,
        gas: 500000
      });
    });
    test("positive rebasing", async () => {
      await oliv.contracts.oliv.methods.approve(
        oliv.contracts.uni_router.options.address,
        -1
      ).send({
        from: user,
        gas: 80000
      });
      await oliv.contracts.ycrv.methods.approve(
        oliv.contracts.uni_router.options.address,
        -1
      ).send({
        from: user,
        gas: 80000
      });

      await oliv.contracts.uni_router.methods.addLiquidity(
        oliv.contracts.oliv.options.address,
        oliv.contracts.ycrv.options.address,
        "1000000000000000000000000",
        "1000000000000000000000000",
        "1000000000000000000000000",
        "1000000000000000000000000",
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 8000000
      });

      let pair = await oliv.contracts.uni_fact.methods.getPair(
        oliv.contracts.oliv.options.address,
        oliv.contracts.ycrv.options.address
      ).call();

      oliv.contracts.uni_pair.options.address = pair;
      let bal = await oliv.contracts.uni_pair.methods.balanceOf(user).call();

      // make a trade to get init values in uniswap
      await oliv.contracts.uni_router.methods.swapExactTokensForTokens(
        "100000000000",
        100000,
        [
          oliv.contracts.ycrv.options.address,
          oliv.contracts.oliv.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      // trade back for easier calcs later
      await oliv.contracts.uni_router.methods.swapExactTokensForTokens(
        "100000000000",
        100000,
        [
          oliv.contracts.oliv.options.address,
          oliv.contracts.ycrv.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      await oliv.testing.increaseTime(43200);

      await oliv.contracts.rebaser.methods.init_twap().send({
        from: user,
        gas: 500000
      });


      await oliv.contracts.uni_router.methods.swapExactTokensForTokens(
        "100000000000000000000000",
        100000,
        [
          oliv.contracts.ycrv.options.address,
          oliv.contracts.oliv.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      // init twap
      let init_twap = await oliv.contracts.rebaser.methods.timeOfTWAPInit().call();

      // wait 12 hours
      await oliv.testing.increaseTime(12 * 60 * 60);

      // perform trade to change price
      await oliv.contracts.uni_router.methods.swapExactTokensForTokens(
        "10000000000000000000",
        100000,
        [
          oliv.contracts.ycrv.options.address,
          oliv.contracts.oliv.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      // activate rebasing
      await oliv.contracts.rebaser.methods.activate_rebasing().send({
        from: user,
        gas: 500000
      });


      let res_bal = await oliv.contracts.oliv.methods.balanceOf(
          oliv.contracts.reserves.options.address
      ).call();

      expect(res_bal).toBe("0");

      bal = await oliv.contracts.oliv.methods.balanceOf(user).call();

      let a = await oliv.web3.eth.getBlock('latest');

      let offset = await oliv.contracts.rebaser.methods.rebaseWindowOffsetSec().call();
      offset = oliv.toBigN(offset).toNumber();
      let interval = await oliv.contracts.rebaser.methods.minRebaseTimeIntervalSec().call();
      interval = oliv.toBigN(interval).toNumber();

      let i;
      if (a["timestamp"] % interval > offset) {
        i = (interval - (a["timestamp"] % interval)) + offset;
      } else {
        i = offset - (a["timestamp"] % interval);
      }

      await oliv.testing.increaseTime(i);

      let r = await oliv.contracts.uni_pair.methods.getReserves().call();
      let q = await oliv.contracts.uni_router.methods.quote(oliv.toBigN(10**18).toString(), r[0], r[1]).call();
      console.log("quote pre positive rebase", q);

      let b = await oliv.contracts.rebaser.methods.rebase().send({
        from: user,
        gas: 2500000
      });

      //console.log(b.events)
      console.log("positive rebase gas used:", b["gasUsed"]);

      let bal1 = await oliv.contracts.oliv.methods.balanceOf(user).call();

      let resOLIV = await oliv.contracts.oliv.methods.balanceOf(oliv.contracts.reserves.options.address).call();

      let resycrv = await oliv.contracts.ycrv.methods.balanceOf(oliv.contracts.reserves.options.address).call();

      console.log("bal user, bal oliv res, bal res crv", bal1, resOLIV, resycrv);
      r = await oliv.contracts.uni_pair.methods.getReserves().call();
      q = await oliv.contracts.uni_router.methods.quote(oliv.toBigN(10**18).toString(), r[0], r[1]).call();
      console.log("post positive rebase quote", q);

      // new balance > old balance
      expect(oliv.toBigN(bal).toNumber()).toBeLessThan(oliv.toBigN(bal1).toNumber());
      // used full oliv reserves
      expect(oliv.toBigN(resOLIV).toNumber()).toBe(0);
      // increases reserves
      expect(oliv.toBigN(resycrv).toNumber()).toBeGreaterThan(0);


      // not below peg
      expect(oliv.toBigN(q).toNumber()).toBeGreaterThan(oliv.toBigN(10**18).toNumber());
    });
    test("negative rebasing", async () => {
      await oliv.contracts.oliv.methods.approve(
        oliv.contracts.uni_router.options.address,
        -1
      ).send({
        from: user,
        gas: 80000
      });
      await oliv.contracts.ycrv.methods.approve(
        oliv.contracts.uni_router.options.address,
        -1
      ).send({
        from: user,
        gas: 80000
      });

      await oliv.contracts.uni_router.methods.addLiquidity(
        oliv.contracts.oliv.options.address,
        oliv.contracts.ycrv.options.address,
        "1000000000000000000000000",
        "1000000000000000000000000",
        "1000000000000000000000000",
        "1000000000000000000000000",
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 8000000
      });

      let pair = await oliv.contracts.uni_fact.methods.getPair(
        oliv.contracts.oliv.options.address,
        oliv.contracts.ycrv.options.address
      ).call();

      oliv.contracts.uni_pair.options.address = pair;
      let bal = await oliv.contracts.uni_pair.methods.balanceOf(user).call();

      // make a trade to get init values in uniswap
      await oliv.contracts.uni_router.methods.swapExactTokensForTokens(
        "100000000000",
        100000,
        [
          oliv.contracts.ycrv.options.address,
          oliv.contracts.oliv.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      // trade back for easier calcs later
      await oliv.contracts.uni_router.methods.swapExactTokensForTokens(
        "100000000000",
        100000,
        [
          oliv.contracts.oliv.options.address,
          oliv.contracts.ycrv.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      await oliv.testing.increaseTime(43200);

      await oliv.contracts.rebaser.methods.init_twap().send({
        from: user,
        gas: 500000
      });


      await oliv.contracts.uni_router.methods.swapExactTokensForTokens(
        "500000000000000000000000",
        100000,
        [
          oliv.contracts.oliv.options.address,
          oliv.contracts.ycrv.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      // init twap
      let init_twap = await oliv.contracts.rebaser.methods.timeOfTWAPInit().call();

      // wait 12 hours
      await oliv.testing.increaseTime(12 * 60 * 60);

      // perform trade to change price
      await oliv.contracts.uni_router.methods.swapExactTokensForTokens(
        "10000000000000000000",
        100000,
        [
          oliv.contracts.oliv.options.address,
          oliv.contracts.ycrv.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      // activate rebasing
      await oliv.contracts.rebaser.methods.activate_rebasing().send({
        from: user,
        gas: 500000
      });


      bal = await oliv.contracts.oliv.methods.balanceOf(user).call();

      let a = await oliv.web3.eth.getBlock('latest');

      let offset = await oliv.contracts.rebaser.methods.rebaseWindowOffsetSec().call();
      offset = oliv.toBigN(offset).toNumber();
      let interval = await oliv.contracts.rebaser.methods.minRebaseTimeIntervalSec().call();
      interval = oliv.toBigN(interval).toNumber();

      let i;
      if (a["timestamp"] % interval > offset) {
        i = (interval - (a["timestamp"] % interval)) + offset;
      } else {
        i = offset - (a["timestamp"] % interval);
      }

      await oliv.testing.increaseTime(i);

      let r = await oliv.contracts.uni_pair.methods.getReserves().call();
      let q = await oliv.contracts.uni_router.methods.quote(oliv.toBigN(10**18).toString(), r[0], r[1]).call();
      console.log("quote pre negative rebase", q);

      let b = await oliv.contracts.rebaser.methods.rebase().send({
        from: user,
        gas: 2500000
      });

      //console.log(b.events)
      console.log("negative rebase gas used:", b["gasUsed"]);

      let bal1 = await oliv.contracts.oliv.methods.balanceOf(user).call();

      let resOLIV = await oliv.contracts.oliv.methods.balanceOf(oliv.contracts.reserves.options.address).call();

      let resycrv = await oliv.contracts.ycrv.methods.balanceOf(oliv.contracts.reserves.options.address).call();

      // balance decreases
      expect(oliv.toBigN(bal1).toNumber()).toBeLessThan(oliv.toBigN(bal).toNumber());
      // no increases to reserves
      expect(oliv.toBigN(resOLIV).toNumber()).toBe(0);
      expect(oliv.toBigN(resycrv).toNumber()).toBe(0);
    });
    test("no rebasing", async () => {
      await oliv.contracts.oliv.methods.approve(
        oliv.contracts.uni_router.options.address,
        -1
      ).send({
        from: user,
        gas: 80000
      });
      await oliv.contracts.ycrv.methods.approve(
        oliv.contracts.uni_router.options.address,
        -1
      ).send({
        from: user,
        gas: 80000
      });

      await oliv.contracts.uni_router.methods.addLiquidity(
        oliv.contracts.oliv.options.address,
        oliv.contracts.ycrv.options.address,
        "1000000000000000000000000",
        "1000000000000000000000000",
        "1000000000000000000000000",
        "1000000000000000000000000",
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 8000000
      });

      let pair = await oliv.contracts.uni_fact.methods.getPair(
        oliv.contracts.oliv.options.address,
        oliv.contracts.ycrv.options.address
      ).call();

      oliv.contracts.uni_pair.options.address = pair;
      let bal = await oliv.contracts.uni_pair.methods.balanceOf(user).call();

      // make a trade to get init values in uniswap
      await oliv.contracts.uni_router.methods.swapExactTokensForTokens(
        "100000000000",
        100000,
        [
          oliv.contracts.ycrv.options.address,
          oliv.contracts.oliv.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      // trade back for easier calcs later
      await oliv.contracts.uni_router.methods.swapExactTokensForTokens(
        "100000000000",
        100000,
        [
          oliv.contracts.oliv.options.address,
          oliv.contracts.ycrv.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      await oliv.testing.increaseTime(43200);

      await oliv.contracts.rebaser.methods.init_twap().send({
        from: user,
        gas: 500000
      });


      await oliv.contracts.uni_router.methods.swapExactTokensForTokens(
        "10000000000000000000000",
        100000,
        [
          oliv.contracts.oliv.options.address,
          oliv.contracts.ycrv.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      await oliv.contracts.uni_router.methods.swapExactTokensForTokens(
        "10000000000000000000000",
        100000,
        [
          oliv.contracts.ycrv.options.address,
          oliv.contracts.oliv.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      // init twap
      let init_twap = await oliv.contracts.rebaser.methods.timeOfTWAPInit().call();

      // wait 12 hours
      await oliv.testing.increaseTime(12 * 60 * 60);

      // perform trade to change price
      await oliv.contracts.uni_router.methods.swapExactTokensForTokens(
        "10000000000000000000",
        100000,
        [
          oliv.contracts.oliv.options.address,
          oliv.contracts.ycrv.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      await oliv.contracts.uni_router.methods.swapExactTokensForTokens(
        "10000000000000000000",
        100000,
        [
          oliv.contracts.ycrv.options.address,
          oliv.contracts.oliv.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      // activate rebasing
      await oliv.contracts.rebaser.methods.activate_rebasing().send({
        from: user,
        gas: 500000
      });


      bal = await oliv.contracts.oliv.methods.balanceOf(user).call();

      let a = await oliv.web3.eth.getBlock('latest');

      let offset = await oliv.contracts.rebaser.methods.rebaseWindowOffsetSec().call();
      offset = oliv.toBigN(offset).toNumber();
      let interval = await oliv.contracts.rebaser.methods.minRebaseTimeIntervalSec().call();
      interval = oliv.toBigN(interval).toNumber();

      let i;
      if (a["timestamp"] % interval > offset) {
        i = (interval - (a["timestamp"] % interval)) + offset;
      } else {
        i = offset - (a["timestamp"] % interval);
      }

      await oliv.testing.increaseTime(i);

      let r = await oliv.contracts.uni_pair.methods.getReserves().call();
      console.log(r, r[0], r[1]);
      let q = await oliv.contracts.uni_router.methods.quote(oliv.toBigN(10**18).toString(), r[0], r[1]).call();
      console.log("quote pre no rebase", q);
      let b = await oliv.contracts.rebaser.methods.rebase().send({
        from: user,
        gas: 2500000
      });

      console.log("no rebase gas used:", b["gasUsed"]);

      let bal1 = await oliv.contracts.oliv.methods.balanceOf(user).call();

      let resOLIV = await oliv.contracts.oliv.methods.balanceOf(oliv.contracts.reserves.options.address).call();

      let resycrv = await oliv.contracts.ycrv.methods.balanceOf(oliv.contracts.reserves.options.address).call();

      // no change
      expect(oliv.toBigN(bal1).toNumber()).toBe(oliv.toBigN(bal).toNumber());
      // no increases to reserves
      expect(oliv.toBigN(resOLIV).toNumber()).toBe(0);
      expect(oliv.toBigN(resycrv).toNumber()).toBe(0);
      r = await oliv.contracts.uni_pair.methods.getReserves().call();
      q = await oliv.contracts.uni_router.methods.quote(oliv.toBigN(10**18).toString(), r[0], r[1]).call();
      console.log("quote post no rebase", q);
    });
    test("rebasing with OLIV in reserves", async () => {
      await oliv.contracts.oliv.methods.transfer(oliv.contracts.reserves.options.address, oliv.toBigN(60000*10**18).toString()).send({from: user});
      await oliv.contracts.oliv.methods.approve(
        oliv.contracts.uni_router.options.address,
        -1
      ).send({
        from: user,
        gas: 80000
      });
      await oliv.contracts.ycrv.methods.approve(
        oliv.contracts.uni_router.options.address,
        -1
      ).send({
        from: user,
        gas: 80000
      });

      await oliv.contracts.uni_router.methods.addLiquidity(
        oliv.contracts.oliv.options.address,
        oliv.contracts.ycrv.options.address,
        "1000000000000000000000000",
        "1000000000000000000000000",
        "1000000000000000000000000",
        "1000000000000000000000000",
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 8000000
      });

      let pair = await oliv.contracts.uni_fact.methods.getPair(
        oliv.contracts.oliv.options.address,
        oliv.contracts.ycrv.options.address
      ).call();

      oliv.contracts.uni_pair.options.address = pair;
      let bal = await oliv.contracts.uni_pair.methods.balanceOf(user).call();

      // make a trade to get init values in uniswap
      await oliv.contracts.uni_router.methods.swapExactTokensForTokens(
        "100000000000",
        100000,
        [
          oliv.contracts.ycrv.options.address,
          oliv.contracts.oliv.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      // trade back for easier calcs later
      await oliv.contracts.uni_router.methods.swapExactTokensForTokens(
        "100000000000",
        100000,
        [
          oliv.contracts.oliv.options.address,
          oliv.contracts.ycrv.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      await oliv.testing.increaseTime(43200);

      await oliv.contracts.rebaser.methods.init_twap().send({
        from: user,
        gas: 500000
      });


      await oliv.contracts.uni_router.methods.swapExactTokensForTokens(
        "500000000000000000000000",
        100000,
        [
          oliv.contracts.ycrv.options.address,
          oliv.contracts.oliv.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      // init twap
      let init_twap = await oliv.contracts.rebaser.methods.timeOfTWAPInit().call();

      // wait 12 hours
      await oliv.testing.increaseTime(12 * 60 * 60);

      // perform trade to change price
      await oliv.contracts.uni_router.methods.swapExactTokensForTokens(
        "10000000000000000000",
        100000,
        [
          oliv.contracts.ycrv.options.address,
          oliv.contracts.oliv.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      // activate rebasing
      await oliv.contracts.rebaser.methods.activate_rebasing().send({
        from: user,
        gas: 500000
      });


      bal = await oliv.contracts.oliv.methods.balanceOf(user).call();

      let a = await oliv.web3.eth.getBlock('latest');

      let offset = await oliv.contracts.rebaser.methods.rebaseWindowOffsetSec().call();
      offset = oliv.toBigN(offset).toNumber();
      let interval = await oliv.contracts.rebaser.methods.minRebaseTimeIntervalSec().call();
      interval = oliv.toBigN(interval).toNumber();

      let i;
      if (a["timestamp"] % interval > offset) {
        i = (interval - (a["timestamp"] % interval)) + offset;
      } else {
        i = offset - (a["timestamp"] % interval);
      }

      await oliv.testing.increaseTime(i);


      let r = await oliv.contracts.uni_pair.methods.getReserves().call();
      let q = await oliv.contracts.uni_router.methods.quote(oliv.toBigN(10**18).toString(), r[0], r[1]).call();
      console.log("quote pre pos rebase with reserves", q);

      let b = await oliv.contracts.rebaser.methods.rebase().send({
        from: user,
        gas: 2500000
      });
      //console.log(b.events)

      console.log("positive  with reserves gas used:", b["gasUsed"]);

      let bal1 = await oliv.contracts.oliv.methods.balanceOf(user).call();

      let resOLIV = await oliv.contracts.oliv.methods.balanceOf(oliv.contracts.reserves.options.address).call();

      let resycrv = await oliv.contracts.ycrv.methods.balanceOf(oliv.contracts.reserves.options.address).call();

      console.log(bal, bal1, resOLIV, resycrv);
      expect(oliv.toBigN(bal).toNumber()).toBeLessThan(oliv.toBigN(bal1).toNumber());
      expect(oliv.toBigN(resOLIV).toNumber()).toBeGreaterThan(0);
      expect(oliv.toBigN(resycrv).toNumber()).toBeGreaterThan(0);
      r = await oliv.contracts.uni_pair.methods.getReserves().call();
      q = await oliv.contracts.uni_router.methods.quote(oliv.toBigN(10**18).toString(), r[0], r[1]).call();
      console.log("quote post rebase w/ reserves", q);
      expect(oliv.toBigN(q).toNumber()).toBeGreaterThan(oliv.toBigN(10**18).toNumber());
    });
  });

  describe("failing", () => {
    test("unitialized rebasing", async () => {
      await oliv.testing.expectThrow(oliv.contracts.rebaser.methods.activate_rebasing().send({
        from: user,
        gas: 500000
      }), "twap wasnt intitiated, call init_twap()");
    });
    test("no early twap", async () => {
      await oliv.testing.expectThrow(oliv.contracts.rebaser.methods.init_twap().send({
        from: user,
        gas: 500000
      }), "");
    });
    test("too late rebasing", async () => {
      await oliv.contracts.oliv.methods.approve(
        oliv.contracts.uni_router.options.address,
        -1
      ).send({
        from: user,
        gas: 80000
      });
      await oliv.contracts.ycrv.methods.approve(
        oliv.contracts.uni_router.options.address,
        -1
      ).send({
        from: user,
        gas: 80000
      });

      await oliv.contracts.uni_router.methods.addLiquidity(
        oliv.contracts.oliv.options.address,
        oliv.contracts.ycrv.options.address,
        "1000000000000000000000000",
        "1000000000000000000000000",
        "1000000000000000000000000",
        "1000000000000000000000000",
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 8000000
      });

      let pair = await oliv.contracts.uni_fact.methods.getPair(
        oliv.contracts.oliv.options.address,
        oliv.contracts.ycrv.options.address
      ).call();

      oliv.contracts.uni_pair.options.address = pair;
      let bal = await oliv.contracts.uni_pair.methods.balanceOf(user).call();

      // make a trade to get init values in uniswap
      await oliv.contracts.uni_router.methods.swapExactTokensForTokens(
        "100000000000",
        100000,
        [
          oliv.contracts.ycrv.options.address,
          oliv.contracts.oliv.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      // trade back for easier calcs later
      await oliv.contracts.uni_router.methods.swapExactTokensForTokens(
        "100000000000",
        100000,
        [
          oliv.contracts.oliv.options.address,
          oliv.contracts.ycrv.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      await oliv.testing.increaseTime(43200);

      await oliv.contracts.rebaser.methods.init_twap().send({
        from: user,
        gas: 500000
      });


      await oliv.contracts.uni_router.methods.swapExactTokensForTokens(
        "500000000000000000000000",
        100000,
        [
          oliv.contracts.ycrv.options.address,
          oliv.contracts.oliv.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      // init twap
      let init_twap = await oliv.contracts.rebaser.methods.timeOfTWAPInit().call();

      // wait 12 hours
      await oliv.testing.increaseTime(12 * 60 * 60);

      // perform trade to change price
      await oliv.contracts.uni_router.methods.swapExactTokensForTokens(
        "10000000000000000000",
        100000,
        [
          oliv.contracts.ycrv.options.address,
          oliv.contracts.oliv.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      // activate rebasing
      await oliv.contracts.rebaser.methods.activate_rebasing().send({
        from: user,
        gas: 500000
      });


      bal = await oliv.contracts.oliv.methods.balanceOf(user).call();

      let a = await oliv.web3.eth.getBlock('latest');

      let offset = await oliv.contracts.rebaser.methods.rebaseWindowOffsetSec().call();
      offset = oliv.toBigN(offset).toNumber();
      let interval = await oliv.contracts.rebaser.methods.minRebaseTimeIntervalSec().call();
      interval = oliv.toBigN(interval).toNumber();

      let i;
      if (a["timestamp"] % interval > offset) {
        i = (interval - (a["timestamp"] % interval)) + offset;
      } else {
        i = offset - (a["timestamp"] % interval);
      }

      let len = await oliv.contracts.rebaser.methods.rebaseWindowLengthSec().call();

      await oliv.testing.increaseTime(i + oliv.toBigN(len).toNumber()+1);

      let b = await oliv.testing.expectThrow(oliv.contracts.rebaser.methods.rebase().send({
        from: user,
        gas: 2500000
      }), "too late");
    });
    test("too early rebasing", async () => {
      await oliv.contracts.oliv.methods.approve(
        oliv.contracts.uni_router.options.address,
        -1
      ).send({
        from: user,
        gas: 80000
      });
      await oliv.contracts.ycrv.methods.approve(
        oliv.contracts.uni_router.options.address,
        -1
      ).send({
        from: user,
        gas: 80000
      });

      await oliv.contracts.uni_router.methods.addLiquidity(
        oliv.contracts.oliv.options.address,
        oliv.contracts.ycrv.options.address,
        "1000000000000000000000000",
        "1000000000000000000000000",
        "1000000000000000000000000",
        "1000000000000000000000000",
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 8000000
      });

      let pair = await oliv.contracts.uni_fact.methods.getPair(
        oliv.contracts.oliv.options.address,
        oliv.contracts.ycrv.options.address
      ).call();

      oliv.contracts.uni_pair.options.address = pair;
      let bal = await oliv.contracts.uni_pair.methods.balanceOf(user).call();

      // make a trade to get init values in uniswap
      await oliv.contracts.uni_router.methods.swapExactTokensForTokens(
        "100000000000",
        100000,
        [
          oliv.contracts.ycrv.options.address,
          oliv.contracts.oliv.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      // trade back for easier calcs later
      await oliv.contracts.uni_router.methods.swapExactTokensForTokens(
        "100000000000",
        100000,
        [
          oliv.contracts.oliv.options.address,
          oliv.contracts.ycrv.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      await oliv.testing.increaseTime(43200);

      await oliv.contracts.rebaser.methods.init_twap().send({
        from: user,
        gas: 500000
      });


      await oliv.contracts.uni_router.methods.swapExactTokensForTokens(
        "500000000000000000000000",
        100000,
        [
          oliv.contracts.ycrv.options.address,
          oliv.contracts.oliv.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      // init twap
      let init_twap = await oliv.contracts.rebaser.methods.timeOfTWAPInit().call();

      // wait 12 hours
      await oliv.testing.increaseTime(12 * 60 * 60);

      // perform trade to change price
      await oliv.contracts.uni_router.methods.swapExactTokensForTokens(
        "10000000000000000000",
        100000,
        [
          oliv.contracts.ycrv.options.address,
          oliv.contracts.oliv.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      // activate rebasing
      await oliv.contracts.rebaser.methods.activate_rebasing().send({
        from: user,
        gas: 500000
      });

      bal = await oliv.contracts.oliv.methods.balanceOf(user).call();

      let a = await oliv.web3.eth.getBlock('latest');

      let offset = await oliv.contracts.rebaser.methods.rebaseWindowOffsetSec().call();
      offset = oliv.toBigN(offset).toNumber();
      let interval = await oliv.contracts.rebaser.methods.minRebaseTimeIntervalSec().call();
      interval = oliv.toBigN(interval).toNumber();

      let i;
      if (a["timestamp"] % interval > offset) {
        i = (interval - (a["timestamp"] % interval)) + offset;
      } else {
        i = offset - (a["timestamp"] % interval);
      }

      await oliv.testing.increaseTime(i - 1);



      let b = await oliv.testing.expectThrow(oliv.contracts.rebaser.methods.rebase().send({
        from: user,
        gas: 2500000
      }), "too early");
    });
  });
});
