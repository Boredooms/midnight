import React from "react";
import {
  Box,
  Typography,
  Stack,
  Chip,
  Divider,
  Grid,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ScienceIcon from "@mui/icons-material/Science";
import ShieldIcon from "@mui/icons-material/Shield";
import BlockIcon from "@mui/icons-material/Block";
import LockIcon from "@mui/icons-material/Lock";
import GavelIcon from "@mui/icons-material/Gavel";
import TimerIcon from "@mui/icons-material/Timer";

// ─────────────────────────────────────────────────────────────────────────────
// Test data — mirrors actual vitest output
// ─────────────────────────────────────────────────────────────────────────────

interface TestCase {
  name: string;
  duration: string;
}

interface TestGroup {
  title: string;
  icon: React.ReactNode;
  color: string;
  tests: TestCase[];
}

const TEST_GROUPS: TestGroup[] = [
  {
    title: "Circuit Logic",
    icon: <ScienceIcon sx={{ fontSize: 18 }} />,
    color: "#a78bfa",
    tests: [
      { name: "should create an election with correct title and duration", duration: "62ms" },
      { name: "should correctly tally votes for candidate 0", duration: "42ms" },
      { name: "should correctly tally votes for candidate 1", duration: "36ms" },
      { name: "should correctly determine winner when candidate A leads", duration: "54ms" },
      { name: "should correctly determine TIE when tallies are equal", duration: "55ms" },
    ],
  },
  {
    title: "State Transitions",
    icon: <BlockIcon sx={{ fontSize: 18 }} />,
    color: "#3b82f6",
    tests: [
      { name: "should start in UNINITIALIZED state", duration: "21ms" },
      { name: "should transition UNINITIALIZED → OPEN on createElection", duration: "29ms" },
      { name: "should transition OPEN → FINALIZED on finalizeElection", duration: "36ms" },
      { name: "should reject createElection when already initialized", duration: "28ms" },
      { name: "should reject vote when election is not OPEN", duration: "19ms" },
      { name: "should reject finalizeElection when not OPEN", duration: "18ms" },
      { name: "should increment sequence counter after finalization", duration: "37ms" },
    ],
  },
  {
    title: "Privacy",
    icon: <LockIcon sx={{ fontSize: 18 }} />,
    color: "#22c55e",
    tests: [
      { name: "should never expose voter secret key in ledger state", duration: "34ms" },
      { name: "should produce different public keys for same secret in different elections", duration: "60ms" },
      { name: "should not reveal vote choice in any public ledger field", duration: "33ms" },
    ],
  },
  {
    title: "Double-Vote Prevention",
    icon: <ShieldIcon sx={{ fontSize: 18 }} />,
    color: "#f59e0b",
    tests: [
      { name: "should reject a second vote from the same voter", duration: "39ms" },
      { name: "should allow different voters to vote in the same election", duration: "46ms" },
    ],
  },
  {
    title: "Access Control",
    icon: <GavelIcon sx={{ fontSize: 18 }} />,
    color: "#ef4444",
    tests: [
      { name: "should allow owner to emergency-finalize before deadline", duration: "34ms" },
      { name: "should reject non-owner from calling ownerFinalizeElection", duration: "25ms" },
      { name: "should reject invalid candidate index", duration: "26ms" },
    ],
  },
];

const TOTAL_TESTS = TEST_GROUPS.reduce((sum, g) => sum + g.tests.length, 0);

// ─────────────────────────────────────────────────────────────────────────────

const TestsPage: React.FC = () => {
  return (
    <Box sx={{ maxWidth: 900, mx: "auto" }}>
      {/* Header */}
      <Stack spacing={2} sx={{ mb: 4 }}>
        <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <CheckCircleIcon sx={{ color: "#22c55e", fontSize: 24 }} />
            <Typography sx={{ fontWeight: 700, fontSize: "1.4rem", color: "#f4f4f5", letterSpacing: "-0.02em" }}>
              Test Suite
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Chip label="vitest v4.1.10" size="small" sx={{ bgcolor: "#18181b", color: "#71717a", fontSize: "0.7rem", height: 24 }} />
            <Chip label="compact 0.31.1" size="small" sx={{ bgcolor: "#18181b", color: "#71717a", fontSize: "0.7rem", height: 24 }} />
          </Stack>
        </Stack>
        <Typography sx={{ color: "#71717a", fontSize: "0.88rem" }}>
          Confidential Voting Contract — Compact ZK Circuit Tests
        </Typography>
      </Stack>

      {/* Summary stats */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Box sx={{ p: 2.5, borderRadius: "14px", bgcolor: "#09090c", border: "1px solid #18181b" }}>
            <Typography sx={{ fontSize: "1.5rem", fontWeight: 700, color: "#22c55e" }}>{TOTAL_TESTS}</Typography>
            <Typography sx={{ fontSize: "0.75rem", color: "#71717a", mt: 0.5 }}>Tests Passed</Typography>
          </Box>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Box sx={{ p: 2.5, borderRadius: "14px", bgcolor: "#09090c", border: "1px solid #18181b" }}>
            <Typography sx={{ fontSize: "1.5rem", fontWeight: 700, color: "#f4f4f5" }}>0</Typography>
            <Typography sx={{ fontSize: "0.75rem", color: "#71717a", mt: 0.5 }}>Failed</Typography>
          </Box>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Box sx={{ p: 2.5, borderRadius: "14px", bgcolor: "#09090c", border: "1px solid #18181b" }}>
            <Typography sx={{ fontSize: "1.5rem", fontWeight: 700, color: "#f4f4f5" }}>5</Typography>
            <Typography sx={{ fontSize: "0.75rem", color: "#71717a", mt: 0.5 }}>Test Groups</Typography>
          </Box>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Box sx={{ p: 2.5, borderRadius: "14px", bgcolor: "#09090c", border: "1px solid #18181b" }}>
            <Stack direction="row" spacing={0.5} sx={{ alignItems: "baseline" }}>
              <Typography sx={{ fontSize: "1.5rem", fontWeight: 700, color: "#f4f4f5" }}>1.03</Typography>
              <Typography sx={{ fontSize: "0.8rem", color: "#71717a" }}>s</Typography>
            </Stack>
            <Typography sx={{ fontSize: "0.75rem", color: "#71717a", mt: 0.5 }}>Duration</Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Test groups */}
      <Stack spacing={2}>
        {TEST_GROUPS.map((group) => (
          <Box
            key={group.title}
            sx={{
              borderRadius: "14px",
              bgcolor: "#09090c",
              border: "1px solid #18181b",
              overflow: "hidden",
            }}
          >
            {/* Group header */}
            <Box sx={{ p: 2, borderBottom: "1px solid #18181b" }}>
              <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                  <Box sx={{ color: group.color }}>{group.icon}</Box>
                  <Typography sx={{ fontWeight: 700, fontSize: "0.88rem", color: "#f4f4f5" }}>
                    {group.title}
                  </Typography>
                  <Chip
                    label={`${group.tests.length}/${group.tests.length}`}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: "0.65rem",
                      fontWeight: 600,
                      bgcolor: `${group.color}15`,
                      color: group.color,
                      border: `1px solid ${group.color}30`,
                    }}
                  />
                </Stack>
                <TimerIcon sx={{ fontSize: 14, color: "#3f3f46" }} />
              </Stack>
            </Box>

            {/* Tests */}
            <Stack divider={<Divider sx={{ borderColor: "#18181b" }} />}>
              {group.tests.map((test) => (
                <Stack
                  key={test.name}
                  direction="row"
                  sx={{
                    alignItems: "center",
                    px: 2.5,
                    py: 1.4,
                    "&:hover": { bgcolor: "rgba(255,255,255,0.02)" },
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: 14, color: "#22c55e", mr: 1.5, flexShrink: 0 }} />
                  <Typography
                    sx={{ color: "#a1a1aa", fontSize: "0.8rem", flex: 1, fontFamily: "monospace", lineHeight: 1.5 }}
                  >
                    {test.name}
                  </Typography>
                  <Typography
                    sx={{ color: "#3f3f46", fontFamily: "monospace", fontSize: "0.72rem", ml: 2, flexShrink: 0 }}
                  >
                    {test.duration}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        ))}
      </Stack>

      {/* File path footer */}
      <Box sx={{ mt: 3, p: 2, borderRadius: "10px", bgcolor: "#09090c", border: "1px solid #18181b" }}>
        <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
          <Typography sx={{ color: "#3f3f46", fontFamily: "monospace", fontSize: "0.75rem" }}>
            contract/src/test/confidential-voting.test.ts
          </Typography>
          <Chip
            icon={<CheckCircleIcon sx={{ fontSize: "12px !important", color: "#22c55e !important" }} />}
            label="All passing"
            size="small"
            sx={{ height: 22, bgcolor: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", color: "#22c55e", fontSize: "0.7rem" }}
          />
        </Stack>
      </Box>
    </Box>
  );
};

export default TestsPage;
