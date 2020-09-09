import { useCallback, useEffect, useState } from 'react'

import BigNumber from 'bignumber.js'
import { useWallet } from 'use-wallet'

import { getWinePoolStaked, getBrewMaster } from '../grapUtils/index'
import useGrap from './useGrap'

const useWinePoolStakedBalance = (pid: number) => {
  const [balance, setBalance] = useState(new BigNumber(0))
  const { account }: { account: string } = useWallet()
  const grap = useGrap()
  const brewMaster = getBrewMaster(grap)

  const fetchBalance = useCallback(async () => {
    const balance = await getWinePoolStaked(brewMaster, pid, account)
    setBalance(new BigNumber(balance))
  }, [account, brewMaster, pid])

  useEffect(() => {
    if (account && grap) {
      fetchBalance()
    }
  }, [account, pid, setBalance, grap, fetchBalance])

  return balance
}

export default useWinePoolStakedBalance