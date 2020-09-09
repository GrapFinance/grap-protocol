import React, {useCallback, useEffect, useMemo, useState} from "react";
import styled from "styled-components";
import {ChainId, Token, WETH, Fetcher, Route} from "@uniswap/sdk";
import Web3 from "web3";
import useGrap from "../../../hooks/useGrap";

import Card from "../../../components/Card";
import CardContent from "../../../components/CardContent";
import Loader from "../../../components/Loader";
import useFarms from "../../../hooks/useFarms";
import {Farm} from "../../../contexts/Farms";
import {getPoolStartTime} from "../../../grapUtils";
import {getDisplayBalance} from "../../../utils/formatBalance";
import {getStats} from "../../../views/Home/utils";
import {OverviewData} from "../../../views/Home/types";
import {Grap} from "../../../grap";
import BigNumber from "bignumber.js";
export interface GrapContext {
  grap?: typeof Grap;
}

const ADDRESS = "0xC8D2AB2a6FdEbC25432E54941cb85b55b9f152dB";
let grap: any;
let tokenList: {[index: string]: {[index: string]: string}} = {
  uni_lp: {
    uni_token_addr: "0x4eFdFe92F7528Bd16b95083d7Ba1b247De32F549",
    token_name: "ycrv",
    uni_token_name: "ycrvUNIV",
  },
  grap_yfii_bal: {
    bal_token_addr: "0x09B8De949282C7F73355b8285f131C447694f95D",
    token_name: "yfii",
    bal_token_name: "grap_yfii_bal",
  },
  eth_grap_univ: {
    uni_token_addr: "0xC09fb8E468274a683A7570D0b795f8244FBEFf9C",
    token_name: "weth",
    uni_token_name: "eth_grap_univ",
  },
  dogefi_grap_univ: {
    uni_token_addr: "0xb623385c0dD0DB66572aCfD2A7D2DCC6eB0E12B0",
    token_name: "dogefi",
    uni_token_name: "dogefi_grap_univ",
  },
};

const FarmCards: React.FC = () => {
  const [farms] = useFarms();
  grap = useGrap();

  useEffect(() => {}, []);

  if (!loaded) {
    loaded = true;
  }

  return (
    <div>
      <StyledCards>
        {farms.length ? (
          farms
            .filter((farm) =>
              Object.keys(tokenList).includes(farm.depositToken)
            )
            .map((farm, i) => (
              <React.Fragment key={i}>
                <StaticsCard farm={farm} />
              </React.Fragment>
            ))
        ) : (
          <StyledLoadingWrapper>
            <Loader text="Loading farms" />
          </StyledLoadingWrapper>
        )}
      </StyledCards>
    </div>
  );
};

interface StaticsCardProps {
  farm: Farm;
}
let loaded = false;

