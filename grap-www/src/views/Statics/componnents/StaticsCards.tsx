import React, { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { ChainId, Token, WETH, Fetcher, Route } from '@uniswap/sdk'
import Web3 from 'web3';
import useGrap from '../../../hooks/useGrap'

import Card from '../../../components/Card'
import CardContent from '../../../components/CardContent'
import Loader from '../../../components/Loader'
import useFarms from '../../../hooks/useFarms'
import { Farm } from '../../../contexts/Farms'
import { getPoolStartTime } from '../../../grapUtils'
import { getDisplayBalance } from '../../../utils/formatBalance'
import { getStats } from '../../../views/Home/utils'
import { OverviewData } from '../../../views/Home/types'
import { Grap } from '../../../grap'
import BigNumber from 'bignumber.js'
export interface GrapContext {
  grap?: typeof Grap
}

const ADDRESS = '0xC8D2AB2a6FdEbC25432E54941cb85b55b9f152dB';
let currentPrice = 0;
let grap: any;
const FarmCards: React.FC = () => {

  const [farms] = useFarms()
  grap = useGrap()
  const [{
    circSupply,
    curPrice,
    nextRebase,
    targetPrice,
    totalSupply,
  }, setStats] = useState<OverviewData>({})

  const fetchStats = useCallback(async () => {
    const statsData = await getStats(grap)
    setStats(statsData)
    currentPrice = parseFloat(getDisplayBalance(new BigNumber(statsData.curPrice)))
  }, [grap, setStats])

  useEffect(() => {
    if (grap) {
      fetchStats()
    }
  }, [grap])


  const priceBlock = () => {
    return <TitleView>Current price: ${currentPrice}</TitleView>
  }


  if (!loaded) {
    loaded = true;
  }

  return (
    <div>
      {currentPrice ? priceBlock() : ''}
      <StyledCards>
        {farms.length ? farms.map((farm, i) => (
          <React.Fragment key={i}>
            <StaticsCard farm={farm} price={currentPrice}/>
          </React.Fragment>
        )) : (
            <StyledLoadingWrapper>
              <Loader text="Loading farms" />
            </StyledLoadingWrapper>
          )}
      </StyledCards>
    </div>
  )
}

interface StaticsCardProps {
  farm: Farm,
  price: number,
}
let loaded = false;

const StaticsCard: React.FC<StaticsCardProps> = ({ farm, price }) => {
  const [data, setData] = useState(null)


  const getData = useCallback(async () => {
    const selfAddress = grap.web3.currentProvider.selectedAddress;
    const token = farm.depositToken;
    let ah:any = {'weth': 'eth_pool', 'uni_lp': 'ycrvUNIV_pool'};
    let key = ah[token] || `${token}_pool`

    const STAKING_POOL = grap.contracts[key];
    const Token = grap.contracts[token];
    const GRAP_TOKEN = grap.contracts.grap;
    const rewardTokenTicker = "GRAP"
    const stakingTokenTicker = token
    const grapScale = await GRAP_TOKEN.methods.grapsScalingFactor().call() / 1e18;
    const rewardPoolAddr = STAKING_POOL._address
    const amount = await STAKING_POOL.methods.balanceOf(selfAddress).call() / 1e18;
    const earned = grapScale * await STAKING_POOL.methods.earned(selfAddress).call() / 1e18;
    const totalSupply = await Token.methods.totalSupply().call() / 1e18;
    const totalStakedAmount = await Token.methods.balanceOf(rewardPoolAddr).call() / 1e18;


    const weekly_reward = (Math.round((await STAKING_POOL.methods.rewardRate().call() * 604800)) * grapScale) / 1e18;
    const rewardPerToken = weekly_reward / totalStakedAmount;


    let hash: any = {
      yfi: ["yearn-finance"],
      yfii: ["yfii-finance"],
      crv: ["curve-dao-token"],
      weth: ["ethereum"],
      link: ["chainlink"],
      mkr: ["maker"],
      comp: ["compound-governance-token"],
      snx: ["havven"],
      lend: ["ethlend"],
      uni_lp: ["curve-fi-ydai-yusdc-yusdt-ytusd"]
    }
    let stakingTokenPrice = 1;
    if (Object.keys(hash).includes(token))  {
      let d = await lookUpPrices(hash[token]);
      let data:any = Object.values(d[0] || d)[0];
      data = data.usd || data;
      stakingTokenPrice = parseFloat(data.toString());
      // if(token == 'yfi') debugger;
      if(token === 'uni_lp'){
        const UNI_TOKEN_ADDR = "0x4eFdFe92F7528Bd16b95083d7Ba1b247De32F549";
        const totalyCRVInUniswapPair = await grap.contracts['ycrv'].methods.balanceOf(UNI_TOKEN_ADDR).call() / 1e18;
        const totalGRAPInUniswapPair = await GRAP_TOKEN.methods.balanceOf(UNI_TOKEN_ADDR).call() / 1e18;
        let yCRVPrice = stakingTokenPrice;
        const totalSupplyOfStakingToken = await grap.contracts['ycrvUNIV'].methods.totalSupply().call() / 1e18;
        stakingTokenPrice = (yCRVPrice * totalyCRVInUniswapPair + price * totalGRAPInUniswapPair) / totalSupplyOfStakingToken;
      }
    }
    let weeklyEstimate = rewardPerToken * amount;
    let weeklyROI = (rewardPerToken * price) * 100 / (stakingTokenPrice);


    setData({
      token,
      weekly_reward,
      amount,
      totalSupply,
      totalStakedAmount,
      earned,
      price,
      stakingTokenPrice,
      weeklyEstimate,
      stakingTokenTicker,
      rewardTokenTicker,
      weeklyROI
    })

  }, [farm, setData]);


  useEffect(() => {
    getData()
  }, [farm, getData])


  const DataDetail = (data: any) => {

    const {totalSupply, totalStakedAmount, weekly_reward, amount, earned, weeklyEstimate, rewardTokenTicker, stakingTokenTicker, stakingTokenPrice, price, weeklyROI} = data
    // debugger
    return (
      <div>
        <StyledPre>
        ========== PRICES ==========<br/>
    1 {rewardTokenTicker}   = {price}$<br/>
    1 {stakingTokenTicker}   = {stakingTokenPrice}$<br/>
    <br/>
    ========== STAKING =========<br/>
    There are total   : {totalSupply} {stakingTokenTicker}.<br/>
    There are total   : {totalStakedAmount} {stakingTokenTicker} staked in {rewardTokenTicker}'s {stakingTokenTicker} staking pool.<br/>
                      = <span className='total'>{toDollar(totalStakedAmount * stakingTokenPrice)}</span><br/>
    You are staking   : {amount} {stakingTokenTicker} ({toFixed(amount * 100 / totalStakedAmount, 3)}% of the pool)<br/>
                      = {toDollar(amount * stakingTokenPrice)}<br/>
                      <br/>
    ======== {rewardTokenTicker} REWARDS ========<br/>
    Claimable Rewards : {toFixed(earned, 4)} {rewardTokenTicker} = ${toFixed(earned * price, 2)}<br/>
    Hourly estimate   : {toFixed(weeklyEstimate / (24 * 7), 4)} {rewardTokenTicker} = {toDollar((weeklyEstimate / (24 * 7)) * price)} <br/>
    Daily estimate    : {toFixed(weeklyEstimate / 7, 2)} {rewardTokenTicker} = {toDollar((weeklyEstimate / 7) * price)} <br/>
    Weekly estimate   : {toFixed(weeklyEstimate, 2)} {rewardTokenTicker} = {toDollar(weeklyEstimate * price)} <br/>
    Hourly ROI in USD : {toFixed((weeklyROI / 7) / 24, 4)}%<br/>
    Daily ROI in USD  : {toFixed(weeklyROI / 7, 4)}%<br/>
    Weekly ROI in USD : {toFixed(weeklyROI, 4)}%<br/>
    APY (unstable)    : {toFixed(weeklyROI * 52, 4)}%<br/>
        </StyledPre>
      </div>
    )
  }

  return (
    <StyledCardWrapper>
      {farm.id === 'uni_lp' && (
        <StyledCardAccent />
      )}
      <Card>
        <CardContent>
          <StyledContent>
            <StyledTitle>{farm.icon}{farm.name}</StyledTitle>
            <StyledDetails>
              {data ? DataDetail(data) : "Loading..."}
            </StyledDetails>
          </StyledContent>
        </CardContent>
      </Card>
    </StyledCardWrapper>
  )
}

const StyledCardAccent = styled.div`
  background: linear-gradient(
    45deg,
    rgba(255, 0, 0, 1) 0%,
    rgba(255, 154, 0, 1) 10%,
    rgba(208, 222, 33, 1) 20%,
    rgba(79, 220, 74, 1) 30%,
    rgba(63, 218, 216, 1) 40%,
    rgba(47, 201, 226, 1) 50%,
    rgba(28, 127, 238, 1) 60%,
    rgba(95, 21, 242, 1) 70%,
    rgba(186, 12, 248, 1) 80%,
    rgba(251, 7, 217, 1) 90%,
    rgba(255, 0, 0, 1) 100%
  );
  border-radius: 12px;
  filter: blur(4px);
  position: absolute;
  top: -2px; right: -2px; bottom: -2px; left: -2px;
  z-index: -1;
`
const StyledPre = styled.pre`
  @media (max-width: 768px) {
    white-space: pre-wrap;
    word-wrap: break-word;
  }
`

const StyledCards = styled.div`
  width: 900px;
  @media (max-width: 768px) {
    width: 100%;
  }
`

const StyledLoadingWrapper = styled.div`
  align-items: center;
  justify-content: center;
`

const StyledRow = styled.div`
  margin-bottom: ${props => props.theme.spacing[4]}px;
  @media (max-width: 768px) {
    width: 100%;
    align-items: center;
  }
`

const StyledCardWrapper = styled.div`
  width: 100%;
  position: relative;
  display: inline-block;
  margin: 15px;
`

const StyledTitle = styled.h4`
  color: ${props => props.theme.color.grey[600]};
  font-size: 24px;
  font-weight: 700;
  margin: ${props => props.theme.spacing[2]}px 0 0;
  padding: 0;
`

const StyledContent = styled.div`
  align-items: center;
`

const TitleView = styled.div`
  width: 100%;
  font-size: 24px;
  font-weight: 700;
`
const StyledSpacer = styled.div`
  height: ${props => props.theme.spacing[4]}px;
  width: ${props => props.theme.spacing[4]}px;
  @media (max-width: 768px) {
    width: 100%;
  }
`

const StyledDetails = styled.div`
  margin-bottom: ${props => props.theme.spacing[6]}px;
  margin-top: ${props => props.theme.spacing[2]}px;
  text-align: left;
`

const StyledDetail = styled.div`
  color: ${props => props.theme.color.grey[500]};
`
const StyledDetailView = styled.div`
  color: ${props => props.theme.color.grey[500]};
  display: flex;
  flex: 1;
`
const StyledDetailSpan =  styled.div`
  text-align: right;
  width: 200px;
  padding-right: 10px;
  display: inline-block;
`


const toFixed = function(num: any, fixed: any) {
  return num.toFixed(fixed)
}
const toDollar = (str: any) => {
  return `$${str}`
}

const lookUpPrices = async function(id_array: any) {
  let ids = id_array.join('%2C')
  let res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=' + ids + '&vs_currencies=usd')
  return res.json()
}

export default FarmCards

