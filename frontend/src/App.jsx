import { Buffer } from "buffer"
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

    return Program.at(PROGRAM_ID, provider)
  }, [provider])





  // -------------------------------
  // PDA Derivation (CORE LOGIC)
  // -------------------------------
    const getCounterPDA = () => {
      if (!wallet.publicKey) {
        throw new Error("Wallet not ready")
      }

      return web3.PublicKey.findProgramAddressSync(
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
      console.log("Counter not initialized yet (safe)", err?.message)
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
    const [counterPda] = getCounterPDA()

    await program.methods
      .initialize()
      .accounts({
        counter: counterPda,
        authority: wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc()

    await fetchCounter()
  } catch (err) {
    console.error("ANCHOR INIT ERROR:", err)
    alert(err?.error?.errorMessage || err?.message)
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
    const [counterPda] = getCounterPDA()

    await program.methods
      .increment()
      .accounts({
        counter: counterPda,
        authority: wallet.publicKey,
      })
      .rpc()

    await fetchCounter()
  } catch (err) {
    console.error("ANCHOR INCREMENT ERROR:", err)
    alert(err?.error?.errorMessage || err?.message)
  } finally {
    setLoading(false)
  }
}


  // -------------------------------
  // Auto-load on wallet connect
  // -------------------------------
  useEffect(() => {
    if (program && wallet.connected) {
      fetchCounter()
    }
  }, [program, wallet.connected])

  // -------------------------------
  // Hard Safety Render Guard
  // -------------------------------

  if (!wallet.connected) {
    return (
      <div style={{ padding: 40 }}>
        <h2>Solana PDA Counter</h2>
        <WalletMultiButton />
        <p>Connect your wallet to continue.</p>
      </div>
    )
  }

  if (!program) {
  return (
    <div style={{ padding: 40 }}>
      <h2>Solana PDA Counter</h2>
      <WalletMultiButton />
      <p>Initializing program…</p>
    </div>
  )
}



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
