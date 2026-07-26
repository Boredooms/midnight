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
    <AppBar position="sticky" sx={{ bgcolor: 'rgba(3, 3, 4, 0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #18181b', elevation: 0, zIndex: 1100 }}>
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

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
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
              placeholder="Paste 32-Byte Contract Address & press Enter..."
              value={joinAddress}
              onChange={(e) => setJoinAddress(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleJoin();
                }
              }}
              sx={{
                width: 320,
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
              sx={{ color: '#ffffff', borderColor: '#27272a', borderRadius: '10px', px: 2.5, whiteSpace: 'nowrap', '&:hover': { borderColor: '#ffffff', bgcolor: 'rgba(255,255,255,0.05)' } }}
            >
              Join
            </Button>
          </Box>

          {onDeployContract && (
            <Button
              variant="contained"
              sx={{ bgcolor: '#ffffff', color: '#000000', fontWeight: 700, borderRadius: '10px', px: 2.5, whiteSpace: 'nowrap', '&:hover': { bgcolor: '#e4e4e7' } }}
              onClick={onDeployContract}
            >
              + Deploy Election
            </Button>
          )}

          <Button startIcon={<AccountBalanceWalletIcon />} variant="outlined" sx={{ borderRadius: '10px', borderColor: '#27272a', color: '#a1a1aa', fontWeight: 600, whiteSpace: 'nowrap' }}>
            1AM Wallet
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};
