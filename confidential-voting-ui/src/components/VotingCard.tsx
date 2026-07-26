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
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import RefreshIcon from '@mui/icons-material/Refresh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { type Observable } from 'rxjs';
import { type VotingDeployment } from '../contexts';
import { type VotingDerivedState } from '@midnight-ntwrk/confidential-voting-api';
import { State } from '@midnight-ntwrk/confidential-voting-contract';
import { CONTRACT_ADDRESS } from '../globals';

export type VotingCardProps = {
  votingDeployment$?: Observable<VotingDeployment>;
  onQuickJoinPreprod?: (contractAddress: string) => void;
  onRetryConnect?: () => void;
};

export const VotingCard: React.FC<VotingCardProps> = ({ votingDeployment$, onQuickJoinPreprod, onRetryConnect }) => {
  const [deployment, setDeployment] = useState<VotingDeployment | undefined>(undefined);
  const [derivedState, setDerivedState] = useState<VotingDerivedState | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

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

  const copyAddress = () => {
    if (deployment?.status === 'deployed') {
      navigator.clipboard.writeText(deployment.api.deployedContractAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!deployment) {
    return (
      <Card sx={{ bgcolor: '#09090c', color: '#fff', borderRadius: '16px', border: '1px solid #18181b', p: 4, textAlign: 'center' }}>
        <CardContent sx={{ py: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: '#ffffff' }}>
            No Active Election Contract Joined
          </Typography>
          <Typography variant="body2" sx={{ color: '#a1a1aa', mb: 3, maxWidth: 500, mx: 'auto' }}>
            Join an existing 32-byte election contract address or deploy a fresh confidential election instance on Midnight Preprod.
          </Typography>
          <Stack direction="row" spacing={2} sx={{ justifyContent: 'center' }}>
            {onQuickJoinPreprod && (
              <Button
                variant="contained"
                startIcon={<PlayArrowIcon />}
                sx={{ bgcolor: '#ffffff', color: '#000000', fontWeight: 800, px: 3, py: 1.2, borderRadius: '10px' }}
                onClick={() => onQuickJoinPreprod(CONTRACT_ADDRESS)}
              >
                Connect Preprod Demo Election
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>
    );
  }

  if (deployment.status === 'in-progress') {
    return (
      <Card sx={{ bgcolor: '#09090c', color: '#fff', borderRadius: '16px', border: '1px solid #18181b', p: 5, textAlign: 'center' }}>
        <CircularProgress sx={{ color: '#ffffff', mb: 2 }} size={36} thickness={4} />
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Connecting to Midnight Preprod...</Typography>
        <Typography variant="body2" sx={{ color: '#a1a1aa' }}>Prompting 1AM Wallet authorization & fetching ZK proving keys.</Typography>
      </Card>
    );
  }

  if (deployment.status === 'failed') {
    const isAuthOrWalletError =
      deployment.error.message.includes('Application is not authorized') ||
      deployment.error.message.includes('wallet') ||
      deployment.error.message.includes('1AM') ||
      deployment.error.message.includes('Lace') ||
      deployment.error.message.includes('detected');

    return (
      <Card sx={{ bgcolor: '#09090c', color: '#fff', borderRadius: '16px', border: '1px solid #27272a', p: 4 }}>
        <CardContent>
          {isAuthOrWalletError ? (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Box sx={{ display: 'inline-flex', p: 2, bgcolor: '#ffffff0a', borderRadius: '50%', mb: 2, border: '1px solid #ffffff15' }}>
                <AccountBalanceWalletIcon sx={{ fontSize: 44, color: '#ffffff' }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: '#ffffff', letterSpacing: '-0.02em' }}>
                Midnight 1AM Wallet Authorization Required
              </Typography>
              <Typography variant="body2" sx={{ color: '#a1a1aa', mb: 4, maxWidth: 540, mx: 'auto', lineHeight: 1.6 }}>
                {deployment.error.message}
              </Typography>
              <Stack direction="row" spacing={2} sx={{ justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  startIcon={<AccountBalanceWalletIcon />}
                  sx={{ bgcolor: '#ffffff', color: '#000000', fontWeight: 700, px: 3.5, py: 1.4, borderRadius: '12px', '&:hover': { bgcolor: '#e4e4e7' } }}
                  onClick={() => {
                    if (onRetryConnect) onRetryConnect();
                  }}
                >
                  Connect 1AM Wallet
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  sx={{ borderColor: '#27272a', color: '#a1a1aa', borderRadius: '12px', px: 2.5 }}
                  onClick={() => {
                    if (onRetryConnect) onRetryConnect();
                  }}
                >
                  Retry Connection
                </Button>
              </Stack>
            </Box>
          ) : (
            <Alert severity="error" sx={{ bgcolor: '#180e0e', color: '#f87171', border: '1px solid #3b1212', borderRadius: '12px' }}>
              Failed to load election contract: {deployment.error.message}
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  }

  const handleVote = async (candidateIndex: number) => {
    try {
      setIsSubmitting(true);
      setErrorMsg('');
      setActionMessage(`Generating ZK proof & requesting 1AM Wallet balance for Candidate ${candidateIndex}...`);
      await deployment.api.vote(candidateIndex);
      setActionMessage('Confidential ZK vote successfully proven and submitted to Midnight network!');
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
      setActionMessage('Generating ZK commitment to initialize election on-chain...');
      await deployment.api.createElection(title);
      setActionMessage('Election round successfully initialized!');
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
      setActionMessage('Generating ZK proof to finalize election round...');
      await deployment.api.finalizeElection();
      setActionMessage('Election successfully finalized!');
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
    <Card sx={{ bgcolor: '#09090c', color: '#fff', borderRadius: '16px', border: '1px solid #18181b', boxShadow: '0 8px 32px rgba(0,0,0,0.8)', p: 1 }}>
      <CardContent sx={{ p: 3.5 }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <LockIcon sx={{ color: '#ffffff', fontSize: 18 }} />
            <Typography variant="caption" sx={{ color: '#a1a1aa', fontWeight: 700, letterSpacing: '0.1em' }}>
              ZERO-KNOWLEDGE CONFIDENTIAL ELECTION
            </Typography>
          </Stack>
          {isUninit && <Chip label="UNINITIALIZED" size="small" sx={{ bgcolor: '#27272a', color: '#e4e4e7', fontWeight: 700, fontSize: '0.7rem' }} />}
          {isOpen && <Chip label="VOTING OPEN" size="small" sx={{ bgcolor: '#ffffff', color: '#000000', fontWeight: 800, fontSize: '0.7rem' }} icon={<HowToVoteIcon sx={{ color: '#000 !important' }} />} />}
          {isFinalized && <Chip label="FINALIZED" size="small" sx={{ bgcolor: '#18181b', color: '#71717a', border: '1px solid #27272a', fontWeight: 700, fontSize: '0.7rem' }} icon={<CheckCircleIcon />} />}
        </Stack>

        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: '#ffffff', letterSpacing: '-0.03em' }}>
          {derivedState?.electionTitle ?? 'Confidential Election'}
        </Typography>

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 3 }}>
          <Typography variant="caption" sx={{ color: '#71717a', fontFamily: 'monospace' }}>
            Contract Address: <span style={{ color: '#ffffff' }}>{deployment.api.deployedContractAddress}</span>
          </Typography>
          <Button size="small" startIcon={<ContentCopyIcon sx={{ fontSize: 14 }} />} sx={{ color: '#a1a1aa', py: 0.2, minWidth: 0 }} onClick={copyAddress}>
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </Stack>

        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2.5, bgcolor: '#180e0e', color: '#f87171', border: '1px solid #3b1212', borderRadius: '10px' }} onClose={() => setErrorMsg('')}>
            {errorMsg}
          </Alert>
        )}

        {actionMessage && !errorMsg && (
          <Alert severity="info" sx={{ mb: 2.5, bgcolor: '#0e1726', color: '#60a5fa', border: '1px solid #1e3a5f', borderRadius: '10px' }}>
            {actionMessage}
          </Alert>
        )}

        {isSubmitting && <LinearProgress sx={{ mb: 2.5, borderRadius: 1, bgcolor: '#18181b', '& .MuiLinearProgress-bar': { bgcolor: '#ffffff' } }} />}

        {isUninit && (
          <Box sx={{ bgcolor: '#121216', p: 3.5, borderRadius: '12px', border: '1px solid #27272a' }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>Initialize Election State</Typography>
            <Typography variant="body2" sx={{ color: '#a1a1aa', mb: 3 }}>
              Open voting round with a topic commitment proven on the Midnight Preprod chain.
            </Typography>
            <Button
              variant="contained"
              sx={{ bgcolor: '#ffffff', color: '#000000', fontWeight: 800, px: 3, py: 1.2 }}
              onClick={() => handleCreateElection('Level 1 Builder Challenge Voting')}
              disabled={isSubmitting}
            >
              Open Election: "Level 1 Builder Challenge Voting"
            </Button>
          </Box>
        )}

        {(isOpen || isFinalized) && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5 }}>Election Tally & Progress</Typography>

            <Box sx={{ mb: 3, p: 2.5, bgcolor: '#121216', borderRadius: '12px', border: '1px solid #18181b' }}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>Candidate 0 (Option A)</Typography>
                <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 800 }}>{cand0} votes ({percent0}%)</Typography>
              </Stack>
              <LinearProgress variant="determinate" value={percent0} sx={{ height: 10, borderRadius: 5, bgcolor: '#18181b', '& .MuiLinearProgress-bar': { bgcolor: '#ffffff' } }} />
            </Box>

            <Box sx={{ mb: 3, p: 2.5, bgcolor: '#121216', borderRadius: '12px', border: '1px solid #18181b' }}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>Candidate 1 (Option B)</Typography>
                <Typography variant="body1" sx={{ color: '#a1a1aa', fontWeight: 800 }}>{cand1} votes ({percent1}%)</Typography>
              </Stack>
              <LinearProgress variant="determinate" value={percent1} sx={{ height: 10, borderRadius: 5, bgcolor: '#18181b', '& .MuiLinearProgress-bar': { bgcolor: '#71717a' } }} />
            </Box>

            <Divider sx={{ my: 2.5, borderColor: '#18181b' }} />

            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="body2" sx={{ color: '#a1a1aa' }}>Total Zero-Knowledge Votes Proven: <strong style={{ color: '#ffffff' }}>{total}</strong></Typography>
              {derivedState?.isOwner && <Chip label="ELECTION CREATOR" size="small" sx={{ bgcolor: '#ffffff15', color: '#ffffff', border: '1px solid #ffffff30', fontWeight: 700, fontSize: '0.65rem' }} />}
            </Stack>

            {isOpen && (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<SecurityIcon />}
                  sx={{ bgcolor: '#ffffff', color: '#000000', fontWeight: 800, py: 1.6, '&:hover': { bgcolor: '#e4e4e7' } }}
                  onClick={() => handleVote(0)}
                  disabled={isSubmitting}
                >
                  Vote Candidate 0 (ZK Private)
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  startIcon={<SecurityIcon />}
                  sx={{ borderColor: '#3f3f46', color: '#ffffff', fontWeight: 700, py: 1.6, '&:hover': { borderColor: '#ffffff', bgcolor: '#ffffff0a' } }}
                  onClick={() => handleVote(1)}
                  disabled={isSubmitting}
                >
                  Vote Candidate 1 (ZK Private)
                </Button>
              </Stack>
            )}

            {isOpen && derivedState?.isOwner && (
              <Button
                variant="outlined"
                color="warning"
                fullWidth
                sx={{ mt: 1, borderColor: '#3f3f46', color: '#e4e4e7' }}
                onClick={handleFinalize}
                disabled={isSubmitting}
              >
                Finalize Election (Creator Only)
              </Button>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
