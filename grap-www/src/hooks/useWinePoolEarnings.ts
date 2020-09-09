import { useCallback, useEffect, useState } from 'react'
import { provider } from 'web3-core'

import BigNumber from 'bignumber.js'
import { useWallet } from 'use-wallet'

import { getPendingTickets, getBrewMaster } from '../grapUtils/index'
import useGrap from './useGrap'
import useBlock from './useBlock'

const useWinePoolEarnings = (pid: number) => {
  const [balance, setBalance] = useState(new BigNumber(0))
  const {
    account,
    ethereum,
  }: { account: string; ethereum: provider } = useWallet()
  const grap = useGrap()
  const brewMaster = getBrewMaster(grap)
  const block = useBlock()

  const fetchBalance = useCallback(async () => {
    const balance = await getPendingTickets(brewMaster, pid, account)
    setBalance(new BigNumber(balance))
  }, [account, brewMaster, pid])

  useEffect(() => {
    if (account && brewMaster && grap) {
      fetchBalance()
    }
  }, [account, block, fetchBalance, brewMaster, setBalance, grap])

  return balance
}

export default useWinePoolEarnings