const StaticsCard: React.FC<StaticsCardProps> = ({farm}) => {
  const [data, setData] = useState(null);

  const getData = useCallback(async () => {
    const price = (await lookUpPrices(["grap-finance"]))["grap-finance"].usd;
    const selfAddress = grap.web3.currentProvider.selectedAddress;
    const token = farm.depositToken;
    let ah: any = {
      weth: "eth_pool",
      uni_lp: "ycrvUNIV_pool",
      yffi_grap_univ: "yffi_grap_univ_pool",
    };
    let key = ah[token] || `${token}_pool`;
    const STAKING_POOL = grap.contracts[key];
    const Token = grap.contracts[token];
    const GRAP_TOKEN = grap.contracts.grap;
    const rewardTokenTicker = "GRAP";
    const grapScale =
      (await GRAP_TOKEN.methods.grapsScalingFactor().call()) / 1e18;
    const rewardPoolAddr = STAKING_POOL._address;
    const amount =
      (await STAKING_POOL.methods.balanceOf(selfAddress).call()) / 1e18;
    const earned =
      (grapScale * (await STAKING_POOL.methods.earned(selfAddress).call())) /
      1e18;
    const totalSupply = (await Token.methods.totalSupply().call()) / 1e18;
    const totalStakedAmount =
      (await Token.methods.balanceOf(rewardPoolAddr).call()) / 1e18;

    const weekly_reward =
      (Math.round((await STAKING_POOL.methods.rewardRate().call()) * 604800) *
        grapScale) /
      1e18;
    const rewardPerToken = weekly_reward / totalStakedAmount;

    let hash: any = {
      grap_yfii_bal: ["yfii-finance"],
      uni_lp: ["curve-fi-ydai-yusdc-yusdt-ytusd"],
      eth_grap_univ: ["ethereum"],
      dogefi_grap_univ: ["dogefi"],
    };
    let stakingTokenTicker = token;
    let targetTokenPrice = 0;
    let stakingTokenPrice = 1;
    if (Object.keys(hash).includes(token)) {
      let d = await lookUpPrices(hash[token]);
      let data: any = Object.values(d[0] || d)[0];
      data = data.usd || data;
      targetTokenPrice = parseFloat(data.toString());
      if (Object.keys(tokenList).includes(token)) {
        if (token.indexOf("uni") !== -1) {
          const UNI_TOKEN_ADDR = tokenList[token].uni_token_addr;
          stakingTokenTicker = tokenList[token].token_name;
          const totalyTokenInBalancerPair =
            (await grap.contracts[tokenList[token].token_name].methods
              .balanceOf(UNI_TOKEN_ADDR)
              .call()) / 1e18;
          const totalGRAPInUniswapPair =
            (await GRAP_TOKEN.methods.balanceOf(UNI_TOKEN_ADDR).call()) / 1e18;
          const totalSupplyOfStakingToken =
            (await grap.contracts[tokenList[token].uni_token_name].methods
              .totalSupply()
              .call()) / 1e18;
          stakingTokenPrice =
            (stakingTokenPrice * totalyTokenInBalancerPair +
              price * totalGRAPInUniswapPair) /
            totalSupplyOfStakingToken;
        } else if (token.indexOf("bal") !== -1) {
          const BAL_TOKEN_ADDR = tokenList[token].bal_token_addr;
          stakingTokenTicker = tokenList[token].token_name;
          const totalyTokenInBalancerPair =
            (await grap.contracts[tokenList[token].token_name].methods
              .balanceOf(BAL_TOKEN_ADDR)
              .call()) / 1e18;
          const totalGRAPInBalancerPair =
            (await GRAP_TOKEN.methods.balanceOf(BAL_TOKEN_ADDR).call()) / 1e18;
          const totalSupplyOfStakingToken =
            (await grap.contracts[tokenList[token].bal_token_name].methods
              .totalSupply()
              .call()) / 1e18;

          const TokenPerBPT =
            totalyTokenInBalancerPair / totalSupplyOfStakingToken;
          const GRAPPerBPT =
            totalGRAPInBalancerPair / totalSupplyOfStakingToken;

          stakingTokenPrice =
            targetTokenPrice * TokenPerBPT + price * GRAPPerBPT;
        }
      }
    }
    let weeklyEstimate = rewardPerToken * amount;
    let weeklyROI = (rewardPerToken * price * 100) / stakingTokenPrice;

    setData({
      token,
      targetTokenPrice,
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
      weeklyROI,
    });
  }, [farm.depositToken]);

  useEffect(() => {
    getData();
  }, [farm, getData]);

  const DataDetail = (data: any) => {
    const {
      token,
      targetTokenPrice,
      totalSupply,
      totalStakedAmount,
      weekly_reward,
      amount,
      earned,
      weeklyEstimate,
      rewardTokenTicker,
      stakingTokenTicker,
      stakingTokenPrice,
      price,
      weeklyROI,
    } = data;
    return (
      <div>
        <StyledPre>
          ========== PRICES ==========
          <br />1 {rewardTokenTicker} = {price}$<br />1 {stakingTokenTicker} ={" "}
          {targetTokenPrice}$<br />1 {token} = {stakingTokenPrice}$<br />
          <br />
          ========== STAKING =========
          <br />
          There are total : {totalSupply} {token}.<br />
          There are total : {totalStakedAmount} {token} staked in{" "}
          {rewardTokenTicker}'s {token} staking pool.
          <br />={" "}
          <span className="total">
            {toDollar(totalStakedAmount * stakingTokenPrice)}
          </span>
          <br />
          You are staking : {amount} {token} (
          {toFixed((amount * 100) / totalStakedAmount, 3)}% of the pool)
          <br />= {toDollar(amount * stakingTokenPrice)}
          <br />
          <br />
          ======== {rewardTokenTicker} REWARDS ========
          <br />
          Claimable Rewards : {toFixed(earned, 4)} {rewardTokenTicker} = $
          {toFixed(earned * price, 2)}
          <br />
          Hourly estimate : {toFixed(weeklyEstimate / (24 * 7), 4)}{" "}
          {rewardTokenTicker} = {toDollar((weeklyEstimate / (24 * 7)) * price)}{" "}
          <br />
          Daily estimate : {toFixed(weeklyEstimate / 7, 2)} {rewardTokenTicker}{" "}
          = {toDollar((weeklyEstimate / 7) * price)} <br />
          Weekly estimate : {toFixed(weeklyEstimate, 2)} {rewardTokenTicker} ={" "}
          {toDollar(weeklyEstimate * price)} <br />
          Hourly ROI in USD : {toFixed(weeklyROI / 7 / 24, 4)}%<br />
          Daily ROI in USD : {toFixed(weeklyROI / 7, 4)}%<br />
          Weekly ROI in USD : {toFixed(weeklyROI, 4)}%<br />
          APY (unstable) : {toFixed(weeklyROI * 52, 4)}%<br />
        </StyledPre>
      </div>
    );
  };

  return (
    <StyledCardWrapper>
      {farm.id === "uni_lp" && <StyledCardAccent />}
      <Card>
        <CardContent>
          <StyledContent>
            <StyledTitle>
              {farm.icon}
              {farm.name}
            </StyledTitle>
            <StyledDetails>
              {data ? DataDetail(data) : "Loading..."}
            </StyledDetails>
          </StyledContent>
        </CardContent>
      </Card>
    </StyledCardWrapper>
  );
};

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
  top: -2px;
  right: -2px;
  bottom: -2px;
  left: -2px;
  z-index: -1;
