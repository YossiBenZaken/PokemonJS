import { query } from "../config/database.js";

// GET /api/transferlist?type=direct
export const getTransferList = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const {
      type = "direct",
      mine = 'false',
      specie,
      total,
      shiny,
      region,
      price,
      price_type,
      trainer,
      level,
      level_type,
      equip,
    } = req.query;
    const validTypes = ["private", "auction", "direct"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: "Invalid type" });
    }

    // בדיקת RANK
    const [user] = await query(
      `
        SELECT g.rank, g.huis, g.silver, g.aantalpokemon, r.gold
        FROM gebruikers g
        LEFT JOIN rekeningen r ON g.acc_id = r.acc_id
        WHERE g.user_id = ?
      `,
      [userId]
    );

    if (!user || user.rank < 4) {
      return res.status(403).json({
        error: "דרגה מינימלית לקנייה או מכירה של פוקימונים: 4 - מאמן",
      });
    }

    let whereConditions = [];
    let queryParams = [];

    // Type filter
    if (type === "private") {
      if (mine === "true") {
        whereConditions.push("t.user_id = ?");
        queryParams.push(userId);
      } else {
        whereConditions.push("t.to_user = ?");
        queryParams.push(userId);
      }
      whereConditions.push("t.type = 'private'");
    } else {
      whereConditions.push("t.type = ?");
      queryParams.push(type);

      if (mine === "true") {
        whereConditions.push("t.user_id = ?");
        queryParams.push(userId);
      } else {
        whereConditions.push("t.user_id != ?");
        queryParams.push(userId);
      }
    }

    // Auction filter - רק לילונים פעילים
    if (type === "auction") {
      const currentTime = Math.floor(Date.now() / 1000);
      whereConditions.push("t.time_end > ?");
      queryParams.push(currentTime);
    }

    // Species filter
    if (specie && !isNaN(specie)) {
      whereConditions.push("ps.wild_id = ?");
      queryParams.push(parseInt(specie));
    }

    // Total power filter
    if (total && !isNaN(total)) {
      whereConditions.push(
        "(ps.attack + ps.defence + ps.speed + ps.`spc.attack` + ps.`spc.defence`) >= ?"
      );
      queryParams.push(parseInt(total));
    }

    // Shiny filter
    if (shiny === "true") {
      whereConditions.push("ps.shiny = 1");
    }

    // Region filter
    if (region && region !== "All") {
      whereConditions.push("pw.wereld = ?");
      queryParams.push(region);
    }

    // Price filter
    if (price && !isNaN(price) && ["silver", "golds"].includes(price_type)) {
      const priceCol = price_type === "silver" ? "t.silver" : "t.gold";
      whereConditions.push(`${priceCol} <= ?`);
      queryParams.push(parseInt(price));
    }

    // Trainer filter
    if (trainer) {
      whereConditions.push("g.username = ?");
      queryParams.push(trainer);
    }

    // Level filter
    if (
      level &&
      !isNaN(level) &&
      level > 0 &&
      level <= 100 &&
      ["maior", "menor"].includes(level_type)
    ) {
      const operator = level_type === "maior" ? ">=" : "<=";
      whereConditions.push(`ps.level ${operator} ?`);
      queryParams.push(parseInt(level));
    }

    // Equipment filter
    if (equip) {
      if (equip === "none") {
        whereConditions.push('(ps.item IS NULL OR ps.item = "")');
      } else {
        whereConditions.push("ps.item = ?");
        queryParams.push(equip.replace(/_/g, " "));
      }
    }

    const whereClause =
      whereConditions.length > 0
        ? "WHERE " + whereConditions.join(" AND ")
        : "";

    // Main query
    const mainQuery = `
    SELECT 
      pw.naam,
      pw.type1,
      pw.type2,
      pw.wereld,
      ps.*,
      t.id AS tid,
      t.silver,
      t.gold,
      t.datum,
      t.negociavel,
      t.time_end,
      t.lances,
      g.username AS owner,
      (ps.attack + ps.defence + ps.speed + ps.\`spc.attack\` + ps.\`spc.defence\`) as powertotal
    FROM pokemon_wild pw
    INNER JOIN pokemon_speler ps ON pw.wild_id = ps.wild_id
    INNER JOIN transferlijst t ON t.pokemon_id = ps.id
    INNER JOIN gebruikers g ON ps.user_id = g.user_id
    ${whereClause}
    ORDER BY t.id DESC
  `;

    const items = await query(mainQuery, [...queryParams]);

    res.json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error("Error getting transfer list:", error);
    res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
};
// POST /api/transferlist/buy

