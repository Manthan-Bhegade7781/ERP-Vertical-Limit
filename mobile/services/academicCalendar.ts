import { API_BASE_URL } from '@/config/api';
import { getToken } from '@/services/auth';

export type CalendarCategory =
  | 'Academic'
  | 'Examination'
  | 'Holiday'
  | 'Meeting'
  | 'Event'
  | 'Other';

export type StudentCalendarEvent = {
  id: string;
  title: string;
  description: string;
  date: string; // ISO string
  formattedDate: string;
  day: string;
  category: CalendarCategory;
  branchName: string;
  status: 'Upcoming' | 'Completed';
};

export async function fetchStudentCalendarEvents(category?: string): Promise<StudentCalendarEvent[]> {
  const token = await getToken();
  if (!token) return [];

  const url = new URL(`${API_BASE_URL}/academic-calendar`);
  if (category && category !== 'All') {
    url.searchParams.append('category', category);
  }

  const response = await fetch(url.toString(), {
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
    throw new Error(result?.message || 'Unable to load calendar events.');
  }

  const items: any[] = Array.isArray(result?.data) ? result.data : [];

  return items.map((item: any) => {
    const d = new Date(item.date);
    const isValid = !Number.isNaN(d.getTime());
    const formattedDate = isValid
      ? d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : item.date;
    const day = isValid ? d.toLocaleDateString('en-IN', { weekday: 'long' }) : '';
    const branchName =
      item.branchId && typeof item.branchId === 'object' && item.branchId.name
        ? item.branchId.name
        : 'All Branches / Campus';

    const isUpcoming = isValid && d >= new Date(new Date().setHours(0, 0, 0, 0));

    return {
      id: String(item._id || item.id),
      title: item.title || '',
      description: item.description || '',
      date: item.date,
      formattedDate,
      day,
      category: (item.category as CalendarCategory) || 'Academic',
      branchName,
      status: isUpcoming ? 'Upcoming' : 'Completed',
    };
  });
}
