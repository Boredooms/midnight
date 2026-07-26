import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  TextField,
  Chip,
  Stack,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { useWallet } from '../contexts/WalletContext';

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
    if (hasError) return 'Retry Connect';
    return 'Connect 1AM Wallet';
  };

  const walletButtonColor = (): 'default' | 'success' | 'error' => {
    if (isConnected) return 'success';
    if (hasError) return 'error';
    return 'default';
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        bgcolor: 'rgba(3, 3, 4, 0.92)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid #18181b',
        boxShadow: 'none',
        zIndex: 1100,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', py: 1.5, px: { xs: 2, md: 4 } }}>
        {/* Left: Brand */}
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              p: 1.2,
              bgcolor: '#ffffff0a',
              borderRadius: '12px',
              border: '1px solid #ffffff15',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <LockOutlinedIcon sx={{ color: '#ffffff', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.02em', color: '#ffffff' }}>
              Midnight Voting
            </Typography>
            <Typography variant="caption" sx={{ color: '#a1a1aa', fontWeight: 500, letterSpacing: '0.05em' }}>
              CONFIDENTIAL ZERO-KNOWLEDGE ELECTION PROTOCOL
            </Typography>
          </Box>
          <Chip
            label="PREPROD TESTNET"
            size="small"
            sx={{
              ml: 2,
              bgcolor: '#18181b',
              border: '1px solid #27272a',
              color: '#a1a1aa',
              fontWeight: 600,
              fontSize: '0.7rem',
            }}
          />
        </Stack>

        {/* Right: Join input + Deploy + Wallet */}
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          {/* Contract address input — submit on Enter or button click */}
          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              handleJoin();
            }}
            sx={{ display: 'flex', gap: 1 }}
          >
            <TextField
              size="small"
              placeholder="Paste 32-byte contract address…"
              value={joinAddress}
              onChange={(e) => setJoinAddress(e.target.value)}
              sx={{
                width: 300,
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  bgcolor: '#09090c',
                  borderRadius: '10px',
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  '& fieldset': { borderColor: '#27272a' },
                  '&:hover fieldset': { borderColor: '#52525b' },
                  '&.Mui-focused fieldset': { borderColor: '#ffffff' },
                },
              }}
            />
            <Button
              type="submit"
              variant="outlined"
              sx={{
                color: '#ffffff',
                borderColor: '#27272a',
                borderRadius: '10px',
                px: 2.5,
                whiteSpace: 'nowrap',
                '&:hover': { borderColor: '#ffffff', bgcolor: 'rgba(255,255,255,0.05)' },
              }}
            >
              Join
            </Button>
          </Box>

          {onDeployContract && (
            <Button
              variant="contained"
              onClick={onDeployContract}
              sx={{
                bgcolor: '#ffffff',
                color: '#000000',
                fontWeight: 700,
                borderRadius: '10px',
                px: 2.5,
                whiteSpace: 'nowrap',
                '&:hover': { bgcolor: '#e4e4e7' },
              }}
            >
              + Deploy Election
            </Button>
          )}

          {/* Real 1AM Wallet Connect Button */}
          <Tooltip
            title={
              hasError
                ? (wallet.errorMessage ?? 'Connection failed')
                : isConnected
                ? `Connected to ${wallet.walletName ?? '1AM Wallet'} on ${wallet.networkId ?? 'preprod'}`
                : 'Click to connect your 1AM Wallet extension'
            }
            arrow
          >
            <span>
              <Button
                variant="outlined"
                onClick={isConnected ? wallet.disconnect : wallet.connect}
                disabled={isConnecting}
                startIcon={
                  isConnecting ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : isConnected ? (
                    <CheckCircleIcon sx={{ fontSize: 18, color: '#22c55e' }} />
                  ) : hasError ? (
                    <ErrorIcon sx={{ fontSize: 18, color: '#ef4444' }} />
                  ) : (
                    <AccountBalanceWalletIcon />
                  )
                }
                sx={{
                  borderRadius: '10px',
                  borderColor: isConnected
                    ? '#166534'
                    : hasError
                    ? '#7f1d1d'
                    : '#27272a',
                  color: isConnected ? '#22c55e' : hasError ? '#ef4444' : '#a1a1aa',
                  bgcolor: isConnected
                    ? 'rgba(34,197,94,0.08)'
                    : hasError
                    ? 'rgba(239,68,68,0.08)'
                    : 'transparent',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  maxWidth: 220,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  '&:hover': {
                    borderColor: isConnected ? '#22c55e' : hasError ? '#ef4444' : '#ffffff',
                    bgcolor: isConnected
                      ? 'rgba(34,197,94,0.15)'
                      : hasError
                      ? 'rgba(239,68,68,0.15)'
                      : 'rgba(255,255,255,0.05)',
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
