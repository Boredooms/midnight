import React, { useEffect, useRef } from 'react';
import { Box, Typography, Container, Stack, Button, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ParticleField } from '../components/ParticleField';
import { Navbar } from '../components/Navbar';

gsap.registerPlugin(ScrollTrigger);

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

      tl.fromTo(titleRef.current, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2 })
        .fromTo(descRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, '-=0.6')
        .fromTo(ctaRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, '-=0.4');
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <Box sx={{ bgcolor: '#030304', minHeight: '100vh' }}>
      <Navbar />

      {/* Hero */}
      <Box
        ref={heroRef}
        sx={{
          position: 'relative',
          overflow: 'visible',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ParticleField />
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Stack spacing={3} sx={{ alignItems: 'center', textAlign: 'center' }}>
            <Chip
              label="MIDNIGHT NETWORK • ZERO KNOWLEDGE"
              size="small"
              sx={{ bgcolor: '#ffffff04', border: '1px solid #1a1a1f', color: '#52525b', fontWeight: 600, fontSize: '0.6rem', letterSpacing: '0.12em' }}
            />

            <Box ref={titleRef} sx={{ opacity: 0 }}>
              <Typography
                sx={{
                  fontWeight: 900,
                  letterSpacing: '-0.04em',
                  fontSize: { xs: '2.8rem', sm: '4rem', md: '5.5rem' },
                  lineHeight: 1.1,
                  color: '#ffffff',
                }}
              >
                Confidential
              </Typography>
              <Typography
                sx={{
                  fontWeight: 900,
                  letterSpacing: '-0.04em',
                  fontSize: { xs: '2.8rem', sm: '4rem', md: '5.5rem' },
                  lineHeight: 1.1,
                  background: 'linear-gradient(180deg, #52525b 0%, #27272a 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Voting Engine
              </Typography>
            </Box>

            <Box ref={descRef} sx={{ opacity: 0 }}>
              <Typography sx={{ color: '#52525b', maxWidth: 480, fontSize: '1.05rem', lineHeight: 1.75 }}>
                Private ballots proven off-chain. Verifiable tallies on-chain.
                No one sees your vote — everyone can verify the count.
              </Typography>
            </Box>

            <Box ref={ctaRef} sx={{ opacity: 0, pt: 2 }}>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/app')}
                  sx={{ px: 4, py: 1.5, fontSize: '1rem', fontWeight: 700, borderRadius: '14px' }}
                >
                  Launch App
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/features')}
                  sx={{ px: 3.5, py: 1.5, borderColor: '#27272a', color: '#71717a', fontSize: '1rem', borderRadius: '14px' }}
                >
                  Explore
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Container>

        {/* Bottom fade */}
        <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 200, background: 'linear-gradient(to top, #030304, transparent)', pointerEvents: 'none', zIndex: 1 }} />
      </Box>
    </Box>
  );
};

export default LandingPage;