`;
const StyledPre = styled.pre`
  @media (max-width: 768px) {
    white-space: pre-wrap;
    word-wrap: break-word;
  }
`;

const StyledCards = styled.div`
  width: 900px;
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const StyledLoadingWrapper = styled.div`
  align-items: center;
  justify-content: center;
`;

const StyledRow = styled.div`
  margin-bottom: ${(props) => props.theme.spacing[4]}px;
  @media (max-width: 768px) {
    width: 100%;
    align-items: center;
  }
`;

const StyledCardWrapper = styled.div`
  width: 100%;
  position: relative;
  display: inline-block;
  margin: 15px;
`;

const StyledTitle = styled.h4`
  color: ${(props) => props.theme.color.grey[600]};
  font-size: 24px;
  font-weight: 700;
  margin: ${(props) => props.theme.spacing[2]}px 0 0;
  padding: 0;
`;

const StyledContent = styled.div`
  align-items: center;
`;

const TitleView = styled.div`
  width: 100%;
  font-size: 24px;
  font-weight: 700;
`;
const StyledSpacer = styled.div`
  height: ${(props) => props.theme.spacing[4]}px;
  width: ${(props) => props.theme.spacing[4]}px;
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const StyledDetails = styled.div`
  margin-bottom: ${(props) => props.theme.spacing[6]}px;
  margin-top: ${(props) => props.theme.spacing[2]}px;
  text-align: left;
`;

const StyledDetail = styled.div`
  color: ${(props) => props.theme.color.grey[500]};
`;
const StyledDetailView = styled.div`
  color: ${(props) => props.theme.color.grey[500]};
  display: flex;
  flex: 1;
`;
const StyledDetailSpan = styled.div`
  text-align: right;
  width: 200px;
  padding-right: 10px;
  display: inline-block;
`;

const toFixed = function (num: any, fixed: any) {
  return num.toFixed(fixed);
};
const toDollar = (str: any) => {
  return `$${str}`;
};

const lookUpPrices = async function (id_array: any) {
  let ids = id_array.join("%2C");
  let res = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=" +
      ids +
      "&vs_currencies=usd"
  );
  return res.json();
};

export default FarmCards;
