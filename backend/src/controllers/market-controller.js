import DB from "../config/database.js";

export const ItemBox = {
  Bag: 20,
  "Yellow box": 50,
  "Blue box": 100,
  "Red box": 250,
  "Purple box": 500,
  "Black box": 1000,
};

// פונקציה עזר לחישוב כמות הפריטים הכוללת
export const calculateTotalItems = async (userId) => {
  const itemsCount = await DB.query(
    `
    SELECT SUM(
      \`Poke ball\`+\`Great ball\`+\`Ultra ball\`+\`Premier ball\`+\`Net ball\`+\`Dive ball\`+\`Nest ball\`+\`Repeat ball\`+\`Timer ball\`+\`Master ball\`+\`Moon ball\`+\`Dusk ball\`+\`Dream ball\`+\`Luxury ball\`+\`Rocket ball\`+\`DNA ball\`+\`Cherish ball\`+\`Antique ball\`+\`Black ball\`+\`Frozen ball\`+\`Santa ball\`+\`GS ball\`+\`Potion\`+\`Super potion\`+\`Hyper potion\`+\`Full heal\`+\`Revive\`+\`Max revive\`+\`Pokedex\`+\`Pokedex chip\`+\`Fishing rod\`+\`Cave suit\`+\`Bike\`+\`Protein\`+\`Iron\`+\`Carbos\`+\`Calcium\`+\`HP up\`+\`Rare candy\`+\`Duskstone\`+\`Firestone\`+\`Leafstone\`+\`Moonstone\`+\`Ovalstone\`+\`Shinystone\`+\`Sunstone\`+\`Thunderstone\`+\`Waterstone\`+\`Dawnstone\`+\`Garchompite\`+\`Absolite\`+\`Banettite\`+\`Manectite\`+\`Medichamite\`+\`Aggronite\`+\`Gardevoirite\`+\`Tyranitarite\`+\`Houndoominite\`+\`Heracronite\`+\`Ampharosite\`+\`Scizorite\`+\`Gyaradosite\`+\`Pinsirite\`+\`Kangaskhanite\`+\`Gengarite\`+\`Alakazite\`+\`Blastoisinite\`+\`Charizardite Y\`+\`Charizardite X\`+\`Venusaurite\`+\`Mawilite\`+\`Aerodactylite\`+\`Lucarionite\`+\`Abomasite\`+\`Mewtwonite X\`+\`Mewtwonite Y\`+\`Blazikenite\`+\`Latiasite\`+\`Latiosite\`+\`Diancienite\`+\`Nightmare Unbound Orb\`+\`Omega Primal Stone\`+\`Alpha Primal Stone\`+\`Pidgeotite\`+\`Glalietite\`+\`Altarianite\`+\`Audinotite\`+\`Beedrillnite\`+\`Cameruptite\`+\`Galladerite\`+\`Lopunnynite\`+\`Metagrossite\`+\`Sableyetite\`+\`Salamencenite\`+\`Sceptilenite\`+\`Sharpedorite\`+\`Slowbronite\`+\`Steelixite\`+\`Swampertite\`+\`Rayquazanite\`+\`Trader ball\`+\`Ecology ball\`+\`Ice Stone\`+\`Soothe Bell\`+\`Yellow Nectar\`+\`Pink Nectar\`+\`Red Nectar\`+\`Purple Nectar\`+\`Everstone\`+\`Burn Drive\`+\`Chill Drive\`+\`Douse Drive\`+\`Shock Drive\`+\`Black Belt\`+\`Black Glasses\`+\`Black Sludge\`+\`Charcoal\`+\`Dragon Fang\`+\`Hard Stone\`+\`Magnet\`+\`Miracle Seed\`+\`Mystic Water\`+\`Never-Melt Ice\`+\`Twisted Spoon\`+\`Sharp Beak\`+\`Silk Scarf\`+\`Silver Powder\`+\`Soft Sand\`+\`Spell Tag\`+\`Metal Powder\`+\`Eviolite\`+\`Dragon Scale\`+\`Metal Coat\`+\`Kings Rock\`+\`Whipped Dream\`+\`Dubious Disc\`+\`Up-Grade\`+\`Sachet\`+\`Reaper Cloth\`+\`Protector\`+\`Electirizer\`+\`Magmarizer\`+\`Expert Belt\`+\`Muscle Band\`+\`Wise Glasses\`+\`Focus Sash\`+\`Razor Claw\`+\`Razor Fang\`+\`Lucky Egg\`+\`Air Balloon\`+\`Safety Goggles\`+\`Macho Brace\`+\`Power Weight\`+\`Power Bracer\`+\`Power Belt\`+\`Power Lens\`+\`Power Band\`+\`Power Anklet\`+\`Moomoo Milk\`+\`Fresh Water\`+\`Soda Pop\`+\`Lemonade\`+\`Scope Lens\`+\`Focus Band\`+\`Metronome\`+\`Damp Rock\`+\`Heat Rock\`+\`Icy Rock\`+\`Smooth Rock\`+\`Light Ball\`+\`Thick Club\`+\`Lucky Punch\`+\`Stick\`+\`Soul Dew\`+\`Wide Lens\`+\`Buginium Z\`+\`Darkinium Z\`+\`Dragonium Z\`+\`Electrium Z\`+\`Fairium Z\`+\`Fightinium Z\`+\`Firium Z\`+\`Flyinium Z\`+\`Ghostium Z\`+\`Grassium Z\`+\`Groundium Z\`+\`Icium Z\`+\`Normalium Z\`+\`Poisonium Z\`+\`Psychium Z\`+\`Rockium Z\`+\`Steelium Z\`+\`Waterium Z\`+\`Pikashunium Z\`+\`Pikanium Z\`+\`Kommonium Z\`+\`Eevium Z\`+\`Mewnium Z\`+\`Tapunium Z\`+\`Mimikium Z\`+\`Ultranecrozium Z\`+\`Incinium Z\`+\`Lunalium Z\`+\`Primarium Z\`+\`Snorlium Z\`+\`Solganium Z\`+\`Decidium Z\`+\`Marshadium Z\`+\`Lycanium Z\`+\`Draco Plate\`+\`Dread Plate\`+\`Iron Plate\`+\`Spooky Plate\`+\`Mind Plate\`+\`Insect Plate\`+\`Toxic Plate\`+\`Sky Plate\`+\`Stone Plate\`+\`Earth Plate\`+\`Fist Plate\`+\`Icicle Plate\`+\`Zap Plate\`+\`Meadow Plate\`+\`Flame Plate\`+\`Splash Plate\`+\`Bug Memory\`+\`Dark Memory\`+\`Dragon Memory\`+\` Electric Memory\`+\`Fairy Memory\`+\`Fighting Memory\`+\`Fire Memory\`+\` Flying Memory\`+\`Ghost Memory\`+\`Grass Memory\`+\`Ground Memory\`+\`Ice Memory\`+\`Poison Memory\`+\`Psychic Memory\`+\`Rock Memory\`+\`Steel Memory\`+\`Water Memory\`
    ) AS \`items\` FROM \`gebruikers_item\` WHERE \`user_id\` = ?
  `,
    [userId]
  );

  const tmhmCount = await DB.query(
    `
    SELECT SUM(
      \`TM01\` + \`TM02\` + \`TM03\` + \`TM04\` + \`TM05\` + \`TM06\` + \`TM07\` + \`TM08\` + \`TM09\` + \`TM10\` + \`TM11\` + \`TM12\` + \`TM13\` + \`TM14\` + \`TM15\` + \`TM16\` + \`TM17\` + \`TM18\` + \`TM19\` + \`TM20\` + \`TM21\` + \`TM22\` + \`TM23\` + \`TM24\` + \`TM25\` + \`TM26\` + \`TM27\` + \`TM28\` + \`TM29\` + \`TM30\` + \`TM31\` + \`TM32\` + \`TM33\` + \`TM34\` + \`TM35\` + \`TM36\` + \`TM37\` + \`TM38\` + \`TM39\` + \`TM40\` + \`TM41\` + \`TM42\` + \`TM43\` + \`TM44\` + \`TM45\` + \`TM46\` + \`TM47\` + \`TM48\` + \`TM49\` + \`TM50\` + \`TM51\` + \`TM52\` + \`TM53\` + \`TM54\` + \`TM55\` + \`TM56\` + \`TM57\` + \`TM58\` + \`TM59\` + \`TM60\` + \`TM61\` + \`TM62\` + \`TM63\` + \`TM64\` + \`TM65\` + \`TM66\` + \`TM67\` + \`TM68\` + \`TM69\` + \`TM70\` + \`TM71\` + \`TM72\` + \`TM73\` + \`TM74\` + \`TM75\` + \`TM76\` + \`TM77\` + \`TM78\` + \`TM79\` + \`TM80\` + \`TM81\` + \`TM82\` + \`TM83\` + \`TM84\` + \`TM85\` + \`TM86\` + \`TM87\` + \`TM88\` + \`TM89\` + \`TM90\` + \`TM91\` + \`TM92\` + \`HM01\` + \`HM02\` + \`HM03\` + \`HM04\` + \`HM05\` + \`HM06\` + \`HM07\` + \`HM08\` + \`TM93\` + \`TM94\` + \`TM95\` + \`TM96\` + \`TM97\` + \`TM98\` + \`TM99\` + \`TM100\`
    ) AS \`items\` FROM \`gebruikers_tmhm\` WHERE \`user_id\` = ?
  `,
    [userId]
  );

  return (
    Number(itemsCount[0][0].items || 0) + Number(tmhmCount[0][0]?.items || 0)
  );
};

