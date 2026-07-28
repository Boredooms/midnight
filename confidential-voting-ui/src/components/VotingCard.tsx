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
  IconButton,
} from '@mui/material';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import RefreshIcon from '@mui/icons-material/Refresh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
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

export const VotingCard: React.FC<VotingCardProps> = ({
  votingDeployment$,
  onQuickJoinPreprod,
  onRetryConnect,
}) => {
  const [deployment, setDeployment] = useState<VotingDeployment | undefined>(undefined);
  const [derivedState, setDerivedState] = useState<VotingDerivedState | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

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

  // --- Empty state: no deployment ---
  if (!deployment) {
    return (
      <Card
        sx={{
          border: '1px dashed #27272a',
          bgcolor: 'transparent',
          boxShadow: 'none',
          '&:hover': { borderColor: '#3f3f46', transform: 'none', boxShadow: 'none' },
        }}
      >
        <CardContent sx={{ py: 5, textAlign: 'center' }}>
          <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
            No active election
          </Typography>
          <Typography variant="body2" sx={{ color: '#71717a', mb: 3, maxWidth: 400, mx: 'auto' }}>
            Deploy a new election or join an existing contract to get started.
          </Typography>
          {onQuickJoinPreprod && CONTRACT_ADDRESS && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<PlayArrowIcon sx={{ fontSize: 16 }} />}
              onClick={() => onQuickJoinPreprod(CONTRACT_ADDRESS)}
              sx={{ borderColor: '#27272a', color: '#a1a1aa' }}
            >
              Join Demo Election
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // --- Loading state ---
  if (deployment.status === 'in-progress') {
    return (
      <Card sx={{ border: '1px solid #18181b' }}>
        <CardContent sx={{ py: 4, textAlign: 'center' }}>
          <CircularProgress sx={{ color: '#52525b', mb: 2 }} size={28} thickness={4} />
          <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
            Connecting to contract…
          </Typography>
          <Typography variant="body2" sx={{ color: '#71717a', mb: 2 }}>
            Fetching ZK proving keys and syncing state from the indexer.
          </Typography>
          <Typography variant="caption" sx={{ color: '#3f3f46', display: 'block' }}>
            This can take 10–30 seconds. If it hangs, the contract address may not exist on preprod — try deploying a new election instead.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // --- Error state ---
  if (deployment.status === 'failed') {
    const msg = deployment.error.message;
    const isWalletError =
      msg.includes('not authorized') ||
      msg.includes('wallet') ||
      msg.includes('Wallet') ||
      msg.includes('detected') ||
      msg.includes('not established') ||
      msg.includes('not connected');
    const isProofServerError =
      msg.includes('Prover') ||
      msg.includes('proof') ||
      msg.includes('6300') ||
      msg.includes('Failed to fetch');
    const isBalanceError =
      msg.includes('DUST') ||
      msg.includes('Insufficient') ||
      msg.includes('balance');

    // Provide actionable guidance based on error type
    let guidance = '';
    if (isWalletError) {
      guidance = 'Connect your wallet extension and approve the connection.';
    } else if (isProofServerError) {
      guidance = 'Start the proof server: docker run -p 6300:6300 midnightntwrk/proof-server:8.0.3 midnight-proof-server --network preprod';
    } else if (isBalanceError) {
      guidance = 'Get tNIGHT from the Preprod faucet and register for DUST generation in your wallet.';
    }

    return (
      <Card sx={{ border: '1px solid #27272a' }}>
        <CardContent sx={{ py: 4 }}>
          {isWalletError ? (
            <Stack spacing={2.5} sx={{ alignItems: 'center', textAlign: 'center' }}>
              <Box sx={{ p: 1.5, bgcolor: '#ffffff06', borderRadius: '12px', border: '1px solid #ffffff10', display: 'inline-flex' }}>
                <AccountBalanceWalletIcon sx={{ fontSize: 32, color: '#71717a' }} />
              </Box>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 700, mb: 0.5 }}>Wallet connection required</Typography>
                <Typography variant="body2" sx={{ color: '#71717a', maxWidth: 420, mx: 'auto', lineHeight: 1.6 }}>
                  {msg}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1.5}>
                <Button variant="contained" size="small" startIcon={<AccountBalanceWalletIcon sx={{ fontSize: 16 }} />} onClick={onRetryConnect} sx={{ px: 2.5 }}>
                  Connect Wallet
                </Button>
                <Button variant="outlined" size="small" startIcon={<RefreshIcon sx={{ fontSize: 16 }} />} onClick={onRetryConnect} sx={{ borderColor: '#27272a', color: '#a1a1aa' }}>
                  Retry
                </Button>
              </Stack>
            </Stack>
          ) : (
            <Stack spacing={2}>
              <Alert
                severity="error"
                sx={{ bgcolor: '#1a0a0a', color: '#fca5a5', border: '1px solid #371717', borderRadius: '10px', '& .MuiAlert-icon': { color: '#f87171' } }}
              >
                {msg}
              </Alert>
              {guidance && (
                <Alert
                  severity="info"
                  sx={{ bgcolor: '#0a1628', color: '#93c5fd', border: '1px solid #1e3a5f', borderRadius: '10px', py: 0.5, fontSize: '0.8rem', '& .MuiAlert-icon': { color: '#60a5fa' } }}
                >
                  <strong>Fix:</strong> {guidance}
                </Alert>
              )}
              <Button variant="outlined" size="small" startIcon={<RefreshIcon sx={{ fontSize: 16 }} />} onClick={onRetryConnect} sx={{ borderColor: '#27272a', color: '#a1a1aa', alignSelf: 'flex-start' }}>
                Retry
              </Button>
            </Stack>
          )}
        </CardContent>
      </Card>
    );
  }

  // --- Deployed state ---
  const handleVote = async (candidateIndex: number) => {
    try {
      setIsSubmitting(true);
      setErrorMsg('');
      setActionMessage(`Generating ZK proof for candidate ${candidateIndex}…`);
      await deployment.api.vote(candidateIndex);
      setActionMessage('Vote submitted successfully — tally updated live.');
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err: any) {
      const msg = err?.message ?? 'Vote failed';
      if (msg.includes('already voted')) {
        setErrorMsg('You have already voted in this election. Each voter gets one ballot (nullifier protection).');
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateElection = async () => {
    try {
      setIsSubmitting(true);
      setErrorMsg('');
      setActionMessage('Initializing election on-chain…');
      // Default 1 hour voting window
      await deployment.api.createElection('Confidential Election', 3600n);
      setActionMessage('Election initialized.');
      setTimeout(() => setActionMessage(''), 4000);
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
      setActionMessage('Ending election & publishing results on-chain…');
      await deployment.api.ownerFinalizeElection();
      setActionMessage('Election ended. Results published on-chain.');
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Failed to finalize');
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
    <Card sx={{ border: '1px solid #18181b' }}>
      <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
        {/* Card header */}
        <Stack
          direction="row"
          sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Typography
              variant="caption"
              sx={{ color: '#52525b', fontFamily: 'monospace', fontSize: '0.75rem' }}
            >
              {deployment.api.deployedContractAddress.slice(0, 10)}…
              {deployment.api.deployedContractAddress.slice(-6)}
            </Typography>
            <IconButton size="small" onClick={copyAddress} sx={{ color: '#52525b', p: 0.5 }}>
              <ContentCopyIcon sx={{ fontSize: 14 }} />
            </IconButton>
            {copied && (
              <Typography variant="caption" sx={{ color: '#22c55e', fontSize: '0.7rem' }}>
                Copied
              </Typography>
            )}
          </Stack>
          {isUninit && (
            <Chip
              label="Uninitialized"
              size="small"
              sx={{ bgcolor: '#27272a', color: '#a1a1aa', fontSize: '0.7rem', height: 22 }}
            />
          )}
          {isOpen && (
            <Chip
              icon={<HowToVoteIcon sx={{ fontSize: '14px !important', color: '#000 !important' }} />}
              label="Voting Open"
              size="small"
              sx={{ bgcolor: '#ffffff', color: '#000', fontWeight: 700, fontSize: '0.7rem', height: 22 }}
            />
          )}
          {isFinalized && (
            <Chip
              icon={<CheckCircleIcon sx={{ fontSize: '14px !important' }} />}
              label="Finalized"
              size="small"
              sx={{ bgcolor: '#18181b', color: '#71717a', border: '1px solid #27272a', fontSize: '0.7rem', height: 22 }}
            />
          )}
        </Stack>

        {/* Title + sharing */}
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, letterSpacing: '-0.02em' }}>
          {derivedState?.electionTitle ?? 'Confidential Election'}
        </Typography>

        {/* Live indicator + share address */}
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1 }}>
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: isOpen ? '#22c55e' : '#52525b', animation: isOpen ? 'pulse 2s infinite' : 'none', '@keyframes pulse': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.4 } } }} />
            <Typography variant="caption" sx={{ color: isOpen ? '#22c55e' : '#52525b', fontWeight: 600, fontSize: '0.7rem' }}>
              {isOpen ? 'LIVE' : isFinalized ? 'ENDED' : 'PENDING'}
            </Typography>
          </Stack>
          <Typography variant="caption" sx={{ color: '#3f3f46' }}>•</Typography>
          <Typography variant="caption" sx={{ color: '#52525b', fontSize: '0.7rem' }}>
            Share address for others to join & vote
          </Typography>
        </Stack>

        {/* Feedback messages */}
        {errorMsg && (
          <Alert
            severity="error"
            onClose={() => setErrorMsg('')}
            sx={{
              mt: 2,
              bgcolor: '#1a0a0a',
              color: '#fca5a5',
              border: '1px solid #371717',
              borderRadius: '8px',
              py: 0.5,
              '& .MuiAlert-icon': { color: '#f87171' },
            }}
          >
            {errorMsg}
          </Alert>
        )}

        {actionMessage && !errorMsg && (
          <Alert
            severity="info"
            sx={{
              mt: 2,
              bgcolor: '#0a1628',
              color: '#93c5fd',
              border: '1px solid #1e3a5f',
              borderRadius: '8px',
              py: 0.5,
              '& .MuiAlert-icon': { color: '#60a5fa' },
            }}
          >
            {actionMessage}
          </Alert>
        )}

        {isSubmitting && (
          <LinearProgress
            sx={{
              mt: 2,
              borderRadius: 1,
              height: 2,
              bgcolor: '#18181b',
              '& .MuiLinearProgress-bar': { bgcolor: '#52525b' },
            }}
          />
        )}

        {/* Uninitialized: create election */}
        {isUninit && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" sx={{ color: '#71717a', mb: 2 }}>
              This contract is deployed but no election is active. Initialize one to open voting.
            </Typography>
            <Button
              variant="contained"
              size="small"
              onClick={handleCreateElection}
              disabled={isSubmitting}
              sx={{ px: 2.5 }}
            >
              Initialize Election
            </Button>
          </Box>
        )}

        {/* Open or Finalized: show tally */}
        {(isOpen || isFinalized) && (
          <Box sx={{ mt: 3 }}>
            {/* Tally bars */}
            <Stack spacing={2} sx={{ mb: 3 }}>
              <Box>
                <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.75 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Candidate A</Typography>
                  <Typography variant="body2" sx={{ color: '#a1a1aa', fontWeight: 600 }}>
                    {cand0} {total > 0 && `(${percent0}%)`}
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={percent0}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: '#18181b',
                    '& .MuiLinearProgress-bar': { bgcolor: '#ffffff', borderRadius: 3 },
                  }}
                />
              </Box>
              <Box>
                <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.75 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Candidate B</Typography>
                  <Typography variant="body2" sx={{ color: '#a1a1aa', fontWeight: 600 }}>
                    {cand1} {total > 0 && `(${percent1}%)`}
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={percent1}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: '#18181b',
                    '& .MuiLinearProgress-bar': { bgcolor: '#52525b', borderRadius: 3 },
                  }}
                />
              </Box>
            </Stack>

            <Divider sx={{ borderColor: '#18181b', mb: 2.5 }} />

            <Stack
              direction="row"
              sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}
            >
              <Typography variant="caption" sx={{ color: '#52525b' }}>
                Total votes: <span style={{ color: '#a1a1aa' }}>{total}</span>
              </Typography>
              {derivedState?.isOwner && (
                <Chip
                  label="Creator"
                  size="small"
                  sx={{
                    bgcolor: '#ffffff08',
                    color: '#a1a1aa',
                    border: '1px solid #27272a',
                    fontSize: '0.65rem',
                    height: 20,
                  }}
                />
              )}
            </Stack>

            {/* Vote buttons */}
            {isOpen && (
              <Stack direction="row" spacing={1.5}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<LockIcon sx={{ fontSize: 16 }} />}
                  onClick={() => handleVote(0)}
                  disabled={isSubmitting}
                  sx={{ py: 1.2 }}
                >
                  Vote A (ZK)
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<LockIcon sx={{ fontSize: 16 }} />}
                  onClick={() => handleVote(1)}
                  disabled={isSubmitting}
                  sx={{ py: 1.2, borderColor: '#27272a', color: '#e4e4e7' }}
                >
                  Vote B (ZK)
                </Button>
              </Stack>
            )}

            {/* Finalize button (owner can force, anyone after deadline) */}
            {isOpen && derivedState?.isOwner && (
              <Button
                fullWidth
                variant="outlined"
                startIcon={<StopIcon sx={{ fontSize: 16 }} />}
                onClick={handleFinalize}
                disabled={isSubmitting}
                sx={{
                  mt: 1.5,
                  borderColor: '#27272a',
                  color: '#71717a',
                  '&:hover': { borderColor: '#ef4444', color: '#fca5a5' },
                }}
              >
                End Election & Publish Results
              </Button>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
