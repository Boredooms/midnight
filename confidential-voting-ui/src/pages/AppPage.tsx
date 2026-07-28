import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, Stack, Button, Chip, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CircleIcon from '@mui/icons-material/Circle';
import { VotingCard } from '../components/VotingCard';
import { Header } from '../components/Header';
import { useDeployedVotingContext } from '../hooks';
import { type VotingDeployment } from '../contexts';
import { useWallet } from '../contexts/WalletContext';
import { type Observable } from 'rxjs';
import { CONTRACT_ADDRESS } from '../globals';

/**
 * The real, working dApp page — connects to actual Midnight Preprod contracts.
 */
const AppPage: React.FC = () => {
  const votingManager = useDeployedVotingContext();
  const wallet = useWallet();
  const [deployments, setDeployments] = useState<Array<Observable<VotingDeployment>>>([]);

  useEffect(() => {
    const sub = votingManager.deployments$.subscribe(setDeployments);
    return () => sub.unsubscribe();
  }, [votingManager]);

  const handleDeployNew = () => votingManager.resolve();
  const handleJoinContract = (addr: string) => votingManager.resolve(addr as any);
  const handleRetryConnect = () => {
    if (wallet.status !== 'connected') void wallet.connect();
    else votingManager.retry(CONTRACT_ADDRESS as any);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#030304' }}>
      <Header onJoinContract={handleJoinContract} onDeployContract={handleDeployNew} />

      <Container maxWidth="sm" sx={{ pt: 4, pb: 10 }}>
        <Stack spacing={3}>
          {/* Title + status */}
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
              Live App
            </Typography>
            <Stack direction="row" spacing={1}>
              <Tooltip title="Proof Server (localhost:6300)" arrow>
                <Chip icon={<CircleIcon sx={{ fontSize: '8px !important', color: '#22c55e !important' }} />} label="Proof" size="small" sx={{ bgcolor: '#09090c', border: '1px solid #18181b', color: '#52525b', fontSize: '0.68rem', height: 22 }} />
              </Tooltip>
              <Tooltip title="Network: preprod" arrow>
                <Chip icon={<CircleIcon sx={{ fontSize: '8px !important', color: '#22c55e !important' }} />} label="Preprod" size="small" sx={{ bgcolor: '#09090c', border: '1px solid #18181b', color: '#52525b', fontSize: '0.68rem', height: 22 }} />
              </Tooltip>
            </Stack>
          </Stack>

          {/* Quick actions */}
          <Stack direction="row" spacing={1.5}>
            <Button variant="contained" size="small" startIcon={<AddIcon sx={{ fontSize: 16 }} />} onClick={handleDeployNew} sx={{ px: 2.5 }}>
              Deploy Election
            </Button>
            <Button variant="outlined" size="small" onClick={() => handleJoinContract(CONTRACT_ADDRESS)} sx={{ borderColor: '#27272a', color: '#a1a1aa', px: 2.5 }}>
              Join Demo Contract
            </Button>
          </Stack>

          {/* Elections */}
          <Box>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#71717a' }}>
                Elections ({deployments.length})
              </Typography>
              {deployments.length > 0 && (
                <Button variant="outlined" size="small" startIcon={<AddIcon sx={{ fontSize: 14 }} />} onClick={handleDeployNew} sx={{ borderColor: '#18181b', color: '#52525b', fontSize: '0.7rem', height: 24 }}>
                  New
                </Button>
              )}
            </Stack>

            <Stack spacing={2.5}>
              {deployments.map((d$, i) => (
                <VotingCard key={`d-${i}`} votingDeployment$={d$} onQuickJoinPreprod={handleJoinContract} onRetryConnect={handleRetryConnect} />
              ))}
              {deployments.length === 0 && (
                <VotingCard onQuickJoinPreprod={handleJoinContract} onRetryConnect={handleRetryConnect} />
              )}
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default AppPage;
