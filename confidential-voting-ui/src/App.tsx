import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, Stack, Chip, Divider } from '@mui/material';
import { MainLayout, VotingCard } from './components';
import { useDeployedVotingContext } from './hooks';
import { type VotingDeployment } from './contexts';
import { type Observable } from 'rxjs';
import SecurityIcon from '@mui/icons-material/Security';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

const App: React.FC = () => {
  const votingManager = useDeployedVotingContext();
  const [deployments, setDeployments] = useState<Array<Observable<VotingDeployment>>>([]);

  useEffect(() => {
    const sub = votingManager.deployments$.subscribe(setDeployments);
    return () => sub.unsubscribe();
  }, [votingManager]);

  const handleDeployNew = () => {
    votingManager.resolve();
  };

  const handleJoinContract = (contractAddress: string) => {
    votingManager.resolve(contractAddress);
  };

  return (
    <MainLayout onDeployContract={handleDeployNew} onJoinContract={handleJoinContract}>
      {/* Hero Overview */}
      <Box sx={{ mb: 5, textAlign: 'center', py: 4, px: 2, background: 'radial-gradient(circle, rgba(0,242,254,0.08) 0%, rgba(0,0,0,0) 70%)', borderRadius: 4 }}>
        <Chip label="MIDNIGHT BLOCKCHAIN • RISE IN LEVEL 1" color="primary" sx={{ mb: 2, fontWeight: 700 }} />
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, letterSpacing: -0.5 }}>
          Privacy-Preserving Confidential Voting
        </Typography>
        <Typography variant="h6" sx={{ color: '#90a0b7', maxWidth: 800, mx: 'auto', fontWeight: 400, mb: 4 }}>
          Cast votes with absolute privacy guaranteed by Zero-Knowledge proofs. Publicly verify election results while keeping individual votes strictly confidential.
        </Typography>

        <Grid container spacing={3} sx={{ textAlign: 'left', mt: 2 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ bgcolor: '#12121a', border: '1px solid #222233', height: '100%' }}>
              <CardContent>
                <VisibilityOffIcon sx={{ color: '#00f2fe', fontSize: 36, mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Confidential Ballots</Typography>
                <Typography variant="body2" color="text.secondary">
                  Voter identity and individual choices remain completely private off-chain via Compact ZK circuits.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ bgcolor: '#12121a', border: '1px solid #222233', height: '100%' }}>
              <CardContent>
                <VerifiedUserIcon sx={{ color: '#4facfe', fontSize: 36, mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Verifiable Tallies</Typography>
                <Typography variant="body2" color="text.secondary">
                  The election result is provably correct on the Midnight public ledger without disclosing who voted for whom.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ bgcolor: '#12121a', border: '1px solid #222233', height: '100%' }}>
              <CardContent>
                <SecurityIcon sx={{ color: '#ff4081', fontSize: 36, mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Double-Vote Nullifiers</Typography>
                <Typography variant="body2" color="text.secondary">
                  Unique private witness nullifiers guarantee each eligible voter can only cast one ballot per election.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 4, borderColor: '#1f1f2e' }} />

      {/* Active Deployments List */}
      <Stack spacing={4}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Active Confidential Elections ({deployments.length})
        </Typography>

        {deployments.map((deployment$, idx) => (
          <Box key={`deployment-${idx}`} data-testid={`voting-card-${idx}`}>
            <VotingCard votingDeployment$={deployment$} />
          </Box>
        ))}

        {deployments.length === 0 && (
          <Box data-testid="default-voting-card">
            <VotingCard />
          </Box>
        )}
      </Stack>
    </MainLayout>
  );
};

export default App;
