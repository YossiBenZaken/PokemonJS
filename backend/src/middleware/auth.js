import jwt from "jsonwebtoken";

// middleware חדש לחילוץ acc_id מה-token
export const extractAccId = (req, res, next) => {
  const { userId } = req.query;
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token אימות נדרש",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "default_secret"
    );
    // מכניס את ה-acc_id ל-req.user
    req.user = {
      acc_id: decoded.acc_id || decoded.userId, // תומך בשני הפורמטים
      ...decoded,
    };
    if(userId) {
      req.user = {
        ...req.user,
        userId,
        id: userId
      }
    }
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token פג תוקף",
      });
    }

    return res.status(403).json({
      success: false,
      message: "Token לא תקין",
    });
  }
};

// middleware לאימות שהמשתמש הוא הבעלים של המשאב
export const authorizeUser = (req, res, next) => {
  const { userId } = req.params;

  if (req.user.userId != userId) {
    return res.status(403).json({
      success: false,
      message: "אין לך הרשאה לגשת למשאב זה",
    });
  }

  next();
};

// middleware לאימות שהמשתמש מחובר
export const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "עליך להתחבר תחילה",
    });
  }

  next();
};
