import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { ThemeProvider, createTheme, useTheme } from "@mui/material/styles";

import AdminPage from "./pages/Admin";
import { AdminRoutes } from "./pages/Admin/routes";
import AttackMap from "./pages/Attack/AttackMap";
import { BadgeCase } from "./pages/Badges";
import { BattleProvider } from "./contexts/BattleContext";
import { CacheProvider } from "@emotion/react";
import { ChoosePokemonPage } from "./pages/ChoosePokemon";
import Cookies from "js-cookie";
import DailyQuestsPage from "./pages/DailyQuests";
import FishingPage from "./pages/Fishing";
import { Footer } from "./layout/Footer/Footer";
import { GameProvider } from "./contexts/GameContext";
import { Header } from "./layout/Header";
import { Home } from "./pages/Home";
import { HouseShopPage } from "./pages/HouseShop";
import { InboxRoutes } from "./pages/Inbox/routes";
import InformationPage from "./pages/Information";
import ItemsPage from "./pages/Items";
import { Judge } from "./pages/Judge";
import LeaderboardsPage from "./pages/Leaderboards";
import { LoginPage } from "./pages/Login";
import { MyCharactersPage } from "./pages/MyCharacters";
import { NewCharacterPage } from "./pages/NewCharacter";
import Notifications from "./pages/Notifications";
import NpcPage from "./pages/Npc";
import PokeBox from "./pages/PokeBox";
import PokeEvolvePage from "./pages/PokeEvolve";
import PokeNewAttackPage from "./pages/PokeNewAttack";
import PokedexPage from "./pages/Pokedex";
import PrivateRoute from "./components/PrivateRoute";
import { ProfilePage } from "./pages/Profile";
import React from "react";
import Safari from "./pages/Safari";
import { TownRoutes } from "./pages/Town/routes";
import TrainerAttack from "./pages/Attack/TrainerAttack";
import WildAttack from "./pages/Attack/WildAttack";
import createCache from "@emotion/cache";
import { heIL } from "@mui/x-data-grid/locales";
import { io } from "socket.io-client";
import { prefixer } from "stylis";
import rtlPlugin from "@mui/stylis-plugin-rtl";

const cacheRtl = createCache({
  key: "pokemon",
  stylisPlugins: [prefixer, rtlPlugin],
});

export const socket = io(process.env.REACT_APP_API_URL, {
  withCredentials: true,
  auth: {
    token: Cookies.get("access_token"),
  },
});

function App() {
  const existingTheme = useTheme();
  const theme = React.useMemo(
    () =>
      createTheme({}, heIL, existingTheme, {
        direction: "rtl",
      }),
    [existingTheme]
  );
  return (
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={theme}>
      <GameProvider>
        <BattleProvider>
          <Router>
            <Header>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<LoginPage />} />
                <Route
                  path="/new-character"
                  element={
                    <PrivateRoute>
                      <NewCharacterPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/npc"
                  element={
                    <PrivateRoute>
                      <NpcPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <PrivateRoute admin={true}>
                      <AdminPage />
                    </PrivateRoute>
                  }
                >
                  {AdminRoutes()}
                </Route>
                <Route
                  path="/poke-evolve"
                  element={
                    <PrivateRoute>
                      <PokeEvolvePage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/poke-new-attack"
                  element={
                    <PrivateRoute>
                      <PokeNewAttackPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/statistics"
                  element={
                    <PrivateRoute>
                      <LeaderboardsPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/safari"
                  element={
                    <PrivateRoute>
                      <Safari />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/pokedex"
                  element={
                    <PrivateRoute>
                      <PokedexPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/daily_quests"
                  element={
                    <PrivateRoute>
                      <DailyQuestsPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/box"
                  element={
                    <PrivateRoute>
                      <PokeBox />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/badges"
                  element={
                    <PrivateRoute>
                      <BadgeCase />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/fishing"
                  element={
                    <PrivateRoute>
                      <FishingPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/judge"
                  element={
                    <PrivateRoute>
                      <Judge />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/my-characters"
                  element={
                    <PrivateRoute>
                      <MyCharactersPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/choose-pokemon"
                  element={
                    <PrivateRoute>
                      <ChoosePokemonPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/profile/:username"
                  element={
                    <PrivateRoute>
                      <ProfilePage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/events"
                  element={
                    <PrivateRoute>
                      <Notifications />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/house-shop"
                  element={
                    <PrivateRoute>
                      <HouseShopPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/items"
                  element={
                    <PrivateRoute>
                      <ItemsPage />
                    </PrivateRoute>
                  }
                />
                <Route path="/information" element={<InformationPage />} />
                <Route path="/attack/trainer" element={<TrainerAttack />} />
                <Route path="/attack/wild" element={<WildAttack />} />
                <Route path="/attack/map" element={<AttackMap />} />
                {InboxRoutes}
                {TownRoutes}
              </Routes>
            </Header>
          </Router>
        </BattleProvider>
      </GameProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}

export default App;
