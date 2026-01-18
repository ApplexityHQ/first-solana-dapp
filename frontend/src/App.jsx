import { useEffect, useMemo, useState } from "react"
import { AnchorProvider, Program, web3 } from "@coral-xyz/anchor"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"

import idl from "./idl/anchor.json"

const PROGRAM_ID = new web3.PublicKey(
  "7bakb28179KMC9fjosEHtFejynWhkrC8oWLXdZybb8gg"
)


export default function App() {
  const { connection } = useConnection()
  const wallet = useWallet()

  const [counter, setCounter] = useState(null)
  const [loading, setLoading] = useState(false)

  // -------------------------------
  // Anchor Provider
  // -------------------------------
  const provider = useMemo(() => {
    if (!wallet.publicKey) return null
    return new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    })
  }, [connection, wallet])

  // -------------------------------
  // Anchor Program
  // -------------------------------
  const program = useMemo(() => {
    if (!provider) return null
    return new Program(idl, PROGRAM_ID, provider)
  }, [provider])

  // -------------------------------
  // PDA Derivation (CORE LOGIC)
  // -------------------------------
  const getCounterPDA = async () => {
    return await web3.PublicKey.findProgramAddress(
      [Buffer.from("counter"), wallet.publicKey.toBuffer()],
      PROGRAM_ID
    )
  }

  // -------------------------------
  // Fetch Counter (auto-load)
  // -------------------------------
  const fetchCounter = async () => {
    if (!program || !wallet.publicKey) return

    try {
      const [counterPda] = await getCounterPDA()
      const account = await program.account.counter.fetch(counterPda)
      setCounter(account.count.toString())
    } catch (err) {
      // PDA not initialized yet — totally fine
      setCounter(null)
    }
  }

  // -------------------------------
  // Initialize Counter (once)
  // -------------------------------
  const initialize = async () => {
    if (!program || !wallet.publicKey) return

    setLoading(true)
    try {
      const [counterPda] = await getCounterPDA()

      await program.methods
        .initialize()
        .accounts({
          counter: counterPda,
          authority: wallet.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc()

      await fetchCounter()
    } finally {
      setLoading(false)
    }
  }

  // -------------------------------
  // Increment Counter
  // -------------------------------
  const increment = async () => {
    if (!program || !wallet.publicKey) return

    setLoading(true)
    try {
      const [counterPda] = await getCounterPDA()

      await program.methods
        .increment()
        .accounts({
          counter: counterPda,
          authority: wallet.publicKey,
        })
        .rpc()

      await fetchCounter()
    } finally {
      setLoading(false)
    }
  }

  // -------------------------------
  // Auto-load on wallet connect
  // -------------------------------
  useEffect(() => {
    fetchCounter()
  }, [program])

  // -------------------------------
  // UI
  // -------------------------------
  return (
    <div style={{ padding: 40 }}>
      <h2>Solana PDA Counter</h2>

      <WalletMultiButton />

      <br /><br />

      {counter === null ? (
        <button onClick={initialize} disabled={loading}>
          Initialize My Counter
        </button>
      ) : (
        <>
          <h3>My Counter: {counter}</h3>
          <button onClick={increment} disabled={loading}>
            Increment
          </button>
        </>
      )}
    </div>
  )
}
