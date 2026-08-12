/**
 * Midnight Network configuration for all supported environments.
 * Proof server is ALWAYS local (localhost:6300) — it handles private data.
 * Node/indexer endpoints differ per network.
 *
 * Reference: https://docs.midnight.network/guides/networks-and-environments#environment-reference
 */

export type NetworkId = 'undeployed' | 'preview' | 'preprod' | 'mainnet';

export interface NetworkConfig {
  readonly networkId: NetworkId;
  readonly label: string;
  readonly node: string;
  readonly nodeWS: string;
  readonly indexer: string;
  readonly indexerWS: string;
  readonly proofServer: string;
  readonly faucet: string | null;
  readonly explorer: string | null;
}

export const NETWORKS: Record<NetworkId, NetworkConfig> = {
  undeployed: {
    networkId: 'undeployed',
    label: 'Local Dev',
    node: 'http://localhost:9944',
    nodeWS: 'ws://localhost:9944',
    indexer: 'http://localhost:8088/api/v4/graphql',
    indexerWS: 'ws://localhost:8088/api/v4/graphql/ws',
    proofServer: 'http://localhost:6300',
    faucet: null,
    explorer: null,
  },
  preview: {
    networkId: 'preview',
    label: 'Preview',
    node: 'https://rpc.preview.midnight.network',
    nodeWS: 'wss://rpc.preview.midnight.network',
    indexer: 'https://indexer.preview.midnight.network/api/v4/graphql',
    indexerWS: 'wss://indexer.preview.midnight.network/api/v4/graphql/ws',
    proofServer: 'http://localhost:6300',
    faucet: 'https://midnight-tmnight-preview.nethermind.dev/',
    explorer: 'https://preview.midnightexplorer.com/',
  },
  preprod: {
    networkId: 'preprod',
    label: 'Preprod',
    node: 'https://rpc.preprod.midnight.network',
    nodeWS: 'wss://rpc.preprod.midnight.network',
    indexer: 'https://indexer.preprod.midnight.network/api/v4/graphql',
    indexerWS: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
    proofServer: 'http://localhost:6300',
    faucet: 'https://midnight-tmnight-preprod.nethermind.dev/',
    explorer: 'https://preprod.midnightexplorer.com/',
  },
  mainnet: {
    networkId: 'mainnet',
    label: 'Mainnet',
    node: 'https://rpc.mainnet.midnight.network',
    nodeWS: 'wss://rpc.mainnet.midnight.network',
    indexer: 'https://indexer.mainnet.midnight.network/api/v4/graphql',
    indexerWS: 'wss://indexer.mainnet.midnight.network/api/v4/graphql/ws',
    proofServer: 'http://localhost:6300',
    faucet: null,
    explorer: 'https://midnightexplorer.com/',
  },
} as const;

/**
 * Get the active network config from the VITE_NETWORK_ID env var.
 * Falls back to 'preprod' if unset or invalid.
 */
export function getActiveNetwork(): NetworkConfig {
  const envId = (import.meta.env.VITE_NETWORK_ID as string | undefined) ?? 'preprod';
  const config = NETWORKS[envId as NetworkId];
  if (!config) {
    console.warn(`Unknown VITE_NETWORK_ID "${envId}", falling back to preprod`);
    return NETWORKS.preprod;
  }
  return config;
}
