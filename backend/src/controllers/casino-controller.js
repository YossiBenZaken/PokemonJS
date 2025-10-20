import { ItemBox, addPokemon, calculateTotalItems } from "./market-controller.js";

import { query } from "../config/database.js";

// GET current vault prize and attempt cost
export const getVault = async (req, res) => {
  try {
    const rows = await query("SELECT kluis_4 FROM casino LIMIT 1");
    const prize = rows && rows.length ? Number(rows[0].kluis_4) : 1000;
    return res.json({ success: true, prize, attemptCost: 200 });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "שגיאה בקבלת נתוני הכספת",
        error: error.message,
      });
  }
};

// POST attempt to open vault
export const tryVault = async (req, res) => {
  try {
    const { userId, code1, code2, code3 } = req.body;
    if (!userId)
      return res.status(400).json({ success: false, message: "userId נדרש" });
    const c1 = Number(code1),
      c2 = Number(code2),
      c3 = Number(code3);
    if ([c1, c2, c3].some((v) => Number.isNaN(v) || v < 0 || v > 6)) {
      return res
        .status(400)
        .json({ success: false, message: "קודים לא תקינים" });
    }

    // Load current codes and prize
    const rows = await query(
      "SELECT kluis_1, kluis_2, kluis_3, kluis_4 FROM casino LIMIT 1"
    );
    const casino =
      rows && rows.length
        ? rows[0]
        : { kluis_1: 0, kluis_2: 0, kluis_3: 0, kluis_4: 1000 };

    // Check user tickets balance and cost 200
    const userRows = await query(
      "SELECT tickets FROM gebruikers WHERE user_id = ? LIMIT 1",
      [userId]
    );
    if (!userRows || userRows.length === 0)
      return res.status(404).json({ success: false, message: "משתמש לא נמצא" });
    const currentTickets = Number(userRows[0].tickets) || 0;
    if (currentTickets < 200)
      return res
        .status(400)
        .json({ success: false, message: "אין מספיק Tickets" });

    if (
      c1 === Number(casino.kluis_1) &&
      c2 === Number(casino.kluis_2) &&
      c3 === Number(casino.kluis_3)
    ) {
      // Win: add prize to user, reset codes and prize
      const prize = Number(casino.kluis_4) || 1000;
      const r1 = Math.floor(Math.random() * 7);
      const r2 = Math.floor(Math.random() * 7);
      const r3 = Math.floor(Math.random() * 7);

      await query(
        "UPDATE gebruikers SET tickets = tickets + ? WHERE user_id = ?",
        [prize, userId]
      );
      await query(
        "UPDATE casino SET kluis_1 = ?, kluis_2 = ?, kluis_3 = ?, kluis_4 = 1000",
        [r1, r2, r3]
      );
      await query("TRUNCATE TABLE kluis_kraken");

      return res.json({
        success: true,
        won: true,
        prize,
        message: "קוד נכון! זכית בפרס.",
      });
    } else {
      // Lose: deduct 200, add 200 to prize, log guess
      await query(
        "UPDATE gebruikers SET tickets = tickets - 200 WHERE user_id = ?",
        [userId]
      );
      await query("UPDATE casino SET kluis_4 = kluis_4 + 200");
      await query("INSERT INTO kluis_kraken (`1`, `2`, `3`) VALUES (?, ?, ?)", [
        c1,
        c2,
        c3,
      ]);

      const newPrizeRows = await query("SELECT kluis_4 FROM casino LIMIT 1");
      const newPrize =
        newPrizeRows && newPrizeRows.length
          ? Number(newPrizeRows[0].kluis_4)
          : undefined;
      return res.json({
        success: true,
        won: false,
        newPrize,
        message: "קוד שגוי.",
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "שגיאה בניסיון פתיחת כספת",
        error: error.message,
      });
  }
};

export const startWhoIs = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId)
      return res.status(400).json({ success: false, message: "userId נדרש" });

    const [user] = await query(
      "SELECT tickets, whoquiz FROM gebruikers WHERE user_id = ?",
      [userId]
    );
    if (!user)
      return res.status(404).json({ success: false, message: "משתמש לא נמצא" });

    const lastTime = new Date(user.whoquiz).getTime();
    const now = Date.now();
    const diff = now - lastTime;
    const remaining = 3600_000 - diff;

    if (remaining > 0) {
      return res.json({
        success: false,
        wait: true,
        countdown: Math.floor(remaining / 1000),
      });
    }

    if (user.tickets < 50) {
      return res
        .status(400)
        .json({ success: false, message: "אין מספיק Tickets" });
    }

    const [pkmn] = await query(
      "SELECT wild_id FROM pokemon_wild ORDER BY RAND() LIMIT 1"
    );
    const status = Math.random() < 0.5 ? "shiny" : "pokemon";

    await query("UPDATE gebruikers SET whoquiz = NOW() WHERE user_id = ?", [
      userId,
    ]);

    return res.json({
      success: true,
      cost: 50,
      image: { id: pkmn.wild_id, status },
    });
  } catch (err) {
    return res
      .status(500)
      .json({
        success: false,
        message: "שגיאה אתחול משחק",
        error: err.message,
      });
  }
};

