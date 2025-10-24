import { query } from "../config/database.js";

export const getAdmins = async (_, res) => {
  const moderators = await query(
    "SELECT username FROM gebruikers WHERE admin = '1'",
    []
  );
  const administrators = await query(
    "SELECT username FROM gebruikers WHERE admin = '2'",
    []
  );
  const owners = await query(
    "SELECT username FROM gebruikers WHERE admin = '3'",
    []
  );
  return res.json({
    administrators,
    owners,
    moderators,
  });
};

export const removeAdmin = async (req, res) => {
  try {
    const { username } = req.body;
    await query("UPDATE gebruikers SET admin = '0' WHERE username = ?", [
      username,
    ]);
    res.json({
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.json({
      success: false,
    });
  }
};
export const addAdmin = async (req, res) => {
  try {
    const { username } = req.body;
    await query("UPDATE gebruikers SET admin = '1' WHERE username = ?", [
      username,
    ]);
    res.json({
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.json({
      success: false,
    });
  }
};

export const getBannedAccounts = async (req, res) => {
  try {
    const adminUserId = req.user.user_id;

    // Verify admin permissions
    const [admin] = await query(
      "SELECT admin FROM gebruikers WHERE user_id = ?",
      [adminUserId]
    );

    if (!admin || admin.admin < 3) {
      return res.status(403).json({
        success: false,
        message: "אין הרשאות מנהל",
      });
    }

    // Get banned accounts
    const bannedAccounts = await query(`
      SELECT r.email, r.username, r.blocked_time, r.reasonblocked, r.acc_id
      FROM accounts r
      WHERE r.blocked = 'sim'
      ORDER BY r.blocked_time DESC
    `);

    return res.json({
      success: true,
      data: bannedAccounts.map((account) => ({
        accId: account.acc_id,
        email: account.email,
        username: account.username,
        bannedUntil:
          account.blocked_time === "0000-00-00"
            ? null
            : account.blocked_time,
        reason: account.reasonblocked,
      })),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "שגיאה בטעינת חשבונות חסומים",
      error: error.message,
    });
  }
};

// Ban an account
export const banAccount = async (req, res) => {
  try {
    const { email, reason, banUntil } = req.body;
    const adminUserId = req.user.user_id;

    // Validate input
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "יש להזין כתובת אימייל",
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "יש להזין סיבה",
      });
    }

    // Verify admin permissions
    const [admin] = await query(
      "SELECT admin FROM gebruikers WHERE user_id = ?",
      [adminUserId]
    );

    if (!admin || admin.admin < 3) {
      return res.status(403).json({
        success: false,
        message: "אין הרשאות מנהל",
      });
    }

    // Check if account exists
    const [account] = await query(
      "SELECT acc_id FROM accounts WHERE email = ?",
      [email]
    );

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "החשבון לא נמצא",
      });
    }

    // Validate ban date if provided
    let banDate = "0000-00-00";
    if (banUntil) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(banUntil)) {
        return res.status(400).json({
          success: false,
          message: "פורמט תאריך לא תקין (YYYY-MM-DD)",
        });
      }
      banDate = banUntil;
    }

    // Ban the account
    await query("UPDATE gebruikers SET banned = 'Y' WHERE acc_id = ?", [
      account.acc_id,
    ]);

    await query(
      "UPDATE accounts SET account_code = '0', blocked = 'sim', blocked_time = ?, reasonblocked = ? WHERE email = ?",
      [banDate, reason, email]
    );

    const banMessage =
      banDate === "0000-00-00"
        ? `החשבון נחסם לצמיתות`
        : `החשבון נחסם עד ${banDate}`;

    return res.json({
      success: true,
      message: banMessage,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "שגיאה בחסימת החשבון",
      error: error.message,
    });
  }
};

// Unban an account
export const unbanAccount = async (req, res) => {
  try {
    const { email } = req.body;
    const adminUserId = req.user.user_id;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "יש להזין כתובת אימייל",
      });
    }

    // Verify admin permissions
    const [admin] = await query(
      "SELECT admin FROM gebruikers WHERE user_id = ?",
      [adminUserId]
    );

    if (!admin || admin.admin < 3) {
      return res.status(403).json({
        success: false,
        message: "אין הרשאות מנהל",
      });
    }

    // Check if account exists
    const [account] = await query(
      "SELECT acc_id FROM accounts WHERE email = ?",
      [email]
    );

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "החשבון לא נמצא",
      });
    }

    // Unban the account
    await query("UPDATE gebruikers SET banned = 'N' WHERE acc_id = ?", [
      account.acc_id,
    ]);

    await query(
      "UPDATE accounts SET account_code = '1', blocked = 'nao', blocked_time = '0000-00-00', reasonblocked = '' WHERE email = ?",
      [email]
    );

    return res.json({
      success: true,
      message: "החשבון שוחרר מחסימה",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "שגיאה בשחרור החשבון",
      error: error.message,
    });
  }
};

