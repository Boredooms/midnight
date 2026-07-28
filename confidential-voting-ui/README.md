# Confidential Voting on Midnight

A privacy-preserving voting DApp built on the Midnight Network using Compact smart contracts and zero-knowledge proofs.

## Live Demo

🌐 **Live URL:** [https://dist-pi-sandy-35.vercel.app](https://dist-pi-sandy-35.vercel.app)

🎥 **Demo Video:** [docs/demo-video.mp4](docs/demo-video.mp4) — Wallet connect + circuit call demonstration

## Privacy Claim

**Individual votes are private.** Each voter's ballot choice is proven off-chain via a ZK proof generated locally on the voter's machine. The proof demonstrates that the voter made a valid selection (candidate 0 or 1) without revealing which candidate was chosen. Only the aggregate tally counters are public on-chain — individual vote choices never appear on the ledger.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  BROWSER (CLIENT)                         │
│  React UI → Voting API → Proof Server (localhost:6300)   │
│  Wallet Bridge → Private State (in-memory, never sent)   │
└──────────────────────────┬──────────────────────────────┘
                           │ ZK Proof + Balanced TX
                           ▼
┌─────────────────────────────────────────────────────────┐
│              MIDNIGHT NETWORK (PREPROD)                   │
│  Indexer (GraphQL/WS) ← Compact Contract → Ledger       │
│  State: UNINITIALIZED → OPEN → FINALIZED                 │
│  Public: candidate0Tally, candidate1Tally, totalVotes    │
└─────────────────────────────────────────────────────────┘
```

## Compact Contract

Located at `contract/src/confidential-voting.compact`:

- **`createElection(title)`** — Initializes an election (UNINITIALIZED → OPEN)
- **`vote(candidateIndex)`** — Casts a ZK-proven confidential vote
- **`finalizeElection()`** — Closes the election (OPEN → FINALIZED, creator-only)

Privacy is achieved through:
- `voterSecretKey()` witness — secret key never leaves the client
- `voterPublicKey()` — DApp-specific public key via `persistentHash`, unlinkable across elections
- Voter choice is proven valid in-circuit but not revealed on-chain

## Deployed Contract

- **Network:** Midnight Preprod
- **Contract Address:** `0200dbf964f541e1950883f5b2f539b66fd6111e46ce8e6e9551fbdd180114d5`
- **Compiler:** Compact 0.31.1
- **Runtime:** 0.16.0

## Prerequisites

- [Lace wallet](https://chromewebstore.google.com/detail/lace/gafhhkghbfjjkeiendhlofajokpaflmk) or [1AM wallet](https://chromewebstore.google.com/detail/1am/bphnkdkcnfhompoegfpgnkidcjfbojjp) extension
- Docker (for the proof server)
- Node.js 22+
- Wallet configured for Preprod with tNIGHT + tDUST

## Quick Start

### 1. Start the proof server

```bash
docker run -d -p 6300:6300 --name midnight-proof-server \
  midnightntwrk/proof-server:8.0.3 midnight-proof-server --network preprod
```

### 2. Configure your wallet

- Set network to **Preprod**
- Set proof server to `http://localhost:6300`
- Ensure you have tDUST (generate from tNIGHT in wallet)

### 3. Install and run

```bash
cd confidential-voting-ui
npm install
npm run dev
```

Open `http://localhost:5173` in Chrome with your wallet extension.

### 4. Deploy or join a contract

- Click **"Deploy Election"** to create a fresh contract on preprod
- Or paste an existing contract address to join

## Project Structure

```
confidential-voting-ui/
├── src/
│   ├── pages/           # Landing, Features, Architecture, Demo, App pages
│   ├── components/      # Navbar, Header, VotingCard, ParticleField, WalletSelectDialog
│   ├── contexts/        # WalletContext, DeployedVotingContext, BrowserDeployedVotingManager
│   ├── hooks/           # useDeployedVotingContext
│   └── config/          # MUI theme
├── public/
│   ├── keys/            # ZK prover/verifier keys
│   └── zkir/            # Compiled ZK intermediate representation
├── vercel.json          # Vercel SPA deployment config
└── .env.preprod         # Environment configuration
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_NETWORK_ID` | `preprod` | Midnight network to connect to |
| `VITE_LOGGING_LEVEL` | `info` | Pino log level |
| `VITE_CONTRACT_ADDRESS` | (see .env) | Default contract address for "Join Demo" |

## Deployment (Vercel)

```bash
npm run build
vercel --prod
```

The `vercel.json` handles SPA routing and caches ZK assets with immutable headers.

## Tech Stack

- **Contract:** Compact 0.23 (Midnight's ZK language)
- **Frontend:** React 19, MUI 9, Three.js, Framer Motion
- **Blockchain:** Midnight.js SDK, DApp Connector API v4
- **Proving:** midnightntwrk/proof-server:8.0.3 (Docker)
- **Build:** Vite 8, TypeScript

## Wallet Support

The DApp supports multiple Midnight wallets via the DApp Connector API v4:

| Wallet | Proving | Notes |
|--------|---------|-------|
| **Lace** | Local proof server required | Set proof server to localhost:6300 |
| **1AM** | In-browser WASM proving | Has built-in Proof Station |

When multiple wallets are detected, a selection dialog appears.

## License

MIT
