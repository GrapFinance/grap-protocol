import React, {useEffect, useMemo} from "react";
import styled from "styled-components";
import {useWallet} from "use-wallet";
import {provider} from "web3-core";
import PageHeader from "../../components/PageHeader";
import Spacer from "../../components/Spacer";
import {getContract} from "../../utils/erc20";
import Harvest from "./components/Harvest";
import Stake from "./components/Stake";
let once = false;
const Farm: React.FC = () => {
  const {pid, lpTokenAddress, name, icon} = {
    pid: 0,
    lpTokenAddress: "0xC09fb8E468274a683A7570D0b795f8244FBEFf9C",
    name: "Wine Pool",
    icon: "",
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const {ethereum, account, connect} = useWallet();
  if (!account && !once) {
    once = true;

    setTimeout(() => {
      console.log("ONCE");
      connect("injected");
    }, 2000);
  }

  const lpContract = useMemo(() => {
    return getContract(ethereum as provider, lpTokenAddress);
  }, [ethereum, lpTokenAddress]);

  return (
    <>
      <PageHeader
        icon={icon}
        subtitle={`Deposit ETH-GRAP LP Tokens and earn Tickets`}
        title={name}
      />
      <StyledFarm>
        <StyledCardsWrapper>
          <StyledCardWrapper>
            <Harvest pid={pid} />
          </StyledCardWrapper>
          <Spacer />
          <StyledCardWrapper>
            <Stake
              lpContract={lpContract}
              pid={pid}
              tokenName="ETH_GRAP_UNIV"
            />
          </StyledCardWrapper>
        </StyledCardsWrapper>
        <Spacer size="lg" />
        <StyledInfo>
          {/* ⭐️ Every time you stake and unstake LP tokens, the contract will
          automagically harvest SUSHI rewards for you! */}
        </StyledInfo>
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

const StyledInfo = styled.h3`
  color: ${(props) => props.theme.color.grey[400]};
  font-size: 16px;
  font-weight: 400;
  margin: 0;
  padding: 0;
  text-align: center;
`;

export default Farm;