// Check if account is banned
export const checkBanStatus = async (req, res) => {
  try {
    const { email } = req.params;

    const [account] = await query(
      `
      SELECT blocked, blocked_time, reasonblocked 
      FROM accounts 
      WHERE email = ?
    `,
      [email]
    );

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "החשבון לא נמצא",
      });
    }

    const isBanned = account.blocked === "sim";
    const isPermanent = account.blocked_time === "0000-00-00";

    // Check if temporary ban has expired
    let banExpired = false;
    if (isBanned && !isPermanent) {
      const banDate = new Date(account.blocked_time);
      const now = new Date();
      banExpired = now > banDate;

      // Auto-unban if expired
      if (banExpired) {
        await query(
          "UPDATE gebruikers SET banned = 'N' WHERE acc_id = (SELECT acc_id FROM accounts WHERE email = ?)",
          [email]
        );
        await query(
          "UPDATE accounts SET account_code = '1', blocked = 'nao', blocked_time = '0000-00-00', reasonblocked = '' WHERE email = ?",
          [email]
        );
      }
    }

    return res.json({
      success: true,
      data: {
        isBanned: isBanned && !banExpired,
        isPermanent: isPermanent && !banExpired,
        bannedUntil:
          !isPermanent && !banExpired ? account.blocked_time : null,
        reason: account.reasonblocked,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "שגיאה בבדיקת סטטוס חסימה",
      error: error.message,
    });
  }
};

// POST ban a player
export const banPlayer = async (req, res) => {
  try {
    const { username, reason, until } = req.body;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "הזן שם של מאמן",
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "הזן סיבה",
      });
    }

    const banUntil = until || "0000-00-00";

    await query(
      "UPDATE gebruikers SET banned='Y', blocked='sim', blocked_time=?, reasonblocked=? WHERE username=?",
      [banUntil, reason, username]
    );

    const timeText = banUntil === "0000-00-00" ? "לצמיתות" : `עד ${banUntil}`;

    return res.json({
      success: true,
      message: `המאמן ${username} נחסם בהצלחה ${timeText}`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "שגיאה בחסימת מאמן",
      error: error.message,
    });
  }
};

// POST unban a player
export const unbanPlayer = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "שם משתמש נדרש",
      });
    }

    await query(
      "UPDATE gebruikers SET banned='N', blocked='nao', blocked_time='0000-00-00', reasonblocked='' WHERE username=?",
      [username]
    );

    return res.json({
      success: true,
      message: "המאמן שוחרר מחסימה",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "שגיאה בשחרור מאמן",
      error: error.message,
    });
  }
};

// GET list of banned players
export const getBannedPlayers = async (req, res) => {
  try {
    const bannedList = await query(
      "SELECT username, blocked_time, reasonblocked FROM gebruikers WHERE banned='Y' OR blocked='sim' ORDER BY blocked_time DESC"
    );

    return res.json({
      success: true,
      players: bannedList,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "שגיאה בטעינת רשימת חסומים",
      error: error.message,
    });
  }
};

// POST ban an IP address
export const banIP = async (req, res) => {
  try {
    const { ip, userId, until, reason } = req.body;

    if (!ip || !ip.trim()) {
      return res.status(400).json({
        success: false,
        message: "הזן כתובת IP תקינה",
      });
    }

    if (!until || !until.trim()) {
      return res.status(400).json({
        success: false,
        message: "הזן זמן",
      });
    }

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: "הזן סיבה",
      });
    }

    // Validate IP format (basic validation)
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ip)) {
      return res.status(400).json({
        success: false,
        message: "פורמט IP לא תקין",
      });
    }

    // Check if IP is already banned
    const existing = await query("SELECT ip FROM ban WHERE ip = ?", [ip]);
    if (existing && existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "כתובת IP זו כבר חסומה",
      });
    }

    await query(
      "INSERT INTO ban (ip, user_id, tot, reden) VALUES (?, ?, ?, ?)",
      [ip, userId || 0, until, reason]
    );

    return res.json({
      success: true,
      message: `כתובת ה-IP ${ip} נחסמה בהצלחה עד ${until}`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "שגיאה בחסימת IP",
      error: error.message,
    });
  }
};

