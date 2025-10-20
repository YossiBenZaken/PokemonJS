import {
  AppBar,
  Button,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  LinearProgress,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Badge,
  BellRing,
  ChartColumnIncreasing,
  Coins,
  Computer,
  Fish,
  Gavel,
  Gem,
  Home,
  Inbox,
  Info,
  LogOut,
  Map,
  Menu as MenuIcon,
  Package,
  Squirrel,
  Swords,
  UserStar,
  Users,
} from "lucide-react";
import { Badges, Events, UserMenu, UserMenuItem } from "./styled";
import {
  DailyBonusResponse,
  dailyBonus,
  getAssets,
} from "../../api/system.api";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import Snackbar, { SnackbarCloseReason } from "@mui/material/Snackbar";
import { styled, useTheme } from "@mui/material/styles";

import Alert from "@mui/material/Alert";
import { AuthToken } from "../../api/auth.api";
import { Box } from "@mui/system";
import { getDataGrow } from "../../api/battle.api";
import { socket } from "../../App";
import { useBattle } from "../../contexts/BattleContext";
import { useGame } from "../../contexts/GameContext";

const drawerWidth = 220;

// Drawer פתוח
const OpenedDrawer = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  "& .MuiDrawer-paper": {
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: "hidden",
    background: "#1e293b",
    color: "#e2e8f0",
    border: "none",
  },
}));

// Drawer סגור (collapsed)
const ClosedDrawer = styled(Drawer)(({ theme }) => ({
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  "& .MuiDrawer-paper": {
    width: theme.spacing(8),
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: "hidden",
    background: "#1e293b",
    color: "#e2e8f0",
    border: "none",
  },
}));

