import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Box, Button, TextField, Chip, Stack } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

export type HeaderProps = {
  onJoinContract?: (contractAddress: string) => void;
  onDeployContract?: () => void;
};

export const Header: React.FC<HeaderProps> = ({ onJoinContract, onDeployContract }) => {
  const [joinAddress, setJoinAddress] = useState<string>('');

  const handleJoin = () => {
    if (joinAddress.trim() && onJoinContract) {
      onJoinContract(joinAddress.trim());
      setJoinAddress('');
    }
  };

  return (
    <AppBar position="static" sx={{ bgcolor: '#0b0b10', borderBottom: '1px solid #1f1f2e', elevation: 0 }}>
      <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box sx={{ p: 1, bgcolor: '#00f2fe22', borderRadius: 2, display: 'flex', alignItems: 'center' }}>
            <LockOutlinedIcon sx={{ color: '#00f2fe', fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, background: 'linear-gradient(90deg, #fff, #90a0b7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Midnight Confidential Voting
            </Typography>
            <Typography variant="caption" sx={{ color: '#00f2fe' }}>
              Rise In Level 1 Challenge • Zero-Knowledge DApp
            </Typography>
          </Box>
          <Chip label="Preprod Testnet" size="small" color="primary" variant="outlined" sx={{ ml: 2, borderColor: '#00f2fe', color: '#00f2fe' }} />
        </Stack>

        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            size="small"
            placeholder="Enter Deployed Contract Address..."
            value={joinAddress}
            onChange={(e) => setJoinAddress(e.target.value)}
            sx={{
              width: 320,
              '& .MuiOutlinedInput-root': {
                color: '#fff',
                bgcolor: '#14141e',
                borderRadius: 2,
                '& fieldset': { borderColor: '#2c2c3e' },
                '&:hover fieldset': { borderColor: '#00f2fe' },
              },
            }}
          />
          <Button variant="outlined" sx={{ color: '#00f2fe', borderColor: '#00f2fe', borderRadius: 2 }} onClick={handleJoin}>
            Join
          </Button>

          {onDeployContract && (
            <Button
              variant="contained"
              sx={{ background: 'linear-gradient(90deg, #00f2fe 0%, #4facfe 100%)', color: '#000', fontWeight: 700, borderRadius: 2 }}
              onClick={onDeployContract}
            >
              + Deploy New
            </Button>
          )}

          <Button startIcon={<AccountBalanceWalletIcon />} variant="contained" color="secondary" sx={{ borderRadius: 2, fontWeight: 600 }}>
            Lace Wallet
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};
