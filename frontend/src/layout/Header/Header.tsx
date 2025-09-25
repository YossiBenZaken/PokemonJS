import {
  Add,
  AuthButton,
  AuthLink,
  AuthSection,
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
  Fish,
  Gavel,
  Home,
  LogOut,
  Map,
  Package,
  User,
  Users
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";

import { AuthToken } from "../../api/auth.api";
import { getAssets } from "../../api/system.api";
import { getMyPokemons } from "../../api/character.api";
import messsages from "../../assets/images/layout/mensagens.png";
import profile from "../../assets/images/layout/perfil.png";
import { useGame } from "../../contexts/GameContext";

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [inHand, setInHand] = useState<number>(0);
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
    setKarakters
  } = useGame();
  const navigationItems = [
    { path: "/", label: "בית", icon: <Home size={20} /> },
    { path: "/town", label: "מחוז", icon: <Map size={20} /> },
    { path: "/items", label: "חפצים", icon: <Package size={20} /> },
    { path: "/house-shop", label: "מוכר הבתים", icon: <Home size={20} /> },
    { path: '/statistics', label: 'סטטיסטיקות', icon: <ChartColumnIncreasing size={20} />},
    { path: '/badges', label: 'תגים', icon: <Badge size={20} />},
    { path: '/fishing', label: 'דיג', icon: <Fish size={20} />},
    { path: '/judge', label: 'שפוט', icon: <Gavel size={20} />},
  ];

  useEffect(() => {
    const checkAuth = async () => {
      const response = await AuthToken();
      if (response.success) {
        setSelectedCharacter(response.data);
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
    });
  }, [setRanks]);

  useEffect(() => {
    if (selectedCharacter) {
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
  return (
    <>
      <HeaderHubContainer>
        <HeaderHub>
          <Hub>
            <HubHud>
              <HubHudLine
                style={{
                  width: 600,
                  position: "absolute",
                  right: 0,
                  zIndex: 1,
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
              <HubHudLine style={{ width: "45%" }} />
              <HubHudLine style={{ width: 160 }} />
              <HubHudLine style={{ width: 200 }}>
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
