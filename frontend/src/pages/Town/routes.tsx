import Bank from "./Bank";
import Casino from "./Casino/Casino";
import CasinoStore from "./Casino/CasinoStore";
import Daycare from "./DayCare";
import FortuneWheel from "./Casino/FortuneWheel";
import FountainPage from "./Fountain";
import GymsPage from "./Gyms";
import MarketPage from "./Market";
import MarketShopPage from "./MarketShop";
import MovesPage from "./Moves";
import PokemonCenterPage from "./PokemonCenter";
import PrivateRoute from "../../components/PrivateRoute";
import { Route } from "react-router-dom";
import Slots from "./Casino/Slots";
import Specialists from "./Specialists";
import TownPage from "./index";
import Traders from "./Traders";
import TransferListPage from "./TransferList";
import TravelPage from "./Travel";
import Vault from "./Casino/Vault";
import WhoIs from "./Casino/WhoIs";

export const TownRoutes = (
  <>
    <Route
      path="/town"
      element={
        <PrivateRoute>
          <TownPage />
        </PrivateRoute>
      }
    />
    <Route
      path="/bank"
      element={
        <PrivateRoute>
          <Bank />
        </PrivateRoute>
      }
    />
    <Route
      path="/casino"
      element={
        <PrivateRoute>
          <Casino />
        </PrivateRoute>
      }
    />
    <Route
      path="/casino-store"
      element={
        <PrivateRoute>
          <CasinoStore />
        </PrivateRoute>
      }
    />
    <Route
      path="/wheel-of-fortune"
      element={
        <PrivateRoute>
          <FortuneWheel />
        </PrivateRoute>
      }
    />
    <Route
      path="/slots"
      element={
        <PrivateRoute>
          <Slots />
        </PrivateRoute>
      }
    />
    <Route
      path="/kluis"
      element={
        <PrivateRoute>
          <Vault />
        </PrivateRoute>
      }
    />
    <Route
      path="/who-is-it-quiz"
      element={
        <PrivateRoute>
          <WhoIs />
        </PrivateRoute>
      }
    />
    <Route
      path="/daycare"
      element={
        <PrivateRoute>
          <Daycare />
        </PrivateRoute>
      }
    />
    <Route
      path="/fountain"
      element={
        <PrivateRoute>
          <FountainPage />
        </PrivateRoute>
      }
    />
    <Route
      path="/gyms"
      element={
        <PrivateRoute>
          <GymsPage />
        </PrivateRoute>
      }
    />
    <Route
      path="/market"
      element={
        <PrivateRoute>
          <MarketPage />
        </PrivateRoute>
      }
    />
    <Route
      path="/market-shop"
      element={
        <PrivateRoute>
          <MarketShopPage />
        </PrivateRoute>
      }
    />
    <Route
      path="/pokemoncenter"
      element={
        <PrivateRoute>
          <PokemonCenterPage />
        </PrivateRoute>
      }
    />
    <Route
      path="/travel"
      element={
        <PrivateRoute>
          <TravelPage />
        </PrivateRoute>
      }
    />
    <Route
      path="/transferlist"
      element={
        <PrivateRoute>
          <TransferListPage />
        </PrivateRoute>
      }
    />
    <Route
      path="/specialists"
      element={
        <PrivateRoute>
          <Specialists />
        </PrivateRoute>
      }
    />
    <Route
      path="/moves"
      element={
        <PrivateRoute>
          <MovesPage />
        </PrivateRoute>
      }
    />
    <Route
      path="/traders"
      element={
        <PrivateRoute>
          <Traders />
        </PrivateRoute>
      }
    />
  </>
);