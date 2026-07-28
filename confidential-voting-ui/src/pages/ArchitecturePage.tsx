import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Container, Stack, Chip, Grid } from '@mui/material';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Navbar } from '../components/Navbar';

gsap.registerPlugin(ScrollTrigger);

type LayerKey = 'client' | 'proof' | 'network';

const LAYERS: Record<LayerKey, { label: string; color: string; items: { name: string; desc: string }[] }> = {
  client: {
    label: 'Browser Client',
    color: '#ffffff',
    items: [
      { name: 'React Frontend', desc: 'MUI interface handling election lifecycle, wallet connection, and vote submission with live tally updates.' },
      { name: 'Voting API', desc: 'TypeScript wrapper — deploy(), join(), vote(), createElection(), finalizeElection(). Reactive state via RxJS.' },
      { name: 'Private State', desc: 'In-memory provider storing voter secret keys. Never sent to the network. Used to compute nullifiers locally.' },
      { name: 'Wallet Bridge', desc: 'DApp Connector API v4. Transaction balancing and submission via Lace or 1AM wallet extension.' },
    ],
  },
  proof: {
    label: 'Proof Server',
    color: '#a78bfa',
    items: [
      { name: 'ZK Proof Generation', desc: 'Docker container on port 6300. Receives circuit inputs, returns valid zero-knowledge proofs.' },
      { name: 'Prover Keys', desc: 'createElection.prover, vote.prover, finalizeElection.prover, ownerFinalizeElection.prover.' },
      { name: 'Verification', desc: 'Proof server validates constraints before generating. Invalid inputs rejected at /check endpoint.' },
    ],
  },
  network: {
    label: 'Midnight Network',
    color: '#34d399',
    items: [
      { name: 'Compact Contract', desc: 'State: UNINITIALIZED → OPEN → FINALIZED. Counters for tallies. Nullifier set for double-vote prevention.' },
      { name: 'Indexer', desc: 'GraphQL + WebSocket subscription. Real-time contract state changes pushed to all connected clients.' },
      { name: 'Ledger', desc: 'Immutable record. Winner enum (CANDIDATE_A, CANDIDATE_B, TIE) published on-chain after finalization.' },
    ],
  },
};

