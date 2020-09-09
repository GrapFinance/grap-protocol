import React, {useMemo, useEffect} from "react";
import styled from "styled-components";

import {useParams} from "react-router-dom";
import {useWallet} from "use-wallet";
import {provider} from "web3-core";

import Button from "../../components/Button";
import PageHeader from "../../components/PageHeader";
import Spacer from "../../components/Spacer";

import WineData from "../../models/wines";
import Countdown from "react-countdown";

const Wine: React.FC = () => {
  const {wineId} = useParams();
  const wines = Object.values(WineData);
  console.log(wines);
  const wine = wines.filter((w) => w.id == wineId)[0];
  const _color = (type: string) => {
    switch (type) {
      case "Common":
        return "#999";
      case "Rare":
        return "#b96700";
      case "Epic":
        return "#b300d4";
      case "Legendary":
        return "#dec300";
      case "Golden Legendary":
        return "linear-gradient(124deg, #ff2400, #e81d1d, #e8b71d, #e3e81d, #1de840, #1ddde8, #2b1de8, #dd00f3, #dd00f3)";
    }
  };
  const countdownBlock = () => {
    const date = Date.parse("2020-09-11T00:00:00+0000");
    if (Date.now() >= date) return "";
    return (
      <CountdownView>
        <Countdown date={date} />
      </CountdownView>
    );
  };
  return (
    <>
      {wine ? (
        <Container>
          <WineImage src={wine.image} />
          <WineInfo>
            <WinePill style={{background: _color(fetch(wine, "Rarity"))}}>
              {fetch(wine, "Rarity")}
            </WinePill>
            <WineTitle>{wine.name}</WineTitle>
            <WineInfoItem>Created by {s_fetch(wine, "Artist")}</WineInfoItem>
            <WineInfoItem>
              Max Supply: {s_fetch(wine, "Max Supply")}
            </WineInfoItem>
            <WineInfoItem>
              Probability percentage: {fetch(wine, "Max Supply") / 100}%
            </WineInfoItem>
            <WineDesc>{wine.description}</WineDesc>
            <WineInfoItem>
              Buy and Sell will Release at: {countdownBlock()}
            </WineInfoItem>
          </WineInfo>
          <TranasctionsBlock></TranasctionsBlock>
        </Container>
      ) : (
        <h1 style={{textAlign: "center"}}>"404"</h1>
      )}
    </>
  );
};

const s_fetch = (d: any, type: string) => {
  return <strong>{fetch(d, type)}</strong>;
};

const fetch = (d: any, type: string) => {
  const data = d.attributes.filter((e: any) => {
    return e.trait_type === type;
  })[0];
  return data ? data.value : "";
};

const WineImage = styled.img`
  width: 400px;
  height: 400px;
  background: #fff;
  border-radius: 3px;
  display: block;
  overflow: hidden;
  margin-right: 30px;
  float: left;
`;

const WineInfo = styled.div`
  min-height: 400px;
`;
const WinePill = styled.div`
  border-radius: 5px;
  background: #fff;
  padding: 3px 5px;
  font-size: 12px;
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
  margin-top: 5px;
  font-weight: 500;
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

export default Wine;
