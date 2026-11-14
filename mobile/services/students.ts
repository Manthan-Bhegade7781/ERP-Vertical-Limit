import { API_BASE_URL } from '../config/api';
import { getToken } from './auth';

/* =========================================================
   STUDENT MODULE API TYPES
========================================================= */

export type StudentReference =
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
      mobileNumber?: string;
      status?: string;
      branchId?: StudentReference;
      subjectId?: StudentReference;
      teacherId?: StudentReference;
      batchId?: StudentReference;
    };

export type StudentApiRecord = {
  _id: string;
  id?: string;
  studentId: string;
  userId?: StudentReference;
  batchId?: StudentReference;
  guardianName?: string;
  guardianMobile?: string;
  address?: string;
  status?: 'active' | 'inactive' | string;
  createdAt?: string;
  updatedAt?: string;
};

/* =========================================================
   TEACHER ASSIGNED STUDENT TYPES
========================================================= */

export type TeacherStudentSubject = {
  id: string;
  name: string;
  code?: string;
  type?: string;
};

export type TeacherStudentApiRecord =
  StudentApiRecord & {
    teacherSubjects?: TeacherStudentSubject[];
  };

/* =========================================================
   BATCH TYPES
========================================================= */

export type StudentBatch = {
  _id: string;
  name: string;
  code?: string;
  standard: string;
  academicYear?: string;
  branchId?: StudentReference;
  isRemoved?: boolean;
  status?: string;
};

/* =========================================================
   STUDENT CRUD TYPES
========================================================= */

export type StudentCreatePayload = {
  fullName: string;
  email: string;
  mobileNumber: string;
  password: string;
  batchId: string;
  guardianName?: string;
  guardianMobile?: string;
  address?: string;
};

export type StudentUpdatePayload = {
  fullName: string;
  email: string;
  mobileNumber: string;
  batchId: string;
  guardianName: string;
  guardianMobile: string;
  address: string;
};

/* =========================================================
   BATCH SUBJECT ASSIGNMENT TYPES
========================================================= */

export type BatchSubjectAssignment = {
  _id: string;
  batchId?: StudentReference;
  subjectId?: StudentReference;
  teacherId?: StudentReference;
  status?: 'active' | 'inactive' | string;
};

/* =========================================================
   STUDENT SUBJECT ENROLLMENT TYPES
========================================================= */

export type StudentSubjectEnrollment = {
  _id: string;
  studentId?: StudentReference;
  batchSubjectId?: StudentReference;
  status: 'active' | 'inactive';
};

/* =========================================================
   API RESPONSE
========================================================= */

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  count?: number;
  data?: T;
};

/* =========================================================
   COMMON AUTHENTICATED REQUEST HELPER
========================================================= */

