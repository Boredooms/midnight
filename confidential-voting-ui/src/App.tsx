import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, Stack, Chip, Divider, Button, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CodeIcon from '@mui/icons-material/Code';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import ShieldIcon from '@mui/icons-material/Shield';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { MainLayout, VotingCard } from './components';
import { useDeployedVotingContext } from './hooks';
import { type VotingDeployment } from './contexts';
import { type Observable } from 'rxjs';

const App: React.FC = () => {
  const votingManager = useDeployedVotingContext();
  const [deployments, setDeployments] = useState<Array<Observable<VotingDeployment>>>([]);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  useEffect(() => {
    const sub = votingManager.deployments$.subscribe(setDeployments);
    return () => sub.unsubscribe();
  }, [votingManager]);

  const handleDeployNew = () => {
    votingManager.resolve();
  };

  const handleJoinContract = (contractAddress: string) => {
    votingManager.resolve(contractAddress as any);
  };

  return (
    <MainLayout onDeployContract={handleDeployNew} onJoinContract={handleJoinContract}>
      {/* High-Craft Hero Section */}
      <Box sx={{ mb: 6, pt: 4, pb: 6, px: { xs: 2, md: 4 }, background: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.05) 0%, rgba(3,3,4,0) 70%)', borderRadius: '24px', border: '1px solid #18181b', textAlign: 'center' }}>
        <Chip
          icon={<ShieldIcon sx={{ fontSize: '14px !important', color: '#ffffff !important' }} />}
          label="MIDNIGHT BLOCKCHAIN • RISE IN LEVEL 1 CHALLENGE"
          sx={{ mb: 3, bgcolor: '#18181b', border: '1px solid #27272a', color: '#ffffff', fontWeight: 700, fontSize: '0.75rem', px: 1.5, py: 2 }}
        />

        <Typography variant="h2" sx={{ fontWeight: 900, mb: 2, letterSpacing: '-0.04em', color: '#ffffff', fontSize: { xs: '2.2rem', md: '3.6rem' } }}>
          Confidential Voting Engine
        </Typography>

        <Typography variant="h6" sx={{ color: '#a1a1aa', maxWidth: 760, mx: 'auto', fontWeight: 400, mb: 4, lineHeight: 1.6, fontSize: { xs: '1rem', md: '1.15rem' } }}>
          Zero-Knowledge election execution on Midnight Network. Individual voter ballots are proven off-chain via Compact circuits, while tally state is verifiable on-chain.
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'center', mb: 4 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<RocketLaunchIcon />}
            sx={{ bgcolor: '#ffffff', color: '#000000', fontWeight: 800, px: 4, py: 1.5, borderRadius: '12px', fontSize: '1rem', '&:hover': { bgcolor: '#e4e4e7' } }}
            onClick={handleDeployNew}
          >
            Deploy New ZK Election
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<CodeIcon />}
            sx={{ borderColor: '#27272a', color: '#ffffff', fontWeight: 700, px: 3.5, py: 1.5, borderRadius: '12px', '&:hover': { borderColor: '#ffffff', bgcolor: '#ffffff0a' } }}
            onClick={() => {
              const el = document.getElementById('contract-guide');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Contract & CLI Guide
          </Button>
        </Stack>

        {/* 3 Core Architecture Pillars */}
        <Grid container spacing={3} sx={{ textAlign: 'left', mt: 1 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ bgcolor: '#09090c', border: '1px solid #18181b', height: '100%', borderRadius: '16px' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ p: 1.5, bgcolor: '#ffffff0a', width: 'fit-content', borderRadius: '10px', mb: 2 }}>
                  <LockIcon sx={{ color: '#ffffff', fontSize: 24 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em' }}>
                  Compact ZK Circuits
                </Typography>
                <Typography variant="body2" sx={{ color: '#a1a1aa', lineHeight: 1.6 }}>
                  Voter secret keys and candidate selections never leave local client memory. ZK proofs demonstrate eligibility and valid choice off-chain.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ bgcolor: '#09090c', border: '1px solid #18181b', height: '100%', borderRadius: '16px' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ p: 1.5, bgcolor: '#ffffff0a', width: 'fit-content', borderRadius: '10px', mb: 2 }}>
                  <CheckCircleIcon sx={{ color: '#ffffff', fontSize: 24 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em' }}>
                  Public Verifiable Tally
                </Typography>
                <Typography variant="body2" sx={{ color: '#a1a1aa', lineHeight: 1.6 }}>
                  Candidate counters increment on-chain upon valid ZK proof submission. Anyone can verify total tally integrity transparently.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ bgcolor: '#09090c', border: '1px solid #18181b', height: '100%', borderRadius: '16px' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ p: 1.5, bgcolor: '#ffffff0a', width: 'fit-content', borderRadius: '10px', mb: 2 }}>
                  <ShieldIcon sx={{ color: '#ffffff', fontSize: 24 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em' }}>
                  Nullifier Double-Vote Shield
                </Typography>
                <Typography variant="body2" sx={{ color: '#a1a1aa', lineHeight: 1.6 }}>
                  Hashed voter commitments prevent double-voting without linking voter identities to past or future ballots on the network.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Active Elections Section */}
      <Stack spacing={4} sx={{ mb: 6 }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
            Active Elections ({deployments.length})
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={handleDeployNew}
            sx={{ borderColor: '#27272a', color: '#ffffff', borderRadius: '8px' }}
          >
            + Deploy Instance
          </Button>
        </Stack>

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

      <Divider sx={{ my: 6, borderColor: '#18181b' }} />

      {/* Contract Build & Deployment Documentation Accordion */}
      <Box id="contract-guide" sx={{ mb: 6 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, letterSpacing: '-0.02em' }}>
          Smart Contract Creation & Preprod Deployment Guide
        </Typography>

        <Accordion sx={{ bgcolor: '#09090c', border: '1px solid #18181b', color: '#fff', borderRadius: '14px !important', mb: 2, '&:before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>1. How Compact Contracts Are Compiled</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ color: '#a1a1aa', borderTop: '1px solid #18181b', p: 3 }}>
            <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.7 }}>
              The smart contract is written in Midnight's Compact language (<code>contract/src/confidential-voting.compact</code>).
              It defines the <code>State</code> enum, ledger counters, and zero-knowledge circuit methods:
            </Typography>
            <Box component="pre" sx={{ bgcolor: '#030304', p: 2, borderRadius: '8px', overflowX: 'auto', border: '1px solid #18181b', fontFamily: 'monospace', fontSize: '0.85rem' }}>
{`cd contract
yarn compact # Compiles Compact contract into ZK keys & TypeScript bindings
yarn build   # Builds @midnight-ntwrk/confidential-voting-contract`}
            </Box>
          </AccordionDetails>
        </Accordion>

        <Accordion sx={{ bgcolor: '#09090c', border: '1px solid #18181b', color: '#fff', borderRadius: '14px !important', mb: 2, '&:before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>2. How to Deploy to Midnight Preprod</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ color: '#a1a1aa', borderTop: '1px solid #18181b', p: 3 }}>
            <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.7 }}>
              Deployments can be executed directly via the Web UI (using <strong>1AM Wallet</strong>) or via the interactive CLI runner:
            </Typography>
            <Box component="pre" sx={{ bgcolor: '#030304', p: 2, borderRadius: '8px', overflowX: 'auto', border: '1px solid #18181b', fontFamily: 'monospace', fontSize: '0.85rem' }}>
{`cd confidential-voting-cli
yarn build
npm run preprod-remote # Connects to Midnight Preprod Testnet & launches CLI menu`}
            </Box>
          </AccordionDetails>
        </Accordion>

        <Accordion sx={{ bgcolor: '#09090c', border: '1px solid #18181b', color: '#fff', borderRadius: '14px !important', mb: 2, '&:before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>3. Contract Address Specification & Verification</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ color: '#a1a1aa', borderTop: '1px solid #18181b', p: 3 }}>
            <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
              Midnight contract addresses are 32 bytes long (64 hex characters). Example Preprod address:
              <br />
              <code style={{ color: '#ffffff' }}>0200dbf964f541e1950883f5b2f539b66fd6111e46ce8e6e9551fbdd180114d5</code>
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Box>
    </MainLayout>
  );
};

export default App;
