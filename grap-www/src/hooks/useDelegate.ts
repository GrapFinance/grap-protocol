import { useCallback } from 'react'

import { useWallet } from 'use-wallet'

import { delegate } from '../grapUtils'
import useGrap from './useGrap'

const useDelegate = (address?: string) => {
  const { account } = useWallet()
  const grap = useGrap()

  const handleDelegate = useCallback(async () => {
    const txHash = await delegate(grap ,address || account, account)
    console.log(txHash)
  }, [account, address])

  return { onDelegate: handleDelegate }
}

export default useDelegate