import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

function App() {
  return (
    <div style={{ padding: 40 }}>
      <h2>Solana Counter dApp</h2>
      <WalletMultiButton />
    </div>
  )
}

export default App
