  
import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'

import { useWallet } from 'use-wallet'

import { useParams } from 'react-router-dom'

import Button from '../../components/Button'
import Card from '../../components/Card'
import CardContent from '../../components/CardContent'
import Spacer from '../../components/Spacer'

import useGrap from '../../hooks/useGrap'

import { getDisplayBalance } from '../../utils/formatBalance'

import { getProposal, getTotalVotes, getQuorumVotes, getProposalStatus, castVote } from '../../grapUtils'

import { Proposal, ProposalStatus } from '../../contexts/Proposals'

import {PROPOSALSTATUSCODE} from '../../grap/lib/constants'



const ProposalPage: React.FC = () => {
  const { proposalId } = useParams()
  const [proposal, setProposal] =  useState<Proposal>({} as Proposal)
  const [{totalGrapVotes, forVotes, againstVotes, quorumVotes, totalVotes}, setVotes] = useState({totalGrapVotes:0, forVotes:0, againstVotes:0, totalVotes:0, quorumVotes:0})
  const { account } = useWallet()
  const grap = useGrap()


  const handleVoteForClick = useCallback(() => {
    castVote(grap, proposal.id, true, account )
  }, [account, grap, proposal.id])

  const handleVoteAgainstClick = useCallback(() => {
    castVote(grap, proposal.id, false, account )
  }, [account, grap, proposal.id])

  const fetchProposal = useCallback(async () => {
    const proposal = await getProposal(grap, proposalId)
    setProposal(proposal)
  }, [grap, proposalId])

  const fetchVotes = useCallback(async () => {
    const proposalStatus:ProposalStatus = await getProposalStatus(grap, proposalId)
    const totalGrapVote = await getTotalVotes(grap)
    const forVotes = new BigNumber(proposalStatus.forVotes).div(10**6)
    const againstVotes = new BigNumber(proposalStatus.againstVotes).div(10**6)
    const quorumCount = await getQuorumVotes(grap)
    setVotes({
      totalGrapVotes: Number(getDisplayBalance(totalGrapVote)),
      forVotes: Number(getDisplayBalance(forVotes)),
      againstVotes: Number(getDisplayBalance(againstVotes)),
      totalVotes: Number(getDisplayBalance(forVotes.plus(againstVotes))),
      quorumVotes: Number(getDisplayBalance(quorumCount))
    })
  }, [grap, proposalId])

  useEffect(() => {
    if (grap) {
      fetchProposal()
      fetchVotes()
    }
  }, [fetchProposal, fetchVotes, grap])

  return (
    <Card>
      {proposal ? (
        <CardContent>
        <StyledTitle>For votes: {new BigNumber(forVotes).toFixed(2)}</StyledTitle>
        <StyledTitle>Against votes: {new BigNumber(againstVotes).toFixed(2)}</StyledTitle>
        <StyledTitle>Total votes: {new BigNumber(totalVotes).toFixed(2)}</StyledTitle>
        <Spacer />
        <StyledCheckpoints>
          <StyledCheckpoint left={quorumVotes / totalGrapVotes}>
            <StyledCheckpointText left={-28}>
              <div>Quorum Votes</div>
              <div>{ String(quorumVotes) }</div>
            </StyledCheckpointText>
          </StyledCheckpoint>
        </StyledCheckpoints>
        <StyledMeter>
          <StyledMeterInner width={Math.max(1000, totalVotes) / totalGrapVotes} />
        </StyledMeter>
        <Spacer />
        <StyledDetails>
          <StyledProposalTitle>
            Proposer: 
            <StyledLink target="__blank" href={`https://etherscan.io/address/${proposal.proposer}`}>{proposal.proposer}</StyledLink>
          </StyledProposalTitle>
          <StyledProposalTitle>
            Description: 
            <StyledProposalContent>
              {proposal.description}
            </StyledProposalContent>
          </StyledProposalTitle>
          <StyledProposalTitle>
            StartBlock: 
            <StyledLink target="__blank" href={`https://etherscan.io/block/${proposal.startBlock}`}>{proposal.startBlock}</StyledLink>
          </StyledProposalTitle>
          <StyledProposalTitle>
            EndBlock: 
            <StyledProposalContent>
            <StyledLink target="__blank" href={`https://etherscan.io/block/${proposal.endBlock}`}>{proposal.endBlock}</StyledLink>
            </StyledProposalContent>
          </StyledProposalTitle>
          <StyledProposalTitle>
            Targets: 
            <StyledProposalContent>
            <StyledLink target="__blank" href={`https://etherscan.io/address/${proposal.targets}`}>{proposal.targets}</StyledLink>
            </StyledProposalContent>
          </StyledProposalTitle>
          <StyledProposalTitle>
            Signatures: 
            <StyledProposalContent>
              {proposal.signatures}
            </StyledProposalContent>
          </StyledProposalTitle>
          <StyledProposalTitle>
            Transaction: 
            <StyledProposalContent>
            <StyledLink target="__blank" href={`https://etherscan.io/tx/${proposal.transactionHash}`}>{proposal.transactionHash}</StyledLink>
            </StyledProposalContent>
          </StyledProposalTitle>
        </StyledDetails>
        { proposal.status === PROPOSALSTATUSCODE.CREATED 
          &&
          <div>
            <Button text="For" onClick={handleVoteForClick} />
            <Button text="Against" onClick={handleVoteAgainstClick} />
          </div>
        }
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 32,
          }}>
        </div>
      </CardContent>
      ) : (
        <Button
          size="sm"
          text="My Wallet"
        />
      )}
    </Card>
  )
}

const StyledTitle = styled.div`
  font-size: 32px;
  font-weight: 700;
  text-align: center;
  height: 56px;
  line-height: 56px;
`

const StyledCheckpoints = styled.div`
  position: relative;
  width: 80%;
  height: 56px;
`

interface StyledCheckpointProps {
  left: number
}
const StyledCheckpoint = styled.div<StyledCheckpointProps>`
  position: absolute;
  left: ${props => props.left}%;
  z-index: 1;
  &:after {
    content: "";
    position: absolute;
    width: 1px;
    background-color: ${props => props.theme.color.grey[400]};
    height: 28px;
    left: 0;
    top: 40px;
  }
`

const StyledCheckpointText = styled.div<StyledCheckpointProps>`
  position: absolute;
  left: ${props => props.left}px;
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
  color: ${props => props.theme.color.grey[600]};
  text-align: center;
`

const StyledMeter = styled.div`
  box-sizing: border-box;
  position: relative;
  height: 12px;
  border-radius: 16px;
  width: 100%;
  background-color: ${props => props.theme.color.grey[300]};
  padding: 2px;
`

const StyledDetails = styled.div`
  margin-bottom: ${props => props.theme.spacing[4]}px;
  text-align: center;
`
const StyledProposalTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
  display: flex;
  margin-bottom: 6px;
  flex-direction: column;
  color: ${props => props.theme.color.grey[600]};
  text-align: center;
`

const StyledProposalContent = styled.div`
  font-size: 14px;
  font-weight: 500;
  text-align: center;
`


interface StyledMeterInnerProps {
  width: number
}
const StyledMeterInner = styled.div<StyledMeterInnerProps>`
  height: 100%;
  background-color: ${props => props.theme.color.secondary.main};
  border-radius: 12px;
  width: ${props => props.width}%;
`
const StyledLink = styled.a`
  color: ${props => props.theme.color.grey[600]};
  font-weight: 500;
  font-size: 12px;
  overflow-wrap: break-word;
  word-break:break-all;
`

export default ProposalPage