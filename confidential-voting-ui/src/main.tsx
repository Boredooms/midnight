import './globals';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@mui/material';
import App from './App';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './config/theme';
import '@midnight-ntwrk/dapp-connector-api';
import * as pino from 'pino';
import { WalletProvider, DeployedVotingProvider } from './contexts';
import { NetworkProvider } from './contexts/NetworkContext';

export const logger = pino.pino({
  level: (import.meta.env.VITE_LOGGING_LEVEL ?? 'info') as string,
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <CssBaseline />
    <ThemeProvider theme={theme}>
      {/* NetworkProvider sets the global networkId and provides config to children */}
      <NetworkProvider>
        {/* WalletProvider must wrap DeployedVotingProvider so DeployedVotingProvider can read wallet state */}
        <WalletProvider>
          <DeployedVotingProvider logger={logger}>
            <App />
          </DeployedVotingProvider>
        </WalletProvider>
      </NetworkProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
