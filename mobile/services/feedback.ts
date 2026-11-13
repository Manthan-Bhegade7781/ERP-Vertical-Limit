import { API_BASE_URL } from '@/config/api';
import { getToken } from '@/services/auth';

export type FeedbackCategory =
  | 'Teaching'
  | 'Course'
  | 'Facilities'
  | 'App'
  | 'Other';

export type StudentFeedbackItem = {
  id: string;
  subject: string;
  category: FeedbackCategory;
  rating: number;
  comments: string;
  status: 'New' | 'Reviewed';
  branchName?: string;
  createdAt: string;
  formattedDate: string;
};

export type SubmitFeedbackPayload = {
  subject: string;
  category: FeedbackCategory;
  rating: number;
  comments: string;
};

export async function submitStudentFeedback(payload: SubmitFeedbackPayload): Promise<StudentFeedbackItem> {
  const token = await getToken();
  if (!token) {
    throw new Error('Authentication required.');
  }

  const response = await fetch(`${API_BASE_URL}/feedback`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const raw = await response.text();
  let result: any = {};
  try {
    result = raw ? JSON.parse(raw) : {};
  } catch {
    throw new Error(`Server returned an invalid response (HTTP ${response.status}).`);
  }

  if (!response.ok || result?.success === false) {
    throw new Error(result?.message || 'Failed to submit feedback.');
  }

  const item = result.data || {};
  const d = new Date(item.createdAt || new Date());
  return {
    id: String(item._id || item.id),
    subject: item.subject,
    category: item.category,
    rating: item.rating,
    comments: item.comments,
    status: item.status || 'New',
    createdAt: item.createdAt || new Date().toISOString(),
    formattedDate: !Number.isNaN(d.getTime())
      ? d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : 'Recently',
  };
}

export async function fetchMyFeedback(): Promise<StudentFeedbackItem[]> {
  const token = await getToken();
  if (!token) return [];

  const response = await fetch(`${API_BASE_URL}/feedback/my`, {
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
    throw new Error(result?.message || 'Failed to load feedback history.');
  }

  const items: any[] = Array.isArray(result?.data) ? result.data : [];

  return items.map((item: any) => {
    const d = new Date(item.createdAt);
    const isValid = !Number.isNaN(d.getTime());
    const formattedDate = isValid
      ? d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : 'Recently';
    const branchName =
      item.branchId && typeof item.branchId === 'object' && (item.branchId.name || item.branchId.branchName)
        ? item.branchId.name || item.branchId.branchName
        : undefined;

    return {
      id: String(item._id || item.id),
      subject: item.subject || '',
      category: item.category || 'Other',
      rating: Number(item.rating) || 5,
      comments: item.comments || '',
      status: item.status || 'New',
      branchName,
      createdAt: item.createdAt,
      formattedDate,
    };
  });
}
