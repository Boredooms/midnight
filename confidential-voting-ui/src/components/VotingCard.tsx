import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  Alert,
  CircularProgress,
  Stack,
  Divider,
} from '@mui/material';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import SecurityIcon from '@mui/icons-material/Security';
import { type Observable } from 'rxjs';
import { type VotingDeployment } from '../contexts';
import { type VotingDerivedState } from '@midnight-ntwrk/confidential-voting-api';
import { State } from '@midnight-ntwrk/confidential-voting-contract';

export type VotingCardProps = {
  votingDeployment$?: Observable<VotingDeployment>;
};

export const VotingCard: React.FC<VotingCardProps> = ({ votingDeployment$ }) => {
  const [deployment, setDeployment] = useState<VotingDeployment | undefined>(undefined);
  const [derivedState, setDerivedState] = useState<VotingDerivedState | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (!votingDeployment$) return;
    const sub = votingDeployment$.subscribe((d) => {
      setDeployment(d);
      if (d.status === 'deployed') {
        const stateSub = d.api.state$.subscribe(setDerivedState);
        return () => stateSub.unsubscribe();
      }
    });
    return () => sub.unsubscribe();
  }, [votingDeployment$]);

  if (!deployment) {
    return (
      <Card sx={{ bgcolor: '#121218', color: '#fff', borderRadius: 3, border: '1px solid #2d2d3a', p: 2 }}>
        <CardContent sx={{ textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No election joined yet. Join or deploy an election to get started.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (deployment.status === 'in-progress') {
    return (
      <Card sx={{ bgcolor: '#121218', color: '#fff', borderRadius: 3, border: '1px solid #2d2d3a', p: 4, textAlign: 'center' }}>
        <CircularProgress color="primary" sx={{ mb: 2 }} />
        <Typography variant="h6">Connecting to Midnight Preprod & Generating ZK Proofs...</Typography>
        <Typography variant="body2" color="text.secondary">Please stand by while smart contract transactions finalize.</Typography>
      </Card>
    );
  }

  if (deployment.status === 'failed') {
    return (
      <Card sx={{ bgcolor: '#121218', color: '#fff', borderRadius: 3, border: '1px solid #f44336', p: 3 }}>
        <Alert severity="error">
          Failed to load election contract: {deployment.error.message}
        </Alert>
      </Card>
    );
  }

  const handleVote = async (candidateIndex: number) => {
    try {
      setIsSubmitting(true);
      setErrorMsg('');
      setActionMessage(`Generating ZK proof & casting confidential vote for Candidate ${candidateIndex}...`);
      await deployment.api.vote(candidateIndex);
      setActionMessage('Vote successfully cast and proven on Midnight!');
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Failed to cast vote');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateElection = async (title: string) => {
    try {
      setIsSubmitting(true);
      setErrorMsg('');
      setActionMessage('Generating ZK commitment to initialize election...');
      await deployment.api.createElection(title);
      setActionMessage('Election created successfully!');
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Failed to create election');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalize = async () => {
    try {
      setIsSubmitting(true);
      setErrorMsg('');
      setActionMessage('Generating proof to finalize election...');
      await deployment.api.finalizeElection();
      setActionMessage('Election finalized.');
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Failed to finalize election');
    } finally {
      setIsSubmitting(false);
    }
  };

  const total = Number(derivedState?.totalVotes ?? 0n);
  const cand0 = Number(derivedState?.candidate0Tally ?? 0n);
  const cand1 = Number(derivedState?.candidate1Tally ?? 0n);
  const percent0 = total > 0 ? Math.round((cand0 / total) * 100) : 0;
  const percent1 = total > 0 ? Math.round((cand1 / total) * 100) : 0;

  const isUninit = derivedState?.state === State.UNINITIALIZED;
  const isOpen = derivedState?.state === State.OPEN;
  const isFinalized = derivedState?.state === State.FINALIZED;

  return (
    <Card sx={{ bgcolor: '#121218', color: '#fff', borderRadius: 3, border: '1px solid #272738', boxShadow: '0 8px 32px rgba(0,0,0,0.6)', p: 1 }}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <LockIcon sx={{ color: '#00f2fe' }} />
            <Typography variant="subtitle2" sx={{ color: '#00f2fe', fontWeight: 600, letterSpacing: 1 }}>
              PRIVACY-PRESERVING ZERO-KNOWLEDGE ELECTION
            </Typography>
          </Stack>
          {isUninit && <Chip label="Uninitialized" color="warning" size="small" />}
          {isOpen && <Chip label="Voting Open" color="success" size="small" icon={<HowToVoteIcon />} />}
          {isFinalized && <Chip label="Finalized" color="default" size="small" icon={<CheckCircleIcon />} />}
        </Stack>

        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#fff' }}>
          {derivedState?.electionTitle ?? 'Confidential Election'}
        </Typography>
        <Typography variant="body2" sx={{ color: '#90a0b7', mb: 3 }}>
          Contract Address: <span style={{ fontFamily: 'monospace', color: '#00f2fe' }}>{deployment.api.deployedContractAddress}</span>
        </Typography>

        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMsg('')}>
            {errorMsg}
          </Alert>
        )}

        {actionMessage && !errorMsg && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {actionMessage}
          </Alert>
        )}

        {isSubmitting && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

        {isUninit && (
          <Box sx={{ bgcolor: '#1a1a24', p: 3, borderRadius: 2, border: '1px solid #333' }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Initialize Election</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Set an election topic and generate ZK ownership commitment.
            </Typography>
            <Button
              variant="contained"
              sx={{ background: 'linear-gradient(90deg, #00f2fe 0%, #4facfe 100%)', color: '#000', fontWeight: 700 }}
              onClick={() => handleCreateElection('Level 1 Builder Challenge Voting')}
              disabled={isSubmitting}
            >
              Open Election: "Level 1 Builder Challenge Voting"
            </Button>
          </Box>
        )}

        {(isOpen || isFinalized) && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Election Results & Tally</Typography>

            <Box sx={{ mb: 3 }}>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>Candidate 0 (Option A)</Typography>
                <Typography variant="body1" sx={{ color: '#00f2fe', fontWeight: 700 }}>{cand0} votes ({percent0}%)</Typography>
              </Stack>
              <LinearProgress variant="determinate" value={percent0} sx={{ height: 12, borderRadius: 6, bgcolor: '#222', '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #00f2fe, #4facfe)' } }} />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>Candidate 1 (Option B)</Typography>
                <Typography variant="body1" sx={{ color: '#ff4081', fontWeight: 700 }}>{cand1} votes ({percent1}%)</Typography>
              </Stack>
              <LinearProgress variant="determinate" value={percent1} sx={{ height: 12, borderRadius: 6, bgcolor: '#222', '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #ff4081, #ff80ab)' } }} />
            </Box>

            <Divider sx={{ my: 2, borderColor: '#222' }} />

            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ color: '#90a0b7' }}>Total Confidential Votes Verified: <strong>{total}</strong></Typography>
              {derivedState?.isOwner && <Chip label="Election Owner" color="primary" size="small" variant="outlined" />}
            </Stack>

            {isOpen && (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<SecurityIcon />}
                  sx={{ background: 'linear-gradient(90deg, #00f2fe 0%, #4facfe 100%)', color: '#000', fontWeight: 700, py: 1.5 }}
                  onClick={() => handleVote(0)}
                  disabled={isSubmitting}
                >
                  Vote Candidate 0 Privately
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<SecurityIcon />}
                  sx={{ background: 'linear-gradient(90deg, #ff4081 0%, #ff80ab 100%)', color: '#fff', fontWeight: 700, py: 1.5 }}
                  onClick={() => handleVote(1)}
                  disabled={isSubmitting}
                >
                  Vote Candidate 1 Privately
                </Button>
              </Stack>
            )}

            {isOpen && derivedState?.isOwner && (
              <Button
                variant="outlined"
                color="warning"
                fullWidth
                sx={{ mt: 1 }}
                onClick={handleFinalize}
                disabled={isSubmitting}
              >
                Finalize Election (Owner Only)
              </Button>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
