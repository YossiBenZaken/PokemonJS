import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

import { BadgeCase } from "./pages/Badges";
import { ChoosePokemonPage } from "./pages/ChoosePokemon";
import FishingPage from "./pages/Fishing";
import { Footer } from "./layout/Footer/Footer";
import { GameProvider } from "./contexts/GameContext";
import { Header } from "./layout/Header";
import { Home } from "./pages/Home";
import { HouseShopPage } from "./pages/HouseShop";
import { InboxRoutes } from "./pages/Inbox/routes";
import { InformationRoutes } from "./pages/Information/routes";
import ItemsPage from "./pages/Items";
import { Judge } from "./pages/Judge";
import LeaderboardsPage from "./pages/Leaderboards";
import { LoginPage } from "./pages/Login";
import { MyCharactersPage } from "./pages/MyCharacters";
import { NewCharacterPage } from "./pages/NewCharacter";
import Notifications from "./pages/Notifications";
import PokedexPage from "./pages/Pokedex";
import PrivateRoute from "./components/PrivateRoute";
import { ProfilePage } from "./pages/Profile";
import { TownRoutes } from "./pages/Town/routes";

function App() {
  return (
    <GameProvider>
      <Router>
        <Header />
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
            path="/statistics"
            element={
              <PrivateRoute>
                <LeaderboardsPage />
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
          {InformationRoutes}
          {InboxRoutes}
          {TownRoutes}
        </Routes>
        <Footer />
      </Router>
    </GameProvider>
  );
}

export default App;
