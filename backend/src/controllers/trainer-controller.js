import { query } from "../config/database.js";

export const startTrainerBattle = async (req, res) => {
  const userId = req.body.userId;
  const { trainer, trainerAveLevel, gebied } = req.body;

  if (!userId) {
    return res.status(401).json({ success: false, message: "משתמש לא מחובר" });
  }

  try {
    // 1. מחיקת קרבות ישנים
    await query("DELETE FROM aanval_log WHERE user_id=?", [userId]);
    await query("DELETE FROM pokemon_speler_gevecht WHERE user_id=?", [userId]);

    const inHand = await query(
      "SELECT id FROM pokemon_speler WHERE user_id=? AND opzak='ja' ORDER BY opzak_nummer ASC",
      [userId]
    );
    for (const row of inHand[0]) {
      await query("DELETE FROM pokemon_speler_gevecht WHERE id=?", [row.id]);
    }

    // 2. יצירת aanval_log חדש
    const [insertLog] = await query(
      "INSERT INTO aanval_log (user_id, gebied, trainer) VALUES (?, ?, ?)",
      [userId, gebied, trainer]
    );
    const aanvalLogId = insertLog.insertId;

    // 3. בניית היריב (Trainer עם פוקימונים)
    const attackInfo = await createNewTrainer(
      trainer,
      trainerAveLevel,
      aanvalLogId
    );

    // 4. הכנסת הפוקימונים של השחקן
    await createPlayer(userId, aanvalLogId);

    // 5. בדיקה מי מתחיל לפי Speed
    const finalInfo = await whoCanStart(userId, attackInfo);

    if (!finalInfo.bericht) {
      // שמירת מצב הקרב
      updatePokedex(attackInfo.computer_wildid, "zien", userId);
      await saveAttack(userId, finalInfo, aanvalLogId);
      res.cookie(
        "trainer",
        JSON.stringify({ aanval_log_id: aanvalLogId, begin_zien: true }),
        {
          httpOnly: true, // מגן מפני XSS
          secure: process.env.NODE_ENV === "production", // HTTPS only in production
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
          sameSite: "strict", // מגן מפני CSRF
        }
      );
    } else {
      //Clear Computer
      await query("DELETE FROM `pokemon_wild_gevecht` WHERE `id`=?", [
        attackInfo.computer_id,
      ]);
      //Clear Player
      await query("DELETE FROM `pokemon_speler_gevecht` WHERE `user_id`=?", [
        userId,
      ]);
    }

    return res.json({ success: true, data: finalInfo });
  } catch (err) {
    console.error("❌ startTrainerBattle error:", err);
    return res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
};

async function saveAttack(userId, attackInfo, aanvalLogId) {
  const gebruikt = `,${attackInfo.pokemonid},`;
  await query(
    "UPDATE aanval_log SET laatste_aanval=?, tegenstanderid=?, pokemonid=?, gebruikt_id=? WHERE id=?",
    [
      attackInfo.begin,
      attackInfo.computer_id,
      attackInfo.pokemonid,
      gebruikt,
      aanvalLogId,
    ]
  );
  await query("UPDATE gebruikers SET pagina='trainer-attack' WHERE user_id=?", [
    userId,
  ]);
}

async function createPlayer(userId, aanvalLogId) {
  const [pokemons] = await query(
    "SELECT * FROM pokemon_speler WHERE user_id=? AND opzak='ja' ORDER BY opzak_nummer ASC",
    [userId]
  );
  for (const p of pokemons) {
    await query(
      `INSERT INTO pokemon_speler_gevecht 
        (id, user_id, aanval_log_id, levenmax, leven, attack, defence, speed, \`spc.attack\`, \`spc.defence\`, exp, totalexp, effect, hoelang) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p.id,
        userId,
        aanvalLogId,
        p.levenmax,
        p.leven,
        p.attack,
        p.defence,
        p.speed,
        p["spc.attack"],
        p["spc.defence"],
        p.exp,
        p.totalexp,
        p.effect,
        p.hoelang,
      ]
    );
  }
}

async function whoCanStart(userId, attackInfo) {
  const [opzak] = await query(
    "SELECT ps.id, ps.leven, ps.speed, ps.ei, pw.naam FROM pokemon_speler ps INNER JOIN pokemon_wild pw ON ps.wild_id=pw.wild_id WHERE ps.user_id=? AND ps.opzak='ja' ORDER BY ps.opzak_nummer ASC",
    [userId]
  );

  let nummer = 0;
  for (const p of opzak) {
    if (p.leven >= 1 && p.ei == 0) {
      nummer++;
      if (nummer === 1) {
        attackInfo.pokemon_speed = p.speed;
        attackInfo.pokemon = p.naam;
        attackInfo.pokemonid = p.id;
      }
    }
  }

  if (nummer === 0) {
    attackInfo.bericht = "begindood";
  } else {
    attackInfo.begin =
      attackInfo.pokemon_speed >= attackInfo.computer_speed
        ? "spelereersteaanval"
        : "computereersteaanval";
  }

  return attackInfo;
}

async function createNewTrainer(trainer, trainerAveLevel, aanvalLogId) {
    const [trainerInfo] = await query(
      `SELECT trainer.*, trainer_pokemon.* 
       FROM trainer 
       INNER JOIN trainer_pokemon ON trainer.id = trainer_pokemon.trainer_id 
       WHERE trainer.naam = ?`,
      [trainer]
    );
  
    const trainerPokemonsId = trainerInfo.pokemonwild_id.split(",");
    const attackInfo = {};
  
    if (trainerPokemonsId.length === 0) {
      attackInfo['bericht'] = 'oponent_error';
      return attackInfo;
    }
  
    for (let index = 0; index < trainerPokemonsId.length; index++) {
      const pokemonId = trainerPokemonsId[index];
      if (!pokemonId) continue;
  
      // קביעת level
      let level;
      if (trainerInfo.progress === 0 && trainerInfo.badge !== "") {
        level = 3;
      } else if (trainerInfo.badge === "") {
        level = Math.round((trainerAveLevel / 100) * getRandomInt(95, 130));
      } else {
        const val = (trainerInfo.progress + 1) * 2;
        level = Math.round((trainerAveLevel / 100) * getRandomInt(95 + val, 130 + val));
      }
  
      if (level > 100) level = 100;
      if (level < 5) level = 5;
  
      // קבלת פרטי הפוקימון
      const [newComputerSql] = await query(
        "SELECT * FROM `pokemon_wild` WHERE `wild_id`=?",
        [pokemonId]
      );
  
      // יצירת פוקימון חדש עם סטטיסטיקות
      let newComputer = await createNewComputerPokemon(newComputerSql, level);
      newComputer = createNewComputerStats(newComputer, newComputerSql, level);
  
      // הוספת הפוקימון לטבלת קרב
      const insertComputer = await query(
        `INSERT INTO pokemon_wild_gevecht 
         (wildid, aanval_log_id, level, levenmax, leven, attack, defence, speed, \`spc.attack\`, \`spc.defence\`, aanval_1, aanval_2, aanval_3, aanval_4, ability)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newComputer.id,
          aanvalLogId,
          level,
          newComputer.hpstat,
          newComputer.hpstat,
          newComputer.attackstat,
          newComputer.defencestat,
          newComputer.speedstat,
          newComputer.spcattackstat,
          newComputer.spcdefencestat,
          newComputer.aanval1,
          newComputer.aanval2,
          newComputer.aanval3,
          newComputer.aanval4,
          newComputer.ability
        ]
      );
  
      const computerId = insertComputer.insertId;
  
      // שמירת מידע לפוקימון הראשון בלבד
      if (index === 0) {
        attackInfo.computer_id = computerId;
        attackInfo.computer_wildid = newComputerSql.wild_id;
        attackInfo.computer = newComputer.pokemon;
        attackInfo.computer_speed = newComputer.speedstat;
      }
    }
    return attackInfo;
  }
  

async function createNewComputerPokemon(newComputerSql, computerLevel) {
  const newComputer = {};

  // Alle gegevens vaststellen
  newComputer.id = newComputerSql.wild_id;
  newComputer.pokemon = newComputerSql.naam;
  newComputer.aanval1 = newComputerSql.aanval_1;
  newComputer.aanval2 = newComputerSql.aanval_2;
  newComputer.aanval3 = newComputerSql.aanval_3;
  newComputer.aanval4 = newComputerSql.aanval_4;

  const abilities = newComputerSql.ability.split(",");
  const randAb = Math.floor(Math.random() * abilities.length);
  newComputer.ability = abilities[randAb];

  let klaar = false;
  let loop = 0;

  do {
    let teller = 0;
    loop++;

    // Load leveling data
    const levelenQuery = await query(
      "SELECT * FROM levelen WHERE wild_id = ? AND level <= ? ORDER BY id ASC",
      [newComputer.id, computerLevel]
    );

    for (const groei of levelenQuery) {
      teller++;

      if (computerLevel >= groei.level) {
        if (groei.wat === "att") {
          // Attack slots
          if (!newComputer.aanval1) newComputer.aanval1 = groei.aanval;
          else if (!newComputer.aanval2) newComputer.aanval2 = groei.aanval;
          else if (!newComputer.aanval3) newComputer.aanval3 = groei.aanval;
          else if (!newComputer.aanval4) newComputer.aanval4 = groei.aanval;
          else {
            // Replace random attack if not already present
            if (
              ![
                newComputer.aanval1,
                newComputer.aanval2,
                newComputer.aanval3,
                newComputer.aanval4,
              ].includes(groei.aanval)
            ) {
              const nummer = Math.floor(Math.random() * 4) + 1;
              if (nummer === 1) newComputer.aanval1 = groei.aanval;
              else if (nummer === 2) newComputer.aanval2 = groei.aanval;
              else if (nummer === 3) newComputer.aanval3 = groei.aanval;
              else if (nummer === 4) newComputer.aanval4 = groei.aanval;
            }
          }
        } else if (groei.wat === "evo") {
          // Evolve Pokémon
          const evoResult = await query(
            "SELECT * FROM pokemon_wild WHERE wild_id = ? LIMIT 1",
            [groei.nieuw_id]
          );
          if (evoResult.length > 0) {
            const evo = evoResult[0];
            newComputer.id = groei.nieuw_id;
            newComputer.pokemon = evo.naam;
            loop = 0; // reset loop
            break; // break while-loop
          }
        }
      } else {
        klaar = true;
        break;
      }
    }

    if (teller === 0 || loop === 2) {
      break;
    }
  } while (!klaar);

  return newComputer;
}

export function createNewComputerStats(
  newComputer,
  newComputerSql,
  computerLevel
) {
  // IVs אקראיים בין 2 ל-31
  const attackIv = getRandomInt(2, 31);
  const defenceIv = getRandomInt(2, 31);
  const speedIv = getRandomInt(2, 31);
  const spcAttackIv = getRandomInt(2, 31);
  const spcDefenceIv = getRandomInt(2, 31);
  const hpIv = getRandomInt(2, 31);

  // חישוב סטטיסטיקות
  newComputer.attackstat = Math.round(
    (((newComputerSql.attack_base * 2 + attackIv) * computerLevel) / 100 + 5) *
      1
  );
  newComputer.defencestat = Math.round(
    (((newComputerSql.defence_base * 2 + defenceIv) * computerLevel) / 100 +
      5) *
      1
  );
  newComputer.speedstat = Math.round(
    (((newComputerSql.speed_base * 2 + speedIv) * computerLevel) / 100 + 5) * 1
  );
  newComputer.spcattackstat = Math.round(
    (((newComputerSql["spc.attack_base"] * 2 + spcAttackIv) * computerLevel) /
      100 +
      5) *
      1
  );
  newComputer.spcdefencestat = Math.round(
    (((newComputerSql["spc.defence_base"] * 2 + spcDefenceIv) * computerLevel) /
      100 +
      5) *
      1
  );
  newComputer.hpstat = Math.round(
    ((newComputerSql.hp_base * 2 + hpIv) * computerLevel) / 100 +
      computerLevel +
      10
  );

  return newComputer;
}

export async function updatePokedex(wild_id, wat, userId) {
  const [myData] = await query(
    "SELECT `pok_gezien`,`pok_bezit` FROM `gebruikers` WHERE `user_id`=? LIMIT 1",
    [userId]
  );
  const pokedex_bezit = myData["pok_bezit"].split(",");
  const pokedex_gezien = myData["pok_gezien"].split(",");
  if (["ei", "buy", "evo"].includes(wat)) {
    if (!pokedex_gezien.includes(wild_id)) pokedex_gezien.push(wild_id);
    if (!pokedex_bezit.includes(wild_id)) pokedex_bezit.push(wild_id);
  } else if (wat === "zien") {
    if (!pokedex_gezien.includes(wild_id)) pokedex_gezien.push(wild_id);
  } else if (wat === "vangen") {
    if (!pokedex_bezit.includes(wild_id)) pokedex_bezit.push(wild_id);
  }

  const pokedex_bezit_string = pokedex_bezit.join(",");
  const pokedex_gezien_string = pokedex_gezien.join(",");
  console.log({ pokedex_bezit_string, pokedex_gezien_string });

  await query(
    "UPDATE `gebruikers` SET `pok_gezien` = ? , `pok_bezit` = ? WHERE user_id = ?",
    [pokedex_gezien_string, pokedex_bezit_string, userId]
  );
}
function getRandomInt(min, max) {
  // מחזיר מספר שלם בין min ל-max כולל
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
