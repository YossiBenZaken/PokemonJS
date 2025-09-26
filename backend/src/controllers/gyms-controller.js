import { query } from "../config/database.js";

function possible(rank, act, next) {
  return rank >= 3 && act === next;
}

// פונקציה מדומה שמתחילה קרב מול מנהיג מכון
async function startTrainerAttack(gymLeader, trainerAveLevel, gebied, userId) {
  // כאן תקרא ללוגיקה האמיתית שלך ליצירת הקרב (attack_log וכדומה)
  return {
    success: true,
    redirect: `/attack/trainer?gym=${encodeURIComponent(gymLeader)}`,
  };
}

export const getGyms = async (req, res) => {
  try {
    const userId =Number(req.body.userId);
    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const userRows = await query(
      "SELECT g.*,COUNT(ps.wild_id) AS in_hand FROM `gebruikers` AS g INNER JOIN pokemon_speler AS ps ON g.user_id = ps.user_id WHERE g.user_id = ?",
      [userId]
    );
    const gebruiker = userRows[0];
    if (!gebruiker)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (gebruiker.in_hand == 0) {
      return res.json({
        success: false,
        message: "אין פוקימונים בצוות — יש להביא פוקימון לפני שאפשר לאתגר.",
      });
    }

    const gyms = await query(
      "SELECT * FROM trainer WHERE wereld = ? ORDER BY id ASC",
      [gebruiker.wereld]
    );
    const badgeRow =
      (
        await query("SELECT * FROM gebruikers_badges WHERE user_id = ?", [
          userId,
        ])
      )[0] || {};

    const next = gebruiker[`${gebruiker.wereld}_gym`];

    const gymsMapped = gyms.map((gym, i) => {
      let blocked = false;
      let complete = false;
      let name = gym.naam;
      let badgeName = gym.badge
        ? gym.badge + (gym.badge.includes("Elite") ? "" : " Badge")
        : "";
      let text = gym.descr || "";

      if (gym.badge && gym.badge.includes("Elite")) {
        text = `${name} הוא חבר ב־ELITE 4 של ${gym.wereld}!`;
        badgeName = gym.badge;
      }

      if (
        !possible(gebruiker.rank, next, i) &&
        (badgeRow[gym.badge] == 0 || badgeRow[gym.badge] === undefined)
      ) {
        blocked = true;
        if (i > 0) {
          text = "[אצטדיון חסום!] נצח את המנהיג הקודם כדי לאתגר את המנהיג הזה!";
        } else {
          text = "[אצטדיון חסום!] עליך לעלות בדירוג כדי לאתגר מנהיג זה!";
        }
        name = "???";
        badgeName = "???";
      }

      if (badgeRow[gym.badge] >= 1) {
        complete = true;
      }

      if (!text) text = "אין תיאור זמין למאמן זה.";

      return {
        id: gym.id,
        naam: gym.naam,
        namePublic: name,
        badge: badgeName,
        descr: text,
        wereld: gym.wereld,
        gebied: gym.gebied,
        rankRequired: gym.rank,
        progress: gym.progress,
        blocked,
        complete,
        index: i,
      };
    });

    return res.json({
      success: true,
      data: {
        gyms: gymsMapped,
        next,
      },
    });
  } catch (err) {
    console.error("getGyms error:", err);
    return res
      .status(500)
      .json({ success: false, message: "שגיאה בשרת", error: err.message });
  }
};

export const postChallenge = async (req, res) => {
  try {
    const userId = req.user?.id || Number(req.body.userId);
    const { gymLeader } = req.body;
    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });
    if (!gymLeader)
      return res
        .status(400)
        .json({ success: false, message: "gymLeader is required" });

    const userRows = await query(
      "SELECT * FROM `gebruikers` WHERE user_id = ?",
      [userId]
    );
    const gebruiker = userRows[0];
    if (!gebruiker)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (gebruiker.in_hand == 0)
      return res.json({ success: false, message: "אין פוקימונים בצוות." });

    const gymInfoRows = await query(
      'SELECT `rank`, `wereld`, `badge`, `progress`, `naam`, `gebied` FROM `trainer` WHERE `naam` = ? AND `badge` != "" LIMIT 1',
      [gymLeader]
    );
    const gymInfo = gymInfoRows[0];
    if (!gymInfo)
      return res.json({ success: false, message: "זה לא מנהיג של מכון." });

    const next = gebruiker[`${gebruiker.wereld}_gym`];
    if (!(gebruiker.rank >= 3 && next === gymInfo.progress)) {
      return res.json({
        success: false,
        message: "ERROR 230 — לא ניתן לאתגר כעת.",
      });
    }

    const alive = await query(
      "SELECT id FROM pokemon_speler WHERE user_id = ? AND opzak = 'ja' AND leven > 0",
      [userId]
    );
    if (!alive || alive.length == 0)
      return res.json({ success: false, message: "אין פוקימונים בחיים." });

    if (gebruiker.rank < gymInfo.rank)
      return res.json({ success: false, message: "דרג המשתמש נמוך מדי." });
    if (gebruiker.wereld !== gymInfo.wereld)
      return res.json({ success: false, message: "זה לא המפה שלך." });

    const badgeRow =
      (
        await query("SELECT * FROM gebruikers_badges WHERE user_id = ?", [
          userId,
        ])
      )[0] || {};
    if (gymInfo.badge && badgeRow[gymInfo.badge] >= 1) {
      return res.json({ success: false, message: "כבר יש לך את התג הזה." });
    }

    const team = await query(
      "SELECT level FROM pokemon_speler WHERE user_id = ? AND opzak = 'ja' ORDER BY opzak_nummer ASC",
      [userId]
    );
    let levelSum = 0;
    team.forEach((p) => {
      levelSum += Number(p.level || 0);
    });
    const trainerAveLevel =
      team.length > 0 ? Math.round(levelSum / team.length) : 1;

    const start = await startTrainerAttack(
      gymLeader,
      trainerAveLevel,
      gymInfo.gebied,
      userId
    );
    if (!start.success) {
      return res.json({
        success: false,
        message: start.message || "לא ניתן להתחיל את הקרב",
      });
    }

    return res.json({
      success: true,
      redirect: start.redirect || "/attack/trainer",
    });
  } catch (err) {
    console.error("postChallenge error:", err);
    return res
      .status(500)
      .json({ success: false, message: "שגיאה בשרת", error: err.message });
  }
};
