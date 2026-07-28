import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export enum State { UNINITIALIZED = 0, OPEN = 1, FINALIZED = 2 }

export enum Winner { NONE = 0, CANDIDATE_A = 1, CANDIDATE_B = 2, TIE = 3 }

export type Witnesses<PS> = {
  voterSecretKey(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  createElection(context: __compactRuntime.CircuitContext<PS>,
                 title_0: string,
                 durationSeconds_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  vote(context: __compactRuntime.CircuitContext<PS>, candidateIndex_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  finalizeElection(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  ownerFinalizeElection(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  createElection(context: __compactRuntime.CircuitContext<PS>,
                 title_0: string,
                 durationSeconds_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  vote(context: __compactRuntime.CircuitContext<PS>, candidateIndex_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  finalizeElection(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  ownerFinalizeElection(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
  voterPublicKey(sk_0: Uint8Array, sequence_0: Uint8Array): Uint8Array;
}

export type Circuits<PS> = {
  createElection(context: __compactRuntime.CircuitContext<PS>,
                 title_0: string,
                 durationSeconds_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  vote(context: __compactRuntime.CircuitContext<PS>, candidateIndex_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  finalizeElection(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  ownerFinalizeElection(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  voterPublicKey(context: __compactRuntime.CircuitContext<PS>,
                 sk_0: Uint8Array,
                 sequence_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
}

export type Ledger = {
  readonly state: State;
  readonly electionTitle: { is_some: boolean, value: string };
  readonly candidate0Tally: bigint;
  readonly candidate1Tally: bigint;
  readonly totalVotes: bigint;
  readonly owner: Uint8Array;
  readonly deadline: bigint;
  readonly winner: Winner;
  nullifierSet: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
  readonly sequence: bigint;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
