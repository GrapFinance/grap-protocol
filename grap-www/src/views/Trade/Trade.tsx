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
import { getOrderList, buyWine, cancel } from "../../grapUtils";
import { getDisplayBalance } from '../../utils/formatBalance'

let once = false;
const Trade: React.FC = () => {
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
  const [selfWines, setSelfWines] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const fetchOrders = useCallback(async () => {
    let orderList = await getOrderList(grap, ["Order", "Cancel", "Buy"]);
    setOrders(orderList);
    const selfWines = orderList.filter((d) => d.user == account);
    setSelfWines(selfWines);
  }, [account, grap]);

  useEffect(() => {
    if (grap) {
      fetchOrders();
    }
  }, [fetchOrders, grap]);
  const isSelf = (order: any) => {
    return selfWines.includes(order)
  };

  return (
    <Switch>
      <Page>
        {!!account ? (
          <MainContainer>
            <Container>

              {orders.filter((o) => o.type === "Order").map((order) => {
                const wine = wines[Number(order.wid)-1];
                return (
                  <OrderItem 
                    self={isSelf(order)}
                    wine={wine}
                    order={order}
                    buyWine={() => {buyWine(grap, order.orderID, order.price, account);}}
                    cancel={() => {cancel(grap, order.orderID, account);}}
                  ></OrderItem>
                );
              })}
            </Container>
            <Sold>Sold</Sold>
            <Container>
              {orders.filter((o) => o.type === "Buy").map((order) => {
                const wine = wines[Number(order.wid)-1];
                return (
                  <OrderItem 
                    self={isSelf(order)}
                    wine={wine}
                    order={order}
                    buyWine={() => {buyWine(grap, order.orderID, order.price, account);}}
                    cancel={() => {cancel(grap, order.orderID, account);}}
                  ></OrderItem>
                );
              })}
            </Container>
          </MainContainer>
        ) : (
          ""
        )}
      </Page>
    </Switch>
  );
};

interface WineItemProps {
  self: boolean;
  order: any;
  wine: any;
  buyWine: () => void;
  cancel: () => void;
}

const OrderItem: React.FC<WineItemProps> = ({self, wine, order, buyWine, cancel}) => {
  return (
    <WineInfo>
      <StyledLink exact activeClassName="active" to={`/wine/${wine.id}`}>
        <WineImage src={wine.image} />
        <WineDesc>{order.type == "Buy" ? "Buyer" : "Seller"}: {order.user}</WineDesc>
        <WineDesc>Price: {getDisplayBalance(order.price)} ETH</WineDesc>
      </StyledLink>
        <WineDesc>
          <a href={`https://etherscan.io/tx/${order.transactionHash}`} target="_blank">
            See this TX
          </a>
        </WineDesc>
        {
          order.type == "Order" ?
            (self ? <Button onClick={cancel} text="Cancel"/> : <Button onClick={buyWine} text="Buy"/>)
          :
            ""
        }
    </WineInfo>
  );
};

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

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
  @media (max-width: 768px) {
    float: none;
    inline-size: min-content;
    justify-content: center;
    margin: 20px auto;
  }
`;


const WineDesc = styled.div`
  width: 190px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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


const StyledLink = styled(NavLink)`
  color: ${(props) => props.theme.color.grey[400]};
  text-decoration: none;
`;

const Sold = styled.div`
  font-size: 50px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
  display: inline;
  @media (max-width: 768px) {
    font-size: 30px;
  }
`;

export default Trade;
