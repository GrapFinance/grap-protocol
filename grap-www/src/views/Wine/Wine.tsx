import React from "react";
import styled from "styled-components";
import {Route, Switch, useRouteMatch} from "react-router-dom";
import {useWallet} from "use-wallet";

import vote from "../../assets/img/vote.png";
import Countdown, {CountdownRenderProps} from "react-countdown";

import Button from "../../components/Button";
import Page from "../../components/NewPage";
import PageHeader from "../../components/PageHeader";

const Vote: React.FC = () => {
  const {path} = useRouteMatch();
  const {account, connect} = useWallet();
  const countdownBlock = () => {
    const date = Date.parse("Sun Aug 30 2020 00:00:00 GMT+0800");
    if (Date.now() >= date) return "";
    return (
      <CountdownView>
        <Countdown date={date} />
      </CountdownView>
    );
  };
  return (
    <Route exact path={path}>
      <Page>
        <PageHeader
          icon={"🍷"}
          subtitle="Comming soon"
          title="Good wine needs no bush."
        />
        {countdownBlock()}
      </Page>
    </Route>
  );
};
const CountdownView = styled.div`
  font-size: 100px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #ee58b8;
`;

export default Vote;
