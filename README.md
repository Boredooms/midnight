# Confidential Voting DApp — Midnight Blockchain

> **Rise In Level 1 Builder Challenge Submission**
> A privacy-preserving decentralized voting platform built on Midnight using Compact smart contracts, 1AM Wallet integration, and Zero-Knowledge proofs.

---

## 📸 High-Craft Monochrome DApp Preview

![Confidential Voting DApp Dashboard](file:///C:/Users/devar/.gemini/antigravity-ide/brain/5298cde7-fa49-4dd0-9c25-92865c96528c/full_page_ui_1785093718595.png)

*Figure 1: Full-page view of the high-craft monochrome Confidential Voting DApp featuring 1AM Wallet integration, Zero-Knowledge architecture cards, active election tallies, and interactive deployment documentation.*

---

## 📌 Project Overview

The **Confidential Voting DApp** enables organizations and communities to conduct tamper-proof, transparent elections while protecting voter privacy. By leveraging Midnight's Zero-Knowledge (ZK) execution environment, voters cast ballots confidentially without exposing their choices or identity, while anyone can publicly verify that the election outcome is 100% accurate.

---

## ✨ Key Features & Architecture

- 🔒 **Zero-Knowledge Privacy**: Individual votes and voter secret keys remain strictly private off-chain via Compact ZK circuits.
- 🗳️ **Verifiable Public Tally**: Public ledger state tracks candidate tallies and total vote counts transparently.
- 🛡️ **Double-Voting Prevention**: Unique ZK private state nullifier commitments prevent double voting.
- 🔑 **Election Creator Privileges**: Election creators can open new elections and finalize voting rounds.
- 👛 **Midnight 1AM Wallet Connector**: Native integration with 1AM Wallet (`window.midnight`) for transaction balancing, signing, and submission on Midnight Preprod.
- 🎨 **Ultra-Monochrome Design**: Modern OLED black aesthetic (`#000000` / `#09090c`), subtle glassmorphic elements, smooth scrolling, and hover elevations.

---

## 🔒 Privacy Model

```
+-------------------------------------------------------------------+
|                        OFF-CHAIN PRIVATE STATE                    |
|  - Voter Secret Key: Bytes[32]                                    |
|  - Candidate Choice (0 or 1)                                      |
|  - ZK Prover Circuit: vote(candidateIndex)                        |
+-------------------------------------------------------------------+
                                   │
                                   │ Discloses ZK Proof & Nullifier
                                   ▼
+-------------------------------------------------------------------+
|                        ON-CHAIN PUBLIC LEDGER                     |
|  - Election Status: OPEN / FINALIZED                              |
|  - Candidate 0 Tally: Counter                                     |
|  - Candidate 1 Tally: Counter                                     |
|  - Total Votes: Counter                                           |
|  - Owner Commitment: Bytes[32]                                    |
+-------------------------------------------------------------------+
```

---

## 🏗️ Monorepo Workspace Structure

```
confidential-voting/
├── contract/                       # Compact Smart Contract & ZK Assets
│   ├── src/confidential-voting.compact # Main Compact contract definition
│   ├── src/index.ts                # Contract exports & CompiledContract wrapper
│   └── src/witnesses.ts            # Private state definitions & witness handlers
├── api/                            # Midnight API Layer
│   ├── src/index.ts                # VotingAPI wrapper (deploy, join, vote, finalize)
│   ├── src/common-types.ts         # Derived state & Provider types
│   └── src/utils/                  # Helper utilities
├── confidential-voting-cli/        # Command Line Interface Tool
│   ├── src/index.ts                # Interactive CLI menu & launcher
│   └── src/config.ts               # Standalone, Preview, & Preprod configs
├── confidential-voting-ui/         # React Web Application
│   ├── src/App.tsx                 # Main Application dashboard
│   ├── src/components/             # VotingCard, Header, MainLayout components
│   ├── src/contexts/               # BrowserDeployedVotingManager & React Context
│   └── src/globals.ts              # Contract address & 32-byte normalization
├── docs/screenshots/               # Application UI Screenshots
│   └── monochrome_dashboard.png    # Rendered DApp UI Preview
├── package.json                    # Workspace configuration
└── README.md                       # Project documentation
```

---

## 🔨 Build Instructions

Run the build pipeline across all workspace packages:

```bash
# 1. Compile Compact Contract & Generate ZK Keys
cd contract
yarn compact
yarn build

# 2. Build API Layer
cd ../api
yarn build

# 3. Build CLI Tool
cd ../confidential-voting-cli
yarn build

# 4. Build Web Application
cd ../confidential-voting-ui
yarn build
```

---

## 🚀 Running the Web Application

To launch the web interface in development mode:

```bash
cd confidential-voting-ui
yarn dev
```

Navigate to `http://localhost:5173` in your browser with the **Midnight 1AM Wallet** extension installed.

---

## 🌐 Network & Deployed Contract Address

```text
Network:
Preprod Testnet

Contract Address (32 Bytes / 64 Hex Chars):
0200dbf964f541e1950883f5b2f539b66fd6111e46ce8e6e9551fbdd180114d5
```

---

## 📄 License

MIT License. Built for the **Rise In Level 1 Midnight Builder Challenge**.
