import AdminPanel from "./AdminPanel";
import { AdminTeamPage } from "./Team";
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
    </>
  );
};
