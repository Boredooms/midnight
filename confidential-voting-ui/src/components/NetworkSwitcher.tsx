import React, { useState } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Typography,
  Divider,
  Box,
} from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useNetwork } from '../contexts/NetworkContext';
import { type NetworkId } from '../config/networks';

const NETWORK_COLORS: Record<NetworkId, string> = {
  undeployed: '#f59e0b', // amber — local
  preview: '#3b82f6',    // blue
  preprod: '#22c55e',    // green
  mainnet: '#a855f7',    // purple
};

/**
 * Network switcher dropdown. Shows the active network with a color indicator
 * and allows switching between available Midnight networks.
 */
export const NetworkSwitcher: React.FC = () => {
  const { network, networks, switchNetwork } = useNetwork();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (id: NetworkId) => {
    if (id !== network.networkId) {
      switchNetwork(id);
    }
    handleClose();
  };

  const color = NETWORK_COLORS[network.networkId] ?? '#71717a';

  return (
    <>
      <Chip
        icon={<CircleIcon sx={{ fontSize: '8px !important', color: `${color} !important` }} />}
        label={network.label}
        size="small"
        onClick={handleClick}
        deleteIcon={<SwapHorizIcon sx={{ fontSize: '14px !important' }} />}
        onDelete={handleClick}
        sx={{
          bgcolor: '#09090c',
          border: '1px solid #27272a',
          color: '#a1a1aa',
          fontSize: '0.72rem',
          height: 26,
          cursor: 'pointer',
          '&:hover': { borderColor: '#3f3f46' },
        }}
      />

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            sx: {
              bgcolor: '#09090c',
              border: '1px solid #27272a',
              borderRadius: 2,
              minWidth: 220,
              mt: 1,
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="caption" sx={{ color: '#52525b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Select Network
          </Typography>
        </Box>
        <Divider sx={{ borderColor: '#18181b' }} />

        {(Object.keys(networks) as NetworkId[]).map((id) => {
          const cfg = networks[id];
          const isActive = id === network.networkId;
          const netColor = NETWORK_COLORS[id] ?? '#71717a';

          return (
            <MenuItem
              key={id}
              onClick={() => handleSelect(id)}
              selected={isActive}
              sx={{
                py: 1.2,
                '&.Mui-selected': { bgcolor: '#18181b' },
                '&:hover': { bgcolor: '#1a1a1e' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 28 }}>
                <CircleIcon sx={{ fontSize: 10, color: netColor }} />
              </ListItemIcon>
              <ListItemText
                primary={cfg.label}
                secondary={id === 'undeployed' ? 'localhost' : `${id}.midnight.network`}
                slotProps={{
                  primary: { sx: { color: '#e4e4e7', fontSize: '0.85rem', fontWeight: isActive ? 600 : 400 } },
                  secondary: { sx: { color: '#52525b', fontSize: '0.7rem' } },
                }}
              />
              {cfg.explorer && (
                <OpenInNewIcon
                  sx={{ fontSize: 14, color: '#3f3f46', ml: 1 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(cfg.explorer!, '_blank');
                  }}
                />
              )}
            </MenuItem>
          );
        })}

        {network.faucet && (
          <>
            <Divider sx={{ borderColor: '#18181b' }} />
            <MenuItem
              onClick={() => {
                window.open(network.faucet!, '_blank');
                handleClose();
              }}
              sx={{ py: 1 }}
            >
              <ListItemText
                primary="Get Test Tokens"
                slotProps={{ primary: { sx: { color: '#22c55e', fontSize: '0.8rem' } } }}
              />
              <OpenInNewIcon sx={{ fontSize: 14, color: '#3f3f46' }} />
            </MenuItem>
          </>
        )}
      </Menu>
    </>
  );
};