// POST unban an IP address
export const unbanIP = async (req, res) => {
  try {
    const { ip } = req.body;

    if (!ip) {
      return res.status(400).json({
        success: false,
        message: "כתובת IP נדרשת",
      });
    }

    await query("DELETE FROM ban WHERE ip = ?", [ip]);

    return res.json({
      success: true,
      message: "כתובת ה-IP שוחררה מחסימה",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "שגיאה בשחרור IP",
      error: error.message,
    });
  }
};

// GET list of banned IPs
export const getBannedIPs = async (req, res) => {
  try {
    const bannedList = await query(
      "SELECT ip, user_id, tot, reden FROM ban ORDER BY tot DESC"
    );

    return res.json({
      success: true,
      ips: bannedList,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "שגיאה בטעינת רשימת IP חסומים",
      error: error.message,
    });
  }
};

// GET search accounts by IP
export const searchAccountsByIP = async (req, res) => {
  try {
    const { ip, type = "login" } = req.query;

    if (!ip || !ip.trim()) {
      return res.status(400).json({
        success: false,
        message: "הזן כתובת IP לחיפוש",
      });
    }

    // Validate IP format
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ip)) {
      return res.status(400).json({
        success: false,
        message: "פורמט IP לא תקין",
      });
    }

    let accounts;
    if (type === "register") {
      accounts = await query(
        "SELECT acc_id, username, ip_registered, ip_loggedin, email FROM accounts WHERE account_code='1' AND ip_registered=? ORDER BY username",
        [ip]
      );
    } else {
      accounts = await query(
        "SELECT acc_id, username, ip_registered, ip_loggedin, email FROM accounts WHERE account_code='1' AND ip_loggedin=? ORDER BY username",
        [ip]
      );
    }

    return res.json({
      success: true,
      accounts,
      searchType: type,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "שגיאה בחיפוש חשבונות",
      error: error.message,
    });
  }
};

// GET detect multi-accounts (duplicate IPs)
export const detectMultiAccounts = async (req, res) => {
  try {
    const { type = "login", limit = 50 } = req.query;

    let multiAccounts = [];

    if (type === "register") {
      // Check for duplicate registration IPs
      const duplicateIPs = await query(
        `SELECT ip_registered as ip, COUNT(*) as count, 
         GROUP_CONCAT(username ORDER BY username SEPARATOR ', ') as usernames,
         GROUP_CONCAT(acc_id ORDER BY username SEPARATOR ',') as account_ids
         FROM accounts 
         WHERE account_code='1' AND ip_registered IS NOT NULL AND ip_registered != ''
         GROUP BY ip_registered 
         HAVING count > 1 
         ORDER BY count DESC 
         LIMIT ${limit}`,
        []
      );

      multiAccounts = duplicateIPs.map((row) => ({
        ip: row.ip,
        count: row.count,
        accounts: row.usernames.split(", "),
        accountIds: row.account_ids.split(",").map(Number),
      }));
    } else {
      // Check for duplicate login IPs from recent logs
      const duplicateIPs = await query(
        `SELECT ip, COUNT(DISTINCT speler) as count,
         GROUP_CONCAT(DISTINCT speler ORDER BY speler SEPARATOR ', ') as usernames
         FROM inlog_logs 
         WHERE ip IS NOT NULL AND ip != ''
         GROUP BY ip 
         HAVING count > 1 
         ORDER BY datum DESC
         LIMIT ${limit}`,
        []
      );

      multiAccounts = duplicateIPs.map((row) => ({
        ip: row.ip,
        count: row.count,
        accounts: row.usernames.split(", "),
      }));
    }

    return res.json({
      success: true,
      type,
      multiAccounts,
      total: multiAccounts.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "שגיאה בזיהוי חשבונות כפולים",
      error: error.message,
    });
  }
};

// GET combined bank logs and messages with pagination
export const getCombinedLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const offset = (pageNum - 1) * limitNum;

    // Get total count for bank_logs
    const countResult = await query("SELECT COUNT(*) as total FROM bank_logs");
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limitNum);

    // Get bank logs with pagination
    const bankLogs = await query(
      `SELECT id, sender, reciever, date, what, amount 
       FROM bank_logs 
       ORDER BY id DESC 
       LIMIT ${limitNum} OFFSET ${offset}`,
      []
    );

    // Get messages with user info (joined with gebruikers)
    const messages = await query(
      `SELECT b.datum, b.afzender_id, b.ontvanger_id, b.bericht, b.onderwerp, g.username
       FROM berichten b
       INNER JOIN gebruikers g ON b.ontvanger_id = g.user_id 
       ORDER BY b.datum DESC 
       LIMIT ${limitNum} OFFSET ${offset}`,
      []
    );

    return res.json({
      success: true,
      bankLogs,
      messages,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: total,
        itemsPerPage: limitNum,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "שגיאה בטעינת לוגים",
      error: error.message,
    });
  }
};

