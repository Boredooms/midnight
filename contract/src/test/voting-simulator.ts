import {
  type CircuitContext,
  QueryContext,
  sampleContractAddress,
  convertFieldToBytes,
  createConstructorContext,
  CostModel,
} from "@midnight-ntwrk/compact-runtime";
import {
  Contract,
  type Ledger,
  ledger,
} from "../managed/confidential-voting/contract/index.js";
import { type VotingPrivateState, witnesses } from "../witnesses.js";

/**
 * Serves as a testbed to exercise the confidential voting contract in tests
 */
export class VotingSimulator {
  readonly contract: Contract<VotingPrivateState>;
  circuitContext: CircuitContext<VotingPrivateState>;

  constructor(secretKey: Uint8Array) {
    this.contract = new Contract<VotingPrivateState>(witnesses);
    const {
      currentPrivateState,
      currentContractState,
      currentZswapLocalState,
    } = this.contract.initialState(
      createConstructorContext({ secretKey }, "0".repeat(64)),
    );
    this.circuitContext = {
      currentPrivateState,
      currentZswapLocalState,
      costModel: CostModel.initialCostModel(),
      currentQueryContext: new QueryContext(
        currentContractState.data,
        sampleContractAddress(),
      ),
    };
  }

  public switchUser(secretKey: Uint8Array) {
    this.circuitContext.currentPrivateState = {
      secretKey,
    };
  }

  public getLedger(): Ledger {
    return ledger(this.circuitContext.currentQueryContext.state);
  }

  public getPrivateState(): VotingPrivateState {
    return this.circuitContext.currentPrivateState;
  }

  public createElection(title: string, durationSeconds: bigint = 3600n): Ledger {
    this.circuitContext = this.contract.impureCircuits.createElection(
      this.circuitContext,
      title,
      durationSeconds,
    ).context;
    return ledger(this.circuitContext.currentQueryContext.state);
  }

  public vote(candidateIndex: number): Ledger {
    this.circuitContext = this.contract.impureCircuits.vote(
      this.circuitContext,
      BigInt(candidateIndex),
    ).context;
    return ledger(this.circuitContext.currentQueryContext.state);
  }

  public finalizeElection(): Ledger {
    this.circuitContext = this.contract.impureCircuits.finalizeElection(
      this.circuitContext,
    ).context;
    return ledger(this.circuitContext.currentQueryContext.state);
  }

  public ownerFinalizeElection(): Ledger {
    this.circuitContext = this.contract.impureCircuits.ownerFinalizeElection(
      this.circuitContext,
    ).context;
    return ledger(this.circuitContext.currentQueryContext.state);
  }

  public voterPublicKey(): Uint8Array {
    const sequence = convertFieldToBytes(
      32,
      this.getLedger().sequence,
      "voting-simulator.ts",
    );
    return this.contract.circuits.voterPublicKey(
      this.circuitContext,
      this.getPrivateState().secretKey,
      sequence,
    ).result;
  }
}
