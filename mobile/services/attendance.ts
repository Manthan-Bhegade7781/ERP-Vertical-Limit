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

type TeacherBatchSubject = {
  _id: string;
  name: string;
  code?: string;
  standard?: string;
  type?: string;
  description?: string;
  duration?: number;
};

type TeacherBatchResponse = AttendanceBatch & {
  subjects?: TeacherBatchSubject[];
  studentCount?: number;
  subjectCount?: number;
};

type TeacherBatchesResponse = {
  batches?: TeacherBatchResponse[];
};

/* =====================================================
   API RESPONSE HANDLING
===================================================== */

const parseResponse = async <T>(
  response: Response,
): Promise<ApiEnvelope<T>> => {
  const responseText = await response.text();

  let result: ApiEnvelope<T> = {};

  if (responseText.trim()) {
    try {
      result = JSON.parse(responseText) as ApiEnvelope<T>;
    } catch {
      throw new Error(
        `Invalid server response. HTTP ${response.status}.`,
      );
    }
  }

  if (response.status === 401) {
    throw new Error(
      'Your session has expired. Please sign in again.',
    );
  }

  if (response.status === 403) {
    throw new Error(
      result.message ||
        'You do not have permission to access this resource.',
    );
  }

  if (!response.ok || result.success === false) {
    throw new Error(
      result.message ||
        `Request failed with HTTP ${response.status}.`,
    );
  }

  return result;
};

/* =====================================================
   COMMON AUTHENTICATED REQUEST
===================================================== */

const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiEnvelope<T>> => {
  const token = await getToken();

  if (!token) {
    throw new Error(
      'Authentication required. Please sign in again.',
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
      },
    );
  } catch {
    throw new Error(
      'Unable to connect to the server. Check your network and API URL.',
    );
  }

  return parseResponse<T>(response);
};

/* =====================================================
   REFERENCE HELPERS
===================================================== */

