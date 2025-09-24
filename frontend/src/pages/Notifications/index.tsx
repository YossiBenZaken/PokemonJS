import {
  NotificationGroup,
  User,
  clearOldNotifications,
  formatHebrewDate,
  getNotificationIcon,
  getNotificationPriority,
  getNotifications,
  getUnreadCount,
  markAsRead
} from "../../api/notifications.api";
import React, { useEffect, useState } from "react";

import { useGame } from "../../contexts/GameContext";

const Notifications: React.FC = () => {
  const { selectedCharacter } = useGame();
  
  const [notificationGroups, setNotificationGroups] = useState<NotificationGroup[]>([]);
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [limit, setLimit] = useState(30);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadNotifications = async () => {
    if (!selectedCharacter) return;
    
    setLoading(true);
    try {
      const response = await getNotifications(selectedCharacter.user_id);
      if (response.success && response.data) {
        setNotificationGroups(response.data.notifications);
        setUserInfo(response.data.user);
        setTotalCount(response.data.totalCount);
        setLimit(response.data.limit);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'שגיאה בטעינת התראות' });
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    if (!selectedCharacter) return;
    
    try {
      const response = await getUnreadCount(selectedCharacter.user_id);
      if (response.success) {
        setUnreadCount(response.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
  }, [selectedCharacter]);

  const handleMarkAsRead = async (notificationIds: number[]) => {
    if (!selectedCharacter) return;

    try {
      const response = await markAsRead({
        userId: selectedCharacter.user_id,
        notificationIds
      });
      
      if (response.success) {
        setMessage({ type: 'success', text: response.message });
        loadNotifications();
        loadUnreadCount();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'שגיאה בסימון התראות כנקראו' });
    }
  };

  const handleClearOldNotifications = async () => {
    if (!selectedCharacter || !userInfo?.isAdmin) return;

    const confirmed = window.confirm('האם אתה בטוח שברצונך למחוק התראות ישנות? (מעל 30 ימים)');
    if (!confirmed) return;

    try {
      const response = await clearOldNotifications({
        userId: selectedCharacter.user_id,
        daysOld: 30
      });
      
      if (response.success) {
        setMessage({ type: 'success', text: response.message });
        loadNotifications();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'שגיאה במחיקת התראות ישנות' });
    }
  };

  const renderNotificationMessage = (message: string) => {
    // Remove HTML tags and decode entities
    const cleanMessage = message
      .replace(/<[^>]*>/g, '')
      .replace(/&mdash;/g, '—')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');

    return cleanMessage;
  };

  const getUserTypeText = () => {
    if (!userInfo) return '';
    
    if (userInfo.isAdmin) {
      return `מנהל - עד ${limit.toLocaleString()} התראות`;
    } else if (userInfo.isPremium) {
      return `פרימיום - עד ${limit} התראות`;
    } else {
      return `משתמש רגיל - עד ${limit} התראות`;
    }
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'border-l-4 border-l-green-500 bg-green-50';
      case 'medium': return 'border-l-4 border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-4 border-l-gray-500 bg-gray-50';
      default: return 'border-l-4 border-l-gray-500 bg-gray-50';
    }
  };

  if (!selectedCharacter) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="text-center text-gray-500">בחר דמות כדי לראות התראות</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-2">ההתראות שלי</h1>
        <p className="text-center">
          כאן תוכל לעקוב אחר כל הפעולות שנעשו במשחק שלך
        </p>
        <div className="mt-4 text-center">
          <div className="inline-block bg-blue-600 bg-opacity-50 px-4 py-2 rounded">
            {getUserTypeText()}
          </div>
          {!userInfo?.isPremium && (
            <p className="mt-2 text-sm">
              משתמשים רגילים מוגבלים ל-30 ההתראות האחרונות<br/>
              הפוך לפרימיום והגדל את המגבלה ל-60!
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border-r-4 border-r-blue-500">
          <h3 className="font-semibold text-gray-700">סך הכל התראות</h3>
          <p className="text-2xl font-bold text-blue-600">{totalCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-r-4 border-r-green-500">
          <h3 className="font-semibold text-gray-700">התראות שנקראו</h3>
          <p className="text-2xl font-bold text-green-600">{totalCount - unreadCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-r-4 border-r-orange-500">
          <h3 className="font-semibold text-gray-700">לא נקראו</h3>
          <p className="text-2xl font-bold text-orange-600">{unreadCount}</p>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-100 border border-green-400 text-green-700' 
            : 'bg-red-100 border border-red-400 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Admin Controls */}
      {userInfo?.isAdmin && (
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
          <h3 className="font-semibold mb-2">פקדי מנהל</h3>
          <button
            onClick={handleClearOldNotifications}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            מחק התראות ישנות (מעל 30 ימים)
          </button>
        </div>
      )}

      {/* Notifications */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="max-h-96 overflow-y-auto p-4">
          {loading && notificationGroups.length === 0 ? (
            <div className="flex justify-center items-center p-8">
              <div className="text-lg">טוען התראות...</div>
            </div>
          ) : notificationGroups.length === 0 ? (
            <div className="text-center p-8">
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                אין התראות להצגה!
              </h3>
              <p className="text-gray-500">
                התראות יופיעו כאן כשיקרו אירועים במשחק
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {notificationGroups.map((group) => (
                <div key={group.date}>
                  {/* Date Header */}
                  <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-t-lg font-semibold text-center">
                    {formatHebrewDate(group.date)}
                  </div>
                  
                  {/* Notifications for this date */}
                  <div className="border border-t-0 rounded-b-lg">
                    {group.notifications.map((notification, index) => {
                      const priority = getNotificationPriority(notification.message);
                      const icon = getNotificationIcon(notification.message);
                      
                      return (
                        <div
                          key={`${group.date}-${index}`}
                          className={`p-3 ${getPriorityColor(priority)} ${
                            index !== group.notifications.length - 1 ? 'border-b border-gray-200' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 text-xl">{icon}</div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">
                                  [{notification.time}]
                                </span>
                                {!notification.isRead && (
                                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                )}
                              </div>
                              <div 
                                className="mt-1 text-gray-800"
                                dangerouslySetInnerHTML={{ 
                                  __html: renderNotificationMessage(notification.message) 
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
              <span className="text-lg">טוען...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;