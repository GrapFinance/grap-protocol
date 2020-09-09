import { useCallback } from 'react'

import useGrap from './useGrap'
import { useWallet } from 'use-wallet'

import { winePoolUnstake, getBrewMaster } from '../grapUtils/index'

const useWinePoolUnstake = (pid: number) => {
  const { account } = useWallet()
  const grap = useGrap()
  const brewMaster = getBrewMaster(grap)

  const handleUnstake = useCallback(
    async (amount: string) => {
      const txHash = await winePoolUnstake(brewMaster, pid, amount, account)
      console.log(txHash)
    },
    [account, brewMaster, pid],
  )

  return { onUnstake: handleUnstake }
}

export default useWinePoolUnstake