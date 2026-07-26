import {
  type ContractAddress,
  type Logger,
} from '@midnight-ntwrk/midnight-js-types';
import {
  type DeployedVotingAPI,
  type DeployedVotingContract,
  type VotingDerivedState,
  type VotingProviders,
  type VotingContract,
} from './common-types.js';
import {
  CompiledVotingContractContract,
  createVotingPrivateState,
  type VotingPrivateState,
  pureCircuits,
  ledger,
  State,
} from '@midnight-ntwrk/confidential-voting-contract';
import {
  deployContract,
  findDeployedContract,
} from '@midnight-ntwrk/midnight-js-contracts';
import { combineLatest, from, map, type Observable, tap } from 'rxjs';
import { toHex } from '@midnight-ntwrk/midnight-js-utils';
import { convertFieldToBytes } from '@midnight-ntwrk/compact-runtime';
import * as utils from './utils/index.js';

export const votingPrivateStateKey = 'confidentialVotingPrivateState';

export class VotingAPI implements DeployedVotingAPI {
  private constructor(
    public readonly deployedContract: DeployedVotingContract,
    providers: VotingProviders,
    private readonly logger?: Logger,
  ) {
    this.deployedContractAddress = deployedContract.deployTxData.public.contractAddress;
    providers.privateStateProvider.setContractAddress(this.deployedContractAddress);

    this.state$ = combineLatest(
      [
        providers.publicDataProvider.contractStateObservable(this.deployedContractAddress, { type: 'latest' }).pipe(
          map((contractState) => ledger(contractState.data)),
          tap((ledgerState) =>
            logger?.trace({
              ledgerStateChanged: {
                ledgerState: {
                  ...ledgerState,
                  owner: toHex(ledgerState.owner),
                },
              },
            }),
          ),
        ),
        from(providers.privateStateProvider.get(votingPrivateStateKey) as Promise<VotingPrivateState>),
      ],
      (ledgerState, privateState) => {
        const hashedSecretKey = pureCircuits.voterPublicKey(
          privateState.secretKey,
          convertFieldToBytes(32, ledgerState.sequence, 'api/src/index.ts'),
        );

        return {
          state: ledgerState.state,
          electionTitle: ledgerState.electionTitle.is_some ? ledgerState.electionTitle.value : undefined,
          candidate0Tally: ledgerState.candidate0Tally,
          candidate1Tally: ledgerState.candidate1Tally,
          totalVotes: ledgerState.totalVotes,
          isOwner: toHex(ledgerState.owner) === toHex(hashedSecretKey),
        };
      },
    );
  }

  readonly deployedContractAddress: ContractAddress;

  readonly state$: Observable<VotingDerivedState>;

  async createElection(title: string): Promise<void> {
    this.logger?.info(`createElection: ${title}`);
    const txData = await this.deployedContract.callTx.createElection(title);
    this.logger?.trace({
      transactionAdded: {
        circuit: 'createElection',
        txHash: txData.public.txHash,
        blockHeight: txData.public.blockHeight,
      },
    });
  }

  async vote(candidateIndex: number): Promise<void> {
    this.logger?.info(`vote: candidate ${candidateIndex}`);
    const txData = await this.deployedContract.callTx.vote(BigInt(candidateIndex));
    this.logger?.trace({
      transactionAdded: {
        circuit: 'vote',
        txHash: txData.public.txHash,
        blockHeight: txData.public.blockHeight,
      },
    });
  }

  async finalizeElection(): Promise<void> {
    this.logger?.info('finalizeElection');
    const txData = await this.deployedContract.callTx.finalizeElection();
    this.logger?.trace({
      transactionAdded: {
        circuit: 'finalizeElection',
        txHash: txData.public.txHash,
        blockHeight: txData.public.blockHeight,
      },
    });
  }

  static async deploy(providers: VotingProviders, logger?: Logger): Promise<VotingAPI> {
    logger?.info('deployVotingContract');

    const deployedContract = await deployContract(providers, {
      compiledContract: CompiledVotingContractContract,
      privateStateId: votingPrivateStateKey,
      initialPrivateState: createVotingPrivateState(utils.randomBytes(32)),
    });

    logger?.trace({
      contractDeployed: {
        finalizedDeployTxData: deployedContract.deployTxData.public,
      },
    });

    return new VotingAPI(deployedContract, providers, logger);
  }

  static async join(providers: VotingProviders, contractAddress: ContractAddress, logger?: Logger): Promise<VotingAPI> {
    logger?.info({
      joinContract: {
        contractAddress,
      },
    });

    const deployedContract = await findDeployedContract<VotingContract>(providers, {
      contractAddress,
      compiledContract: CompiledVotingContractContract,
      privateStateId: votingPrivateStateKey,
      initialPrivateState: await VotingAPI.getPrivateState(providers, contractAddress),
    });

    logger?.trace({
      contractJoined: {
        finalizedDeployTxData: deployedContract.deployTxData.public,
      },
    });

    return new VotingAPI(deployedContract, providers, logger);
  }

  private static async getPrivateState(
    providers: VotingProviders,
    contractAddress: ContractAddress,
  ): Promise<VotingPrivateState> {
    providers.privateStateProvider.setContractAddress(contractAddress);
    const existingPrivateState = await providers.privateStateProvider.get(votingPrivateStateKey);
    return existingPrivateState ?? createVotingPrivateState(utils.randomBytes(32));
  }
}

export * as utils from './utils/index.js';
export * from './common-types.js';
