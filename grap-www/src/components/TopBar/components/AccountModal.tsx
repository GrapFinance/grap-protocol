import React, { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import { grap as grapAddress } from '../../../constants/tokenAddresses'
import useTokenBalance from '../../../hooks/useTokenBalance'
import { getDisplayBalance } from '../../../utils/formatBalance'

import { getCurrentVotes } from '../../../grapUtils'
import useGrap from '../../../hooks/useGrap'
import useDelegate from '../../../hooks/useDelegate'
import { useWallet } from 'use-wallet'

import Button from '../../Button'
import CardIcon from '../../CardIcon'
import IconButton from '../../IconButton'
import { AddIcon, RemoveIcon } from '../../icons'
import Label from '../../Label'
import Modal, { ModalProps } from '../../Modal'
import ModalTitle from '../../ModalTitle'


const AccountModal: React.FC<ModalProps> = ({ onDismiss }) => {
  const { account } = useWallet()
  const grap = useGrap()

  const [votes, setvotes] = useState("")

  const handleSignOutClick = useCallback(() => {
    onDismiss!()
  }, [onDismiss])

  const onDelegateSelf = useDelegate().onDelegate
  const onDelegateDev = useDelegate("0x00007569643bc1709561ec2E86F385Df3759e5DD").onDelegate

  const grapBalance = useTokenBalance(grapAddress)
  const displayBalance = useMemo(() => {
    return getDisplayBalance(grapBalance)
  }, [grapBalance])

  const fetchVotes = useCallback(async () => {
    const votes = await getCurrentVotes(grap, account)
    setvotes(getDisplayBalance(votes))
  }, [grap, setvotes])

  useEffect(() => {
    if (grap) {
      fetchVotes()
    }
  }, [grap])
  
  
  return (
    <Modal>
      <ModalTitle text="My Account" />

      <StyledBalanceWrapper>
        <CardIcon>🍇</CardIcon>
        <StyledBalance>
          <StyledValue>{displayBalance}</StyledValue>
          <Label text="GRAP Balance" />
        </StyledBalance>
        <StyledBalanceActions>
        </StyledBalanceActions>
        <StyledBalance>
          <StyledValue>{votes}</StyledValue>
          <Label text="Current Votes" />
        </StyledBalance>
        <StyledBalanceActions>
        </StyledBalanceActions>
      </StyledBalanceWrapper>

      <StyledSpacer />
      {votes != "" && votes == "0.000" &&
        <Label text="Not yet?" /> && 
        <Button
          onClick={onDelegateSelf}
          text="Setup Vote"
        />
      }
      <StyledSpacer />
      <Button
        onClick={onDelegateDev}
        text="Share votes to Devs"
      />
      <StyledSpacer />
      <Button
        onClick={handleSignOutClick}
        text="Sign out"
      />
      <StyledSpacer />
    </Modal>
  )
}

const StyledSpacer = styled.div`
  height: ${props => props.theme.spacing[4]}px;
  width: ${props => props.theme.spacing[4]}px;
`

const StyledValue = styled.div`
  color: ${props => props.theme.color.grey[600]};
  font-size: 36px;
  font-weight: 700;
`

const StyledBalance = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`

const StyledBalanceWrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  margin-bottom: ${props => props.theme.spacing[4]}px;
`

const StyledBalanceIcon = styled.div`
  font-size: 36px;
  margin-right: ${props => props.theme.spacing[3]}px;
`

const StyledBalanceActions = styled.div`
  align-items: center;
  display: flex;
  margin-top: ${props => props.theme.spacing[4]}px;
`

export default AccountModal
