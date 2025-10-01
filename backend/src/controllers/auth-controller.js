import { query, transaction } from "../config/database.js";

import crypto from "crypto";
import jwt from "jsonwebtoken";

const keyzitapass = "SENHAENCRYPTSIMBOLSPASSWORD2016";

// פונקציה להרשמת משתמש חדש
export const register = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      password_confirm,
      referral,
      accept_terms,
    } = req.body;

    // בדיקות תקינות
    if (!accept_terms) {
      return res.status(400).json({
        success: false,
        message: "עליך לקבל את תנאי השימוש והמדיניות",
      });
    }

    if (
      !username ||
      username.trim().length < 3 ||
      username.trim().length > 10
    ) {
      return res.status(400).json({
        success: false,
        message: "שם המשתמש חייב להיות בין 3 ל-10 תווים",
      });
    }

    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      return res.status(400).json({
        success: false,
        message: "שם המשתמש יכול להכיל רק אותיות באנגלית ומספרים",
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "הסיסמה חייבת להיות לפחות 6 תווים",
      });
    }

    if (password !== password_confirm) {
      return res.status(400).json({
        success: false,
        message: "הסיסמאות אינן תואמות",
      });
    }

    if (!email || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      return res.status(400).json({
        success: false,
        message: "כתובת האימייל אינה תקינה",
      });
    }

    // רשימת דומיין אסורים
    const blacklistedDomains = [
      "yopmail.com",
      "tempmail.com",
      "10minutemail.com",
    ];
    const emailDomain = email.split("@")[1];
    if (blacklistedDomains.includes(emailDomain)) {
      return res.status(400).json({
        success: false,
        message: "כתובת האימייל אינה מותרת",
      });
    }

    // בדיקה אם שם המשתמש כבר קיים - בדיוק כמו ב-PHP
    const existingUsername = await query(
      "SELECT `username` FROM `rekeningen` WHERE `username`=? LIMIT 1",
      [username]
    );

    if (existingUsername.length > 0) {
      return res.status(400).json({
        success: false,
        message: "שם המשתמש כבר קיים במערכת",
      });
    }

    // בדיקה אם האימייל כבר קיים - בדיוק כמו ב-PHP
    const existingEmail = await query(
      "SELECT `email` FROM `rekeningen` WHERE `email`=? LIMIT 1",
      [email]
    );

    if (existingEmail.length > 0) {
      return res.status(400).json({
        success: false,
        message: "כתובת האימייל כבר קיימת במערכת",
      });
    }

    // בדיקת IP - בדיוק כמו ב-PHP
    const clientIP = req.ip || req.connection.remoteAddress;
    const recentRegistration = await query(
      "SELECT `ip_aangemeld`,`aanmeld_datum` FROM `rekeningen` WHERE `ip_aangemeld`=? ORDER BY `acc_id` DESC LIMIT 1",
      [clientIP]
    );

    if (recentRegistration.length > 0) {
      const lastRegistration = new Date(recentRegistration[0].created_at);
      const timeDiff = Date.now() - lastRegistration.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);

      if (hoursDiff < 12) {
        return res.status(400).json({
          success: false,
          message: "עליך לחכות 12 שעות בין הרשמות מאותו IP",
        });
      }
    }

    // הצפנת הסיסמה
    const hashedPassword = passwordHashed(password);

    // יצירת קוד הפעלה - בדיוק כמו ב-PHP
    const activationCode = 1;

    // שמירת המשתמש במסד הנתונים - בדיוק כמו ב-PHP
    const result = await transaction(async (connection) => {
      // הכנסת המשתמש - בדיוק כמו ב-PHP
      const [userResult] = await connection.execute(
        "INSERT INTO `rekeningen` (`account_code`,`username`,`datum`,`aanmeld_datum`,`wachtwoord`,`email`,`ip_aangemeld`) VALUES (?,?,NOW(),NOW(),?,?,?)",
        [activationCode, username, hashedPassword, email, clientIP]
      );

      const userId = userResult.insertId;
      // אם יש הפניה, עדכן את המשתמש המפנה - בדיוק כמו ב-PHP
      if (referral) {
        const referrer = await connection.execute(
          "SELECT `username` FROM `gebruikers` WHERE `username`=?",
          [referral]
        );

        if (referrer[0].length > 0) {
          // עדכון המשתמש המפנה - בדיוק כמו ב-PHP
          await connection.execute(
            "UPDATE gebruikers SET silver = silver + 200, referidos = referidos + 1 WHERE username = ?",
            [referral]
          );

          const referrerId = await connection.execute(
            "SELECT `user_id` FROM `gebruikers` WHERE `username`=?",
            [referral]
          );
          // עדכון המשתמש החדש עם ID המפנה - בדיוק כמו ב-PHP
          await connection.execute(
            "UPDATE rekeningen SET refferal = ? WHERE acc_id = ?",
            [referrerId[0][0].user_id, userId]
          );
        }
      }

      return { userId, activationCode };
    });

    // יצירת JWT token
    const token = jwt.sign(
      { userId: result.userId, username },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "24h" }
    );

    // שליחת תשובה
    res.status(201).json({
      success: true,
      message: "ההרשמה הושלמה בהצלחה! אנא בדוק את האימייל שלך להפעלת החשבון",
      data: {
        userId: result.userId,
        username,
        email,
        activationCode: result.activationCode,
        token,
      },
    });
  } catch (error) {
    console.error("שגיאה בהרשמה:", error);
    res.status(500).json({
      success: false,
      message: "שגיאה פנימית בשרת",
    });
  }
};

