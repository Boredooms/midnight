import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Stack,
  Chip,
  Divider,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import ScienceIcon from "@mui/icons-material/Science";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import SettingsIcon from "@mui/icons-material/Settings";
import HomeIcon from "@mui/icons-material/Home";
import MenuIcon from "@mui/icons-material/Menu";
import LockIcon from "@mui/icons-material/Lock";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { NetworkSwitcher } from "./NetworkSwitcher";
import { useWallet } from "../contexts/WalletContext";

const SIDEBAR_WIDTH = 260;

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  group?: string;
  external?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/", icon: <HomeIcon />, group: "General" },
  { label: "Elections", href: "/app", icon: <HowToVoteIcon />, group: "General" },
  { label: "Test Suite", href: "/tests", icon: <ScienceIcon />, group: "General" },
  { label: "Docs", href: "https://docs.midnight.network", icon: <OpenInNewIcon />, group: "Support", external: true },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const wallet = useWallet();
  const isMobile = useMediaQuery("(max-width:900px)");
  const [mobileOpen, setMobileOpen] = useState(false);

  const groups = [...new Set(NAV_ITEMS.map((i) => i.group))];

  const sidebar = (
    <Box
      sx={{
        width: SIDEBAR_WIDTH,
        height: "100%",
        bgcolor: "#0a0a0c",
        borderRight: "1px solid #18181b",
        display: "flex",
        flexDirection: "column",
        py: 3,
        px: 2,
      }}
    >
      {/* Logo */}
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", px: 1.5, mb: 1, cursor: "pointer" }} onClick={() => navigate("/")}>
        <Box sx={{ width: 28, height: 28, borderRadius: "8px", bgcolor: "rgba(167,139,250,0.15)", display: "grid", placeItems: "center" }}>
          <LockIcon sx={{ fontSize: 16, color: "#a78bfa" }} />
        </Box>
        <Typography sx={{ fontWeight: 700, fontSize: "1rem", letterSpacing: "-0.02em", color: "#f4f4f5" }}>
          Midnight
        </Typography>
        <Chip label="dApp" size="small" sx={{ height: 20, fontSize: "0.65rem", bgcolor: "rgba(167,139,250,0.1)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.2)" }} />
      </Stack>

      {/* Nav groups */}
      <Box sx={{ flex: 1, mt: 3 }}>
        {groups.map((group) => (
          <Box key={group} sx={{ mb: 2.5 }}>
            <Typography sx={{ px: 1.5, mb: 1, fontSize: "0.68rem", fontWeight: 600, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {group}
            </Typography>
            <List disablePadding>
              {NAV_ITEMS.filter((i) => i.group === group).map((item) => {
                const active = location.pathname === item.href;
                return (
                  <ListItemButton
                    key={item.label}
                    onClick={() => {
                      if (item.external) {
                        window.open(item.href, "_blank");
                      } else {
                        navigate(item.href);
                        setMobileOpen(false);
                      }
                    }}
                    sx={{
                      borderRadius: "10px",
                      mb: 0.5,
                      py: 1,
                      px: 1.5,
                      bgcolor: active ? "rgba(167,139,250,0.08)" : "transparent",
                      "&:hover": { bgcolor: "rgba(255,255,255,0.04)" },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 32, color: active ? "#a78bfa" : "#52525b" }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      slotProps={{
                        primary: {
                          sx: { fontSize: "0.85rem", fontWeight: active ? 600 : 400, color: active ? "#f4f4f5" : "#a1a1aa" },
                        },
                      }}
                    />
                    {item.external && <OpenInNewIcon sx={{ fontSize: 12, color: "#3f3f46" }} />}
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      {/* Footer */}
      <Divider sx={{ borderColor: "#18181b", mb: 2 }} />
      <Stack spacing={1.5} sx={{ px: 1 }}>
        <NetworkSwitcher />
        {/* Wallet info */}
        <Box sx={{ p: 1.5, borderRadius: "10px", bgcolor: wallet.status === "connected" ? "rgba(34,197,94,0.05)" : "transparent", border: `1px solid ${wallet.status === "connected" ? "rgba(34,197,94,0.15)" : "#18181b"}` }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.5 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: wallet.status === "connected" ? "#22c55e" : "#52525b" }} />
            <Typography sx={{ fontSize: "0.72rem", color: wallet.status === "connected" ? "#22c55e" : "#71717a", fontWeight: 500 }}>
              {wallet.status === "connected" ? wallet.walletName || "Connected" : "Not connected"}
            </Typography>
          </Stack>
          {wallet.status === "connected" && wallet.shieldedAddress && (
            <Typography sx={{ fontSize: "0.65rem", color: "#52525b", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", pl: 2 }}>
              {wallet.shieldedAddress}
            </Typography>
          )}
        </Box>
      </Stack>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "#030304" }}>
      {/* Sidebar — desktop */}
      {!isMobile && (
        <Box sx={{ width: SIDEBAR_WIDTH, flexShrink: 0 }}>
          {sidebar}
        </Box>
      )}

      {/* Sidebar — mobile drawer */}
      {isMobile && (
        <Drawer
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          slotProps={{ paper: { sx: { bgcolor: "#0a0a0c", borderRight: "1px solid #18181b" } } }}
        >
          {sidebar}
        </Drawer>
      )}

      {/* Main content */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Topbar */}
        <Box
          sx={{
            height: 56,
            borderBottom: "1px solid #18181b",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 3,
            flexShrink: 0,
            bgcolor: "#09090c",
          }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            {isMobile && (
              <IconButton onClick={() => setMobileOpen(true)} sx={{ color: "#a1a1aa" }}>
                <MenuIcon />
              </IconButton>
            )}
            <Typography sx={{ fontSize: "0.8rem", color: "#52525b" }}>
              Midnight
            </Typography>
            <Typography sx={{ fontSize: "0.8rem", color: "#3f3f46" }}>|</Typography>
            <Typography sx={{ fontSize: "0.8rem", color: "#52525b" }}>
              Confidential Voting
            </Typography>
            <Typography sx={{ fontSize: "0.8rem", color: "#3f3f46" }}>|</Typography>
            <Typography sx={{ fontSize: "0.8rem", color: "#e4e4e7", fontWeight: 500 }}>
              {location.pathname === "/tests" ? "Test Suite" : "Elections"}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
            <Chip
              label={wallet.status === "connected" ? "Connected" : "Connect Wallet"}
              size="small"
              onClick={wallet.status === "connected" ? wallet.disconnect : wallet.connect}
              icon={<AccountBalanceWalletIcon sx={{ fontSize: "14px !important", color: wallet.status === "connected" ? "#22c55e !important" : "#52525b !important" }} />}
              sx={{
                bgcolor: wallet.status === "connected" ? "rgba(34,197,94,0.08)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${wallet.status === "connected" ? "rgba(34,197,94,0.2)" : "#18181b"}`,
                color: wallet.status === "connected" ? "#22c55e" : "#a1a1aa",
                fontSize: "0.75rem",
                cursor: "pointer",
              }}
            />
          </Stack>
        </Box>

        {/* Page content */}
        <Box sx={{ flex: 1, overflowY: "auto", overflowX: "hidden", p: { xs: 2, md: 4 }, WebkitOverflowScrolling: "touch" }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