// GET transfer list transaction logs with pagination
export const getTransferListLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const offset = (pageNum - 1) * limitNum;

    // Get total count
    const countResult = await query(
      "SELECT COUNT(*) as total FROM transferlist_log"
    );
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limitNum);

    // Get logs with pokemon info
    const logs = await query(
      `SELECT 
        tl.id,
        tl.buyer,
        tl.seller,
        tl.date,
        tl.wild_id,
        tl.level,
        tl.silver,
        tl.gold,
        pw.real_id,
        pw.naam as pokemon_name
       FROM transferlist_log tl
       INNER JOIN pokemon_wild pw ON tl.wild_id = pw.wild_id
       ORDER BY tl.id DESC 
       LIMIT ${limitNum} OFFSET ${offset}`,
      []
    );

    return res.json({
      success: true,
      logs,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: total,
        itemsPerPage: limitNum,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "שגיאה בטעינת לוגים של Transfer List",
      error: error.message,
    });
  }
};

// GET transfer list logs by username (buyer or seller)
export const getTransferListLogsByUser = async (req, res) => {
  try {
    const { username, page = 1, limit = 50 } = req.query;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "שם משתמש נדרש",
      });
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const offset = (pageNum - 1) * limitNum;

    const [user] = await query(
      "SELECT user_id FROM gebruikers WHERE username = ?",
      [username]
    );

    // Get total count for this user
    const countResult = await query(
      "SELECT COUNT(*) as total FROM transferlist_log WHERE buyer=? OR seller=?",
      [user.user_id, user.user_id]
    );
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limitNum);

    // Get logs
    const logs = await query(
      `SELECT 
        tl.id,
        tl.buyer,
        tl.seller,
        tl.date,
        tl.wild_id,
        tl.level,
        tl.silver,
        tl.gold,
        pw.real_id,
        pw.naam as pokemon_name
       FROM transferlist_log tl
       INNER JOIN pokemon_wild pw ON tl.wild_id = pw.wild_id
       WHERE tl.buyer=? OR tl.seller=?
       ORDER BY tl.id DESC 
       LIMIT ${limitNum} OFFSET ${offset}`,
      [user.user_id, user.user_id]
    );

    return res.json({
      success: true,
      logs,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: total,
        itemsPerPage: limitNum,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "שגיאה בטעינת לוגים של משתמש",
      error: error.message,
    });
  }
};

