import { query } from "../config/database.js";

// Get user notifications
export const getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user info to determine limits
    const [user] = await query(
      "SELECT admin, premiumaccount FROM gebruikers WHERE user_id = ?",
      [userId]
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "משתמש לא נמצא" });
    }

    // Determine notification limit based on user type
    let notificationLimit;
    if (user.admin > 0) {
      notificationLimit = 1000; // Admin
    } else if (user.premiumaccount > Math.floor(Date.now() / 1000)) {
      notificationLimit = 60; // Premium
    } else {
      notificationLimit = 30; // Regular user
    }

    // Get notifications
    const notifications = await query(`
      SELECT id, datum, ontvanger_id, bericht, gelezen 
      FROM gebeurtenis 
      WHERE ontvanger_id = ? 
      ORDER BY id DESC 
      LIMIT ${notificationLimit}
    `, [userId]);

    // Mark all notifications as read
    if (notifications.length > 0) {
      await query(
        "UPDATE gebeurtenis SET gelezen = '1' WHERE ontvanger_id = ?",
        [userId]
      );
    }
    // Group notifications by date
    const groupedNotifications = groupNotificationsByDate(notifications);

    return res.json({
      success: true,
      data: {
        notifications: groupedNotifications,
        totalCount: notifications.length,
        limit: notificationLimit,
        user: {
          isAdmin: user.admin > 0,
          isPremium: user.premiumaccount > Math.floor(Date.now() / 1000)
        }
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "שגיאה בטעינת התראות",
      error: error.message
    });
  }
};

// Get unread notification count
export const getUnreadCount = async (req, res) => {
  try {
    const { userId } = req.params;

    const [result] = await query(
      "SELECT COUNT(*) as unreadCount FROM gebeurtenis WHERE ontvanger_id = ? AND gelezen = '0'",
      [userId]
    );

    return res.json({
      success: true,
      unreadCount: result.unreadCount || 0
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "שגיאה בספירת התראות לא נקראו",
      error: error.message
    });
  }
};

// Mark specific notifications as read
export const markAsRead = async (req, res) => {
  try {
    const { userId, notificationIds } = req.body;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({ 
        success: false, 
        message: "מזהי התראות לא תקינים" 
      });
    }

    // Mark specific notifications as read
    const placeholders = notificationIds.map(() => '?').join(',');
    await query(
      `UPDATE gebeurtenis SET gelezen = '1' WHERE ontvanger_id = ? AND id IN (${placeholders})`,
      [userId, ...notificationIds]
    );

    return res.json({
      success: true,
      message: "התראות סומנו כנקראו"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "שגיאה בסימון התראות כנקראו",
      error: error.message
    });
  }
};

// Clear old notifications (admin function)
export const clearOldNotifications = async (req, res) => {
  try {
    const { userId, daysOld = 30 } = req.body;

    // Check if user is admin
    const [user] = await query(
      "SELECT admin FROM gebruikers WHERE user_id = ?",
      [userId]
    );

    if (!user || user.admin === 0) {
      return res.status(403).json({ 
        success: false, 
        message: "הרשאה נדחתה - רק מנהלים" 
      });
    }

    // Delete old notifications
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    const cutoffString = cutoffDate.toISOString().slice(0, 19).replace('T', ' ');

    const result = await query(
      "DELETE FROM gebeurtenis WHERE datum < ?",
      [cutoffString]
    );

    return res.json({
      success: true,
      message: `נמחקו ${result.affectedRows} התראות ישנות`,
      deletedCount: result.affectedRows
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "שגיאה במחיקת התראות ישנות",
      error: error.message
    });
  }
};

// Helper function to group notifications by date
const groupNotificationsByDate = (notifications) => {
  const grouped = {};
  
  notifications.forEach(notification => {
    const [datePart, timePart] = notification.datum.toISOString().split('T');
    
    if (!grouped[datePart]) {
      grouped[datePart] = [];
    }
    
    grouped[datePart].push({
      id: notification.id,
      time: timePart,
      message: notification.bericht,
      isRead: notification.gelezen === 1
    });
  });

  // Convert to array format sorted by date (newest first)
  return Object.keys(grouped)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    .map(date => ({
      date,
      notifications: grouped[date]
    }));
};

// Helper function to format date in Hebrew
export const formatHebrewDate = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Check if it's today
  if (date.toDateString() === today.toDateString()) {
    return 'היום';
  }
  
  // Check if it's yesterday
  if (date.toDateString() === yesterday.toDateString()) {
    return 'אתמול';
  }
  
  // Format as Hebrew date
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  };
  
  return date.toLocaleDateString('he-IL', options);
};