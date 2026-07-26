import { CompiledContract } from "@midnight-ntwrk/midnight-js-protocol/compact-js";

export * from "./managed/bboard/contract/index.js";
export * from "./witnesses.js";

import * as CompiledVotingContract from "./managed/bboard/contract/index.js";
import * as Witnesses from "./witnesses.js";

export const CompiledVotingContractContract = CompiledContract.make<
  CompiledVotingContract.Contract<Witnesses.VotingPrivateState>
>("ConfidentialVoting", CompiledVotingContract.Contract<Witnesses.VotingPrivateState>).pipe(
  CompiledContract.withWitnesses(Witnesses.witnesses),
  CompiledContract.withCompiledFileAssets("./managed/bboard"),
);
