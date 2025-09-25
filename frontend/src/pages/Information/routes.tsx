import AbilityInfo from "./AbilityInfo";
import AttackInfo from "./AttackInfo";
import InformationPage from ".";
import ItemInfo from "./ItemInfo";
import MoodInfo from "./MoodInfo";
import { Route } from "react-router-dom";

export const InformationRoutes = (
  <>
    <Route path="/information" element={<InformationPage />}>
      <Route index element={<AttackInfo />} />
      <Route element={<MoodInfo />} path="mood" />
      <Route element={<AbilityInfo />} path="ability" />
      <Route element={<ItemInfo />} path="item" />
    </Route>
  </>
);
