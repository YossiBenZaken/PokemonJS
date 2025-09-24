import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

import { ChoosePokemonPage } from "./pages/ChoosePokemon";
import { Footer } from "./layout/Footer/Footer";
import { GameProvider } from "./contexts/GameContext";
import { Header } from "./layout/Header";
import { Home } from "./pages/Home";
import { HouseShopPage } from "./pages/HouseShop";
import Inbox from "./pages/Inbox/Inbox";
import InboxPage from "./pages/Inbox";
import ItemsPage from "./pages/Items";
import { LoginPage } from "./pages/Login";
import { MyCharactersPage } from "./pages/MyCharacters";
import { NewCharacterPage } from "./pages/NewCharacter";
import NewMessage from "./pages/Inbox/NewMessage";
import Notifications from "./pages/Notifications";
import OfficialMessages from "./pages/Inbox/OfficialMessages";
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
          <Route
            path="/inbox"
            element={
              <PrivateRoute>
                <InboxPage />
              </PrivateRoute>
            }
          >
            <Route
              index
              element={
                <PrivateRoute>
                  <Inbox />
                </PrivateRoute>
              }
            />
            <Route
              path="official-messages"
              element={
                <PrivateRoute>
                  <OfficialMessages />
                </PrivateRoute>
              }
            />
            <Route
              path="new-message"
              element={
                <PrivateRoute>
                  <NewMessage />
                </PrivateRoute>
              }
            />
          </Route>
          {TownRoutes}
        </Routes>
        <Footer />
      </Router>
    </GameProvider>
  );
}

export default App;