// POST create new pokemon
export const createPokemon = async (req, res) => {
  try {
    const {
      id,
      zona,
      nome,
      raridade,
      evolutie,
      type1,
      type2,
      local,
      captura,
      exp,
      baseexp,
      atack1,
      atack2,
      atack3,
      atack4,
      atkbase,
      defbase,
      spatkbase,
      spdefbase,
      speedbase,
      hpbase,
      effortatk,
      effortdef,
      effortspatk,
      effortspdef,
      effortspeed,
      efforthp,
      aparece,
      lendario,
      comerciantes,
      levelMoves,
      movetutor,
      relacionados,
    } = req.body;

    // Insert pokemon
    const result = await query(
      `INSERT INTO pokemon_wild (
        wild_id, wereld, naam, zeldzaamheid, evolutie, type1, type2, gebied, 
        vangbaarheid, groei, base_exp, aanval_1, aanval_2, aanval_3, aanval_4,
        attack_base, defence_base, \`spc.attack_base\`, \`spc.defence_base\`, 
        speed_base, hp_base, effort_attack, effort_defence, \`effort_spc.attack\`,
        \`effort_spc.defence\`, effort_speed, effort_hp, aparece, lendario, comerciantes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        zona,
        nome,
        raridade,
        evolutie,
        type1,
        type2 || null,
        local,
        captura,
        exp,
        baseexp,
        atack1,
        atack2,
        atack3,
        atack4,
        atkbase,
        defbase,
        spatkbase,
        spdefbase,
        speedbase,
        hpbase,
        effortatk,
        effortdef,
        effortspatk,
        effortspdef,
        effortspeed,
        efforthp,
        aparece,
        lendario,
        comerciantes,
      ]
    );

    const pokemonId = result.insertId || id;

    // Insert level-up moves
    if (levelMoves && Array.isArray(levelMoves)) {
      for (const move of levelMoves) {
        if (move.level && move.attack) {
          await query(
            `INSERT INTO levelen (level, stone, trade, wild_id, wat, nieuw_id, aanval)
             VALUES (?, '', '0', ?, 'att', '0', ?)`,
            [move.level, pokemonId, move.attack]
          );
        }
      }
    }

    // Update move tutor relationships
    if (movetutor && Array.isArray(movetutor)) {
      for (const tutorName of movetutor) {
        const [tutor] = await query(
          "SELECT relacionados FROM tmhm_movetutor WHERE naam = ?",
          [tutorName]
        );
        if (tutor) {
          const newRelated = `${tutor.relacionados},${pokemonId}`;
          await query(
            "UPDATE tmhm_movetutor SET relacionados = ? WHERE naam = ?",
            [newRelated, tutorName]
          );
        }
      }
    }

    // Update TM/HM relationships
    if (relacionados && Array.isArray(relacionados)) {
      for (const tmName of relacionados) {
        const [tm] = await query(
          "SELECT relacionados FROM tmhm_relacionados WHERE naam = ?",
          [tmName]
        );
        if (tm) {
          const newRelated = `${tm.relacionados},${pokemonId}`;
          await query(
            "UPDATE tmhm_relacionados SET relacionados = ? WHERE naam = ?",
            [newRelated, tmName]
          );
        }
      }
    }

    return res.json({
      success: true,
      message: "הפוקימון נוסף בהצלחה",
      pokemonId,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "שגיאה ביצירת פוקימון",
      error: error.message,
    });
  }
};

// Helper function to calculate stats
const calculateStats = (base, iv, level, multiplier) => {
  return Math.round((((base * 2 + iv) * level) / 100 + 5) * multiplier);
};

const calculateHP = (base, iv, level) => {
  return Math.round(((base * 2 + iv) * level) / 100 + level + 10);
};

// Helper function to generate random IV (2-31)
const generateIV = () => Math.floor(Math.random() * 30) + 2;

// Helper function to select random ability
const selectAbility = (abilities) => {
  const abilityList = abilities.split(",");
  return abilityList[Math.floor(Math.random() * abilityList.length)];
};

// POST give egg to player
export const giveEgg = async (req, res) => {
  try {
    const { userId, eggType, region } = req.body;

    // Validation
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "הזן ID של מאמן",
      });
    }

    if (!region) {
      return res.status(400).json({
        success: false,
        message: "בחר אזור",
      });
    }

    if (!eggType) {
      return res.status(400).json({
        success: false,
        message: "בחר ביצה",
      });
    }

    // Check if player has 6 pokemon already
    const [pokemonCount] = await query(
      "SELECT COUNT(*) as count FROM pokemon_speler WHERE user_id = ? AND opzak = 'ja'",
      [userId]
    );

    if (pokemonCount.count >= 6) {
      return res.status(400).json({
        success: false,
        message: "למאמן יש כבר 6 פוקימונים איתו",
      });
    }

    const opzakNumber = pokemonCount.count + 1;
    const currentTime = new Date().toISOString().slice(0, 19).replace("T", " ");

    // Determine which table to use based on egg type
    let joinTable;
    if (eggType === 1) joinTable = "pokemon_nieuw_starter";
    else if (eggType === 2) joinTable = "pokemon_nieuw_normaal";
    else if (eggType === 3) joinTable = "pokemon_nieuw_baby";
    else {
      return res.status(400).json({
        success: false,
        message: "סוג ביצה לא תקין",
      });
    }

    // Get random pokemon from the appropriate table
    const [pokemon] = await query(
      `SELECT pw.wild_id, pw.naam, pw.groei, pw.attack_base, pw.defence_base, 
              pw.speed_base, pw.\`spc.attack_base\`, pw.\`spc.defence_base\`, 
              pw.hp_base, pw.aanval_1, pw.aanval_2, pw.aanval_3, pw.aanval_4, 
              pw.ability
       FROM pokemon_wild pw
       INNER JOIN ${joinTable} pnb ON pw.wild_id = pnb.wild_id
       WHERE pw.wereld = ?
       ORDER BY RAND()
       LIMIT 1`,
      [region]
    );

    if (!pokemon) {
      return res.status(404).json({
        success: false,
        message: "לא נמצא פוקימון מתאים",
      });
    }

    // Insert pokemon into pokemon_speler
    const insertResult = await query(
      `INSERT INTO pokemon_speler (wild_id, aanval_1, aanval_2, aanval_3, aanval_4)
       SELECT wild_id, aanval_1, aanval_2, aanval_3, aanval_4
       FROM pokemon_wild
       WHERE wild_id = ?`,
      [pokemon.wild_id]
    );

    const pokemonId = insertResult.insertId;

    // Update player's pokemon count
    await query(
      "UPDATE gebruikers SET number_of_pokemon = number_of_pokemon + 1 WHERE user_id = ?",
      [userId]
    );

    // Get random character
    const [character] = await query(
      "SELECT * FROM karakters ORDER BY RAND() LIMIT 1"
    );

    // Get experience needed for level 6
    const [expData] = await query(
      "SELECT punten FROM experience WHERE soort = ? AND level = 6",
      [pokemon.groei]
    );

    // Generate IVs
    const attackIV = generateIV();
    const defenceIV = generateIV();
    const speedIV = generateIV();
    const spcAttackIV = generateIV();
    const spcDefenceIV = generateIV();
    const hpIV = generateIV();

    // Calculate stats for level 5
    const level = 5;
    const attackStat = calculateStats(
      pokemon.attack_base,
      attackIV,
      level,
      character.attack_add
    );
    const defenceStat = calculateStats(
      pokemon.defence_base,
      defenceIV,
      level,
      character.defence_add
    );
    const speedStat = calculateStats(
      pokemon.speed_base,
      speedIV,
      level,
      character.speed_add
    );
    const spcAttackStat = calculateStats(
      pokemon["spc.attack_base"],
      spcAttackIV,
      level,
      character["spc.attack_add"]
    );
    const spcDefenceStat = calculateStats(
      pokemon["spc.defence_base"],
      spcDefenceIV,
      level,
      character["spc.defence_add"]
    );
    const hpStat = calculateHP(pokemon.hp_base, hpIV, level);

    // Select random ability
    const ability = selectAbility(pokemon.ability);

    // Determine time field based on egg type
    const timeField = eggType === 3 ? "baby_tijd" : "ei_tijd";

    // Update pokemon with all data
    await query(
      `UPDATE pokemon_speler SET
        level = 5,
        karakter = ?,
        expnodig = ?,
        user_id = ?,
        opzak = 'ja',
        opzak_nummer = ?,
        ei = '1',
        ${timeField} = ?,
        attack_iv = ?,
        defence_iv = ?,
        speed_iv = ?,
        \`spc.attack_iv\` = ?,
        \`spc.defence_iv\` = ?,
        hp_iv = ?,
        attack = ?,
        defence = ?,
        speed = ?,
        \`spc.attack\` = ?,
        \`spc.defence\` = ?,
        levenmax = ?,
        leven = ?,
        ability = ?,
        capture_date = ?
       WHERE id = ?`,
      [
        character.karakter_naam,
        expData.punten,
        userId,
        opzakNumber,
        currentTime,
        attackIV,
        defenceIV,
        speedIV,
        spcAttackIV,
        spcDefenceIV,
        hpIV,
        attackStat,
        defenceStat,
        speedStat,
        spcAttackStat,
        spcDefenceStat,
        hpStat,
        hpStat,
        ability,
        currentTime,
        pokemonId,
      ]
    );

    return res.json({
      success: true,
      message: "ביצת הפוקימון נשלחה בהצלחה",
      pokemon: {
        name: pokemon.naam,
        level: 5,
        character: character.karakter_naam,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "שגיאה במתן ביצה",
      error: error.message,
    });
  }
};

// GET all TM/HM for selection
export const getTMHMList = async (req, res) => {
  try {
    const tmList = await query(
      "SELECT naam, omschrijving FROM tmhm_relacionados ORDER BY naam"
    );
    return res.json({ success: true, tmList });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "שגיאה בטעינת TM/HM",
      error: error.message,
    });
  }
};

