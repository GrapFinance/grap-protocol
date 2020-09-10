import {ethers} from "ethers";

import BigNumber from "bignumber.js";

import {PROPOSALSTATUSCODE} from "../grap/lib/constants";

BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
});

const GAS_LIMIT = {
  STAKING: {
    DEFAULT: 200000,
    SNX: 850000,
  },
};

export const getPoolStartTime = async (poolContract) => {
  return await poolContract.methods.starttime().call();
};

export const stake = async (poolContract, amount, account, tokenName) => {
  let now = new Date().getTime() / 1000;
  const gas =
    GAS_LIMIT.STAKING[tokenName.toUpperCase()] || GAS_LIMIT.STAKING.DEFAULT;
  if (now >= 1597172400) {
    return poolContract.methods
      .stake(new BigNumber(amount).times(new BigNumber(10).pow(18)).toString())
      .send({from: account, gas})
      .on("transactionHash", (tx) => {
        console.log(tx);
        return tx.transactionHash;
      });
  } else {
    alert("pool not active");
  }
};

export const unstake = async (poolContract, amount, account) => {
  let now = new Date().getTime() / 1000;
  if (now >= 1597172400) {
    return poolContract.methods
      .withdraw(
        new BigNumber(amount).times(new BigNumber(10).pow(18)).toString()
      )
      .send({from: account, gas: 200000})
      .on("transactionHash", (tx) => {
        console.log(tx);
        return tx.transactionHash;
      });
  } else {
    alert("pool not active");
  }
};

export const harvest = async (poolContract, account) => {
  let now = new Date().getTime() / 1000;
  if (now >= 1597172400) {
    return poolContract.methods
      .getReward()
      .send({from: account, gas: 200000})
      .on("transactionHash", (tx) => {
        console.log(tx);
        return tx.transactionHash;
      });
  } else {
    alert("pool not active");
  }
};

export const redeem = async (poolContract, account) => {
  let now = new Date().getTime() / 1000;
  if (now >= 1597172400) {
    return poolContract.methods
      .exit()
      .send({from: account, gas: 400000})
      .on("transactionHash", (tx) => {
        console.log(tx);
        return tx.transactionHash;
      });
  } else {
    alert("pool not active");
  }
};

export const approve = async (tokenContract, poolContract, account) => {
  return tokenContract.methods
    .approve(
      poolContract.options.address,
      ethers.constants.MaxUint256.toString()
    )
    .send({from: account, gas: 80000});
};

export const rebase = async (grap, account) => {
  return grap.contracts.rebaser.methods.rebase().send({from: account});
};

export const getPoolContracts = async (grap) => {
  const pools = Object.keys(grap.contracts)
    .filter((c) => c.indexOf("_pool") !== -1)
    .reduce((acc, cur) => {
      const newAcc = {...acc};
      newAcc[cur] = grap.contracts[cur];
      return newAcc;
    }, {});
  return pools;
};

export const getEarned = async (grap, pool, account) => {
  const scalingFactor = new BigNumber(
    await grap.contracts.grap.methods.grapsScalingFactor().call()
  );
  const earned = new BigNumber(await pool.methods.earned(account).call());
  return earned.multipliedBy(
    scalingFactor.dividedBy(new BigNumber(10).pow(18))
  );
};

export const getStaked = async (grap, pool, account) => {
  return grap.toBigN(await pool.methods.balanceOf(account).call());
};

export const getCurrentPrice = async (grap) => {
  // FORBROCK: get current GRAP price
  return grap.toBigN(
    await grap.contracts.rebaser.methods.getCurrentTWAP().call()
  );
};

export const getTargetPrice = async (grap) => {
  return grap.toBigN(1).toFixed(2);
};

export const getCirculatingSupply = async (grap) => {
  let now = await grap.web3.eth.getBlock("latest");
  let scalingFactor = grap.toBigN(
    await grap.contracts.grap.methods.grapsScalingFactor().call()
  );
  let starttime = grap
    .toBigN(await grap.contracts.eth_pool.methods.starttime().call())
    .toNumber();
  let timePassed = now["timestamp"] - starttime;
  if (timePassed < 0) {
    return 0;
  }
  let grapsDistributed = grap.toBigN((8 * timePassed * 250000) / 625000); //graps from first 8 pools
  let starttimePool2 = grap
    .toBigN(await grap.contracts.ycrvUNIV_pool.methods.starttime().call())
    .toNumber();
  timePassed = now["timestamp"] - starttime;
  let pool2Yams = grap.toBigN((timePassed * 1500000) / 625000); // graps from second pool. note: just accounts for first week
  let circulating = pool2Yams
    .plus(grapsDistributed)
    .times(scalingFactor)
    .div(10 ** 36)
    .toFixed(2);
  return circulating;
};

export const getRebaseStatus = async (grap) => {
  try {
    let now = await grap.web3.eth
      .getBlock("latest")
      .then((res) => res.timestamp);
    let lastRebaseTimestampSec = Number(
      await grap.contracts.rebaser.methods.lastRebaseTimestampSec().call()
    );
    return (
      now >= lastRebaseTimestampSec + 60 * 60 * 24 && now % 86400 <= 60 * 60
    );
  } catch (e) {
    console.log(e);
  }
};