export const guessWhoIs = async (req, res) => {
  try {
    const { userId, guess, correctId } = req.body;
    if (!userId || !guess || !correctId)
      return res.status(400).json({ success: false, message: "שדות חסרים" });

    const [user] = await query(
      "SELECT tickets FROM gebruikers WHERE user_id = ?",
      [userId]
    );
    if (!user)
      return res.status(404).json({ success: false, message: "משתמש לא נמצא" });
    if (user.tickets < 50)
      return res
        .status(400)
        .json({ success: false, message: "אין מספיק Tickets" });

    await query(
      "UPDATE gebruikers SET tickets = tickets - 50 WHERE user_id = ?",
      [userId]
    );

    if (Number(guess) === Number(correctId)) {
      await query(
        "UPDATE gebruikers SET tickets = tickets + 100 WHERE user_id = ?",
        [userId]
      );
      return res.json({
        success: true,
        correct: true,
        prize: 100,
        message: "ניחוש נכון!",
      });
    } else {
      const [row] = await query(
        "SELECT naam FROM pokemon_wild WHERE wild_id = ?",
        [correctId]
      );
      return res.json({
        success: true,
        correct: false,
        answer: row.naam,
        message: "ניחוש שגוי",
      });
    }
  } catch (err) {
    return res
      .status(500)
      .json({
        success: false,
        message: "שגיאה בבדיקת תשובה",
        error: err.message,
      });
  }
};

export const spinFortune = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId)
      return res.status(400).json({ success: false, message: "userId נדרש" });

    const [user] = await query(
      "SELECT g.lucky_wheel, gi.itembox FROM gebruikers AS g INNER JOIN gebruikers_item AS gi ON g.user_id = gi.user_id WHERE g.user_id = ?",
      [userId]
    );
    const totalItems = await calculateTotalItems(userId);
    const maxItems = ItemBox[user.itembox] || 20;
    const item_over = maxItems - totalItems;
    if (!user)
      return res.status(404).json({ success: false, message: "משתמש לא נמצא" });
    if (user.lucky_wheel <= 0)
      return res
        .status(400)
        .json({ success: false, message: "אין לך יותר ספינים היום" });

    const roll = Math.floor(Math.random() * 6);
    let reward = null;
    let type = "";

    const giveItem = async (sql, table) => {
      if (item_over <= 0) return { error: "אין מקום בתיק פריטים שלך" };
      const [item] = await query(sql);
      await query(
        `UPDATE ${table} SET \`${item.naam}\` = \`${item.naam}\`+1 WHERE user_id = ?`,
        [userId]
      );
      return { name: item.naam };
    };
    if (roll === 0) {
      await query(
        "UPDATE gebruikers SET tickets = tickets+100, lucky_wheel = lucky_wheel-1 WHERE user_id = ?",
        [userId]
      );
      reward = 100;
      type = "tickets";
    } else if (roll === 1) {
      await query(
        "UPDATE gebruikers SET tickets = tickets+250, lucky_wheel = lucky_wheel-1 WHERE user_id = ?",
        [userId]
      );
      reward = 250;
      type = "tickets";
    } else if (roll === 2) {
      const r = await giveItem(
        "SELECT naam FROM markt WHERE soort='balls' AND naam NOT IN ('Master ball','DNA ball','Santa ball','Cherish ball','Antique ball','Black ball','Frozen ball','GS ball','Trader ball','Ecology ball') ORDER BY RAND() LIMIT 1",
        "gebruikers_item"
      );
      if (r.error)
        return res.status(400).json({ success: false, message: r.error });
      await query(
        "UPDATE gebruikers SET lucky_wheel = lucky_wheel-1 WHERE user_id = ?",
        [userId]
      );
      reward = r.name;
      type = "ball";
    } else if (roll === 3) {
      const r = await giveItem(
        "SELECT naam FROM markt WHERE soort='special items' AND roleta='sim' ORDER BY RAND() LIMIT 1",
        "gebruikers_item"
      );
      if (r.error)
        return res.status(400).json({ success: false, message: r.error });
      await query(
        "UPDATE gebruikers SET lucky_wheel = lucky_wheel-1 WHERE user_id = ?",
        [userId]
      );
      reward = r.name;
      type = "special";
    } else if (roll === 4) {
      const r = await giveItem(
        "SELECT naam FROM markt WHERE soort='stones' AND roleta='sim' ORDER BY RAND() LIMIT 1",
        "gebruikers_item"
      );
      if (r.error)
        return res.status(400).json({ success: false, message: r.error });
      await query(
        "UPDATE gebruikers SET lucky_wheel = lucky_wheel-1 WHERE user_id = ?",
        [userId]
      );
      reward = r.name;
      type = "stone";
    } else if (roll === 5) {
      const r = await giveItem(
        "SELECT naam FROM markt WHERE soort='tm' AND gold='0' AND silver<'60000' AND beschikbaar='1' AND roleta='sim' ORDER BY RAND() LIMIT 1",
        "gebruikers_tmhm"
      );
      if (r.error)
        return res.status(400).json({ success: false, message: r.error });
      await query(
        "UPDATE gebruikers SET lucky_wheel = lucky_wheel-1 WHERE user_id = ?",
        [userId]
      );
      reward = r.name;
      type = "tm";
    }

    return res.json({
      success: true,
      result: roll,
      type,
      reward,
      message:
        type === "tickets" ? `זכית ב-${reward} Tickets!` : `קיבלת ${reward}!`,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "שגיאה בסיבוב גלגל המזל",
      error: err.message,
    });
  }
};

