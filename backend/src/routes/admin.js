import {
  addAdmin,
  banAccount,
  banPlayer,
  checkBanStatus,
  getAdmins,
  getBannedAccounts,
  getBannedPlayers,
  removeAdmin,
  unbanAccount,
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
router.post("/banPlayer", banPlayer);
router.post("/unbanPlayer", unbanPlayer);
router.get("/banned-list", getBannedPlayers);

export default router;
