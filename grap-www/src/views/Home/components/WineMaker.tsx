import React, {useMemo} from "react";
import styled from "styled-components";
import CountUp from "react-countup";
import numeral from "numeral";

import CardContent from "../../../components/CardContent";

import {getDisplayBalance} from "../../../utils/formatBalance";
import BigNumber from "bignumber.js";
import Button from "../../../components/Button";
import {claimWine, claimFee} from "../../../grapUtils";
interface WineMakerProps {
  ticketNumber?: number;
  wineNumber?: number;
  wineMakingScore?: number;
  unclaimedNumber?: number;
  unclaimedWines?: any[];
  grap?: any;
  account?: string;
}
const WineMaker: React.FC<WineMakerProps> = ({
  wineMakingScore,
  wineNumber,
  unclaimedNumber,
  unclaimedWines,
  ticketNumber,
  grap,
  account,
}) => {
  const wines = unclaimedWines || [];
  return (
    <StyledStats>
      <Card>
        <CardContent>
          <StyledStat>
            <StyledValue>
              {ticketNumber ? <CountUp end={ticketNumber} /> : "-"}
            </StyledValue>
            <Label text="Earned Tickets" />
          </StyledStat>
        </CardContent>
      </Card>

      <StyledSpacer />

      <Card>
        <CardContent>
          <StyledStat>
            <StyledValue>
              <CountUp end={wineNumber} />
            </StyledValue>
            <Label text="Owned Wines" />
          </StyledStat>
        </CardContent>
      </Card>

      <StyledSpacer />

      {wines.length ? (
        <Card>
          <CardContent>
            <StyledStat>
              <StyledValue>
                {unclaimedNumber > 0
                  ? wines.map((wine) => {
                      return (
                        <Button
                          onClick={async () => {
                            const cliaim = await claimFee(
                              grap,
                              wine.wid,
                              wine.amount
                            );
                            claimWine(
                              grap,
                              wine.wid,
                              wine.amount,
                              account,
                              cliaim
                            );
                          }}
                          text={`No.${wine.wid} Crypto Wines earned!`}
                        />
                      );
                    })
                  : ""}
              </StyledValue>
            </StyledStat>
          </CardContent>
        </Card>
      ) : (
        ""
      )}
    </StyledStats>
  );
};

const StyledStats = styled.div`
  width: 325px;
`;

const StyledStat = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledValue = styled.span`
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 10px;
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

interface LabelProps {
  text?: string;
}

const Label: React.FC<LabelProps> = ({text}) => (
  <StyledLabel>{text}</StyledLabel>
);

const StyledLabel = styled.div`
  color: #999;
`;
export default WineMaker;
