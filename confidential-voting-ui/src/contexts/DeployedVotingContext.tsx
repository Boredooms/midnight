import React, { type PropsWithChildren, createContext, useContext, useMemo, useEffect } from 'react';
import { type DeployedVotingAPIProvider, BrowserDeployedVotingManager } from './BrowserDeployedVotingManager';
import { useWallet } from './WalletContext';
import { type Logger } from 'pino';

export const DeployedVotingContext = createContext<DeployedVotingAPIProvider | undefined>(undefined);

export type DeployedVotingProviderProps = PropsWithChildren<{
  logger: Logger;
}>;

export const DeployedVotingProvider: React.FC<Readonly<DeployedVotingProviderProps>> = ({
  logger,
  children,
}) => {
  const { connectedAPI } = useWallet();

  // Create the manager once and reuse it
  const manager = useMemo(() => new BrowserDeployedVotingManager(logger), [logger]);

  // Whenever the wallet connects (connectedAPI changes), hand the API to the manager
  useEffect(() => {
    if (connectedAPI) {
      manager.setConnectedAPI(connectedAPI);
    }
  }, [connectedAPI, manager]);

  return (
    <DeployedVotingContext.Provider value={manager}>
      {children}
    </DeployedVotingContext.Provider>
  );
};

export const useDeployedVotingContext = (): DeployedVotingAPIProvider => {
  const ctx = useContext(DeployedVotingContext);
  if (!ctx) throw new Error('useDeployedVotingContext must be used inside <DeployedVotingProvider>');
  return ctx;
};

export * from './BrowserDeployedVotingManager';
