import { createContext } from 'react'
import { ProposalsContext } from './types'

const context = createContext<ProposalsContext>({
  proposals: []
})

export default context