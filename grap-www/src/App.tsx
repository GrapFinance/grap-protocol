import React from 'react'
import {
  HashRouter as Router,
  Route,
  Switch,
} from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { UseWalletProvider } from 'use-wallet'

import ProposalsProvider from './contexts/Proposals'
import FarmsProvider from './contexts/Farms'
import ModalsProvider from './contexts/Modals'
import GrapProvider from './contexts/GrapProvider'
import TransactionProvider from './contexts/Transactions'

import Farms from './views/Farms'
import Vote from './views/Vote'
import Home from './views/Home'
import Statics from './views/Statics'
import theme from './theme'

const App: React.FC = () => {
  return (
    <Providers>
      <Router>
        <Switch>
          <Route path="/" exact>
            <Home />
          </Route>
          <Route path="/farms">
            <Farms />
          </Route>
          <Route path="/vote">
            <Vote />
          </Route>
          <Route path="/statics">
            <Statics />
          </Route>
        </Switch>
      </Router>
    </Providers>
  )
}

const Providers: React.FC = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <UseWalletProvider chainId={1}>
        <GrapProvider>
          <TransactionProvider>
            <ModalsProvider>
              <FarmsProvider>
                <ProposalsProvider>
                  {children}
                </ProposalsProvider>
              </FarmsProvider>
            </ModalsProvider>
          </TransactionProvider>
        </GrapProvider>
      </UseWalletProvider>
    </ThemeProvider>
  )
}

export default App
