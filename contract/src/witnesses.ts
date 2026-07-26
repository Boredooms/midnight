import { type Ledger } from "./managed/confidential-voting/contract/index.js";
import { type WitnessContext } from "@midnight-ntwrk/compact-runtime";

export type VotingPrivateState = {
  readonly secretKey: Uint8Array;
};

export const createVotingPrivateState = (secretKey: Uint8Array) => ({
  secretKey,
});

export const witnesses = {
  voterSecretKey: ({
    privateState,
  }: WitnessContext<Ledger, VotingPrivateState>): [
    VotingPrivateState,
    Uint8Array,
  ] => [privateState, privateState.secretKey],
};
