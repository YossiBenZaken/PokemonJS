import DB from "../config/database.js";

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
    const { name, amount,userId } = req.body;
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
    const { name, soort, equip } = req.body;
    const userId = req.user.id;

    if (!name || !soort) {
      return res.status(400).json({
        success: false,
        message: "Item name and type are required",
      });
    }

    // בדיקה אם המשתמש יש לו את הפריט
    const userItemData = await DB.query(
      "SELECT * FROM gebruikers_item WHERE user_id = ?",
      [userId]
    );

    const userTMHMData = await DB.query(
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

    // כאן תהיה הלוגיקה הספציפית לשימוש בפריט
    // זה תלוי בסוג הפריט (potion, stone, tm, etc.)

    res.json({
      success: true,
      message: `Used ${name}`,
    });
  } catch (error) {
    console.error("Error using item:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export {
  getUserItems,
  getItemsByCategory,
  getItemsWithQuantity,
  sellItem,
  useItem,
};
