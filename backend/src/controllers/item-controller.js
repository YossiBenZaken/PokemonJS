import DB, { query } from "../config/database.js";
import {
  levelGroei,
  nieuweStats,
  updatePokedex,
} from "../helpers/battle-utils.js";

// קבלת נתוני הפריטים של המשתמש
const getUserItems = async (req, res) => {
  try {
    const userId = req.query.user_id;

    // קבלת פריטים רגילים
    const [userItems] = await DB.query(
      "SELECT * FROM gebruikers_item WHERE user_id = ?",
      [userId]
    );

    // קבלת TM/HM
    const [userTMHM] = await DB.query(
      "SELECT * FROM gebruikers_tmhm WHERE user_id = ?",
      [userId]
    );

    res.json({
      success: true,
      data: {
        gebruikers_item: userItems[0] || {},
        gebruikers_tmhm: userTMHM[0] || {},
      },
    });
  } catch (error) {
    console.error("Error getting user items:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// קבלת פריטים לפי קטגוריה
const getItemsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const normalizedCategory =
      category === "spc_items" ? "special items" : category;

    const items = await DB.query(
      "SELECT * FROM markt WHERE soort = ? ORDER BY soort ASC, id ASC",
      [normalizedCategory]
    );

    res.json({ success: true, data: items });
  } catch (error) {
    console.error("Error getting items by category:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// קבלת פריטים עם כמות
const getItemsWithQuantity = async (req, res) => {
  try {
    const { category } = req.params;
    const userId = req.query.user_id;
    const normalizedCategory =
      category === "spc_items" ? "special items" : category;

    // קבלת פריטים מהקטגוריה
    const items = await DB.query(
      "SELECT * FROM markt WHERE soort = ? ORDER BY soort ASC, id ASC",
      [normalizedCategory]
    );

    // קבלת נתוני המשתמש
    const userItems = await DB.query(
      "SELECT * FROM gebruikers_item WHERE user_id = ?",
      [userId]
    );

    const userTMHM = await DB.query(
      "SELECT * FROM gebruikers_tmhm WHERE user_id = ?",
      [userId]
    );

    const userItemData = { ...userItems[0][0], ...userTMHM[0][0] };

    // חישוב כמות ומחיר מכירה
    const itemsWithQuantity = items[0]
      .filter((item) => {
        return userItemData[item.naam] > 0;
      })
      .map((item) => {
        let currency = "silver";
        let price = 0;

        if (item.gold > 0) {
          currency = "gold";
          price = Math.floor(item.gold * 0.5);
          if (normalizedCategory === "stones") price = 0;
        } else {
          price = Math.floor(item.silver * 0.5);
          if (normalizedCategory === "stones") price = 0;
        }

        return {
          ...item,
          quantity: userItemData[item.naam] || 0,
          sellPrice: price,
          currency,
        };
      });

    res.json({ success: true, data: itemsWithQuantity });
  } catch (error) {
    console.error("Error getting items with quantity:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// מכירת פריט
const sellItem = async (req, res) => {
  try {
    const { name, amount, userId } = req.body;
    const accId = req.user.acc_id;

    if (!name || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid item name or amount",
      });
    }

    // קבלת פרטי הפריט מהשוק
    const [itemData] = await DB.query(
      "SELECT naam, soort, silver, gold FROM markt WHERE naam = ? LIMIT 1",
      [name]
    );

    if (itemData.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    const item = itemData[0];

    // בדיקה אם המשתמש יש לו את הפריט
    const [userItemData] = await DB.query(
      "SELECT * FROM gebruikers_item WHERE user_id = ?",
      [userId]
    );

    const [userTMHMData] = await DB.query(
      "SELECT * FROM gebruikers_tmhm WHERE user_id = ?",
      [userId]
    );

    const userItems = { ...userItemData[0], ...userTMHMData[0] };

    if (!userItems[name] || userItems[name] < amount) {
      return res.status(400).json({
        success: false,
        message: "You do not have enough of this item",
      });
    }

    // חישוב מחיר
    let currency = "silver";
    let price = 0;

    if (item.gold > 0) {
      currency = "gold";
      price = Math.floor(amount * (item.gold * 0.5));
      if (item.soort === "stones") price = 0;
    } else {
      price = Math.floor(amount * (item.silver * 0.5));
      if (item.soort === "stones") price = 0;
    }

    // עדכון כמות הפריט
    if (item.soort === "tm" || item.soort === "hm") {
      await DB.query(
        "UPDATE gebruikers_tmhm SET ?? = ?? - ? WHERE user_id = ? LIMIT 1",
        [name, name, amount, userId]
      );
    } else {
      await DB.query(
        "UPDATE gebruikers_item SET ?? = ?? - ? WHERE user_id = ? LIMIT 1",
        [name, name, amount, userId]
      );
    }

    // עדכון כסף
    if (currency === "gold") {
      await DB.query(
        "UPDATE rekeningen SET gold = gold + ? WHERE acc_id = ? LIMIT 1",
        [price, accId]
      );
    } else {
      await DB.query(
        "UPDATE gebruikers SET silver = silver + ? WHERE user_id = ? LIMIT 1",
        [price, userId]
      );
    }

    res.json({
      success: true,
      message: `Successfully sold ${amount} ${name} for ${price} ${currency}`,
    });
  } catch (error) {
    console.error("Error selling item:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// שימוש בפריט
const useItem = async (req, res) => {
  try {
    const { name, soort, equip = false } = req.body;
    const userId = req.user.user_id;

    if (!name || !soort) {
      return res.status(400).json({
        success: false,
        message: "Item name and type are required",
      });
    }

    // בדיקה אם המשתמש יש לו את הפריט
    const [userItemData] = await DB.query(
      "SELECT * FROM gebruikers_item WHERE user_id = ?",
      [userId]
    );

    const [userTMHMData] = await DB.query(
      "SELECT * FROM gebruikers_tmhm WHERE user_id = ?",
      [userId]
    );

    const userItems = { ...userItemData[0], ...userTMHMData[0] };

    if (!userItems[name] || userItems[name] <= 0) {
      return res.status(400).json({
        success: false,
        message: "You do not have this item",
      });
    }
    if (soort === "stones") {
      const result = await useStone(req, userItems);
      return res.json(result);
    } else if (name === "Rare candy") {
      const result = await useRareCandy(req, userItems);
      return res.json(result);
    }

    res.json({
      success: true,
      message: `Used ${name}`,
    });
  } catch (error) {
    console.error("Error using item:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const useRareCandy = async (req, userItems) => {
  const { pokemonId, name } = req.body;
  const quantity = 1;
  const [pokemon] = await query(
    "SELECT pokemon_wild.*,pokemon_speler.* FROM pokemon_wild INNER JOIN pokemon_speler ON pokemon_speler.wild_id = pokemon_wild.wild_id WHERE pokemon_speler.id=?",
    [pokemonId]
  );
  if (userItems[name] < quantity) {
    return {
      success: false,
      message: "אין לך את הכמות הזו!",
    };
  } else if (pokemon.level + quantity > 100) {
    return {
      success: false,
      message: "אינך יכול להשתמש בסכום זה",
    };
  } else if (quantity < 1) {
    return {
      success: false,
      message: "הזן ערך.",
    };
  }
  let level = pokemon.level + quantity;

  await nieuweStats(pokemon, level, pokemon.expnodig);

  await levelGroei(level, pokemon, req.user.user_id);

  const message = `${pokemon.naam} עלה רמה`;

  await query(
    "INSERT INTO gebeurtenis (datum, ontvanger_id, bericht, gelezen) VALUES (NOW(), ?, ?, '0')",
    [req.user.user_id, message]
  );
  await query(
    `UPDATE \`gebruikers_item\` SET \`${name}\`=\`${name}\`-? WHERE \`user_id\`=?`,
    [quantity, req.user.user_id]
  );
  return {
    success: true,
    message,
  };
};

const useStone = async (req, userItems) => {
  const { pokemonId, name, evolveId } = req.body;
  const quantity = 1;
  const userId = req.user.user_id;
  const [user] = await query("SELECT * FROM `gebruikers` WHERE `user_id`=?", [
    userId,
  ]);
  if (userItems[name] < quantity) {
    return {
      success: false,
      message: "אין לך את הכמות הזו!",
    };
  }
  const [pokemonInfo] = await query(
    "SELECT pokemon_wild.* ,pokemon_speler.*, karakters.* FROM pokemon_wild INNER JOIN pokemon_speler ON pokemon_speler.wild_id = pokemon_wild.wild_id INNER JOIN karakters ON pokemon_speler.karakter = karakters.karakter_naam WHERE pokemon_speler.id=?",
    [pokemonId]
  );
  let [leven] = await query("SELECT nieuw_id FROM `levelen` WHERE `id`=?", [
    evolveId,
  ]);
  if (leven) {
    if (user.wereld === "Alola") {
      if (pokemonInfo.wild_id == "25") {
        leven.nieuw_id = "26001";
      } else if (pokemonInfo.wild_id == "102") {
        leven.nieuw_id = "103001";
      }
    }
    const [newPokemon] = await query(
      "SELECT * FROM `pokemon_wild` WHERE `wild_id`=?",
      [leven.nieuw_id]
    );

    const attackstat = Math.round(
      ((pokemonInfo.attack_iv +
        2 * newPokemon.attack_base +
        Math.floor(pokemonInfo.attack_ev / 4)) *
        pokemonInfo.level) /
        100 +
        5 +
        pokemonInfo.attack_up * pokemonInfo.attack_add
    );
    const defencestat = Math.round(
      ((pokemonInfo.defence_iv +
        2 * newPokemon.defence_base +
        Math.floor(pokemonInfo.defence_ev / 4)) *
        pokemonInfo.level) /
        100 +
        5 +
        pokemonInfo.defence_up * pokemonInfo.defence_add
    );
    const speedstat = Math.round(
      ((pokemonInfo.speed_iv +
        2 * newPokemon.speed_base +
        Math.floor(pokemonInfo.speed_ev / 4)) *
        pokemonInfo.level) /
        100 +
        5 +
        pokemonInfo.speed_up * pokemonInfo.speed_add
    );
    const spcattackstat = Math.round(
      ((pokemonInfo[`spc.attack_iv`] +
        2 * newPokemon[`spc.attack_base`] +
        Math.floor(pokemonInfo["spc.attack_ev"] / 4)) *
        pokemonInfo.level) /
        100 +
        5 +
        pokemonInfo.spc_up * pokemonInfo[`spc.attack_add`]
    );
    const spcdefencestat = Math.round(
      ((pokemonInfo[`spc.defence_iv`] +
        2 * newPokemon[`spc.defence_base`] +
        Math.floor(pokemonInfo["spc.defence_ev"] / 4)) *
        pokemonInfo.level) /
        100 +
        5 +
        pokemonInfo.spc_up * pokemonInfo[`spc.defence_add`]
    );
    const hpstat = Math.round(
      ((pokemonInfo.hp_iv +
        2 * newPokemon.hp_base +
        Math.floor(pokemonInfo.hp_ev / 4)) *
        pokemonInfo.level) /
        100 +
        10 +
        pokemonInfo.level +
        pokemonInfo.hp_up
    );

    const abilities = newPokemon.ability.split(",");
    const randomAbility =
      abilities[Math.floor(Math.random() * abilities.length)];

    await query(
      "UPDATE `pokemon_speler` SET `wild_id`=?, `attack`=?, `defence`=?, `speed`=?, `spc.attack`=?, `spc.defence`=?, `levenmax`=?, `leven`=?, `ability`=?, `decision`=NULL WHERE `id`=?",
      [
        leven.nieuw_id,
        attackstat,
        defencestat,
        speedstat,
        spcattackstat,
        spcdefencestat,
        hpstat,
        hpstat,
        randomAbility,
        pokemonId,
      ]
    );
    updatePokedex(leven.nieuw_id, "evo", userId);
    await query(
      `UPDATE \`gebruikers_item\` SET \`${name}\`=\`${name}\`-'1' WHERE \`user_id\`=?`,
      [userId]
    );

    await levelGroei(
      pokemonInfo.level,
      { ...pokemonInfo, wild_id: leven.nieuw_id },
      userId
    );
  }
};

export {
  getUserItems,
  getItemsByCategory,
  getItemsWithQuantity,
  sellItem,
  useItem,
};
