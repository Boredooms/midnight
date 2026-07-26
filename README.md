# Confidential Voting DApp — Midnight Blockchain

> **Rise In Level 1 Builder Challenge Submission**
> A privacy-preserving decentralized voting platform built on Midnight using Compact smart contracts and Zero-Knowledge proofs.

---

## 📸 Application Preview

![Confidential Voting DApp Dashboard](file:///C:/Users/devar/.gemini/antigravity-ide/brain/5298cde7-fa49-4dd0-9c25-92865c96528c/confidential_voting_dashboard_1785089546726.png)

*Figure 1: Confidential Voting DApp Web Application rendering Zero-Knowledge feature cards, Midnight Lace Wallet connector, and active election interface.*

---

## 📌 Project Overview

The **Confidential Voting DApp** allows organizations and communities to conduct tamper-proof, transparent elections while protecting individual voter privacy. By leveraging Midnight's Zero-Knowledge (ZK) execution environment, voters can cast ballots confidentially without exposing their choices or identity, while anyone can publicly verify that the election outcome is 100% accurate.

---

## ✨ Features

- 🔒 **Zero-Knowledge Privacy**: Individual votes and voter secret keys remain strictly private off-chain via Compact ZK circuits.
- 🗳️ **Verifiable Public Tally**: Public ledger state tracks candidate tallies and total vote counts transparently.
- 🛡️ **Double-Voting Prevention**: Unique ZK private state nullifier commitments prevent double voting.
- 🔑 **Election Creator Privileges**: Election creators can open new elections and finalize voting rounds.
- 👛 **Midnight Lace Wallet Connector**: Native integration with Midnight Lace Wallet (`window.midnight`) for transaction balancing, signing, and submission.
- 💻 **Interactive CLI & Web UI**: Complete command-line interface and responsive React web dashboard.

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

## 🏗️ Architecture & Workspace Structure

The project is structured as a yarn monorepo workspace:

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
│   └── src/globals.ts              # Contract address & polyfills
├── docs/screenshots/               # Application UI Screenshots
│   └── dashboard.png               # Rendered DApp UI Preview
├── package.json                    # Workspace configuration
└── README.md                       # Project documentation
```

---

## ⚙️ Installation & Prerequisites

- **Node.js**: `v24.x`
- **Yarn**: `v1.22.x`
- **Compact Compiler**: `v0.31.x`
- **Docker**: For running Midnight proof-server locally

```bash
# Clone the repository
git clone <repository-url>
cd confidential-voting

# Install all workspace dependencies
yarn
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

Navigate to `http://localhost:5173` in your browser with the **Midnight Lace Wallet** extension installed.

---

## 🌐 Network & Deployed Contract Address

```text
Network:
Preprod

Contract Address:
0200dbf964f541e1950883f5b2f539b66fd6111e46ce8e6e9551fbdd180114d5dd5b
```

### Development & Testnet Wallet

```text
Preprod Development Wallet:
mn_addr_preprod1xn8uwf8hplkuws6n53av7n8msevlus7x5au3re8ral9sx0pd82csqv39gh
```

---

## 🔧 Environment Variables

| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_NETWORK_ID` | Midnight Target Network | `preprod` |
| `VITE_LOGGING_LEVEL` | Pino Logger Verbosity | `info` |

---

## 📜 Git Commits & Repository Safety

This repository maintains clean commit history without scaffold remnants. All references to old scaffolds have been refactored to `confidential-voting`.

```bash
git status
git log --oneline
```

---

## 📄 License

MIT License. Built for the **Rise In Level 1 Midnight Builder Challenge**.
