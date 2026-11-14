import { API_BASE_URL } from '../config/api';
import { getToken } from './auth';

export type TeacherBranch = {
  _id: string;
  name: string;
  code?: string;
  status?: string;
};

export type TeacherUserReference = {
  _id?: string;
  id?: string;
  fullName?: string;
  name?: string;
  email?: string;
  mobileNumber?: string;
  branchId?: string | TeacherBranch | null;
  roles?: string[];
  status?: string;
};

export type TeacherApiRecord = {
  _id: string;
  employeeId: string;
  userId: string | TeacherUserReference | null;
  specialization?: string;
  qualification: string;
  experience: string;
  address?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateTeacherPayload = {
  fullName: string;
  email: string;
  mobileNumber: string;
  password: string;
  branchId: string;
  specialization?: string;
  qualification: string;
  experience: string;
  address?: string;
};

export type UpdateTeacherPayload = {
  fullName: string;
  email: string;
  mobileNumber: string;
  branchId: string;
  specialization: string;
  qualification: string;
  experience: string;
  address: string;
};

export type TeacherStatus = 'active' | 'inactive';

/* =========================================
   TEACHER BATCH TYPES
========================================= */

export type TeacherBatchSubject = {
  _id: string;
  name: string;
  code?: string;
  standard?: string;
  type?: string;
  description?: string;
  duration?: number;
};

export type TeacherBatch = {
  _id: string;
  name: string;
  code?: string;
  standard?: string;
  academicYear?: string;
  branchId?: string;
  startDate?: string;
  endDate?: string;

  schedule?: {
    startTime?: string;
    endTime?: string;
    days?: string[];
  };

  capacity?: number;
  description?: string;

  subjects: TeacherBatchSubject[];
  studentCount: number;
  subjectCount: number;
  status?: string;
};

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

/* =========================================
   COMMON API REQUEST
========================================= */

const request = async <T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> => {
  const token = await getToken();

  if (!token) {
    throw new Error(
      'Your session has expired. Please sign in again.',
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
    new Headers(options.headers).forEach((value, key) => {
      headers[key] = value;
    });
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(
      'Unable to connect to the server. Check your API URL and network.',
    );
  }

  const raw = await response.text();

  let result: ApiResponse<T> = {};

  if (raw.trim()) {
    try {
      result = JSON.parse(raw) as ApiResponse<T>;
    } catch {
      throw new Error(
        `The server returned an invalid response (HTTP ${response.status}).`,
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
        'You do not have permission to perform this action.',
    );
  }

  if (!response.ok || result.success === false) {
    throw new Error(
      result.message ||
        `Request failed (HTTP ${response.status}).`,
    );
  }

  return result;
};

/* =========================================
   TEACHER REFERENCE
========================================= */

export const getTeacherReferenceId = (
  value:
    | string
    | { _id?: string; id?: string }
    | null
    | undefined,
): string => {
  if (typeof value === 'string') return value;

  if (value && typeof value === 'object') {
    return value._id || value.id || '';
  }

  return '';
};

/* =========================================
   FETCH TEACHERS
========================================= */

export const fetchTeachers = async (): Promise<
  TeacherApiRecord[]
> => {
  const result = await request<TeacherApiRecord[]>('/teachers');

  return Array.isArray(result.data) ? result.data : [];
};

/* =========================================
   FETCH BRANCHES
========================================= */

export const fetchTeacherBranches = async (): Promise<
  TeacherBranch[]
> => {
  const result = await request<{
    branches?: TeacherBranch[];
  }>('/admin/branches/active');

  return Array.isArray(result.data?.branches)
    ? result.data.branches
    : [];
};

/* =========================================
   CREATE TEACHER
========================================= */

export type CreatedTeacherResponse = {
  teacherId: string;
  employeeId: string;
  user?: TeacherUserReference;

  teacher?: {
    specialization?: string;
    qualification?: string;
    experience?: string;
    address?: string;
    status?: string;
  };
};

export const createTeacher = async (
  payload: CreateTeacherPayload,
): Promise<CreatedTeacherResponse> => {
  const result = await request<CreatedTeacherResponse>(
    '/teachers',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );

  if (!result.data?.teacherId || !result.data.employeeId) {
    throw new Error(
      'Teacher was created but the server response did not include its ID.',
    );
  }

  return result.data;
};

/* =========================================
   UPDATE TEACHER
========================================= */

export const updateTeacher = async (
  teacherId: string,
  payload: UpdateTeacherPayload,
): Promise<TeacherApiRecord> => {
  if (!teacherId) {
    throw new Error('Teacher ID is required.');
  }

  const result = await request<TeacherApiRecord>(
    `/teachers/${encodeURIComponent(teacherId)}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
  );

  if (!result.data?._id) {
    throw new Error(
      'The server did not return the updated teacher.',
    );
  }

  return result.data;
};

/* =========================================
   UPDATE TEACHER STATUS
========================================= */

export const updateTeacherStatus = async (
  teacherId: string,
  status: TeacherStatus,
): Promise<TeacherApiRecord> => {
  if (!teacherId) {
    throw new Error('Teacher ID is required.');
  }

  const result = await request<TeacherApiRecord>(
    `/teachers/${encodeURIComponent(teacherId)}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    },
  );

  if (!result.data?._id) {
    throw new Error(
      'The server did not return the updated teacher status.',
    );
  }

  return result.data;
};

/* =========================================
   FETCH LOGGED-IN TEACHER'S BATCHES
========================================= */

/* =========================================
   FETCH LOGGED-IN TEACHER'S REAL BATCHES
========================================= */

export const fetchMyBatches = async (): Promise<TeacherBatch[]> => {
  const result = await request<
    TeacherBatch[] | { batches?: TeacherBatch[] }
  >('/batches/teacher/my-batches');

  // Backend response: { success: true, data: [...] }
  if (Array.isArray(result.data)) {
    return result.data;
  }

  // Backend response: { success: true, data: { batches: [...] } }
  if (
    result.data &&
    !Array.isArray(result.data) &&
    Array.isArray(result.data.batches)
  ) {
    return result.data.batches;
  }

  return [];
};