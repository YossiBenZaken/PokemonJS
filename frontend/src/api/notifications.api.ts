import { axiosInstance } from "./axios";

export interface Notification {
  id: number;
  time: string;
  message: string;
  isRead: boolean;
}

export interface NotificationGroup {
  date: string;
  notifications: Notification[];
}

export interface User {
  isAdmin: boolean;
  isPremium: boolean;
}

export interface NotificationsResponse {
  success: boolean;
  data?: {
    notifications: NotificationGroup[];
    totalCount: number;
    limit: number;
    user: User;
  };
  message?: string;
}

export interface UnreadCountResponse {
  success: boolean;
  unreadCount?: number;
  message?: string;
}

export interface MarkAsReadRequest {
  userId: number;
  notificationIds: number[];
}

export interface MarkAsReadResponse {
  success: boolean;
  message: string;
}

export interface ClearOldNotificationsRequest {
  userId: number;
  daysOld?: number;
}

export interface ClearOldNotificationsResponse {
  success: boolean;
  message: string;
  deletedCount?: number;
}

// Get user notifications
export const getNotifications = async (userId: number): Promise<NotificationsResponse> => {
  const { data } = await axiosInstance.get(`/notifications/${userId}`);
  return data;
};

// Get unread notification count
export const getUnreadCount = async (userId: number): Promise<UnreadCountResponse> => {
  const { data } = await axiosInstance.get(`/notifications/unread/${userId}`);
  return data;
};

// Mark specific notifications as read
export const markAsRead = async (request: MarkAsReadRequest): Promise<MarkAsReadResponse> => {
  const { data } = await axiosInstance.post("/notifications/mark-read", request);
  return data;
};

// Clear old notifications (admin only)
export const clearOldNotifications = async (request: ClearOldNotificationsRequest): Promise<ClearOldNotificationsResponse> => {
  const { data } = await axiosInstance.post("/notifications/clear-old", request);
  return data;
};

// Helper function to format Hebrew date
export const formatHebrewDate = (dateString: string): string => {
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
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  };
  
  return date.toLocaleDateString('he-IL', options);
};

// Helper function to determine notification icon based on content
export const getNotificationIcon = (message: string): string => {
  if (message.includes('subiu de nível') || message.includes('עלה רמה')) return '⬆️';
  if (message.includes('evoluiu') || message.includes('התפתח')) return '✨';
  if (message.includes('ganhou') || message.includes('זכה')) return '🎉';
  if (message.includes('perdeu') || message.includes('הפסיד')) return '❌';
  if (message.includes('ovo') || message.includes('ביצה')) return '🥚';
  if (message.includes('loja') || message.includes('חנות')) return '🛍️';
  if (message.includes('banco') || message.includes('בנק')) return '💰';
  if (message.includes('battle') || message.includes('קרב')) return '⚔️';
  if (message.includes('trade') || message.includes('חליפין')) return '🔄';
  return '📝'; // Default icon
};

// Helper function to get notification priority/type
export const getNotificationPriority = (message: string): 'high' | 'medium' | 'low' => {
  if (message.includes('ganhou') || message.includes('זכה') || 
      message.includes('evoluiu') || message.includes('התפתח')) {
    return 'high';
  }
  if (message.includes('subiu de nível') || message.includes('עלה רמה') ||
      message.includes('ovo') || message.includes('ביצה')) {
    return 'medium';
  }
  return 'low';
};