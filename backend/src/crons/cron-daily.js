// cron-day.js

import cron from "node-cron";
import { query } from "../config/database.js"; // השתמש בשביל היחסי של הפרויקט שלך

// אם המיקום שונה - תעדכן את הנתיב בהתאם

// תזכורת: קרון זה מוגדר לפי זמן השרת. כרגע מוגדר להרצה יומית בחצות.
const dayCronJob = cron.schedule("0 0 * * *", async () => {
  console.log("[cron-day] מריץ קרון יומי...");
  try {
    await handleFishingTournament();
    await resetDailyData();
    await unlockBlockedUsers();
    await processOldTransfers();
    await rotateWildAreas();
    await updateMarketEggs();
    await resetFishingScores();
    await applyPremiumSettings();
    await cleanupHiddenConversations();
    await optimizeTables();
    await updateCronTime();

    console.log("[cron-day] הקרון היומי הסתיים בהצלחה.");
  } catch (err) {
    console.error("[cron-day] שגיאה בהרצת הקרון היומי:", err);
  }
}, {
  scheduled: false // לא יתחיל אוטומטית אם אתה רוצה לשלוט דרך cron-setup.js
});


// --------------------- פונקציות עיקריות ---------------------

// 1) פרסי דייג - מעדכן fishs + מוסיף כסף + הודעות
const handleFishingTournament = async () => {
  // בחר את שלושת המובילים לפי fishing
  const top = await query(
    "SELECT user_id FROM gebruikers WHERE banned != 'Y' ORDER BY fishing DESC LIMIT 3"
  );

  const prizes = [20000, 10000, 5000];
  const fishCols = ["fish", "fish2", "fish3"];

  for (let i = 0; i < top.length; i++) {
    const user = top[i];
    const prize = prizes[i] ?? 0;
    const col = fishCols[i];

    // עדכון כסף
    await query("UPDATE gebruikers SET silver = silver + ? WHERE user_id = ?", [
      prize,
      user.user_id,
    ]);

    // עדכון טבלת fishs (עמודה fish, fish2, fish3)
    await query(`UPDATE fishs SET ${col} = ? WHERE id = 1`, [user.user_id]);

    // הוספת אירוע (הודעה לשחקן) - בעברית
    const hebMsg = `🎣 זכית במקום ${i + 1} בתחרות הדיג היומית — קיבלת ${prize} מטבעות כסף.`;
    await query(
      "INSERT INTO gebeurtenis (datum, ontvanger_id, bericht, gelezen) VALUES (NOW(), ?, ?, '0')",
      [user.user_id, hebMsg]
    );
  }

  console.log("[cron-day] פרסי דייג חולקו ל-top 3 (אם היו)");
};


// 2) איפוס נתונים יומיים בסיסיים
const resetDailyData = async () => {
  const todayYMD = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  // איפוס daily_bonus
  await query("UPDATE gebruikers SET daily_bonus = 0");

  // מחיקת בקשות חברים שפג תוקפן היום (date_to_remove = today) ו־accept = 0
  await query("DELETE FROM friends WHERE date_to_remove = ? AND accept = 0", [
    todayYMD,
  ]);

  console.log("[cron-day] איפוס נתונים יומיים בוצע");
};


// 3) שחרור חשבונות שנקבע להם bloqueo לתאריך של היום
const unlockBlockedUsers = async () => {
  const todayYMD = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  await query(
    "UPDATE gebruikers SET banned = 'N', bloqueado = 'nao', bloqueado_tempo = '0000-00-00', razaobloqueado = '' WHERE bloqueado_tempo = ?",
    [todayYMD]
  );

  console.log("[cron-day] שוחררו משתמשים חסומים שהתוזמנים לפוג היום");
};


