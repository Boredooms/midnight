import {
  type InitialAPI,
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
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import {
  BehaviorSubject,
  catchError,
  concatMap,
  filter,
  firstValueFrom,
  interval,
  map,
  type Observable,
  take,
  tap,
  throwError,
  timeout,
} from 'rxjs';
import { pipe as fnPipe } from 'fp-ts/function';
import { type Logger } from 'pino';
import semver from 'semver';
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

type NetworkId = string;

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
}

export class BrowserDeployedVotingManager implements DeployedVotingAPIProvider {
  readonly #deploymentsSubject: BehaviorSubject<Array<BehaviorSubject<VotingDeployment>>>;
  #initializedProviders: Promise<VotingProviders> | undefined;

  constructor(private readonly logger: Logger) {
    this.#deploymentsSubject = new BehaviorSubject<Array<BehaviorSubject<VotingDeployment>>>([]);
    this.deployments$ = this.#deploymentsSubject;
  }

  readonly deployments$: Observable<Array<Observable<VotingDeployment>>>;

  resolve(contractAddress?: ContractAddress): Observable<VotingDeployment> {
    const normalizedAddr = contractAddress ? (formatContractAddress(contractAddress) as ContractAddress) : undefined;
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
    return this.#initializedProviders ?? (this.#initializedProviders = initializeProviders(this.logger));
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

const initializeProviders = async (logger: Logger): Promise<VotingProviders> => {
  const networkId = (import.meta.env.VITE_NETWORK_ID ?? 'preprod') as NetworkId;
  const connectedAPI = await connectToWallet(logger, networkId);
  const zkConfigPath = window.location.origin;
  const keyMaterialProvider = new FetchZkConfigProvider<VotingCircuitKeys>(zkConfigPath, fetch.bind(window));
  const config = await connectedAPI.getConfiguration();
  const inMemoryStateProvider = inMemoryPrivateStateProvider<string, VotingPrivateState>();
  const shieldedAddresses = await connectedAPI.getShieldedAddresses();
  return {
    privateStateProvider: inMemoryStateProvider,
    zkConfigProvider: keyMaterialProvider,
    proofProvider: httpClientProofProvider(config.proverServerUri!, keyMaterialProvider),
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
          logger.info({ tx, ttl }, 'Balancing transaction via 1AM Wallet');
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

const getFirstCompatibleWallet = (): InitialAPI | undefined => {
  if (!window.midnight) return undefined;
  const wallets = Object.values(window.midnight);
  for (const wallet of wallets) {
    if (wallet && typeof wallet === 'object' && 'connect' in wallet && typeof wallet.connect === 'function') {
      return wallet as InitialAPI;
    }
  }
  return undefined;
};

const connectToWallet = (logger: Logger, networkId: string): Promise<ConnectedAPI> => {
  return firstValueFrom(
    fnPipe(
      interval(200),
      map(() => getFirstCompatibleWallet()),
      tap((connectorAPI) => {
        logger.info(connectorAPI, 'Check for 1AM Wallet connector API');
      }),
      filter((connectorAPI): connectorAPI is InitialAPI => !!connectorAPI),
      tap((connectorAPI) => {
        logger.info(connectorAPI, 'Compatible 1AM Wallet connector API found. Connecting...');
      }),
      take(1),
      timeout({
        first: 5_000,
        with: () =>
          throwError(() => {
            logger.error('Could not find 1AM Wallet connector API');
            return new Error('Could not find Midnight 1AM Wallet. Extension installed and enabled?');
          }),
      }),
      concatMap(async (initialAPI) => {
        const connectedAPI = await initialAPI.connect(networkId);
        const connectionStatus = await connectedAPI.getConnectionStatus();
        logger.info(connectionStatus, '1AM Wallet connector API enabled status');
        return connectedAPI;
      }),
      timeout({
        first: 10_000,
        with: () =>
          throwError(() => {
            logger.error('1AM Wallet connector API has failed to respond');
            return new Error('Midnight 1AM Wallet has failed to respond. Is the extension unlocked?');
          }),
      }),
      catchError((error, apis) =>
        error
          ? throwError(() => {
              logger.error('Unable to enable connector API ' + error);
              return new Error(error instanceof Error ? error.message : 'Application is not authorized');
            })
          : apis,
      ),
    ),
  );
};