export const getNextRebaseTimestamp = async (grap) => {
  try {
    let now = await grap.web3.eth
      .getBlock("latest")
      .then((res) => res.timestamp);
    let interval = 86400; // 24 hours
    let offset = 0; // 0AM utc
    let secondsToRebase = 0;
    if (await grap.contracts.rebaser.methods.rebasingActive().call()) {
      if (now % interval > offset) {
        secondsToRebase = interval - (now % interval) + offset;
      } else {
        secondsToRebase = offset - (now % interval);
      }
    } else {
      let twap_init = grap
        .toBigN(await grap.contracts.rebaser.methods.timeOfTWAPInit().call())
        .toNumber();
      if (twap_init > 0) {
        let delay = grap
          .toBigN(await grap.contracts.rebaser.methods.rebaseDelay().call())
          .toNumber();
        let endTime = twap_init + delay;
        if (endTime % interval > offset) {
          secondsToRebase = interval - (endTime % interval) + offset;
        } else {
          secondsToRebase = offset - (endTime % interval);
        }
        return endTime + secondsToRebase;
      } else {
        return now + 13 * 60 * 60; // just know that its greater than 12 hours away
      }
    }
    return now + secondsToRebase;
  } catch (e) {
    console.log(e);
  }
};

export const getTotalSupply = async (grap) => {
  return await grap.contracts.grap.methods.totalSupply().call();
};

export const getStats = async (grap) => {
  const curPrice = await getCurrentPrice(grap);
  const circSupply = await getCirculatingSupply(grap);
  const nextRebase = await getNextRebaseTimestamp(grap);
  const targetPrice = await getTargetPrice(grap);
  const totalSupply = await getTotalSupply(grap);
  return {
    circSupply,
    curPrice,
    nextRebase,
    targetPrice,
    totalSupply,
  };
};

// gov
export const getProposals = async (grap) => {
  let proposals = [];
  const filter = {
    fromBlock: 0,
    toBlock: "latest",
  };
  const events = await grap.contracts.gov.getPastEvents("allEvents", {filter});
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    let index = 0;
    if (event.removed === false) {
      switch (event.event) {
        case "ProposalCreated":
          proposals.push({
            id: event.returnValues.id,
            proposer: event.returnValues.proposer,
            description: event.returnValues.description,
            startBlock: Number(event.returnValues.startBlock),
            endBlock: Number(event.returnValues.endBlock),
            targets: event.returnValues.targets,
            values: event.returnValues.values,
            signatures: event.returnValues.signatures,
            status: PROPOSALSTATUSCODE.CREATED,
            transactionHash: event.transactionHash,
          });
          break;
        // TODO
        case "ProposalCanceled":
          index = proposals.findIndex(
            (proposal) => proposal.id === event.returnValues.id
          );
          proposals[index].status = PROPOSALSTATUSCODE.CANCELED;
          break;
        case "ProposalQueued":
          index = proposals.findIndex(
            (proposal) => proposal.id === event.returnValues.id
          );
          proposals[index].status = PROPOSALSTATUSCODE.QUEUED;
          break;
        case "VoteCast":
          break;
        case "ProposalExecuted":
          break;
        default:
          break;
      }
    }
  }
  proposals.sort((a, b) => Number(b.endBlock) - Number(b.endBlock));
  return proposals;
};

export const getProposal = async (grap, id) => {
  const proposals = await getProposals(grap);
  const proposal = proposals.find((p) => p.id === id);
  return proposal;
};

export const getProposalStatus = async (grap, id) => {
  const proposalStatus = await grap.contracts.gov.methods.proposals(id).call();
  return proposalStatus;
};

export const getTotalVotes = async (grap) => {
  return grap
    .toBigN(await grap.contracts.grap.methods.initSupply().call())
    .div(10 ** 6);
};

export const getQuorumVotes = async (grap) => {
  return new BigNumber(
    await grap.contracts.gov.methods.quorumVotes().call()
  ).div(10 ** 6);
};

export const getProposalThreshold = async (grap) => {
  return new BigNumber(
    await grap.contracts.gov.methods.proposalThreshold().call()
  ).div(10 ** 6);
};

export const getCurrentVotes = async (grap, account) => {
  return grap
    .toBigN(await grap.contracts.grap.methods.getCurrentVotes(account).call())
    .div(10 ** 6);
};

export const delegate = async (grap, account, from) => {
  return grap.contracts.grap.methods
    .delegate(account)
    .send({from: from, gas: 320000});
};

export const castVote = async (grap, id, support, from) => {
  return grap.contracts.gov.methods
    .castVote(id, support)
    .send({from: from, gas: 320000});
};

// wine
export const getWinePoolStaked = async (brewMaster, pid, account) => {
  try {
    const {amount} = await brewMaster.methods.userLPInfo(pid, account).call();
    return new BigNumber(amount);
  } catch {
    return new BigNumber(0);
  }
};

