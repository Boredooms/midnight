import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type PropsWithChildren,
} from 'react';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { NETWORKS, getActiveNetwork, type NetworkConfig, type NetworkId } from '../config/networks';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface NetworkContextValue {
  /** The currently active network config */
  network: NetworkConfig;
  /** All available networks */
  networks: typeof NETWORKS;
  /** Switch to a different network. Requires page reload to take full effect. */
  switchNetwork: (id: NetworkId) => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const NetworkContext = createContext<NetworkContextValue | undefined>(undefined);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export const NetworkProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [network, setNetwork] = useState<NetworkConfig>(() => {
    const active = getActiveNetwork();
    // Ensure midnight-js-network-id is set on first render
    setNetworkId(active.networkId);
    return active;
  });

  const switchNetwork = useCallback((id: NetworkId) => {
    const config = NETWORKS[id];
    if (!config) {
      console.error(`Cannot switch to unknown network: ${id}`);
      return;
    }
    // Update the global network ID used by Midnight.js
    setNetworkId(config.networkId);
    setNetwork(config);
    // Store preference so it persists across refreshes
    try {
      localStorage.setItem('midnight_network_id', id);
    } catch {
      // localStorage might be unavailable
    }
  }, []);

  return (
    <NetworkContext.Provider value={{ network, networks: NETWORKS, switchNetwork }}>
      {children}
    </NetworkContext.Provider>
  );
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export const useNetwork = (): NetworkContextValue => {
  const ctx = useContext(NetworkContext);
  if (!ctx) throw new Error('useNetwork must be used inside <NetworkProvider>');
  return ctx;
};
