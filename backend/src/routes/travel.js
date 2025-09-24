import { getTravelInfo, travelFly, travelGo, travelSurf } from "../controllers/travel-controller.js";

import express from "express";
import { extractAccId } from "../middleware/auth.js";

const router = express.Router();

router.get("/info/:userId", getTravelInfo);
router.post("/go", extractAccId, travelGo);
router.post("/surf", extractAccId, travelSurf);
router.post("/fly", extractAccId, travelFly);

export default router;