// 4) החזרת העברות ישנות (direct) - 3 ימים אחורה
const processOldTransfers = async () => {
  // בדומה ל־PHP: old_date = date("d/m/Y", time()-259200)
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  const dd = String(threeDaysAgo.getDate()).padStart(2, "0");
  const mm = String(threeDaysAgo.getMonth() + 1).padStart(2, "0");
  const yyyy = threeDaysAgo.getFullYear();
  const oldDateStr = `${dd}/${mm}/${yyyy}`; // פורמט d/m/Y כמו ב־PHP

  // שליפת הרשומות
  const transfers = await query(
    "SELECT id, pokemon_id FROM transferlijst WHERE datum = ? AND `type` = 'direct'",
    [oldDateStr]
  );

  for (const t of transfers) {
    // החזרת הפוקימון למצב שאינו opzak
    await query("UPDATE pokemon_speler SET opzak = 'nee' WHERE id = ?", [
      t.pokemon_id,
    ]);
  }

  // מחיקת הרשומות הישנות
  await query(
    "DELETE FROM transferlijst WHERE datum = ? AND `type` = 'direct'",
    [oldDateStr]
  );

  console.log("[cron-day] עיבדנו והסרנו העברות ישנות (direct) מתאריך:", oldDateStr);
};


// 5) סיבוב/העברה של אזורי פוקימונים (wild areas) — כמו ב־PHP
const rotateWildAreas = async () => {
  // פונקציות מקבילות ל־rand/choice ב־PHP
  const randInt = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  const dayOfWeek = new Date().getDay(); // 0 (Sun) - 6 (Sat)

  const worldName = (n) => {
    switch (n) {
      case 1:
        return "Kanto";
      case 2:
        return "Johto";
      case 3:
        return "Hoenn";
      case 4:
        return "Sinnoh";
      case 5:
        return "Unova";
      case 6:
        return "Kalos";
      default:
        return "Kanto";
    }
  };

  const areaName = (n) => {
    switch (n) {
      case 0:
        return "Lavagrot";
      case 1:
        return "Grot";
      case 2:
        return "Gras";
      case 3:
        return "Spookhuis";
      case 4:
        return "Vechtschool";
      case 5:
        return "Strand";
      case 6:
        return "Water";
      default:
        return "Gras";
    }
  };

  // יצירת ארבעה זוגות של עולם/אזור (כמו ב־PHP)
  const wrand1 = randInt(1, 6);
  const wrand2 = randInt(1, 6);
  const wrand3 = randInt(1, 6);
  const wrand4 = randInt(1, 6);

  const world2 = worldName(wrand2);
  const gebied2 = areaName(dayOfWeek);

  const world3 = worldName(wrand3);
  const gebied3 = areaName(dayOfWeek);

  const world4 = worldName(wrand4);
  const gebied4 = areaName(dayOfWeek);

  // עדכון לטווח הפוקימונים שב־PHP (895, 840, 923). (800 הושארה כמושמטת)
  await query("UPDATE pokemon_wild SET wereld = ?, gebied = ? WHERE wild_id = 895", [
    world2,
    gebied2,
  ]);
  await query("UPDATE pokemon_wild SET wereld = ?, gebied = ? WHERE wild_id = 840", [
    world3,
    gebied3,
  ]);
  await query("UPDATE pokemon_wild SET wereld = ?, gebied = ? WHERE wild_id = 923", [
    world4,
    gebied4,
  ]);

  console.log("[cron-day] סיבוב אזורי wild לביצועים: ", { world2, gebied2, world3, gebied3, world4, gebied4 });
};


// 6) עדכון מלאי שוק (ביצים) בימים ספציפיים
const updateMarketEggs = async () => {
  // ב־PHP: if ((date('w') == 1) OR (date('w') == 5)) UPDATE markt SET beschikbaar = '0' WHERE soort = 'pokemon'
  // date('w')==1 -> Monday; date('w')==5 -> Friday (ב־PHP)
  const dayOfWeek = new Date().getDay(); // 0..6
  if (dayOfWeek === 1 || dayOfWeek === 5) {
    await query("UPDATE markt SET beschikbaar = '0' WHERE soort = 'pokemon'");
    console.log("[cron-day] עדכון מלאי שוק (markt) - ביצים הופסק זמנית (disponibility=0)");
  } else {
    console.log("[cron-day] לא יום מתוזמן לעדכון שוק הביצים");
  }
};

// 7) איפוס ניקוד דייג לכלל המשתמשים (PHP: UPDATE `gebruikers` SET `fishing`='0')
const resetFishingScores = async () => {
  await query("UPDATE gebruikers SET fishing = 0");
  console.log("[cron-day] איפוס ניקוד דייג לכל המשתמשים");
};

