import {
  addAdmin,
  banAccount,
  banIP,
  banPlayer,
  checkBanStatus,
  createPokemon,
  detectMultiAccounts,
  getAdmins,
  getBannedAccounts,
  getBannedIPs,
  getBannedPlayers,
  getCombinedLogs,
  getMoveTutorList,
  getPokemons,
  getTMHMList,
  getTransferListLogs,
  getTransferListLogsByUser,
  giveEgg,
  giveGoldToAll,
  givePokemon,
  givePremiumToAll,
  givePremiumToPlayer,
  giveSilverToAll,
  removeAdmin,
  searchAccountsByIP,
  unbanAccount,
  unbanIP,
  unbanPlayer,
} from "../controllers/admin-controller.js";

import express from "express";
import jwt from "jsonwebtoken";
import { query } from "../config/database.js";

const router = express.Router();

const extractAccIdAndAdmin = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token אימות נדרש",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "default_secret"
    );
    // מכניס את ה-acc_id ל-req.user
    req.user = {
      ...decoded,
    };

    const [userAdmin] = await query(
      "SELECT `admin` FROM `gebruikers` WHERE `user_id`=? AND `admin`>=1",
      [req.user.user_id]
    );
    if (!userAdmin) {
      return res.status(401).json({
        success: false,
        message: "אתה לא מנהל",
      });
    }
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token פג תוקף",
      });
    }

    return res.status(403).json({
      success: false,
      message: "Token לא תקין",
    });
  }
};

router.use(extractAccIdAndAdmin);

router.get("/getAdmins", getAdmins);
router.post("/removeAdmin", removeAdmin);
router.post("/addAdmin", addAdmin);
router.get("/bans", getBannedAccounts);
router.post("/ban", banAccount);
router.post("/unban", unbanAccount);
router.get("/ban-status", checkBanStatus);

// Player ban routes
router.post("/banPlayer", banPlayer);
router.post("/unbanPlayer", unbanPlayer);
router.get("/banned-list", getBannedPlayers);

// IP ban routes
router.post("/ban-ip", banIP);
router.post("/unban-ip", unbanIP);
router.get("/banned-ips", getBannedIPs);
router.get("/search-by-ip", searchAccountsByIP);

// Multi-account detection
router.get("/detect-multi-accounts", detectMultiAccounts);

// Bank logs (combined with messages)
router.get("/combined-logs", getCombinedLogs);

// Transfer list logs
router.get("/transferlist-logs", getTransferListLogs);
router.get("/transferlist-logs-by-user", getTransferListLogsByUser);

// Pokemon management
router.post("/create-pokemon", createPokemon);
router.get("/tm-hm-list", getTMHMList);
router.get("/move-tutor-list", getMoveTutorList);

// Give egg to player
router.post("/give-egg", giveEgg);
router.post("/give-pokemon", givePokemon);
router.get('/getPokemons', getPokemons);

// Donate to all players
router.post("/give-silver-all", giveSilverToAll);
router.post("/give-gold-all", giveGoldToAll);
router.post("/give-premium-all", givePremiumToAll);

// Give premium to specific player
router.post("/give-premium-player", givePremiumToPlayer);

export default router;
