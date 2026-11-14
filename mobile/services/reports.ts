
import { API_BASE_URL } from '../config/api';
import { getToken } from './auth';

export type StudentAttendanceSummary = {
  totalDays: number;
  present: number;
  absent: number;
  late: number;
  leave: number;
  percentage: number;
};

export type Examination = {
  _id: string;
  examinationName: string;
  examinationCode: string;
  batchId: {
    _id: string;
    name: string;
    standard?: string;
  } | string;
  subjectId: {
    _id: string;
    name: string;
  } | string;
  examinationDate: string;
  startTime: string;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  status: string;
};

const authenticatedGet = async <T>(endpoint: string): Promise<T> => {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication required. Please sign in again.');
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new Error('Unable to connect to the server.');
  }

  const text = await response.text();

  let result: any;

  try {
    result = text ? JSON.parse(text) : {};
  } catch {
    throw new Error('Invalid server response.');
  }

  if (response.status === 401) {
    throw new Error('Session expired. Please sign in again.');
  }

  if (!response.ok || result.success === false) {
    throw new Error(
      result.message || `Request failed: ${response.status}`,
    );
  }

  return result as T;
};

export const fetchStudentAttendanceSummary = async (
  studentId: string,
  batchId?: string,
  subjectId?: string,
): Promise<StudentAttendanceSummary> => {
  if (!studentId) {
    throw new Error('Student ID is required.');
  }

  const params = new URLSearchParams();

  if (batchId) params.append('batchId', batchId);
  if (subjectId) params.append('subjectId', subjectId);

  const query = params.toString();

  const endpoint =
    `/attendance/student/${encodeURIComponent(studentId)}/summary` +
    (query ? `?${query}` : '');

  const result = await authenticatedGet<{
    data: StudentAttendanceSummary;
  }>(endpoint);

  return result.data;
};

export const fetchExaminations = async (
  batchId?: string,
  subjectId?: string,
): Promise<Examination[]> => {
  const params = new URLSearchParams();

  if (batchId) params.append('batchId', batchId);
  if (subjectId) params.append('subjectId', subjectId);

  const query = params.toString();

  const endpoint = `/examinations${query ? `?${query}` : ''}`;

  const result = await authenticatedGet<{
    data: Examination[];
  }>(endpoint);

  return Array.isArray(result.data) ? result.data : [];
};
