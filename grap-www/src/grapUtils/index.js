import {ethers} from 'ethers'

import BigNumber from 'bignumber.js'

BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
});

export const stake = async (poolContract, amount,account) => {
  let now = new Date().getTime() / 1000;
  if (now >= 1597172400) {
  return poolContract.methods
    .stake((new BigNumber(amount).times(new BigNumber(10).pow(18))).toString())
    .send({ from: account, gas: 200000 })
    .on('transactionHash', tx => {
      console.log(tx)
      return tx.transactionHash
    })
  } else {
    alert("pool not active");
  }
}

export const unstake = async (poolContract, amount, account) => {
  let now = new Date().getTime() / 1000;
  if (now >= 1597172400) {
    return poolContract.methods
      .withdraw((new BigNumber(amount).times(new BigNumber(10).pow(18))).toString())
      .send({ from: account, gas: 200000 })
      .on('transactionHash', tx => {
        console.log(tx)
        return tx.transactionHash
      })
  } else {
    alert("pool not active");
  }
}

export const harvest = async (poolContract, account) => {
  let now = new Date().getTime() / 1000;
  if (now >= 1597172400) {
    return poolContract.methods
      .getReward()
      .send({ from: account, gas: 200000 })
      .on('transactionHash', tx => {
        console.log(tx)
        return tx.transactionHash
      })
  } else {
    alert("pool not active");
  }
}

export const redeem = async (poolContract, account) => {
  let now = new Date().getTime() / 1000;
  if (now >= 1597172400) {
    return poolContract.methods
      .exit()
      .send({ from: account, gas: 200000 })
      .on('transactionHash', tx => {
        console.log(tx)
        return tx.transactionHash
      })
  } else {
    alert("pool not active");
  }
}

export const approve = async (tokenContract, poolContract, account) => {
  return tokenContract.methods
    .approve(poolContract.options.address, ethers.constants.MaxUint256)
    .send({ from: account, gas: 80000 })
}

export const getPoolContracts = async (grap) => {
  const pools = Object.keys(grap.contracts)
    .filter(c => c.indexOf('_pool') !== -1)
    .reduce((acc, cur) => {
      const newAcc = { ...acc }
      newAcc[cur] = grap.contracts[cur]
      return newAcc
    }, {})
  return pools
}

export const getEarned = async (grap, pool, account) => {
  return grap.toBigN(await pool.methods.earned(account).call())
}

export const getStaked = async (grap, pool, account) => {
  return grap.toBigN(await pool.methods.balanceOf(account).call())
}

export const getCurrentPrice = async (grap) => {
  // FORBROCK: get current GRAP price
  return grap.toBigN(await grap.contracts.rebaser.methods.getCurrentTWAP().call())
}

export const getTargetPrice = async (grap) => {
  return grap.toBigN(1).toFixed(2);
}

export const getCirculatingSupply = async (grap) => {
  let now = await grap.web3.eth.getBlock('latest');
  let scalingFactor = grap.toBigN(await grap.contracts.grap.methods.grapsScalingFactor().call());
  let starttime = grap.toBigN(await grap.contracts.eth_pool.methods.starttime().call()).toNumber();
  let timePassed = now["timestamp"] - starttime;
  if (timePassed < 0) {
    return 0;
  }
  let grapsDistributed = grap.toBigN(8 * timePassed * 250000 / 625000); //graps from first 8 pools
  let starttimePool2 = grap.toBigN(await grap.contracts.ycrv_pool.methods.starttime().call()).toNumber();
  timePassed = now["timestamp"] - starttime;
  let pool2Yams = grap.toBigN(timePassed * 1500000 / 625000); // graps from second pool. note: just accounts for first week
  let circulating = pool2Yams.plus(grapsDistributed).times(scalingFactor).div(10**36).toFixed(2)
  return circulating
}

export const getNextRebaseTimestamp = async (grap) => {
  let now = await grap.web3.eth.getBlock('latest').then(res => res.timestamp);
  let interval = 43200; // 12 hours
  let offset = 28800; // 8am/8pm utc
  let secondsToRebase = 0;
  if (await grap.contracts.rebaser.methods.rebasingActive().call()) {
    if (now % interval > offset) {
        secondsToRebase = (interval - (now % interval)) + offset;
     } else {
        secondsToRebase = offset - (now % interval);
    }
  } else {
    let twap_init = grap.toBigN(await grap.contracts.rebaser.methods.timeOfTWAPInit().call()).toNumber();
    if (twap_init > 0) {
      let delay = grap.toBigN(await grap.contracts.rebaser.methods.rebaseDelay().call()).toNumber();
      let endTime = twap_init + delay;
      if (endTime % interval > offset) {
          secondsToRebase = (interval - (endTime % interval)) + offset;
       } else {
          secondsToRebase = offset - (endTime % interval);
      }
      return endTime + secondsToRebase;
    } else {
      return now + 13*60*60; // just know that its greater than 12 hours away
    }
  }
  return 0
}

export const getTotalSupply = async (grap) => {
  return await grap.contracts.grap.methods.totalSupply().call();
}

export const getStats = async (grap) => {
  const curPrice = await getCurrentPrice(grap)
  const circSupply = await getCirculatingSupply(grap)
  const nextRebase = await getNextRebaseTimestamp(grap)
  const targetPrice = await getTargetPrice(grap)
  const totalSupply = await getTotalSupply(grap)
  return {
    circSupply,
    curPrice,
    nextRebase,
    targetPrice,
    totalSupply
  }
}
