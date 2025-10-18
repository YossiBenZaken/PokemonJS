import { Box, Paper, Typography } from "@mui/material";
import {
  Coins,
  Database,
  Mail,
  Search,
  Shield,
  Users,
} from "lucide-react";

import Grid from "@mui/material/Grid"; // <-- וודא שזה ככה
import React from "react";
import { useGame } from "../../contexts/GameContext";
import { useNavigate } from "react-router-dom";

interface Action {
  label: string;
  level: number;
  path: string;
  icon?: React.ReactNode;
}

const actions: Action[] = [
  { label: "נהל צוות", level: 3, path: "/admin/team", icon: <Users /> },
  {
    label: "חסום חשבון",
    level: 2,
    path: "/admin/block-account",
    icon: <Shield />,
  },
  { label: "חסום משתמש", level: 2, path: "/admin/block-player", icon: <Shield /> },
  { label: "חפש לפי IP", level: 1, path: "/admin/search-ip", icon: <Search /> },
  { label: "איסור IP", level: 2, path: "/admin/ip-ban", icon: <Shield /> },
  {
    label: "ריבוי חשבונות",
    level: 1,
    path: "/admin/multi-accounts",
    icon: <Users />,
  },
  {
    label: "יומני בנק",
    level: 1,
    path: "/admin/bank-logs",
    icon: <Database />,
  },
  {
    label: "יומני שוק",
    level: 1,
    path: "/admin/market-logs",
    icon: <Database />,
  },
  {
    label: "שלח הודעה רשמית",
    level: 3,
    path: "/admin/official-msg",
    icon: <Mail />,
  },
  {
    label: "הוסף פוקימון חדש",
    level: 3,
    path: "/admin/add-pokemon",
    icon: <Database />,
  },
  {
    label: "ביצה ראשונית",
    level: 3,
    path: "/admin/initial-egg",
    icon: <Database />,
  },
  { label: "פוקימון", level: 3, path: "/admin/pokemon", icon: <Database /> },
  {
    label: "תרומה המונית",
    level: 3,
    path: "/admin/mass-donation",
    icon: <Coins />,
  },
  { label: "קונפיגורציה", level: 2, path: "/admin/config", icon: <Database /> },
];

export default function AdminPanel() {
  const { selectedCharacter } = useGame();
  const navigate = useNavigate();
  const adminLevel = selectedCharacter?.admin!;
  const available = actions.filter((a) => a.level <= adminLevel);
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" textAlign="center" mb={3}>
        פאנל ניהול (רמה {adminLevel})
      </Typography>

      <Grid container spacing={2}>
        {available.map((action, i) => (
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3,
              lg: 2,
            }}
            key={i}
          >
            <Paper
              elevation={3}
              onClick={() => navigate(action.path)}
              sx={{
                p: 2,
                textAlign: "center",
                cursor: "pointer",
                transition: "0.15s",
                borderRadius: 2,
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 20px rgba(2,6,23,0.35)",
                },
              }}
            >
              <Box display="flex" flexDirection="column" alignItems="center">
                <Box sx={{ mb: 1 }}>{action.icon}</Box>
                <Typography variant="subtitle1">{action.label}</Typography>
                <Typography variant="caption" color="text.secondary">
                  רמה {action.level}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
