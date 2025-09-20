import { query } from "../config/database.js";

export const getOnlineUsers = async (req, res) => {
  try {
    const { acc_id } = req.user;
    // 15 דקות אחרונות (900 שניות)
    const result = await query(
      `SELECT user_id, username, premiumaccount, admin, rang, dv 
           FROM gebruikers 
           WHERE (online + 900) >= UNIX_TIMESTAMP() AND banned = 'N'
           ORDER BY admin DESC, points DESC, rang ASC, user_id ASC`
    );
    await query(
      `UPDATE gebruikers SET online = UNIX_TIMESTAMP() WHERE acc_id = ?`,
      [acc_id]
    );
    res.json({ success: true, users: result, total: result.length });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "שגיאה בקבלת משתמשים מחוברים",
        error: error.message,
      });
  }
};

export const getAssets = async (req, res) => {
  try {
    const ranks = await query("SELECT * FROM `rank`");
    res.json({ success: true, data: { ranks } });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "שגיאה בקבלת משאבים",
        error: error.message,
      });
  }
};

// עדכון Tickets למשתמש המחובר (חיובי/שלילי)
export const updateTickets = async (req, res) => {
  try {
    const { delta, userId } = req.body; // יכול להיות שלילי/חיובי
    if (!userId) {
      return res.status(401).json({ success: false, message: "לא מחובר" });
    }

    if (typeof delta !== "number" || !Number.isFinite(delta)) {
      return res
        .status(400)
        .json({ success: false, message: "שדה delta נדרש ומספרי" });
    }

    // ודא שלא יורדים מתחת ל-0
    const rows = await query(
      "SELECT tickets FROM gebruikers WHERE user_id = ? LIMIT 1",
      [userId]
    );
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: "משתמש לא נמצא" });
    }
    const current = Number(rows[0].tickets) || 0;
    const next = current + delta;
    if (next < 0) {
      return res
        .status(400)
        .json({ success: false, message: "אין מספיק Tickets" });
    }

    await query("UPDATE gebruikers SET tickets = ? WHERE user_id = ? LIMIT 1", [
      next,
      userId,
    ]);
    return res.json({ success: true, tickets: next });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "שגיאה בעדכון Tickets",
        error: error.message,
      });
  }
};
