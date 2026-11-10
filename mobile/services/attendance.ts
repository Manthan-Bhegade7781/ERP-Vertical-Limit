import { API_BASE_URL } from '../config/api';
import { getToken } from './auth';

/* =====================================================
   TYPES
===================================================== */

export type AttendanceStatus =
  | 'Present'
  | 'Absent'
  | 'Late'
  | 'Leave';

export type AttendanceReference =
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
      status?: string;
      branchId?: AttendanceReference;
    };

export type AttendanceBatch = {
  _id: string;
  name: string;
  code?: string;
  standard?: string;
  branchId?: AttendanceReference;
  isRemoved?: boolean;
  status?: string;
};

export type AttendanceStudent = {
  _id: string;
  studentId: string;
  batchId: AttendanceReference;
  userId: AttendanceReference;
  status?: string;
};

export type BatchSubjectAssignment = {
  _id: string;
  batchId: AttendanceReference;
  subjectId: AttendanceReference;
  teacherId?: AttendanceReference;
  status?: string;
};

export type AttendanceApiRecord = {
  _id: string;
  studentId: AttendanceReference | AttendanceStudent;
  batchId: AttendanceReference | AttendanceBatch;
  subjectId: AttendanceReference;
  date: string;
  status: AttendanceStatus;
  checkIn?: string;
  remarks?: string;
  markedBy?: AttendanceReference;
  createdAt?: string;
  updatedAt?: string;
};

/*
 * Compatibility alias for components that import
 * AttendanceRecord from this service.
 */
export type AttendanceRecord = AttendanceApiRecord;

export type AttendanceFilters = {
  batchId?: string;
  subjectId?: string;
  studentId?: string;
  status?: AttendanceStatus;
  date?: string;
};

export type CreateAttendancePayload = {
  studentId: string;
  batchId: string;
  subjectId: string;
  date: string;
  status: AttendanceStatus;
  checkIn?: string;
  remarks?: string;
};

export type UpdateAttendancePayload = {
  status?: AttendanceStatus;
  checkIn?: string;
  remarks?: string;
};

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  count?: number;
  data?: T;
};

/* =====================================================
   API RESPONSE HANDLING
===================================================== */

const parseResponse = async <T>(
  response: Response
): Promise<ApiEnvelope<T>> => {
  const responseText = await response.text();

  let result: ApiEnvelope<T> = {};

  if (responseText.trim()) {
    try {
      result = JSON.parse(responseText) as ApiEnvelope<T>;
    } catch {
      throw new Error(
        `Invalid server response. HTTP ${response.status}.`
      );
    }
  }

  if (response.status === 401) {
    throw new Error(
      'Your session has expired. Please sign in again.'
    );
  }

  if (response.status === 403) {
    throw new Error(
      result.message ||
        'You do not have permission to access this resource.'
    );
  }

  if (!response.ok || result.success === false) {
    throw new Error(
      result.message ||
        `Request failed with HTTP ${response.status}.`
    );
  }

  return result;
};

/* =====================================================
   COMMON AUTHENTICATED REQUEST
===================================================== */

const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiEnvelope<T>> => {
  const token = await getToken();

  if (!token) {
    throw new Error(
      'Authentication required. Please sign in again.'
    );
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  };

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (options.headers) {
    const suppliedHeaders = new Headers(options.headers);

    suppliedHeaders.forEach((value, key) => {
      headers[key] = value;
    });
  }

  let response: Response;

  try {
    response = await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        ...options,
        headers,
      }
    );
  } catch {
    throw new Error(
      'Unable to connect to the server. Check your network and API URL.'
    );
  }

  return parseResponse<T>(response);
};

/* =====================================================
   REFERENCE HELPERS
===================================================== */

/**
 * Extract a MongoDB ID from either:
 * - A string ID
 * - An object containing _id
 * - An object containing id
 */
export const getReferenceId = (
  reference: AttendanceReference
): string => {
  if (typeof reference === 'string') {
    return reference;
  }

  if (
    reference &&
    typeof reference === 'object'
  ) {
    return reference._id || reference.id || '';
  }

  return '';
};

/**
 * Extract a display name from populated MongoDB data.
 */
export const getReferenceName = (
  reference: AttendanceReference,
  fallback = ''
): string => {
  if (
    reference &&
    typeof reference === 'object'
  ) {
    return (
      reference.fullName ||
      reference.name ||
      fallback ||
      ''
    );
  }

  return fallback ||
    (typeof reference === 'string'
      ? reference
      : '');
};

