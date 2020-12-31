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
    const accounts = await oliv.web3.eth.getAccounts();
    oliv.addAccount(accounts[0]);
    user = accounts[0];
    oliv.addAccount(accounts[1]);
    user2 = accounts[1];
    snapshotId = await oliv.testing.snapshot();
  });

  beforeEach(async () => {
    await oliv.testing.resetEVM("0x2");
  });

  describe("pool failures", () => {
    test("cant join pool 1s early", async () => {
      await oliv.testing.resetEVM("0x2");
      let a = await oliv.web3.eth.getBlock('latest');

      let starttime = await oliv.contracts.eth_pool.methods.starttime().call();

      expect(oliv.toBigN(a["timestamp"]).toNumber()).toBeLessThan(oliv.toBigN(starttime).toNumber());

      //console.log("starttime", a["timestamp"], starttime);
      await oliv.contracts.weth.methods.approve(oliv.contracts.eth_pool.options.address, -1).send({from: user});

      await oliv.testing.expectThrow(
        oliv.contracts.eth_pool.methods.stake(
          oliv.toBigN(200).times(oliv.toBigN(10**18)).toString()
        ).send({
          from: user,
          gas: 300000
        })
      , "not start");


      a = await oliv.web3.eth.getBlock('latest');

      starttime = await oliv.contracts.ampl_pool.methods.starttime().call();

      expect(oliv.toBigN(a["timestamp"]).toNumber()).toBeLessThan(oliv.toBigN(starttime).toNumber());

      //console.log("starttime", a["timestamp"], starttime);

      await oliv.contracts.UNIAmpl.methods.approve(oliv.contracts.ampl_pool.options.address, -1).send({from: user});

      await oliv.testing.expectThrow(oliv.contracts.ampl_pool.methods.stake(
        "5016536322915819"
      ).send({
        from: user,
        gas: 300000
      }), "not start");
    });

    test("cant join pool 2 early", async () => {

    });

    test("cant withdraw more than deposited", async () => {
      await oliv.testing.resetEVM("0x2");
      let a = await oliv.web3.eth.getBlock('latest');

      await oliv.contracts.weth.methods.transfer(user, oliv.toBigN(2000).times(oliv.toBigN(10**18)).toString()).send({
        from: weth_account
      });
      await oliv.contracts.UNIAmpl.methods.transfer(user, "5000000000000000").send({
        from: uni_ampl_account
      });

      let starttime = await oliv.contracts.eth_pool.methods.starttime().call();

      let waittime = starttime - a["timestamp"];
      if (waittime > 0) {
        await oliv.testing.increaseTime(waittime);
      }

      await oliv.contracts.weth.methods.approve(oliv.contracts.eth_pool.options.address, -1).send({from: user});

      await oliv.contracts.eth_pool.methods.stake(
        oliv.toBigN(200).times(oliv.toBigN(10**18)).toString()
      ).send({
        from: user,
        gas: 300000
      });

      await oliv.contracts.UNIAmpl.methods.approve(oliv.contracts.ampl_pool.options.address, -1).send({from: user});

      await oliv.contracts.ampl_pool.methods.stake(
        "5000000000000000"
      ).send({
        from: user,
        gas: 300000
      });

      await oliv.testing.expectThrow(oliv.contracts.ampl_pool.methods.withdraw(
        "5016536322915820"
      ).send({
        from: user,
        gas: 300000
      }), "");

      await oliv.testing.expectThrow(oliv.contracts.eth_pool.methods.withdraw(
        oliv.toBigN(201).times(oliv.toBigN(10**18)).toString()
      ).send({
        from: user,
        gas: 300000
      }), "");

    });
  });

  describe("incentivizer pool", () => {
    test("joining and exiting", async() => {
      await oliv.testing.resetEVM("0x2");

      await oliv.contracts.ycrv.methods.transfer(user, "12000000000000000000000000").send({
        from: ycrv_account
      });

      await oliv.contracts.weth.methods.transfer(user, oliv.toBigN(2000).times(oliv.toBigN(10**18)).toString()).send({
        from: weth_account
      });

      let a = await oliv.web3.eth.getBlock('latest');

      let starttime = await oliv.contracts.eth_pool.methods.starttime().call();

      let waittime = starttime - a["timestamp"];
      if (waittime > 0) {
        await oliv.testing.increaseTime(waittime);
      } else {
        console.log("late entry", waittime)
      }

      await oliv.contracts.weth.methods.approve(oliv.contracts.eth_pool.options.address, -1).send({from: user});

      await oliv.contracts.eth_pool.methods.stake(
        "2000000000000000000000"
      ).send({
        from: user,
        gas: 300000
      });

      let earned = await oliv.contracts.eth_pool.methods.earned(user).call();

      let rr = await oliv.contracts.eth_pool.methods.rewardRate().call();

      let rpt = await oliv.contracts.eth_pool.methods.rewardPerToken().call();
      //console.log(earned, rr, rpt);
      await oliv.testing.increaseTime(86400);
      // await oliv.testing.mineBlock();

      earned = await oliv.contracts.eth_pool.methods.earned(user).call();

      rpt = await oliv.contracts.eth_pool.methods.rewardPerToken().call();

      let ysf = await oliv.contracts.oliv.methods.olivsScalingFactor().call();

      console.log(earned, ysf, rpt);

      let j = await oliv.contracts.eth_pool.methods.getReward().send({
        from: user,
        gas: 300000
      });

      let oliv_bal = await oliv.contracts.oliv.methods.balanceOf(user).call()

      console.log("oliv bal", oliv_bal)
      // start rebasing
        //console.log("approve oliv")
        await oliv.contracts.oliv.methods.approve(
          oliv.contracts.uni_router.options.address,
          -1
        ).send({
          from: user,
          gas: 80000
        });
        //console.log("approve ycrv")
        await oliv.contracts.ycrv.methods.approve(
          oliv.contracts.uni_router.options.address,
          -1
        ).send({
          from: user,
          gas: 80000
        });

        let ycrv_bal = await oliv.contracts.ycrv.methods.balanceOf(user).call()

        console.log("ycrv_bal bal", ycrv_bal)

        console.log("add liq/ create pool")
        await oliv.contracts.uni_router.methods.addLiquidity(
          oliv.contracts.oliv.options.address,
          oliv.contracts.ycrv.options.address,
          oliv_bal,
          oliv_bal,
          oliv_bal,
          oliv_bal,
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

        await oliv.contracts.uni_pair.methods.approve(
          oliv.contracts.ycrv_pool.options.address,
          -1
        ).send({
          from: user,
          gas: 300000
        });

        starttime = await oliv.contracts.ycrv_pool.methods.starttime().call();

        a = await oliv.web3.eth.getBlock('latest');

        waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await oliv.testing.increaseTime(waittime);
        } else {
          console.log("late entry, pool 2", waittime)
        }

        await oliv.contracts.ycrv_pool.methods.stake(bal).send({from: user, gas: 400000});


        earned = await oliv.contracts.ampl_pool.methods.earned(user).call();

        rr = await oliv.contracts.ampl_pool.methods.rewardRate().call();

        rpt = await oliv.contracts.ampl_pool.methods.rewardPerToken().call();

        console.log(earned, rr, rpt);

        await oliv.testing.increaseTime(625000 + 1000);

        earned = await oliv.contracts.ampl_pool.methods.earned(user).call();

        rr = await oliv.contracts.ampl_pool.methods.rewardRate().call();

        rpt = await oliv.contracts.ampl_pool.methods.rewardPerToken().call();

        console.log(earned, rr, rpt);

        await oliv.contracts.ycrv_pool.methods.exit().send({from: user, gas: 400000});

        oliv_bal = await oliv.contracts.oliv.methods.balanceOf(user).call();


        expect(oliv.toBigN(oliv_bal).toNumber()).toBeGreaterThan(0)
        console.log("oliv bal after staking in pool 2", oliv_bal);
    });
  });

  describe("ampl", () => {
    test("rewards from pool 1s ampl", async () => {
        await oliv.testing.resetEVM("0x2");

        await oliv.contracts.UNIAmpl.methods.transfer(user, "5000000000000000").send({
          from: uni_ampl_account
        });
        let a = await oliv.web3.eth.getBlock('latest');

        let starttime = await oliv.contracts.eth_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await oliv.testing.increaseTime(waittime);
        } else {
          //console.log("missed entry");
        }

        await oliv.contracts.UNIAmpl.methods.approve(oliv.contracts.ampl_pool.options.address, -1).send({from: user});

        await oliv.contracts.ampl_pool.methods.stake(
          "5000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await oliv.contracts.ampl_pool.methods.earned(user).call();

        let rr = await oliv.contracts.ampl_pool.methods.rewardRate().call();

        let rpt = await oliv.contracts.ampl_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await oliv.testing.increaseTime(625000 + 100);
        // await oliv.testing.mineBlock();

        earned = await oliv.contracts.ampl_pool.methods.earned(user).call();

        rpt = await oliv.contracts.ampl_pool.methods.rewardPerToken().call();

        let ysf = await oliv.contracts.oliv.methods.olivsScalingFactor().call();

        //console.log(earned, ysf, rpt);


        let oliv_bal = await oliv.contracts.oliv.methods.balanceOf(user).call()

        let j = await oliv.contracts.ampl_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        // let k = await oliv.contracts.eth_pool.methods.exit().send({
        //   from: user,
        //   gas: 300000
        // });
        //
        // //console.log(k.events)

        // weth_bal = await oliv.contracts.weth.methods.balanceOf(user).call()

        // expect(weth_bal).toBe(oliv.toBigN(2000).times(oliv.toBigN(10**18)).toString())

        let ampl_bal = await oliv.contracts.UNIAmpl.methods.balanceOf(user).call()

        expect(ampl_bal).toBe("5000000000000000")


        let oliv_bal2 = await oliv.contracts.oliv.methods.balanceOf(user).call()

        let two_fity = oliv.toBigN(250).times(oliv.toBigN(10**3)).times(oliv.toBigN(10**18))
        expect(oliv.toBigN(oliv_bal2).minus(oliv.toBigN(oliv_bal)).toString()).toBe(two_fity.times(1).toString())
    });
  });

  describe("eth", () => {
    test("rewards from pool 1s eth", async () => {
        await oliv.testing.resetEVM("0x2");

        await oliv.contracts.weth.methods.transfer(user, oliv.toBigN(2000).times(oliv.toBigN(10**18)).toString()).send({
          from: weth_account
        });

        let a = await oliv.web3.eth.getBlock('latest');

        let starttime = await oliv.contracts.eth_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await oliv.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await oliv.contracts.weth.methods.approve(oliv.contracts.eth_pool.options.address, -1).send({from: user});

        await oliv.contracts.eth_pool.methods.stake(
          "2000000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await oliv.contracts.eth_pool.methods.earned(user).call();

        let rr = await oliv.contracts.eth_pool.methods.rewardRate().call();

        let rpt = await oliv.contracts.eth_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await oliv.testing.increaseTime(625000 + 100);
        // await oliv.testing.mineBlock();

        earned = await oliv.contracts.eth_pool.methods.earned(user).call();

        rpt = await oliv.contracts.eth_pool.methods.rewardPerToken().call();

        let ysf = await oliv.contracts.oliv.methods.olivsScalingFactor().call();

        //console.log(earned, ysf, rpt);


        let oliv_bal = await oliv.contracts.oliv.methods.balanceOf(user).call()

        let j = await oliv.contracts.eth_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        let weth_bal = await oliv.contracts.weth.methods.balanceOf(user).call()

        expect(weth_bal).toBe("2000000000000000000000")


        let oliv_bal2 = await oliv.contracts.oliv.methods.balanceOf(user).call()

        let two_fity = oliv.toBigN(250).times(oliv.toBigN(10**3)).times(oliv.toBigN(10**18))
        expect(oliv.toBigN(oliv_bal2).minus(oliv.toBigN(oliv_bal)).toString()).toBe(two_fity.times(1).toString())
    });
    test("rewards from pool 1s eth with rebase", async () => {
        await oliv.testing.resetEVM("0x2");

        await oliv.contracts.ycrv.methods.transfer(user, "12000000000000000000000000").send({
          from: ycrv_account
        });

        await oliv.contracts.weth.methods.transfer(user, oliv.toBigN(2000).times(oliv.toBigN(10**18)).toString()).send({
          from: weth_account
        });

        let a = await oliv.web3.eth.getBlock('latest');

        let starttime = await oliv.contracts.eth_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await oliv.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await oliv.contracts.weth.methods.approve(oliv.contracts.eth_pool.options.address, -1).send({from: user});

        await oliv.contracts.eth_pool.methods.stake(
          "2000000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await oliv.contracts.eth_pool.methods.earned(user).call();

        let rr = await oliv.contracts.eth_pool.methods.rewardRate().call();

        let rpt = await oliv.contracts.eth_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await oliv.testing.increaseTime(125000 + 100);
        // await oliv.testing.mineBlock();

        earned = await oliv.contracts.eth_pool.methods.earned(user).call();

        rpt = await oliv.contracts.eth_pool.methods.rewardPerToken().call();

        let ysf = await oliv.contracts.oliv.methods.olivsScalingFactor().call();

        //console.log(earned, ysf, rpt);




        let j = await oliv.contracts.eth_pool.methods.getReward().send({
          from: user,
          gas: 300000
        });

        let oliv_bal = await oliv.contracts.oliv.methods.balanceOf(user).call()

        console.log("oliv bal", oliv_bal)
        // start rebasing
          //console.log("approve oliv")
          await oliv.contracts.oliv.methods.approve(
            oliv.contracts.uni_router.options.address,
            -1
          ).send({
            from: user,
            gas: 80000
          });
          //console.log("approve ycrv")
          await oliv.contracts.ycrv.methods.approve(
            oliv.contracts.uni_router.options.address,
            -1
          ).send({
            from: user,
            gas: 80000
          });

          let ycrv_bal = await oliv.contracts.ycrv.methods.balanceOf(user).call()

          console.log("ycrv_bal bal", ycrv_bal)

          console.log("add liq/ create pool")
          await oliv.contracts.uni_router.methods.addLiquidity(
            oliv.contracts.oliv.options.address,
            oliv.contracts.ycrv.options.address,
            oliv_bal,
            oliv_bal,
            oliv_bal,
            oliv_bal,
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
          //console.log("init swap")
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

          // trade back for easier calcs later
          //console.log("swap 0")
          await oliv.contracts.uni_router.methods.swapExactTokensForTokens(
            "10000000000000000",
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

          await oliv.testing.increaseTime(43200);

          //console.log("init twap")
          await oliv.contracts.rebaser.methods.init_twap().send({
            from: user,
            gas: 500000
          });

          //console.log("first swap")
          await oliv.contracts.uni_router.methods.swapExactTokensForTokens(
            "1000000000000000000000",
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
          //console.log("second swap")
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

          a = await oliv.web3.eth.getBlock('latest');

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

          let bal1 = await oliv.contracts.oliv.methods.balanceOf(user).call();

          let resOLIV = await oliv.contracts.oliv.methods.balanceOf(oliv.contracts.reserves.options.address).call();

          let resycrv = await oliv.contracts.ycrv.methods.balanceOf(oliv.contracts.reserves.options.address).call();

          // new balance > old balance
          expect(oliv.toBigN(bal).toNumber()).toBeLessThan(oliv.toBigN(bal1).toNumber());
          // increases reserves
          expect(oliv.toBigN(resycrv).toNumber()).toBeGreaterThan(0);

          r = await oliv.contracts.uni_pair.methods.getReserves().call();
          q = await oliv.contracts.uni_router.methods.quote(oliv.toBigN(10**18).toString(), r[0], r[1]).call();
          console.log("quote", q);
          // not below peg
          expect(oliv.toBigN(q).toNumber()).toBeGreaterThan(oliv.toBigN(10**18).toNumber());


        await oliv.testing.increaseTime(525000 + 100);


        j = await oliv.contracts.eth_pool.methods.exit().send({
          from: user,
          gas: 300000
        });
        //console.log(j.events)

        let weth_bal = await oliv.contracts.weth.methods.balanceOf(user).call()

        expect(weth_bal).toBe("2000000000000000000000")


        let oliv_bal2 = await oliv.contracts.oliv.methods.balanceOf(user).call()

        let two_fity = oliv.toBigN(250).times(oliv.toBigN(10**3)).times(oliv.toBigN(10**18))
        expect(
          oliv.toBigN(oliv_bal2).minus(oliv.toBigN(oliv_bal)).toNumber()
        ).toBeGreaterThan(two_fity.toNumber())
    });
    test("rewards from pool 1s eth with negative rebase", async () => {
        await oliv.testing.resetEVM("0x2");

        await oliv.contracts.ycrv.methods.transfer(user, "12000000000000000000000000").send({
          from: ycrv_account
        });

        await oliv.contracts.weth.methods.transfer(user, oliv.toBigN(2000).times(oliv.toBigN(10**18)).toString()).send({
          from: weth_account
        });

        let a = await oliv.web3.eth.getBlock('latest');

        let starttime = await oliv.contracts.eth_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await oliv.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await oliv.contracts.weth.methods.approve(oliv.contracts.eth_pool.options.address, -1).send({from: user});

        await oliv.contracts.eth_pool.methods.stake(
          "2000000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await oliv.contracts.eth_pool.methods.earned(user).call();

        let rr = await oliv.contracts.eth_pool.methods.rewardRate().call();

        let rpt = await oliv.contracts.eth_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await oliv.testing.increaseTime(125000 + 100);
        // await oliv.testing.mineBlock();

        earned = await oliv.contracts.eth_pool.methods.earned(user).call();

        rpt = await oliv.contracts.eth_pool.methods.rewardPerToken().call();

        let ysf = await oliv.contracts.oliv.methods.olivsScalingFactor().call();

        //console.log(earned, ysf, rpt);




        let j = await oliv.contracts.eth_pool.methods.getReward().send({
          from: user,
          gas: 300000
        });

        let oliv_bal = await oliv.contracts.oliv.methods.balanceOf(user).call()

        console.log("oliv bal", oliv_bal)
        // start rebasing
          //console.log("approve oliv")
          await oliv.contracts.oliv.methods.approve(
            oliv.contracts.uni_router.options.address,
            -1
          ).send({
            from: user,
            gas: 80000
          });
          //console.log("approve ycrv")
          await oliv.contracts.ycrv.methods.approve(
            oliv.contracts.uni_router.options.address,
            -1
          ).send({
            from: user,
            gas: 80000
          });

          let ycrv_bal = await oliv.contracts.ycrv.methods.balanceOf(user).call()

          console.log("ycrv_bal bal", ycrv_bal)

          oliv_bal = oliv.toBigN(oliv_bal);
          console.log("add liq/ create pool")
          await oliv.contracts.uni_router.methods.addLiquidity(
            oliv.contracts.oliv.options.address,
            oliv.contracts.ycrv.options.address,
            oliv_bal.times(.1).toString(),
            oliv_bal.times(.1).toString(),
            oliv_bal.times(.1).toString(),
            oliv_bal.times(.1).toString(),
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
          //console.log("init swap")
          await oliv.contracts.uni_router.methods.swapExactTokensForTokens(
            "1000000000000000000000",
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

          // trade back for easier calcs later
          //console.log("swap 0")
          await oliv.contracts.uni_router.methods.swapExactTokensForTokens(
            "100000000000000",
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

          //console.log("init twap")
          await oliv.contracts.rebaser.methods.init_twap().send({
            from: user,
            gas: 500000
          });

          //console.log("first swap")
          await oliv.contracts.uni_router.methods.swapExactTokensForTokens(
            "100000000000000",
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
          //console.log("second swap")
          await oliv.contracts.uni_router.methods.swapExactTokensForTokens(
            "1000000000000000000",
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

          a = await oliv.web3.eth.getBlock('latest');

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

          let bal1 = await oliv.contracts.oliv.methods.balanceOf(user).call();

          let resOLIV = await oliv.contracts.oliv.methods.balanceOf(oliv.contracts.reserves.options.address).call();

          let resycrv = await oliv.contracts.ycrv.methods.balanceOf(oliv.contracts.reserves.options.address).call();

          expect(oliv.toBigN(bal1).toNumber()).toBeLessThan(oliv.toBigN(bal).toNumber());
          expect(oliv.toBigN(resycrv).toNumber()).toBe(0);

          r = await oliv.contracts.uni_pair.methods.getReserves().call();
          q = await oliv.contracts.uni_router.methods.quote(oliv.toBigN(10**18).toString(), r[0], r[1]).call();
          console.log("quote", q);
          // not below peg
          expect(oliv.toBigN(q).toNumber()).toBeLessThan(oliv.toBigN(10**18).toNumber());


        await oliv.testing.increaseTime(525000 + 100);


        j = await oliv.contracts.eth_pool.methods.exit().send({
          from: user,
          gas: 300000
        });
        //console.log(j.events)

        let weth_bal = await oliv.contracts.weth.methods.balanceOf(user).call()

        expect(weth_bal).toBe("2000000000000000000000")


        let oliv_bal2 = await oliv.contracts.oliv.methods.balanceOf(user).call()

        let two_fity = oliv.toBigN(250).times(oliv.toBigN(10**3)).times(oliv.toBigN(10**18))
        expect(
          oliv.toBigN(oliv_bal2).minus(oliv.toBigN(oliv_bal)).toNumber()
        ).toBeLessThan(two_fity.toNumber())
    });
  });

  describe("yfi", () => {
    test("rewards from pool 1s yfi", async () => {
        await oliv.testing.resetEVM("0x2");
        await oliv.contracts.yfi.methods.transfer(user, "500000000000000000000").send({
          from: yfi_account
        });

        let a = await oliv.web3.eth.getBlock('latest');

        let starttime = await oliv.contracts.yfi_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await oliv.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await oliv.contracts.yfi.methods.approve(oliv.contracts.yfi_pool.options.address, -1).send({from: user});

        await oliv.contracts.yfi_pool.methods.stake(
          "500000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await oliv.contracts.yfi_pool.methods.earned(user).call();

        let rr = await oliv.contracts.yfi_pool.methods.rewardRate().call();

        let rpt = await oliv.contracts.yfi_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await oliv.testing.increaseTime(625000 + 100);
        // await oliv.testing.mineBlock();

        earned = await oliv.contracts.yfi_pool.methods.earned(user).call();

        rpt = await oliv.contracts.yfi_pool.methods.rewardPerToken().call();

        let ysf = await oliv.contracts.oliv.methods.olivsScalingFactor().call();

        //console.log(earned, ysf, rpt);


        let oliv_bal = await oliv.contracts.oliv.methods.balanceOf(user).call()

        let j = await oliv.contracts.yfi_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        let weth_bal = await oliv.contracts.yfi.methods.balanceOf(user).call()

        expect(weth_bal).toBe("500000000000000000000")


        let oliv_bal2 = await oliv.contracts.oliv.methods.balanceOf(user).call()

        let two_fity = oliv.toBigN(250).times(oliv.toBigN(10**3)).times(oliv.toBigN(10**18))
        expect(oliv.toBigN(oliv_bal2).minus(oliv.toBigN(oliv_bal)).toString()).toBe(two_fity.times(1).toString())
    });
  });

  describe("comp", () => {
    test("rewards from pool 1s comp", async () => {
        await oliv.testing.resetEVM("0x2");
        await oliv.contracts.comp.methods.transfer(user, "50000000000000000000000").send({
          from: comp_account
        });

        let a = await oliv.web3.eth.getBlock('latest');

        let starttime = await oliv.contracts.comp_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await oliv.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await oliv.contracts.comp.methods.approve(oliv.contracts.comp_pool.options.address, -1).send({from: user});

        await oliv.contracts.comp_pool.methods.stake(
          "50000000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await oliv.contracts.comp_pool.methods.earned(user).call();

        let rr = await oliv.contracts.comp_pool.methods.rewardRate().call();

        let rpt = await oliv.contracts.comp_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await oliv.testing.increaseTime(625000 + 100);
        // await oliv.testing.mineBlock();

        earned = await oliv.contracts.comp_pool.methods.earned(user).call();

        rpt = await oliv.contracts.comp_pool.methods.rewardPerToken().call();

        let ysf = await oliv.contracts.oliv.methods.olivsScalingFactor().call();

        //console.log(earned, ysf, rpt);


        let oliv_bal = await oliv.contracts.oliv.methods.balanceOf(user).call()

        let j = await oliv.contracts.comp_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        let weth_bal = await oliv.contracts.comp.methods.balanceOf(user).call()

        expect(weth_bal).toBe("50000000000000000000000")


        let oliv_bal2 = await oliv.contracts.oliv.methods.balanceOf(user).call()

        let two_fity = oliv.toBigN(250).times(oliv.toBigN(10**3)).times(oliv.toBigN(10**18))
        expect(oliv.toBigN(oliv_bal2).minus(oliv.toBigN(oliv_bal)).toString()).toBe(two_fity.times(1).toString())
    });
  });

  describe("lend", () => {
    test("rewards from pool 1s lend", async () => {
        await oliv.testing.resetEVM("0x2");
        await oliv.web3.eth.sendTransaction({from: user2, to: lend_account, value : oliv.toBigN(100000*10**18).toString()});

        await oliv.contracts.lend.methods.transfer(user, "10000000000000000000000000").send({
          from: lend_account
        });

        let a = await oliv.web3.eth.getBlock('latest');

        let starttime = await oliv.contracts.lend_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await oliv.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await oliv.contracts.lend.methods.approve(oliv.contracts.lend_pool.options.address, -1).send({from: user});

        await oliv.contracts.lend_pool.methods.stake(
          "10000000000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await oliv.contracts.lend_pool.methods.earned(user).call();

        let rr = await oliv.contracts.lend_pool.methods.rewardRate().call();

        let rpt = await oliv.contracts.lend_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await oliv.testing.increaseTime(625000 + 100);
        // await oliv.testing.mineBlock();

        earned = await oliv.contracts.lend_pool.methods.earned(user).call();

        rpt = await oliv.contracts.lend_pool.methods.rewardPerToken().call();

        let ysf = await oliv.contracts.oliv.methods.olivsScalingFactor().call();

        //console.log(earned, ysf, rpt);


        let oliv_bal = await oliv.contracts.oliv.methods.balanceOf(user).call()

        let j = await oliv.contracts.lend_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        let weth_bal = await oliv.contracts.lend.methods.balanceOf(user).call()

        expect(weth_bal).toBe("10000000000000000000000000")


        let oliv_bal2 = await oliv.contracts.oliv.methods.balanceOf(user).call()

        let two_fity = oliv.toBigN(250).times(oliv.toBigN(10**3)).times(oliv.toBigN(10**18))
        expect(oliv.toBigN(oliv_bal2).minus(oliv.toBigN(oliv_bal)).toString()).toBe(two_fity.times(1).toString())
    });
  });

  describe("link", () => {
    test("rewards from pool 1s link", async () => {
        await oliv.testing.resetEVM("0x2");

        await oliv.web3.eth.sendTransaction({from: user2, to: link_account, value : oliv.toBigN(100000*10**18).toString()});

        await oliv.contracts.link.methods.transfer(user, "10000000000000000000000000").send({
          from: link_account
        });

        let a = await oliv.web3.eth.getBlock('latest');

        let starttime = await oliv.contracts.link_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await oliv.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await oliv.contracts.link.methods.approve(oliv.contracts.link_pool.options.address, -1).send({from: user});

        await oliv.contracts.link_pool.methods.stake(
          "10000000000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await oliv.contracts.link_pool.methods.earned(user).call();

        let rr = await oliv.contracts.link_pool.methods.rewardRate().call();

        let rpt = await oliv.contracts.link_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await oliv.testing.increaseTime(625000 + 100);
        // await oliv.testing.mineBlock();

        earned = await oliv.contracts.link_pool.methods.earned(user).call();

        rpt = await oliv.contracts.link_pool.methods.rewardPerToken().call();

        let ysf = await oliv.contracts.oliv.methods.olivsScalingFactor().call();

        //console.log(earned, ysf, rpt);


        let oliv_bal = await oliv.contracts.oliv.methods.balanceOf(user).call()

        let j = await oliv.contracts.link_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        let weth_bal = await oliv.contracts.link.methods.balanceOf(user).call()

        expect(weth_bal).toBe("10000000000000000000000000")


        let oliv_bal2 = await oliv.contracts.oliv.methods.balanceOf(user).call()

        let two_fity = oliv.toBigN(250).times(oliv.toBigN(10**3)).times(oliv.toBigN(10**18))
        expect(oliv.toBigN(oliv_bal2).minus(oliv.toBigN(oliv_bal)).toString()).toBe(two_fity.times(1).toString())
    });
  });

  describe("mkr", () => {
    test("rewards from pool 1s mkr", async () => {
        await oliv.testing.resetEVM("0x2");
        await oliv.web3.eth.sendTransaction({from: user2, to: mkr_account, value : oliv.toBigN(100000*10**18).toString()});
        let eth_bal = await oliv.web3.eth.getBalance(mkr_account);

        await oliv.contracts.mkr.methods.transfer(user, "10000000000000000000000").send({
          from: mkr_account
        });

        let a = await oliv.web3.eth.getBlock('latest');

        let starttime = await oliv.contracts.mkr_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await oliv.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await oliv.contracts.mkr.methods.approve(oliv.contracts.mkr_pool.options.address, -1).send({from: user});

        await oliv.contracts.mkr_pool.methods.stake(
          "10000000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await oliv.contracts.mkr_pool.methods.earned(user).call();

        let rr = await oliv.contracts.mkr_pool.methods.rewardRate().call();

        let rpt = await oliv.contracts.mkr_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await oliv.testing.increaseTime(625000 + 100);
        // await oliv.testing.mineBlock();

        earned = await oliv.contracts.mkr_pool.methods.earned(user).call();

        rpt = await oliv.contracts.mkr_pool.methods.rewardPerToken().call();

        let ysf = await oliv.contracts.oliv.methods.olivsScalingFactor().call();

        //console.log(earned, ysf, rpt);


        let oliv_bal = await oliv.contracts.oliv.methods.balanceOf(user).call()

        let j = await oliv.contracts.mkr_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        let weth_bal = await oliv.contracts.mkr.methods.balanceOf(user).call()

        expect(weth_bal).toBe("10000000000000000000000")


        let oliv_bal2 = await oliv.contracts.oliv.methods.balanceOf(user).call()

        let two_fity = oliv.toBigN(250).times(oliv.toBigN(10**3)).times(oliv.toBigN(10**18))
        expect(oliv.toBigN(oliv_bal2).minus(oliv.toBigN(oliv_bal)).toString()).toBe(two_fity.times(1).toString())
    });
  });

  describe("snx", () => {
    test("rewards from pool 1s snx", async () => {
        await oliv.testing.resetEVM("0x2");

        await oliv.web3.eth.sendTransaction({from: user2, to: snx_account, value : oliv.toBigN(100000*10**18).toString()});

        let snx_bal = await oliv.contracts.snx.methods.balanceOf(snx_account).call();

        console.log(snx_bal)

        await oliv.contracts.snx.methods.transfer(user, snx_bal).send({
          from: snx_account
        });

        snx_bal = await oliv.contracts.snx.methods.balanceOf(user).call();

        console.log(snx_bal)

        let a = await oliv.web3.eth.getBlock('latest');

        let starttime = await oliv.contracts.snx_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await oliv.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await oliv.contracts.snx.methods.approve(oliv.contracts.snx_pool.options.address, -1).send({from: user});

        await oliv.contracts.snx_pool.methods.stake(
          snx_bal
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await oliv.contracts.snx_pool.methods.earned(user).call();

        let rr = await oliv.contracts.snx_pool.methods.rewardRate().call();

        let rpt = await oliv.contracts.snx_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await oliv.testing.increaseTime(625000 + 100);
        // await oliv.testing.mineBlock();

        earned = await oliv.contracts.snx_pool.methods.earned(user).call();

        rpt = await oliv.contracts.snx_pool.methods.rewardPerToken().call();

        let ysf = await oliv.contracts.oliv.methods.olivsScalingFactor().call();

        //console.log(earned, ysf, rpt);


        let oliv_bal = await oliv.contracts.oliv.methods.balanceOf(user).call()

        let j = await oliv.contracts.snx_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        let weth_bal = await oliv.contracts.snx.methods.balanceOf(user).call()

        expect(weth_bal).toBe(snx_bal)


        let oliv_bal2 = await oliv.contracts.oliv.methods.balanceOf(user).call()

        let two_fity = oliv.toBigN(250).times(oliv.toBigN(10**3)).times(oliv.toBigN(10**18))
        expect(oliv.toBigN(oliv_bal2).minus(oliv.toBigN(oliv_bal)).toString()).toBe(two_fity.times(1).toString())
    });
  });
})
