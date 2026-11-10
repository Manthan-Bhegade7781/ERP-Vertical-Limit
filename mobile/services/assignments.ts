import { API_BASE_URL } from '@/config/api';
import { getToken } from '@/services/auth';

export type AssignmentRecord = {
  _id: string;
  assignmentTitle: string;
  assignmentCode: string;
  batchId: { _id: string; name?: string; code?: string; standard?: string; branchId?: { name?: string } | string } | string;
  subjectId: { _id: string; name?: string; code?: string; standard?: string } | string;
  assignmentType: 'homework' | 'practice_set' | 'worksheet' | 'project' | 'revision';
  assignedDate: string;
  submissionDate: string;
  totalMarks: number;
  description?: string;
  instructions?: string;
  attachment?: { fileName?: string; filePath?: string; mimeType?: string; fileSize?: number };
  branchId?: { _id?: string; name?: string; code?: string } | string;
  createdAt?: string;
};

export type AssignmentPayload = {
  assignmentTitle: string;
  assignmentCode: string;
  batchId: string;
  subjectId: string;
  assignmentType: AssignmentRecord['assignmentType'];
  assignedDate: string;
  submissionDate: string;
  totalMarks: number;
  description?: string;
  instructions?: string;
};

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  const raw = await response.text();
  let result: any = {};
  try {
    result = raw ? JSON.parse(raw) : {};
  } catch {
    throw new Error(`Server returned an invalid response (HTTP ${response.status}).`);
  }

  if (!response.ok || result.success === false) {
    throw new Error(result.message || `Request failed (HTTP ${response.status}).`);
  }
  return result as T;
}

export async function fetchAssignments(): Promise<AssignmentRecord[]> {
  const result = await request<{ data?: AssignmentRecord[] }>('/assignments');
  return Array.isArray(result.data) ? result.data : [];
}

export async function createAssignment(payload: AssignmentPayload): Promise<AssignmentRecord> {
  const result = await request<{ data?: AssignmentRecord }>('/assignments', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!result.data) throw new Error('Assignment was created but no assignment data was returned.');
  return result.data;
}

export async function updateAssignment(id: string, payload: Partial<AssignmentPayload>): Promise<AssignmentRecord> {
  const result = await request<{ data?: AssignmentRecord }>(`/assignments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  if (!result.data) throw new Error('No updated assignment data was returned.');
  return result.data;
}

export async function deleteAssignment(id: string): Promise<void> {
  await request(`/assignments/${id}`, { method: 'DELETE' });
}

export async function fetchAssignmentBatches(): Promise<any[]> {
  const result = await request<{ data?: any; batches?: any[] }>('/batches');
  if (Array.isArray(result.data)) return result.data;
  if (Array.isArray(result.data?.batches)) return result.data.batches;
  if (Array.isArray(result.batches)) return result.batches;
  return [];
}

export async function fetchAssignmentSubjects(): Promise<any[]> {
  const result = await request<{ data?: any; subjects?: any[] }>('/subjects');
  if (Array.isArray(result.data)) return result.data;
  if (Array.isArray(result.data?.subjects)) return result.data.subjects;
  if (Array.isArray(result.subjects)) return result.subjects;
  return [];
}

export async function fetchAssignmentBatchSubjects(batchId: string): Promise<any[]> {
  const result = await request<{ data?: any; batchSubjects?: any[] }>(`/batch-subjects/batch/${batchId}`);
  if (Array.isArray(result.data?.batchSubjects)) return result.data.batchSubjects;
  if (Array.isArray(result.data)) return result.data;
  if (Array.isArray(result.batchSubjects)) return result.batchSubjects;
  return [];
}
