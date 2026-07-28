import React, { useEffect, useRef } from 'react';
import { Box, Typography, Container, Grid, Stack, Chip } from '@mui/material';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import LockIcon from '@mui/icons-material/Lock';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SecurityIcon from '@mui/icons-material/Security';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import SpeedIcon from '@mui/icons-material/Speed';
import GppGoodIcon from '@mui/icons-material/GppGood';
import DataObjectIcon from '@mui/icons-material/DataObject';
import { Navbar } from '../components/Navbar';

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  { icon: <VisibilityOffIcon />, title: 'Private Ballots', desc: 'Voter selections stay on the client. ZK proofs demonstrate eligibility without revealing the actual choice.' },
  { icon: <VerifiedUserIcon />, title: 'On-Chain Tally', desc: 'Counters increment on the public ledger upon valid proof. Anyone can verify totals transparently.' },
  { icon: <LockIcon />, title: 'Nullifier Protection', desc: 'Hashed nullifier commitments prevent repeated voting without linking identity to past or future ballots.' },
  { icon: <SecurityIcon />, title: 'Compact Circuits', desc: 'Written in Midnight\'s Compact DSL. Compiles to efficient prover/verifier key pairs with formal guarantees.' },
  { icon: <AccountTreeIcon />, title: 'Decentralized Finalization', desc: 'Time-based deadline allows anyone to finalize. No single entity controls when results are published.' },
  { icon: <SpeedIcon />, title: 'Local Proof Generation', desc: 'ZK proofs generated via local proof server. Private data never touches the network — only the proof does.' },
  { icon: <GppGoodIcon />, title: 'Multi-Wallet Support', desc: 'DApp Connector API v4 with wallet selection dialog. Works with Lace, 1AM, and future wallets.' },
  { icon: <DataObjectIcon />, title: 'Reactive State', desc: 'Real-time tally updates via indexer WebSocket. All participants see votes arrive live.' },
];

const STEPS = [
  { num: '01', title: 'Deploy Contract', desc: 'Organizer deploys a Compact smart contract. Creates an on-chain election with empty tallies and a deadline.' },
  { num: '02', title: 'Open Voting', desc: 'Call createElection(title, duration). Contract transitions to OPEN. A countdown begins.' },
  { num: '03', title: 'Cast ZK Votes', desc: 'Voters generate zero-knowledge proofs locally. Each proof validates a choice without revealing it. Nullifiers prevent double-voting.' },
  { num: '04', title: 'Publish Results', desc: 'After deadline, anyone triggers finalization. Winner is computed and published on-chain. Fully verifiable, privately cast.' },
];

const FeaturesPage: React.FC = () => {
  const cardsRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo(headerRef.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'expo.out' });

      // Feature cards stagger
      gsap.fromTo(
        '.feature-card',
        { y: 60, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, ease: 'expo.out', stagger: 0.1,
          scrollTrigger: { trigger: cardsRef.current, start: 'top 80%' },
        }
      );

      // Steps stagger
      gsap.fromTo(
        '.step-item',
        { x: -40, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 0.7, ease: 'expo.out', stagger: 0.15,
          scrollTrigger: { trigger: stepsRef.current, start: 'top 75%' },
        }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <Box sx={{ bgcolor: '#030304', minHeight: '100vh' }}>
      <Navbar />

      {/* Header */}
      <Box ref={headerRef} sx={{ pt: { xs: 16, md: 22 }, pb: { xs: 4, md: 6 }, textAlign: 'center', opacity: 0 }}>
        <Container maxWidth="md">
          <Chip label="CAPABILITIES" size="small" sx={{ mb: 3, bgcolor: '#ffffff04', border: '1px solid #1a1a1f', color: '#52525b', fontWeight: 600, fontSize: '0.6rem', letterSpacing: '0.12em' }} />
          <Typography sx={{ fontWeight: 800, fontSize: { xs: '2.2rem', md: '3.4rem' }, letterSpacing: '-0.04em', mb: 1.5 }}>
            Built for Privacy
          </Typography>
          <Typography sx={{ color: '#52525b', maxWidth: 460, mx: 'auto', fontSize: '1.05rem', lineHeight: 1.7 }}>
            Every layer protects voter privacy while maintaining full election integrity.
          </Typography>
        </Container>
      </Box>

      {/* Feature Grid */}
      <Box ref={cardsRef} sx={{ pb: { xs: 10, md: 14 }, pt: 4 }}>
        <Container maxWidth="lg">
          <Grid container spacing={2.5}>
            {FEATURES.map((f) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={f.title}>
                <Box
                  className="feature-card"
                  sx={{
                    p: 3,
                    borderRadius: '14px',
                    border: '1px solid #18181b',
                    bgcolor: '#09090c',
                    height: '100%',
                    opacity: 0,
                    transition: 'border-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': { borderColor: '#3f3f46', transform: 'translateY(-4px)', boxShadow: '0 12px 40px rgba(0,0,0,0.5)' },
                  }}
                >
                  <Box sx={{ color: '#3f3f46', mb: 2, '& svg': { fontSize: 24 } }}>{f.icon}</Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', mb: 0.75 }}>{f.title}</Typography>
                  <Typography variant="body2" sx={{ color: '#52525b', lineHeight: 1.65, fontSize: '0.8rem' }}>{f.desc}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How It Works */}
      <Box sx={{ py: { xs: 10, md: 14 }, borderTop: '1px solid #0f0f12' }}>
        <Container maxWidth="sm">
          <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.8rem', md: '2.6rem' }, letterSpacing: '-0.03em', textAlign: 'center', mb: 2 }}>
            How It Works
          </Typography>
          <Typography sx={{ color: '#52525b', textAlign: 'center', mb: 8 }}>
            Four steps from deployment to verified result.
          </Typography>

          <Stack ref={stepsRef} spacing={0}>
            {STEPS.map((s, i) => (
              <Stack
                key={s.num}
                className="step-item"
                direction="row"
                spacing={2.5}
                sx={{ py: 3.5, borderBottom: i < STEPS.length - 1 ? '1px solid #18181b' : 'none', opacity: 0 }}
              >
                <Box sx={{ minWidth: 40, height: 40, borderRadius: '12px', bgcolor: '#ffffff04', border: '1px solid #18181b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#52525b', fontWeight: 700 }}>{s.num}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 700, mb: 0.5 }}>{s.title}</Typography>
                  <Typography variant="body2" sx={{ color: '#71717a', lineHeight: 1.7 }}>{s.desc}</Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default FeaturesPage;
