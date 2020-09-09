import { useCallback } from 'react'

import useGrap from './useGrap'
import { useWallet } from 'use-wallet'

import { winePoolStake, getBrewMaster } from '../grapUtils/index'

const useWinePoolStake = (pid: number) => {
  const { account } = useWallet()
  const grap = useGrap()

  const handleStake = useCallback(
    async (amount: string) => {
      const txHash = await winePoolStake(
        getBrewMaster(grap),
        pid,
        amount,
        account,
      )
      console.log(txHash)
    },
    [account, grap, pid],
  )

  return { onStake: handleStake }
}

export default useWinePoolStake