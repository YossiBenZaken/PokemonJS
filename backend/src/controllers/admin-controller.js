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
      SELECT r.email, r.username, r.bloqueado_tempo, r.razaobloqueado, r.acc_id
      FROM rekeningen r
      WHERE r.bloqueado = 'sim'
      ORDER BY r.bloqueado_tempo DESC
    `);

    return res.json({
      success: true,
      data: bannedAccounts.map((account) => ({
        accId: account.acc_id,
        email: account.email,
        username: account.username,
        bannedUntil:
          account.bloqueado_tempo === "0000-00-00"
            ? null
            : account.bloqueado_tempo,
        reason: account.razaobloqueado,
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
      "SELECT acc_id FROM rekeningen WHERE email = ?",
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
      "UPDATE rekeningen SET account_code = '0', bloqueado = 'sim', bloqueado_tempo = ?, razaobloqueado = ? WHERE email = ?",
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
      "SELECT acc_id FROM rekeningen WHERE email = ?",
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
      "UPDATE rekeningen SET account_code = '1', bloqueado = 'nao', bloqueado_tempo = '0000-00-00', razaobloqueado = '' WHERE email = ?",
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
      SELECT bloqueado, bloqueado_tempo, razaobloqueado 
      FROM rekeningen 
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

    const isBanned = account.bloqueado === "sim";
    const isPermanent = account.bloqueado_tempo === "0000-00-00";

    // Check if temporary ban has expired
    let banExpired = false;
    if (isBanned && !isPermanent) {
      const banDate = new Date(account.bloqueado_tempo);
      const now = new Date();
      banExpired = now > banDate;

      // Auto-unban if expired
      if (banExpired) {
        await query(
          "UPDATE gebruikers SET banned = 'N' WHERE acc_id = (SELECT acc_id FROM rekeningen WHERE email = ?)",
          [email]
        );
        await query(
          "UPDATE rekeningen SET account_code = '1', bloqueado = 'nao', bloqueado_tempo = '0000-00-00', razaobloqueado = '' WHERE email = ?",
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
          !isPermanent && !banExpired ? account.bloqueado_tempo : null,
        reason: account.razaobloqueado,
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
      "UPDATE gebruikers SET banned='Y', bloqueado='sim', bloqueado_tempo=?, razaobloqueado=? WHERE username=?",
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
      "UPDATE gebruikers SET banned='N', bloqueado='nao', bloqueado_tempo='0000-00-00', razaobloqueado='' WHERE username=?",
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
      "SELECT username, bloqueado_tempo, razaobloqueado FROM gebruikers WHERE banned='Y' OR bloqueado='sim' ORDER BY bloqueado_tempo DESC"
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
    const { ip,userId, until, reason } = req.body;

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
        "SELECT acc_id, username, ip_aangemeld, ip_ingelogd, email FROM rekeningen WHERE account_code='1' AND ip_aangemeld=? ORDER BY username",
        [ip]
      );
    } else {
      accounts = await query(
        "SELECT acc_id, username, ip_aangemeld, ip_ingelogd, email FROM rekeningen WHERE account_code='1' AND ip_ingelogd=? ORDER BY username",
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
        `SELECT ip_aangemeld as ip, COUNT(*) as count, 
         GROUP_CONCAT(username ORDER BY username SEPARATOR ', ') as usernames,
         GROUP_CONCAT(acc_id ORDER BY username SEPARATOR ',') as account_ids
         FROM rekeningen 
         WHERE account_code='1' AND ip_aangemeld IS NOT NULL AND ip_aangemeld != ''
         GROUP BY ip_aangemeld 
         HAVING count > 1 
         ORDER BY count DESC 
         LIMIT ?`,
        [Number(limit)]
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
         LIMIT ?`,
        [Number(limit)]
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
       LIMIT ? OFFSET ?`,
      [limitNum, offset]
    );

    // Get messages with user info (joined with gebruikers)
    const messages = await query(
      `SELECT b.datum, b.afzender_id, b.ontvanger_id, b.bericht, b.onderwerp, g.username
       FROM berichten b
       INNER JOIN gebruikers g ON b.ontvanger_id = g.user_id 
       ORDER BY b.datum DESC 
       LIMIT ? OFFSET ?`,
      [limitNum, offset]
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
    const countResult = await query("SELECT COUNT(*) as total FROM transferlist_log");
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
       LIMIT ? OFFSET ?`,
      [limitNum, offset]
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

    const [user] = await query("SELECT user_id FROM gebruikers WHERE username = ?",[username]);

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
       LIMIT ? OFFSET ?`,
      [user.user_id, user.user_id, limitNum, offset]
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