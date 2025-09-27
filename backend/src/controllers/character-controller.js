import { query, transaction } from "../config/database.js";

import crypto from "crypto";
import { date } from "../helpers/date.js";
import jwt from "jsonwebtoken";

// יצירת דמות חדשה
export const createCharacter = async (req, res) => {
  try {
    const { inlognaam, wereld, character } = req.body;
    const { acc_id } = req.user;
    const ip = req.ip || req.connection.remoteAddress;

    // בדיקה אם המשתמש כבר יצר 7 דמויות
    const userCountResult = await query(
      "SELECT COUNT(*) as count FROM `gebruikers` WHERE `acc_id` = ?",
      [acc_id]
    );

    if (userCountResult[0].count >= 7) {
      return res.status(400).json({
        success: false,
        message: "הגעת למגבלת הדמויות המקסימלית (7)",
      });
    }

    // בדיקות תקינות
    if (!inlognaam || inlognaam.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "שם משתמש נדרש",
      });
    }

    if (inlognaam.trim().length < 4) {
      return res.status(400).json({
        success: false,
        message: "שם המשתמש חייב להכיל לפחות 4 תווים",
      });
    }

    if (inlognaam.trim().length > 12) {
      return res.status(400).json({
        success: false,
        message: "שם המשתמש לא יכול להכיל יותר מ-12 תווים",
      });
    }

    // בדיקה שהשם מכיל רק אותיות ומספרים
    if (!/^[a-zA-Z0-9]+$/.test(inlognaam)) {
      return res.status(400).json({
        success: false,
        message: "שם המשתמש יכול להכיל רק אותיות ומספרים באנגלית",
      });
    }

    // בדיקה שהשם לא קיים כבר
    const existingUserResult = await query(
      "SELECT COUNT(*) as count FROM `gebruikers` WHERE `username` = ?",
      [inlognaam]
    );

    if (existingUserResult[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: "שם המשתמש כבר קיים במערכת",
      });
    }

    // בדיקה שהדמות קיימת
    const characterResult = await query(
      "SELECT COUNT(*) as count FROM `characters` WHERE `naam` = ?",
      [character]
    );

    if (characterResult[0].count === 0) {
      return res.status(400).json({
        success: false,
        message: "הדמות שנבחרה אינה תקינה",
      });
    }

    // בדיקה שהעולם תקין
    const validWorlds = [
      "Kanto",
      "Johto",
      "Hoenn",
      "Sinnoh",
      "Unova",
      "Kalos",
      "Alola",
    ];
    if (!wereld || !validWorlds.includes(wereld)) {
      return res.status(400).json({
        success: false,
        message: "העולם שנבחר אינו תקין",
      });
    }

    // בדיקה אם צריך לשלם gold (אחרי 2 דמויות)
    let needsGold = false;
    if (userCountResult[0].count >= 2) {
      const accountResult = await query(
        "SELECT `gold` FROM `rekeningen` WHERE `acc_id` = ?",
        [acc_id]
      );

      if (accountResult.length === 0 || accountResult[0].gold < 10) {
        return res.status(400).json({
          success: false,
          message: "אין לך מספיק gold ליצירת דמות נוספת (נדרש 10 gold)",
        });
      }
      needsGold = true;
    }

    // יצירת הדמות באמצעות transaction
    const result = await transaction(async (connection) => {
      const date_lo = new Date().toLocaleDateString("he-IL");
      const date_loh = new Date().toLocaleTimeString("he-IL");
      const unlock = `${wereld}_block`;

      // הכנסת הדמות לטבלת המשתמשים
      const [userResult] = await connection.execute(
        `INSERT INTO \`gebruikers\` (\`ultimo_login\`, \`ultimo_login_hour\`, \`acc_id\`, \`character\`, \`username\`, \`datum\`, \`aanmeld_datum\`, \`ip_aangemeld\`, \`wereld\`, \`${unlock}\`) 
         VALUES (?, ?, ?, ?, ?, NOW(), NOW(), ?, ?, '1')`,
        [date_lo, date_loh, acc_id, character, inlognaam, ip, wereld]
      );

      const user_id = userResult.insertId;

      // הכנסת הדמות לטבלת הפריטים
      await connection.execute(
        "INSERT INTO `gebruikers_item` (`user_id`) VALUES (?)",
        [user_id]
      );

      // הכנסת הדמות לטבלת התגים
      await connection.execute(
        "INSERT INTO `gebruikers_badges` (`user_id`) VALUES (?)",
        [user_id]
      );

      // הכנסת הדמות לטבלת ה-TM/HM
      await connection.execute(
        "INSERT INTO `gebruikers_tmhm` (`user_id`) VALUES (?)",
        [user_id]
      );

      // הפחתת gold אם נדרש
      if (needsGold) {
        await connection.execute(
          "UPDATE `rekeningen` SET `gold` = `gold` - 10 WHERE `acc_id` = ?",
          [acc_id]
        );
      }

      return user_id;
    });

    res.status(201).json({
      success: true,
      message: "הדמות נוצרה בהצלחה!",
      data: {
        user_id: result,
        username: inlognaam,
        character: character,
        wereld: wereld,
      },
    });
  } catch (error) {
    console.error("שגיאה ביצירת דמות:", error);
    res.status(500).json({
      success: false,
      message: "שגיאה פנימית בשרת",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// קבלת רשימת הדמויות הזמינות
export const getAvailableCharacters = async (req, res) => {
  try {
    const characters = await query(
      "SELECT `naam` FROM `characters` ORDER BY `naam` ASC"
    );

    res.json({
      success: true,
      data: characters.map((char) => char.naam),
    });
  } catch (error) {
    console.error("שגיאה בקבלת רשימת הדמויות:", error);
    res.status(500).json({
      success: false,
      message: "שגיאה פנימית בשרת",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// קבלת מספר הדמויות של המשתמש
export const getUserCharacterCount = async (req, res) => {
  try {
    const { acc_id } = req.user;

    const result = await query(
      "SELECT COUNT(*) as count FROM `gebruikers` WHERE `acc_id` = ?",
      [acc_id]
    );

    res.json({
      success: true,
      data: {
        characterCount: result[0].count,
        maxCharacters: 7,
        needsGold: result[0].count >= 2,
      },
    });
  } catch (error) {
    console.error("שגיאה בקבלת מספר הדמויות:", error);
    res.status(500).json({
      success: false,
      message: "שגיאה פנימית בשרת",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// קבלת רשימת הדמויות של המשתמש
export const getUserCharacters = async (req, res) => {
  try {
    const { acc_id } = req.user;

    const characters = await query(
      "SELECT * FROM `gebruikers` WHERE acc_id = ? ORDER BY `rank` DESC, `user_id` ASC",
      [acc_id]
    );

    res.json({
      success: true,
      data: characters,
    });
  } catch (error) {
    console.error("שגיאה בקבלת רשימת הדמויות:", error);
    res.status(500).json({
      success: false,
      message: "שגיאה פנימית בשרת",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// כניסה למשחק עם דמות
export const loginWithCharacter = async (req, res) => {
  try {
    const { user_id } = req.body;
    const { acc_id } = req.user;

    if (!user_id || isNaN(user_id)) {
      return res.status(400).json({
        success: false,
        message: "מזהה דמות לא תקין",
      });
    }

    // בדיקה שהדמות קיימת
    const characterResult = await query(
      "SELECT * FROM `gebruikers` WHERE `user_id` = ? LIMIT 1",
      [user_id]
    );

    if (characterResult.length !== 1) {
      return res.status(404).json({
        success: false,
        message: "הדמות לא נמצאה",
      });
    }

    const character = characterResult[0];

    // בדיקה שהדמות שייכת למשתמש
    if (character.acc_id != acc_id) {
      return res.status(403).json({
        success: false,
        message: "הדמות הזו לא שייכת לך",
      });
    }

    // בדיקה שהדמות לא חסומה
    if (character.banned === "Y") {
      return res.status(403).json({
        success: false,
        message: "הדמות הזו חסומה",
      });
    }

    // עדכון פרטי כניסה
    const date_lo = new Date().toLocaleDateString("he-IL");
    const date_loh = new Date().toLocaleTimeString("he-IL");
    const sec_key = Math.floor(Math.random() * 900000) + 100000;
    const chat_key = crypto
      .createHash("md5")
      .update(Date.now().toString())
      .digest("hex");

    // בדיקה אם זה יום חדש (עדכון antiguidade)
    const lastLoginDate = character.ultimo_login;
    const isNewDay = date_lo !== lastLoginDate;

    if (isNewDay) {
      await query(
        "UPDATE `gebruikers` SET `ultimo_login` = ?, `ultimo_login_hour` = ?, `antiguidade` = `antiguidade` + 1, `sec_key` = ?, `chat_key` = ? WHERE `user_id` = ?",
        [date_lo, date_loh, sec_key, chat_key, user_id]
      );
    } else {
      await query(
        "UPDATE `gebruikers` SET `ultimo_login` = ?, `ultimo_login_hour` = ?, `sec_key` = ?, `chat_key` = ? WHERE `user_id` = ?",
        [date_lo, date_loh, sec_key, chat_key, user_id]
      );
    }

    // יצירת session token חדש
    const sessionToken = crypto
      .createHash("md5")
      .update(`${user_id},${character.username}`)
      .digest("hex");

    // יצירת JWT token
    const token = jwt.sign(
      {
        ...req.user,
        user_id
      },
      process.env.JWT_SECRET || "default_secret",
    );

    res.cookie("access_token", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ימים
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
    });

    res.json({
      success: true,
      message: "נכנסת למשחק בהצלחה!",
      data: {
        ...character,
      },
    });
  } catch (error) {
    console.error("שגיאה בכניסה למשחק:", error);
    res.status(500).json({
      success: false,
      message: "שגיאה פנימית בשרת",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// קבלת מידע מפורט על דמות
export const getCharacterDetails = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { acc_id } = req.user;

    if (!user_id || isNaN(user_id)) {
      return res.status(400).json({
        success: false,
        message: "מזהה דמות לא תקין",
      });
    }

    const character = await query(
      "SELECT * FROM `gebruikers` WHERE `user_id` = ? AND `acc_id` = ?",
      [user_id, acc_id]
    );

    if (character.length === 0) {
      return res.status(404).json({
        success: false,
        message: "הדמות לא נמצאה",
      });
    }

    res.json({
      success: true,
      data: character[0],
    });
  } catch (error) {
    console.error("שגיאה בקבלת פרטי דמות:", error);
    res.status(500).json({
      success: false,
      message: "שגיאה פנימית בשרת",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// קבלת רשימת הפוקימונים הזמינים לבחירה ראשונה
export const getAvailableStarterPokemon = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { acc_id } = req.user;

    if (!user_id || isNaN(user_id)) {
      return res.status(400).json({
        success: false,
        message: "מזהה דמות לא תקין",
      });
    }

    // בדיקה שהדמות שייכת למשתמש
    const character = await query(
      "SELECT * FROM `gebruikers` WHERE `user_id` = ? AND `acc_id` = ?",
      [user_id, acc_id]
    );

    if (character.length === 0) {
      return res.status(404).json({
        success: false,
        message: "הדמות לא נמצאה",
      });
    }

    // בדיקה שהמשתמש עדיין לא קיבל פוקימון ראשון
    if (character[0].eigekregen === 1) {
      return res.status(400).json({
        success: false,
        message: "כבר קיבלת פוקימון ראשון",
      });
    }

    // קבלת הפוקימונים הזמינים לעולם של המשתמש
    const starterPokemon = await query(
      `SELECT 
    pw.wild_id,
    pw.naam,
    pw.type1,
    pw.type2,
    pw.groei,
    pw.attack_base,
    pw.defence_base,
    pw.speed_base,
    pw.\`spc.attack_base\`,
    pw.\`spc.defence_base\`,
    pw.hp_base,
    pw.aanval_1,
    pw.aanval_2,
    pw.aanval_3,
    pw.aanval_4,
    pw.ability
FROM pokemon_nieuw_starter pns
INNER JOIN pokemon_wild pw ON pns.wild_id = pw.wild_id
WHERE pw.wereld = ?
ORDER BY pw.naam ASC;`,
      [character[0].wereld]
    );

    res.json({
      success: true,
      data: starterPokemon,
    });
  } catch (error) {
    console.error("שגיאה בקבלת רשימת הפוקימונים הזמינים:", error);
    res.status(500).json({
      success: false,
      message: "שגיאה פנימית בשרת",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// בחירת פוקימון ראשון
export const chooseStarterPokemon = async (req, res) => {
  try {
    const { user_id, pokemon_id } = req.body;
    const { acc_id } = req.user;

    if (!user_id || !pokemon_id || isNaN(user_id) || isNaN(pokemon_id)) {
      return res.status(400).json({
        success: false,
        message: "פרמטרים לא תקינים",
      });
    }

    // בדיקה שהדמות שייכת למשתמש
    const character = await query(
      "SELECT * FROM `gebruikers` WHERE `user_id` = ? AND `acc_id` = ?",
      [user_id, acc_id]
    );

    if (character.length === 0) {
      return res.status(404).json({
        success: false,
        message: "הדמות לא נמצאה",
      });
    }

    // בדיקה שהמשתמש עדיין לא קיבל פוקימון ראשון
    if (character[0].eigekregen === 1) {
      return res.status(400).json({
        success: false,
        message: "כבר קיבלת פוקימון ראשון",
      });
    }

    // בדיקה שהפוקימון קיים ברשימת הסטרטרים
    const starterCheck = await query(
      "SELECT COUNT(*) as count FROM `pokemon_nieuw_starter` WHERE `wild_id` = ?",
      [pokemon_id]
    );

    if (starterCheck[0].count === 0) {
      return res.status(400).json({
        success: false,
        message: "הפוקימון שנבחר אינו זמין לבחירה ראשונה",
      });
    }

    // קבלת פרטי הפוקימון
    const pokemonData = await query(
      `SELECT 
        wild_id, naam, groei, attack_base, defence_base, speed_base,
        \`spc.attack_base\`, \`spc.defence_base\`, hp_base, aanval_1, aanval_2,
        aanval_3, aanval_4, ability
      FROM pokemon_wild 
      WHERE wild_id = ?`,
      [pokemon_id]
    );

    if (pokemonData.length === 0) {
      return res.status(404).json({
        success: false,
        message: "פוקימון לא נמצא",
      });
    }

    const pokemon = pokemonData[0];

    // בחירת אופי אקראי
    const characterTraits = await query(
      "SELECT * FROM `karakters` ORDER BY RAND() LIMIT 1"
    );

    if (characterTraits.length === 0) {
      return res.status(500).json({
        success: false,
        message: "שגיאה בבחירת אופי",
      });
    }

    const trait = characterTraits[0];

    // קבלת נקודות הניסיון הנדרשות לרמה 6
    const experienceData = await query(
      "SELECT `punten` FROM `experience` WHERE `soort` = ? AND `level` = 6",
      [pokemon.groei]
    );

    if (experienceData.length === 0) {
      return res.status(500).json({
        success: false,
        message: "שגיאה בקבלת נתוני ניסיון",
      });
    }

    // יצירת IVs אקראיים (2-31)
    const attack_iv = Math.floor(Math.random() * 30) + 2;
    const defence_iv = Math.floor(Math.random() * 30) + 2;
    const speed_iv = Math.floor(Math.random() * 30) + 2;
    const spcattack_iv = Math.floor(Math.random() * 30) + 2;
    const spcdefence_iv = Math.floor(Math.random() * 30) + 2;
    const hp_iv = Math.floor(Math.random() * 30) + 2;

    // חישוב הסטטים
    const attackstat = Math.round(
      (((attack_iv + 2 * pokemon.attack_base) * 5) / 100 + 5) * trait.attack_add
    );
    const defencestat = Math.round(
      (((defence_iv + 2 * pokemon.defence_base) * 5) / 100 + 5) *
        trait.defence_add
    );
    const speedstat = Math.round(
      (((speed_iv + 2 * pokemon.speed_base) * 5) / 100 + 5) * trait.speed_add
    );
    const spcattackstat = Math.round(
      (((spcattack_iv + 2 * pokemon.spc_attack_base) * 5) / 100 + 5) *
        trait.spc_attack_add
    );
    const spcdefencestat = Math.round(
      (((spcdefence_iv + 2 * pokemon.spc_defence_base) * 5) / 100 + 5) *
        trait.spc_defence_add
    );
    const hpstat = Math.round(
      ((hp_iv + 2 * pokemon.hp_base) * 5) / 100 + 10 + 5
    );

    // בחירת יכולת אקראית
    const abilities = pokemon.ability.split(",");
    const randomAbility =
      abilities[Math.floor(Math.random() * abilities.length)];

    const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");

    // יצירת הפוקימון באמצעות transaction
    const result = await transaction(async (connection) => {
      // הכנסת הפוקימון לטבלת הפוקימונים של השחקן
      const [pokemonResult] = await connection.execute(
        `INSERT INTO pokemon_speler (
          wild_id, aanval_1, aanval_2, aanval_3, aanval_4, level, karakter,
          expnodig, user_id, opzak, opzak_nummer, gehecht, ei, ei_tijd,
          attack_iv, defence_iv, speed_iv, \`spc.attack_iv\`, \`spc.defence_iv\`, hp_iv,
          attack, defence, speed, \`spc.attack\`, \`spc.defence\`, levenmax, leven,
          ability, capture_date
        ) VALUES (?, ?, ?, ?, ?, 5, ?, ?, ?, 'ja', 1, 1, 0, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          pokemon.wild_id,
          pokemon.aanval_1,
          pokemon.aanval_2,
          pokemon.aanval_3,
          pokemon.aanval_4,
          trait.karakter_naam,
          experienceData[0].punten,
          user_id,
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
          randomAbility,
          currentDate,
        ]
      );

      const pokemonId = pokemonResult.insertId;

      // עדכון הדמות - סימון שקיבלה פוקימון ראשון
      await connection.execute(
        "UPDATE `gebruikers` SET `aantalpokemon` = `aantalpokemon` + 1, `eigekregen` = 1 WHERE `user_id` = ?",
        [user_id]
      );

      return pokemonId;
    });

    res.json({
      success: true,
      message: "הפוקימון הראשון נבחר בהצלחה!",
      data: {
        pokemon_id: result,
        pokemon_name: pokemon.naam,
        character_trait: trait.karakter_naam,
        level: 5,
        hp: hpstat,
        attack: attackstat,
        defence: defencestat,
        speed: speedstat,
        spc_attack: spcattackstat,
        spc_defence: spcdefencestat,
      },
    });
  } catch (error) {
    console.error("שגיאה בבחירת פוקימון ראשון:", error);
    res.status(500).json({
      success: false,
      message: "שגיאה פנימית בשרת",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// קבלת פרטי פרופיל של משתמש
export const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const { acc_id } = req.user;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "שם משתמש לא תקין",
      });
    }

    // קבלת פרטי הפרופיל
    const profileQuery = `
      SELECT 
        g.user_id, g.username, g.character, g.wereld, g.ultimo_login, 
        g.antiguidade, g.clan, g.rang, g.rang_temp, g.silver, 
        g.premiumaccount, g.admin, g.online, g.character_num, 
        g.profiel, g.teamzien, g.badgeszien, g.rank, g.aantalpokemon, 
        g.badges, g.gewonnen, g.verloren, g.datum,
        r.karma, r.email, r.ip_aangemeld, r.ip_ingelogd, r.gold,
        gi.\`badge case\`
      FROM gebruikers g
      INNER JOIN rekeningen r ON g.acc_id = r.acc_id
      LEFT JOIN gebruikers_item gi ON g.user_id = gi.user_id
      WHERE g.username = ? AND g.banned != 'Y'
      GROUP BY g.user_id
      LIMIT 1
    `;

    const profileResult = await query(profileQuery, [username]);

    if (profileResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: "משתמש לא נמצא",
      });
    }

    const profile = profileResult[0];

    // קבלת סטטיסטיקות נוספות
    const pokes100Query =
      "SELECT COUNT(*) as count FROM pokemon_speler WHERE user_id = ? AND level = 100";
    const pokes100Result = await query(pokes100Query, [profile.user_id]);
    const pokes100 = pokes100Result[0].count;

    const top3Query =
      "SELECT COUNT(*) as count FROM pokemon_speler WHERE user_id = ? AND top3 = '3'";
    const top3Result = await query(top3Query, [profile.user_id]);
    const top3 = top3Result[0].count;

    const top2Query =
      "SELECT COUNT(*) as count FROM pokemon_speler WHERE user_id = ? AND top3 = '2'";
    const top2Result = await query(top2Query, [profile.user_id]);
    const top2 = top2Result[0].count;

    const top1Query =
      "SELECT COUNT(*) as count FROM pokemon_speler WHERE user_id = ? AND top3 = '1'";
    const top1Result = await query(top1Query, [profile.user_id]);
    const top1 = top1Result[0].count;

    const inHouseQuery =
      "SELECT COUNT(*) as count FROM pokemon_speler WHERE user_id = ? AND (opzak = 'nee' OR opzak = 'tra')";
    const inHouseResult = await query(inHouseQuery, [profile.user_id]);
    const inHouse = inHouseResult[0].count;

    // קבלת חברים
    const friendsQuery = `
      SELECT 
        CASE 
          WHEN f.uid = ? THEN f.uid_2 
          ELSE f.uid 
        END as friend_id,
        g.username as friend_username,
        f.date
      FROM friends f
      INNER JOIN gebruikers g ON (
        CASE 
          WHEN f.uid = ? THEN f.uid_2 
          ELSE f.uid 
        END = g.user_id
      )
      WHERE (f.uid = ? OR f.uid_2 = ?) AND f.accept = '1'
      ORDER BY f.date DESC
      LIMIT 8
    `;
    const friendsResult = await query(friendsQuery, [
      profile.user_id,
      profile.user_id,
      profile.user_id,
      profile.user_id,
    ]);

    // קבלת כבוד
    const honorQuery = `
      SELECT 
        h.id, h.u_honor, h.date,
        g.username as honorer_username
      FROM honra h
      INNER JOIN gebruikers g ON h.u_honor = g.user_id
      WHERE h.u_id = ?
      ORDER BY h.id DESC
      LIMIT 5
    `;
    const honorResult = await query(honorQuery, [profile.user_id]);

    // קבלת הפוקימונים של הצוות
    let teamPokemon = [];
    if (profile.teamzien === 1 || profile.admin > 0) {
      const teamQuery = `
        SELECT 
          ps.*, pw.naam, pw.type1, pw.type2
        FROM pokemon_speler ps
        INNER JOIN pokemon_wild pw ON ps.wild_id = pw.wild_id
        WHERE ps.user_id = ? AND ps.opzak = 'ja'
        ORDER BY ps.opzak_nummer ASC
        LIMIT 6
      `;
      teamPokemon = await query(teamQuery, [profile.user_id]);
    }

    // קבלת תגים
    let badges = null;
    if (profile.badgeszien === 1 && profile.badge_case === 1) {
      const badgesQuery = "SELECT * FROM gebruikers_badges WHERE user_id = ?";
      const badgesResult = await query(badgesQuery, [profile.user_id]);
      if (badgesResult.length > 0) {
        badges = badgesResult[0];
      }
    }

    // חישוב סטטוס אונליין
    const isOnline = profile.online + 900 > Math.floor(Date.now() / 1000);
    const onlineStatus = isOnline ? "online" : "offline";
    const onlineIcon = isOnline
      ? "/images/icons/status_online.png"
      : "/images/icons/status_offline.png";

    // חישוב מדליות דירוג
    const getRankMedal = (rank) => {
      if (rank === 1)
        return { medal: "/images/icons/plaatsnummereen.png", text: "1º" };
      if (rank === 2)
        return { medal: "/images/icons/plaatsnummertwee.png", text: "2º" };
      if (rank === 3)
        return { medal: "/images/icons/plaatsnummerdrie.png", text: "3º" };
      if (rank > 3 && rank <= 10)
        return { medal: "/images/icons/gold_medaille.png", text: `${rank}º` };
      if (rank > 10 && rank <= 30)
        return { medal: "/images/icons/silver_medaille.png", text: `${rank}º` };
      if (rank > 30 && rank <= 50)
        return { medal: "/images/icons/bronze_medaille.png", text: `${rank}º` };
      return { medal: null, text: `${rank}º` };
    };

    const rankMedal = getRankMedal(profile.rang);
    const rankTempMedal = getRankMedal(profile.rang_temp);

    // פורמט תאריכים
    const formatDate = (dateString) => {
      if (!dateString) return "-";
      const date = new Date(dateString);
      return date.toLocaleDateString("he-IL");
    };

    // פורמט כסף
    const formatMoney = (amount) => {
      return new Intl.NumberFormat("he-IL").format(Math.round(amount || 0));
    };

    res.json({
      success: true,
      data: {
        profile: {
          user_id: profile.user_id,
          username: profile.username,
          character: profile.character,
          wereld: profile.wereld,
          ultimo_login: profile.ultimo_login,
          antiguidade: profile.antiguidade,
          clan: profile.clan,
          rang: profile.rang,
          rang_temp: profile.rang_temp,
          silver: profile.silver,
          gold: profile.gold,
          premiumaccount: profile.premiumaccount,
          admin: profile.admin,
          online: profile.online,
          character_num: profile.character_num,
          profiel: profile.profiel,
          teamzien: profile.teamzien,
          badgeszien: profile.badgeszien,
          rank: profile.rank,
          aantalpokemon: profile.aantalpokemon,
          badges: profile.badges,
          gewonnen: profile.gewonnen,
          verloren: profile.verloren,
          datum: profile.datum,
          karma: profile.karma,
          email: profile.email,
          ip_aangemeld: profile.ip_aangemeld,
          ip_ingelogd: profile.ip_ingelogd,
          badge_case: profile.badge_case,
        },
        stats: {
          pokes100,
          top3,
          top2,
          top1,
          inHouse,
        },
        friends: friendsResult,
        honor: honorResult,
        teamPokemon,
        badges,
        onlineStatus,
        onlineIcon,
        rankMedal,
        rankTempMedal,
        formatted: {
          date: formatDate(profile.datum),
          silver: formatMoney(profile.silver),
          gold: formatMoney(profile.gold),
        },
      },
    });
  } catch (error) {
    console.error("שגיאה בקבלת פרטי פרופיל:", error);
    res.status(500).json({
      success: false,
      message: "שגיאה פנימית בשרת",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const myPokemon = async (req, res) => {
  try {
    const { user_id } = req.body;
    const myPokemon = await query(
      "SELECT `pw`.`naam`,`pw`.`type1`,`pw`.`type2`,`pw`.`zeldzaamheid`,`pw`.`groei`,`pw`.`aanval_1`,`ps`.`humor_change`,`pw`.`aanval_2`,`pw`.`aanval_3`,`pw`.`aanval_4`,`ps`.* FROM `pokemon_wild` AS `pw` INNER JOIN `pokemon_speler` AS `ps` ON `ps`.`wild_id`=`pw`.`wild_id` WHERE `ps`.`user_id`=? AND `ps`.`opzak`='ja' ORDER BY `ps`.`opzak_nummer` ASC",
      [user_id]
    );
    res.json({
      success: true,
      data: {
        myPokemon,
        in_hand: myPokemon.length,
      },
    });
  } catch (error) {
    console.error("שגיאה בקבלת פוקימון:", error);
    res.status(500).json({
      success: false,
      message: "שגיאה פנימית בשרת",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Inbox Controllers
export const getMessages = async (req, res) => {
  try {
    const { userId } = req.body;

    const messages = await query(
      `
        SELECT *
        FROM conversas
        WHERE 
          (trainer_1 = ? AND trainer_1_hidden = 0)
          OR (trainer_2 = ? AND trainer_2_hidden = 0)
        ORDER BY STR_TO_DATE(last_message, '%d/%m/%Y %H:%i:%s') DESC
        `,
      [userId, userId]
    );

    for (const [index, { id, trainer_1, trainer_2 }] of messages.entries()) {
      let other_user = trainer_1;
      if (trainer_1 === userId) {
        other_user = trainer_2;
      }
      const [otherUserData] = await query(
        "SELECT user_id, username, `character` FROM `gebruikers` WHERE user_id = ?",
        [other_user]
      );
      const [myUser] = await query(
        "SELECT user_id, username, `character` FROM `gebruikers` WHERE user_id = ?",
        [userId]
      );
      if (other_user === trainer_1) {
        messages[index].trainer_1 = otherUserData;
        messages[index].trainer_2 = myUser;
      } else {
        messages[index].trainer_2 = otherUserData;
        messages[index].trainer_1 = myUser;
      }
      const msgs = await query(
        `SELECT sender, reciever, message, date,seen FROM conversas_messages WHERE conversa=? ORDER BY id ASC`,
        [id]
      );
      messages[index]["conversations"] = msgs;
    }
    res.json({
      success: true,
      data: {
        messages,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "שגיאה בקבלת שיחות",
      error: error.message,
    });
  }
};

export const readMessage = async (req, res) => {
  const { userId, conversa } = req.body;
  await query(
    "UPDATE conversas_messages SET seen = 1 WHERE conversa = ? AND reciever = ?",
    [conversa, userId]
  );
  res.status(204).send();
};

export const replyMessage = async (req, res) => {
  const { sender, message, conversa, userId } = req.body;
  if (sender === userId) {
    const [conversations] = await query(
      "SELECT * FROM `conversas` WHERE id=? AND (trainer_1=? OR trainer_2=?)",
      [conversa, userId, userId]
    );
    let reciever = conversations.trainer_1;
    if (sender === conversations.trainer_1) {
      reciever = conversations.trainer_2;
    }
    const currentDate = date("d/m/Y H:i:s");
    await query(
      "INSERT INTO `conversas_messages` (`conversa`, `sender`, `reciever`, `message`, `date`) VALUES (?, ?, ?, ?, ?)",
      [conversa, userId, reciever, message, currentDate]
    );
    await query(
      "UPDATE `conversas` SET last_message=? WHERE id=? AND (trainer_1=? OR trainer_2=?)",
      [currentDate, conversa, userId, userId]
    );

    res.json({
      success: true,
      data: currentDate,
    });
  } else {
    res.status(400).send();
  }
};

export const sendMessage = async (req, res) => {
  const { subject, player, message, userId } = req.body;
  const [user] = await query(
    "SELECT user_id FROM `gebruikers` WHERE username = ?",
    [player]
  );
  if (!user) {
    res.status(400).send();
    return;
  }

  if (user.user_id === userId) {
    res.status(400).json({
      success: false,
      data: "אתה לא יכול לשלוח לעצמך הודעות!",
    });
    return;
  }

  const currentDate = date("d/m/Y H:i:s");
  var insert = await query(
    "INSERT INTO `conversas` (`trainer_1`, `trainer_2`, `title`, `last_message`) VALUES (?, ?, ?, ?)",
    [userId, user.user_id, subject, currentDate]
  );
  const id = insert.insertId;
  await query(
    "INSERT INTO `conversas_messages` (`conversa`, `sender`, `reciever`, `message`, `date`) VALUES (?, ?, ?, ?, ?)",
    [id, userId, user.user_id, message, currentDate]
  );
  res.json({
    success: true,
    data: id,
  });
};

export const getBadges = async (req, res) => {
  try {
    const { userId } = req.body;

    const [badges] = await query(
      "SELECT * FROM gebruikers_badges WHERE user_id = ? LIMIT 1",
      [userId]
    );

    res.json({
      success: true,
      data: badges, // מחזיר את הסטטוס של כל האינסיגניות
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "שגיאה בקבלת אינסיגניות",
      error: err.message,
    });
  }
};

export const fish = async (req, res) => {
  try {
    const { userId } = req.body;

    // בדוק אם השחקן יכול לדוג
    const [user] = await query(
      "SELECT g.fishing, g.last_fishing, gi.`Fishing rod` FROM gebruikers AS g INNER JOIN gebruikers_item AS gi ON gi.user_id = g.user_id WHERE g.user_id = ?",
      [userId]
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "שחקן לא נמצא" });
    }

    if (user["Fishing rod"] === 0) {
      return res.json({ success: false, message: "אין לך חכת דיג" });
    }

    const now = Math.floor(Date.now() / 1000);
    if (user.last_fishing + 60 * 10 > now) {
      const wait = Math.ceil((user.last_fishing + 600 - now) / 60);
      return res.json({
        success: false,
        message: `עליך לחכות עוד ${wait} דקות`,
      });
    }

    // שליפת פוקימון מים/קרח רנדומלי
    const [swappah] = await query(
      "SELECT * FROM pokemon_wild WHERE (type1 IN ('Water','Ice') OR type2 IN ('Water','Ice')) ORDER BY RAND() LIMIT 1"
    );

    const total =
      (swappah.hp_base +
        swappah.attack_base +
        swappah.defence_base +
        swappah.speed_base) *
      73;
    const points = Math.floor(Math.random() * total) + 1;

    // עדכון בניקוד ובזמן
    await query(
      "UPDATE gebruikers SET fishing = fishing + ?, last_fishing = UNIX_TIMESTAMP() WHERE user_id = ?",
      [points, userId]
    );

    res.json({
      success: true,
      data: {
        pokemon: {
          id: swappah.wild_id,
          name: swappah.naam,
        },
        points,
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "שגיאה בדיג", error: err.message });
  }
};

export const getFishingLeaders = async (req, res) => {
  try {
    const today = await query(
      "SELECT username, user_id, fishing FROM gebruikers WHERE banned != 'Y' ORDER BY fishing DESC LIMIT 3"
    );

    const yesterday = await query("SELECT * FROM fishs WHERE id = 1 LIMIT 1");
    const row = yesterday[0];

    const winners = [];
    for (let i = 1; i <= 3; i++) {
      if (row[`fish${i === 1 ? "" : i}`]) {
        const [user] = await query(
          "SELECT username, user_id FROM gebruikers WHERE user_id = ?",
          [row[`fish${i === 1 ? "" : i}`]]
        );
        winners.push(user);
      }
    }

    res.json({
      success: true,
      data: { today, yesterday: winners },
    });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "שגיאה בשליפת טבלאות",
        error: err.message,
      });
  }
};
