import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import Countdown, { CountdownRenderProps} from 'react-countdown'

import Button from '../../../components/Button'
import Card from '../../../components/Card'
import CardContent from '../../../components/CardContent'
import Loader from '../../../components/Loader'

import {PROPOSALSTATUSCODE} from '../../../grap/lib/constants'
import useProposals from '../../../hooks/useProposals'

import { Proposal } from '../../../contexts/Proposals'

const ProposalCards: React.FC = () => {
  const [proposals] = useProposals()
  
  const rows = proposals.reduce<Proposal[][]>((proposalRows, proposal) => {
    const newProposalRows = [...proposalRows]
    if (newProposalRows[newProposalRows.length - 1].length === 3) {
      newProposalRows.push([proposal])
    } else {
      newProposalRows[newProposalRows.length - 1].push(proposal)
    }
    return newProposalRows
  }, [[]])

  return (
    <StyledCards>
      {!!rows[0].length ? rows.map((proposalRow, i) => (
        <StyledRow key={i}>
          {proposalRow.map((proposal, j) => (
            <React.Fragment key={j}>
              <ProposalCard proposal={proposal} />
              {(j === 0 || j === 1) && <StyledSpacer />}
            </React.Fragment>
          ))}
        </StyledRow>
      )) : (
          <StyledLoadingWrapper>
            <Loader text="Loading proposals" />
          </StyledLoadingWrapper>
        )}
    </StyledCards>
  )
}

interface ProposalCards {
  proposal: Proposal,
}

const ProposalCard: React.FC<ProposalCards> = ({ proposal }) => {
  const [startTime] = useState(0)

  const renderer = (countdownProps: CountdownRenderProps) => {
    const { hours, minutes, seconds } = countdownProps
    const paddedSeconds = seconds < 10 ? `0${seconds}` : seconds
    const paddedMinutes = minutes < 10 ? `0${minutes}` : minutes
    const paddedHours = hours < 10 ? `0${hours}` : hours
    return (
      <span style={{ width: '100%' }}>{paddedHours}:{paddedMinutes}:{paddedSeconds}</span>
    )
  }
  
  const poolActive = startTime * 1000 - Date.now() <= 0
  
  return (
    <StyledCardWrapper>
      <Card>
        <CardContent>
          <StyledContent>
            <StyledTitle>Proposal {proposal.id}</StyledTitle>
            <StyledDetails>
              {proposal.description}
            </StyledDetails>
              {proposal.status === PROPOSALSTATUSCODE.CREATED ? (
                <StyledCreated>
                  Voting
                </StyledCreated>
              ) : (
                <StyledEnd>
                  End
                </StyledEnd>
              )}
            <Button
              text='Vote'
              to={`/vote/${proposal.id}`}
            >
            </Button>
          </StyledContent>
        </CardContent>
      </Card>
    </StyledCardWrapper>
  )
}

const StyledCards = styled.div`
  width: 900px;
  @media (max-width: 768px) {
    width: 100%;
  }
`

const StyledLoadingWrapper = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  justify-content: center;
`

const StyledRow = styled.div`
  display: flex;
  margin-bottom: ${props => props.theme.spacing[4]}px;
  flex-flow: row wrap;
  @media (max-width: 768px) {
    width: 100%;
    flex-flow: column nowrap;
    align-items: center;
  }
`

const StyledCardWrapper = styled.div`
  display: flex;
  width: calc((900px - ${props => props.theme.spacing[4]}px * 2) / 3);
  position: relative;
`

const StyledTitle = styled.h4`
  color: ${props => props.theme.color.grey[600]};
  font-size: 24px;
  font-weight: 700;
  margin: ${props => props.theme.spacing[2]}px 0 0;
  padding: 0;
`

const StyledContent = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`

const StyledSpacer = styled.div`
  height: ${props => props.theme.spacing[4]}px;
  width: ${props => props.theme.spacing[4]}px;
`

const StyledDetails = styled.h5`
  maring: ${props => props.theme.spacing[4]}px;
  padding: 5px;
  width: 100%;
  word-wrap: break-word;
  text-align: center;
`

const StyledCreated = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${props => props.theme.color.ongoing};
  margin-bottom: ${props => props.theme.spacing[2]}px;
  margin-top: ${props => props.theme.spacing[2]}px;
`

const StyledEnd = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${props => props.theme.color.fail};
  margin-bottom: ${props => props.theme.spacing[2]}px;
  margin-top: ${props => props.theme.spacing[2]}px;
`

export default ProposalCards