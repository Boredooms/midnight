import React, { useRef, useState } from 'react';
import { Box, Typography, Container, Stack, Chip, Grid } from '@mui/material';
import { motion, useInView } from 'framer-motion';
import { Navbar } from '../components/Navbar';

const Reveal: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
};

type LayerKey = 'client' | 'proof' | 'network';

const LAYERS: Record<LayerKey, { label: string; color: string; items: { name: string; desc: string }[] }> = {
  client: {
    label: 'Browser Client',
    color: '#ffffff',
    items: [
      { name: 'React Frontend', desc: 'MUI-based interface handling election lifecycle, wallet connection, and vote submission.' },
      { name: 'Voting API', desc: 'TypeScript wrapper over the Compact contract providing deploy(), join(), vote(), createElection(), finalizeElection().' },
      { name: 'Private State', desc: 'In-memory provider storing voter secret keys and contract state locally. Never sent to the network.' },
      { name: 'Wallet Bridge', desc: 'DApp Connector API v4 integration. Handles transaction balancing and submission via the connected wallet.' },
    ],
  },
  proof: {
    label: 'Proof Server',
    color: '#a78bfa',
    items: [
      { name: 'ZK Proof Generation', desc: 'Runs locally on Docker (port 6300). Receives circuit inputs and returns valid ZK proofs.' },
      { name: 'Prover Keys', desc: 'Loaded from /keys/ — createElection.prover, vote.prover, finalizeElection.prover.' },
      { name: 'ZKIR Circuits', desc: 'Compiled from Compact to intermediate representation. Defines the proof constraints.' },
    ],
  },
  network: {
    label: 'Midnight Network',
    color: '#34d399',
    items: [
      { name: 'Compact Contract', desc: 'On-chain state: State enum (UNINITIALIZED→OPEN→FINALIZED), counters for tallies, owner pubkey.' },
      { name: 'Indexer (GraphQL)', desc: 'Subscribes to contract state changes. Provides real-time tally updates via WebSocket.' },
      { name: 'Ledger', desc: 'Immutable record of all verified proofs and state transitions. Publicly auditable.' },
    ],
  },
};

