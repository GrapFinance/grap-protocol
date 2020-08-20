import { useCallback } from 'react'

import { useWallet } from 'use-wallet'
import { Grap } from '../grap'
import { rebase } from '../grapUtils'

import useGrap from '../hooks/useGrap'

const useRebase = () => {
  const { account } = useWallet()
  const grap = useGrap()

  const handleRebase = useCallback(async () => {
    const txHash = await rebase(grap, account)
    console.log(txHash)
  }, [account, grap])

  return { onRebase: handleRebase }
}

export default useRebase