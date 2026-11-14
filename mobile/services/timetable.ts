import { API_BASE_URL } from '../config/api';
import { getToken } from './auth';

export type TimetableType = 'lecture' | 'lab' | 'exam';

export type TimetableReference =
  | string
  | null
  | undefined
  | {
      _id?: string;
      id?: string;
      name?: string;
      code?: string;
      standard?: string;
      fullName?: string;
      email?: string;
      branchId?: string;
    };

export type TimetableEntry = {
  _id: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  room?: string;
  type: TimetableType;

  batchSubjectId?: {
    _id?: string;
    batchId?: any;
    subjectId?: any;
    teacherId?: any;
    status?: 'active' | 'inactive' | string;
  };

  branchId?: any;
  isRemoved?: boolean;
  createdBy?: any;
  createdAt?: string;
  updatedAt?: string;
};

export type TimetableSummary = {
  totalClasses: number;
  lectures: number;
  labs: number;
  exams: number;
};

export type TimetableResponse = {
  success: boolean;
  message?: string;
  count?: number;
  summary?: TimetableSummary;
  data?: TimetableEntry[];
};

export type TeacherTimetable = {
  entries: TimetableEntry[];
  summary: TimetableSummary;
};

export type CreateTimetablePayload = {
  batchSubjectId: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  room?: string;
  type?: TimetableType;
};

export type CreateTimetableResponse = {
  success: boolean;
  message?: string;
  data?: TimetableEntry;
};

export const getTimetableReferenceName = (
  reference: TimetableReference,
  fallback = '',
): string => {
  if (reference && typeof reference === 'object') {
    return reference.name || reference.fullName || fallback;
  }

  return fallback;
};

const getAuthHeaders = async () => {
  const token = await getToken();
  if (!token) return null;
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
};

// GET TIMETABLE (Student, Admin, Super Admin)
export const getTimetable = async (filters?: {
  date?: string;
  startDate?: string;
  endDate?: string;
}): Promise<TimetableResponse> => {
  const headers = await getAuthHeaders();
  if (!headers) {
    return {
      success: false,
      message: 'Authentication required',
    };
  }

  const params = new URLSearchParams();
  if (filters?.date) {
    params.append('date', filters.date);
  } else {
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
  }

  const query = params.toString();
  const url = `${API_BASE_URL}/timetable${query ? `?${query}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  return response.json();
};

// CREATE TIMETABLE ENTRY
export const createTimetable = async (
  payload: CreateTimetablePayload,
): Promise<CreateTimetableResponse> => {
  const headers = await getAuthHeaders();
  if (!headers) {
    return {
      success: false,
      message: 'Authentication required',
    };
  }

  const response = await fetch(`${API_BASE_URL}/timetable`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  return response.json();
};

// UPDATE TIMETABLE ENTRY
export const updateTimetable = async (
  id: string,
  input: Partial<CreateTimetablePayload>,
): Promise<CreateTimetableResponse> => {
  const headers = await getAuthHeaders();
  if (!headers) {
    return {
      success: false,
      message: 'Authentication required',
    };
  }

  const response = await fetch(`${API_BASE_URL}/timetable/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(input),
  });

  return response.json();
};

// REMOVE TIMETABLE ENTRY
export const removeTimetable = async (
  id: string,
): Promise<{ success: boolean; message: string }> => {
  const headers = await getAuthHeaders();
  if (!headers) {
    return {
      success: false,
      message: 'Authentication required',
    };
  }

  const response = await fetch(`${API_BASE_URL}/timetable/${id}`, {
    method: 'DELETE',
    headers,
  });

  return response.json();
};

// FETCH TEACHER TIMETABLE
export const fetchTeacherTimetable = async (
  date: string,
): Promise<TeacherTimetable> => {
  const token = await getToken();
  if (!token) {
    throw new Error('Authentication required. Please sign in again.');
  }

  const response = await fetch(
    `${API_BASE_URL}/timetable?date=${encodeURIComponent(date)}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const responseText = await response.text();
  let result: TimetableResponse;
  try {
    result = JSON.parse(responseText);
  } catch {
    throw new Error('Invalid timetable response from server.');
  }

  if (response.status === 401) {
    throw new Error('Your session has expired. Please sign in again.');
  }

  if (response.status === 403) {
    throw new Error(
      result.message || 'You do not have permission to access this timetable.',
    );
  }

  if (!response.ok || result.success === false) {
    throw new Error(
      result.message || `Timetable request failed: ${response.status}`,
    );
  }

  return {
    entries: Array.isArray(result.data) ? result.data : [],
    summary: result.summary || {
      totalClasses: 0,
      lectures: 0,
      labs: 0,
      exams: 0,
    },
  };
};
