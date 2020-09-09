import React, {useMemo, useEffect} from "react";
import styled from "styled-components";

import {useParams} from "react-router-dom";
import {useWallet} from "use-wallet";
import {provider} from "web3-core";

import Button from "../../components/Button";
import PageHeader from "../../components/PageHeader";
import Spacer from "../../components/Spacer";

import useFarm from "../../hooks/useFarm";
import useRedeem from "../../hooks/useRedeem";
import {getContract} from "../../utils/erc20";

import Harvest from "./components/Harvest";
import Stake from "./components/Stake";

const Farm: React.FC = () => {
  const {farmId} = useParams();
  const {
    contract,
    depositToken,
    depositTokenAddress,
    earnToken,
    name,
    icon,
  } = useFarm(farmId) || {
    depositToken: "",
    depositTokenAddress: "",
    earnToken: "",
    name: "",
    icon: "",
  };

  const tokenList: {[index: string]: string} = {
    uni_lp: "0xdf5e0e81dff6faf3a7e52ba697820c5e32d806a8",
    yffi_grap_univ: "0xCee1d3c3A02267e37E6B373060F79d5d7b9e1669",
    grap_yfii_bal: "0x09b8de949282c7f73355b8285f131c447694f95d",
    eth_grap_univ: "ETH",
    etherror_grap_univ: "ETH",
    dogefi_grap_univ: "0x9B9087756eCa997C5D595C840263001c9a26646D",
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const {ethereum} = useWallet();

  const tokenContract = useMemo(() => {
    return getContract(ethereum as provider, depositTokenAddress);
  }, [ethereum, depositTokenAddress]);

  const {onRedeem} = useRedeem(contract);

  const depositTokenName = useMemo(() => {
    return depositToken.toUpperCase();
  }, [depositToken]);

  const earnTokenName = useMemo(() => {
    return earnToken.toUpperCase();
  }, [earnToken]);

  const Notify = (token: string) => {
    if (Object.keys(tokenList).includes(token)) return "";
    return (
      <NotifyView>
        <p>The all basic farms are end of distribution</p>
        <p>Harvest & Withdraw your token with those pool</p>
      </NotifyView>
    );
  };

  const lpPoolTips = (token: string) => {
    if (!Object.keys(tokenList).includes(token)) return "";
    else if (token.indexOf("univ") !== -1) {
      return (
        <NotifyView>
          <p>
            If you want Add liquidity to Uniswap, please use this{" "}
            <a
              href={`https://app.uniswap.org/#/add/0xC8D2AB2a6FdEbC25432E54941cb85b55b9f152dB/${tokenList[token]}`}
            >
              Uniswap link
            </a>
            .
          </p>
        </NotifyView>
      );
    } else if (token.indexOf("bal") !== -1) {
      return (
        <NotifyView>
          <p>
            If you want Add liquidity to Balancer, please use this{" "}
            <a
              href={`https://pools.balancer.exchange/#/pool/${tokenList[token]}`}
            >
              Balancer pool link
            </a>
            .
          </p>
        </NotifyView>
      );
    }
  };

  return (
    <>
      <PageHeader
        icon={icon}
        subtitle={`Deposit ${depositTokenName} and earn ${earnTokenName}`}
        title={name}
      />
      {Notify(depositToken)}
      <StyledFarm>
        {lpPoolTips(depositToken)}
        <StyledCardsWrapper>
          <StyledCardWrapper>
            <Harvest poolContract={contract} />
          </StyledCardWrapper>
          <Spacer />
          <StyledCardWrapper>
            <Stake
              poolContract={contract}
              tokenContract={tokenContract}
              tokenName={depositToken.toUpperCase()}
            />
          </StyledCardWrapper>
        </StyledCardsWrapper>
        <Spacer size="lg" />
        <div>
          <Button onClick={onRedeem} text="Harvest & Withdraw" />
        </div>
        <Spacer size="lg" />
      </StyledFarm>
    </>
  );
};

const StyledFarm = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const StyledCardsWrapper = styled.div`
  display: flex;
  width: 600px;
  @media (max-width: 768px) {
    width: 100%;
    flex-flow: column nowrap;
    align-items: center;
  }
`;

const StyledCardWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  @media (max-width: 768px) {
    width: 80%;
  }
`;

const CountdownView = styled.div`
  font-size: 30px;
  font-weight: bold;
  color: #fafafa;
  margin-bottom: 20px;
`;

const NotifyView = styled.div`
  font-size: 25px;
  text-align: center;
  color: #fafafa;
  a {
    color: #07c;
  }
`;

export default Farm;
