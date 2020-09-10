import React, {useCallback, useEffect, useState} from "react";
import styled from "styled-components";
import Countdown, {CountdownRenderProps} from "react-countdown";

import Button from "../../../components/Button";
import CardContent from "../../../components/CardContent";
import Dial from "../../../components/Dial";
import Label from "../../../components/Label";
import {NavLink} from "react-router-dom";
import useGrap from "../../../hooks/useGrap";

interface WinePoolProps {
  ticketNumber: number;
  draw: () => void;
}

const WinePool: React.FC<WinePoolProps> = ({ticketNumber, draw}) => {
  const date = new Date();
  const year = date.getFullYear();
  let month: any = date.getMonth() + 1;
  let day: any = date.getDate();
  month = month < 10 ? `0` + month : month;
  day = day < 10 ? `0` + day : day;
  let dateNumber = Number(
    new Date(`${year}-${month}-${day}T00:00:00.000+00:00`)
  );
  if (Date.now() > dateNumber) {
    dateNumber += 24 * 60 * 60 * 1000;
  }
  const dialValue = ((dateNumber - Date.now()) / (1000 * 60 * 60 * 24)) * 100;
  const renderer = (countdownProps: CountdownRenderProps) => {
    const {hours, minutes, seconds} = countdownProps;
    const paddedSeconds = seconds < 10 ? `0${seconds}` : seconds;
    const paddedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const paddedHours = hours < 10 ? `0${hours}` : hours;
    return (
      <span>
        {paddedHours}:{paddedMinutes}:{paddedSeconds}
      </span>
    );
  };

  return (
    <StyledWinePool>
      <Card>
        <CardContent>
          <Dial size={232} value={dialValue ? dialValue : 0}>
            <StyledCountdown>
              <StyledCountdownText>
                <Countdown date={new Date(dateNumber)} renderer={renderer} />
              </StyledCountdownText>
              <Label text="Next Airdrop" />
            </StyledCountdown>
          </Dial>
          <StyledSpacer />
          <Button
            onClick={draw}
            text={`Draw(Cost 1000 Tickets)`}
            disabled={ticketNumber < 1000}
          />
          <StyledLink to="/WinePool">Earn Tickets</StyledLink>
        </CardContent>
      </Card>
    </StyledWinePool>
  );
};

const StyledWinePool = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 330px;
  box-sizing: border-box;
  min-height: 420px;
`;

const StyledSpacer = styled.div`
  height: ${(props) => props.theme.spacing[4]}px;
`;
const Card: React.FC = ({children}) => <StyledCard>{children}</StyledCard>;

const StyledCard = styled.div`
  background: #ffb3b3;
  color: #000;
  border: 1px solid ${(props) => props.theme.color.grey[300]}ff;
  border-radius: 12px;
  box-shadow: inset 1px 1px 0px ${(props) => props.theme.color.grey[100]};
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
`;
const StyledCountdown = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`;
const StyledCountdownText = styled.span`
  color: ${(props) => props.theme.color.grey[600]};
  font-size: 36px;
  font-weight: 700;
`;

const StyledLink = styled(NavLink)`
  box-sizing: border-box;
  color: ${(props) => props.theme.color.red[100]};
  font-size: 24px;
  font-weight: 700;
  padding: ${(props) => props.theme.spacing[3]}px
    ${(props) => props.theme.spacing[4]}px;
  text-align: center;
  text-decoration: none;
  width: 100%;
  &:hover {
    color: ${(props) => props.theme.color.red[500]};
  }
  &.active {
    color: ${(props) => props.theme.color.primary.main};
  }
`;

export default WinePool;
