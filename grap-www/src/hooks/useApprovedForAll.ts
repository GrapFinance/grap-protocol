import { useCallback, useEffect, useState } from 'react'

import BigNumber from '../oliv/node_modules/bignumber.js.js'
import { useWallet } from 'use-wallet'
import { provider } from 'web3-core'
import { Contract } from "web3-eth-contract"

import useGrap from './useGrap'

import { getApproveAll } from '../grapUtils/index'

const useApprovedForAll = () => {
  const [allowance, setAllowance] = useState(Boolean)
  const grap = useGrap()
  const { account }: { account: string, ethereum: provider } = useWallet()

  const fetchAllowance = useCallback(async () => {
    const isApproveAll = await getApproveAll(grap, account)
    setAllowance(isApproveAll)
  }, [account, grap])

  useEffect(() => {
    if (account && grap) {
      fetchAllowance()
    }
    let refreshInterval = setInterval(fetchAllowance, 10000)
    return () => clearInterval(refreshInterval)
  }, [account, grap])

  return allowance
}

export default useApprovedForAll