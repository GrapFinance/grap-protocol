import { useContext } from 'react'
import { Context as ProposalsContext } from '../contexts/Proposals'

const useProposals = () => {
  const { proposals } = useContext(ProposalsContext)
  return [proposals]
}

export default useProposals