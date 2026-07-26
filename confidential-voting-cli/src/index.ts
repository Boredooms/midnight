import { createInterface, type Interface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import {
  type VotingAPI,
  type VotingDerivedState,
  type VotingProviders,
  VotingAPI as API,
  votingPrivateStateKey,
  randomBytes,
} from '@midnight-ntwrk/confidential-voting-api';
import {
  type ContractAddress,
  type Ledger,
  State,
} from '@midnight-ntwrk/confidential-voting-contract';
import { type DeployedVotingContract } from '@midnight-ntwrk/confidential-voting-api';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { type PrivateStateId } from '@midnight-ntwrk/midnight-js-contracts';
import { type VotingPrivateState } from '@midnight-ntwrk/confidential-voting-contract';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { type Logger } from 'pino';
import { toHex } from '@midnight-ntwrk/midnight-js-utils';
import { Config, StandaloneConfig } from './config.js';
import { MidnightWalletProvider } from './midnight-wallet-provider.js';
import { TestEnvironment, unshieldedToken } from '@midnight-ntwrk/testkit-js';
import { type WalletFacade } from '@midnight-ntwrk/wallet-sdk';
import { syncWallet, waitForUnshieldedFunds } from './wallet-utils.js';
import { generateDust } from './generate-dust.js';

const DEPLOY_OR_JOIN_QUESTION = `
You can do one of the following:
  1. Deploy a new Confidential Voting contract
  2. Join an existing Confidential Voting contract
  3. Exit
Which would you like to do? `;

const deployOrJoin = async (
  providers: VotingProviders,
  rli: Interface,
  logger: Logger,
): Promise<VotingAPI | null> => {
  while (true) {
    const choice = await rli.question(DEPLOY_OR_JOIN_QUESTION);
    switch (choice) {
      case '1':
        return await API.deploy(providers, logger);
      case '2': {
        const contractAddress = await rli.question('Enter contract address: ');
        return await API.join(providers, contractAddress as ContractAddress, logger);
      }
      case '3':
        logger.info('Exiting...');
        return null;
      default:
        logger.error(`Invalid choice: ${choice}`);
    }
  }
};

const displayLedgerState = async (
  providers: VotingProviders,
  deployedContract: DeployedVotingContract,
  logger: Logger,
) => {
  const contractAddress = deployedContract.deployTxData.public.contractAddress;
  const contractState = await providers.publicDataProvider.queryContractState(contractAddress);

  if (contractState !== null) {
    const state: Ledger = (contractState.data as unknown as { ledger: Ledger }).ledger;
    logger.info(`Ledger State Status: ${state.state}`);
    logger.info(`Election Title: ${state.electionTitle.is_some ? state.electionTitle.value : 'None'}`);
    logger.info(`Candidate 0 Tally: ${state.candidate0Tally}`);
    logger.info(`Candidate 1 Tally: ${state.candidate1Tally}`);
    logger.info(`Total Votes Cast: ${state.totalVotes}`);
    logger.info(`Owner Commitment: ${toHex(state.owner)}`);
  } else {
    logger.info(`No contract state found for contract address: ${contractAddress}`);
  }
};

const displayPrivateState = async (providers: VotingProviders, logger: Logger) => {
  const privateState = await providers.privateStateProvider.get(votingPrivateStateKey);
  if (privateState === null) {
    logger.info(`There is no existing voting private state`);
  } else {
    logger.info(`Current secret key is: ${toHex(privateState.secretKey)}`);
  }
};

const displayDerivedState = (ledgerState: VotingDerivedState | undefined, logger: Logger) => {
  if (ledgerState === undefined) {
    logger.info(`No voting derived state currently available`);
  } else {
    let stateName = 'UNINITIALIZED';
    if (ledgerState.state === State.OPEN) stateName = 'OPEN';
    if (ledgerState.state === State.FINALIZED) stateName = 'FINALIZED';

    logger.info(`Current Election Status: '${stateName}'`);
    logger.info(`Title: '${ledgerState.electionTitle ?? 'Uninitialized'}'`);
    logger.info(`Candidate 0 Votes: ${ledgerState.candidate0Tally}`);
    logger.info(`Candidate 1 Votes: ${ledgerState.candidate1Tally}`);
    logger.info(`Total Votes: ${ledgerState.totalVotes}`);
    logger.info(`Is Election Creator: '${ledgerState.isOwner ? 'yes' : 'no'}'`);
  }
};

const MAIN_LOOP_QUESTION = `
You can do one of the following:
  1. Create a new Election (Set Title)
  2. Cast a Confidential Vote (Candidate 0 or 1)
  3. Finalize Election
  4. Display Public Ledger State
  5. Display Private State
  6. Display Derived State
  7. Exit
Which would you like to do? `;

const mainLoop = async (providers: VotingProviders, rli: Interface, logger: Logger): Promise<void> => {
  const votingApi = await deployOrJoin(providers, rli, logger);
  if (votingApi === null) {
    return;
  }
  let currentState: VotingDerivedState | undefined;
  const stateObserver = {
    next: (state: VotingDerivedState) => (currentState = state),
  };
  const subscription = votingApi.state$.subscribe(stateObserver);
  try {
    while (true) {
      const choice = await rli.question(MAIN_LOOP_QUESTION);
      try {
        switch (choice) {
          case '1': {
            const title = await rli.question('Enter Election Title: ');
            await votingApi.createElection(title);
            break;
          }
          case '2': {
            const candidateStr = await rli.question('Vote for candidate (0 or 1): ');
            const candidateIndex = parseInt(candidateStr.trim(), 10);
            if (candidateIndex !== 0 && candidateIndex !== 1) {
              logger.error('Invalid candidate index. Choice must be 0 or 1.');
              break;
            }
            await votingApi.vote(candidateIndex);
            break;
          }
          case '3':
            await votingApi.finalizeElection();
            break;
          case '4':
            await displayLedgerState(providers, votingApi.deployedContract, logger);
            break;
          case '5':
            await displayPrivateState(providers, logger);
            break;
          case '6':
            displayDerivedState(currentState, logger);
            break;
          case '7':
            logger.info('Exiting...');
            return;
          default:
            logger.error(`Invalid choice: ${choice}`);
        }
      } catch (e) {
        logError(logger, e);
        logger.info('Returning to main menu...');
      }
    }
  } finally {
    subscription.unsubscribe();
  }
};

const GENESIS_MINT_WALLET_SEED = '0000000000000000000000000000000000000000000000000000000000000001';

const WALLET_LOOP_QUESTION = `
You can do one of the following:
  1. Build a fresh wallet
  2. Build wallet from a seed
  3. Exit
Which would you like to do? `;

const buildWallet = async (config: Config, rli: Interface, logger: Logger): Promise<string | undefined> => {
  if (config instanceof StandaloneConfig) {
    return GENESIS_MINT_WALLET_SEED;
  }
  while (true) {
    const choice = await rli.question(WALLET_LOOP_QUESTION);
    switch (choice) {
      case '1':
        return toHex(randomBytes(32));
      case '2':
        return await rli.question('Enter your wallet seed: ');
      case '3':
        logger.info('Exiting...');
        return undefined;
      default:
        logger.error(`Invalid choice: ${choice}`);
    }
  }
};

export const run = async (config: Config, testEnv: TestEnvironment, logger: Logger): Promise<void> => {
  const rli = createInterface({ input, output, terminal: true });
  const providersToBeStopped: MidnightWalletProvider[] = [];
  try {
    const envConfiguration = await testEnv.start();
    logger.info(`Environment started with configuration: ${JSON.stringify(envConfiguration)}`);
    const seed = await buildWallet(config, rli, logger);
    if (seed === undefined) {
      return;
    }
    const walletProvider = await MidnightWalletProvider.build(logger, envConfiguration, seed);
    providersToBeStopped.push(walletProvider);
    const walletFacade: WalletFacade = walletProvider.wallet;

    await walletProvider.start();

    const unshieldedState = await waitForUnshieldedFunds(logger, walletFacade, envConfiguration, unshieldedToken());
    const nightBalance = unshieldedState.balances[unshieldedToken().raw];
    if (nightBalance === undefined) {
      logger.info('No funds received, exiting...');
      return;
    }
    logger.info(`Your NIGHT wallet balance is: ${nightBalance}`);

    if (config.generateDust) {
      const dustGeneration = await generateDust(logger, seed, unshieldedState, walletFacade);
      if (dustGeneration) {
        logger.info(`Submitted dust generation registration transaction: ${dustGeneration}`);
        await syncWallet(logger, walletFacade);
      }
    }

    const zkConfigProvider = new NodeZkConfigProvider<'createElection' | 'vote' | 'finalizeElection'>(config.zkConfigPath);
    const providers: VotingProviders = {
      privateStateProvider: levelPrivateStateProvider<PrivateStateId, VotingPrivateState>({
        privateStateStoreName: config.privateStateStoreName,
        signingKeyStoreName: `${config.privateStateStoreName}-signing-keys`,
        privateStoragePasswordProvider: () => {
          return 'Voting-Test-2026!';
        },
        accountId: seed,
      }),
      publicDataProvider: indexerPublicDataProvider(envConfiguration.indexer, envConfiguration.indexerWS),
      zkConfigProvider: zkConfigProvider,
      proofProvider: httpClientProofProvider(envConfiguration.proofServer, zkConfigProvider),
      walletProvider: walletProvider,
      midnightProvider: walletProvider,
    };
    await mainLoop(providers, rli, logger);
  } catch (e) {
    logError(logger, e);
    logger.info('Exiting...');
  } finally {
    try {
      rli.close();
      rli.removeAllListeners();
    } catch (e) {
      logError(logger, e);
    } finally {
      try {
        for (const wallet of providersToBeStopped) {
          logger.info('Stopping wallet...');
          await wallet.stop();
        }
        if (testEnv) {
          logger.info('Stopping test environment...');
          await testEnv.shutdown();
        }
      } catch (e) {
        logError(logger, e);
      }
    }
  }
};

function logError(logger: Logger, e: unknown) {
  if (e instanceof Error) {
    logger.error(`Found error '${e.message}'`);
    logger.debug(`${e.stack}`);
  } else {
    logger.error(`Found error (unknown type)`);
  }
}