// GET all Move Tutors for selection
export const getMoveTutorList = async (req, res) => {
  try {
    const tutorList = await query(
      "SELECT naam FROM tmhm_movetutor ORDER BY naam"
    );
    return res.json({ success: true, tutorList });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "שגיאה בטעינת Move Tutors",
      error: error.message,
    });
  }
};

export const getPokemons = async (req, res) => {
  const pokemons = await query(
    "SELECT wild_id, naam, type1 FROM pokemon_wild ORDER BY naam ASC",
    []
  );
  res.json(pokemons);
};

export const givePokemon = async (req, res) => {
  const { isEgg, level, maxIV, minIV, userId, wildId } = req.body;
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "הזן ID של מאמן",
    });
  }
  // Check if player has 6 pokemon already
  const [pokemonCount] = await query(
    "SELECT COUNT(*) as count FROM pokemon_speler WHERE user_id = ? AND opzak = 'ja'",
    [userId]
  );

  if (pokemonCount.count >= 6) {
    return res.status(400).json({
      success: false,
      message: "למאמן יש כבר 6 פוקימונים איתו",
    });
  }

  const opzakNumber = pokemonCount.count + 1;
  const currentTime = new Date().toISOString().slice(0, 19).replace("T", " ");

  const [pokemon] = await query(
    "SELECT * FROM `pokemon_wild` WHERE `wild_id`=?",
    [wildId]
  );

  // Insert pokemon into pokemon_speler
  const insertResult = await query(
    `INSERT INTO pokemon_speler (wild_id, aanval_1, aanval_2, aanval_3, aanval_4)
       SELECT wild_id, aanval_1, aanval_2, aanval_3, aanval_4
       FROM pokemon_wild
       WHERE wild_id = ?`,
    [pokemon.wild_id]
  );

  const pokemonId = insertResult.insertId;

  // Update player's pokemon count
  await query(
    "UPDATE gebruikers SET number_of_pokemon = number_of_pokemon + 1 WHERE user_id = ?",
    [userId]
  );

  // Get random character
  const [character] = await query(
    "SELECT * FROM karakters ORDER BY RAND() LIMIT 1"
  );

  // Get experience needed for level 6
  const [expData] = await query(
    "SELECT punten FROM experience WHERE soort = ? AND level = ?",
    [pokemon.groei, level]
  );

  const min = Math.min(minIV, maxIV);
  const max = Math.max(minIV, maxIV);

  // Generate IVs
  const attackIV = randomBetween(min, max);
  const defenceIV = randomBetween(min, max);
  const speedIV = randomBetween(min, max);
  const spcAttackIV = randomBetween(min, max);
  const spcDefenceIV = randomBetween(min, max);
  const hpIV = randomBetween(min, max);

  const attackStat = calculateStats(
    pokemon.attack_base,
    attackIV,
    level,
    character.attack_add
  );
  const defenceStat = calculateStats(
    pokemon.defence_base,
    defenceIV,
    level,
    character.defence_add
  );
  const speedStat = calculateStats(
    pokemon.speed_base,
    speedIV,
    level,
    character.speed_add
  );
  const spcAttackStat = calculateStats(
    pokemon["spc.attack_base"],
    spcAttackIV,
    level,
    character["spc.attack_add"]
  );
  const spcDefenceStat = calculateStats(
    pokemon["spc.defence_base"],
    spcDefenceIV,
    level,
    character["spc.defence_add"]
  );
  const hpStat = calculateHP(pokemon.hp_base, hpIV, level);

  // Select random ability
  const ability = selectAbility(pokemon.ability);

  const egg = isEgg === "n" ? 0 : 1;

  await query(
    `UPDATE pokemon_speler SET
      level = ?,
      karakter = ?,
      expnodig = ?,
      user_id = ?,
      opzak = 'ja',
      opzak_nummer = ?,
      ei = ?,
      ei_tijd = ?,
      attack_iv = ?,
      defence_iv = ?,
      speed_iv = ?,
      \`spc.attack_iv\` = ?,
      \`spc.defence_iv\` = ?,
      hp_iv = ?,
      attack = ?,
      defence = ?,
      speed = ?,
      \`spc.attack\` = ?,
      \`spc.defence\` = ?,
      levenmax = ?,
      leven = ?,
      ability = ?,
      capture_date = ?
     WHERE id = ?`,
    [
      level,
      character.karakter_naam,
      expData.punten,
      userId,
      opzakNumber,
      egg,
      currentTime,
      attackIV,
      defenceIV,
      speedIV,
      spcAttackIV,
      spcDefenceIV,
      hpIV,
      attackStat,
      defenceStat,
      speedStat,
      spcAttackStat,
      spcDefenceStat,
      hpStat,
      hpStat,
      ability,
      currentTime,
      pokemonId,
    ]
  );

  return res.json({
    success: true,
    message: "הפוקימון נשלח בהצלחה",
    pokemon: {
      name: pokemon.naam,
      level,
      character: character.karakter_naam,
    },
  });
};

