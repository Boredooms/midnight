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

    // Check if we already have a deployment for this address (any status)
    const existing = deployments.find((d) => {
      const val = d.value;
      if (val.status === 'deployed') {
        return val.api.deployedContractAddress === normalizedAddr;
      }
      // For in-progress or failed, match by stored address metadata
      return (d as any).__contractAddress === normalizedAddr;
    });

    if (existing) {
      // If it previously failed, retry it instead of creating a new one
      if (existing.value.status === 'failed') {
        this.logger.info({ contractAddress: normalizedAddr }, 'Retrying failed deployment');
        existing.next({ status: 'in-progress' });
        if (normalizedAddr) {
          void this.joinDeployment(existing as BehaviorSubject<VotingDeployment>, normalizedAddr);
        } else {
          void this.deployDeployment(existing as BehaviorSubject<VotingDeployment>);
        }
      }
      return existing;
    }

    const deployment = new BehaviorSubject<VotingDeployment>({ status: 'in-progress' });
    // Store the target address for deduplication
    (deployment as any).__contractAddress = normalizedAddr;

    if (normalizedAddr) {
      this.logger.info({ contractAddress: normalizedAddr }, 'Joining existing contract');
      void this.joinDeployment(deployment, normalizedAddr);
    } else {
      this.logger.info('Deploying new contract');
      void this.deployDeployment(deployment);
    }

    this.#deploymentsSubject.next([...deployments, deployment]);

    return deployment;
  }

  private getProviders(): Promise<VotingProviders> {
    if (!this.#connectedAPI) {
      return Promise.reject(
        new Error(
          'Wallet not connected. Please click "Connect Wallet" and approve the connection in the wallet extension popup.',
        ),
      );
    }
    const api = this.#connectedAPI;
    return (this.#initializedProviders ??= initializeProviders(this.logger, api));
  }

  private async deployDeployment(deployment: BehaviorSubject<VotingDeployment>): Promise<void> {
    try {
      const providers = await this.getProviders();
      this.logger.info('Providers initialized, calling VotingAPI.deploy()...');

      // Timeout after 90s — deploy involves proof generation which can be slow
      const deployPromise = VotingAPI.deploy(providers, this.logger);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(
          'Deployment timed out after 90 seconds. Check that: (1) proof server is running at localhost:6300, (2) wallet has sufficient DUST balance, (3) Lace is fully synced.'
        )), 90_000)
      );

      const api = await Promise.race([deployPromise, timeoutPromise]);
      this.logger.info({ contractAddress: api.deployedContractAddress }, 'Contract deployed successfully');

      deployment.next({
        status: 'deployed',
        api,
      });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error({ error: err.message, stack: err.stack }, 'Failed to deploy contract');
      deployment.next({
        status: 'failed',
        error: err,
      });
    }
  }

  private async joinDeployment(
    deployment: BehaviorSubject<VotingDeployment>,
    contractAddress: ContractAddress,
  ): Promise<void> {
    try {
      const providers = await this.getProviders();
      this.logger.info({ contractAddress }, 'Providers initialized, calling VotingAPI.join()...');

      // Add a timeout — if findDeployedContract hangs (invalid address), abort after 30s
      const joinPromise = VotingAPI.join(providers, contractAddress, this.logger);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(
          `Timed out connecting to contract ${contractAddress}. The contract may not exist on preprod or the indexer is unreachable. Try deploying a new election instead.`
        )), 30_000)
      );

      const api = await Promise.race([joinPromise, timeoutPromise]);
      this.logger.info({ contractAddress: api.deployedContractAddress }, 'Joined contract successfully');

      deployment.next({
        status: 'deployed',
        api,
      });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error({ error: err.message, contractAddress, stack: err.stack }, 'Failed to join contract');
      deployment.next({
        status: 'failed',
        error: err,
      });
    }
  }
}

const initializeProviders = async (
  logger: Logger,
  connectedAPI: ConnectedAPI,
): Promise<VotingProviders> => {
  const zkConfigPath = window.location.origin;
  logger.info({ zkConfigPath }, 'Initializing providers');

  const keyMaterialProvider = new FetchZkConfigProvider<VotingCircuitKeys>(
    zkConfigPath,
    fetch.bind(window),
  );

  let config: Awaited<ReturnType<ConnectedAPI['getConfiguration']>>;
  let shieldedAddresses: Awaited<ReturnType<ConnectedAPI['getShieldedAddresses']>>;

  try {
    [config, shieldedAddresses] = await Promise.all([
      connectedAPI.getConfiguration(),
      connectedAPI.getShieldedAddresses(),
    ]);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    logger.error({ error: msg }, 'Failed to retrieve wallet configuration');
    throw new Error(`Wallet configuration error: ${msg}. Ensure your wallet is unlocked and connected to preprod.`);
  }

  logger.info({
    indexerUri: config.indexerUri,
    indexerWsUri: config.indexerWsUri,
    proverServerUri: config.proverServerUri,
    networkId: config.networkId,
  }, 'Wallet configuration retrieved');

  if (!config.proverServerUri) {
    throw new Error(
      'Prover server URI not configured in your wallet. Go to wallet Settings → Midnight → set Proof Server to "http://localhost:6300" and reconnect.',
    );
  }

  if (!config.indexerUri || !config.indexerWsUri) {
    throw new Error(
      'Indexer URIs not configured. Ensure your wallet is connected to Midnight Preprod with valid indexer endpoints.',
    );
  }

  // Verify the proof server is actually reachable
  try {
    const proofCheck = await fetch(config.proverServerUri, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
    if (!proofCheck.ok && proofCheck.status !== 405) {
      logger.warn({ status: proofCheck.status }, 'Proof server responded with non-OK status');
    }
  } catch (e) {
    logger.warn({ proverServerUri: config.proverServerUri }, 'Proof server not reachable — proofs may fail');
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
          logger.info({ ttl }, 'Balancing transaction via wallet');
          const serializedTx = toHex(tx.serialize());
          const received = await connectedAPI.balanceUnsealedTransaction(serializedTx);
          return Transaction.deserialize<SignatureEnabled, Proof, Binding>(
            'signature',
            'proof',
            'binding',
            fromHex(received.tx),
          );
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          logger.error({ error: msg }, 'Error balancing transaction');
          if (msg.includes('Insufficient') || msg.includes('balance')) {
            throw new Error('Insufficient DUST balance. Fund your wallet with tNIGHT and register for DUST generation.');
          }
          throw new Error(`Transaction balancing failed: ${msg}`);
        }
      },
    },
    midnightProvider: {
      submitTx: async (tx: FinalizedTransaction): Promise<TransactionId> => {
        try {
          await connectedAPI.submitTransaction(toHex(tx.serialize()));
          const txIdentifiers = tx.identifiers();
          const txId = txIdentifiers[0];
          logger.info({ txId }, 'Transaction submitted successfully');
          return txId;
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          logger.error({ error: msg }, 'Error submitting transaction');
          if (msg.includes('rejected') || msg.includes('User')) {
            throw new Error('Transaction rejected by user.');
          }
          throw new Error(`Transaction submission failed: ${msg}`);
        }
      },
    },
  };
};
