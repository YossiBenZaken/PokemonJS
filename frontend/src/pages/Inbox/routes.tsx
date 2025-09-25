import Inbox from "./Inbox";
import InboxPage from ".";
import NewMessage from "./NewMessage";
import OfficialMessages from "./OfficialMessages";
import PrivateRoute from "../../components/PrivateRoute";
import { Route } from "react-router-dom";

export const InboxRoutes = (
  <>
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
  </>
);