const randomBetween = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;


// POST give silver to all players
export const giveSilverToAll = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({
        success: false,
        message: "עליך להזין מספר",
      });
    }

    const silverAmount = Number(amount);

    if (silverAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "הסכום חייב להיות גדול מ-0",
      });
    }

    // Give silver to all players
    await query(
      "UPDATE gebruikers SET silver = silver + ? WHERE user_id > 0",
      [silverAmount]
    );

    // Get count of affected players
    const [countResult] = await query(
      "SELECT COUNT(*) as count FROM gebruikers WHERE user_id > 0"
    );

    return res.json({
      success: true,
      message: `${silverAmount.toLocaleString()} Silver ניתן בהצלחה לכל השחקנים`,
      playersAffected: countResult.count,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "שגיאה במתן Silver",
      error: error.message,
    });
  }
};

// POST give gold to all players
export const giveGoldToAll = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({
        success: false,
        message: "עליך להזין מספר",
      });
    }

    const goldAmount = Number(amount);

    if (goldAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "הסכום חייב להיות גדול מ-0",
      });
    }

    // Give gold to all players
    await query(
      "UPDATE accounts SET gold = gold + ? WHERE acc_id > 0",
      [goldAmount]
    );

    // Get count of affected players
    const [countResult] = await query(
      "SELECT COUNT(*) as count FROM gebruikers WHERE user_id > 0"
    );

    return res.json({
      success: true,
      message: `${goldAmount.toLocaleString()} Gold ניתן בהצלחה לכל השחקנים`,
      playersAffected: countResult.count,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "שגיאה במתן Gold",
      error: error.message,
    });
  }
};

