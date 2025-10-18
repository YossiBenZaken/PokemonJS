import AdminAddPokemon from "./AdminAddPokemon";
import AdminBankLogsPage from "./BankLogs";
import AdminDonateAllPage from "./AdminDonateAllPage";
import AdminGameConfigPage from "./AdminGameConfigPage";
import AdminGiveEggPage from "./AdminGiveEggPage";
import AdminGivePokemonPage from "./AdminGivePokemonPage";
import AdminIPSearchPage from "./AdminIPSearchPage";
import AdminMultiAccountDetector from "./AdminMultiAccountPage";
import AdminPanel from "./AdminPanel";
import { AdminTeamPage } from "./Team";
import AdminTransferListLogsPage from "./AdminTransferListLogsPage";
import BanIP from "./BanIP";
import BlockAccount from "./BlockAccount";
import BlockPlayerPage from "./BlockPlayer";
import PrivateRoute from "../../components/PrivateRoute";
import { Route } from "react-router-dom";

export const AdminRoutes = () => {
  return (
    <>
      <Route
        index
        element={
          <PrivateRoute admin={true}>
            <AdminPanel />
          </PrivateRoute>
        }
      />
      <Route
        path="team"
        element={
          <PrivateRoute admin={true}>
            <AdminTeamPage />
          </PrivateRoute>
        }
      />
      <Route
        path="block-account"
        element={
          <PrivateRoute admin={true}>
            <BlockAccount />
          </PrivateRoute>
        }
      />
      <Route
        path="block-player"
        element={
          <PrivateRoute admin={true}>
            <BlockPlayerPage />
          </PrivateRoute>
        }
      />
      <Route
        path="search-ip"
        element={
          <PrivateRoute admin={true}>
            <AdminIPSearchPage />
          </PrivateRoute>
        }
      />
      <Route
        path="ip-ban"
        element={
          <PrivateRoute admin={true}>
            <BanIP />
          </PrivateRoute>
        }
      />
      <Route
        path="multi-accounts"
        element={
          <PrivateRoute admin={true}>
            <AdminMultiAccountDetector />
          </PrivateRoute>
        }
      />
      <Route
        path="bank-logs"
        element={
          <PrivateRoute admin={true}>
            <AdminBankLogsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="market-logs"
        element={
          <PrivateRoute admin={true}>
            <AdminTransferListLogsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="add-pokemon"
        element={
          <PrivateRoute admin={true}>
            <AdminAddPokemon />
          </PrivateRoute>
        }
      />
      <Route
        path="initial-egg"
        element={
          <PrivateRoute admin={true}>
            <AdminGiveEggPage />
          </PrivateRoute>
        }
      />
      <Route
        path="pokemon"
        element={
          <PrivateRoute admin={true}>
            <AdminGivePokemonPage />
          </PrivateRoute>
        }
      />
      <Route
        path="mass-donation"
        element={
          <PrivateRoute admin={true}>
            <AdminDonateAllPage />
          </PrivateRoute>
        }
      />
      <Route
        path="config"
        element={
          <PrivateRoute admin={true}>
            <AdminGameConfigPage />
          </PrivateRoute>
        }
      />
    </>
  );
};
