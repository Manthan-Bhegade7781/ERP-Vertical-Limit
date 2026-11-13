import { API_BASE_URL } from '@/config/api';
import { getToken } from '@/services/auth';

export type NotificationRecord = {
  id: string;
  title: string;
  message: string;
  type: string;
  icon?: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
  isMessage?: boolean;
};

export type NotificationResponse = {
  notifications: NotificationRecord[];
  unreadCount: number;
};

export async function fetchNotifications(): Promise<NotificationResponse> {
  const token = await getToken();
  if (!token) {
    return { notifications: [], unreadCount: 0 };
  }

  const response = await fetch(`${API_BASE_URL}/notifications`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  const raw = await response.text();
  let result: any = {};
  try {
    result = raw ? JSON.parse(raw) : {};
  } catch {
    throw new Error(`Server returned an invalid response (HTTP ${response.status}).`);
  }

  if (!response.ok || result?.success === false) {
    throw new Error(result?.message || 'Unable to load notifications.');
  }

  const items: any[] = Array.isArray(result?.data?.notifications)
    ? result.data.notifications
    : [];

  const notifications: NotificationRecord[] = items.map((item) => ({
    id: String(item._id || item.id),
    title: item.title || 'Notification',
    message: item.message || '',
    type: item.type || 'general',
    icon: item.icon,
    isRead: Boolean(item.isRead),
    link: item.link || '',
    createdAt: item.createdAt || new Date().toISOString(),
    isMessage: Boolean(item.isMessage),
  }));

  const unreadCount = Number(
    result?.data?.unreadCount ?? notifications.filter((n) => !n.isRead).length
  );

  return { notifications, unreadCount };
}

export async function fetchUnreadNotificationCount(): Promise<number> {
  const token = await getToken();
  if (!token) return 0;

  try {
    const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    const result = await response.json();
    if (response.ok && result?.success) {
      return Number(result?.data?.unreadCount ?? 0);
    }
  } catch {
    // Graceful fallback
  }
  return 0;
}

export async function markNotificationAsRead(id: string): Promise<void> {
  const token = await getToken();
  if (!token) return;

  const response = await fetch(`${API_BASE_URL}/notifications/${encodeURIComponent(id)}/read`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result?.message || 'Unable to mark notification as read.');
  }
}

export async function markAllNotificationsAsRead(): Promise<void> {
  const token = await getToken();
  if (!token) return;

  const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result?.message || 'Unable to mark all notifications as read.');
  }
}