const ArchitecturePage: React.FC = () => {
  const [activeLayer, setActiveLayer] = useState<LayerKey>('client');

  return (
    <Box sx={{ bgcolor: '#030304', minHeight: '100vh' }}>
      <Navbar />

      {/* Header */}
      <Box sx={{ pt: { xs: 16, md: 20 }, pb: { xs: 4, md: 6 }, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Reveal>
            <Chip label="SYSTEM DESIGN" size="small" sx={{ mb: 3, bgcolor: '#ffffff04', border: '1px solid #1a1a1f', color: '#52525b', fontWeight: 600, fontSize: '0.6rem', letterSpacing: '0.12em' }} />
          </Reveal>
          <Reveal delay={0.1}>
            <Typography sx={{ fontWeight: 800, fontSize: { xs: '2rem', md: '3rem' }, letterSpacing: '-0.04em', mb: 1.5 }}>
              Architecture
            </Typography>
          </Reveal>
          <Reveal delay={0.15}>
            <Typography sx={{ color: '#52525b', maxWidth: 480, mx: 'auto', lineHeight: 1.7 }}>
              Three-layer system: client-side privacy, local proof generation, on-chain verification.
            </Typography>
          </Reveal>
        </Container>
      </Box>

      {/* Interactive Layer Selector */}
      <Box sx={{ pb: { xs: 6, md: 10 } }}>
        <Container maxWidth="md">
          <Reveal delay={0.2}>
            {/* Layer pills */}
            <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', mb: 5 }}>
              {(Object.keys(LAYERS) as LayerKey[]).map((key) => (
                <Chip
                  key={key}
                  label={LAYERS[key].label}
                  onClick={() => setActiveLayer(key)}
                  sx={{
                    px: 1.5,
                    py: 2.5,
                    borderRadius: '100px',
                    bgcolor: activeLayer === key ? '#ffffff10' : 'transparent',
                    border: '1px solid',
                    borderColor: activeLayer === key ? LAYERS[key].color + '40' : '#18181b',
                    color: activeLayer === key ? LAYERS[key].color : '#52525b',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': { borderColor: LAYERS[key].color + '60', color: LAYERS[key].color },
                  }}
                />
              ))}
            </Stack>

            {/* Layer content */}
            <motion.div
              key={activeLayer}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <Grid container spacing={2}>
                {LAYERS[activeLayer].items.map((item, i) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={item.name}>
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: '12px',
                        border: '1px solid #18181b',
                        bgcolor: '#09090c',
                        height: '100%',
                        borderLeft: `3px solid ${LAYERS[activeLayer].color}20`,
                      }}
                    >
                      <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', mb: 0.75, color: LAYERS[activeLayer].color }}>
                        {item.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#71717a', lineHeight: 1.65, fontSize: '0.8rem' }}>
                        {item.desc}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          </Reveal>
        </Container>
      </Box>

      {/* Contract Schema */}
      <Box sx={{ py: { xs: 8, md: 12 }, borderTop: '1px solid #0f0f12' }}>
        <Container maxWidth="sm">
          <Reveal>
            <Typography sx={{ fontWeight: 700, fontSize: '1.2rem', letterSpacing: '-0.02em', mb: 4, textAlign: 'center' }}>
              Contract State
            </Typography>
          </Reveal>
          <Reveal delay={0.1}>
            <Box
              sx={{
                p: 3,
                borderRadius: '12px',
                border: '1px solid #18181b',
                bgcolor: '#09090c',
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '0.78rem',
                lineHeight: 2,
                color: '#a1a1aa',
                overflowX: 'auto',
              }}
            >
              <Box component="span" sx={{ color: '#52525b' }}>{'// Compact contract ledger'}</Box><br />
              <Box component="span" sx={{ color: '#34d399' }}>export</Box> ledger <Box component="span" sx={{ color: '#ffffff' }}>state</Box>: <Box component="span" sx={{ color: '#a78bfa' }}>Enum</Box>(UNINITIALIZED, OPEN, FINALIZED)<br />
              <Box component="span" sx={{ color: '#34d399' }}>export</Box> ledger <Box component="span" sx={{ color: '#ffffff' }}>electionTitle</Box>: <Box component="span" sx={{ color: '#a78bfa' }}>Maybe{'<string>'}</Box><br />
              <Box component="span" sx={{ color: '#34d399' }}>export</Box> ledger <Box component="span" sx={{ color: '#ffffff' }}>candidate0Tally</Box>: <Box component="span" sx={{ color: '#a78bfa' }}>Counter</Box><br />
              <Box component="span" sx={{ color: '#34d399' }}>export</Box> ledger <Box component="span" sx={{ color: '#ffffff' }}>candidate1Tally</Box>: <Box component="span" sx={{ color: '#a78bfa' }}>Counter</Box><br />
              <Box component="span" sx={{ color: '#34d399' }}>export</Box> ledger <Box component="span" sx={{ color: '#ffffff' }}>totalVotes</Box>: <Box component="span" sx={{ color: '#a78bfa' }}>Counter</Box><br />
              <Box component="span" sx={{ color: '#34d399' }}>export</Box> ledger <Box component="span" sx={{ color: '#ffffff' }}>owner</Box>: <Box component="span" sx={{ color: '#a78bfa' }}>Bytes{'<32>'}</Box><br /><br />
              <Box component="span" sx={{ color: '#52525b' }}>{'// Circuits'}</Box><br />
              <Box component="span" sx={{ color: '#34d399' }}>circuit</Box> <Box component="span" sx={{ color: '#ffffff' }}>createElection</Box>(title: string) → OPEN<br />
              <Box component="span" sx={{ color: '#34d399' }}>circuit</Box> <Box component="span" sx={{ color: '#ffffff' }}>vote</Box>(candidateIndex: Field) → tally++<br />
              <Box component="span" sx={{ color: '#34d399' }}>circuit</Box> <Box component="span" sx={{ color: '#ffffff' }}>finalizeElection</Box>() → FINALIZED
            </Box>
          </Reveal>
        </Container>
      </Box>
    </Box>
  );
};

export default ArchitecturePage;