const request = async <T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> => {
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
    const supplied = new Headers(options.headers);

    supplied.forEach((value, key) => {
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
      'Unable to connect to the server. Check the backend, API URL, network, and firewall.',
    );
  }

  const responseText = await response.text();

  let result: ApiResponse<T> = {};

  if (responseText.trim()) {
    try {
      result = JSON.parse(
        responseText,
      ) as ApiResponse<T>;
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

/* =========================================================
   REFERENCE HELPERS
========================================================= */

export const getReferenceId = (
  reference: StudentReference,
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
  reference: StudentReference,
): string => {
  if (typeof reference === 'string') {
    return reference;
  }

  if (
    reference &&
    typeof reference === 'object'
  ) {
    return (
      reference.fullName ||
      reference.name ||
      reference.standard ||
      ''
    );
  }

  return '';
};

/* =========================================================
   STUDENT CRUD
   ADMIN / SUPER ADMIN
========================================================= */

export const fetchStudents = async (): Promise<
  StudentApiRecord[]
> => {
  const result = await request<StudentApiRecord[]>(
    '/students',
  );

  return Array.isArray(result.data)
    ? result.data
    : [];
};

/* =========================================================
   TEACHER ASSIGNED STUDENTS
========================================================= */

export const fetchTeacherAssignedStudents =
  async (): Promise<TeacherStudentApiRecord[]> => {
    const result =
      await request<TeacherStudentApiRecord[]>(
        '/students/teacher/assigned',
      );

    return Array.isArray(result.data)
      ? result.data
      : [];
  };

/* =========================================================
   STUDENT BATCHES
========================================================= */

export const fetchStudentBatches = async (): Promise<
  StudentBatch[]
> => {
  const result = await request<{
    batches?: StudentBatch[];
  }>('/batches');

  return Array.isArray(result.data?.batches)
    ? result.data.batches
    : [];
};

/* =========================================================
   TEACHER ASSIGNED BATCHES
   Used by Teacher Lecture Log

   Only returns batches that contain students
   assigned to the authenticated teacher.
========================================================= */

export const fetchTeacherAssignedBatches =
  async (): Promise<StudentBatch[]> => {
    const [
      assignedStudents,
      allBatches,
    ] = await Promise.all([
      fetchTeacherAssignedStudents(),
      fetchStudentBatches(),
    ]);

    const assignedBatchIds = new Set(
      assignedStudents
        .filter(
          (student) =>
            student.status !== 'inactive',
        )
        .map((student) =>
          getReferenceId(student.batchId),
        )
        .filter(Boolean),
    );

    return allBatches.filter((batch) => {
      const isAssigned = assignedBatchIds.has(
        batch._id,
      );

      const isActive =
        !batch.isRemoved &&
        batch.status !== 'inactive';

      return isAssigned && isActive;
    });
  };

/* =========================================================
   TEACHER ASSIGNED SUBJECTS
   Used by Teacher Lecture Log

   Subjects are derived from the teacherSubjects
   returned by the teacher-assigned students API.

   No hardcoded subject names.
========================================================= */

export const fetchTeacherAssignedSubjects =
  async (
    batchId: string,
  ): Promise<TeacherStudentSubject[]> => {
    if (!batchId) {
      return [];
    }

    const assignedStudents =
      await fetchTeacherAssignedStudents();

    const batchStudents =
      assignedStudents.filter(
        (student) =>
          getReferenceId(student.batchId) === batchId &&
          student.status !== 'inactive',
      );

    const subjectsMap = new Map<
      string,
      TeacherStudentSubject
    >();

    batchStudents.forEach((student) => {
      const subjects =
        student.teacherSubjects || [];

      subjects.forEach((subject) => {
        if (
          subject.id &&
          subject.name &&
          !subjectsMap.has(subject.id)
        ) {
          subjectsMap.set(
            subject.id,
            subject,
          );
        }
      });
    });

    return Array.from(
      subjectsMap.values(),
    ).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  };

/* =========================================================
   CREATE STUDENT
========================================================= */

export const createStudent = async (
  payload: StudentCreatePayload,
): Promise<
  ApiResponse<{
    student: StudentApiRecord;
    user: Record<string, unknown>;
  }>
> => {
  return request<{
    student: StudentApiRecord;
    user: Record<string, unknown>;
  }>('/students', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

/* =========================================================
   UPDATE STUDENT
========================================================= */

export const updateStudent = async (
  studentId: string,
  payload: StudentUpdatePayload,
): Promise<StudentApiRecord> => {
  if (!studentId) {
    throw new Error(
      'Student record ID is missing.',
    );
  }

  const result =
    await request<StudentApiRecord>(
      `/students/${encodeURIComponent(studentId)}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
    );

  if (
    !result.data ||
    typeof result.data !== 'object'
  ) {
    throw new Error(
      'The server did not return the updated student.',
    );
  }

  return result.data;
};

/* =========================================================
   UPDATE STUDENT STATUS
========================================================= */

export const updateStudentStatus = async (
  studentId: string,
  status: 'active' | 'inactive',
): Promise<{
  studentId: string;
  status: 'active' | 'inactive';
}> => {
  if (!studentId) {
    throw new Error(
      'Student record ID is missing.',
    );
  }

  const result = await request<{
    studentId: string;
    status: 'active' | 'inactive';
  }>(
    `/students/${encodeURIComponent(studentId)}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    },
  );

  if (!result.data) {
    throw new Error(
      'The server did not confirm the student status update.',
    );
  }

  return result.data;
};

/* =========================================================
   BATCH SUBJECT ASSIGNMENTS
========================================================= */

export const fetchBatchSubjectAssignments =
  async (
    batchId: string,
  ): Promise<BatchSubjectAssignment[]> => {
    if (!batchId) {
      return [];
    }

    const result = await request<{
      batchSubjects?: BatchSubjectAssignment[];
    }>(
      `/batch-subjects/batch/${encodeURIComponent(batchId)}`,
    );

    return Array.isArray(
      result.data?.batchSubjects,
    )
      ? result.data.batchSubjects
      : [];
  };

/* =========================================================
   STUDENT SUBJECT ENROLLMENTS
========================================================= */

export const fetchStudentSubjectEnrollments =
  async (
    studentId: string,
  ): Promise<StudentSubjectEnrollment[]> => {
    if (!studentId) {
      return [];
    }

    const result = await request<{
      studentSubjects?: StudentSubjectEnrollment[];
    }>(
      `/student-subjects/student/${encodeURIComponent(studentId)}`,
    );

    return Array.isArray(
      result.data?.studentSubjects,
    )
      ? result.data.studentSubjects
      : [];
  };

/* =========================================================
   ENROLL STUDENT IN SUBJECT
========================================================= */

export const enrollStudentInSubject = async (
  studentId: string,
  batchSubjectId: string,
): Promise<StudentSubjectEnrollment> => {
  const result = await request<{
    studentSubject?: StudentSubjectEnrollment;
  }>('/student-subjects', {
    method: 'POST',
    body: JSON.stringify({
      studentId,
      batchSubjectId,
    }),
  });

  if (!result.data?.studentSubject) {
    throw new Error(
      'The server did not return the subject enrollment.',
    );
  }

  return result.data.studentSubject;
};

/* =========================================================
   UPDATE STUDENT SUBJECT ENROLLMENT STATUS
========================================================= */

export const updateStudentSubjectEnrollmentStatus =
  async (
    enrollmentId: string,
    status: 'active' | 'inactive',
  ): Promise<StudentSubjectEnrollment> => {
    if (!enrollmentId) {
      throw new Error(
        'Enrollment record ID is missing.',
      );
    }

    const result = await request<{
      studentSubject?: StudentSubjectEnrollment;
    }>(
      `/student-subjects/${encodeURIComponent(
        enrollmentId,
      )}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      },
    );

    if (!result.data?.studentSubject) {
      throw new Error(
        'The server did not confirm the subject enrollment update.',
      );
    }

    return result.data.studentSubject;
  };