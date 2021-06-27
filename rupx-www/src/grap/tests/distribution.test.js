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


export const grap = new Yam(
  "http://localhost:8545/",
  // "http://127.0.0.1:9545/",
  "1001",
  true, {
    defaultAccount: "",
    defaultConfirmations: 1,
    autoGasMultiplier: 1.5,
    testing: false,
    defaultGas: "6000000",
    defaultGasPrice: "1",
    accounts: [],
    ethereumNodeTimeout: 10000
  }
)
const oneEther = 10 ** 18;

describe("Distribution", () => {
  let snapshotId;
  let user;
  let user2;
  let ycrv_account = "0x0eb4add4ba497357546da7f5d12d39587ca24606";
  let weth_account = "0xf9e11762d522ea29dd78178c9baf83b7b093aacc";
  let uni_ampl_account = "0x8c545be506a335e24145edd6e01d2754296ff018";
  let comp_account = "0xc89b6f0146642688bb254bf93c28fccf1e182c81";
  let lend_account = "0x3b08aa814bea604917418a9f0907e7fc430e742c";
  let link_account = "0xbe6977e08d4479c0a6777539ae0e8fa27be4e9d6";
  let mkr_account = "0xf37216a8ac034d08b4663108d7532dfcb44583ed";
  let snx_account = "0xb696d629cd0a00560151a434f6b4478ad6c228d7"
  let yfi_account = "0x0eb4add4ba497357546da7f5d12d39587ca24606";
  beforeAll(async () => {
    const accounts = await grap.web3.eth.getAccounts();
    grap.addAccount(accounts[0]);
    user = accounts[0];
    grap.addAccount(accounts[1]);
    user2 = accounts[1];
    snapshotId = await grap.testing.snapshot();
  });

  beforeEach(async () => {
    await grap.testing.resetEVM("0x2");
  });

  describe("pool failures", () => {
    test("cant join pool 1s early", async () => {
      await grap.testing.resetEVM("0x2");
      let a = await grap.web3.eth.getBlock('latest');

      let starttime = await grap.contracts.eth_pool.methods.starttime().call();

      expect(grap.toBigN(a["timestamp"]).toNumber()).toBeLessThan(grap.toBigN(starttime).toNumber());

      //console.log("starttime", a["timestamp"], starttime);
      await grap.contracts.weth.methods.approve(grap.contracts.eth_pool.options.address, -1).send({from: user});

      await grap.testing.expectThrow(
        grap.contracts.eth_pool.methods.stake(
          grap.toBigN(200).times(grap.toBigN(10**18)).toString()
        ).send({
          from: user,
          gas: 300000
        })
      , "not start");


      a = await grap.web3.eth.getBlock('latest');

      starttime = await grap.contracts.ampl_pool.methods.starttime().call();

      expect(grap.toBigN(a["timestamp"]).toNumber()).toBeLessThan(grap.toBigN(starttime).toNumber());

      //console.log("starttime", a["timestamp"], starttime);

      await grap.contracts.UNIAmpl.methods.approve(grap.contracts.ampl_pool.options.address, -1).send({from: user});

      await grap.testing.expectThrow(grap.contracts.ampl_pool.methods.stake(
        "5016536322915819"
      ).send({
        from: user,
        gas: 300000
      }), "not start");
    });

    test("cant join pool 2 early", async () => {

    });

    test("cant withdraw more than deposited", async () => {
      await grap.testing.resetEVM("0x2");
      let a = await grap.web3.eth.getBlock('latest');

      await grap.contracts.weth.methods.transfer(user, grap.toBigN(2000).times(grap.toBigN(10**18)).toString()).send({
        from: weth_account
      });
      await grap.contracts.UNIAmpl.methods.transfer(user, "5000000000000000").send({
        from: uni_ampl_account
      });

      let starttime = await grap.contracts.eth_pool.methods.starttime().call();

      let waittime = starttime - a["timestamp"];
      if (waittime > 0) {
        await grap.testing.increaseTime(waittime);
      }

      await grap.contracts.weth.methods.approve(grap.contracts.eth_pool.options.address, -1).send({from: user});

      await grap.contracts.eth_pool.methods.stake(
        grap.toBigN(200).times(grap.toBigN(10**18)).toString()
      ).send({
        from: user,
        gas: 300000
      });

      await grap.contracts.UNIAmpl.methods.approve(grap.contracts.ampl_pool.options.address, -1).send({from: user});

      await grap.contracts.ampl_pool.methods.stake(
        "5000000000000000"
      ).send({
        from: user,
        gas: 300000
      });

      await grap.testing.expectThrow(grap.contracts.ampl_pool.methods.withdraw(
        "5016536322915820"
      ).send({
        from: user,
        gas: 300000
      }), "");

      await grap.testing.expectThrow(grap.contracts.eth_pool.methods.withdraw(
        grap.toBigN(201).times(grap.toBigN(10**18)).toString()
      ).send({
        from: user,
        gas: 300000
      }), "");

    });
  });

  describe("incentivizer pool", () => {
    test("joining and exiting", async() => {
      await grap.testing.resetEVM("0x2");

      await grap.contracts.ycrv.methods.transfer(user, "12000000000000000000000000").send({
        from: ycrv_account
      });

      await grap.contracts.weth.methods.transfer(user, grap.toBigN(2000).times(grap.toBigN(10**18)).toString()).send({
        from: weth_account
      });

      let a = await grap.web3.eth.getBlock('latest');

      let starttime = await grap.contracts.eth_pool.methods.starttime().call();

      let waittime = starttime - a["timestamp"];
      if (waittime > 0) {
        await grap.testing.increaseTime(waittime);
      } else {
        console.log("late entry", waittime)
      }

      await grap.contracts.weth.methods.approve(grap.contracts.eth_pool.options.address, -1).send({from: user});

      await grap.contracts.eth_pool.methods.stake(
        "2000000000000000000000"
      ).send({
        from: user,
        gas: 300000
      });

      let earned = await grap.contracts.eth_pool.methods.earned(user).call();

      let rr = await grap.contracts.eth_pool.methods.rewardRate().call();

      let rpt = await grap.contracts.eth_pool.methods.rewardPerToken().call();
      //console.log(earned, rr, rpt);
      await grap.testing.increaseTime(86400);
      // await grap.testing.mineBlock();

      earned = await grap.contracts.eth_pool.methods.earned(user).call();

      rpt = await grap.contracts.eth_pool.methods.rewardPerToken().call();

      let ysf = await grap.contracts.grap.methods.grapsScalingFactor().call();

      console.log(earned, ysf, rpt);

      let j = await grap.contracts.eth_pool.methods.getReward().send({
        from: user,
        gas: 300000
      });

      let grap_bal = await grap.contracts.grap.methods.balanceOf(user).call()

      console.log("grap bal", grap_bal)
      // start rebasing
        //console.log("approve grap")
        await grap.contracts.grap.methods.approve(
          grap.contracts.uni_router.options.address,
          -1
        ).send({
          from: user,
          gas: 80000
        });
        //console.log("approve ycrv")
        await grap.contracts.ycrv.methods.approve(
          grap.contracts.uni_router.options.address,
          -1
        ).send({
          from: user,
          gas: 80000
        });

        let ycrv_bal = await grap.contracts.ycrv.methods.balanceOf(user).call()

        console.log("ycrv_bal bal", ycrv_bal)

        console.log("add liq/ create pool")
        await grap.contracts.uni_router.methods.addLiquidity(
          grap.contracts.grap.options.address,
          grap.contracts.ycrv.options.address,
          grap_bal,
          grap_bal,
          grap_bal,
          grap_bal,
          user,
          1596740361 + 10000000
        ).send({
          from: user,
          gas: 8000000
        });

        let pair = await grap.contracts.uni_fact.methods.getPair(
          grap.contracts.grap.options.address,
          grap.contracts.ycrv.options.address
        ).call();

        grap.contracts.uni_pair.options.address = pair;
        let bal = await grap.contracts.uni_pair.methods.balanceOf(user).call();

        await grap.contracts.uni_pair.methods.approve(
          grap.contracts.ycrv_pool.options.address,
          -1
        ).send({
          from: user,
          gas: 300000
        });

        starttime = await grap.contracts.ycrv_pool.methods.starttime().call();

        a = await grap.web3.eth.getBlock('latest');

        waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await grap.testing.increaseTime(waittime);
        } else {
          console.log("late entry, pool 2", waittime)
        }

        await grap.contracts.ycrv_pool.methods.stake(bal).send({from: user, gas: 400000});


        earned = await grap.contracts.ampl_pool.methods.earned(user).call();

        rr = await grap.contracts.ampl_pool.methods.rewardRate().call();

        rpt = await grap.contracts.ampl_pool.methods.rewardPerToken().call();

        console.log(earned, rr, rpt);

        await grap.testing.increaseTime(625000 + 1000);

        earned = await grap.contracts.ampl_pool.methods.earned(user).call();

        rr = await grap.contracts.ampl_pool.methods.rewardRate().call();

        rpt = await grap.contracts.ampl_pool.methods.rewardPerToken().call();

        console.log(earned, rr, rpt);

        await grap.contracts.ycrv_pool.methods.exit().send({from: user, gas: 400000});

        grap_bal = await grap.contracts.grap.methods.balanceOf(user).call();


        expect(grap.toBigN(grap_bal).toNumber()).toBeGreaterThan(0)
        console.log("grap bal after staking in pool 2", grap_bal);
    });
  });

  describe("ampl", () => {
    test("rewards from pool 1s ampl", async () => {
        await grap.testing.resetEVM("0x2");

        await grap.contracts.UNIAmpl.methods.transfer(user, "5000000000000000").send({
          from: uni_ampl_account
        });
        let a = await grap.web3.eth.getBlock('latest');

        let starttime = await grap.contracts.eth_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await grap.testing.increaseTime(waittime);
        } else {
          //console.log("missed entry");
        }

        await grap.contracts.UNIAmpl.methods.approve(grap.contracts.ampl_pool.options.address, -1).send({from: user});

        await grap.contracts.ampl_pool.methods.stake(
          "5000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await grap.contracts.ampl_pool.methods.earned(user).call();

        let rr = await grap.contracts.ampl_pool.methods.rewardRate().call();

        let rpt = await grap.contracts.ampl_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await grap.testing.increaseTime(625000 + 100);
        // await grap.testing.mineBlock();

        earned = await grap.contracts.ampl_pool.methods.earned(user).call();

        rpt = await grap.contracts.ampl_pool.methods.rewardPerToken().call();

        let ysf = await grap.contracts.grap.methods.grapsScalingFactor().call();

        //console.log(earned, ysf, rpt);


        let grap_bal = await grap.contracts.grap.methods.balanceOf(user).call()

        let j = await grap.contracts.ampl_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        // let k = await grap.contracts.eth_pool.methods.exit().send({
        //   from: user,
        //   gas: 300000
        // });
        //
        // //console.log(k.events)

        // weth_bal = await grap.contracts.weth.methods.balanceOf(user).call()

        // expect(weth_bal).toBe(grap.toBigN(2000).times(grap.toBigN(10**18)).toString())

        let ampl_bal = await grap.contracts.UNIAmpl.methods.balanceOf(user).call()

        expect(ampl_bal).toBe("5000000000000000")


        let grap_bal2 = await grap.contracts.grap.methods.balanceOf(user).call()

        let two_fity = grap.toBigN(250).times(grap.toBigN(10**3)).times(grap.toBigN(10**18))
        expect(grap.toBigN(grap_bal2).minus(grap.toBigN(grap_bal)).toString()).toBe(two_fity.times(1).toString())
    });
  });

  describe("eth", () => {
    test("rewards from pool 1s eth", async () => {
        await grap.testing.resetEVM("0x2");

        await grap.contracts.weth.methods.transfer(user, grap.toBigN(2000).times(grap.toBigN(10**18)).toString()).send({
          from: weth_account
        });

        let a = await grap.web3.eth.getBlock('latest');

        let starttime = await grap.contracts.eth_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await grap.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await grap.contracts.weth.methods.approve(grap.contracts.eth_pool.options.address, -1).send({from: user});

        await grap.contracts.eth_pool.methods.stake(
          "2000000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await grap.contracts.eth_pool.methods.earned(user).call();

        let rr = await grap.contracts.eth_pool.methods.rewardRate().call();

        let rpt = await grap.contracts.eth_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await grap.testing.increaseTime(625000 + 100);
        // await grap.testing.mineBlock();

        earned = await grap.contracts.eth_pool.methods.earned(user).call();

        rpt = await grap.contracts.eth_pool.methods.rewardPerToken().call();

        let ysf = await grap.contracts.grap.methods.grapsScalingFactor().call();

        //console.log(earned, ysf, rpt);


        let grap_bal = await grap.contracts.grap.methods.balanceOf(user).call()

        let j = await grap.contracts.eth_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        let weth_bal = await grap.contracts.weth.methods.balanceOf(user).call()

        expect(weth_bal).toBe("2000000000000000000000")


        let grap_bal2 = await grap.contracts.grap.methods.balanceOf(user).call()

        let two_fity = grap.toBigN(250).times(grap.toBigN(10**3)).times(grap.toBigN(10**18))
        expect(grap.toBigN(grap_bal2).minus(grap.toBigN(grap_bal)).toString()).toBe(two_fity.times(1).toString())
    });
    test("rewards from pool 1s eth with rebase", async () => {
        await grap.testing.resetEVM("0x2");

        await grap.contracts.ycrv.methods.transfer(user, "12000000000000000000000000").send({
          from: ycrv_account
        });

        await grap.contracts.weth.methods.transfer(user, grap.toBigN(2000).times(grap.toBigN(10**18)).toString()).send({
          from: weth_account
        });

        let a = await grap.web3.eth.getBlock('latest');

        let starttime = await grap.contracts.eth_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await grap.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await grap.contracts.weth.methods.approve(grap.contracts.eth_pool.options.address, -1).send({from: user});

        await grap.contracts.eth_pool.methods.stake(
          "2000000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await grap.contracts.eth_pool.methods.earned(user).call();

        let rr = await grap.contracts.eth_pool.methods.rewardRate().call();

        let rpt = await grap.contracts.eth_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await grap.testing.increaseTime(125000 + 100);
        // await grap.testing.mineBlock();

        earned = await grap.contracts.eth_pool.methods.earned(user).call();

        rpt = await grap.contracts.eth_pool.methods.rewardPerToken().call();

        let ysf = await grap.contracts.grap.methods.grapsScalingFactor().call();

        //console.log(earned, ysf, rpt);




        let j = await grap.contracts.eth_pool.methods.getReward().send({
          from: user,
          gas: 300000
        });

        let grap_bal = await grap.contracts.grap.methods.balanceOf(user).call()

        console.log("grap bal", grap_bal)
        // start rebasing
          //console.log("approve grap")
          await grap.contracts.grap.methods.approve(
            grap.contracts.uni_router.options.address,
            -1
          ).send({
            from: user,
            gas: 80000
          });
          //console.log("approve ycrv")
          await grap.contracts.ycrv.methods.approve(
            grap.contracts.uni_router.options.address,
            -1
          ).send({
            from: user,
            gas: 80000
          });

          let ycrv_bal = await grap.contracts.ycrv.methods.balanceOf(user).call()

          console.log("ycrv_bal bal", ycrv_bal)

          console.log("add liq/ create pool")
          await grap.contracts.uni_router.methods.addLiquidity(
            grap.contracts.grap.options.address,
            grap.contracts.ycrv.options.address,
            grap_bal,
            grap_bal,
            grap_bal,
            grap_bal,
            user,
            1596740361 + 10000000
          ).send({
            from: user,
            gas: 8000000
          });

          let pair = await grap.contracts.uni_fact.methods.getPair(
            grap.contracts.grap.options.address,
            grap.contracts.ycrv.options.address
          ).call();

          grap.contracts.uni_pair.options.address = pair;
          let bal = await grap.contracts.uni_pair.methods.balanceOf(user).call();

          // make a trade to get init values in uniswap
          //console.log("init swap")
          await grap.contracts.uni_router.methods.swapExactTokensForTokens(
            "100000000000000000000000",
            100000,
            [
              grap.contracts.ycrv.options.address,
              grap.contracts.grap.options.address
            ],
            user,
            1596740361 + 10000000
          ).send({
            from: user,
            gas: 1000000
          });

          // trade back for easier calcs later
          //console.log("swap 0")
          await grap.contracts.uni_router.methods.swapExactTokensForTokens(
            "10000000000000000",
            100000,
            [
              grap.contracts.ycrv.options.address,
              grap.contracts.grap.options.address
            ],
            user,
            1596740361 + 10000000
          ).send({
            from: user,
            gas: 1000000
          });

          await grap.testing.increaseTime(43200);

          //console.log("init twap")
          await grap.contracts.rebaser.methods.init_twap().send({
            from: user,
            gas: 500000
          });

          //console.log("first swap")
          await grap.contracts.uni_router.methods.swapExactTokensForTokens(
            "1000000000000000000000",
            100000,
            [
              grap.contracts.ycrv.options.address,
              grap.contracts.grap.options.address
            ],
            user,
            1596740361 + 10000000
          ).send({
            from: user,
            gas: 1000000
          });

          // init twap
          let init_twap = await grap.contracts.rebaser.methods.timeOfTWAPInit().call();

          // wait 12 hours
          await grap.testing.increaseTime(12 * 60 * 60);

          // perform trade to change price
          //console.log("second swap")
          await grap.contracts.uni_router.methods.swapExactTokensForTokens(
            "10000000000000000000",
            100000,
            [
              grap.contracts.ycrv.options.address,
              grap.contracts.grap.options.address
            ],
            user,
            1596740361 + 10000000
          ).send({
            from: user,
            gas: 1000000
          });

          // activate rebasing
          await grap.contracts.rebaser.methods.activate_rebasing().send({
            from: user,
            gas: 500000
          });


          bal = await grap.contracts.grap.methods.balanceOf(user).call();

          a = await grap.web3.eth.getBlock('latest');

          let offset = await grap.contracts.rebaser.methods.rebaseWindowOffsetSec().call();
          offset = grap.toBigN(offset).toNumber();
          let interval = await grap.contracts.rebaser.methods.minRebaseTimeIntervalSec().call();
          interval = grap.toBigN(interval).toNumber();

          let i;
          if (a["timestamp"] % interval > offset) {
            i = (interval - (a["timestamp"] % interval)) + offset;
          } else {
            i = offset - (a["timestamp"] % interval);
          }

          await grap.testing.increaseTime(i);

          let r = await grap.contracts.uni_pair.methods.getReserves().call();
          let q = await grap.contracts.uni_router.methods.quote(grap.toBigN(10**18).toString(), r[0], r[1]).call();
          console.log("quote pre positive rebase", q);

          let b = await grap.contracts.rebaser.methods.rebase().send({
            from: user,
            gas: 2500000
          });

          let bal1 = await grap.contracts.grap.methods.balanceOf(user).call();

          let resGRAP = await grap.contracts.grap.methods.balanceOf(grap.contracts.reserves.options.address).call();

          let resycrv = await grap.contracts.ycrv.methods.balanceOf(grap.contracts.reserves.options.address).call();

          // new balance > old balance
          expect(grap.toBigN(bal).toNumber()).toBeLessThan(grap.toBigN(bal1).toNumber());
          // increases reserves
          expect(grap.toBigN(resycrv).toNumber()).toBeGreaterThan(0);

          r = await grap.contracts.uni_pair.methods.getReserves().call();
          q = await grap.contracts.uni_router.methods.quote(grap.toBigN(10**18).toString(), r[0], r[1]).call();
          console.log("quote", q);
          // not below peg
          expect(grap.toBigN(q).toNumber()).toBeGreaterThan(grap.toBigN(10**18).toNumber());


        await grap.testing.increaseTime(525000 + 100);


        j = await grap.contracts.eth_pool.methods.exit().send({
          from: user,
          gas: 300000
        });
        //console.log(j.events)

        let weth_bal = await grap.contracts.weth.methods.balanceOf(user).call()

        expect(weth_bal).toBe("2000000000000000000000")


        let grap_bal2 = await grap.contracts.grap.methods.balanceOf(user).call()

        let two_fity = grap.toBigN(250).times(grap.toBigN(10**3)).times(grap.toBigN(10**18))
        expect(
          grap.toBigN(grap_bal2).minus(grap.toBigN(grap_bal)).toNumber()
        ).toBeGreaterThan(two_fity.toNumber())
    });
    test("rewards from pool 1s eth with negative rebase", async () => {
        await grap.testing.resetEVM("0x2");

        await grap.contracts.ycrv.methods.transfer(user, "12000000000000000000000000").send({
          from: ycrv_account
        });

        await grap.contracts.weth.methods.transfer(user, grap.toBigN(2000).times(grap.toBigN(10**18)).toString()).send({
          from: weth_account
        });

        let a = await grap.web3.eth.getBlock('latest');

        let starttime = await grap.contracts.eth_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await grap.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await grap.contracts.weth.methods.approve(grap.contracts.eth_pool.options.address, -1).send({from: user});

        await grap.contracts.eth_pool.methods.stake(
          "2000000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await grap.contracts.eth_pool.methods.earned(user).call();

        let rr = await grap.contracts.eth_pool.methods.rewardRate().call();

        let rpt = await grap.contracts.eth_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await grap.testing.increaseTime(125000 + 100);
        // await grap.testing.mineBlock();

        earned = await grap.contracts.eth_pool.methods.earned(user).call();

        rpt = await grap.contracts.eth_pool.methods.rewardPerToken().call();

        let ysf = await grap.contracts.grap.methods.grapsScalingFactor().call();

        //console.log(earned, ysf, rpt);




        let j = await grap.contracts.eth_pool.methods.getReward().send({
          from: user,
          gas: 300000
        });

        let grap_bal = await grap.contracts.grap.methods.balanceOf(user).call()

        console.log("grap bal", grap_bal)
        // start rebasing
          //console.log("approve grap")
          await grap.contracts.grap.methods.approve(
            grap.contracts.uni_router.options.address,
            -1
          ).send({
            from: user,
            gas: 80000
          });
          //console.log("approve ycrv")
          await grap.contracts.ycrv.methods.approve(
            grap.contracts.uni_router.options.address,
            -1
          ).send({
            from: user,
            gas: 80000
          });

          let ycrv_bal = await grap.contracts.ycrv.methods.balanceOf(user).call()

          console.log("ycrv_bal bal", ycrv_bal)

          grap_bal = grap.toBigN(grap_bal);
          console.log("add liq/ create pool")
          await grap.contracts.uni_router.methods.addLiquidity(
            grap.contracts.grap.options.address,
            grap.contracts.ycrv.options.address,
            grap_bal.times(.1).toString(),
            grap_bal.times(.1).toString(),
            grap_bal.times(.1).toString(),
            grap_bal.times(.1).toString(),
            user,
            1596740361 + 10000000
          ).send({
            from: user,
            gas: 8000000
          });

          let pair = await grap.contracts.uni_fact.methods.getPair(
            grap.contracts.grap.options.address,
            grap.contracts.ycrv.options.address
          ).call();

          grap.contracts.uni_pair.options.address = pair;
          let bal = await grap.contracts.uni_pair.methods.balanceOf(user).call();

          // make a trade to get init values in uniswap
          //console.log("init swap")
          await grap.contracts.uni_router.methods.swapExactTokensForTokens(
            "1000000000000000000000",
            100000,
            [
              grap.contracts.grap.options.address,
              grap.contracts.ycrv.options.address
            ],
            user,
            1596740361 + 10000000
          ).send({
            from: user,
            gas: 1000000
          });

          // trade back for easier calcs later
          //console.log("swap 0")
          await grap.contracts.uni_router.methods.swapExactTokensForTokens(
            "100000000000000",
            100000,
            [
              grap.contracts.grap.options.address,
              grap.contracts.ycrv.options.address
            ],
            user,
            1596740361 + 10000000
          ).send({
            from: user,
            gas: 1000000
          });

          await grap.testing.increaseTime(43200);

          //console.log("init twap")
          await grap.contracts.rebaser.methods.init_twap().send({
            from: user,
            gas: 500000
          });

          //console.log("first swap")
          await grap.contracts.uni_router.methods.swapExactTokensForTokens(
            "100000000000000",
            100000,
            [
              grap.contracts.grap.options.address,
              grap.contracts.ycrv.options.address
            ],
            user,
            1596740361 + 10000000
          ).send({
            from: user,
            gas: 1000000
          });

          // init twap
          let init_twap = await grap.contracts.rebaser.methods.timeOfTWAPInit().call();

          // wait 12 hours
          await grap.testing.increaseTime(12 * 60 * 60);

          // perform trade to change price
          //console.log("second swap")
          await grap.contracts.uni_router.methods.swapExactTokensForTokens(
            "1000000000000000000",
            100000,
            [
              grap.contracts.grap.options.address,
              grap.contracts.ycrv.options.address
            ],
            user,
            1596740361 + 10000000
          ).send({
            from: user,
            gas: 1000000
          });

          // activate rebasing
          await grap.contracts.rebaser.methods.activate_rebasing().send({
            from: user,
            gas: 500000
          });


          bal = await grap.contracts.grap.methods.balanceOf(user).call();

          a = await grap.web3.eth.getBlock('latest');

          let offset = await grap.contracts.rebaser.methods.rebaseWindowOffsetSec().call();
          offset = grap.toBigN(offset).toNumber();
          let interval = await grap.contracts.rebaser.methods.minRebaseTimeIntervalSec().call();
          interval = grap.toBigN(interval).toNumber();

          let i;
          if (a["timestamp"] % interval > offset) {
            i = (interval - (a["timestamp"] % interval)) + offset;
          } else {
            i = offset - (a["timestamp"] % interval);
          }

          await grap.testing.increaseTime(i);

          let r = await grap.contracts.uni_pair.methods.getReserves().call();
          let q = await grap.contracts.uni_router.methods.quote(grap.toBigN(10**18).toString(), r[0], r[1]).call();
          console.log("quote pre positive rebase", q);

          let b = await grap.contracts.rebaser.methods.rebase().send({
            from: user,
            gas: 2500000
          });

          let bal1 = await grap.contracts.grap.methods.balanceOf(user).call();

          let resGRAP = await grap.contracts.grap.methods.balanceOf(grap.contracts.reserves.options.address).call();

          let resycrv = await grap.contracts.ycrv.methods.balanceOf(grap.contracts.reserves.options.address).call();

          expect(grap.toBigN(bal1).toNumber()).toBeLessThan(grap.toBigN(bal).toNumber());
          expect(grap.toBigN(resycrv).toNumber()).toBe(0);

          r = await grap.contracts.uni_pair.methods.getReserves().call();
          q = await grap.contracts.uni_router.methods.quote(grap.toBigN(10**18).toString(), r[0], r[1]).call();
          console.log("quote", q);
          // not below peg
          expect(grap.toBigN(q).toNumber()).toBeLessThan(grap.toBigN(10**18).toNumber());


        await grap.testing.increaseTime(525000 + 100);


        j = await grap.contracts.eth_pool.methods.exit().send({
          from: user,
          gas: 300000
        });
        //console.log(j.events)

        let weth_bal = await grap.contracts.weth.methods.balanceOf(user).call()

        expect(weth_bal).toBe("2000000000000000000000")


        let grap_bal2 = await grap.contracts.grap.methods.balanceOf(user).call()

        let two_fity = grap.toBigN(250).times(grap.toBigN(10**3)).times(grap.toBigN(10**18))
        expect(
          grap.toBigN(grap_bal2).minus(grap.toBigN(grap_bal)).toNumber()
        ).toBeLessThan(two_fity.toNumber())
    });
  });

  describe("yfi", () => {
    test("rewards from pool 1s yfi", async () => {
        await grap.testing.resetEVM("0x2");
        await grap.contracts.yfi.methods.transfer(user, "500000000000000000000").send({
          from: yfi_account
        });

        let a = await grap.web3.eth.getBlock('latest');

        let starttime = await grap.contracts.yfi_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await grap.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await grap.contracts.yfi.methods.approve(grap.contracts.yfi_pool.options.address, -1).send({from: user});

        await grap.contracts.yfi_pool.methods.stake(
          "500000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await grap.contracts.yfi_pool.methods.earned(user).call();

        let rr = await grap.contracts.yfi_pool.methods.rewardRate().call();

        let rpt = await grap.contracts.yfi_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await grap.testing.increaseTime(625000 + 100);
        // await grap.testing.mineBlock();

        earned = await grap.contracts.yfi_pool.methods.earned(user).call();

        rpt = await grap.contracts.yfi_pool.methods.rewardPerToken().call();

        let ysf = await grap.contracts.grap.methods.grapsScalingFactor().call();

        //console.log(earned, ysf, rpt);


        let grap_bal = await grap.contracts.grap.methods.balanceOf(user).call()

        let j = await grap.contracts.yfi_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        let weth_bal = await grap.contracts.yfi.methods.balanceOf(user).call()

        expect(weth_bal).toBe("500000000000000000000")


        let grap_bal2 = await grap.contracts.grap.methods.balanceOf(user).call()

        let two_fity = grap.toBigN(250).times(grap.toBigN(10**3)).times(grap.toBigN(10**18))
        expect(grap.toBigN(grap_bal2).minus(grap.toBigN(grap_bal)).toString()).toBe(two_fity.times(1).toString())
    });
  });

  describe("comp", () => {
    test("rewards from pool 1s comp", async () => {
        await grap.testing.resetEVM("0x2");
        await grap.contracts.comp.methods.transfer(user, "50000000000000000000000").send({
          from: comp_account
        });

        let a = await grap.web3.eth.getBlock('latest');

        let starttime = await grap.contracts.comp_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await grap.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await grap.contracts.comp.methods.approve(grap.contracts.comp_pool.options.address, -1).send({from: user});

        await grap.contracts.comp_pool.methods.stake(
          "50000000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await grap.contracts.comp_pool.methods.earned(user).call();

        let rr = await grap.contracts.comp_pool.methods.rewardRate().call();

        let rpt = await grap.contracts.comp_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await grap.testing.increaseTime(625000 + 100);
        // await grap.testing.mineBlock();

        earned = await grap.contracts.comp_pool.methods.earned(user).call();

        rpt = await grap.contracts.comp_pool.methods.rewardPerToken().call();

        let ysf = await grap.contracts.grap.methods.grapsScalingFactor().call();

        //console.log(earned, ysf, rpt);


        let grap_bal = await grap.contracts.grap.methods.balanceOf(user).call()

        let j = await grap.contracts.comp_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        let weth_bal = await grap.contracts.comp.methods.balanceOf(user).call()

        expect(weth_bal).toBe("50000000000000000000000")


        let grap_bal2 = await grap.contracts.grap.methods.balanceOf(user).call()

        let two_fity = grap.toBigN(250).times(grap.toBigN(10**3)).times(grap.toBigN(10**18))
        expect(grap.toBigN(grap_bal2).minus(grap.toBigN(grap_bal)).toString()).toBe(two_fity.times(1).toString())
    });
  });

  describe("lend", () => {
    test("rewards from pool 1s lend", async () => {
        await grap.testing.resetEVM("0x2");
        await grap.web3.eth.sendTransaction({from: user2, to: lend_account, value : grap.toBigN(100000*10**18).toString()});

        await grap.contracts.lend.methods.transfer(user, "10000000000000000000000000").send({
          from: lend_account
        });

        let a = await grap.web3.eth.getBlock('latest');

        let starttime = await grap.contracts.lend_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await grap.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await grap.contracts.lend.methods.approve(grap.contracts.lend_pool.options.address, -1).send({from: user});

        await grap.contracts.lend_pool.methods.stake(
          "10000000000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await grap.contracts.lend_pool.methods.earned(user).call();

        let rr = await grap.contracts.lend_pool.methods.rewardRate().call();

        let rpt = await grap.contracts.lend_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await grap.testing.increaseTime(625000 + 100);
        // await grap.testing.mineBlock();

        earned = await grap.contracts.lend_pool.methods.earned(user).call();

        rpt = await grap.contracts.lend_pool.methods.rewardPerToken().call();

        let ysf = await grap.contracts.grap.methods.grapsScalingFactor().call();

        //console.log(earned, ysf, rpt);


        let grap_bal = await grap.contracts.grap.methods.balanceOf(user).call()

        let j = await grap.contracts.lend_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        let weth_bal = await grap.contracts.lend.methods.balanceOf(user).call()

        expect(weth_bal).toBe("10000000000000000000000000")


        let grap_bal2 = await grap.contracts.grap.methods.balanceOf(user).call()

        let two_fity = grap.toBigN(250).times(grap.toBigN(10**3)).times(grap.toBigN(10**18))
        expect(grap.toBigN(grap_bal2).minus(grap.toBigN(grap_bal)).toString()).toBe(two_fity.times(1).toString())
    });
  });

  describe("link", () => {
    test("rewards from pool 1s link", async () => {
        await grap.testing.resetEVM("0x2");

        await grap.web3.eth.sendTransaction({from: user2, to: link_account, value : grap.toBigN(100000*10**18).toString()});

        await grap.contracts.link.methods.transfer(user, "10000000000000000000000000").send({
          from: link_account
        });

        let a = await grap.web3.eth.getBlock('latest');

        let starttime = await grap.contracts.link_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await grap.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await grap.contracts.link.methods.approve(grap.contracts.link_pool.options.address, -1).send({from: user});

        await grap.contracts.link_pool.methods.stake(
          "10000000000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await grap.contracts.link_pool.methods.earned(user).call();

        let rr = await grap.contracts.link_pool.methods.rewardRate().call();

        let rpt = await grap.contracts.link_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await grap.testing.increaseTime(625000 + 100);
        // await grap.testing.mineBlock();

        earned = await grap.contracts.link_pool.methods.earned(user).call();

        rpt = await grap.contracts.link_pool.methods.rewardPerToken().call();

        let ysf = await grap.contracts.grap.methods.grapsScalingFactor().call();

        //console.log(earned, ysf, rpt);


        let grap_bal = await grap.contracts.grap.methods.balanceOf(user).call()

        let j = await grap.contracts.link_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        let weth_bal = await grap.contracts.link.methods.balanceOf(user).call()

        expect(weth_bal).toBe("10000000000000000000000000")


        let grap_bal2 = await grap.contracts.grap.methods.balanceOf(user).call()

        let two_fity = grap.toBigN(250).times(grap.toBigN(10**3)).times(grap.toBigN(10**18))
        expect(grap.toBigN(grap_bal2).minus(grap.toBigN(grap_bal)).toString()).toBe(two_fity.times(1).toString())
    });
  });

  describe("mkr", () => {
    test("rewards from pool 1s mkr", async () => {
        await grap.testing.resetEVM("0x2");
        await grap.web3.eth.sendTransaction({from: user2, to: mkr_account, value : grap.toBigN(100000*10**18).toString()});
        let eth_bal = await grap.web3.eth.getBalance(mkr_account);

        await grap.contracts.mkr.methods.transfer(user, "10000000000000000000000").send({
          from: mkr_account
        });

        let a = await grap.web3.eth.getBlock('latest');

        let starttime = await grap.contracts.mkr_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await grap.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await grap.contracts.mkr.methods.approve(grap.contracts.mkr_pool.options.address, -1).send({from: user});

        await grap.contracts.mkr_pool.methods.stake(
          "10000000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await grap.contracts.mkr_pool.methods.earned(user).call();

        let rr = await grap.contracts.mkr_pool.methods.rewardRate().call();

        let rpt = await grap.contracts.mkr_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await grap.testing.increaseTime(625000 + 100);
        // await grap.testing.mineBlock();

        earned = await grap.contracts.mkr_pool.methods.earned(user).call();

        rpt = await grap.contracts.mkr_pool.methods.rewardPerToken().call();

        let ysf = await grap.contracts.grap.methods.grapsScalingFactor().call();

        //console.log(earned, ysf, rpt);


        let grap_bal = await grap.contracts.grap.methods.balanceOf(user).call()

        let j = await grap.contracts.mkr_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        let weth_bal = await grap.contracts.mkr.methods.balanceOf(user).call()

        expect(weth_bal).toBe("10000000000000000000000")


        let grap_bal2 = await grap.contracts.grap.methods.balanceOf(user).call()

        let two_fity = grap.toBigN(250).times(grap.toBigN(10**3)).times(grap.toBigN(10**18))
        expect(grap.toBigN(grap_bal2).minus(grap.toBigN(grap_bal)).toString()).toBe(two_fity.times(1).toString())
    });
  });

  describe("snx", () => {
    test("rewards from pool 1s snx", async () => {
        await grap.testing.resetEVM("0x2");

        await grap.web3.eth.sendTransaction({from: user2, to: snx_account, value : grap.toBigN(100000*10**18).toString()});

        let snx_bal = await grap.contracts.snx.methods.balanceOf(snx_account).call();

        console.log(snx_bal)

        await grap.contracts.snx.methods.transfer(user, snx_bal).send({
          from: snx_account
        });

        snx_bal = await grap.contracts.snx.methods.balanceOf(user).call();

        console.log(snx_bal)

        let a = await grap.web3.eth.getBlock('latest');

        let starttime = await grap.contracts.snx_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await grap.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await grap.contracts.snx.methods.approve(grap.contracts.snx_pool.options.address, -1).send({from: user});

        await grap.contracts.snx_pool.methods.stake(
          snx_bal
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await grap.contracts.snx_pool.methods.earned(user).call();

        let rr = await grap.contracts.snx_pool.methods.rewardRate().call();

        let rpt = await grap.contracts.snx_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await grap.testing.increaseTime(625000 + 100);
        // await grap.testing.mineBlock();

        earned = await grap.contracts.snx_pool.methods.earned(user).call();

        rpt = await grap.contracts.snx_pool.methods.rewardPerToken().call();

        let ysf = await grap.contracts.grap.methods.grapsScalingFactor().call();

        //console.log(earned, ysf, rpt);


        let grap_bal = await grap.contracts.grap.methods.balanceOf(user).call()

        let j = await grap.contracts.snx_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        let weth_bal = await grap.contracts.snx.methods.balanceOf(user).call()

        expect(weth_bal).toBe(snx_bal)


        let grap_bal2 = await grap.contracts.grap.methods.balanceOf(user).call()

        let two_fity = grap.toBigN(250).times(grap.toBigN(10**3)).times(grap.toBigN(10**18))
        expect(grap.toBigN(grap_bal2).minus(grap.toBigN(grap_bal)).toString()).toBe(two_fity.times(1).toString())
    });
  });
})
