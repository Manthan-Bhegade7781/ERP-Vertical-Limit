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

export type StudentUpcomingTest = {
  id: string;
  title: string;
  subject: string;
  teacher: string;
  date: string;
  day: string;
  time: string;
  duration: string;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  syllabus: string;
  room: string;
  mode: 'Offline' | 'Online';
  status: ExaminationStatus;
  rawDate: string;
};

export type StudentTestResult = {
  id: string;
  testName: string;
  subject: string;
  teacher: string;
  date: string;
  marksObtained: number;
  totalMarks: number;
  percentage: number;
  feedback: string;
  correctAnswers: number;
  totalQuestions: number;
  status?: string;
};

export type SubmitTestPayload = {
  examinationId?: string;
  testName: string;
  subject: string;
  teacher?: string;
  marksObtained: number;
  totalMarks: number;
  correctAnswers?: number;
  totalQuestions?: number;
  feedback?: string;
};

export async function fetchStudentUpcomingTests(): Promise<StudentUpcomingTest[]> {
  const records = await fetchExaminations();
  return records
    .filter((rec) => rec.status !== 'cancelled')
    .map((rec) => {
      const subjectObj = rec.subjectId && typeof rec.subjectId === 'object' ? rec.subjectId : null;
      const subjectName = subjectObj?.name || 'General';
      const parsedDate = rec.examinationDate ? new Date(rec.examinationDate) : new Date();
      const validDate = !Number.isNaN(parsedDate.getTime()) ? parsedDate : new Date();

      const dateStr = validDate.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      const dayStr = validDate.toLocaleDateString('en-US', { weekday: 'long' });

      const teacherName = (rec as any).teacher || 'Assigned Teacher';

      return {
        id: rec._id,
        title: rec.examinationName,
        subject: subjectName,
        teacher: teacherName,
        date: dateStr,
        day: dayStr,
        time: rec.startTime || '10:00 AM',
        duration: `${rec.durationMinutes || 60} mins`,
        durationMinutes: rec.durationMinutes || 60,
        totalMarks: rec.totalMarks,
        passingMarks: rec.passingMarks,
        syllabus: rec.instructions || 'Review assigned topics and classroom lecture notes.',
        room: 'Main Hall',
        mode: 'Online',
        status: rec.status,
        rawDate: rec.examinationDate,
      };
    });
}

export async function fetchStudentResults(): Promise<StudentTestResult[]> {
  const result = await request<any[]>('/examinations/my/results');
  if (!Array.isArray(result.data)) return [];

  return result.data.map((item) => {
    const parsedDate = item.date ? new Date(item.date) : new Date(item.createdAt || Date.now());
    const validDate = !Number.isNaN(parsedDate.getTime()) ? parsedDate : new Date();

    return {
      id: item._id,
      testName: item.testName || 'Test Result',
      subject: item.subject || 'General',
      teacher: item.teacher || 'Subject Teacher',
      date: validDate.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      marksObtained: item.marksObtained,
      totalMarks: item.totalMarks,
      percentage: item.percentage ?? Math.round((item.marksObtained / (item.totalMarks || 1)) * 100),
      feedback: item.feedback || 'Good attempt. Keep practising regularly.',
      correctAnswers: item.correctAnswers ?? 0,
      totalQuestions: item.totalQuestions ?? 0,
      status: item.status || 'evaluated',
    };
  });
}

export async function submitStudentTest(payload: SubmitTestPayload): Promise<StudentTestResult> {
  const result = await request<any>('/examinations/my/submit', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!result.data?._id) {
    throw new Error(result.message || 'Failed to submit test result.');
  }

  const item = result.data;
  const parsedDate = item.date ? new Date(item.date) : new Date();

  return {
    id: item._id,
    testName: item.testName,
    subject: item.subject,
    teacher: item.teacher,
    date: parsedDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    marksObtained: item.marksObtained,
    totalMarks: item.totalMarks,
    percentage: item.percentage,
    feedback: item.feedback,
    correctAnswers: item.correctAnswers,
    totalQuestions: item.totalQuestions,
    status: item.status,
  };
}
