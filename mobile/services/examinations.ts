import { API_BASE_URL } from '../config/api';
import { getToken } from './auth';

export type ExaminationStatus = 'scheduled' | 'completed' | 'cancelled' | 'results_published';
export type RefRecord = string | { _id?: string; id?: string; name?: string; code?: string; standard?: string; branchId?: RefRecord } | null;
export type ExaminationApiRecord = {
  _id: string;
  examinationName: string;
  examinationCode: string;
  batchId: RefRecord;
  subjectId: RefRecord;
  examinationDate: string;
  startTime: string;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  instructions?: string;
  status: ExaminationStatus;
  studentCount?: number;
};
export type ExaminationPayload = {
  examinationName?: string;
  examinationCode?: string;
  batchId?: string;
  subjectId?: string;
  examinationDate?: string;
  startTime?: string;
  durationMinutes?: number;
  totalMarks?: number;
  passingMarks?: number;
  instructions?: string;
};
export type ExamBatch = { _id: string; name: string; code?: string; standard: string; isRemoved?: boolean; status?: string; branchId?: RefRecord };
export type ExamSubject = { _id: string; name: string; code?: string; standard: string; status?: string; type?: string };
export type ExamBatchSubject = { _id: string; batchId: RefRecord; subjectId: RefRecord; status?: string };
type Envelope<T> = { success?: boolean; message?: string; data?: T; count?: number };

async function request<T>(path: string, init: RequestInit = {}): Promise<Envelope<T>> {
  const token = await getToken();
  if (!token) throw new Error('Your session has expired. Please sign in again.');
  const headers: Record<string, string> = { Accept: 'application/json', Authorization: `Bearer ${token}` };
  if (init.body !== undefined) headers['Content-Type'] = 'application/json';
  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers: { ...headers, ...(init.headers as Record<string, string> | undefined) } });
  let result: Envelope<T> = {};
  try { result = await response.json() as Envelope<T>; } catch { throw new Error(`Invalid server response (${response.status}).`); }
  if (response.status === 401) throw new Error('Session expired. Please sign in again.');
  if (response.status === 403) throw new Error(result.message || 'You do not have permission to manage examinations.');
  if (!response.ok || result.success === false) throw new Error(result.message || `Request failed (${response.status}).`);
  return result;
}

export async function fetchExaminations(): Promise<ExaminationApiRecord[]> {
  const result = await request<ExaminationApiRecord[]>('/examinations');
  return Array.isArray(result.data) ? result.data : [];
}
export async function createExamination(payload: Required<Pick<ExaminationPayload, 'examinationName' | 'examinationCode' | 'batchId' | 'subjectId' | 'examinationDate' | 'startTime' | 'durationMinutes' | 'totalMarks' | 'passingMarks'>> & ExaminationPayload): Promise<ExaminationApiRecord> {
  const result = await request<ExaminationApiRecord>('/examinations', { method: 'POST', body: JSON.stringify(payload) });
  if (!result.data?._id) throw new Error('Server did not return the created examination.');
  return result.data;
}
export async function updateExamination(id: string, payload: ExaminationPayload): Promise<ExaminationApiRecord> {
  const result = await request<ExaminationApiRecord>(`/examinations/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(payload) });
  if (!result.data?._id) throw new Error('Server did not return the updated examination.');
  return result.data;
}
export async function cancelExamination(id: string): Promise<ExaminationApiRecord> {
  const result = await request<ExaminationApiRecord>(`/examinations/${encodeURIComponent(id)}/cancel`, { method: 'PATCH' });
  if (!result.data?._id) throw new Error('Server did not return the cancelled examination.');
  return result.data;
}
export async function fetchExamBatches(): Promise<ExamBatch[]> {
  const result = await request<ExamBatch[] | { batches?: ExamBatch[] }>('/batches');
  if (Array.isArray(result.data)) return result.data;
  return result.data && Array.isArray(result.data.batches) ? result.data.batches : [];
}
export async function fetchExamSubjects(): Promise<ExamSubject[]> {
  const result = await request<ExamSubject[] | { subjects?: ExamSubject[] }>('/subjects');
  if (Array.isArray(result.data)) return result.data;
  return result.data && Array.isArray(result.data.subjects) ? result.data.subjects : [];
}
export async function fetchBatchSubjectAssignments(batchId: string): Promise<ExamBatchSubject[]> {
  if (!batchId) return [];
  const result = await request<{ batchSubjects?: ExamBatchSubject[] }>(`/batch-subjects/batch/${encodeURIComponent(batchId)}`);
  return Array.isArray(result.data?.batchSubjects) ? result.data.batchSubjects : [];
}
