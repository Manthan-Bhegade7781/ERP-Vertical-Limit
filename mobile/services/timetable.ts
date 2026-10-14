
import { API_BASE_URL } from '@/config/api';
import { getToken } from '@/services/auth';

export type TimetableType = 'lecture' | 'lab' | 'exam';

export type TimetableEntry = {
  _id: string;
  batchSubjectId: {
    _id: string;
    batchId: {
      _id: string;
      name: string;
      code: string;
      standard?: string;
      branchId?: string;
    };
    subjectId: {
      _id: string;
      name: string;
      code: string;
    };
    teacherId: {
      _id: string;
      fullName: string;
      email?: string;
    };
    status: 'active' | 'inactive';
  };
  branchId: {
    _id: string;
    name: string;
    code?: string;
  };
  scheduledDate: string;
  startTime: string;
  endTime: string;
  room: string;
  type: TimetableType;
  isRemoved: boolean;
  createdBy?: {
    _id: string;
    fullName: string;
    email?: string;
  };
  createdAt: string;
  updatedAt: string;
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

type SingleTimetableResponse = {
  success: boolean;
  message: string;
  data?: TimetableEntry;
};

type CreateTimetableInput = {
  batchSubjectId: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  room?: string;
  type?: TimetableType;
};

type UpdateTimetableInput = Partial<CreateTimetableInput>;

const getAuthHeaders = async () => {
  const token = await getToken();

  if (!token) {
    return null;
  }

  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// Fetch timetable entries.
// Pass date for one day, or startDate and endDate for a range.
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
    if (filters?.startDate) {
      params.append('startDate', filters.startDate);
    }

    if (filters?.endDate) {
      params.append('endDate', filters.endDate);
    }
  }

  const query = params.toString();
  const url = `${API_BASE_URL}/timetable${query ? `?${query}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  return response.json();
};

// Create a timetable entry.
export const createTimetable = async (
  input: CreateTimetableInput
): Promise<SingleTimetableResponse> => {
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
    body: JSON.stringify(input),
  });

  return response.json();
};

// Update a timetable entry.
export const updateTimetable = async (
  id: string,
  input: UpdateTimetableInput
): Promise<SingleTimetableResponse> => {
  const headers = await getAuthHeaders();

  if (!headers) {
    return {
      success: false,
      message: 'Authentication required',
    };
  }

  const response = await fetch(
    `${API_BASE_URL}/timetable/${id}`,
    {
      method: 'PUT',
      headers,
      body: JSON.stringify(input),
    }
  );

  return response.json();
};

// Soft-delete a timetable entry.
export const removeTimetable = async (
  id: string
): Promise<{ success: boolean; message: string }> => {
  const headers = await getAuthHeaders();

  if (!headers) {
    return {
      success: false,
      message: 'Authentication required',
    };
  }

  const response = await fetch(
    `${API_BASE_URL}/timetable/${id}`,
    {
      method: 'DELETE',
      headers,
    }
  );

  return response.json();
};
