import React from "react";
import {Route, Switch, useRouteMatch} from "react-router-dom";
import {useWallet} from "use-wallet";
import styled from "styled-components";
import farmer from "../../assets/img/farmer.png";
import {NavLink} from "react-router-dom";

import Button from "../../components/Button";
import Page from "../../components/Page";
import PageHeader from "../../components/PageHeader";

import Wine from "../Wine";
import WineData from "../../models/wines";

const Farms: React.FC = () => {
  const {path} = useRouteMatch();
  const {account, connect} = useWallet();
  const wines = Object.values(WineData);
  return (
    <Switch>
      <Page>
        <Container>
          {wines.map((wine, i) => (
            <React.Fragment key={i}>
              <StyledLink
                exact
                activeClassName="active"
                to={`/wine/${wine.id}`}
              >
                <Card>
                  <WineImage src={wine.image} />
                  <WineDesc>
                    No.{wine.id}&nbsp;&nbsp;
                    {wine.name}
                  </WineDesc>
                </Card>
              </StyledLink>
            </React.Fragment>
          ))}
        </Container>
      </Page>
    </Switch>
  );
};

const Card: React.FC = ({children}) => <StyledCard>{children}</StyledCard>;

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

const WineImage = styled.img`
  width: 180px;
  height: 180px;
  background: #fff;
  border-radius: 3px;
  display: block;
  overflow: hidden;
`;

const WineDesc = styled.div`
  text-align: center;
  margin-top: 5px;
  font-weight: 500;
`;

const StyledCard = styled.div`
  width: calc((980px - ${(props) => props.theme.spacing[4]}px * 2) / 4);
  position: relative;
  padding: ${(props) => props.theme.spacing[4]}px;
  box-sizing: border-box;
  transition: all 0.5s ease-out 0s;
  border-radius: 3px;
  &:hover {
    background-color: ${(props) => props.theme.color.grey[200]};
    cursor: pointer;
  }
`;

const StyledLink = styled(NavLink)`
  color: ${(props) => props.theme.color.grey[400]};
  text-decoration: none;
`;

export default Farms;
