import { useCallback, useEffect, useState } from 'react'

import BigNumber from '../oliv/node_modules/bignumber.js.js'
import { useWallet } from 'use-wallet'
import { Contract } from "web3-eth-contract"

import { getStaked } from '../grapUtils'
import useGrap from './useGrap'

const useStakedBalance = (pool: Contract) => {
  const [balance, setBalance] = useState(new BigNumber(0))
  const { account }: { account: string } = useWallet()
  const grap = useGrap()

  const fetchBalance = useCallback(async () => {
    const balance = await getStaked(grap, pool, account)
    setBalance(new BigNumber(balance))
  }, [account, pool, grap])

  useEffect(() => {
    if (account && pool && grap) {
      fetchBalance()
    }
  }, [account, pool, setBalance, grap, fetchBalance])

  return balance
}

export default useStakedBalance