// 8) עדכון פרמטרי פרימיום / לא פרימיום
const applyPremiumSettings = async () => {
  const nowUnix = Math.floor(Date.now() / 1000);

  // פרימיום פעיל
  await query(
    "UPDATE gebruikers SET to_steal = '3', lucky_wheel = '3', to_deposit = '5', puffins = '10', calc_limit = '15', calc_multiplier = '0' WHERE premiumaccount > ?",
    [nowUnix]
  );

  // פרימיום לא פעיל
  await query(
    "UPDATE gebruikers SET to_steal = '1', lucky_wheel = '1', to_deposit = '3', puffins = '5', calc_limit = '5', calc_multiplier = '0' WHERE premiumaccount < ?",
    [nowUnix]
  );

  console.log("[cron-day] עדכון הגדרות פרימיום הושלם");
};

// 9) ניקוי שיחות מוסתרות (שנבחרו להעלם לשני הצדדים)
const cleanupHiddenConversations = async () => {
  // ב־PHP בוצע SELECT ואז מחיקה; כאן נמחק חכם לכל ההתאמות:
  const hiddenConvos = await query("SELECT id FROM conversas WHERE trainer_1_hidden = '1' AND trainer_2_hidden = '1'");

  if (hiddenConvos.length > 0) {
    const ids = hiddenConvos.map((r) => r.id);
    // מחיקת הודעות משויכות
    await query(`DELETE FROM conversas_messages WHERE conversa IN (${ids.map(() => "?").join(",")})`, ids);
    // מחיקת השיחות
    await query(`DELETE FROM conversas WHERE id IN (${ids.map(() => "?").join(",")})`, ids);

    console.log("[cron-day] נמחקו שיחות מוסתרות לחלוטין:", ids);
  } else {
    console.log("[cron-day] לא נמצאו שיחות מוסתרות למחיקה");
  }
};

// 10) אופטימיזציה לטבלאות (כמו ב־PHP)
const optimizeTables = async () => {
  const tables = [
    "accounts",
    "gebruikers",
    "gebruikers_item",
    "pokemon_speler",
    "pokemon_speler_gevecht",
    "pokemon_wild",
    "pokemon_wild_gevecht",
    "conversas",
    "conversas_messages",
    "aanval_log",
    "cron",
    "inlog_fout",
    "inlog_logs",
    "pokemon_gezien",
    "pokemon_nieuw_baby",
    "pokemon_nieuw_starter",
    "pokemon_nieuw_gewoon",
    "bank_logs",
    "battle_logs",
    "release_log",
    "transferlist_log"
  ];

  for (const t of tables) {
    try {
      await query(`OPTIMIZE TABLE ${t}`);
    } catch (err) {
      console.warn(`[cron-day] אופטימיזציה לטבלה ${t} נכשלה:`, err.message);
    }
  }

  console.log("[cron-day] ניסיון אופטימיזציה הסתיים");
};

// 11) עדכון זמן הריצה האחרון של הקרון (טבלה cron, שדה tijd, soort='dag')
const updateCronTime = async () => {
  const now = new Date().toISOString().slice(0, 19).replace("T", " ");
  await query("UPDATE cron SET tijd = ? WHERE soort = 'dag'", [now]);
};

// --------------------- פונקציות ניהול קרון (exports) ---------------------

export const startDayCron = () => {
  dayCronJob.start();
  console.log("[cron-day] קרון יומי הופעל");
};

export const stopDayCron = () => {
  dayCronJob.stop();
  console.log("[cron-day] קרון יומי נעצר");
};

export const runDayCronManually = async () => {
  console.log("[cron-day] הרצת קרון יומי ידנית...");
  try {
    await handleFishingTournament();
    await resetDailyData();
    await unlockBlockedUsers();
    await processOldTransfers();
    await rotateWildAreas();
    await updateMarketEggs();
    await resetFishingScores();
    await applyPremiumSettings();
    await cleanupHiddenConversations();
    await optimizeTables();
    await updateCronTime();

    return { success: true, message: "Cron היומי בוצע בהצלחה" };
  } catch (error) {
    console.error("[cron-day] שגיאה בהרצה ידנית:", error);
    return { success: false, message: "שגיאה בהרצה ידנית", error: error.message };
  }
};

export default dayCronJob;
