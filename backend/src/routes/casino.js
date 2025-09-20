import {
  buyStoreItem,
  buyTickets,
  getStoreItems,
  getVault,
  guessWhoIs,
  sellTickets,
  spinFortune,
  startWhoIs,
  tryVault,
} from "../controllers/casino-controller.js";

import express from "express";
import { extractAccId } from "../middleware/auth.js";

const router = express.Router();

// Vault endpoints
router.get("/vault", getVault);
router.post("/vault/try", extractAccId, tryVault);
router.post("/whois/start", startWhoIs);
router.post("/whois/guess", guessWhoIs);
router.post("/spin", spinFortune);

router.post("/buy-tickets", buyTickets);
router.post("/sell-tickets", sellTickets);
router.get("/items", getStoreItems);
router.post("/buy-item", buyStoreItem);

export default router;
