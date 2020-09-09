import { useCallback } from 'react'

import useGrap from './useGrap'
import { useWallet } from 'use-wallet'
import { provider } from 'web3-core'
import { Contract } from 'web3-eth-contract'

import { approve, getBrewMaster } from '../grapUtils/index'

const useWinePoolApprove = (lpContract: Contract) => {
  const { account }: { account: string; ethereum: provider } = useWallet()
  const grap = useGrap()
  const brewMaster = getBrewMaster(grap)

  const handleApprove = useCallback(async () => {
    try {
      const tx = await approve(lpContract, brewMaster, account)
      return tx
    } catch (e) {
      return false
    }
  }, [account, lpContract, brewMaster])

  return { onApprove: handleApprove }
}

export default useWinePoolApprove