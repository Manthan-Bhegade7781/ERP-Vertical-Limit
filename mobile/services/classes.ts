import { API_BASE_URL } from '../config/api';
import { getToken } from './auth';

export type StudentClassSubject = {
  _id?: string;
  batchSubjectId?: string;
  name: string;
  code: string;
  teacher: string;
  teacherEmail?: string;
  teacherMobile?: string;
  type?: string;
  icon?: string;
  color?: string;
  background?: string;
};

export type StudentBatchItem = {
  _id: string;
  name: string;
  code: string;
  standard?: string;
  branch: string;
  branchName?: string;
  academicYear?: string;
  studentsCount: number;
  subjectsCount: number;
  daysPerWeek: number;
  schedule?: {
    startTime: string;
    endTime: string;
    days: string[];
  };
  subjects: StudentClassSubject[];
};

export type StudentClassesData = {
  batches: StudentBatchItem[];
  currentBatch: StudentBatchItem | null;
};

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

export const getMyClasses = async (): Promise<StudentClassesData> => {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE_URL}/students/my/classes`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const responseText = await response.text();
  let result: ApiEnvelope<StudentClassesData> = {};

  if (responseText.trim()) {
    try {
      result = JSON.parse(responseText) as ApiEnvelope<StudentClassesData>;
    } catch {
      throw new Error(`Invalid JSON response: ${responseText.slice(0, 80)}`);
    }
  }

  if (!response.ok || result.success === false) {
    throw new Error(result.message || `Request failed with status ${response.status}`);
  }

  return (
    result.data || {
      batches: [],
      currentBatch: null,
    }
  );
};
