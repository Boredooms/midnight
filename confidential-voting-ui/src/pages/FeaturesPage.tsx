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
import { ShaderBackground, SHADER_PALETTES } from '../components/ShaderBackground';
import PillNav from '../components/PillNav';

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
    <Box sx={{ bgcolor: '#030304', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <ShaderBackground colors={SHADER_PALETTES.midnight} speed={0.25} intensity={0.4} style={{ position: 'fixed' }} />
      <Box sx={{ position: 'relative', zIndex: 1 }}>
      <PillNav baseColor="#ffffff" pillColor="#1a1025" pillTextColor="#e4e4e7" hoverTextColor="#ffffff" />

      {/* Header */}
      <Box ref={headerRef} sx={{ pt: { xs: 16, md: 22 }, pb: { xs: 4, md: 6 }, textAlign: 'center', opacity: 0 }}>
        <Container maxWidth="md">
          <Chip label="CAPABILITIES" size="small" sx={{ mb: 3, bgcolor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#d4d4d8', fontWeight: 600, fontSize: '0.6rem', letterSpacing: '0.12em' }} />
          <Typography sx={{ fontWeight: 800, fontSize: { xs: '2.2rem', md: '3.4rem' }, letterSpacing: '-0.04em', mb: 1.5, color: '#ffffff' }}>
            Built for Privacy
          </Typography>
          <Typography sx={{ color: '#e4e4e7', maxWidth: 460, mx: 'auto', fontSize: '1.05rem', lineHeight: 1.7 }}>
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
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    bgcolor: 'rgba(9, 9, 12, 0.75)',
                    backdropFilter: 'blur(12px)',
                    height: '100%',
                    opacity: 0,
                    transition: 'border-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      borderColor: 'rgba(255,255,255,0.18)',
                      transform: 'translateY(-6px)',
                      boxShadow: '0 16px 48px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
                    },
                  }}
                >
                  <Box sx={{ color: '#a78bfa', mb: 2, '& svg': { fontSize: 26 } }}>{f.icon}</Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', mb: 0.75, color: '#f4f4f5' }}>{f.title}</Typography>
                  <Typography variant="body2" sx={{ color: '#a1a1aa', lineHeight: 1.7, fontSize: '0.82rem' }}>{f.desc}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How It Works */}
      <Box sx={{ py: { xs: 10, md: 14 }, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <Container maxWidth="sm">
          <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.8rem', md: '2.6rem' }, letterSpacing: '-0.03em', textAlign: 'center', mb: 2, color: '#f4f4f5' }}>
            How It Works
          </Typography>
          <Typography sx={{ color: '#a1a1aa', textAlign: 'center', mb: 8 }}>
            Four steps from deployment to verified result.
          </Typography>

          <Stack ref={stepsRef} spacing={0} sx={{ bgcolor: 'rgba(9,9,12,0.7)', backdropFilter: 'blur(12px)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)', p: { xs: 2, md: 3 } }}>
            {STEPS.map((s, i) => (
              <Stack
                key={s.num}
                className="step-item"
                direction="row"
                spacing={2.5}
                sx={{ py: 3, px: 2, borderBottom: i < STEPS.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none', opacity: 0 }}
              >
                <Box sx={{ minWidth: 44, height: 44, borderRadius: '14px', bgcolor: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography sx={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#a78bfa', fontWeight: 700 }}>{s.num}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 700, mb: 0.5, color: '#f4f4f5' }}>{s.title}</Typography>
                  <Typography variant="body2" sx={{ color: '#a1a1aa', lineHeight: 1.7 }}>{s.desc}</Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        </Container>
      </Box>
      </Box>
    </Box>
  );
};

export default FeaturesPage;
