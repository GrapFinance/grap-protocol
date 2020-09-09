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

import {Line} from "rc-progress";

const Home: React.FC = () => {
  const grap = useGrap();
  const {account, connect} = useWallet();
  if (!account) {
    setTimeout(() => {
      connect("injected");
    }, 500);
  }
  const [
    {circSupply, curPrice, nextRebase, targetPrice, totalSupply},
    setStats,
  ] = useState<OverviewData>({});

  const fetchStats = useCallback(async () => {
    const statsData = await getStats(grap);
    setStats(statsData);
  }, [grap, setStats]);

  useEffect(() => {
    if (grap) {
      fetchStats();
    }
  }, [grap]);

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
  const alreadyCliamed = 150;
  const precent = (alreadyCliamed / wineTotalSupply) * 100;
  const wineMakingScore = 55;
  const unclaimedNumber = 1;
  const ticketNumber = 55;
  const prizePoolNumber = 10;
  const wineNumber = 2;
  return (
    <Page>
      <PageHeader icon={<img width="80" src={logo} />} subtitle="" title="" />
      {/* The limited quantity of Crypto Wines still has a price tag, at least for now. */}
      <PrizePool>
        Total Prize Pool<PrizePoolSmall>EST</PrizePoolSmall>
        <Price>
          <CountUp end={prizePoolNumber} />
          ETH
        </Price>
      </PrizePool>
      {/* <h1>Crypto Wine Status</h1>
      <div>
        {`WineMaking Collection completion : ${precent}%`}
        <Line percent={precent} strokeWidth={1} strokeColor="#ff2f40" />
      </div> */}

      <StyledPrizeBlock>
        <Container>
          <WinePool ticketNumber={ticketNumber} />
          <StyledSpacer />
          <WineMaker
            wineNumber={wineNumber}
            wineMakingScore={wineMakingScore}
            unclaimedNumber={unclaimedNumber}
          ></WineMaker>
        </Container>
      </StyledPrizeBlock>

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

export default Home;