export const addPokemon = async(userId, pokemonId, in_hand) => {
  const [[pokemonRows]] = await DB.query(
    `SELECT wild_id, naam, groei, attack_base, defence_base, speed_base, 
            \`spc.attack_base\`, \`spc.defence_base\`, hp_base, 
            aanval_1, aanval_2, aanval_3, aanval_4, ability 
       FROM pokemon_wild 
      WHERE wild_id = ? 
      LIMIT 1`,
    [pokemonId]
  );

  const query = pokemonRows;
  let abilityList = query.ability.split(",");
  let ability = abilityList[Math.floor(Math.random() * abilityList.length)];

  const date = new Date().toISOString().slice(0, 19).replace("T", " ");

  await DB.query(
    `INSERT INTO pokemon_speler 
   (wild_id, aanval_1, aanval_2, aanval_3, aanval_4)
 SELECT wild_id, aanval_1, aanval_2, aanval_3, aanval_4
   FROM pokemon_wild 
  WHERE wild_id = ?`,
    [query.wild_id]
  );

  const [[result]] = await DB.query("SELECT LAST_INSERT_ID() as id");
  const pokeid = result.id;

  const [[karakterRows]] = await DB.query(
    `SELECT * FROM karakters ORDER BY RAND() LIMIT 1`
  );
  const karakter = karakterRows;

  const [[expRows]] = await DB.query(
    `SELECT punten FROM experience WHERE soort = ? AND level = '6'`,
    [query.groei]
  );
  const experience = expRows;

  // יצירת IVs רנדומליים
  const randomIV = () => Math.floor(Math.random() * (31 - 2 + 1)) + 2;

  const attack_iv = randomIV();
  const defence_iv = randomIV();
  const speed_iv = randomIV();
  const spcattack_iv = randomIV();
  const spcdefence_iv = randomIV();
  const hp_iv = randomIV();

  // חישוב סטאטים
  const attackstat = Math.round(
    (((attack_iv + 2 * query.attack_base) * 5) / 100 + 5) *
      karakter.attack_add
  );
  const defencestat = Math.round(
    (((defence_iv + 2 * query.defence_base) * 5) / 100 + 5) *
      karakter.defence_add
  );
  const speedstat = Math.round(
    (((speed_iv + 2 * query.speed_base) * 5) / 100 + 5) * karakter.speed_add
  );
  const spcattackstat = Math.round(
    (((spcattack_iv + 2 * query["spc.attack_base"]) * 5) / 100 + 5) *
      karakter["spc.attack_add"]
  );
  const spcdefencestat = Math.round(
    (((spcdefence_iv + 2 * query["spc.defence_base"]) * 5) / 100 + 5) *
      karakter["spc.defence_add"]
  );
  const hpstat = Math.round(((hp_iv + 2 * query.hp_base) * 5) / 100 + 10 + 5);

  // עדכון כל הנתונים של הפוקימון החדש
  await DB.query(
    `UPDATE pokemon_speler 
    SET level = 5,
        karakter = ?,
        expnodig = ?,
        user_id = ?,
        opzak = 'ja',
        opzak_nummer = ?,
        ei = 1,
        ei_tijd = ?,
        \`attack_iv\` = ?, 
        \`defence_iv\` = ?, 
        \`speed_iv\` = ?, 
        \`spc.attack_iv\` = ?, 
        \`spc.defence_iv\` = ?, 
        \`hp_iv\` = ?, 
        \`attack\` = ?, 
        \`defence\` = ?, 
        \`speed\` = ?, 
        \`spc.attack\` = ?, 
        \`spc.defence\` = ?, 
        \`levenmax\` = ?, 
        \`leven\` = ?, 
        \`ability\` = ?, 
        \`capture_date\` = ?
  WHERE id = ?
  LIMIT 1`,
    [
      karakter.karakter_naam,
      experience.punten,
      userId,
      in_hand + 1,
      new Date(),
      attack_iv,
      defence_iv,
      speed_iv,
      spcattack_iv,
      spcdefence_iv,
      hp_iv,
      attackstat,
      defencestat,
      speedstat,
      spcattackstat,
      spcdefencestat,
      hpstat,
      hpstat,
      ability,
      date,
      pokeid,
    ]
  );
}

