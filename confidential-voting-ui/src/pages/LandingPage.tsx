import React, { useRef } from 'react';
import { Box, Typography, Container, Stack, Button, Chip } from '@mui/material';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { ParticleField } from '../components/ParticleField';
import { Navbar } from '../components/Navbar';

const Reveal: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ bgcolor: '#030304', minHeight: '100vh' }}>
      <Navbar />

      {/* ═══ HERO ═══ */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          pt: { xs: 20, md: 28 },
          pb: { xs: 16, md: 24 },
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <ParticleField />
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Stack spacing={3.5} sx={{ alignItems: 'center', textAlign: 'center' }}>
            <Reveal>
              <Chip
                label="MIDNIGHT NETWORK • ZERO KNOWLEDGE"
                size="small"
                sx={{
                  bgcolor: '#ffffff04',
                  border: '1px solid #1a1a1f',
                  color: '#52525b',
                  fontWeight: 600,
                  fontSize: '0.6rem',
                  letterSpacing: '0.12em',
                }}
              />
            </Reveal>

            <Reveal delay={0.12}>
              <Typography
                sx={{
                  fontWeight: 900,
                  letterSpacing: '-0.05em',
                  fontSize: { xs: '3rem', sm: '4.2rem', md: '5.5rem' },
                  lineHeight: 1.0,
                  color: '#ffffff',
                }}
              >
                Confidential
              </Typography>
            </Reveal>

            <Reveal delay={0.2}>
              <Typography
                sx={{
                  fontWeight: 900,
                  letterSpacing: '-0.05em',
                  fontSize: { xs: '3rem', sm: '4.2rem', md: '5.5rem' },
                  lineHeight: 1.0,
                  color: '#27272a',
                  mt: '-12px !important',
                }}
              >
                Voting Engine
              </Typography>
            </Reveal>

            <Reveal delay={0.3}>
              <Typography
                sx={{
                  color: '#52525b',
                  maxWidth: 460,
                  fontSize: { xs: '0.95rem', md: '1.1rem' },
                  lineHeight: 1.75,
                }}
              >
                Private ballots proven off-chain. Verifiable tallies on-chain.
                No one sees your vote — everyone can verify the count.
              </Typography>
            </Reveal>

            <Reveal delay={0.4}>
              <Stack direction="row" spacing={2} sx={{ pt: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/app')}
                  sx={{ px: 4, py: 1.5, fontSize: '0.95rem', fontWeight: 700, borderRadius: '12px' }}
                >
                  Launch App
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/features')}
                  sx={{ px: 3.5, py: 1.5, borderColor: '#27272a', color: '#71717a', fontSize: '0.95rem', borderRadius: '12px' }}
                >
                  Explore
                </Button>
              </Stack>
            </Reveal>
          </Stack>
        </Container>

        {/* Subtle gradient at bottom */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 200,
            background: 'linear-gradient(to top, #030304, transparent)',
            pointerEvents: 'none',
          }}
        />
      </Box>
    </Box>
  );
};

export default LandingPage;
