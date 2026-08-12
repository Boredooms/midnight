# Demo Video Script & Submission Summary

> Paste this into ChatGPT and ask: "Generate a 1-minute demo video script based on this summary. Tell me exactly what to say, what to show on screen, and timing for each section."

---

## Project Overview

- **Name:** Midnight Confidential Voting
- **Idea from list:** Private Voting — anonymous ballots with publicly verifiable tallies
- **Network:** Midnight Preview (contract deployed and verified)
- **Contract Address:** `79bda166f07754080384f07744c742033cabff15f3ba428433e25d413cf2bb8b`
- **Explorer:** https://preview.midnightexplorer.com/contracts/0x79bda166f07754080384f07744c742033cabff15f3ba428433e25d413cf2bb8b
- **Live Demo:** https://midnight-inky-seven.vercel.app
- **GitHub:** https://github.com/Boredooms/midnight

---

## What the dApp Does

A confidential voting platform where:
1. An election owner deploys a ballot with a title and deadline
2. Voters cast private ballots — their choice is proven valid in a ZK circuit WITHOUT being revealed
3. Nullifiers prevent double-voting without linking to voter identity
4. Anyone can finalize after deadline (decentralized)
5. Final tallies + winner published on-chain transparently

---

## Privacy Model (KEY for judges)

### What an on-chain observer CAN see:
- Election title, deadline, total votes
- Per-candidate tallies (Candidate A: 5, Candidate B: 3)
- Winner (CANDIDATE_A / CANDIDATE_B / TIE)
- Nullifier hashes (proves someone voted, but unlinkable to identity)

### What an on-chain observer CANNOT see:
- Which candidate any voter chose
- Who cast any specific vote
- Voter's secret key (never leaves their machine)
- Any connection between a voter across different elections

### How privacy is achieved:
- `voterSecretKey()` — witness, never disclosed
- `voterPublicKey()` — DApp-specific identity via `persistentHash`, unlinkable across elections
- `computeNullifier()` — prevents double-voting without linking to identity
- Vote choice proven valid (0 or 1) without revealing which

---

## Demo Video — What to Show (1 minute)

### Section 1: App Overview (0:00–0:15)
- Show the landing page with video background
- Navigate to `/features` briefly (shader background, glass cards)
- Say: "This is Midnight Confidential Voting — private ballots, public tallies"

### Section 2: Live dApp Flow (0:15–0:35)
- Navigate to `/app` (dashboard with sidebar)
- Show wallet connection (click Connect Wallet in topbar)
- Click "Deploy Election" or "Join Default" 
- Show the election card loading
- Say: "Voters generate ZK proofs locally. The proof server validates without seeing the vote."

### Section 3: Tests (0:35–0:50)
- Navigate to `/tests` in sidebar
- Show the 20 passing tests in the dashboard
- OR switch to terminal and run `npx vitest run`
- Say: "20 tests cover circuit logic, state transitions, privacy guarantees, and access control"

### Section 4: CI/CD + Wrap (0:50–1:00)
- Show the README with CI badge (green)
- Show the contract on Midnight Explorer
- Say: "CI/CD pipeline compiles the Compact contract, runs all tests, and builds the frontend on every push"

---

## Tests Summary (20 passing)

| Group | Count | What it proves |
|-------|-------|----------------|
| Circuit Logic | 5 | createElection, vote, finalize compute correctly |
| State Transitions | 7 | UNINITIALIZED → OPEN → FINALIZED lifecycle |
| Privacy | 3 | Secret key never leaks, nullifiers unlinkable, vote choice hidden |
| Double-Vote Prevention | 2 | Nullifier enforces single vote per identity |
| Access Control | 3 | Owner-only emergency finalize, invalid inputs rejected |

---

## CI/CD Pipeline

File: `.github/workflows/ci.yaml`
Triggers: push to `main`, pull requests

Jobs:
1. **Contract** — Compile Compact → typecheck → lint → build → 20 tests
2. **API** — Build TypeScript API layer
3. **UI** — Typecheck + production build
4. **CLI** — Build deployment CLI

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contract | Compact 0.23 (Midnight ZK DSL) |
| Frontend | React 19, MUI 9, Framer Motion, GSAP, WebGL shader |
| Blockchain | Midnight.js 4.1.1, DApp Connector API v4 |
| Proof Server | midnightntwrk/proof-server:8.1.0 (Docker) |
| Testing | Vitest 4.x, compact-runtime simulator |
| CI/CD | GitHub Actions (4 parallel jobs) |
| Deploy | Vercel |

---

## Submission Checklist

- [x] Public GitHub repository with complete README
- [x] Live demo link (Vercel)
- [x] Screenshot: test output (20 tests passing)
- [x] CI/CD badge + workflow file
- [x] Demo video (record using script above)
- [x] README "Privacy Model" section
- [x] PROPOSAL.md with correct structure
- [x] 10+ meaningful commits
- [x] Contract address in README (Preview network)
- [x] Idea: Private Voting (from approved list)

---

## Key Talking Points for Video

1. "Individual votes are PRIVATE — proven valid without being revealed"
2. "Nullifiers prevent double-voting without linking identity"
3. "Anyone can finalize after deadline — fully decentralized"
4. "20 tests verify privacy guarantees at the circuit level"
5. "CI/CD compiles Compact, runs tests, and builds on every push"