// פונקציה להתחברות - מבוססת על הקוד PHP המקורי
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // בדיקות בסיסיות
    if (empty(username)) {
      return res.status(400).json({
        success: false,
        message: "שם המשתמש נדרש",
      });
    }

    if (empty(password)) {
      return res.status(400).json({
        success: false,
        message: "הסיסמה נדרשת",
      });
    }

    // מציאת המשתמש - בדיוק כמו ב-PHP
    const rekening = await query(
      "SELECT * FROM `rekeningen` WHERE `username`=? LIMIT 1",
      [username]
    );

    if (rekening.length !== 1) {
      return res.status(401).json({
        success: false,
        message: "שם המשתמש לא ידוע",
      });
    }

    const user = rekening[0];
    let share = false;
    let continue_login = true;

    // בדיקת סיסמה משותפת - בדיוק כמו ב-PHP
    if (!empty(user.shared) && user.shared !== "") {
      const shared = user.shared.split(",");
      const sharedQuery = `SELECT * FROM \`rekeningen\` WHERE \`wachtwoord\`=? AND acc_id IN (${shared
        .map(() => "?")
        .join(",")})`;

      const sharedAccounts = await query(sharedQuery, [password, ...shared]);

      if (sharedAccounts.length > 0) {
        if (user.locked < 1) {
          share = true;
          password = user.wachtwoord;
        } else {
          return res.status(401).json({
            success: false,
            message: "משתמש זה כבר מחובר!",
          });
        }
      }
    }

    if (continue_login) {
      // בדיקת ניסיונות התחברות כושלים - בדיוק כמו ב-PHP
      const clientIP = req.ip || req.connection.remoteAddress;
      const loginErrors = await query(
        "SELECT `datum`, `ip`, `spelernaam` FROM `inlog_fout` WHERE `ip`=? ORDER BY `id` DESC",
        [clientIP]
      );

      const cntglogins = loginErrors.length;
      let aftellen = 0;

      if (cntglogins > 0) {
        const lastError = loginErrors[0];
        aftellen =
          1200 -
          (Math.floor(Date.now() / 1000) -
            new Date(lastError.datum).getTime() / 1000);
      }

      // בדיקת חסימה - בדיוק כמו ב-PHP
      const banned = await query("SELECT user_id FROM ban WHERE user_id = ?", [
        user.acc_id,
      ]);

      let desblo = "Permanente";
      if (
        user.bloqueado_tempo !== "0000-00-00" &&
        isValidDate(user.bloqueado_tempo)
      ) {
        const data = user.bloqueado_tempo.split("-").reverse().join("/");
        desblo = data;
      }

      // בדיקת הגבלת זמן - בדיוק כמו ב-PHP
      if (cntglogins >= 3 && aftellen > 0) {
        return res.status(429).json({
          success: false,
          message: `עליך לחכות ${Math.round(
            aftellen / 60
          )} דקות לפני ניסיון נוסף`,
        });
      }

      // ניקוי ניסיונות כושלים ישנים
      if (aftellen < 1) {
        await query("DELETE FROM `inlog_fout` WHERE `ip`=?", [clientIP]);
      }

      const hashedPassword = passwordHashed(password);

      // בדיקת סיסמה
      if (user.wachtwoord !== hashedPassword) {
        const datum = new Date().toISOString().slice(0, 19).replace("T", " ");
        await query(
          "INSERT INTO `inlog_fout` (`datum`, `ip`, `spelernaam`, `wachtwoord`) VALUES (?, ?, ?, ?)",
          [datum, clientIP, user.username, password]
        );

        // הודעות שגיאה לפי מספר ניסיונות - בדיוק כמו ב-PHP
        if (cntglogins >= 2) {
          return res.status(401).json({
            success: false,
            message: "עונש זמן על ניסיונות כושלים מרובים",
          });
        } else if (cntglogins === 1) {
          return res.status(401).json({
            success: false,
            message: "נשאר לך ניסיון אחד נוסף",
          });
        } else {
          return res.status(401).json({
            success: false,
            message: "נשארו לך 2 ניסיונות נוספים",
          });
        }
      }

      // בדיקות נוספות - בדיוק כמו ב-PHP
      if (user.bloqueado === "sim") {
        return res.status(403).json({
          success: false,
          message: `חשבון חסום. שחרור ב: ${desblo}`,
        });
      }

      if (user.account_code === 0) {
        return res.status(403).json({
          success: false,
          message: "החשבון חסום",
        });
      }

      if (banned.length > 0) {
        return res.status(403).json({
          success: false,
          message: "החשבון חסום",
        });
      }

      if (user.account_code !== 1) {
        return res.status(403).json({
          success: false,
          message: "החשבון לא הופעל",
        });
      }

      // התחברות מוצלחת - בדיוק כמו ב-PHP
      await query("DELETE FROM `inlog_fout` WHERE `ip`=?", [clientIP]);

      const pa_lang = crypto.createHash("md5").update(clientIP).digest("hex");
      const keylog = crypto
        .createHash("md5")
        .update(Date.now().toString())
        .digest("hex");

      // עדכון פרטי התחברות - בדיוק כמו ב-PHP
      await query(
        "UPDATE `rekeningen` SET `ban_cookie`=?,`locked`='1',`ip_ingelogd`=?,`session`=?,`last_login`=NOW(), `keylog`=? WHERE `acc_id`=? LIMIT 1",
        [pa_lang, clientIP, req.sessionID || "session_id", keylog, user.acc_id]
      );

      // עדכון חשבון משותף אם יש
      if (share) {
        await query("UPDATE `rekeningen` SET `locked`='0' WHERE `acc_id`=?", [
          user.acc_id,
        ]);
      }

      // רישום לוג התחברות - בדיוק כמו ב-PHP
      const loginLogs = await query(
        "SELECT `id` FROM `inlog_logs` WHERE `ip`=? AND `speler`=? LIMIT 1",
        [clientIP, user.username]
      );

      if (loginLogs.length === 0) {
        await query(
          "INSERT INTO `inlog_logs` (`ip`, `datum`, `speler`) VALUES (?, NOW(), ?)",
          [clientIP, user.username]
        );
      } else {
        await query(
          "UPDATE `inlog_logs` SET `datum`=NOW() WHERE `speler`=? AND `ip`=? LIMIT 1",
          [user.username, clientIP]
        );
      }

      // יצירת JWT token
      const token = jwt.sign(
        {
          acc_id: user.acc_id,
          username: user.username,
          keylog: keylog,
          share_acc: share ? 1 : 0,
        },
        process.env.JWT_SECRET || "default_secret",
        { expiresIn: "24h" }
      );

      // הגדרת cookie - בדיוק כמו ב-PHP
      res.cookie("pa_lang", pa_lang, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ימים
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });

      res.cookie("access_token", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ימים
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
      });

      res.json({
        success: true,
        message: "התחברת בהצלחה",
        data: {
          acc_id: user.acc_id,
          username: user.username,
          keylog: keylog,
          share_acc: share ? 1 : 0,
          token: token,
        },
      });
    }
  } catch (error) {
    console.error("שגיאה בהתחברות:", error);
    res.status(500).json({
      success: false,
      message: "שגיאה פנימית בשרת",
    });
  }
};

