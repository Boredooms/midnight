import {
  type ConnectedAPI,
} from '@midnight-ntwrk/dapp-connector-api';
import { type ContractAddress } from '@midnight-ntwrk/compact-runtime';
import { type UnboundTransaction } from '@midnight-ntwrk/midnight-js-types';
import {
  type VotingCircuitKeys,
  type VotingDerivedState,
  type VotingProviders,
  VotingAPI,
} from '@midnight-ntwrk/confidential-voting-api';
import { type VotingPrivateState } from '@midnight-ntwrk/confidential-voting-contract';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import {
  BehaviorSubject,
  type Observable,
} from 'rxjs';
import { type Logger } from 'pino';
import { inMemoryPrivateStateProvider } from '../in-memory-private-state-provider';
import {
  type Binding,
  type FinalizedTransaction,
  type Proof,
  type SignatureEnabled,
  type TransactionId,
  Transaction,
} from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { fromHex, toHex } from '@midnight-ntwrk/midnight-js-utils';
import { formatContractAddress } from '../globals';

export type VotingDeployment =
  | {
      readonly status: 'in-progress';
    }
  | {
      readonly status: 'deployed';
      readonly api: VotingAPI;
    }
  | {
      readonly status: 'failed';
      readonly error: Error;
    };

export interface DeployedVotingAPIProvider {
  readonly deployments$: Observable<Array<Observable<VotingDeployment>>>;
  readonly resolve: (contractAddress?: ContractAddress) => Observable<VotingDeployment>;
  readonly retry: (contractAddress?: ContractAddress) => Observable<VotingDeployment>;
  readonly setConnectedAPI: (api: ConnectedAPI) => void;
}

export class BrowserDeployedVotingManager implements DeployedVotingAPIProvider {
  readonly #deploymentsSubject: BehaviorSubject<Array<BehaviorSubject<VotingDeployment>>>;
  #initializedProviders: Promise<VotingProviders> | undefined;
  #connectedAPI: ConnectedAPI | undefined;

  constructor(private readonly logger: Logger) {
    this.#deploymentsSubject = new BehaviorSubject<Array<BehaviorSubject<VotingDeployment>>>([]);
    this.deployments$ = this.#deploymentsSubject;
  }

  readonly deployments$: Observable<Array<Observable<VotingDeployment>>>;

  /**
   * Called by WalletContext once the user has connected their 1AM wallet.
   * Resets any cached providers so the next deploy/join uses the fresh connection.
   */
  setConnectedAPI(api: ConnectedAPI): void {
    this.#connectedAPI = api;
    this.#initializedProviders = undefined;
  }

  retry(contractAddress?: ContractAddress): Observable<VotingDeployment> {
    this.#initializedProviders = undefined;
    return this.resolve(contractAddress);
  }

  resolve(contractAddress?: ContractAddress): Observable<VotingDeployment> {
    const normalizedAddr = contractAddress
      ? (formatContractAddress(contractAddress) as ContractAddress)
      : undefined;
    const deployments = this.#deploymentsSubject.value;
    let deployment = deployments.find(
      (d) => d.value.status === 'deployed' && d.value.api.deployedContractAddress === normalizedAddr,
    );

    if (deployment) {
      return deployment;
    }

    deployment = new BehaviorSubject<VotingDeployment>({
      status: 'in-progress',
    });

    if (normalizedAddr) {
      void this.joinDeployment(deployment, normalizedAddr);
    } else {
      void this.deployDeployment(deployment);
    }

    this.#deploymentsSubject.next([...deployments, deployment]);

    return deployment;
  }

  private getProviders(): Promise<VotingProviders> {
    if (!this.#connectedAPI) {
      return Promise.reject(
        new Error(
          'Wallet not connected. Please click "Connect 1AM Wallet" and approve the connection in the extension popup.',
        ),
      );
    }
    const api = this.#connectedAPI;
    return (this.#initializedProviders ??= initializeProviders(this.logger, api));
  }

  private async deployDeployment(deployment: BehaviorSubject<VotingDeployment>): Promise<void> {
    try {
      const providers = await this.getProviders();
      const api = await VotingAPI.deploy(providers, this.logger);

      deployment.next({
        status: 'deployed',
        api,
      });
    } catch (error: unknown) {
      deployment.next({
        status: 'failed',
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }

  private async joinDeployment(
    deployment: BehaviorSubject<VotingDeployment>,
    contractAddress: ContractAddress,
  ): Promise<void> {
    try {
      const providers = await this.getProviders();
      const api = await VotingAPI.join(providers, contractAddress, this.logger);

      deployment.next({
        status: 'deployed',
        api,
      });
    } catch (error: unknown) {
      deployment.next({
        status: 'failed',
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }
}

const initializeProviders = async (
  logger: Logger,
  connectedAPI: ConnectedAPI,
): Promise<VotingProviders> => {
  const zkConfigPath = window.location.origin;
  const keyMaterialProvider = new FetchZkConfigProvider<VotingCircuitKeys>(
    zkConfigPath,
    fetch.bind(window),
  );

  const [config, shieldedAddresses] = await Promise.all([
    connectedAPI.getConfiguration(),
    connectedAPI.getShieldedAddresses(),
  ]);

  logger.info({ config }, 'Wallet configuration retrieved');

  if (!config.proverServerUri) {
    throw new Error(
      'Prover server URI not configured in your 1AM Wallet settings. Please configure it and reconnect.',
    );
  }

  const inMemoryStateProvider = inMemoryPrivateStateProvider<string, VotingPrivateState>();

  return {
    privateStateProvider: inMemoryStateProvider,
    zkConfigProvider: keyMaterialProvider,
    proofProvider: httpClientProofProvider(config.proverServerUri, keyMaterialProvider),
    publicDataProvider: indexerPublicDataProvider(config.indexerUri, config.indexerWsUri),
    walletProvider: {
      getCoinPublicKey(): string {
        return shieldedAddresses.shieldedCoinPublicKey;
      },
      getEncryptionPublicKey(): string {
        return shieldedAddresses.shieldedEncryptionPublicKey;
      },
      balanceTx: async (tx: UnboundTransaction, ttl?: Date): Promise<FinalizedTransaction> => {
        try {
          logger.info({ ttl }, 'Balancing transaction via 1AM Wallet');
          const serializedTx = toHex(tx.serialize());
          const received = await connectedAPI.balanceUnsealedTransaction(serializedTx);
          return Transaction.deserialize<SignatureEnabled, Proof, Binding>(
            'signature',
            'proof',
            'binding',
            fromHex(received.tx),
          );
        } catch (e) {
          logger.error({ error: e }, 'Error balancing transaction via 1AM Wallet');
          throw e;
        }
      },
    },
    midnightProvider: {
      submitTx: async (tx: FinalizedTransaction): Promise<TransactionId> => {
        await connectedAPI.submitTransaction(toHex(tx.serialize()));
        const txIdentifiers = tx.identifiers();
        const txId = txIdentifiers[0];
        logger.info({ txIdentifiers }, 'Submitted transaction via 1AM Wallet');
        return txId;
      },
    },
  };
};
