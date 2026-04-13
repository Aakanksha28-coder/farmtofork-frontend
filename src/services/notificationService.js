import { API_BASE_URL } from '../config/api';
import { getAuthHeader } from '../utils/apiHelper';

export const getNotifications = async () => {
  const res = await fetch(`${API_BASE_URL}/notifications`, { headers: getAuthHeader() });
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return res.json();
};

export const getUnreadCount = async () => {
  const res = await fetch(`${API_BASE_URL}/notifications/unread-count`, { headers: getAuthHeader() });
  if (!res.ok) return { count: 0 };
  return res.json();
};

export const markAllRead = async () => {
  await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
    method: 'PUT',
    headers: getAuthHeader()
  });
};

export const markOneRead = async (id) => {
  await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
    method: 'PUT',
    headers: getAuthHeader()
  });
};
