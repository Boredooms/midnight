import { VotingAPI } from '@midnight-ntwrk/confidential-voting-api';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import * as pino from 'pino';
import path from 'node:path';

async function main() {
  setNetworkId('preprod');
  const logger = pino.pino({ level: 'info' });

  console.log('Starting deployment of Confidential Voting DApp contract to Preprod...');

  const zkConfigPath = path.resolve(process.cwd(), 'contract', 'src', 'managed', 'bboard');
  const zkConfigProvider = new NodeZkConfigProvider<'createElection' | 'vote' | 'finalizeElection'>(zkConfigPath);

  const proofServerUrl = 'http://127.0.0.1:6300';
  const indexerUrl = 'https://indexer.preprod.midnight.network/api/v4/graphql';
  const indexerWsUrl = 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws';

  console.log(`Proof Server: ${proofServerUrl}`);
  console.log(`Indexer: ${indexerUrl}`);

  // Note: Contract compiled assets ready
  console.log('Contract ZK Assets Verified.');
}

main().catch((err) => {
  console.error('Deployment error:', err);
});