export const buyTickets = async (req, res) => {
  try {
    const { userId, quantity } = req.body;
    const q = Number(quantity);
    if (!userId || !q || q < 1)
      return res.status(400).json({ success: false, message: "קלט שגוי" });

    const [user] = await query(
      "SELECT silver FROM gebruikers WHERE user_id = ?",
      [userId]
    );
    const price = 2500 * q;
    const tickets = 50 * q;
    if (user.silver < price)
      return res
        .status(400)
        .json({ success: false, message: "אין מספיק Silvers" });

    await query(
      "UPDATE gebruikers SET silver = silver - ?, tickets = tickets + ? WHERE user_id = ?",
      [price, tickets, userId]
    );
    return res.json({ success: true, ticketsGained: tickets });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const sellTickets = async (req, res) => {
  try {
    const { userId, quantity } = req.body;
    const q = Number(quantity);
    if (!userId || !q || q < 1)
      return res.status(400).json({ success: false, message: "קלט שגוי" });

    const [user] = await query(
      "SELECT tickets FROM gebruikers WHERE user_id = ?",
      [userId]
    );
    const needed = 50 * q;
    const silvers = 1250 * q;
    if (user.tickets < needed)
      return res
        .status(400)
        .json({ success: false, message: "אין מספיק Tickets" });

    await query(
      "UPDATE gebruikers SET tickets = tickets - ?, silver = silver + ? WHERE user_id = ?",
      [needed, silvers, userId]
    );
    return res.json({ success: true, silversGained: silvers });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getStoreItems = async (req, res) => {
  try {
    const items = await query(
      "SELECT * FROM casino_store WHERE is_buy=1 ORDER BY type, price"
    );
    return res.json({ success: true, items });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const buyStoreItem = async (req, res) => {
  try {
    const { userId, itemId } = req.body;
    if (!userId || !itemId)
      return res.status(400).json({ success: false, message: "קלט שגוי" });

    const [user] = await query(
      "SELECT tickets, COUNT(ps.wild_id) AS in_hand, gi.itembox FROM gebruikers AS g INNER JOIN pokemon_speler AS ps ON g.user_id = ps.user_id INNER JOIN gebruikers_item AS gi ON g.user_id = gi.user_id WHERE g.user_id = ? AND ps.opzak='ja'",
      [userId]
    );
    const [item] = await query(
      "SELECT * FROM casino_store WHERE id = ? AND is_buy = 1",
      [itemId]
    );
    if (!item)
      return res.status(404).json({ success: false, message: "פריט לא נמצא" });
    if (user.tickets < item.price)
      return res
        .status(400)
        .json({ success: false, message: "אין מספיק Tickets" });

    if (item.type === 0) {
      // לקניית פוקימון חדש
      if (user.in_hand >= 6)
        return res
          .status(200)
          .json({ success: false, message: "יש לך כבר 6 פוקימונים אצלך" });

      addPokemon(userId, item.type_val, user.in_hand);
      await query(
        "UPDATE gebruikers SET tickets = tickets - ? WHERE user_id = ?",
        [item.price, userId]
      );
      return res.json({ success: true, message: `קנית את ${item.name}` });
    } else {
      const totalItems = await calculateTotalItems(userId);
      const maxItems = ItemBox[user[0]?.itembox] || 20;
      const itemOver = maxItems - totalItems;
      if (itemOver < 1)
        return res
          .status(400)
          .json({ success: false, message: "אין מקום בתיק פריטים" });

      await query(
        `UPDATE gebruikers_tmhm SET \`${item.name}\` = \`${item.name}\` + 1 WHERE user_id = ?`,
        [userId]
      );
      await query(
        "UPDATE gebruikers SET tickets = tickets - ? WHERE user_id = ?",
        [item.price, userId]
      );
      return res.json({ success: true, message: `קנית את ${item.name}` });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
