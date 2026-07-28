import { type MidnightProviders } from '@midnight-ntwrk/midnight-js-types';
import { type ContractAddress } from '@midnight-ntwrk/compact-runtime';
import { type DeployedContract, type FoundContract } from '@midnight-ntwrk/midnight-js-contracts';
import { type Contract, type VotingPrivateState } from '@midnight-ntwrk/confidential-voting-contract';
import { type Observable } from 'rxjs';

export type VotingCircuitKeys = 'createElection' | 'vote' | 'finalizeElection' | 'ownerFinalizeElection';

export type VotingContract = Contract<VotingPrivateState>;

export type DeployedVotingContract = DeployedContract<VotingContract> | FoundContract<VotingContract>;

export type VotingProviders = MidnightProviders<VotingCircuitKeys, string, VotingPrivateState>;

export type VotingDerivedState = {
  readonly state: number;
  readonly electionTitle?: string;
  readonly candidate0Tally: bigint;
  readonly candidate1Tally: bigint;
  readonly totalVotes: bigint;
  readonly isOwner: boolean;
  readonly deadline: bigint;
  readonly winner: number;
};

export interface DeployedVotingAPI {
  readonly deployedContractAddress: ContractAddress;
  readonly state$: Observable<VotingDerivedState>;
  readonly createElection: (title: string, durationSeconds?: bigint) => Promise<void>;
  readonly vote: (candidateIndex: number) => Promise<void>;
  readonly finalizeElection: () => Promise<void>;
  readonly ownerFinalizeElection: () => Promise<void>;
}
