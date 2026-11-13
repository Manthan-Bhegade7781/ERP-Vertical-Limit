import { API_BASE_URL } from '@/config/api';
import { getToken } from '@/services/auth';

export type AnnouncementPriority = 'High' | 'Medium' | 'Low';
export type AnnouncementStatus = 'Published' | 'Draft' | 'Scheduled' | 'Expired';

export type StudentAnnouncement = {
  id: string;
  announcementId: string;
  title: string;
  description: string;
  category: string;
  priority: AnnouncementPriority;
  audience: string;
  branchName: string;
  status: AnnouncementStatus;
  createdBy: string;
  publishedAt?: string | null;
  scheduledAt?: string | null;
  expiresAt?: string | null;
  createdAt?: string;
};

export async function fetchStudentAnnouncements(): Promise<StudentAnnouncement[]> {
  const token = await getToken();
  if (!token) return [];

  const response = await fetch(`${API_BASE_URL}/announcements`, {
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
    throw new Error(result?.message || 'Unable to load announcements.');
  }

  const items: any[] = Array.isArray(result?.data) ? result.data : [];

  return items.map((item: any) => {
    const branchName =
      item.branchId && typeof item.branchId === 'object' && item.branchId.name
        ? item.branchId.name
        : 'All Branches';
    const creator =
      item.createdBy && typeof item.createdBy === 'object' && item.createdBy.fullName
        ? item.createdBy.fullName
        : typeof item.createdBy === 'string'
        ? item.createdBy
        : 'Institute Administration';

    return {
      id: String(item._id || item.id),
      announcementId: `VLCC-ANN-${String(item._id || '').slice(-6).toUpperCase()}`,
      title: item.title || '',
      description: item.description || '',
      category: item.category || 'General',
      priority: (item.priority as AnnouncementPriority) || 'Medium',
      audience: item.audience || 'All Students',
      branchName,
      status: (item.status as AnnouncementStatus) || 'Published',
      createdBy: creator,
      publishedAt: item.publishedAt,
      scheduledAt: item.scheduledAt,
      expiresAt: item.expiresAt,
      createdAt: item.createdAt,
    };
  });
}
