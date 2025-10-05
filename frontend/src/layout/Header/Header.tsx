import {
  Add,
  AuthButton,
  AuthLink,
  AuthSection,
  Badges,
  Events,
  Golds,
  HeaderContainer,
  HeaderContent,
  HeaderHub,
  HeaderHubContainer,
  Hub,
  HubHud,
  HubHudLine,
  HubLogo,
  MyPokemon,
  NavLink,
  Navigation,
  Silvers,
  UserMenu,
  UserMenuItem,
} from "./styled";
import {
  Badge,
  BellRing,
  BookOpen,
  ChartColumnIncreasing,
  Computer,
  Fish,
  Gavel,
  Home,
  Info,
  LogOut,
  Map,
  Package,
  Squirrel,
  User,
  Users,
} from "lucide-react";
import {
  DailyBonusResponse,
  dailyBonus,
  getAssets,
} from "../../api/system.api";
import { Link, useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import Snackbar, { SnackbarCloseReason } from "@mui/material/Snackbar";

import Alert from "@mui/material/Alert";
import { AuthToken } from "../../api/auth.api";
import { getMyPokemons } from "../../api/character.api";
import messsages from "../../assets/images/layout/mensagens.png";
import profile from "../../assets/images/layout/perfil.png";
import { useGame } from "../../contexts/GameContext";

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [inHand, setInHand] = useState<number>(0);
  const [open, setOpen] = useState<boolean>(false);
  const [dailyBonusDetails, setDailyBonusDetails] =
    useState<DailyBonusResponse>();
  const location = useLocation();
  const {
    selectedCharacter,
    setSelectedCharacter,
    logoutFromGame,
    setIsLoggedIn,
    isLoggedIn,
    ranks,
    setRanks,
    myPokemons,
    setMyPokemons,
    setKarakters,
    setAttacks,
    setAbilities,
    setItemInfo,
    setConfig,
    config,
  } = useGame();
  const navigationItems = [
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
  ];

  useEffect(() => {
    const checkAuth = async () => {
      const response = await AuthToken();
      if (response.success) {
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
      getMyPokemons(selectedCharacter?.user_id).then((res) => {
        setMyPokemons(res.data.myPokemon);
        setInHand(res.data.myPokemon.length);
      });
    }
  }, [selectedCharacter, setMyPokemons]);

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
      selectedCharacter.rankexpnodig &&
      selectedCharacter.rankexp > 0
    ) {
      return Math.round(
        selectedCharacter.rankexp / selectedCharacter.rankexpnodig
      );
    }
    return 0;
  };

  const catchPokemonPercent = () => {
    if (!selectedCharacter?.pok_bezit) return 0;
    const arrayOfPokemon = selectedCharacter.pok_bezit
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
            closeButton: undefined
          }}
        >
          {dailyBonusDetails && (
            <span
              dangerouslySetInnerHTML={{ __html: dailyBonusDetails.message }}
            />
          )}
        </Alert>
      </Snackbar>
      <HeaderHubContainer>
        <HeaderHub>
          <Hub>
            <HubHud>
              <HubHudLine
                style={{
                  width: 600,
                  position: "absolute",
                  right: 0,
                  zIndex: 0,
                }}
              >
                <Link to={""}>
                  <HubLogo />
                </Link>
              </HubHudLine>
              <HubHudLine style={{ paddingLeft: 30 }}>
                <Silvers>
                  <Add />
                  <p>{selectedCharacter?.silver}</p>
                </Silvers>
              </HubHudLine>
              <HubHudLine style={{ paddingLeft: 30 }}>
                <Golds>
                  <Add />
                  <p>{selectedCharacter?.gold}</p>
                </Golds>
              </HubHudLine>

              <HubHudLine style={{ paddingLeft: 10 }}>
                <Link to={"inbox"}>
                  {/* <Badges
                    style={{
                      float: "left",
                      marginRight: -20,
                      marginTop: -8,
                      zIndex: 100,
                      position: "relative",
                    }}
                  >
                    2
                  </Badges> */}
                  <img src={messsages} alt="messages" />
                </Link>
              </HubHudLine>
              <HubHudLine>
                <img
                  src={profile}
                  alt="profile"
                  onClick={toggleUserMenu}
                  style={{ cursor: "pointer" }}
                />
                {isUserMenuOpen && (
                  <UserMenu>
                    <UserMenuItem
                      onClick={() => {
                        navigate("/profile/" + selectedCharacter?.username);
                        handleClose();
                      }}
                    >
                      <User size={16} />
                      <span>פרופיל</span>
                    </UserMenuItem>
                    <UserMenuItem
                      onClick={() => {
                        navigate("/my-characters");
                        handleClose();
                      }}
                    >
                      <Users size={16} />
                      <span>השחקנים שלי</span>
                    </UserMenuItem>
                    <UserMenuItem
                      onClick={() => {
                        navigate("/events");
                        handleClose();
                      }}
                    >
                      <BellRing size={16} />
                      <span>התראות</span>
                    </UserMenuItem>
                    <UserMenuItem>
                      <BookOpen size={16} />
                      <span>הפוקימונים שלי</span>
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
              </HubHudLine>
            </HubHud>
          </Hub>
          <Hub style={{ padding: 0 }}>
            <HubHud>
              <HubHudLine style={{ width: "100%" }}>
                <div
                  style={{
                    background: `url(${require("../../assets/images/characters/" +
                      (selectedCharacter?.character ?? "Ash") +
                      "/bar.png")}) no-repeat`,
                    borderRadius: 5,
                    float: "left",
                    direction: "ltr",
                  }}
                >
                  <div
                    style={{
                      background: `url(${require("../../assets/images/layout/player.png")}) no-repeat`,
                      width: 520,
                      height: 93,
                    }}
                  >
                    <ul
                      style={{
                        listStyle: "none",
                        paddingTop: 16,
                        color: "white",
                        fontSize: 12,
                        paddingInlineStart: 40,
                      }}
                    >
                      <li
                        style={{
                          paddingLeft: 103,
                          width: 224,
                          textAlign: "center",
                        }}
                      >
                        <Link to={"/profile/" + selectedCharacter?.username!}>
                          {selectedCharacter?.username}
                        </Link>
                      </li>
                      <li
                        style={{
                          paddingLeft: 103,
                          width: 224,
                          textAlign: "center",
                        }}
                      >
                        {selectedCharacter?.wereld}
                      </li>
                      <li
                        style={{
                          paddingLeft: 85,
                          width: 256,
                          textAlign: "center",
                        }}
                      >
                        {selectedCharacter?.rank} -{" "}
                        {
                          ranks?.find((r) => r.id === selectedCharacter?.rank)
                            ?.naam
                        }{" "}
                        ({rankPercent()}%)
                      </li>
                      <li
                        style={{
                          paddingLeft: 85,
                          width: 275,
                          textAlign: "center",
                          paddingTop: 2,
                        }}
                      >
                        {catchPokemonPercent()}% of all Pokémon
                      </li>
                    </ul>
                  </div>
                </div>
              </HubHudLine>
            </HubHud>
          </Hub>
          <Hub style={{ padding: 0 }}>
            <HubHud>
              <HubHudLine style={{ width: 240 }}>
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
                    selectedCharacter.quest_1 + selectedCharacter.quest_2 <
                      2 && (
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
                        <a
                          href="./daily_quests"
                          className="noanimate"
                          style={{ display: "block" }}
                        >
                          <img
                            src="/images/icons/avatar/quests.png"
                            title="לחץ כאן כדי לצפות במשימות היומיות שלך."
                            alt="לחץ כאן כדי לצפות במשימות היומיות שלך."
                          />
                        </a>
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
              </HubHudLine>
              <HubHudLine style={{ width: 280 }}>
                <MyPokemon>
                  {inHand > 0 &&
                    myPokemons.map((pokemon) => {
                      return (
                        <div className="icon" key={pokemon.id}>
                          <div
                            style={{
                              backgroundImage: `url(${require(`../../assets/images/${
                                pokemon.shiny === 1 ? "shiny" : "pokemon"
                              }/icon/${pokemon.wild_id}.gif`)})`,
                            }}
                          ></div>
                        </div>
                      );
                    })}
                  {[...Array(6 - inHand)].map((_, idx) => (
                    <div key={`empty-${idx}`} className="icon" />
                  ))}
                </MyPokemon>
              </HubHudLine>
            </HubHud>
          </Hub>
        </HeaderHub>
      </HeaderHubContainer>
      <HeaderContainer>
        <HeaderContent>
          {/* Desktop Navigation - Only show if logged in */}
          {isLoggedIn && (
            <Navigation>
              {navigationItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={isActiveRoute(item.path) ? "active" : ""}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </Navigation>
          )}

          {/* Right Section - User menu if logged in, Auth buttons if not */}
          {!isLoggedIn && (
            <AuthSection>
              <AuthLink to="/login">
                <AuthButton variant="outline">Login</AuthButton>
              </AuthLink>
              <AuthLink to="/signup">
                <AuthButton variant="primary">Sign Up</AuthButton>
              </AuthLink>
            </AuthSection>
          )}
        </HeaderContent>
      </HeaderContainer>
    </>
  );
};
