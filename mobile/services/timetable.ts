import { API_BASE_URL } from '../config/api';
import { getToken } from './auth';

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
    };

export type TimetableEntry = {
  _id: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  room?: string;
  type: 'lecture' | 'lab' | 'exam';

  batchSubjectId?: {
    _id?: string;
    batchId?: TimetableReference;
    subjectId?: TimetableReference;
    teacherId?: TimetableReference;
  };
};

export type TimetableSummary = {
  totalClasses: number;
  lectures: number;
  labs: number;
  exams: number;
};

type TimetableResponse = {
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
  type: 'lecture' | 'lab' | 'exam';
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

// CREATE TIMETABLE CLASS
export const createTimetable = async (
  payload: CreateTimetablePayload,
): Promise<CreateTimetableResponse> => {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication required. Please sign in again.');
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/timetable`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error(
      'Unable to connect to the server. Check your network and API URL.',
    );
  }

  const responseText = await response.text();

  let result: CreateTimetableResponse;

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
      result.message || 'You do not have permission to create a timetable.',
    );
  }

  if (!response.ok || result.success === false) {
    throw new Error(
      result.message || `Unable to create timetable: ${response.status}`,
    );
  }

  return result;
};

// FETCH TEACHER TIMETABLE
export const fetchTeacherTimetable = async (
  date: string,
): Promise<TeacherTimetable> => {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication required. Please sign in again.');
  }

  let response: Response;

  try {
    response = await fetch(
      `${API_BASE_URL}/timetable?date=${encodeURIComponent(date)}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );
  } catch {
    throw new Error(
      'Unable to connect to the server. Check your network and API URL.',
    );
  }

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