/* =====================================================
   GET BATCHES
   GET /api/batches
===================================================== */

export const fetchAttendanceBatches =
  async (): Promise<AttendanceBatch[]> => {
    const result = await apiRequest<{
      batches?: AttendanceBatch[];
    }>('/batches');

    const batches = result.data?.batches;

    return Array.isArray(batches)
      ? batches
      : [];
  };

/* =====================================================
   GET STUDENTS
   GET /api/students
===================================================== */

export const fetchAttendanceStudents =
  async (): Promise<AttendanceStudent[]> => {
    const result = await apiRequest<
      | AttendanceStudent[]
      | { students?: AttendanceStudent[] }
    >('/students');

    const data = result.data;

    if (Array.isArray(data)) {
      return data;
    }

    if (
      data &&
      typeof data === 'object' &&
      Array.isArray(data.students)
    ) {
      return data.students;
    }

    return [];
  };

/* =====================================================
   GET SUBJECTS ASSIGNED TO A BATCH
   GET /api/batch-subjects/batch/:batchId
===================================================== */

export const fetchBatchSubjectAssignments =
  async (
    batchId: string
  ): Promise<BatchSubjectAssignment[]> => {
    if (!batchId) {
      return [];
    }

    const result = await apiRequest<{
      batchSubjects?: BatchSubjectAssignment[];
    }>(
      `/batch-subjects/batch/${encodeURIComponent(
        batchId
      )}`
    );

    const assignments =
      result.data?.batchSubjects;

    return Array.isArray(assignments)
      ? assignments
      : [];
  };

/* =====================================================
   GET ATTENDANCE RECORDS
   GET /api/attendance

   Optional filters:
   batchId, subjectId, studentId, status, date
===================================================== */

export const fetchAttendanceRecords =
  async (
    filters: AttendanceFilters = {}
  ): Promise<AttendanceApiRecord[]> => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(
      ([key, value]) => {
        if (
          value !== undefined &&
          value !== null &&
          value !== ''
        ) {
          params.append(key, String(value));
        }
      }
    );

    const query = params.toString();

    const endpoint = query
      ? `/attendance?${query}`
      : '/attendance';

    const result = await apiRequest<
      | AttendanceApiRecord[]
      | { records?: AttendanceApiRecord[] }
    >(endpoint);

    const data = result.data;

    if (Array.isArray(data)) {
      return data;
    }

    if (
      data &&
      typeof data === 'object' &&
      Array.isArray(data.records)
    ) {
      return data.records;
    }

    return [];
  };

/* =====================================================
   CREATE ATTENDANCE
   POST /api/attendance
===================================================== */

export const createAttendanceRecord =
  async (
    payload: CreateAttendancePayload
  ): Promise<AttendanceApiRecord> => {
    if (
      !payload.studentId ||
      !payload.batchId ||
      !payload.subjectId ||
      !payload.date ||
      !payload.status
    ) {
      throw new Error(
        'Student, batch, subject, date and status are required.'
      );
    }

    const result =
      await apiRequest<AttendanceApiRecord>(
        '/attendance',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      );

    if (
      !result.data ||
      typeof result.data !== 'object' ||
      !result.data._id
    ) {
      throw new Error(
        'The server did not return the saved attendance record.'
      );
    }

    return result.data;
  };

/* =====================================================
   UPDATE ATTENDANCE
   PUT /api/attendance/:id
===================================================== */

export const updateAttendanceRecord =
  async (
    attendanceId: string,
    payload: UpdateAttendancePayload
  ): Promise<AttendanceApiRecord> => {
    if (!attendanceId) {
      throw new Error(
        'Attendance record ID is required.'
      );
    }

    if (
      payload.status === undefined &&
      payload.checkIn === undefined &&
      payload.remarks === undefined
    ) {
      throw new Error(
        'Provide at least one attendance field to update.'
      );
    }

    const result =
      await apiRequest<AttendanceApiRecord>(
        `/attendance/${encodeURIComponent(
          attendanceId
        )}`,
        {
          method: 'PUT',
          body: JSON.stringify(payload),
        }
      );

    if (
      !result.data ||
      typeof result.data !== 'object' ||
      !result.data._id
    ) {
      throw new Error(
        'The server did not return the updated attendance record.'
      );
    }

    return result.data;
  };