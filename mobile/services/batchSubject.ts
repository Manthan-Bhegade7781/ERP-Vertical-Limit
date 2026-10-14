import { API_BASE_URL } from '@/config/api';
import { getToken } from '@/services/auth';

export type BatchSubject = {
  _id: string;
  batchId: string;
  subjectId: {
    _id: string;
    name: string;
    code: string;
    standard: string;
    type: string;
  };
  teacherId: {
    _id: string;
    fullName: string;
    email: string;
  };
  status: 'active' | 'inactive';
};

type GetBatchSubjectsResponse = {
  success: boolean;
  message?: string;
  data?: {
    batchSubjects: BatchSubject[];
  };
};

type AssignSubjectResponse = {
  success: boolean;
  message: string;
  data?: {
    batchSubject: BatchSubject;
  };
};


export const getBatchSubjects = async (batchId: string) => {
  const token = await getToken();

  const response = await fetch(
    `${API_BASE_URL}/batch-subjects/batch/${batchId}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );

  const responseText = await response.text();

  let result: any;

  try {
    result = responseText ? JSON.parse(responseText) : {};
  } catch {
    console.error("Batch subjects API returned non-JSON:", {
      status: response.status,
      response: responseText.slice(0, 500),
    });

    throw new Error(
      `Invalid JSON response from server (HTTP ${response.status})`
    );
  }

  if (!response.ok || result.success === false) {
    throw new Error(
      result.message || `Failed to load subjects (HTTP ${response.status})`
    );
  }

  return result.data?.batchSubjects ?? [];
};

export const assignSubjectToBatch = async (
  batchId: string,
  subjectId: string,
  teacherId: string
): Promise<AssignSubjectResponse> => {
  const token = await getToken();

  if (!token) {
    return {
      success: false,
      message: 'Authentication required',
    };
  }

  const response = await fetch(
    `${API_BASE_URL}/batch-subjects`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        batchId,
        subjectId,
        teacherId,
      }),
    }
  );

  const result: AssignSubjectResponse =
    await response.json();

  return result;
};