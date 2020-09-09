import { useCallback, useEffect, useState } from 'react'

import BigNumber from 'bignumber.js'
import useGrap from './useGrap'
import { useWallet } from 'use-wallet'
import { provider } from 'web3-core'
import { Contract } from 'web3-eth-contract'

import { getAllowance } from '../utils/erc20'
import { getBrewMaster } from '../grapUtils/index'

const useWinePoolAllowance = (lpContract: Contract) => {
  const [allowance, setAllowance] = useState(new BigNumber(0))
  const { account }: { account: string; ethereum: provider } = useWallet()
  const grap = useGrap()
  const brewMaster = getBrewMaster(grap)

  const fetchAllowance = useCallback(async () => {
    const allowance = await getAllowance(
      lpContract,
      brewMaster,
      account,
    )
    setAllowance(new BigNumber(allowance))
  }, [account, brewMaster, lpContract])

  useEffect(() => {
    if (account && brewMaster && lpContract) {
      fetchAllowance()
    }
    let refreshInterval = setInterval(fetchAllowance, 10000)
    return () => clearInterval(refreshInterval)
  }, [account, brewMaster, fetchAllowance, lpContract])

  return allowance
}

export default useWinePoolAllowance