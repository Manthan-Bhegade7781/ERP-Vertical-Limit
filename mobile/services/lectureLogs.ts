import { API_BASE_URL } from '../config/api';
import { getToken } from './auth';
import {
  fetchAttendanceRecords,
  AttendanceApiRecord,
  getReferenceId as getAttendanceReferenceId,
} from './attendance';

export type LectureLogReference = {
  _id?: string;
  id?: string;
  name?: string;
  fullName?: string;
  code?: string;
};

export type LectureLogApiRecord = {
  _id: string;
  date: string;
  batchId: string | LectureLogReference;
  subjectId: string | LectureLogReference;
  teacherId?: string | LectureLogReference;
  time: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
};

export type LectureLogPayload = {
  date: string;
  batchId: string;
  subjectId: string;
  time: string;
  description: string;
};

export type LectureLogItem = {
  id: string;
  date: string;
  batch: string;
  subject: string;
  time: string;
  description: string;
  source: 'attendance' | 'lecture-log';
};

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  count?: number;
  data?: T;
};

const request = async <T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> => {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication required. Please sign in again.');
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  };

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers,
    },
  );

  const text = await response.text();

  let result: ApiResponse<T> = {};

  if (text.trim()) {
    try {
      result = JSON.parse(text);
    } catch {
      throw new Error(
        `Invalid server response (HTTP ${response.status}).`,
      );
    }
  }

  if (response.status === 401) {
    throw new Error('Your session has expired. Please sign in again.');
  }

  if (response.status === 403) {
    throw new Error(
      result.message || 'You do not have permission.',
    );
  }

  if (!response.ok || result.success === false) {
    throw new Error(
      result.message || `Request failed (HTTP ${response.status}).`,
    );
  }

  return result;
};

export const getLectureReferenceId = (
  reference: string | LectureLogReference | null | undefined,
): string => {
  if (typeof reference === 'string') {
    return reference;
  }

  return reference?._id || reference?.id || '';
};

export const getLectureReferenceName = (
  reference: string | LectureLogReference | null | undefined,
): string => {
  if (typeof reference === 'string') {
    return '';
  }

  return reference?.name || reference?.fullName || '';
};

// GET /api/lecture-logs
export const fetchLectureLogs = async (): Promise<LectureLogApiRecord[]> => {
  const result = await request<LectureLogApiRecord[]>(
    '/lecture-logs',
  );

  return Array.isArray(result.data) ? result.data : [];
};

// POST /api/lecture-logs
export const createLectureLog = async (
  payload: LectureLogPayload,
): Promise<LectureLogApiRecord> => {
  const result = await request<LectureLogApiRecord>(
    '/lecture-logs',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );

  if (!result.data?._id) {
    throw new Error('The server did not return the saved lecture log.');
  }

  return result.data;
};

// Fetch and group attendance records into class-level entries.
export const fetchAttendanceLectureEntries =
  async (): Promise<LectureLogItem[]> => {
    const records: AttendanceApiRecord[] =
      await fetchAttendanceRecords();

    const grouped = new Map<string, LectureLogItem>();

    records.forEach((record) => {
      const batchId = getAttendanceReferenceId(record.batchId);
      const subjectId = getAttendanceReferenceId(record.subjectId);

      if (!batchId || !subjectId || !record.date) {
        return;
      }

      const date = record.date.slice(0, 10);
      const key = `${date}_${batchId}_${subjectId}`;

      if (grouped.has(key)) {
        return;
      }

      const batch =
        typeof record.batchId === 'object' &&
        record.batchId !== null
          ? record.batchId.name || record.batchId.standard || 'Batch'
          : 'Batch';

      const subject =
        typeof record.subjectId === 'object' &&
        record.subjectId !== null
          ? record.subjectId.name || 'Subject'
          : 'Subject';

      grouped.set(key, {
        id: `attendance-${key}`,
        date,
        batch,
        subject,
        time: '',
        description: 'Student attendance was marked for this class.',
        source: 'attendance',
      });
    });

    return Array.from(grouped.values());
  };