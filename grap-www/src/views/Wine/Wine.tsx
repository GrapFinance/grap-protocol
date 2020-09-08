import React, {useMemo, useEffect} from "react";
import styled from "styled-components";

import {useParams} from "react-router-dom";
import {useWallet} from "use-wallet";
import {provider} from "web3-core";

import Button from "../../components/Button";
import PageHeader from "../../components/PageHeader";
import Spacer from "../../components/Spacer";

const Wine: React.FC = () => {
  const {WineId} = useParams();

  return (
    <>
      <Container>h</Container>
    </>
  );
};

const Container = styled.div`
  display: flex;
  flex-flow: row wrap;
  margin: 0 auto;
  width: 980px;
  @media (max-width: 768px) {
    width: 100%;
    flex-flow: column nowrap;
    align-items: center;
  }
`;

export default Wine;