export const Header: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [open, setOpen] = useState<boolean>(false);
  const [drawer, setDrawer] = useState<boolean>(false);
  const [dailyBonusDetails, setDailyBonusDetails] =
    useState<DailyBonusResponse>();
  const location = useLocation();
  const [notification, setNotification] = useState(0);
  const [unreadMessages, seUnreadMessages] = useState(0);
  const {
    selectedCharacter,
    setSelectedCharacter,
    logoutFromGame,
    setIsLoggedIn,
    isLoggedIn,
    ranks,
    setRanks,
    setMyPokemons,
    setKarakters,
    setAttacks,
    setAbilities,
    setItemInfo,
    setConfig,
    config,
  } = useGame();
  const { setPokemonEvolve } = useBattle();
  const navigationItems: { path: string; label: string; icon: any }[] = [
    { path: "/", label: "בית", icon: <Home size={20} /> },
    { path: "/box", label: "הפוקימונים", icon: <Computer size={20} /> },
    { path: "/town", label: "מחוז", icon: <Map size={20} /> },
    { path: "/items", label: "חפצים", icon: <Package size={20} /> },
    { path: "/house-shop", label: "מוכר הבתים", icon: <Home size={20} /> },
    {
      path: "/statistics",
      label: "סטטיסטיקות",
      icon: <ChartColumnIncreasing size={20} />,
    },
    { path: "/badges", label: "תגים", icon: <Badge size={20} /> },
    { path: "/fishing", label: "דיג", icon: <Fish size={20} /> },
    { path: "/judge", label: "שפוט", icon: <Gavel size={20} /> },
    { path: "/safari", label: "ספארי", icon: <Squirrel size={20} /> },
    { path: "/attack/map", label: "מפה", icon: <Map size={20} /> },
    { path: "/information", label: "מידע", icon: <Info size={20} /> },
    { path: "/npc", label: "קרב עם מאמן", icon: <Swords size={20} /> },
  ];

  if (selectedCharacter && selectedCharacter.admin! > 0) {
    navigationItems.push({
      path: "/admin",
      label: "פאנל ניהול",
      icon: <UserStar size={20} />,
    });
  }

  const excludeLocations = ['/my-characters'];

  useEffect(() => {
    const checkAuth = async () => {
      const response = await AuthToken();
      if (response.success) {
        setNotification(response.data.eventsCount);
        seUnreadMessages(response.data.unreadMessage);
        setSelectedCharacter(response.data.user);
        setIsLoggedIn(true);
      } else {
        setSelectedCharacter(null);
        setIsLoggedIn(false);
      }
    };

    checkAuth();
  }, [setSelectedCharacter, setIsLoggedIn]);

  useEffect(() => {
    let interval: NodeJS.Timer;
    if (isLoggedIn) {
      interval = setInterval(updateCharacter, 1e4); // כל 10 שניות
    }
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  useEffect(() => {
    getAssets().then((res) => {
      setRanks(res.data.ranks);
      setKarakters(res.data.karakters);
      setAttacks(res.data.attacks);
      setAbilities(res.data.abilities);
      setItemInfo(res.data.itemInfo);
      setConfig(res.data.config);
    });
  }, [setAbilities, setAttacks, setItemInfo, setKarakters, setRanks]);

  useEffect(() => {
    if (selectedCharacter?.user_id) {
      socket.emit(
        "getMyPokemons",
        selectedCharacter.user_id,
        (response: any) => {
          const haveDecision = response.data.myPokemon.find(
            (poke: any) => poke.decision != null && poke.decision !== ""
          );
          setMyPokemons(response.data.myPokemon);
          if (
            haveDecision &&
            ![
              "/attack/wild",
              "/attack/trainer",
              "/poke-new-attack",
              "/poke-evolve",
            ].includes(location.pathname)
          ) {
            getDataGrow().then((res) => {
              setPokemonEvolve(res);
              if (haveDecision.decision === "waiting_evo") {
                navigate("/poke-evolve");
              } else if (haveDecision.decision === "waiting_attack") {
                navigate("/poke-new-attack");
              }
            });
          }
        }
      );
    }
  }, [selectedCharacter, setMyPokemons]);

  useEffect(() => {
    if (selectedCharacter) {
      if (
        selectedCharacter.page === "trainer-attack" &&
        location.pathname !== "/attack/trainer"
      ) {
        navigate("/attack/trainer");
      } else if (
        selectedCharacter.page === "attack" &&
        location.pathname !== "/attack/wild" && !excludeLocations.includes(location.pathname)
      ) {
        navigate("/attack/wild");
      }
    }
  }, [selectedCharacter, location.pathname, navigate]);

  const updateCharacter = async () => {
    socket.emit("getUserInfo", selectedCharacter?.user_id, (response: any) => {
      if (response.success) {
        setNotification(response.data.eventsCount);
        seUnreadMessages(response.data.unreadMessage);
        setSelectedCharacter(response.data.user);
        setIsLoggedIn(true);
      } else {
        setSelectedCharacter(null);
        setIsLoggedIn(false);
      }
    });
  };

  const isActiveRoute = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleLogout = async () => {
    logoutFromGame();
    setIsLoggedIn(false);
    handleClose();
  };

  const handleClose = () => {
    setIsUserMenuOpen(false);
  };

  const rankPercent = () => {
    if (
      selectedCharacter?.rankexp &&
      selectedCharacter.rankexpnecessary &&
      selectedCharacter.rankexp > 0
    ) {
      return Math.round(
        selectedCharacter.rankexp / selectedCharacter.rankexpnecessary
      );
    }
    return 0;
  };

  const catchPokemonPercent = () => {
    if (!selectedCharacter?.pok_possession) return 0;
    const arrayOfPokemon = selectedCharacter.pok_possession
      .split(",")
      .filter(Boolean);
    const uniquePokemon = Array.from(new Set(arrayOfPokemon));
    // נניח שיש 151 פוקימונים במשחק, אפשר לשנות לפי הצורך
    const totalPokemon = 1000;
    return Math.round((uniquePokemon.length / totalPokemon) * 100);
  };

  function isSeason() {
    const month = new Date().getMonth() + 1; // getMonth() מחזיר 0–11, לכן מוסיפים 1
    let season_act = "";
    let season_number = 0;

    if ([1, 5, 9].includes(month)) {
      season_act = "אביב";
      season_number = 1;
    } else if ([2, 6, 10].includes(month)) {
      season_act = "קיץ";
      season_number = 2;
    } else if ([3, 7, 11].includes(month)) {
      season_act = "סתיו";
      season_number = 3;
    } else if ([4, 8, 12].includes(month)) {
      season_act = "חורף";
      season_number = 4;
    }

    return [season_act, season_number];
  }

  const getDailyBonus = async () => {
    const response = await dailyBonus();
    setDailyBonusDetails(response);
    setOpen(true);
  };

  const handleSnackBarClose = (
    event?: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  const [seasonName, seasonNumber] = isSeason();
  const bonusArray = ["Double", "Triple", "Quadruple"];
  const expConfig = config.find((c) => c.config === "exp");
  const silverConfig = config.find((c) => c.config === "silver");
  return (
    <>
      <Snackbar
        open={open}
        autoHideDuration={5000}
        onClose={handleSnackBarClose}
        dir="rtl"
        anchorOrigin={{ horizontal: "center", vertical: "top" }}
      >
        <Alert
          severity={dailyBonusDetails?.success ? "success" : "error"}
          sx={{ width: "100%" }}
          dir="rtl"
          icon={false}
          slots={{
            action: undefined,
            closeButton: undefined,
          }}
        >
          {dailyBonusDetails && (
            <span
              dangerouslySetInnerHTML={{ __html: dailyBonusDetails.message }}
            />
          )}
        </Alert>
      </Snackbar>
      <Box
        sx={{ display: "flex", direction: "ltr" }}
        onClick={() => isUserMenuOpen && setIsUserMenuOpen(false)}
      >
        <CssBaseline />

        <AppBar
          position="fixed"
          sx={{
            background: "#0f172a",
            color: "white",
            zIndex: theme.zIndex.drawer + 1,
            direction: "ltr",
          }}
        >
          <Toolbar>
            {isLoggedIn && (
              <IconButton
                color="inherit"
                edge="start"
                onClick={() => setDrawer(!drawer)}
                sx={{ marginLeft: 2 }}
              >
                <MenuIcon size={22} />
              </IconButton>
            )}
            <Typography variant="h6" noWrap component="div">
              פוקימון אונליין
            </Typography>
            <Events>
              <img
                src={require(`../../assets/images/icons/avatar/${seasonNumber}-season.png`)}
                title={"במהלך החודש הזה אנחנו בתחנה " + seasonName}
                alt={"במהלך החודש הזה אנחנו בתחנה " + seasonName}
                style={{
                  width: 49,
                  marginTop: -3,
                  marginRight: -3,
                }}
              />
              {selectedCharacter &&
                selectedCharacter.quest_1 + selectedCharacter.quest_2 < 2 && (
                  <>
                    <Badges
                      style={{
                        float: "right",
                        marginLeft: -20,
                        marginTop: 23,
                        zIndex: 100,
                        position: "relative",
                        cursor: "pointer",
                        width: 13,
                        height: 13,
                        lineHeight: "11px",
                        fontSize: 8,
                      }}
                      onClick={() => navigate("/daily-quests")}
                    >
                      {2 -
                        (selectedCharacter["quest_1"] +
                          selectedCharacter["quest_2"])}
                    </Badges>
                    <NavLink to={"/daily_quests"} style={{ display: "block" }}>
                      <img
                        src={require('../../assets/images/icons/avatar/quests.png')}
                        title="לחץ כאן כדי לצפות במשימות היומיות שלך."
                        alt="לחץ כאן כדי לצפות במשימות היומיות שלך."
                      />
                    </NavLink>
                  </>
                )}
              {selectedCharacter &&
                selectedCharacter.daily_bonus + 86400 <
                  new Date().getTime() / 1000 && (
                  <img
                    src={require("../../assets/images/icons/avatar/pokeball.png")}
                    alt="לחץ כאן כדי לקבל את הבונוס היומי שלך."
                    title="לחץ כאן כדי לקבל את הבונוס היומי שלך."
                    onClick={getDailyBonus}
                  />
                )}
              {expConfig &&
                Number(expConfig.valor) > 1 &&
                Number(expConfig.valor) < 5 && (
                  <img
                    src={require(`../../assets/images/icons/avatar/${expConfig.valor}x-exp.png`)}
                    title={`קמפיין ${
                      bonusArray[Number(expConfig.valor) - 2]
                    } EXP בעיצומו!`}
                    alt={`קמפיין ${
                      bonusArray[Number(expConfig.valor) - 2]
                    } EXP בעיצומו!`}
                  />
                )}
              {silverConfig &&
                Number(silverConfig.valor) > 1 &&
                Number(silverConfig.valor) < 5 && (
                  <img
                    src={require(`../../assets/images/icons/avatar/${silverConfig.valor}x-silver.png`)}
                    title={`קמפיין ${
                      bonusArray[Number(silverConfig.valor) - 2]
                    } סילבר בעיצומו!`}
                    alt={`קמפיין ${
                      bonusArray[Number(silverConfig.valor) - 2]
                    } סילבר בעיצומו!`}
                  />
                )}
            </Events>
            {isLoggedIn && selectedCharacter && (
              <>
                <Typography
                  sx={{
                    marginLeft: "auto",
                    fontSize: "0.9rem",
                    cursor: "pointer",
                  }}
                  onClick={toggleUserMenu}
                >
                  שלום, {selectedCharacter.username}
                </Typography>
                {isUserMenuOpen && (
                  <UserMenu>
                    <UserMenuItem
                      onClick={() => {
                        navigate("/my-characters");
                        handleClose();
                      }}
                    >
                      <Users size={16} />
                      <span>השחקנים שלי</span>
                    </UserMenuItem>
                    <hr
                      style={{
                        margin: "0.5rem 0",
                        border: "none",
                        borderTop: "1px solid #e5e7eb",
                      }}
                    />
                    <UserMenuItem onClick={handleLogout}>
                      <LogOut size={16} />
                      <span>התנתק</span>
                    </UserMenuItem>
                  </UserMenu>
                )}
              </>
            )}
          </Toolbar>
        </AppBar>
        {/* Sidebar רק אם מחובר */}
        {isLoggedIn && (
          <>
            {drawer ? (
              <OpenedDrawer variant="permanent" anchor="left">
                <Toolbar />
                <List>
                  {/* פרטי השחקן */}
                  <Box sx={{ p: 2 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, cursor: "pointer" }}
                      onClick={() => {
                        navigate("/profile/" + selectedCharacter?.username);
                      }}
                    >
                      {selectedCharacter?.username}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                      מחוז: {selectedCharacter?.world}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mt: 1,
                        mb: 0.5,
                        fontSize: "0.9rem",
                      }}
                    >
                      <span>
                        רמה {selectedCharacter?.rank} -{" "}
                        {
                          ranks?.find((r) => r.id === selectedCharacter?.rank)
                            ?.naam
                        }{" "}
                      </span>
                      <span>{rankPercent()}%</span>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={rankPercent()}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: "#334155",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: "#38bdf8",
                        },
                      }}
                    />

                    <Divider sx={{ my: 1.5, background: "#475569" }} />

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 0.5,
                      }}
                    >
                      <Coins size={16} />
                      <Typography variant="body2">
                        סילבר: {selectedCharacter?.silver?.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 0.5,
                      }}
                    >
                      <Gem size={16} />
                      <Typography variant="body2">
                        גולד: {selectedCharacter?.gold?.toLocaleString()}
                      </Typography>
                    </Box>

                    <Typography variant="body2" sx={{ mt: 1 }}>
                      פוקימונים: {catchPokemonPercent()}%
                    </Typography>

                    <Divider sx={{ mt: 2, mb: 1.5, background: "#475569" }} />
                  </Box>

                  {navigationItems.map((item) => (
                    <ListItemButton
                      key={item.path}
                      component={Link}
                      to={item.path}
                      selected={isActiveRoute(item.path)}
                      sx={{
                        color: isActiveRoute(item.path) ? "#fff" : "#cbd5e1",
                        "&.Mui-selected": {
                          backgroundColor: "#334155",
                        },
                      }}
                    >
                      <ListItemIcon sx={{ color: "inherit", minWidth: 36 }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                      />
                    </ListItemButton>
                  ))}
                  <ListItemButton
                    component={Link}
                    to={"/events"}
                    selected={isActiveRoute("/events")}
                    sx={{
                      color: isActiveRoute("/events") ? "#fff" : "#cbd5e1",
                      "&.Mui-selected": {
                        backgroundColor: "#334155",
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: "inherit", minWidth: 36 }}>
                      <BellRing size={20} />
                    </ListItemIcon>
                    <ListItemText
                      primary={`התראות ${
                        notification > 0 ? `(${notification})` : ""
                      }`}
                    />
                  </ListItemButton>
                  <ListItemButton
                    component={Link}
                    to={"/inbox"}
                    selected={isActiveRoute("/inbox")}
                    sx={{
                      color: isActiveRoute("/inbox") ? "#fff" : "#cbd5e1",
                      "&.Mui-selected": {
                        backgroundColor: "#334155",
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: "inherit", minWidth: 36 }}>
                      <Inbox size={20} />
                    </ListItemIcon>
                    <ListItemText
                      primary={`הודעות ${
                        unreadMessages > 0 ? `(${unreadMessages})` : ""
                      }`}
                    />
                  </ListItemButton>
                </List>
              </OpenedDrawer>
            ) : (
              <ClosedDrawer variant="permanent" anchor="left">
                <Toolbar />
                <List>
                  {navigationItems.map((item) => (
                    <Tooltip
                      title={item.label}
                      placement="left"
                      arrow
                      key={item.path}
                    >
                      <ListItemButton
                        component={Link}
                        to={item.path}
                        selected={isActiveRoute(item.path)}
                        sx={{
                          justifyContent: "center",
                          color: isActiveRoute(item.path) ? "#fff" : "#cbd5e1",
                          "&.Mui-selected": {
                            backgroundColor: "#334155",
                          },
                        }}
                      >
                        <ListItemIcon sx={{ color: "inherit", minWidth: 0 }}>
                          {item.icon}
                        </ListItemIcon>
                      </ListItemButton>
                    </Tooltip>
                  ))}
                  <Tooltip
                    title={`התראות ${
                      notification > 0 ? `(${notification})` : ""
                    }`}
                    placement="left"
                    arrow
                  >
                    <ListItemButton
                      component={Link}
                      to={"/events"}
                      selected={isActiveRoute("/events")}
                      sx={{
                        justifyContent: "center",
                        color: isActiveRoute("/events") ? "#fff" : "#cbd5e1",
                        "&.Mui-selected": {
                          backgroundColor: "#334155",
                        },
                      }}
                    >
                      <ListItemIcon sx={{ color: "inherit", minWidth: 0 }}>
                        <BellRing size={20} />
                      </ListItemIcon>
                    </ListItemButton>
                  </Tooltip>
                  <Tooltip
                    title={`הודעות ${
                      unreadMessages > 0 ? `(${unreadMessages})` : ""
                    }`}
                    placement="left"
                    arrow
                  >
                    <ListItemButton
                      component={Link}
                      to={"/inbox"}
                      selected={isActiveRoute("/inbox")}
                      sx={{
                        justifyContent: "center",
                        color: isActiveRoute("/inbox") ? "#fff" : "#cbd5e1",
                        "&.Mui-selected": {
                          backgroundColor: "#334155",
                        },
                      }}
                    >
                      <ListItemIcon sx={{ color: "inherit", minWidth: 0 }}>
                        <Inbox size={20} />
                      </ListItemIcon>
                    </ListItemButton>
                  </Tooltip>
                </List>
              </ClosedDrawer>
            )}
          </>
        )}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            bgcolor: "#f1f5f9",
            minHeight: "95vh",
            padding: "0 0 0 64px",
            marginTop: "64px",
            textAlign: "start",
          }}
        >
          {!isLoggedIn &&
          !["/login", "/signup", "/my-characters", "/new-character"].includes(
            location.pathname
          ) ? (
            <Box textAlign="center">
              <Typography variant="h5" gutterBottom>
                ברוך הבא לפוקימון אונליין!
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                התחבר כדי לגשת ללוח המשחק, לאירועים ולפוקימונים שלך.
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  to="/login"
                >
                  התחבר
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  component={Link}
                  to="/signup"
                >
                  הירשם
                </Button>
              </Box>
            </Box>
          ) : (
            children
          )}
        </Box>
      </Box>
    </>
  );
};
