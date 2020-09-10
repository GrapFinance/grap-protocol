import React, {useCallback, useEffect, useState} from "react";
import styled from "styled-components";
import Countdown from "react-countdown";

import Page from "../../components/Page";
import PageHeader from "../../components/PageHeader";

import Button from "../../components/Button";
import useGrap from "../../hooks/useGrap";

import Rebase from "./components/Rebase";
import Stats from "./components/Stats";
import WineMaker from "./components/WineMaker";
import WinePool from "./components/WinePool";

import logo from "../../assets/img/logo.png";
import Wine from "../../assets/img/wine.svg";

import {useWallet} from "use-wallet";

import {OverviewData} from "./types";
import CountUp from "react-countup";
import {getStats} from "./utils";
import {drawWine} from "../../grapUtils";

import {Line} from "rc-progress";
import {stat} from "fs";

let once = false;
const Home: React.FC = () => {
  const grap = useGrap();
  const {account, connect} = useWallet();
  if (!account && !once) {
    once = true;

    setTimeout(() => {
      console.log("ONCE");
      connect("injected");
    }, 2000);
  }
  const [
    {
      circSupply,
      curPrice,
      nextRebase,
      targetPrice,
      totalSupply,
      rewards,
      unclaimedWines,
      myRewards,
      tickets,
      remainWineAmount,
      balance,
    },
    setStats,
  ] = useState<OverviewData>({});
  const fetchStats = useCallback(async () => {
    const statsData = await getStats(grap, account);
    setStats(statsData);
  }, [account, grap]);

  useEffect(() => {
    if (grap) {
      fetchStats();
    }
  }, [fetchStats, grap]);

  const countdownBlock = () => {
    const date = Date.parse("2020-08-20T00:00:00+0000");
    if (Date.now() >= date) return "";
    return (
      <CountdownView>
        <Countdown date={date} />
      </CountdownView>
    );
  };

  const wineTotalSupply = 10000;
  const alreadyCliamed = wineTotalSupply - parseInt(remainWineAmount, 10);
  const cliamedPrecent = (alreadyCliamed / wineTotalSupply) * 100;
  const wineMakingScore = 55;
  const prizePoolNumber = (balance * 2) / 3;
  const wineNumber = myRewards ? myRewards.length : 0;
  const wines = unclaimedWines || [];
  const unclaimedNumber = wines.filter((e) => e > 0).length;
  return (
    <Page>
      <PageHeader icon={<img width="80" src={logo} />} subtitle="" title="" />
      {/* The limited quantity of Crypto Wines still has a price tag, at least for now. */}
      {prizePoolNumber ? (
        <PrizePool>
          Total Prize Pool<PrizePoolSmall>EST</PrizePoolSmall>
          <Price>
            <CountUp decimals={2} end={prizePoolNumber} start={0} />
            ETH
          </Price>
        </PrizePool>
      ) : (
        ""
      )}
      {/* <h1>Crypto Wine Status</h1>
      <div>
        {`WineMaking Collection completion : ${precent}%`}
        <Line percent={cliamedPrecent} strokeWidth={1} strokeColor="#ff2f40" />
      </div> */}
      <StyledPrizeBlock>
        <Container>
          <WinePool
            ticketNumber={tickets}
            draw={() => {
              drawWine(grap, account);
            }}
          />
          <StyledSpacer />
          <WineMaker
            ticketNumber={tickets}
            wineNumber={wineNumber}
            wineMakingScore={wineMakingScore}
            unclaimedWines={unclaimedWines}
            unclaimedNumber={unclaimedNumber}
            grap={grap}
            account={account}
          ></WineMaker>
        </Container>
      </StyledPrizeBlock>
      <StyledInfo>
        ⭐️ Whenever you get a new bottle of wine, you can see it in
        <a href="https://opensea.io/assets/crypto-wine" target="_blank">
          OpenSea
        </a>
      </StyledInfo>
      <StyledInfo>
        ❓ Need help about WineMaking?
        <a
          href="https://medium.com/@grap.finance/q-a-about-winemaking-bd9035c8ca0e"
          target="_blank"
          style={{margin: "0 10px", color: "#07c"}}
        >
          Help
        </a>
        <a
          href="https://docs.qq.com/doc/DSWRaTkZvSVJJVEdM"
          target="_blank"
          style={{margin: "0 10px", color: "#07c"}}
        >
          帮助
        </a>
      </StyledInfo>

      <h1 style={{textAlign: "center"}}>Grap Info</h1>
      <StyledOverview>
        <Rebase nextRebase={nextRebase} />
        <StyledSpacer />
        <Stats
          circSupply={circSupply}
          curPrice={curPrice}
          targetPrice={targetPrice}
          totalSupply={totalSupply}
        />
      </StyledOverview>
    </Page>
  );
};

const StyledPrizeBlock = styled.div`
  padding: 30px 30px 60px;
  width: 100%;
  border-radius: 5px;
  margin-bottom: 50px;
  box-sizing: border-box;
  background-color: ${(props) => props.theme.color.grey[200]};
  align-items: center;
  display: flex;
`;

const Container = styled.div`
  align-items: center;
  margin: 0 auto;
  display: flex;
  @media (max-width: 768px) {
    width: 100%;
    flex-flow: column nowrap;
  }
`;

const PrizeBlockImg = styled.img`
  width: 200px;
`;
const StyledOverview = styled.div`
  align-items: center;
  display: flex;
  @media (max-width: 768px) {
    width: 100%;
    flex-flow: column nowrap;
  }
`;

const CountdownView = styled.div`
  font-size: 30px;
  font-weight: bold;
  color: #555;
`;

const Card = styled.div`
  background: #f4b1b1;
  font-size: 20px;
  font-weight: bold;
  color: #000;
  border-radius: 6px;
  width: 290px;
  float: left;
  box-sizing: border-box;
  padding: 20px;
  margin: 15px;
  text-align: center;
  height: 180px;
`;

const CardContent = styled.div``;

const StyledStat = styled.div``;
const PrizePool = styled.div`
  font-size: 50px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
  @media (max-width: 768px) {
    font-size: 30px;
  }
`;
const PrizePoolSmall = styled.small`
  color: #dedede;
  font-size: 12px;
`;

const Price = styled.p`
  color: #fafafa;
  font-size: 100px;
  text-align: center;
  margin: 0;
  @media (max-width: 768px) {
    font-size: 50px;
  }
`;

const Icon = styled.div`
  font-size: 50px;
  text-align: center;
  text-align: center;
  display: block;
`;
const StatsBlock = styled.div``;
const StyledSpacer = styled.div`
  height: ${(props) => props.theme.spacing[4]}px;
  width: ${(props) => props.theme.spacing[4]}px;
`;
const StyledInfo = styled.h3`
  color: ${(props) => props.theme.color.grey[400]};
  font-size: 16px;
  font-weight: 400;
  margin: 0;
  padding: 0;
  text-align: center;
`;

export default Home;
