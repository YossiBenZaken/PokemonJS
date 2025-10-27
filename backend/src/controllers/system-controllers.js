import { ItemBox, calculateTotalItems } from "./market-controller.js";
import { getRandomInt, highAmount } from "../helpers/battle-utils.js";

import { Quests } from "../helpers/quests.js";
import { query } from "../config/database.js";

export const getAssets = async (req, res) => {
  try {
    const ranks = await query("SELECT * FROM `rank`");
    const karakters = await query(
      "SELECT * FROM `karakters` ORDER BY `karakter_naam` ASC"
    );
    const attacks = await query("SELECT * FROM attack ORDER BY name ASC");
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
    [silvers, userId]
  );
  return {
    success: true,
    message: `מזל טוב, זכית ב <b>${highAmount(silvers)}</b> סילברים!`,
  };
};

export const dailyBonus = async (req, res) => {
  const userId = req.user?.user_id;
  const [user] = await query(
    "SELECT `daily_bonus`,`premiumaccount`,`rank`,`rankexp`,`rankexpnecessary` FROM `gebruikers` WHERE `user_id`=?",
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
          rankExp < user.rankexpnecessary ? rankExp : user.rankexpnecessary - 10;
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

export const getDailyQuests = async (req, res) => {
  try {
    const userId = req.user?.user_id;

    // קבלת נתוני המשתמש
    const [user] = await query(
      `
      SELECT 
        g.user_id, 
        g.rank, 
        gi.itembox, 
        g.quest_1,
        g.quest_2,
        g.quest_1_req,
        g.quest_2_req,
        g.streak,
        r.quest_r_1,
        r.quest_r_2,
        r.quest_r_master,
        r.acc_id
      FROM gebruikers g
      LEFT JOIN accounts r ON g.acc_id = r.acc_id
      INNER JOIN gebruikers_item AS gi ON g.user_id = gi.user_id
      WHERE g.user_id = ?
    `,
      [userId]
    );

    if (!user || user.rank < 4) {
      return res.status(403).json({
        error: "RANK MÍNIMO PARA CUMPRIR AS MISSÕES DIÁRIAS: 4 - TRAINER",
        minRank: 4,
      });
    }

    const totalItems = await calculateTotalItems(userId);

    // חישוב מקום פנוי בתיק
    const itemsAvailable = (ItemBox[user.itembox] || 20) - totalItems;

    // קבלת המשימות של היום
    const quests = await Quests.getActualQuests();

    if (quests.length < 2) {
      return res.status(404).json({
        error: "No quests available for today",
      });
    }

    const [quest1, quest2] = quests;

    // עיבוד משימה 1
    const quest1Data = await processQuestData(quest1, user, 1);

    // עיבוד משימה 2
    const quest2Data = await processQuestData(quest2, user, 2);

    res.json({
      success: true,
      data: {
        streak: user.streak,
        maxStreak: 7,
        itemsAvailable,
        quest1: quest1Data,
        quest2: quest2Data,
        canGetMasterBall:
          user.streak === 6 && user.quest_1 === 1 && user.quest_2 === 1,
        masterBallClaimed: user.quest_r_master === 1,
        allQuestsCompleted: user.quest_1 === 1 && user.quest_2 === 1,
        streakCompleted: user.streak === 7,
      },
    });
  } catch (error) {
    console.error("Error getting daily quests:", error);
    res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
};

export const completeQuests = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    const { questNumber } = req.params;
    if (!["1", "2"].includes(questNumber)) {
      return res.status(400).json({ error: "Invalid quest number" });
    }
    const [userData] = await query(
      `
      SELECT 
        g.user_id, 
        g.rank, 
        gi.itembox, 
        g.quest_1,
        g.quest_2,
        g.quest_1_req,
        g.quest_2_req,
        g.streak,
        r.quest_r_1,
        r.quest_r_2,
        r.quest_r_master,
        r.acc_id
      FROM gebruikers g
      LEFT JOIN accounts r ON g.acc_id = r.acc_id
      INNER JOIN gebruikers_item AS gi ON g.user_id = gi.user_id
      WHERE g.user_id = ?
    `,
      [userId]
    );
    const questField = `quest_${questNumber}`;
    const questReqField = `quest_${questNumber}_req`;
    const questRewardField = `quest_r_${questNumber}`;
    const otherQuestField = questNumber === "1" ? "quest_2" : "quest_1";
    // בדיקה שהמשימה טרם הושלמה
    if (userData[questField] === 1) {
      throw new Error("Quest already completed");
    }
    const actualQuest = await Quests.getActualQuests();
    const questData = await Quests.getQuest(actualQuest[Number(questNumber) -1]);
    // בדיקה שהמשימה הושלמה
    if (userData[questReqField] < questData.quant_wid) {
      throw new Error("Quest requirements not met");
    }

    const totalItems = await calculateTotalItems(userId);

    // חישוב מקום פנוי בתיק
    const itemsAvailable = (ItemBox[userData.itembox] || 20) - totalItems;

    if (userData[questRewardField] === 0) {
      if (questData.recomp_type === "item") {
        if (itemsAvailable < questData.recomp_quant) {
          throw new Error("Não há espaço na sua mochila!");
        }

        const [item] = await query(
          `
          SELECT naam FROM markt WHERE id = ?
        `,
          [questData.recomp_id]
        );
        const itemName = item.naam;
        // בדיקה אם זה TM
        if (itemName.includes("TM")) {
          await query(
            `
            UPDATE gebruikers_tmhm 
            SET \`${itemName}\` = \`${itemName}\` + ?
            WHERE user_id = ?
          `,
            [questData.recomp_quant, userId]
          );
        } else {
          await query(
            `
            UPDATE gebruikers_item 
            SET \`${itemName}\` = \`${itemName}\` + ?
            WHERE user_id = ?
          `,
            [questData.recomp_quant, userId]
          );
        }
      } else if (questData.recomp_type === "gold") {
        await query(
          `
          UPDATE accounts 
          SET gold = gold + ?
          WHERE acc_id = ?
        `,
          [questData.recomp_quant, userData.acc_id]
        );
      } else {
        await query(
          `
          UPDATE gebruikers 
          SET silver = silver + ?
          WHERE user_id = ?
        `,
          [questData.recomp_quant, userId]
        );
      }

      // עדכון שהפרס נדרש
      await query(
        `
        UPDATE accounts 
        SET ${questRewardField} = 1
        WHERE acc_id = ?
      `,
        [userData.acc_id]
      );
    }

    // עדכון שהמשימה הושלמה
    await query(
      `
      UPDATE gebruikers 
      SET ${questField} = 1, ${questReqField} = 0
      WHERE user_id = ?
    `,
      [userId]
    );

    // עדכון streak אם שתי המשימות הושלמו
    if (userData[otherQuestField] === 1) {
      await query(
        `
        UPDATE gebruikers 
        SET streak = streak + 1
        WHERE user_id = ?
      `,
        [userId]
      );

      // בדיקה אם השלים 7 ימים - מתן Master Ball
      if (userData.streak === 6 && userData.quest_r_master === 0) {
        if (itemsAvailable < 1) {
          throw new Error("Não há espaço na sua mochila para a Master Ball!");
        }

        await query(
          `
          UPDATE accounts 
          SET quest_r_master = 1
          WHERE acc_id = ?
        `,
          [userData.acc_id]
        );

        await query(
          `
          UPDATE gebruikers_item 
          SET \`Master ball\` = \`Master ball\` + 1
          WHERE user_id = ?
        `,
          [userId]
        );

        return res.json({
          success: true,
          message: `משימה ${questNumber} הושלמה!`,
          data: {
            questCompleted: true,
            masterBallReceived: true,
            streak: 7,
          },
        });
      }
    }

    return res.json({
      success: true,
      message: `משימה ${questNumber} הושלמה!`,
      data: {
        questCompleted: true,
        masterBallReceived: false,
        streak: userData.streak + (userData[otherQuestField] === 1 ? 1 : 0),
      }
    });
  } catch (error) {
    console.error("Error getting daily quests:", error);
    res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
};

async function processQuestData(quest, user, questNumber) {
  const questField = `quest_${questNumber}`;
  const questReqField = `quest_${questNumber}_req`;
  const questRewardField = `quest_r_${questNumber}`;
  const questData = await Quests.getQuest(quest);

  // קבלת תיאור המשימה
  let description = questData.descr;
  if (questData.type !== "catch_single") {
    description = description.replace("%qnt%", questData.quant_wid);
  } else {
    const [wildPokemon] = await query(
      `
      SELECT naam FROM pokemon_wild WHERE wild_id = ?
    `,
      [questData.quant_wid]
    );
    description = description.replace(
      "%qnt%",
      wildPokemon?.naam || questData.quant_wid
    );
  }

  // קבלת פרטי הפרס
  let rewardDisplay = "";
  let rewardItem = null;

  if (questData.recomp_type === "item") {
    const [item] = await query(
      `
      SELECT naam, soort FROM markt WHERE id = ?
    `,
      [questData.recomp_id]
    );

    if (item) {
      rewardItem = item.naam;

      // אם זה TM - קבלת סוג ההתקפה
      if (item.soort === "tm") {
        const [tmData] = await query(
          `
          SELECT omschrijving FROM tmhm WHERE naam = ?
        `,
          [item.naam]
        );

        if (tmData) {
          const [attackData] = await query(
            `
            SELECT type FROM attack WHERE name = ?
          `,
            [tmData.omschrijving]
          );

          rewardDisplay = {
            quantity: questData.recomp_quant,
            item: item.naam,
            type: "tm",
            attackType: attackData?.type,
          };
        }
      } else {
        rewardDisplay = {
          quantity: questData.recomp_quant,
          item: item.naam,
          type: "item",
        };
      }
    }
  } else if (questData.recomp_type === "gold") {
    rewardDisplay = {
      quantity: questData.recomp_quant,
      type: "gold",
    };
  } else {
    rewardDisplay = {
      quantity: questData.recomp_quant,
      type: "silver",
    };
  }

  // בדיקת סטטוס המשימה
  const isCompleted = user[questField] === 1;
  const progress = user[questReqField];
  const required = questData.quant_wid;
  const canComplete = progress >= required && !isCompleted;
  const rewardClaimed = user[questRewardField] === 1;

  return {
    questId: questData.quest_id,
    type: questData.type,
    description,
    progress,
    required,
    isCompleted,
    canComplete,
    rewardClaimed,
    reward: rewardDisplay,
    rewardItem,
  };
}
