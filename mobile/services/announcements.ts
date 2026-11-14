import { API_BASE_URL } from '../config/api';
import { getToken } from './auth';

export interface Announcement {
  _id: string;
  title: string;
  description: string;
  category?: string;
  priority?: string;
  audience?: string;
  status: 'Draft' | 'Published' | 'Scheduled' | 'Expired';
  publishedAt?: string | null;
  scheduledAt?: string | null;
  expiresAt?: string;
  createdAt?: string;
  updatedAt?: string;

  createdBy?: {
    _id?: string;
    fullName?: string;
    email?: string;
  } | null;

  branchId?: {
    _id?: string;
    name?: string;
  } | null;
}

interface AnnouncementsResponse {
  success: boolean;
  message?: string;
  count?: number;
  data?: Announcement[];
}

export const fetchAnnouncements = async (): Promise<Announcement[]> => {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication required. Please sign in again.');
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/announcements`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new Error(
      'Unable to connect to the server. Check your network and API URL.',
    );
  }

  const responseText = await response.text();

  let result: AnnouncementsResponse;

  try {
    result = JSON.parse(responseText);
  } catch {
    throw new Error('Invalid announcements response from server.');
  }

  if (response.status === 401) {
    throw new Error('Your session has expired. Please sign in again.');
  }

  if (response.status === 403) {
    throw new Error(
      result.message || 'You do not have permission to view announcements.',
    );
  }

  if (!response.ok || result.success === false) {
    throw new Error(
      result.message || `Announcements request failed: ${response.status}`,
    );
  }

  return Array.isArray(result.data) ? result.data : [];
};