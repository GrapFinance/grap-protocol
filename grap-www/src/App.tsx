import React, { useCallback, useEffect, useState } from 'react'
import {
  HashRouter as Router,
  Route,
  Switch,
} from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { UseWalletProvider } from 'use-wallet'

import MobileMenu from './components/MobileMenu'
import TopBar from './components/TopBar'
import DisclaimerModal from './components/DisclaimerModal'

import ProposalsProvider from './contexts/Proposals'
import FarmsProvider from './contexts/Farms'
import ModalsProvider from './contexts/Modals'
import GrapProvider from './contexts/GrapProvider'
import TransactionProvider from './contexts/Transactions'

import useModal from './hooks/useModal'

import Farms from './views/Farms'
import Advancements from './views/Advancements'
import Vote from './views/Vote'
import Home from './views/Home'
import Statics from './views/Statics'
import theme from './theme'

const App: React.FC = () => {
  const [mobileMenu, setMobileMenu] = useState(false)

  const handleDismissMobileMenu = useCallback(() => {
    setMobileMenu(false)
  }, [setMobileMenu])

  const handlePresentMobileMenu = useCallback(() => {
    setMobileMenu(true)
  }, [setMobileMenu])
  return (
    <Providers>
      <Router>
        <TopBar onPresentMobileMenu={handlePresentMobileMenu} />
        <MobileMenu onDismiss={handleDismissMobileMenu} visible={mobileMenu} />
        <Switch>
          <Route path="/" exact>
            <Home />
          </Route>
          <Route path="/farms">
            <Farms />
          </Route>
          <Route path="/advancements">
            <Advancements />
          </Route>
          <Route path="/vote">
            <Vote />
          </Route>
          <Route path="/stats">
            <Statics />
          </Route>
        </Switch>
      </Router>
      <Disclaimer />
    </Providers>
  )
}

const Providers: React.FC = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <UseWalletProvider chainId={1}>
        <GrapProvider>
          <TransactionProvider>
            <FarmsProvider>
              <ProposalsProvider>
                <ModalsProvider>
                  {children}
                </ModalsProvider>
              </ProposalsProvider>
            </FarmsProvider>
          </TransactionProvider>
        </GrapProvider>
      </UseWalletProvider>
    </ThemeProvider>
  )
}

const Disclaimer: React.FC = () => {

  const markSeen = useCallback(() => {
    localStorage.setItem('disclaimer', 'seen')
  }, [])

  const [onPresentDisclaimerModal] = useModal(<DisclaimerModal onConfirm={markSeen} />)

  useEffect(() => {
    const seenDisclaimer = localStorage.getItem('disclaimer')
    // if (!seenDisclaimer) {
      onPresentDisclaimerModal()
    // }
  }, [])

  return (
    <div />
  )
}

export default App