// קבלת פריטים לפי קטגוריה
const getMarketItems = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1 } = req.query;
    const limit = 20;
    const offset = (page - 1) * limit;

    const normalizedCategory =
      category === "specialitems" ? "special items" : category;

    let sql = "SELECT * FROM markt WHERE soort = ? AND beschikbaar = 1";
    let params = [normalizedCategory];
    if (category == "attacks") {
      sql =
        "SELECT * FROM markt WHERE soort IN ('tm','hm') AND beschikbaar = 1";
      params = [];
    }
    // עבור פוקימונים, נוסיף JOIN עם pokemon_wild
    if (normalizedCategory === "pokemon") {
      sql = `SELECT markt.id, markt.pokemonid, markt.silver, markt.gold, 
                    markt.omschrijving_en, markt.omschrijving_en, markt.beschikbaar,
                    pokemon_wild.zeldzaamheid
             FROM markt 
             INNER JOIN pokemon_wild ON markt.pokemonid = pokemon_wild.wild_id 
             WHERE markt.soort = ? AND markt.beschikbaar = 1`;
    }

    sql += ` ORDER BY silver, gold LIMIT ${limit} OFFSET ${offset}`;

    const items = await DB.query(sql, params);

    res.json({ success: true, data: items[0] });
  } catch (error) {
    console.error("Error getting market items:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// קבלת מלאי המשתמש
const getUserInventory = async (req, res) => {
  try {
    const userId = req.query.user_id;
    const accId = req.user.acc_id;
    // קבלת נתוני המשתמש
    const user = await DB.query(
      "SELECT g.silver, COUNT(ps.wild_id) AS in_hand, gi.itembox FROM gebruikers AS g INNER JOIN pokemon_speler AS ps ON g.user_id = ps.user_id INNER JOIN gebruikers_item AS gi ON g.user_id = gi.user_id WHERE g.user_id = ? AND ps.opzak='ja'",
      [userId]
    );

    // קבלת זהב
    const account = await DB.query(
      "SELECT gold FROM accounts WHERE acc_id = ?",
      [accId]
    );

    const myItems = await DB.query(
      `
      SELECT * FROM \`gebruikers_item\` WHERE \`user_id\` = ?
    `,
      [userId]
    );

    const itemsObj = myItems[0][0];
    const filtered = Object.entries(itemsObj)
      .filter(
        ([key, value]) =>
          key !== "itembox" && key !== "user_id" && Number(value) > 0
      )
      .reduce((a, [key, value]) => {
        return { ...a, [key]: value };
      }, {});

    // חישוב כמות הפריטים הכוללת
    const userResult = user[0];
    const totalItems = await calculateTotalItems(userId);
    const maxItems = ItemBox[userResult[0]?.itembox] || 20;
    const itemOver = maxItems - totalItems;
    res.json({
      success: true,
      data: {
        silver: userResult[0]?.silver || 0,
        gold: account[0][0]?.gold || 0,
        item_over: itemOver,
        itembox: userResult[0]?.itembox || "Bag",
        items: totalItems,
        myItems: filtered,
        in_hand: userResult[0]?.in_hand || 0,
      },
    });
  } catch (error) {
    console.error("Error getting user inventory:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// קניית פריט רגיל
const buyItem = async (req, res) => {
  try {
    const { itemId, amount, userId } = req.body;
    const accId = req.user.acc_id;

    if (!itemId || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid item ID or amount",
      });
    }

    // קבלת פרטי הפריט
    const item = await DB.query(
      "SELECT * FROM markt WHERE id = ? AND beschikbaar = 1",
      [itemId]
    );

    if (item.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Item not found or not available",
      });
    }

    const itemData = item[0][0];

    // קבלת נתוני המשתמש
    const user = await DB.query(
      "SELECT g.silver, COUNT(ps.wild_id) AS in_hand, gi.itembox FROM gebruikers AS g INNER JOIN pokemon_speler AS ps ON g.user_id = ps.user_id INNER JOIN gebruikers_item AS gi ON g.user_id = gi.user_id WHERE g.user_id = ? AND ps.opzak='ja'",
      [userId]
    );

    const account = await DB.query(
      "SELECT gold FROM accounts WHERE acc_id = ?",
      [accId]
    );

    const userData = user[0][0];
    const accountData = account[0][0];
    // חישוב מחיר
    let totalSilver = 0;
    let totalGold = 0;

    if (itemData.gold > 0) {
      totalGold = amount * itemData.gold;
    } else {
      totalSilver = amount * itemData.silver;
    }

    // בדיקת כסף
    if (userData.silver < totalSilver || accountData.gold < totalGold) {
      return res.status(400).json({
        success: false,
        message: "Not enough money",
      });
    }

    // בדיקת מקום בתיק
    const currentTotalItems = await calculateTotalItems(userId);
    const currentMaxItems = ItemBox[userData.itembox] || 20;
    const currentItemOver = currentMaxItems - currentTotalItems;
    const spaceNeeded = amount;

    if (currentItemOver < spaceNeeded) {
      return res.status(400).json({
        success: false,
        message: "Not enough space in inventory",
      });
    }

    // עדכון מלאי המשתמש
    if (itemData.soort === "tm" || itemData.soort === "hm") {
      await DB.query(
        "UPDATE gebruikers_tmhm SET ?? = ?? + ? WHERE user_id = ?",
        [itemData.naam, itemData.naam, amount, userId]
      );
    } else if ([117, 119, 120, 121].includes(itemId)) {
      await DB.query(
        "UPDATE gebruikers_item SET itembox = ? WHERE user_id = ?",
        [itemData.naam, userId]
      );
    } else {
      await DB.query(
        "UPDATE gebruikers_item SET ?? = ?? + ? WHERE user_id = ?",
        [itemData.naam, itemData.naam, amount, userId]
      );
    }

    // עדכון כסף
    if (totalSilver > 0) {
      await DB.query(
        "UPDATE gebruikers SET silver = silver - ? WHERE user_id = ?",
        [totalSilver, userId]
      );
    }

    if (totalGold > 0) {
      await DB.query("UPDATE accounts SET gold = gold - ? WHERE acc_id = ?", [
        totalGold,
        accId,
      ]);
    }

    // חישוב מחדש של כמות הפריטים הכוללת
    const newTotalItems = await calculateTotalItems(userId);
    const newMaxItems = ItemBox[userData.itembox] || 20;
    const newItemOver = newMaxItems - newTotalItems;

    res.json({
      success: true,
      message: `Successfully bought ${amount} ${itemData.naam}`,
      newInventory: {
        silver: userData.silver - totalSilver,
        gold: accountData.gold - totalGold,
        item_over: newItemOver,
        itembox: userData.itembox,
        items: newTotalItems,
        in_hand: userData.in_hand,
      },
    });
  } catch (error) {
    console.error("Error buying item:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// קניית פוקימון
const buyPokemon = async (req, res) => {
  try {
    const { productId, userId } = req.body;
    const accId = req.user.acc_id;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // קבלת פרטי הפוקימון
    const pokemon = await DB.query(
      'SELECT * FROM markt WHERE id = ? AND soort = "pokemon" AND beschikbaar = 1',
      [productId]
    );

    if (pokemon.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Pokemon not found or not available",
      });
    }

    const pokemonData = pokemon[0][0];
    // קבלת נתוני המשתמש
    const user = await DB.query(
      "SELECT g.silver, COUNT(ps.wild_id) AS in_hand, gi.itembox FROM gebruikers AS g INNER JOIN pokemon_speler AS ps ON g.user_id = ps.user_id INNER JOIN gebruikers_item AS gi ON g.user_id = gi.user_id WHERE g.user_id = ? AND ps.opzak='ja'",
      [userId]
    );

    const account = await DB.query(
      "SELECT gold FROM accounts WHERE acc_id = ?",
      [accId]
    );

    const userData = user[0][0];
    const accountData = account[0][0];

    // בדיקת כסף
    if (
      userData.silver < pokemonData.silver ||
      accountData.gold < pokemonData.gold
    ) {
      return res.status(400).json({
        success: false,
        message: "Not enough money",
      });
    }

    // בדיקת מקום ביד
    if (userData.in_hand >= 6) {
      return res.status(400).json({
        success: false,
        message: "Hand is full",
      });
    }

    await addPokemon(userId, pokemonData.pokemonid, userData.in_hand);

    // עדכון כסף
    if (pokemonData.silver > 0) {
      await DB.query(
        "UPDATE gebruikers SET silver = silver - ?,`number_of_pokemon`=`number_of_pokemon`+'1' WHERE user_id = ?",
        [pokemonData.silver, userId]
      );
    }

    if (pokemonData.gold > 0) {
      await DB.query("UPDATE accounts SET gold = gold - ? WHERE acc_id = ?", [
        pokemonData.gold,
        accId,
      ]);
    }

    // סימון כנמכר
    await DB.query("UPDATE markt SET beschikbaar = 0 WHERE id = ?", [
      productId,
    ]);

    // חישוב מחדש של כמות הפריטים הכוללת
    const newTotalItems = await calculateTotalItems(userId);
    const maxItems = ItemBox[userData.itembox] || 20;
    const newItemOver = maxItems - newTotalItems;

    res.json({
      success: true,
      message: "Successfully bought Pokemon",
      newInventory: {
        silver: userData.silver - pokemonData.silver,
        gold: accountData.gold - pokemonData.gold,
        item_over: newItemOver,
        itembox: userData.itembox,
        items: newTotalItems,
        in_hand: userData.in_hand + 1,
      },
    });
  } catch (error) {
    console.error("Error buying pokemon:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// קבלת פריטים זמינים
const getAvailableItems = async (req, res) => {
  try {
    const { category } = req.params;
    const normalizedCategory =
      category === "specialitems" ? "special items" : category;
    let sql = "SELECT * FROM markt WHERE soort = ? AND beschikbaar = 1";
    let params = [normalizedCategory];

    if (category == "attacks") {
      sql =
        "SELECT * FROM markt WHERE soort IN ('tm','hm') AND beschikbaar = 1";
      params = [];
    }

    if (normalizedCategory === "pokemon") {
      sql = `SELECT markt.id, markt.pokemonid, markt.silver, markt.gold, 
                    markt.omschrijving_he, markt.omschrijving_en, markt.beschikbaar,
                    pokemon_wild.zeldzaamheid
             FROM markt 
             INNER JOIN pokemon_wild ON markt.pokemonid = pokemon_wild.wild_id 
             WHERE markt.soort = ? AND markt.beschikbaar = 1`;
    }

    const items = await DB.query(sql, params);

    res.json({ success: true, data: items });
  } catch (error) {
    console.error("Error getting available items:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export {
  getMarketItems,
  getUserInventory,
  buyItem,
  buyPokemon,
  getAvailableItems,
};
