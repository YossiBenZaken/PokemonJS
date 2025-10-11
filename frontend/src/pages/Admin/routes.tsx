import AdminPanel from "./AdminPanel";
import { AdminTeamPage } from "./Team";
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
    </>
  );
};
