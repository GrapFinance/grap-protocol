import { useCallback } from 'react'

import useGrap from './useGrap'
import { useWallet } from 'use-wallet'

import { harvestWinePool, getBrewMaster } from '../grapUtils/index'

const useWinePoolReward = (pid: number) => {
  const { account } = useWallet()
  const grap = useGrap()
  const brewMaster = getBrewMaster(grap)

  const handleReward = useCallback(async () => {
    const txHash = await harvestWinePool(brewMaster, pid, account)
    console.log(txHash)
    return txHash
  }, [account, brewMaster, pid])

  return { onReward: handleReward }
}

export default useWinePoolReward