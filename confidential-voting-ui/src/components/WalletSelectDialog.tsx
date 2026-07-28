import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Box,
  Chip,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { type InitialAPI } from '@midnight-ntwrk/dapp-connector-api';

export interface DetectedWallet {
  key: string;
  api: InitialAPI;
}

export interface WalletSelectDialogProps {
  open: boolean;
  wallets: DetectedWallet[];
  onSelect: (wallet: DetectedWallet) => void;
  onClose: () => void;
}

export const WalletSelectDialog: React.FC<WalletSelectDialogProps> = ({
  open,
  wallets,
  onSelect,
  onClose,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            bgcolor: '#09090c',
            border: '1px solid #27272a',
            borderRadius: '16px',
            minWidth: 360,
            maxWidth: 420,
            boxShadow: '0 24px 80px rgba(0,0,0,0.9)',
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>
          Select Wallet
        </Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: '#71717a' }}>
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 2, pb: 3 }}>
        {wallets.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <AccountBalanceWalletIcon sx={{ fontSize: 40, color: '#3f3f46', mb: 1.5 }} />
            <Typography variant="body2" sx={{ color: '#71717a', mb: 1 }}>
              No Midnight wallet detected
            </Typography>
            <Typography variant="caption" sx={{ color: '#52525b', display: 'block', lineHeight: 1.6 }}>
              Install the <strong>Lace</strong> or <strong>1AM</strong> wallet extension and refresh.
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {wallets.map((w) => (
              <ListItemButton
                key={w.key}
                onClick={() => onSelect(w)}
                sx={{
                  borderRadius: '12px',
                  mb: 0.75,
                  border: '1px solid #18181b',
                  '&:hover': { bgcolor: '#ffffff08', borderColor: '#27272a' },
                  transition: 'all 0.15s ease',
                }}
              >
                <ListItemAvatar sx={{ minWidth: 44 }}>
                  <Avatar
                    src={w.api.icon}
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: '#18181b',
                      border: '1px solid #27272a',
                    }}
                  >
                    <AccountBalanceWalletIcon sx={{ fontSize: 18, color: '#71717a' }} />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography sx={{ fontWeight: 600, fontSize: '0.88rem' }}>
                      {w.api.name || 'Unknown Wallet'}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" sx={{ color: '#52525b' }}>
                      v{w.api.apiVersion}
                    </Typography>
                  }
                />
                <Chip
                  label="Connect"
                  size="small"
                  sx={{
                    bgcolor: '#ffffff08',
                    color: '#a1a1aa',
                    border: '1px solid #27272a',
                    fontSize: '0.7rem',
                    height: 24,
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        )}

        <Typography
          variant="caption"
          sx={{ color: '#3f3f46', display: 'block', textAlign: 'center', mt: 2 }}
        >
          DApp Connector API v4 • Midnight Preprod
        </Typography>
      </DialogContent>
    </Dialog>
  );
};