const ArchitecturePage: React.FC = () => {
  const [activeLayer, setActiveLayer] = useState<LayerKey>('client');
  const headerRef = useRef<HTMLDivElement>(null);
  const diagramRef = useRef<HTMLDivElement>(null);
  const schemaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headerRef.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'expo.out' });

      gsap.fromTo(diagramRef.current, { y: 50, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.9, ease: 'expo.out',
        scrollTrigger: { trigger: diagramRef.current, start: 'top 80%' },
      });

      gsap.fromTo(schemaRef.current, { y: 50, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.9, ease: 'expo.out',
        scrollTrigger: { trigger: schemaRef.current, start: 'top 80%' },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <Box sx={{ bgcolor: '#030304', minHeight: '100vh' }}>
      <Navbar />

      {/* Header */}
      <Box ref={headerRef} sx={{ pt: { xs: 16, md: 22 }, pb: { xs: 4, md: 6 }, textAlign: 'center', opacity: 0 }}>
        <Container maxWidth="md">
          <Chip label="SYSTEM DESIGN" size="small" sx={{ mb: 3, bgcolor: '#ffffff04', border: '1px solid #1a1a1f', color: '#52525b', fontWeight: 600, fontSize: '0.6rem', letterSpacing: '0.12em' }} />
          <Typography sx={{ fontWeight: 800, fontSize: { xs: '2.2rem', md: '3.4rem' }, letterSpacing: '-0.04em', mb: 1.5 }}>
            Architecture
          </Typography>
          <Typography sx={{ color: '#52525b', maxWidth: 500, mx: 'auto', lineHeight: 1.7 }}>
            Three-layer system: client-side privacy, local proof generation, on-chain verification.
          </Typography>
        </Container>
      </Box>

      {/* Interactive Layer Explorer */}
      <Box ref={diagramRef} sx={{ pb: { xs: 8, md: 12 }, opacity: 0 }}>
        <Container maxWidth="md">
          {/* Layer selector pills */}
          <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', mb: 5 }}>
            {(Object.keys(LAYERS) as LayerKey[]).map((key) => (
              <Chip
                key={key}
                label={LAYERS[key].label}
                onClick={() => setActiveLayer(key)}
                sx={{
                  px: 2, py: 2.5, borderRadius: '100px', cursor: 'pointer',
                  bgcolor: activeLayer === key ? `${LAYERS[key].color}12` : 'transparent',
                  border: '1px solid', borderColor: activeLayer === key ? `${LAYERS[key].color}40` : '#18181b',
                  color: activeLayer === key ? LAYERS[key].color : '#52525b',
                  fontWeight: 700, fontSize: '0.82rem',
                  transition: 'all 0.25s ease',
                  '&:hover': { borderColor: `${LAYERS[key].color}60`, color: LAYERS[key].color },
                }}
              />
            ))}
          </Stack>

          {/* Layer content */}
          <Grid container spacing={2} key={activeLayer}>
            {LAYERS[activeLayer].items.map((item) => (
              <Grid size={{ xs: 12, sm: 6 }} key={item.name}>
                <Box
                  sx={{
                    p: 3, borderRadius: '12px', border: '1px solid #18181b', bgcolor: '#09090c',
                    height: '100%', borderLeft: `3px solid ${LAYERS[activeLayer].color}25`,
                    transition: 'border-color 0.2s ease',
                    '&:hover': { borderColor: '#27272a' },
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
        </Container>
      </Box>

      {/* Contract Schema */}
      <Box ref={schemaRef} sx={{ py: { xs: 8, md: 12 }, borderTop: '1px solid #0f0f12', opacity: 0 }}>
        <Container maxWidth="sm">
          <Typography sx={{ fontWeight: 700, fontSize: '1.3rem', letterSpacing: '-0.02em', mb: 4, textAlign: 'center' }}>
            Contract Schema
          </Typography>
          <Box sx={{ p: 3.5, borderRadius: '14px', border: '1px solid #18181b', bgcolor: '#09090c', fontFamily: '"JetBrains Mono", "Fira Code", monospace', fontSize: '0.76rem', lineHeight: 2.2, color: '#a1a1aa', overflowX: 'auto' }}>
            <Box component="span" sx={{ color: '#52525b' }}>{'// Compact contract — confidential-voting.compact'}</Box><br />
            <Box component="span" sx={{ color: '#34d399' }}>enum</Box> State {'{'} UNINITIALIZED, OPEN, FINALIZED {'}'}<br />
            <Box component="span" sx={{ color: '#34d399' }}>enum</Box> Winner {'{'} NONE, CANDIDATE_A, CANDIDATE_B, TIE {'}'}<br /><br />
            <Box component="span" sx={{ color: '#34d399' }}>ledger</Box> state: <Box component="span" sx={{ color: '#a78bfa' }}>State</Box><br />
            <Box component="span" sx={{ color: '#34d399' }}>ledger</Box> electionTitle: <Box component="span" sx={{ color: '#a78bfa' }}>Maybe{'<string>'}</Box><br />
            <Box component="span" sx={{ color: '#34d399' }}>ledger</Box> candidate0Tally: <Box component="span" sx={{ color: '#a78bfa' }}>Counter</Box><br />
            <Box component="span" sx={{ color: '#34d399' }}>ledger</Box> candidate1Tally: <Box component="span" sx={{ color: '#a78bfa' }}>Counter</Box><br />
            <Box component="span" sx={{ color: '#34d399' }}>ledger</Box> totalVotes: <Box component="span" sx={{ color: '#a78bfa' }}>Counter</Box><br />
            <Box component="span" sx={{ color: '#34d399' }}>ledger</Box> deadline: <Box component="span" sx={{ color: '#a78bfa' }}>Uint{'<64>'}</Box><br />
            <Box component="span" sx={{ color: '#34d399' }}>ledger</Box> winner: <Box component="span" sx={{ color: '#a78bfa' }}>Winner</Box><br />
            <Box component="span" sx={{ color: '#34d399' }}>ledger</Box> nullifierSet: <Box component="span" sx={{ color: '#a78bfa' }}>Set{'<Bytes<32>>'}</Box><br /><br />
            <Box component="span" sx={{ color: '#52525b' }}>{'// Circuits'}</Box><br />
            <Box component="span" sx={{ color: '#34d399' }}>circuit</Box> <Box component="span" sx={{ color: '#fff' }}>createElection</Box>(title, duration) → OPEN<br />
            <Box component="span" sx={{ color: '#34d399' }}>circuit</Box> <Box component="span" sx={{ color: '#fff' }}>vote</Box>(candidateIndex) → tally++ | nullifier check<br />
            <Box component="span" sx={{ color: '#34d399' }}>circuit</Box> <Box component="span" sx={{ color: '#fff' }}>finalizeElection</Box>() → after deadline, anyone<br />
            <Box component="span" sx={{ color: '#34d399' }}>circuit</Box> <Box component="span" sx={{ color: '#fff' }}>ownerFinalizeElection</Box>() → owner emergency
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default ArchitecturePage;
