import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets'

import '@solana/wallet-adapter-react-ui/styles.css'

const wallets = [new PhantomWalletAdapter()]

ReactDOM.createRoot(document.getElementById('root')).render(
  <ConnectionProvider endpoint="http://localhost:8899">
    <WalletProvider wallets={wallets} autoConnect>
      <WalletModalProvider>
        <App />
      </WalletModalProvider>
    </WalletProvider>
  </ConnectionProvider>
)
