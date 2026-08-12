import React, { useEffect, useState } from 'react';
import { Box, Typography, Stack, Button, Chip, Tooltip, Grid, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CircleIcon from '@mui/icons-material/Circle';
import LinkIcon from '@mui/icons-material/Link';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import { VotingCard } from '../components/VotingCard';
import { useDeployedVotingContext } from '../hooks';
import { type VotingDeployment } from '../contexts';
import { useWallet } from '../contexts/WalletContext';
import { useNetwork } from '../contexts/NetworkContext';
import { type Observable } from 'rxjs';
import { CONTRACT_ADDRESS } from '../globals';

const AppPage: React.FC = () => {
  const votingManager = useDeployedVotingContext();
  const wallet = useWallet();
  const { network } = useNetwork();
  const [deployments, setDeployments] = useState<Array<Observable<VotingDeployment>>>([]);
  const [joinAddress, setJoinAddress] = useState('');

  useEffect(() => {
    const sub = votingManager.deployments$.subscribe(setDeployments);
    return () => sub.unsubscribe();
  }, [votingManager]);

  // Don't auto-join any contract — user must explicitly click
  // The old auto-join was trying to connect to a preprod contract on preview network

  const handleDeployNew = () => votingManager.resolve();
  const handleJoinContract = (addr: string) => {
    if (addr.trim()) votingManager.resolve(addr.trim() as any);
  };
  const handleRetryConnect = () => {
    if (wallet.status !== 'connected') void wallet.connect();
    else if (CONTRACT_ADDRESS) votingManager.retry(CONTRACT_ADDRESS as any);
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      {/* Page header */}
      <Stack spacing={2} sx={{ mb: 4 }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <HowToVoteIcon sx={{ color: '#a78bfa', fontSize: 24 }} />
            <Typography sx={{ fontWeight: 700, fontSize: '1.4rem', color: '#f4f4f5', letterSpacing: '-0.02em' }}>
              Elections
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Tooltip title={`Proof Server: ${network.proofServer}`} arrow>
              <Chip icon={<CircleIcon sx={{ fontSize: '8px !important', color: '#22c55e !important' }} />} label="Proof" size="small" sx={{ bgcolor: '#18181b', border: '1px solid #27272a', color: '#71717a', fontSize: '0.7rem', height: 24 }} />
            </Tooltip>
            <Tooltip title={`Network: ${network.label} (${network.networkId})`} arrow>
              <Chip icon={<CircleIcon sx={{ fontSize: '8px !important', color: '#22c55e !important' }} />} label={network.label} size="small" sx={{ bgcolor: '#18181b', border: '1px solid #27272a', color: '#71717a', fontSize: '0.7rem', height: 24 }} />
            </Tooltip>
          </Stack>
        </Stack>
        <Typography sx={{ color: '#71717a', fontSize: '0.88rem' }}>
          Deploy new elections or join existing contracts on {network.label}
        </Typography>
      </Stack>

      {/* Stats row */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Box sx={{ p: 2.5, borderRadius: '14px', bgcolor: '#09090c', border: '1px solid #18181b' }}>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#f4f4f5' }}>{deployments.length}</Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#71717a', mt: 0.5 }}>Active Elections</Typography>
          </Box>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Box sx={{ p: 2.5, borderRadius: '14px', bgcolor: '#09090c', border: '1px solid #18181b' }}>
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: wallet.status === 'connected' ? '#22c55e' : '#71717a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {wallet.status === 'connected'
                ? (wallet.shieldedAddress ? `${wallet.shieldedAddress.slice(0, 12)}…` : wallet.walletName || 'Connected')
                : 'Disconnected'}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#71717a', mt: 0.5 }}>Wallet</Typography>
          </Box>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Box sx={{ p: 2.5, borderRadius: '14px', bgcolor: '#09090c', border: '1px solid #18181b' }}>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#f4f4f5' }}>4</Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#71717a', mt: 0.5 }}>ZK Circuits</Typography>
          </Box>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Box sx={{ p: 2.5, borderRadius: '14px', bgcolor: '#09090c', border: '1px solid #18181b' }}>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#a78bfa' }}>:6300</Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#71717a', mt: 0.5 }}>Proof Server</Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Actions card */}
      <Box sx={{ p: 3, borderRadius: '14px', bgcolor: '#09090c', border: '1px solid #18181b', mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon sx={{ fontSize: 16 }} />}
              onClick={handleDeployNew}
              sx={{ px: 2.5, borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}
            >
              Deploy Election
            </Button>
            {CONTRACT_ADDRESS && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<LinkIcon sx={{ fontSize: 16 }} />}
                onClick={() => handleJoinContract(CONTRACT_ADDRESS)}
                sx={{ borderColor: '#27272a', color: '#a1a1aa', px: 2.5, borderRadius: '10px', textTransform: 'none' }}
              >
                Join Default
              </Button>
            )}
          </Stack>
          <Stack direction="row" spacing={1} sx={{ flex: 1, maxWidth: 340 }}>
            <TextField
              size="small"
              placeholder="Contract address..."
              value={joinAddress}
              onChange={(e) => setJoinAddress(e.target.value)}
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  color: '#e4e4e7', bgcolor: '#030304', borderRadius: '10px', fontSize: '0.8rem',
                  fontFamily: 'monospace', height: 36,
                  '& fieldset': { borderColor: '#27272a' },
                  '&:hover fieldset': { borderColor: '#3f3f46' },
                },
              }}
            />
            <Button
              variant="outlined"
              size="small"
              onClick={() => { handleJoinContract(joinAddress); setJoinAddress(''); }}
              disabled={!joinAddress.trim()}
              sx={{ borderColor: '#27272a', color: '#a1a1aa', borderRadius: '10px', textTransform: 'none', minWidth: 'auto', px: 2 }}
            >
              Join
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Elections list */}
      <Box sx={{ borderRadius: '14px', bgcolor: '#09090c', border: '1px solid #18181b', overflow: 'hidden' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #18181b' }}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <HowToVoteIcon sx={{ fontSize: 18, color: '#71717a' }} />
              <Typography sx={{ fontWeight: 600, fontSize: '0.88rem', color: '#f4f4f5' }}>
                Active Elections
              </Typography>
              <Chip
                label={`${deployments.length} active`}
                size="small"
                sx={{ height: 20, fontSize: '0.65rem', bgcolor: 'rgba(167,139,250,0.1)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.2)' }}
              />
            </Stack>
            {deployments.length > 0 && (
              <Button
                size="small"
                startIcon={<AddIcon sx={{ fontSize: 14 }} />}
                onClick={handleDeployNew}
                sx={{ color: '#71717a', fontSize: '0.75rem', textTransform: 'none' }}
              >
                New
              </Button>
            )}
          </Stack>
        </Box>

        <Box sx={{ p: 2 }}>
          <Stack spacing={2}>
            {deployments.map((d$, i) => (
              <VotingCard key={`d-${i}`} votingDeployment$={d$} onQuickJoinPreprod={handleJoinContract} onRetryConnect={handleRetryConnect} />
            ))}
            {deployments.length === 0 && (
              <VotingCard onQuickJoinPreprod={handleJoinContract} onRetryConnect={handleRetryConnect} />
            )}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default AppPage;
