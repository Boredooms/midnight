import React, { useRef } from 'react';
import { Box, Typography, Container, Grid, Stack, Chip } from '@mui/material';
import { motion, useInView } from 'framer-motion';
import LockIcon from '@mui/icons-material/Lock';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SecurityIcon from '@mui/icons-material/Security';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import SpeedIcon from '@mui/icons-material/Speed';
import GppGoodIcon from '@mui/icons-material/GppGood';
import DataObjectIcon from '@mui/icons-material/DataObject';
import { Navbar } from '../components/Navbar';

const Reveal: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

const FEATURES = [
  { icon: <VisibilityOffIcon />, title: 'Private Ballots', desc: 'Voter selections stay on the client device. ZK proofs demonstrate eligibility without revealing the actual choice.' },
  { icon: <VerifiedUserIcon />, title: 'On-Chain Tally', desc: 'Counters increment on the public ledger upon valid proof. Anyone can verify totals — no trusted third party.' },
  { icon: <LockIcon />, title: 'Double-Vote Shield', desc: 'Hashed nullifier commitments prevent repeated voting without linking identity to past or future ballots.' },
  { icon: <SecurityIcon />, title: 'Compact Circuits', desc: 'Written in Midnight\'s Compact language — a ZK DSL that compiles to efficient prover/verifier key pairs.' },
  { icon: <AccountTreeIcon />, title: 'Decentralized State', desc: 'No central server. Election state lives on Midnight\'s ledger. Full transparency for tallies, full privacy for voters.' },
  { icon: <SpeedIcon />, title: 'Client-Side Proving', desc: 'ZK proofs generated locally via the proof server. Private data never touches the network — only the proof does.' },
  { icon: <GppGoodIcon />, title: 'Wallet Integration', desc: 'DApp Connector API v4 with proper UUID-based wallet detection. Works with 1AM, Lace, and future wallets.' },
  { icon: <DataObjectIcon />, title: 'TypeScript SDK', desc: 'Full Midnight.js integration with reactive state via RxJS. Deploy, join, vote, and finalize — all type-safe.' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Deploy Contract', desc: 'The organizer deploys a Compact smart contract to Midnight Preprod. Creates an on-chain election with empty tallies.' },
  { step: '02', title: 'Initialize Election', desc: 'Call createElection(title) to transition the contract from UNINITIALIZED to OPEN. Voters can now participate.' },
  { step: '03', title: 'Cast ZK Votes', desc: 'Each voter generates a zero-knowledge proof locally, proving a valid choice without revealing it. The proof goes on-chain.' },
  { step: '04', title: 'Finalize & Verify', desc: 'The election creator calls finalizeElection(). Tallies are frozen on-chain — publicly auditable, privately cast.' },
];

const FeaturesPage: React.FC = () => {
  return (
    <Box sx={{ bgcolor: '#030304', minHeight: '100vh' }}>
      <Navbar />

      {/* Header */}
      <Box sx={{ pt: { xs: 16, md: 20 }, pb: { xs: 6, md: 8 }, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Reveal>
            <Chip label="CAPABILITIES" size="small" sx={{ mb: 3, bgcolor: '#ffffff04', border: '1px solid #1a1a1f', color: '#52525b', fontWeight: 600, fontSize: '0.6rem', letterSpacing: '0.12em' }} />
          </Reveal>
          <Reveal delay={0.1}>
            <Typography sx={{ fontWeight: 800, fontSize: { xs: '2rem', md: '3rem' }, letterSpacing: '-0.04em', mb: 1.5 }}>
              Built for Privacy
            </Typography>
          </Reveal>
          <Reveal delay={0.15}>
            <Typography sx={{ color: '#52525b', maxWidth: 440, mx: 'auto', fontSize: '1rem', lineHeight: 1.7 }}>
              Every layer designed to protect voter privacy while maintaining full election integrity.
            </Typography>
          </Reveal>
        </Container>
      </Box>

      {/* Feature Grid */}
      <Box sx={{ pb: { xs: 10, md: 14 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={2.5}>
            {FEATURES.map((f, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={f.title}>
                <Reveal delay={i * 0.06}>
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: '14px',
                      border: '1px solid #18181b',
                      bgcolor: '#09090c',
                      height: '100%',
                      transition: 'border-color 0.25s ease, transform 0.25s ease',
                      '&:hover': { borderColor: '#3f3f46', transform: 'translateY(-3px)' },
                    }}
                  >
                    <Box sx={{ color: '#3f3f46', mb: 2, '& svg': { fontSize: 24 } }}>{f.icon}</Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', mb: 0.75, letterSpacing: '-0.01em' }}>
                      {f.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#52525b', lineHeight: 1.65, fontSize: '0.82rem' }}>
                      {f.desc}
                    </Typography>
                  </Box>
                </Reveal>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How It Works */}
      <Box sx={{ py: { xs: 10, md: 14 }, borderTop: '1px solid #0f0f12' }}>
        <Container maxWidth="sm">
          <Reveal>
            <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.8rem', md: '2.4rem' }, letterSpacing: '-0.03em', textAlign: 'center', mb: 1.5 }}>
              How It Works
            </Typography>
          </Reveal>
          <Reveal delay={0.1}>
            <Typography sx={{ color: '#52525b', textAlign: 'center', mb: 6 }}>
              Four steps from deployment to verified result.
            </Typography>
          </Reveal>

          <Stack spacing={0}>
            {HOW_IT_WORKS.map((s, i) => (
              <Reveal key={s.step} delay={i * 0.08}>
                <Stack
                  direction="row"
                  spacing={2.5}
                  sx={{
                    py: 3.5,
                    borderBottom: i < HOW_IT_WORKS.length - 1 ? '1px solid #18181b' : 'none',
                    alignItems: 'flex-start',
                  }}
                >
                  <Box
                    sx={{
                      minWidth: 36,
                      height: 36,
                      borderRadius: '10px',
                      bgcolor: '#ffffff06',
                      border: '1px solid #18181b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#52525b', fontWeight: 700 }}>
                      {s.step}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 700, mb: 0.5, letterSpacing: '-0.01em' }}>{s.title}</Typography>
                    <Typography variant="body2" sx={{ color: '#71717a', lineHeight: 1.7 }}>{s.desc}</Typography>
                  </Box>
                </Stack>
              </Reveal>
            ))}
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default FeaturesPage;