export const buyPokemon = async (req, res) => {
  const userId = req.user.user_id;
  const { transferId } = req.body;
  if (!transferId) {
    return res.status(400).json({ error: "Transfer ID is required" });
  }
  const tid = Buffer.from(transferId, "base64").toString("utf-8");
  const [transfer] = await query(
    `
    SELECT t.*, g.acc_id 
    FROM transferlijst t 
    INNER JOIN gebruikers g ON g.user_id = t.user_id 
    WHERE t.id = ?
  `,
    [tid]
  );

  if (!transfer) {
    return res.status(404).json({ error: "Este Pokémon já foi vendido!" });
  }

  // בדיקת RANK
  const [buyer] = await query(
    `
    SELECT g.username, g.silver, g.rank, g.huis, g.aantalpokemon, g.acc_id, r.gold
    FROM gebruikers g
    LEFT JOIN rekeningen r ON g.acc_id = r.acc_id
    WHERE g.user_id = ?
  `,
    [userId]
  );

  if (buyer.rank < 4) {
    return res.status(403).json({
      error: "Você não tem RANK suficiente para comprar Pokémon!",
    });
  }

  // בדיקה אם מנסה לקנות את הפוקימון של עצמו
  if (transfer.user_id === userId) {
    return res
      .status(400)
      .json({ error: "Você não pode comprar seu Pokémon!" });
  }

  // בדיקת פרטיות
  if (transfer.type === "private" && transfer.to_user !== userId) {
    return res
      .status(403)
      .json({ error: "Você não pode comprar este Pokémon!" });
  }

  // בדיקת מחיר
  if (transfer.silver > buyer.silver || transfer.gold > buyer.gold) {
    return res.status(400).json({
      error:
        "Você não tem Silvers ou Gold suficientes para comprar este Pokémon!",
    });
  }

  // בדיקת מקום בבית
  const [houseCount] = await query(
    `
    SELECT COUNT(*) as count 
    FROM pokemon_speler 
    WHERE user_id = ? AND (opzak = 'nee' OR opzak = 'tra')
  `,
    [userId]
  );

  const houseCapacity = {
    doos: 2,
    shuis: 20,
    nhuis: 100,
    villa: 2500,
  };

  const maxCapacity = houseCapacity[buyer.huis] || 0;
  const availableSpace = maxCapacity - houseCount.count;

  if (availableSpace <= 0) {
    return res.status(400).json({
      error: "Você está com sua casa cheia! Compre uma casa maior.",
    });
  }
  // בדיקת לילון
  if (transfer.type === "auction") {
    return res
      .status(400)
      .json({ error: "ERROR 202 - Use lance para leilões" });
  }

  // קבלת מידע על הפוקימון
  const [pokemon] = await query(
    `
    SELECT s.wild_id, s.user_id, s.icon, s.level, s.item, s.roepnaam, w.naam, s.id
    FROM pokemon_speler s
    INNER JOIN pokemon_wild w ON s.wild_id = w.wild_id
    WHERE s.id = ?
  `,
    [transfer.pokemon_id]
  );

  try {
    const [lastInHouse] = await query("SELECT COALESCE(MIN(t1.opzak_nummer) + 1, 1) AS next_opzak_nummer FROM pokemon_speler t1 WHERE NOT EXISTS (SELECT 1 FROM pokemon_speler t2 WHERE t2.user_id = t1.user_id AND t2.opzak = 'nee' AND t2.opzak_nummer = t1.opzak_nummer + 1) AND t1.user_id = ? AND t1.opzak = 'nee'", [userId])

    // העברת הפוקימון לקונה
    await query(
      `
      UPDATE pokemon_speler 
      SET user_id = ?, trade = 1.5, opzak = 'nee', opzak_nummer = ?
      WHERE id = ?
    `,
      [userId, lastInHouse.next_opzak_nummer,transfer.pokemon_id]
    );

    // עדכון כסף וספירה למוכר
    await query(
      `
      UPDATE gebruikers 
      SET silver = silver + ?, aantalpokemon = aantalpokemon - 1
      WHERE user_id = ?
    `,
      [transfer.silver, transfer.user_id]
    );

    await query(
      `
      UPDATE rekeningen 
      SET gold = gold + ?
      WHERE acc_id = ?
    `,
      [transfer.gold, transfer.acc_id]
    );

    // עדכון כסף וספירה לקונה
    await query(
      `
      UPDATE gebruikers 
      SET silver = silver - ?, aantalpokemon = aantalpokemon + 1
      WHERE user_id = ?
    `,
      [transfer.silver, userId]
    );

    await query(
      `
      UPDATE rekeningen 
      SET gold = gold - ?
      WHERE acc_id = ?
    `,
      [transfer.gold, buyer.acc_id]
    );

    // מחיקת הרשומה מרשימת ההעברות
    await query(`DELETE FROM transferlijst WHERE id = ?`, [tid]);

    // רישום בלוג
    await query(
      `
      INSERT INTO transferlist_log 
      (date, wild_id, speler_id, level, seller, buyer, silver, gold, item)
      VALUES (NOW(), ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        pokemon.wild_id,
        pokemon.id,
        pokemon.level,
        transfer.user_id,
        userId,
        transfer.silver || 0,
        transfer.gold || 0,
        pokemon.item || null,
      ]
    );

    // שליחת התראה למוכר
    const eventMessage = `comprou seu Pokémon ${pokemon.naam} por: ${transfer.silver} Silver e ${transfer.gold} Gold!`;
    await query(
      `
      INSERT INTO gebeurtenis (datum, ontvanger_id, bericht, gelezen)
      VALUES (NOW(), ?, ?, 0)
    `,
      [transfer.user_id, eventMessage]
    );

    // // Update quests
    // if (transfer.type === "direct") {
    //   await query(
    //     `
    //     UPDATE quests_status
    //     SET status = 1
    //     WHERE user_id = ? AND quest_key = 'buy_direct'
    //   `,
    //     [userId]
    //   );
    // } else if (transfer.type === "private") {
    //   await query(
    //     `
    //     UPDATE quests_status
    //     SET status = 1
    //     WHERE user_id = ? AND quest_key = 'buy_private'
    //   `,
    //     [userId]
    //   );
    // }

    res.json({
      success: true,
      message: "Pokémon comprado com sucesso!",
      pokemonId: transfer.pokemon_id,
    });
  } catch (error) {
    await query("ROLLBACK");
    throw error;
  }
};

// DELETE /api/transferlist/:pokemonId
export const removeFromTransferList = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    const { pokemonId } = req.params;

    if (!pokemonId || isNaN(pokemonId)) {
      return res.status(400).json({ error: "Invalid pokemon ID" });
    }

    // בדיקה שהפוקימון שייך למשתמש
    const [transfer] = await query(
      `
          SELECT t.id, t.lances, t.type
          FROM transferlijst t
          INNER JOIN pokemon_speler ps ON t.pokemon_id = ps.id
          WHERE ps.id = ? AND ps.user_id = ?
        `,
      [pokemonId, userId]
    );

    if (!transfer) {
      return res
        .status(404)
        .json({ error: "Transfer not found or unauthorized" });
    }

    // בדיקה שאין לנסים בלילון
    if (transfer.type === "auction" && transfer.lances > 0) {
      return res.status(400).json({
        error: "Não é possível remover leilão com lances!",
      });
    }

    await query(`DELETE FROM transferlijst WHERE id = ?`, [transfer.id]);
    await query(
      "UPDATE `pokemon_speler` SET `opzak`='nee' WHERE `id`=? AND `user_id`=?",
      [pokemonId, userId]
    );

    res.json({
      success: true,
      message: "Pokémon removido da lista de transferências",
    });
  } catch (error) {
    console.error("Error removing from transfer list:", error);
    res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
};

export const getFiltersData = async (req, res) => {
  try {
    // רשימת מינים
    const species = await query(`
        SELECT wild_id, naam, real_id 
        FROM pokemon_wild 
        ORDER BY real_id
      `);

    // רשימת פריטים שניתן להצמיד
    const items = await query(`
        SELECT naam 
        FROM markt 
        WHERE equip = 1
        ORDER BY naam
      `);

    const regions = [
      "All",
      "Kanto",
      "Johto",
      "Hoenn",
      "Sinnoh",
      "Unova",
      "Kalos",
      "Alola",
    ];

    res.json({
      success: true,
      data: {
        species,
        items,
        regions,
      },
    });
  } catch (error) {
    console.error("Error getting filters data:", error);
    res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
};
