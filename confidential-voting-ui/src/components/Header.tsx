import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  TextField,
  Stack,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { useWallet } from '../contexts/WalletContext';
import { NetworkSwitcher } from './NetworkSwitcher';

export type HeaderProps = {
  onJoinContract?: (contractAddress: string) => void;
  onDeployContract?: () => void;
};

const shortAddr = (addr: string | null): string => {
  if (!addr) return '';
  if (addr.length <= 16) return addr;
  return `${addr.slice(0, 8)}…${addr.slice(-6)}`;
};

export const Header: React.FC<HeaderProps> = ({ onJoinContract, onDeployContract }) => {
  const [joinAddress, setJoinAddress] = useState<string>('');
  const wallet = useWallet();

  const handleJoin = () => {
    if (joinAddress.trim() && onJoinContract) {
      onJoinContract(joinAddress.trim());
      setJoinAddress('');
    }
  };

  const isConnecting = wallet.status === 'detecting' || wallet.status === 'connecting';
  const isConnected = wallet.status === 'connected';
  const hasError = wallet.status === 'error';

  const walletButtonLabel = () => {
    if (wallet.status === 'detecting') return 'Detecting…';
    if (wallet.status === 'connecting') return 'Connecting…';
    if (isConnected) return shortAddr(wallet.shieldedAddress) || wallet.walletName || 'Connected';
    if (hasError) return 'Retry';
    return 'Connect Wallet';
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        bgcolor: 'rgba(3, 3, 4, 0.85)',
        backdropFilter: 'blur(16px) saturate(1.2)',
        borderBottom: '1px solid #18181b',
        boxShadow: 'none',
      }}
    >
      <Toolbar
        sx={{
          justifyContent: 'space-between',
          py: 1,
          px: { xs: 2, md: 3 },
          minHeight: { xs: 56, md: 64 },
        }}
      >
        {/* Left: Brand */}
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              p: 0.8,
              bgcolor: '#ffffff08',
              borderRadius: '8px',
              border: '1px solid #ffffff10',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <LockOutlinedIcon sx={{ color: '#ffffff', fontSize: 20 }} />
          </Box>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, letterSpacing: '-0.02em', color: '#ffffff' }}
          >
            Midnight Voting
          </Typography>
        </Stack>

        {/* Right: Actions */}
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          {/* Contract address input */}
          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              handleJoin();
            }}
            sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.75 }}
          >
            <TextField
              size="small"
              placeholder="Contract address…"
              value={joinAddress}
              onChange={(e) => setJoinAddress(e.target.value)}
              sx={{
                width: 240,
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  bgcolor: '#09090c',
                  borderRadius: '8px',
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  height: 36,
                  '& fieldset': { borderColor: '#27272a' },
                  '&:hover fieldset': { borderColor: '#3f3f46' },
                  '&.Mui-focused fieldset': { borderColor: '#52525b' },
                },
              }}
            />
            <Button
              type="submit"
              variant="outlined"
              size="small"
              sx={{
                color: '#a1a1aa',
                borderColor: '#27272a',
                borderRadius: '8px',
                px: 1.5,
                minWidth: 'auto',
                height: 36,
                fontSize: '0.8rem',
                '&:hover': { borderColor: '#52525b', bgcolor: '#ffffff05' },
              }}
            >
              Join
            </Button>
          </Box>

          {/* Network Switcher */}
          <NetworkSwitcher />

          {/* Wallet Connect Button */}
          <Tooltip
            title={
              hasError
                ? (wallet.errorMessage ?? 'Connection failed')
                : isConnected
                  ? `Connected to ${wallet.walletName ?? 'Midnight Wallet'} on ${wallet.networkId ?? 'preprod'}`
                  : 'Connect your Midnight wallet extension'
            }
            arrow
          >
            <span>
              <Button
                variant="outlined"
                size="small"
                onClick={isConnected ? wallet.disconnect : wallet.connect}
                disabled={isConnecting}
                startIcon={
                  isConnecting ? (
                    <CircularProgress size={14} color="inherit" />
                  ) : isConnected ? (
                    <CheckCircleIcon sx={{ fontSize: 16, color: '#22c55e' }} />
                  ) : hasError ? (
                    <ErrorIcon sx={{ fontSize: 16, color: '#ef4444' }} />
                  ) : (
                    <AccountBalanceWalletIcon sx={{ fontSize: 16 }} />
                  )
                }
                sx={{
                  borderRadius: '8px',
                  height: 36,
                  borderColor: isConnected
                    ? '#166534'
                    : hasError
                      ? '#7f1d1d'
                      : '#27272a',
                  color: isConnected ? '#22c55e' : hasError ? '#ef4444' : '#a1a1aa',
                  bgcolor: isConnected
                    ? 'rgba(34,197,94,0.06)'
                    : hasError
                      ? 'rgba(239,68,68,0.06)'
                      : 'transparent',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  whiteSpace: 'nowrap',
                  maxWidth: 200,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  '&:hover': {
                    borderColor: isConnected ? '#22c55e' : hasError ? '#ef4444' : '#52525b',
                    bgcolor: isConnected
                      ? 'rgba(34,197,94,0.12)'
                      : hasError
                        ? 'rgba(239,68,68,0.12)'
                        : '#ffffff08',
                  },
                }}
              >
                {walletButtonLabel()}
              </Button>
            </span>
          </Tooltip>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};
