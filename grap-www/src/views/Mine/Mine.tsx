import React, {useCallback, useEffect, useState} from "react";
import styled from "styled-components";

import {Route, Switch, useRouteMatch} from "react-router-dom";
import {useWallet} from "use-wallet";
import {provider} from "web3-core";
import useGrap from "../../hooks/useGrap";
import Button from "../../components/Button";
import PageHeader from "../../components/PageHeader";
import Page from "../../components/Page";
import Spacer from "../../components/Spacer";
import {NavLink} from "react-router-dom";
import CountUp from "react-countup";
import WineData from "../../models/wines";
import Countdown from "react-countdown";
import {getWineRewards} from "../../grapUtils";

let once = false;
const Mine: React.FC = () => {
  const grap = useGrap();
  const wines = Object.values(WineData);
  const {path} = useRouteMatch();
  const {account, connect} = useWallet();
  if (!account && !once) {
    once = true;
    setTimeout(() => {
      connect("injected");
    }, 2000);
  }
  const [mineWines, setMineWines] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const fetchMineWines = useCallback(async () => {
    let rewards = await getWineRewards(grap, ["Reward", "Airdrop"]);
    setRewards(rewards);
    const MineWinesData = rewards.filter((d) => d.user == account);
    setMineWines(MineWinesData);
  }, [account, grap]);

  useEffect(() => {
    if (grap) {
      fetchMineWines();
    }
  }, [fetchMineWines, grap]);
  const imageStyle = (wine: any, mineWines: any) => {
    const ids = mineWines.map((e: any) => e.wineID);
    return ids.includes(wine.id.toString())
      ? {}
      : {
          filter: "grayscale(100%)",
        };
  };

  const calScore = (mineWines: any) => {
    let score = 0;
    mineWines.forEach((w: any) => {
      const wine = wines.filter((e: any) => e.id.toString() == w.wineID)[0];
      score += wine.points;
    });
    return score;
  };
  const rankCal = (point: number, rewards: any[]) => {
    let hash: any = {};
    rewards.forEach((r) => {
      hash[r.user] = hash[r.user] || 0;
      console.log(wines[+r.wineID - 1], r.wineID);
      hash[r.user] += wines[+r.wineID - 1].points;
    });
    const index = Object.values(hash)
      .sort((a, b) => (a > b ? -1 : 1))
      .indexOf(point);
    return index > -1 ? index + 1 : null;
  };

  const point = calScore(mineWines);
  return (
    <Switch>
      <Page>
        {!!account ? (
          <Container>
            {point > 0 && rankCal(point, rewards) ? (
              <WinePill>World Rank: No.{rankCal(point, rewards)}</WinePill>
            ) : (
              ""
            )}

            <PrizePool>
              Your Current Score:
              <Price>
                <CountUp decimals={2} end={point} start={0} />
              </Price>
            </PrizePool>

            {wines.map((wine) => {
              const style = imageStyle(wine, mineWines);
              const ids = mineWines.map((e: any) => e.wineID);
              const count = ids.filter((x) => x === wine.id.toString()).length;
              return (
                <WineItem style={style} wine={wine} count={count}></WineItem>
              );
            })}
          </Container>
        ) : (
          ""
        )}
      </Page>
    </Switch>
  );
};

interface WineItemProps {
  wine: any;
  style: any;
  count: number;
}

const WineItem: React.FC<WineItemProps> = ({wine, style, count}) => {
  return (
    <WineInfo style={style}>
      <StyledLink exact activeClassName="active" to={`/wine/${wine.id}`}>
        <WineImage src={wine.image} />
        <WineDesc>Amount: {count}</WineDesc>
      </StyledLink>
    </WineInfo>
  );
};

const WineImage = styled.img`
  width: 200px;
  height: 200px;
  background: #fff;
  display: block;
`;

const WineInfo = styled.div`
  float: left;
  margin-bottom: 45px;
  margin-right: 45px;
  border-radius: 3px;
  overflow: hidden;
`;
const WinePill = styled.div`
  border-radius: 5px;
  background: #ffeb00;
  color: #000;
  padding: 3px 5px;
  font-size: 30px;
  display: inline-block;
  font-weight: bold;
  box-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
`;

const WineInfoItem = styled.div`
  margin: 15px 0;
`;

// const Button = styled.button``;

// const WineInfo = styled.div``;

const WineTitle = styled.h1`
  color: #fff;
  display: block;
`;

const WineDesc = styled.div`
  background: #fff;
  padding: 5px;
  text-align: center;
  color: #333;
`;

const Container = styled.div`
  margin: 50px auto;
  width: 980px;
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const CountdownView = styled.div`
  font-size: 30px;
  font-weight: bold;
  color: #fff;
`;

const TranasctionsBlock = styled.div``;
const StyledLink = styled(NavLink)`
  color: ${(props) => props.theme.color.grey[400]};
  text-decoration: none;
`;
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
export default Mine;
