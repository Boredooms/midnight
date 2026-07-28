import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type PropsWithChildren,
} from 'react';
import {
  type InitialAPI,
  type ConnectedAPI,
} from '@midnight-ntwrk/dapp-connector-api';
import { WalletSelectDialog, type DetectedWallet } from '../components/WalletSelectDialog';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type WalletStatus =
  | 'idle'
  | 'detecting'
  | 'selecting'
  | 'connecting'
  | 'connected'
  | 'error';

export interface WalletState {
  status: WalletStatus;
  walletName: string | null;
  networkId: string | null;
  shieldedAddress: string | null;
  dustBalance: bigint | null;
  errorMessage: string | null;
  connectedAPI: ConnectedAPI | null;
}

export interface WalletContextValue extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const NETWORK_ID = (import.meta.env.VITE_NETWORK_ID as string | undefined) ?? 'preprod';

/**
 * Discover all Midnight wallets injected into window.midnight.
 * Per the DApp Connector API spec, wallets inject under various keys.
 * Lace uses 'mnLace', 1AM uses UUID or '1am'.
 * We enumerate everything and filter by valid shape.
 */
const listWallets = (): DetectedWallet[] => {
  if (typeof window === 'undefined' || !window.midnight) return [];
  const entries = Object.entries(window.midnight as Record<string, unknown>);
  const wallets: DetectedWallet[] = [];

  for (const [key, candidate] of entries) {
    if (
      candidate &&
      typeof candidate === 'object' &&
      'apiVersion' in candidate &&
      'connect' in candidate &&
      typeof (candidate as any).connect === 'function'
    ) {
      wallets.push({ key, api: candidate as InitialAPI });
    }
  }

  return wallets;
};

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export const WalletProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [state, setState] = useState<WalletState>({
    status: 'idle',
    walletName: null,
    networkId: null,
    shieldedAddress: null,
    dustBalance: null,
    errorMessage: null,
    connectedAPI: null,
  });

  const [showSelector, setShowSelector] = useState(false);
  const [detectedWallets, setDetectedWallets] = useState<DetectedWallet[]>([]);
  const connectedAPIRef = useRef<ConnectedAPI | null>(null);

  const connectToWallet = useCallback(async (wallet: InitialAPI, walletName: string) => {
    setState((s) => ({ ...s, status: 'connecting', walletName, errorMessage: null }));

    try {
      const connectedAPI = await wallet.connect(NETWORK_ID);
      connectedAPIRef.current = connectedAPI;

      // Validate connection status per DApp Connector API spec
      const connectionStatus = await connectedAPI.getConnectionStatus();
      if (connectionStatus.status !== 'connected') {
        throw new Error('Wallet connection was not established. Please try again.');
      }

      const [shieldedAddrs, dustBal] = await Promise.all([
        connectedAPI.getShieldedAddresses().catch(() => null),
        connectedAPI.getDustBalance().catch(() => null),
      ]);

      const netId = connectionStatus.networkId ?? NETWORK_ID;

      setState({
        status: 'connected',
        walletName,
        networkId: netId,
        shieldedAddress: shieldedAddrs?.shieldedAddress ?? null,
        dustBalance: dustBal?.balance ?? null,
        errorMessage: null,
        connectedAPI,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to connect wallet';
      setState((s) => ({
        ...s,
        status: 'error',
        walletName: null,
        errorMessage: msg,
        connectedAPI: null,
      }));
      connectedAPIRef.current = null;
    }
  }, []);

  const connect = useCallback(async () => {
    setState((s) => ({ ...s, status: 'detecting', errorMessage: null }));

    // Poll for wallet injection (up to 4 seconds)
    let wallets: DetectedWallet[] = [];
    for (let i = 0; i < 20; i++) {
      wallets = listWallets();
      if (wallets.length > 0) break;
      await new Promise((r) => setTimeout(r, 200));
    }

    if (wallets.length === 0) {
      setState((s) => ({
        ...s,
        status: 'error',
        errorMessage:
          'No Midnight wallet detected. Install the Lace or 1AM wallet extension and refresh the page.',
      }));
      return;
    }

    // If only one wallet, connect directly. If multiple, show selection dialog.
    if (wallets.length === 1) {
      const w = wallets[0];
      await connectToWallet(w.api, w.api.name ?? 'Midnight Wallet');
    } else {
      setDetectedWallets(wallets);
      setShowSelector(true);
      setState((s) => ({ ...s, status: 'selecting' }));
    }
  }, [connectToWallet]);

  const handleWalletSelect = useCallback(
    (wallet: DetectedWallet) => {
      setShowSelector(false);
      void connectToWallet(wallet.api, wallet.api.name ?? 'Midnight Wallet');
    },
    [connectToWallet],
  );

  const handleSelectorClose = useCallback(() => {
    setShowSelector(false);
    setState((s) => (s.status === 'selecting' ? { ...s, status: 'idle' } : s));
  }, []);

  const disconnect = useCallback(() => {
    connectedAPIRef.current = null;
    setState({
      status: 'idle',
      walletName: null,
      networkId: null,
      shieldedAddress: null,
      dustBalance: null,
      errorMessage: null,
      connectedAPI: null,
    });
  }, []);

  return (
    <WalletContext.Provider value={{ ...state, connect, disconnect }}>
      {children}
      <WalletSelectDialog
        open={showSelector}
        wallets={detectedWallets}
        onSelect={handleWalletSelect}
        onClose={handleSelectorClose}
      />
    </WalletContext.Provider>
  );
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export const useWallet = (): WalletContextValue => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used inside <WalletProvider>');
  return ctx;
};
