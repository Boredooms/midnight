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
    <AppBar position="sticky" sx={{ bgcolor: 'rgba(3, 3, 4, 0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #18181b', elevation: 0 }}>
      <Toolbar sx={{ justifyContent: 'space-between', py: 1.5, px: { xs: 2, md: 4 } }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Box sx={{ p: 1.2, bgcolor: '#ffffff0a', borderRadius: '12px', border: '1px solid #ffffff15', display: 'flex', alignItems: 'center' }}>
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
          <Chip label="PREPROD TESTNET" size="small" sx={{ ml: 2, bgcolor: '#18181b', border: '1px solid #27272a', color: '#a1a1aa', fontWeight: 600, fontSize: '0.7rem' }} />
        </Stack>

        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Enter 32-Byte Contract Address..."
            value={joinAddress}
            onChange={(e) => setJoinAddress(e.target.value)}
            sx={{
              width: 310,
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
          <Button variant="outlined" sx={{ color: '#ffffff', borderColor: '#27272a', borderRadius: '10px', px: 2.5 }} onClick={handleJoin}>
            Join
          </Button>

          {onDeployContract && (
            <Button
              variant="contained"
              sx={{ bgcolor: '#ffffff', color: '#000000', fontWeight: 700, borderRadius: '10px', px: 2.5, '&:hover': { bgcolor: '#e4e4e7' } }}
              onClick={onDeployContract}
            >
              + Deploy Election
            </Button>
          )}

          <Button startIcon={<AccountBalanceWalletIcon />} variant="outlined" sx={{ borderRadius: '10px', borderColor: '#27272a', color: '#a1a1aa', fontWeight: 600 }}>
            1AM Wallet
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};
