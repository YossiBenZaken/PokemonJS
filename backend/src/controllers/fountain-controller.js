import DB from "../config/database.js";

// מחשב מחיר בסיסי בהתאם לנדירות ולמס' ריסטים שבוצעו
const calcBasePrice = (zeldzaamheid, pokeReset, isPremiumAccount) => {
  let price = 15000 * Number(zeldzaamheid || 1);
  if (pokeReset === 1) price *= 2;
  else if (pokeReset === 2) price *= 3;
  else if (pokeReset >= 3) price *= 4;
  if (isPremiumAccount) price -= price * 0.2;
  return Math.max(0, Math.floor(price));
};

// קבלת הקבוצה (עד 6) כולל מחיר מחושב לבסיס ולפרימיום
export const getTeamForFountain = async (req, res) => {
  try {
    const {userId} = req.query;
    const [[user]] = await DB.query(
      `SELECT premiumaccount FROM gebruikers WHERE user_id = ? LIMIT 1`,
      [userId]
    );
    const isPremiumAcc = user?.premiumaccount > Math.floor(Date.now() / 1000);

    const [rows] = await DB.query(
      `SELECT ps.*, pw.naam AS base_naam, pw.zeldzaamheid, pw.groei,
              pw.aanval_1 AS b1, pw.aanval_2 AS b2, pw.aanval_3 AS b3, pw.aanval_4 AS b4
       FROM pokemon_speler ps
       INNER JOIN pokemon_wild pw ON pw.wild_id = ps.wild_id
       WHERE ps.user_id = ? AND ps.opzak = 'ja'
       ORDER BY ps.opzak_nummer ASC
       LIMIT 6`,
      [userId]
    );

    const mapped = rows.map((r) => {
      const priceBasic = calcBasePrice(r.zeldzaamheid, r.poke_reset || 0, isPremiumAcc);
      const pricePremium = priceBasic * 3;
      return {
        id: r.id,
        wild_id: r.wild_id,
        naam: r.base_naam,
        poke_reset: r.poke_reset || 0,
        zeldzaamheid: r.zeldzaamheid,
        price_basic: priceBasic,
        price_premium: pricePremium,
        ei: r.ei,
      };
    });

    return res.json({ success: true, team: mapped, isPremiumAcc });
  } catch (e) {
    console.error("getTeamForFountain error", e);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// עזרה לחישוב סטאטים לפי לבל 5
const computeLevel5Stats = (poke, base, character) => {
  const lvl = 5;
  console.log(poke,base, character);
  const attack = Math.round(((poke.attack_iv + 2 * base.attack_base) * lvl) / 100 + 5) * character.attack_add;
  const defence = Math.round(((poke.defence_iv + 2 * base.defence_base) * lvl) / 100 + 5) * character.defence_add;
  const speed = Math.round(((poke.speed_iv + 2 * base.speed_base) * lvl) / 100 + 5) * character.speed_add;
  const spcAttack = Math.round(((poke['spc.attack_iv'] + 2 * base["spc.attack_base"]) * lvl) / 100 + 5) * character["spc.attack_add"];
  const spcDefence = Math.round(((poke['spc.defence_iv'] + 2 * base["spc.defence_base"]) * lvl) / 100 + 5) * character["spc.defence_add"];
  const levenmax = Math.round(((poke.hp_iv + 2 * base.hp_base) * lvl) / 100 + 10 + lvl);
  return { attack, defence, speed, spcAttack, spcDefence, levenmax };
};

// Reset בסיסי: מחזיר ללבל 5, מאפס EV/Vitamins/attacks לבייס, מגדיל poke_reset (מוגבל ל-3)
export const fountainResetBasic = async (req, res) => {
  try {
    const { pokemonId, userId} = req.body;
    if (!pokemonId) return res.status(400).json({ success: false, message: "pokemonId is required" });

    const [[user]] = await DB.query(`SELECT silver, premiumaccount FROM gebruikers WHERE user_id = ?`, [userId]);
    const [[poke]] = await DB.query(
      `SELECT ps.*, pw.naam, pw.zeldzaamheid, pw.groei, pw.aanval_1, pw.aanval_2, pw.aanval_3, pw.aanval_4
       FROM pokemon_speler ps
       INNER JOIN pokemon_wild pw ON pw.wild_id = ps.wild_id
       WHERE ps.id = ? AND ps.user_id = ? AND ps.opzak = 'ja' LIMIT 1`,
      [pokemonId, userId]
    );
    if (!poke) return res.status(404).json({ success: false, message: "Invalid pokemon" });
    if (poke.ei === 1) return res.status(400).json({ success: false, message: "Pokemon is an egg" });
    if (poke.level === 5) return res.status(400).json({ success: false, message: "Already level 5" });
    if ((poke.poke_reset || 0) >= 3) return res.status(400).json({ success: false, message: "Max resets reached" });

    const isPremiumAcc = user?.premiumaccount > Math.floor(Date.now() / 1000);
    const price = calcBasePrice(poke.zeldzaamheid, poke.poke_reset || 0, isPremiumAcc);
    if ((user?.silver || 0) < price) return res.status(400).json({ success: false, message: "Not enough silver" });

    const [[character]] = await DB.query(
      `SELECT * FROM karakters WHERE karakter_naam = ? LIMIT 1`,
      [poke.karakter]
    );
    const [[base]] = await DB.query(`SELECT * FROM pokemon_wild WHERE wild_id = ? LIMIT 1`, [poke.wild_id]);
    const [[expInfo]] = await DB.query(
      `SELECT punten FROM experience WHERE soort = ? AND level = 5 LIMIT 1`,
      [base.groei]
    );
    const stats = computeLevel5Stats(poke, base, character);

    await DB.query(
      "UPDATE pokemon_speler SET \
          level = 5, \
          exp = 0, \
          expnodig = ?, \
          totalexp = 0, \
          aanval_1 = ?, aanval_2 = ?, aanval_3 = ?, aanval_4 = ?, \
          effect = '', \
          attack_up = 0, defence_up = 0, speed_up = 0, spc_up = 0, hp_up = 0, \
          attack_ev = 0, defence_ev = 0, speed_ev = 0, \
          `spc.attack_ev` = 0, `spc.defence_ev` = 0, hp_ev = 0, \
          attack = ?, defence = ?, speed = ?, `spc.attack` = ?, `spc.defence` = ?, \
          levenmax = ?, leven = ?, \
          poke_reset = ? \
       WHERE id = ? AND user_id = ? LIMIT 1",
      [
        expInfo?.punten || 0,
        base.aanval_1,
        base.aanval_2,
        base.aanval_3,
        base.aanval_4,
        stats.attack,
        stats.defence,
        stats.speed,
        stats.spcAttack,
        stats.spcDefence,
        stats.levenmax,
        stats.levenmax,
        (poke.poke_reset || 0) + 1,
        pokemonId,
        userId,
      ]
    );

    await DB.query(`UPDATE gebruikers SET silver = silver - ? WHERE user_id = ?`, [price, userId]);

    return res.json({ success: true, message: "Reset basic done", price });
  } catch (e) {
    console.error("fountainResetBasic error", e);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Reset פרימיום: כמו בסיסי + החזרת ויטמינים/אבנים, חזרה לצורה ראשונה (אם יש שרשרת evo)
export const fountainResetPremium = async (req, res) => {
  try {
    const { pokemonId,userId } = req.body;
    if (!pokemonId) return res.status(400).json({ success: false, message: "pokemonId is required" });

    const [[user]] = await DB.query(`SELECT silver, premiumaccount FROM gebruikers WHERE user_id = ?`, [userId]);
    const [[poke]] = await DB.query(
      `SELECT ps.*, pw.naam, pw.zeldzaamheid, pw.groei, pw.aanval_1, pw.aanval_2, pw.aanval_3, pw.aanval_4
       FROM pokemon_speler ps
       INNER JOIN pokemon_wild pw ON pw.wild_id = ps.wild_id
       WHERE ps.id = ? AND ps.user_id = ? AND ps.opzak = 'ja' LIMIT 1`,
      [pokemonId, userId]
    );
    if (!poke) return res.status(404).json({ success: false, message: "Invalid pokemon" });
    if (poke.ei === 1) return res.status(400).json({ success: false, message: "Pokemon is an egg" });
    if (poke.level === 5) return res.status(400).json({ success: false, message: "Already level 5" });

    const isPremiumAcc = user?.premiumaccount > Math.floor(Date.now() / 1000);
    const priceBasic = calcBasePrice(poke.zeldzaamheid, poke.poke_reset || 0, isPremiumAcc);
    const price = priceBasic * 3;
    if ((user?.silver || 0) < price) return res.status(400).json({ success: false, message: "Not enough silver" });

    // מציאת שרשרת אבולוציה (חזרה לצורה ראשונה אם יש)
    let targetWildId = poke.wild_id;
    // חפש evo אחורה: levelen.nieuw_id = current -> get wild_id המקורי
    const [evo1] = await DB.query(`SELECT * FROM levelen WHERE nieuw_id = ? AND wat = 'evo' LIMIT 1`, [targetWildId]);
    if (evo1.length) {
      targetWildId = evo1[0].wild_id;
      const [evo2] = await DB.query(`SELECT * FROM levelen WHERE nieuw_id = ? AND wat = 'evo' LIMIT 1`, [targetWildId]);
      if (evo2.length) {
        targetWildId = evo2[0].wild_id;
        const [evo3] = await DB.query(`SELECT * FROM levelen WHERE nieuw_id = ? AND wat = 'evo' LIMIT 1`, [targetWildId]);
        if (evo3.length) targetWildId = evo3[0].wild_id;
      }
    }

    const [[character]] = await DB.query(
      `SELECT * FROM karakters WHERE karakter_naam = ? LIMIT 1`,
      [poke.karakter]
    );
    const [[base]] = await DB.query(`SELECT * FROM pokemon_wild WHERE wild_id = ? LIMIT 1`, [targetWildId]);
    const [[expInfo]] = await DB.query(
      `SELECT punten FROM experience WHERE soort = ? AND level = 5 LIMIT 1`,
      [base.groei]
    );
    const stats = computeLevel5Stats(poke, base, character);

    // החזרת ויטמינים (Protein/Iron/Carbos/Calcium/HP up)
    const returns = [];
    const addItem = async (itemName, qty) => {
      if (qty <= 0) return;
      returns.push({ item: itemName, qty });
      await DB.query(`UPDATE gebruikers_item SET ?? = ?? + ? WHERE user_id = ?`, [itemName, itemName, qty, userId]);
    };
    await addItem("Protein", Math.floor((poke.attack_up || 0) / 3));
    await addItem("Iron", Math.floor((poke.defence_up || 0) / 3));
    await addItem("Carbos", Math.floor((poke.speed_up || 0) / 3));
    await addItem("Calcium", Math.floor((poke.spc_up || 0) / 3));
    await addItem("HP up", Math.floor((poke.hp_up || 0) / 3));

    // החזרת Mega Stone אם יש ריסט קודם שנרשם כמאפשר החזרה (פשטנו: אם יש עמודה mega_stone)
    if (poke.mega_stone) {
      await addItem(poke.mega_stone, 1);
    }

    await DB.query(
      "UPDATE pokemon_speler SET \
          level = 5, \
          exp = 0, \
          expnodig = ?, \
          totalexp = 0, \
          aanval_1 = ?, aanval_2 = ?, aanval_3 = ?, aanval_4 = ?, \
          effect = '', \
          attack_up = 0, defence_up = 0, speed_up = 0, spc_up = 0, hp_up = 0, \
          attack_ev = 0, defence_ev = 0, speed_ev = 0, \
          `spc.attack_ev` = 0, `spc.defence_ev` = 0, hp_ev = 0, \
          attack = ?, defence = ?, speed = ?, `spc.attack` = ?, `spc.defence` = ?, \
          levenmax = ?, leven = ?, \
          wild_id = ?, \
          humor_change = 0, \
          poke_reset = ? \
       WHERE id = ? AND user_id = ? LIMIT 1",
      [
        expInfo?.punten || 0,
        base.aanval_1,
        base.aanval_2,
        base.aanval_3,
        base.aanval_4,
        stats.attack,
        stats.defence,
        stats.speed,
        stats.spcAttack,
        stats.spcDefence,
        stats.levenmax,
        stats.levenmax,
        targetWildId,
        pokemonId,
        (poke.poke_reset || 0) + 1,
        userId,
      ]
    );

    await DB.query(`UPDATE gebruikers SET silver = silver - ? WHERE user_id = ?`, [price, userId]);

    return res.json({ success: true, message: "Reset premium done", price, returns });
  } catch (e) {
    console.error("fountainResetPremium error", e);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};


