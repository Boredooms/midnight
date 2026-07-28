# Midnight Confidential Voting — Rise in Level 1 Challenge

Privacy-preserving voting DApp on the Midnight Network. Individual voter ballots are proven off-chain via Compact ZK circuits — tallies are publicly verifiable on-chain.

## Links

| Resource | URL |
|----------|-----|
| **Live Demo** | [https://dist-pi-sandy-35.vercel.app](https://dist-pi-sandy-35.vercel.app) |
| **Demo Video** | [docs/demo-video.mp4](docs/demo-video.mp4) |
| **Contract Address (Preprod)** | `0200dbf964f541e1950883f5b2f539b66fd6111e46ce8e6e9551fbdd180114d5` |

## Privacy Claim

**Individual votes are private.** Each voter's ballot is proven off-chain via a ZK proof generated locally. The proof demonstrates that the voter made a valid selection (candidate 0 or 1) without revealing which candidate was chosen. Only aggregate tally counters are public on-chain — individual vote choices never appear on the ledger.

The privacy mechanism uses:
- `voterSecretKey()` witness — secret key never leaves the client
- `voterPublicKey()` — DApp-specific identity via `persistentHash`, unlinkable across elections
- Voter choice is proven valid in-circuit but never disclosed on-chain

## Project Structure

```
midnight/demo/
├── contract/                    # Compact smart contract
│   └── src/
│       └── confidential-voting.compact   # ZK voting contract source
├── api/                         # TypeScript API wrapper (VotingAPI class)
├── confidential-voting-ui/      # React frontend (Vite + MUI + Three.js)
├── confidential-voting-cli/     # CLI for contract deployment
└── docs/
    └── demo-video.mp4           # Demo: wallet connect + circuit call
```

## Smart Contract

Written in Midnight's Compact language (`contract/src/confidential-voting.compact`):

| Circuit | Description | Privacy |
|---------|-------------|---------|
| `createElection(title)` | Initialize election (UNINITIALIZED → OPEN) | Owner identity hidden via ZK |
| `vote(candidateIndex)` | Cast vote | Choice proven valid without revealing it |
| `finalizeElection()` | Close election (OPEN → FINALIZED) | Owner proof without identity disclosure |

Compiled with Compact compiler v0.31.1, runtime v0.16.0.

## Requirements Met

- ✅ Wallet connect / disconnect (Lace + 1AM support with selection dialog)
- ✅ Circuit called from frontend (`createElection`, `vote`, `finalizeElection`)
- ✅ Observable privacy behavior (vote choice proven without being shown)
- ✅ Contract deployed to Preprod with verifiable address
- ✅ Multiple meaningful commits

## Quick Start

```bash
# 1. Start proof server
docker run -d -p 6300:6300 midnightntwrk/proof-server:8.0.3 midnight-proof-server --network preprod

# 2. Run the UI
cd confidential-voting-ui
npm install
npm run dev

# 3. Open http://localhost:5173 and connect wallet
```

For local development without external faucet:
```bash
# Clone and start local Midnight network
git clone https://github.com/midnightntwrk/midnight-local-dev.git
cd midnight-local-dev && npm install && npm start
```

## Tech Stack

- **Contract:** Compact 0.23 (Midnight's ZK DSL)
- **Frontend:** React 19, MUI 9, Three.js, Framer Motion, react-router-dom
- **Blockchain:** Midnight.js SDK, DApp Connector API v4
- **Proving:** midnightntwrk/proof-server:8.0.3
- **Deploy:** Vercel (static SPA)

## License

MIT
