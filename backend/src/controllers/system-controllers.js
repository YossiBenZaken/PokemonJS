import { getRandomInt, highAmount } from "../helpers/battle-utils.js";

import { query } from "../config/database.js";

export const getOnlineUsers = async (req, res) => {
  try {
    const acc_id = req?.user?.acc_id;
    // 15 דקות אחרונות (900 שניות)
    const result = await query(
      `SELECT user_id, username, premiumaccount, admin, rang, dv 
           FROM gebruikers 
           WHERE (online + 900) >= UNIX_TIMESTAMP() AND banned = 'N'
           ORDER BY admin DESC, points DESC, rang ASC, user_id ASC`
    );
    if (acc_id) {
      await query(
        `UPDATE gebruikers SET online = UNIX_TIMESTAMP() WHERE acc_id = ?`,
        [acc_id]
      );
    }
    res.json({ success: true, users: result, total: result.length });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "שגיאה בקבלת משתמשים מחוברים",
      error: error.message,
    });
  }
};

export const getAssets = async (req, res) => {
  try {
    const ranks = await query("SELECT * FROM `rank`");
    const karakters = await query(
      "SELECT * FROM `karakters` ORDER BY `karakter_naam` ASC"
    );
    const attacks = await query("SELECT * FROM aanval ORDER BY naam ASC");
    const abilities = await query(
      "SELECT * FROM `abilities` ORDER BY `name` ASC"
    );
    const itemInfo = await query(
      "SELECT * FROM `markt` WHERE `soort`!='pokemon' AND `soort`!='tm' AND `soort`!='hm' ORDER BY `soort` ASC"
    );
    const config = await query("SELECT `id`, `config`, `valor` FROM configs");
    res.json({
      success: true,
      data: { ranks, karakters, attacks, abilities, itemInfo, config },
    });
  } catch (error) {
    res.status(500).json({
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
    res.status(500).json({
      success: false,
      message: "שגיאה בעדכון Tickets",
      error: error.message,
    });
  }
};

export const getOfficialMessages = async (req, res) => {
  try {
    const { id, userId } = req.body;
    if (id) {
      const messagesList = await query(
        "SELECT * FROM `official_message` WHERE id = ? AND `hidden` = 0",
        [id]
      );
      await query(
        `INSERT INTO official_message_read (id_msg, id_user)
VALUES (?, ?)
ON DUPLICATE KEY UPDATE
  id_user = VALUES(id_user),
  id_msg = VALUES(id_msg);
`,
        [id, userId]
      );
      res.json({
        success: true,
        data: messagesList,
      });
    } else {
      const messagesList = await query(
        `SELECT om.id,
       om.title,
       om.message,
       om.date,
    CASE 
        WHEN omr.id_user IS NOT NULL THEN 1 
        ELSE 0 
    END AS is_read
FROM official_message AS om
LEFT JOIN official_message_read AS omr
       ON omr.id_msg = om.id
      AND omr.id_user = ?
WHERE om.hidden = 0
  AND (omr.id_user = ? OR omr.id_user IS NULL)
ORDER BY om.id DESC;`,
        [userId, userId]
      );
      res.json({
        success: true,
        data: messagesList,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "שגיאה בקבלת הודעות רשמיות",
      error: error.message,
    });
  }
};

const addSilvers = async (userId, min = 500, max = 4999) => {
  const silvers = getRandomInt(min, max);
  await query(
    "UPDATE `gebruikers` SET `silver`=`silver`+? , `daily_bonus`=UNIX_TIMESTAMP() WHERE `user_id`=?",
    [silvers,userId]
  );
  return {
    success: true,
    message: `מזל טוב, זכית ב <b>${highAmount(silvers)}</b> סילברים!`,
  };
};

export const dailyBonus = async (req, res) => {
  const userId = req.user?.user_id;
  const [user] = await query(
    "SELECT `daily_bonus`,`premiumaccount`,`rank`,`rankexp`,`rankexpnodig` FROM `gebruikers` WHERE `user_id`=?",
    [userId]
  );
  if (user.daily_bonus + 86400 > new Date().getTime() / 1000) {
    return res.json({
      success: false,
      message: "כבר קיבלת את הפרס היומי שלך היום!",
    });
  } else {
    const random = getRandomInt(1, 7);
    let type;
    switch (random) {
      case 1: //זכיתי במדליות כסף
        return res.json(await addSilvers(userId, 5000, 100000));
      case 2:
        type = getRandomInt(1, 2);
        if (type == 1) {
          const premiumDays = 1;
          let premium = 86400 & premiumDays;
          if (user.premiumaccount < new Date().getTime() / 1000)
            premium += new Date().getTime() / 1000;
          else premium += user.premiumaccount;

          await query(
            "UPDATE `gebruikers` SET `premiumaccount`=?,`daily_bonus`=UNIX_TIMESTAMP() WHERE `user_id`=?",
            [premium, userId]
          );
          return res.json({
            success: true,
            message: `מזל טוב, זכית ב <b>${highAmount(
              premiumDays
            )}</b> ימי פרימיום!`,
          });
        } else return res.json(await addSilvers(userId));
      case 3:
        type = getRandomInt(1, 2500);
        if (type < 2490) {
          const [randomStone] = await query(
            "SELECT * FROM `markt` WHERE `soort`='stones' AND `roleta`='sim' AND `beschikbaar`='1' AND (`id`>='131' AND `id`<='140') ORDER BY RAND() LIMIT 1"
          );
          await query(
            `UPDATE \`gebruikers_item\` SET \`${randomStone["naam"]}\`=\`${randomStone["naam"]}\`+'1' WHERE \`user_id\`=?`,
            [userId]
          );
          await query(
            "UPDATE `gebruikers` SET `daily_bonus`=UNIX_TIMESTAMP() WHERE `user_id`=?",
            [userId]
          );
          return res.json({
            success: true,
            message: `מזל טוב, זכית ב <img src="/images/items/${randomStone.naam}.png">`,
          });
        } else return res.json(await addSilvers(userId));
      case 4:
        type = getRandomInt(1, 2500);
        if (type >= 1000) {
          const [randomBall] = await query(
            "SELECT * FROM `markt` WHERE `soort`='balls' AND `gold`='0' AND `beschikbaar`='1' AND `roleta`='sim' LIMIT 1"
          );
          await query(
            `UPDATE \`gebruikers_item\` SET \`${randomBall["naam"]}\`=\`${randomBall["naam"]}\`+'1' WHERE \`user_id\`=?`,
            [userId]
          );
          await query(
            "UPDATE `gebruikers` SET `daily_bonus`=UNIX_TIMESTAMP() WHERE `user_id`=?",
            [userId]
          );
          return res.json({
            success: true,
            message: `מזל טוב, זכית ב <img src="/images/items/${randomBall.naam}.png">`,
          });
        } else return res.json(await addSilvers(userId));
      case 5:
        const addExp = getRandomInt(100, 1000) * user.rank;
        let rankExp = user.rankexp + addExp;
        rankExp =
          rankExp < user.rankexpnodig ? rankExp : user.rankexpnodig - 10;
        await query(
          "UPDATE `gebruikers` SET `rankexp`=? ,`daily_bonus`=UNIX_TIMESTAMP() WHERE `user_id`=?",
          [rankExp, userId]
        );
        return res.json({
          success: true,
          message: `מזל טוב, זכית ב ${highAmount(addExp)} נקודות ניסיון!`,
        });
      default:
        return res.json(await addSilvers(userId));
    }
  }
};