// POST give premium days to all players
export const givePremiumToAll = async (req, res) => {
  try {
    const { days } = req.body;

    if (!days || isNaN(days)) {
      return res.status(400).json({
        success: false,
        message: "עליך להזין מספר",
      });
    }

    const premiumDays = Number(days);

    if (premiumDays <= 0) {
      return res.status(400).json({
        success: false,
        message: "הסכום חייב להיות גדול מ-0",
      });
    }

    const currentTime = Math.floor(Date.now() / 1000); // Current unix timestamp
    const secondsToAdd = 86400 * premiumDays; // Days to seconds
    const newPremiumTime = currentTime + secondsToAdd;

    // Add premium to players who already have active premium
    await query(
      "UPDATE gebruikers SET premiumaccount = premiumaccount + ? WHERE premiumaccount > ?",
      [secondsToAdd, currentTime]
    );

    // Set premium for players who don't have active premium
    await query(
      "UPDATE gebruikers SET premiumaccount = ? WHERE premiumaccount < ?",
      [newPremiumTime, currentTime]
    );

    // Get count of affected players
    const [countResult] = await query(
      "SELECT COUNT(*) as count FROM gebruikers WHERE user_id > 0"
    );

    return res.json({
      success: true,
      message: `${premiumDays} ימי Premium ניתנו בהצלחה לכל השחקנים`,
      playersAffected: countResult.count,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "שגיאה במתן Premium",
      error: error.message,
    });
  }
};

// POST give premium to specific player
export const givePremiumToPlayer = async (req, res) => {
  try {
    const { username, days, adminUsername } = req.body;

    if (!username || !username.trim()) {
      return res.status(400).json({
        success: false,
        message: "הזן שם מאמן",
      });
    }

    if (!days || isNaN(days)) {
      return res.status(400).json({
        success: false,
        message: "הזן מספר",
      });
    }

    const premiumDays = Number(days);

    if (premiumDays <= 0) {
      return res.status(400).json({
        success: false,
        message: "המספר חייב להיות גדול מ-0",
      });
    }

    // Check if player exists
    const player = await query(
      "SELECT user_id, username, premiumaccount FROM gebruikers WHERE username = ?",
      [username]
    );

    if (!player || player.length === 0) {
      return res.status(404).json({
        success: false,
        message: "המאמן לא קיים!",
      });
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const secondsToAdd = 86400 * premiumDays;
    const newPremiumTime = currentTime + secondsToAdd;

    // Update premium based on current status
    if (player[0].premiumaccount > currentTime) {
      // Player has active premium - add to existing
      await query(
        "UPDATE gebruikers SET premiumaccount = premiumaccount + ? WHERE username = ? LIMIT 1",
        [secondsToAdd, username]
      );
    } else {
      // Player doesn't have active premium - set new expiration
      await query(
        "UPDATE gebruikers SET premiumaccount = ? WHERE username = ? LIMIT 1",
        [newPremiumTime, username]
      );
    }

    // Create event notification
    const eventMessage = `<img src="/images/icons/blue.png" width="16" height="16" class="imglower" /> <a href="/profile?player=${adminUsername}">${adminUsername}</a> נתן ל-${username} ${premiumDays} יום/ימים של Premium.`;
    
    await query(
      "INSERT INTO gebeurtenis (datum, ontvanger_id, bericht, gelezen) VALUES (NOW(), ?, ?, '0')",
      [player[0].user_id, eventMessage]
    );

    return res.json({
      success: true,
      message: `${username} קיבל ${premiumDays} ימי Premium!`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "שגיאה במתן Premium",
      error: error.message,
    });
  }
};