export const authToken = async (req, res) => {
  const { user_id } = req.body;

  const [user] = await query("SELECT * FROM `gebruikers` WHERE `user_id` = ?", [
    user_id,
  ]);
  const [userItem] = await query(
    "SELECT * FROM `gebruikers_item` WHERE `user_id` = ?",
    [user_id]
  );
  const [account] = await query(
    "SELECT gold FROM `rekeningen` WHERE `acc_id` = ?",
    [user.acc_id]
  );
  res.json({
    success: true,
    data: {
      user: {
        ...user,
        items: userItem,
        ...account,
      },
    },
  });
};

// פונקציה עזר לבדיקת ערכים ריקים
function empty(value) {
  return value === undefined || value === null || value === "";
}

function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}

function passwordHashed(password) {
  // md5(strrev(keyzitapass))
  const salt = crypto
    .createHash("md5")
    .update([...keyzitapass].reverse().join(""))
    .digest("hex");

  // crypt($password, salt) -> PHP's crypt() is tricky, it defaults to DES or MD5 depending on salt
  // To mimic the MD5-based salt, we’ll simulate with md5(password + salt)
  const crypted = crypto
    .createHash("md5")
    .update(password + salt)
    .digest("hex");

  // Final: sha1(crypted)
  return crypto.createHash("sha1").update(crypted).digest("hex");
}
