import {
  type ContractAddress,
  type MidnightProviders,
} from '@midnight-ntwrk/midnight-js-types';
import { type State, type Contract } from '@midnight-ntwrk/confidential-voting-contract';
import { type VotingPrivateState } from '@midnight-ntwrk/confidential-voting-contract';
import { type DeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { type Observable } from 'rxjs';

export type VotingCircuitKeys = 'createElection' | 'vote' | 'finalizeElection';

export type VotingProviders = MidnightProviders<VotingCircuitKeys, VotingPrivateState>;

export type VotingContract = Contract<VotingPrivateState>;

export type DeployedVotingContract = DeployedContract<VotingPrivateState, VotingContract>;

export type VotingDerivedState = {
  readonly state: State;
  readonly electionTitle?: string;
  readonly candidate0Tally: bigint;
  readonly candidate1Tally: bigint;
  readonly totalVotes: bigint;
  readonly isOwner: boolean;
};

export interface DeployedVotingAPI {
  readonly deployedContractAddress: ContractAddress;
  readonly state$: Observable<VotingDerivedState>;
  createElection: (title: string) => Promise<void>;
  vote: (candidateIndex: number) => Promise<void>;
  finalizeElection: () => Promise<void>;
}