export const winePoolStake = async (brewMaster, pid, amount, account) => {
  return brewMaster.methods
    .deposit(
      pid,
      new BigNumber(amount).times(new BigNumber(10).pow(18)).toString()
    )
    .send({from: account})
    .on("transactionHash", (tx) => {
      console.log(tx);
      return tx.transactionHash;
    });
};

export const winePoolUnstake = async (brewMaster, pid, amount, account) => {
  return brewMaster.methods
    .withdraw(
      pid,
      new BigNumber(amount).times(new BigNumber(10).pow(18)).toString()
    )
    .send({from: account})
    .on("transactionHash", (tx) => {
      console.log(tx);
      return tx.transactionHash;
    });
};

export const totalWineAmount = async (grap) => {
  return await grap.contracts.brewMaster.methods.totalWineAmount().call();
};
export const approveWinePool = async (grap, account) => {
  return grap.contracts.eth_grap_univ.methods
    .approve(
      grap.contracts.brewMaster.address,
      ethers.constants.MaxUint256.toString()
    )
    .send({from: account, gas: 80000});
};

export const harvestWinePool = async (brewMaster, pid, account) => {
  return brewMaster.methods
    .deposit(pid, "0")
    .send({from: account})
    .on("transactionHash", (tx) => {
      console.log(tx);
      return tx.transactionHash;
    });
};

export const getBrewMaster = (grap) => {
  return grap && grap.contracts && grap.contracts.brewMaster;
};

export const getPendingTickets = async (brewMaster, pid, account) => {
  return brewMaster.methods.pendingTicket(pid, account).call();
};

export const getTicketsEarned = async (grap, account) => {
  const earned = new BigNumber(
    await grap.contracts.brewMaster.methods.ticketBalanceOf(account).call()
  );
  return earned.dividedBy(new BigNumber(10).pow(18));
};

export const getBalance = async (grap) => {
  const num = new BigNumber(
    await grap.web3.eth.getBalance(grap.contracts.brewMaster._address)
  )
    .dividedBy(new BigNumber(10).pow(18))
    .toFixed(2);
  return parseFloat(num);
};

export const drawWine = async (grap, account) => {
  return grap.contracts.brewMaster.methods
    .draw()
    .send({from: account, gas: 400000});
};

export const getUnclaimedWines = async (grap, account) => {
  return await grap.contracts.brewMaster.methods
    .userUnclaimWine(account)
    .call();
};

export const claimFee = async (grap, wid, amount) => {
  const fee = new BigNumber(
    await grap.contracts.brewMaster.methods.claimFee(wid, amount).call()
  );
  return fee.toString();
};

export const claimWine = async (grap, wid, amount, account, cliaim) => {
  return grap.contracts.brewMaster.methods
    .claim(wid, amount)
    .send({from: account, value: cliaim});
};

export const getUserWineAmount = async (grap, wid, account) => {
  return await grap.contracts.brewMaster.balanceOf(account, wid).call();
};

export const getWinePoolAmount = async (grap, wid) => {
  return await grap.contracts.brewMaster.methods.wineBalanceOf(wid).call();
};

export const getWineClaimFee = async (grap, wid, amount) => {
  return await grap.contracts.brewMaster.methods.claimFee(wid, amount).call();
};

export const getUserClaimWineAmount = async (grap, wid, address) => {
  return await grap.contracts.brewMaster.methods
    .userWineBalanceOf(address, wid)
    .call();
};

export const getWineRewards = async (grap, type) => {
  let rewards = [];
  const filter = {
    fromBlock: 0,
    toBlock: "latest",
  };
  const events = await grap.contracts.brewMaster.getPastEvents(
    "allEvents",
    filter
  );
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    if (event.removed === false) {
      if (type.includes(event.event)) {
        rewards.push({
          user: event.returnValues.user,
          wineID: event.returnValues.wineID,
          transactionHash: event.transactionHash,
          blockNumber: event.blockNumber,
        });
      }
    }
  }
  rewards.sort((a, b) => Number(a.blockNumber) - Number(b.blockNumber));
  return rewards;
};

// trader
export const getOrderList = async (grap, type) => {
  let rewards = [];
  const filter = {
    fromBlock: 0,
    toBlock: "latest",
  };
  const events = await grap.contracts.gov.getPastEvents("Reward", filter);
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    if (event.removed === false) {
      if (event.event === type) {
        rewards.push({
          orderID: event.returnValues.orderID,
          user: event.returnValues.user,
          wid: event.returnValues.wid,
          price: event.returnValues.price,
          transactionHash: event.transactionHash,
          blockNumber: event.blockNumber,
        });
      }
    }
  }
  rewards.sort((a, b) => Number(a.blockNumber) - Number(b.blockNumber));
  return rewards;
};

export const orderWine = async (grap, wid, _price, account) => {
  return grap.contracts.wineTrader.methods
    .orderWine(wid, _price)
    .send({from: account});
};

export const cancel = async (grap, orderID, account) => {
  return grap.contracts.wineTrader.methods
    .cancel(orderID)
    .send({from: account});
};

export const buyWine = async (grap, orderID, account) => {
  return grap.contracts.wineTrader.methods
    .buyWine(orderID)
    .send({from: account});
};
