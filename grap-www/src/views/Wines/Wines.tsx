import React from "react";
import styled from "styled-components";
import {Route, useRouteMatch} from "react-router-dom";
import {useWallet} from "use-wallet";
import maker from "../../assets/img/maker.png";

import Countdown, {
  zeroPad,
  calcTimeDelta,
  formatTimeDelta,
} from "react-countdown";

import Page from "../../components/NewPage";
// import PageHeader from "../../components/PageHeader";
import t from "../../utils/t";
import Button from "../../components/NewButton";

import Parser from "html-react-parser";

const Vote: React.FC = () => {
  const {path} = useRouteMatch();
  const {account, connect} = useWallet();
  const collectedCount = 120;
  const nextDrawDate = Date.now() + 15 * 60 * 1000;
  const renderer = (data: any) => (
    <span>
      {zeroPad(data.minutes)}:{zeroPad(data.seconds)}
    </span>
  );

  return (
    <Route exact path={path}>
      <Page>
        <ContainerView>
          <h1 style={{textAlign: "left", display: "block", margin: "20px 0"}}>
            CryptoWines
          </h1>
          <StatsView>
            <StatusBlock>
              <BTitle>{t("poolSize")}：</BTitle>183221$
            </StatusBlock>
            <StatusBlock
              style={{
                backgroundSize: `40%`,
              }}
            >
              <BTitle>{t("Wine in circulation")}：</BTitle>
              {collectedCount}/10000
            </StatusBlock>
            <StatusBlock>
              <BTitle>{t("Next Winemaking")}：</BTitle>
              <Countdown date={nextDrawDate} renderer={renderer} />
            </StatusBlock>
          </StatsView>
          <img src={maker} height="152" style={{marginTop: -4}} />
          <input type="number" id="quantity" name="quantity" min="1" max="5">
          <Button>{t("Winemaking")}</Button>
          <IntroduceView>
            <pre
              style={{
                borderLeft: "5px solid #ddd",
                display: "block",
                padding: "10px",
              }}
            >
              {t("quote")}
            </pre>
            <p>{Parser(t("introduction1"))}</p>
            <SubTitle>{t("lastwine")}</SubTitle>
            <p>{t("introduction2")}</p>
            <p>{t("tips")}</p>
          </IntroduceView>
        </ContainerView>
      </Page>
    </Route>
  );
};
const ContainerView = styled.div`
  width: 100%;
`;
const IntroduceView = styled.div`
  padding-right: 15%;
  line-height: 1.5;
`;
const StatsView = styled.div`
  border: 1px solid #ddd;
  font-size: 30px;
  flex: 1;
  display: flex;
  text-align: center;
  border-left: 1px solid #ddd;
  margin-bottom: 20px;
`;
const SubTitle = styled.h2``;
const BTitle = styled.div`
  display: block;
`;

const StatusBlock = styled.div`
  margin: 0;
  flex: 1;
  padding: 15px;
  border-right: 1px #ddd solid;
  background-image: -webkit-gradient(
    linear,
    left top,
    left bottom,
    from(rgba(250, 82, 82, 0.1)),
    to(rgba(250, 82, 82, 0.1))
  );
  background-repeat: no-repeat;
  background-size: 0;
`;

export default Vote;
