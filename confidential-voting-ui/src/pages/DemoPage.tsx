import React, { useState, useRef } from 'react';
import { Box, Typography, Container, Stack, Button, Chip, LinearProgress, Alert } from '@mui/material';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import LockIcon from '@mui/icons-material/Lock';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useNavigate } from 'react-router-dom';
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

type MockState = 'uninitialized' | 'creating' | 'open' | 'voting' | 'finalized';

/** Interactive mock demo — no wallet needed */
const DemoPage: React.FC = () => {
  const navigate = useNavigate();
  const [state, setState] = useState<MockState>('uninitialized');
  const [candA, setCandA] = useState(0);
  const [candB, setCandB] = useState(0);
  const [message, setMessage] = useState('');

  const total = candA + candB;
  const pA = total > 0 ? Math.round((candA / total) * 100) : 0;
  const pB = total > 0 ? Math.round((candB / total) * 100) : 0;

  const simulate = (nextState: MockState, msg: string, delay: number) => {
    setMessage(msg);
    setTimeout(() => {
      setState(nextState);
      setMessage('');
    }, delay);
  };

  const handleCreate = () => {
    setState('creating');
    simulate('open', 'Generating ZK proof for createElection()…', 1800);
  };

  const handleVote = (candidate: 0 | 1) => {
    setState('voting');
    setMessage(`Proving vote(${candidate}) off-chain…`);
    setTimeout(() => {
      if (candidate === 0) setCandA((v) => v + 1);
      else setCandB((v) => v + 1);
      setState('open');
      setMessage('Vote submitted!');
      setTimeout(() => setMessage(''), 2000);
    }, 1500);
  };

  const handleFinalize = () => {
    simulate('finalized', 'Proving finalizeElection()…', 1400);
  };

  return (
    <Box sx={{ bgcolor: '#030304', minHeight: '100vh' }}>
      <Navbar />

      <Box sx={{ pt: { xs: 16, md: 20 }, pb: { xs: 4, md: 6 }, textAlign: 'center' }}>
        <Container maxWidth="sm">
          <Reveal>
            <Chip label="INTERACTIVE DEMO" size="small" sx={{ mb: 3, bgcolor: '#ffffff04', border: '1px solid #1a1a1f', color: '#52525b', fontWeight: 600, fontSize: '0.6rem', letterSpacing: '0.12em' }} />
          </Reveal>
          <Reveal delay={0.1}>
            <Typography sx={{ fontWeight: 800, fontSize: { xs: '2rem', md: '2.6rem' }, letterSpacing: '-0.04em', mb: 1.5 }}>
              Try the Flow
            </Typography>
          </Reveal>
          <Reveal delay={0.15}>
            <Typography sx={{ color: '#52525b', maxWidth: 400, mx: 'auto', mb: 2 }}>
              Simulate the full election lifecycle. No wallet needed — this is a local mock.
            </Typography>
          </Reveal>
          <Reveal delay={0.2}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<PlayArrowIcon sx={{ fontSize: 16 }} />}
              onClick={() => navigate('/app')}
              sx={{ borderColor: '#27272a', color: '#a1a1aa', borderRadius: '100px', px: 2.5 }}
            >
              Use Real Contract →
            </Button>
          </Reveal>
        </Container>
      </Box>

      {/* Mock Election Card */}
      <Container maxWidth="xs" sx={{ pb: 10 }}>
        <Reveal delay={0.25}>
          <Box
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: '16px',
              border: '1px solid #18181b',
              bgcolor: '#09090c',
            }}
          >
            {/* Header */}
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
              <Typography sx={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#3f3f46' }}>
                mock://0x02ab…d5f1
              </Typography>
              <AnimatePresence mode="wait">
                <motion.div key={state} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  {state === 'uninitialized' && <Chip label="Uninitialized" size="small" sx={{ bgcolor: '#27272a', color: '#a1a1aa', fontSize: '0.68rem', height: 22 }} />}
                  {(state === 'creating' || state === 'open' || state === 'voting') && <Chip icon={<HowToVoteIcon sx={{ fontSize: '14px !important', color: '#000 !important' }} />} label="Open" size="small" sx={{ bgcolor: '#fff', color: '#000', fontWeight: 700, fontSize: '0.68rem', height: 22 }} />}
                  {state === 'finalized' && <Chip icon={<CheckCircleIcon sx={{ fontSize: '14px !important' }} />} label="Finalized" size="small" sx={{ bgcolor: '#18181b', color: '#71717a', border: '1px solid #27272a', fontSize: '0.68rem', height: 22 }} />}
                </motion.div>
              </AnimatePresence>
            </Stack>

            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, letterSpacing: '-0.02em' }}>
              Mock Election
            </Typography>

            {/* Message */}
            <AnimatePresence>
              {message && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <Alert severity="info" sx={{ mb: 2, bgcolor: '#0a1628', color: '#93c5fd', border: '1px solid #1e3a5f', borderRadius: '8px', py: 0.5, '& .MuiAlert-icon': { color: '#60a5fa' } }}>
                    {message}
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            {(state === 'creating' || state === 'voting') && (
              <LinearProgress sx={{ mb: 2, borderRadius: 1, height: 2, bgcolor: '#18181b', '& .MuiLinearProgress-bar': { bgcolor: '#52525b' } }} />
            )}

            {/* Uninitialized */}
            {state === 'uninitialized' && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ color: '#71717a', mb: 2.5 }}>
                  Contract deployed. Click to initialize an election.
                </Typography>
                <Button variant="contained" size="small" onClick={handleCreate} sx={{ px: 2.5 }}>
                  createElection("Mock Election")
                </Button>
              </Box>
            )}

            {/* Open — voting */}
            {(state === 'open' || state === 'voting') && (
              <Box sx={{ mt: 2 }}>
                <Stack spacing={2} sx={{ mb: 3 }}>
                  <Box>
                    <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.75 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>Candidate A</Typography>
                      <Typography variant="body2" sx={{ color: '#a1a1aa' }}>{candA} {total > 0 && `(${pA}%)`}</Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={pA} sx={{ height: 6, borderRadius: 3, bgcolor: '#18181b', '& .MuiLinearProgress-bar': { bgcolor: '#ffffff', borderRadius: 3 } }} />
                  </Box>
                  <Box>
                    <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.75 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>Candidate B</Typography>
                      <Typography variant="body2" sx={{ color: '#a1a1aa' }}>{candB} {total > 0 && `(${pB}%)`}</Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={pB} sx={{ height: 6, borderRadius: 3, bgcolor: '#18181b', '& .MuiLinearProgress-bar': { bgcolor: '#52525b', borderRadius: 3 } }} />
                  </Box>
                </Stack>

                <Typography variant="caption" sx={{ color: '#3f3f46', mb: 2, display: 'block' }}>Total: {total}</Typography>

                <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
                  <Button fullWidth variant="contained" startIcon={<LockIcon sx={{ fontSize: 16 }} />} onClick={() => handleVote(0)} disabled={state === 'voting'} sx={{ py: 1 }}>
                    Vote A
                  </Button>
                  <Button fullWidth variant="outlined" startIcon={<LockIcon sx={{ fontSize: 16 }} />} onClick={() => handleVote(1)} disabled={state === 'voting'} sx={{ py: 1, borderColor: '#27272a', color: '#e4e4e7' }}>
                    Vote B
                  </Button>
                </Stack>

                <Button fullWidth variant="outlined" size="small" onClick={handleFinalize} disabled={state === 'voting' || total === 0} sx={{ borderColor: '#18181b', color: '#52525b' }}>
                  finalizeElection()
                </Button>
              </Box>
            )}

            {/* Finalized */}
            {state === 'finalized' && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <CheckCircleIcon sx={{ fontSize: 40, color: '#22c55e', mb: 1.5 }} />
                <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Election Finalized</Typography>
                <Typography variant="body2" sx={{ color: '#71717a', mb: 3 }}>
                  {candA > candB ? 'Candidate A wins' : candB > candA ? 'Candidate B wins' : 'Tie'} — {total} total votes
                </Typography>
                <Button variant="outlined" size="small" onClick={() => { setState('uninitialized'); setCandA(0); setCandB(0); }} sx={{ borderColor: '#27272a', color: '#a1a1aa', borderRadius: '100px' }}>
                  Reset Demo
                </Button>
              </Box>
            )}
          </Box>
        </Reveal>
      </Container>
    </Box>
  );
};

export default DemoPage;
