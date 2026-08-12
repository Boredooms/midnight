# Product Proposal

## What is the product, and who uses it?

**Midnight Confidential Voting** is a privacy-preserving decentralized voting platform for DAOs, organizations, and communities that need anonymous, verifiable elections.

**Users:** Governance bodies, DAO token holders, corporate boards, membership organizations, university student councils, and any group that needs fair elections without social pressure, vote-buying incentives, or identity exposure.

**Problem solved:** Traditional on-chain voting exposes every ballot publicly, enabling coercion and strategic behavior. Off-chain voting requires trust in a central tallier. Midnight Confidential Voting eliminates both problems — votes are cryptographically private while tallies are publicly verifiable on-chain.

## Why Midnight specifically?

Midnight's Compact language enables **selective disclosure at the circuit level** — the voter proves their ballot is valid (candidate 0 or 1) and that they haven't already voted (via nullifiers) without revealing their actual choice. The ZK proof is verified on-chain while the witness data (secret key, vote choice) never leaves the voter's machine.

**Why not a transparent chain?**
- On Ethereum/Solana, every vote is publicly visible → enables vote coercion, bribery, and social pressure
- "Commit-reveal" schemes add complexity and still leak timing metadata
- Off-chain voting (Snapshot) requires trusting a centralized tallier

**Why Midnight is uniquely suited:**
- `persistentHash` provides DApp-specific identities — unlinkable across elections
- Nullifier sets prevent double-voting without storing voter identity
- Compact circuits enforce valid vote values (0 or 1) without revealing which
- Counter-based tallies increment on valid proof — no individual votes stored on-chain
- Time-based finalization makes the process fully decentralized (no owner needed)

## Data Model

| Data Point              | Type            | Disclosed To        |
|-------------------------|-----------------|---------------------|
| Election title          | Public ledger   | Everyone            |
| Election deadline       | Public ledger   | Everyone            |
| Total votes cast        | Public ledger   | Everyone            |
| Candidate A tally       | Public ledger   | Everyone            |
| Candidate B tally       | Public ledger   | Everyone            |
| Winner (enum)           | Public ledger   | Everyone            |
| Election state          | Public ledger   | Everyone            |
| Vote nullifier (hash)   | Public ledger   | Everyone (unlinkable) |
| DApp-specific public key| Public ledger   | Everyone (unlinkable across elections) |
| Voter's secret key      | Private witness | No one (local only) |
| Voter's actual choice   | Private witness | No one              |
| Voter's real identity   | Private witness | No one              |

## Mainnet Feasibility

**Yes — realistic to reach Mainnet by Level 6.**

The core architecture is production-ready:
- Contract is simple, gas-efficient, and already proven on Preview
- ZK circuit set (createElection, vote, finalize, ownerFinalize) covers full lifecycle
- Privacy model is cryptographically sound (persistentHash + nullifiers)
- No fundamental redesign needed for mainnet

**Remaining work for mainnet readiness:**
- Multi-candidate support (extend beyond 2 candidates)
- Batch election management (multiple concurrent elections per contract instance)
- Gas optimization for large voter sets (>1000 voters)
- Security audit of nullifier derivation scheme
- UX polish for non-technical users (simplified wallet onboarding)
- Deployment scripts and monitoring infrastructure

**Timeline estimate:** 4-6 weeks of focused development from current state to mainnet-ready.