export const getReferenceId = (
  reference: AttendanceReference,
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

export const getReferenceName = (
  reference: AttendanceReference,
  fallback = '',
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
   GET TEACHER'S ASSIGNED BATCHES

   GET /api/batches/teacher/my-batches
===================================================== */

export const fetchAttendanceBatches =
  async (): Promise<AttendanceBatch[]> => {
    const result = await apiRequest<TeacherBatchesResponse>(
      '/batches/teacher/my-batches',
    );

    const batches = result.data?.batches;

    if (!Array.isArray(batches)) {
      return [];
    }

    return batches.filter(
      (batch) =>
        batch.isRemoved !== true &&
        batch.status !== 'inactive',
    );
  };

/* =====================================================
   GET TEACHER'S ASSIGNED STUDENTS

   GET /api/students/teacher/assigned
===================================================== */

export const fetchAttendanceStudents =
  async (): Promise<AttendanceStudent[]> => {
    const result = await apiRequest<AttendanceStudent[]>(
      '/students/teacher/assigned',
    );

    if (!Array.isArray(result.data)) {
      return [];
    }

    return result.data.filter((student) => {
      const user =
        student.userId &&
        typeof student.userId === 'object'
          ? student.userId
          : null;

      return (
        student.status?.toLowerCase() === 'active' &&
        user?.status?.toLowerCase() === 'active'
      );
    });
  };

/* =====================================================
   GET SUBJECTS ASSIGNED TO SELECTED TEACHER BATCH

   Subjects are included in:
   GET /api/batches/teacher/my-batches
===================================================== */

export const fetchBatchSubjectAssignments =
  async (
    batchId: string,
  ): Promise<BatchSubjectAssignment[]> => {
    if (!batchId) {
      return [];
    }

    const result = await apiRequest<TeacherBatchesResponse>(
      '/batches/teacher/my-batches',
    );

    const batches = result.data?.batches;

    if (!Array.isArray(batches)) {
      return [];
    }

    const selectedBatch = batches.find(
      (batch) => batch._id === batchId,
    );

    if (
      !selectedBatch ||
      !Array.isArray(selectedBatch.subjects)
    ) {
      return [];
    }

    return selectedBatch.subjects
      .filter(
        (subject) =>
          Boolean(subject._id) &&
          Boolean(subject.name),
      )
      .map((subject) => ({
        _id: `${batchId}-${subject._id}`,
        batchId,
        subjectId: {
          _id: subject._id,
          name: subject.name,
          code: subject.code,
          status: 'active',
        },
        status: 'active',
      }));
  };

/* =====================================================
   GET ATTENDANCE RECORDS

   GET /api/attendance

   Optional filters:
   batchId, subjectId, studentId, status, date
===================================================== */

export const fetchAttendanceRecords =
  async (
    filters: AttendanceFilters = {},
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
      },
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
    payload: CreateAttendancePayload,
  ): Promise<AttendanceApiRecord> => {
    if (
      !payload.studentId ||
      !payload.batchId ||
      !payload.subjectId ||
      !payload.date ||
      !payload.status
    ) {
      throw new Error(
        'Student, batch, subject, date and status are required.',
      );
    }

    const result =
      await apiRequest<AttendanceApiRecord>(
        '/attendance',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
      );

    if (
      !result.data ||
      typeof result.data !== 'object' ||
      !result.data._id
    ) {
      throw new Error(
        'The server did not return the saved attendance record.',
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
    payload: UpdateAttendancePayload,
  ): Promise<AttendanceApiRecord> => {
    if (!attendanceId) {
      throw new Error(
        'Attendance record ID is required.',
      );
    }

    if (
      payload.status === undefined &&
      payload.checkIn === undefined &&
      payload.remarks === undefined
    ) {
      throw new Error(
        'Provide at least one attendance field to update.',
      );
    }

    const result =
      await apiRequest<AttendanceApiRecord>(
        `/attendance/${encodeURIComponent(attendanceId)}`,
        {
          method: 'PUT',
          body: JSON.stringify(payload),
        },
      );

    if (
      !result.data ||
      typeof result.data !== 'object' ||
      !result.data._id
    ) {
      throw new Error(
        'The server did not return the updated attendance record.',
      );
    }

    return result.data;
  };

/* =====================================================
   STUDENT: GET MY ATTENDANCE
   GET /api/attendance/my
===================================================== */

export type StudentAttendanceSubject = {
  subjectId: string;
  subject: string;
  present: number;
  absent: number;
  late: number;
  leave: number;
  total: number;
  percentage: number;
};

export type StudentAttendanceRecordItem = {
  id: string;
  date: string;
  isoDate: string;
  subject: string;
  teacher: string;
  time: string;
  status: 'Present' | 'Absent';
  rawStatus?: string;
  remarks?: string;
};

export type StudentAttendanceData = {
  overall: {
    percentage: number;
    present: number;
    absent: number;
    total: number;
    statusText: string;
  };
  subjects: StudentAttendanceSubject[];
  recent: StudentAttendanceRecordItem[];
  records: StudentAttendanceRecordItem[];
};

export const getMyAttendance = async (): Promise<StudentAttendanceData> => {
  const result = await apiRequest<StudentAttendanceData>('/attendance/my');

  if (!result.data || typeof result.data !== 'object') {
    throw new Error('Unable to load your attendance data.');
  }

  return result.data;
};

/* =====================================================
   TEACHER ATTENDANCE API
   GET/POST /api/teacher-attendance
   PUT /api/teacher-attendance/:id
===================================================== */

export type TeacherAttendanceApiRecord = {
  _id: string;
  teacherId: AttendanceReference;
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

export type CreateTeacherAttendancePayload = {
  batchId: string;
  subjectId: string;
  date: string;
  status: AttendanceStatus;
  checkIn?: string;
  remarks?: string;
};

export const fetchTeacherAttendanceRecords = async (
  filters?: { batchId?: string; subjectId?: string; date?: string },
): Promise<TeacherAttendanceApiRecord[]> => {
  const params = new URLSearchParams();
  if (filters?.batchId) params.append('batchId', filters.batchId);
  if (filters?.subjectId) params.append('subjectId', filters.subjectId);
  if (filters?.date) params.append('date', filters.date);

  const query = params.toString() ? `?${params.toString()}` : '';
  const result = await apiRequest<TeacherAttendanceApiRecord[]>(
    `/teacher-attendance${query}`,
  );

  return Array.isArray(result.data) ? result.data : [];
};

export const fetchTeacherAttendanceRecord = async (
  filters: { batchId: string; subjectId: string; date: string },
): Promise<TeacherAttendanceApiRecord | null> => {
  const params = new URLSearchParams();
  params.append('batchId', filters.batchId);
  params.append('subjectId', filters.subjectId);
  params.append('date', filters.date);

  const result = await apiRequest<TeacherAttendanceApiRecord[]>(
    `/teacher-attendance?${params.toString()}`,
  );

  if (!Array.isArray(result.data)) return null;
  return result.data[0] || null;
};

export const createTeacherAttendanceRecord = async (
  payload: CreateTeacherAttendancePayload,
): Promise<TeacherAttendanceApiRecord> => {
  const result = await apiRequest<TeacherAttendanceApiRecord>(
    '/teacher-attendance',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );

  if (!result.data?._id) {
    throw new Error('The server did not return the saved teacher attendance record.');
  }
  return result.data;
};

export const updateTeacherAttendanceRecord = async (
  attendanceId: string,
  payload: UpdateAttendancePayload,
): Promise<TeacherAttendanceApiRecord> => {
  if (!attendanceId) throw new Error('Teacher attendance record ID is required.');

  const result = await apiRequest<TeacherAttendanceApiRecord>(
    `/teacher-attendance/${encodeURIComponent(attendanceId)}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
  );

  if (!result.data?._id) {
    throw new Error('The server did not return the updated teacher attendance record.');
  }
  return result.data;
};
