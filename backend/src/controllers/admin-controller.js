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