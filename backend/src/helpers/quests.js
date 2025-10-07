import { query } from "../config/database.js";

export class Quests {
  static async allowedQuest(userId) {
    const user = await this.getInfos(userId);
    return user.rank >= 4;
  }

  static async setStatus(type, userId, force = 1) {
    if (this.allowedQuest(userId)) {
      const user = await this.getInfos(userId);
      const questActual = await this.getActualQuests();

      for (let i = 0; i < questActual.length; i++) {
        const quest = await this.getQuest(questActual[i]);
        const questKey = `quest_${i + 1}_req`;

        if (type === quest.type) {
          if (force == 1) {
            if (user[questKey < quest.quant_wid]) {
              await query(
                `UPDATE gebruikers SET \`${questKey}\` = \`${questKey}\` + ? WHERE user_id = ?`,
                [force, uid]
              );
            }
          } else if (type === "heal") {
            if (user[questKey] < quest.quant_wid) {
              const newValue = Math.min(
                user[questKey] + force,
                quest.quant_wid
              );
              await query(
                `UPDATE gebruikers SET \`${questKey}\` = ? WHERE user_id = ?`,
                [newValue, uid]
              );
            }
          } else if (force === quest.quant_wid) {
            await query(
              `UPDATE gebruikers SET \`${questKey}\` = ? WHERE user_id = ?`,
              [force, uid]
            );
          }
        }
      }
    }
  }

  static async setQuest(id) {
    const quest = await this.getQuest(id);
    let quant_wid;

    if (quest.type === "catch_single") {
      const [row] = await query(
        `SELECT wild_id FROM pokemon_wild WHERE zeldzaamheid <= 3 AND aparece = 'sim' AND gebied != '' ORDER BY RAND() LIMIT 1`
      );
      quant_wid = row.wild_id;
    } else {
      const quant_all = quest.quant_wid_all.split(",");
      quant_wid = quant_all[Math.floor(Math.random() * quant_all.length)];
    }

    await query(`UPDATE daily_quest SET quant_wid = ? WHERE id = ?`, [
      quant_wid,
      id,
    ]);
  }

  static async setPrize(id) {
    const quant_gold = [3, 5, 10];
    const quant_silver = [5000, 7000, 10000, 13000, 15000, 20000];
    const quant_item = [
      "106-5-10-20",
      "140-2-4",
      "62-1",
      "139-2-4",
      "103-5-10",
      "14-1",
    ];
    const rand = Math.floor(Math.random() * 100) + 1;

    let type, item, qnt;

    if (rand <= 65) {
      const items =
        quant_item[Math.floor(Math.random() * quant_item.length)].split("-");
      item = items.shift();
      qnt = items[Math.floor(Math.random() * items.length)];
      type = "item";
    } else if (rand <= 90) {
      item = "0";
      qnt = quant_silver[Math.floor(Math.random() * quant_silver.length)];
      type = "silver";
    } else {
      item = "0";
      qnt = quant_gold[Math.floor(Math.random() * quant_gold.length)];
      type = "gold";
    }

    await query(
      `UPDATE daily_quest SET recomp_type=?, recomp_id=?, recomp_quant=? WHERE id=?`,
      [type, item, qnt, id]
    );
  }

  static async getQuest(id) {
    const [quest] = await query("SELECT * FROM `daily_quest` WHERE id=?", [id]);
    return quest;
  }

  static async getActualQuests() {
    const [quest1] = await query("SELECT * FROM `configs` WHERE id='6'", []);
    const [quest2] = await query("SELECT * FROM `configs` WHERE id='7'", []);

    return [quest1.valor, quest2.valor];
  }
  static async getItem(id) {
    return await query("SELECT * FROM `markt` WHERE `id`=?", [id]);
  }

  static async getInfos(userId, get = "*") {
    const [user] = await query(
      `SELECT ${get} FROM \`gebruikers\` WHERE user_id=?`,
      [userId]
    );
    return user;
  }
}
