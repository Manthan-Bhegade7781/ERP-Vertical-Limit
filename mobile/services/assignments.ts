import { API_BASE_URL } from '@/config/api';
import { getToken } from '@/services/auth';
import * as FileSystem from 'expo-file-system/legacy';

export type AssignmentRecord = {
  _id: string;
  assignmentTitle: string;
  assignmentCode: string;
  batchId:
    | {
        _id: string;
        name?: string;
        code?: string;
        standard?: string;
        branchId?: { name?: string } | string;
      }
    | string;
  subjectId:
    | {
        _id: string;
        name?: string;
        code?: string;
        standard?: string;
      }
    | string;
  assignmentType:
    | 'homework'
    | 'practice_set'
    | 'worksheet'
    | 'project'
    | 'revision';
  assignedDate: string;
  submissionDate: string;
  totalMarks: number;
  description?: string;
  instructions?: string;
  attachment?: {
    fileName?: string;
    filePath?: string;
    mimeType?: string;
    fileSize?: number;
  };
  branchId?: {
    _id?: string;
    name?: string;
    code?: string;
  } | string;
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
  file?: { uri: string; name: string; type?: string };
};

export type AssignmentAttachmentUpload = {
  uri: string;
  name: string;
  type: 'application/pdf';
};

async function request<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const token = await getToken();
  const isFormData =
    typeof FormData !== 'undefined' && init.body instanceof FormData;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(
        init.body && !isFormData
          ? { 'Content-Type': 'application/json' }
          : {}
      ),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  const raw = await response.text();
  let result: any = {};

  try {
    result = raw ? JSON.parse(raw) : {};
  } catch {
    throw new Error(
      `Server returned an invalid response (HTTP ${response.status}).`
    );
  }

  if (!response.ok || result.success === false) {
    throw new Error(
      result.message || `Request failed (HTTP ${response.status}).`
    );
  }

  return result as T;
}

function buildAssignmentFormData(
  payload: AssignmentPayload,
  attachment?: AssignmentAttachmentUpload
): FormData {
  const formData = new FormData();

  formData.append('assignmentTitle', payload.assignmentTitle);
  formData.append('assignmentCode', payload.assignmentCode);
  formData.append('batchId', payload.batchId);
  formData.append('subjectId', payload.subjectId);
  formData.append('assignmentType', payload.assignmentType);
  formData.append('assignedDate', payload.assignedDate);
  formData.append('submissionDate', payload.submissionDate);
  formData.append('totalMarks', String(payload.totalMarks));
  formData.append('description', payload.description || '');
  formData.append('instructions', payload.instructions || '');

  if (attachment) {
    formData.append(
      'attachment',
      {
        uri: attachment.uri,
        name: attachment.name || 'assignment.pdf',
        type: attachment.type || 'application/pdf',
      } as any
    );
  }

  return formData;
}

// --------------------------------------------------
// FETCH ASSIGNMENTS
// --------------------------------------------------

export async function fetchAssignments(): Promise<AssignmentRecord[]> {
  const result = await request<{ data?: AssignmentRecord[] }>('/assignments');
  return Array.isArray(result.data) ? result.data : [];
}

export async function createAssignment(
  payload: AssignmentPayload | FormData,
  attachment?: AssignmentAttachmentUpload
): Promise<AssignmentRecord> {
  const token = await getToken();
  let body: any;
  let headers: Record<string, string> = { Accept: 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  if (payload instanceof FormData) {
    body = payload;
  } else if (attachment) {
    body = buildAssignmentFormData(payload, attachment);
  } else if ((payload as any).file) {
    const fileObj = (payload as any).file;
    body = buildAssignmentFormData(payload, {
      uri: fileObj.uri,
      name: fileObj.name || 'assignment.pdf',
      type: 'application/pdf',
    });
  } else {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(payload);
  }

  const response = await fetch(`${API_BASE_URL}/assignments`, {
    method: 'POST',
    headers,
    body,
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
  if (!result.data) throw new Error('Assignment was created but no assignment data was returned.');
  return result.data;
}

export async function updateAssignment(
  id: string,
  payload: Partial<AssignmentPayload> | FormData,
  attachment?: AssignmentAttachmentUpload
): Promise<AssignmentRecord> {
  const token = await getToken();
  let body: any;
  let headers: Record<string, string> = { Accept: 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  if (payload instanceof FormData) {
    body = payload;
  } else if (attachment) {
    body = buildAssignmentFormData(payload as AssignmentPayload, attachment);
  } else if ((payload as any).file) {
    const fileObj = (payload as any).file;
    body = buildAssignmentFormData(payload as AssignmentPayload, {
      uri: fileObj.uri,
      name: fileObj.name || 'assignment.pdf',
      type: 'application/pdf',
    });
  } else {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(payload);
  }

  const response = await fetch(`${API_BASE_URL}/assignments/${id}`, {
    method: 'PUT',
    headers,
    body,
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
  if (!result.data) throw new Error('No updated assignment data was returned.');
  return result.data;
}

// --------------------------------------------------
// DELETE ASSIGNMENT
// --------------------------------------------------

export async function deleteAssignment(id: string): Promise<void> {
  await request(`/assignments/${id}`, { method: 'DELETE' });
}

// --------------------------------------------------
// DOWNLOAD ORIGINAL ASSIGNMENT PDF
// --------------------------------------------------

export async function downloadAssignmentAttachment(
  assignmentId: string,
  originalFileName?: string
): Promise<string> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication token not found. Please log in again.');
  }

  if (!FileSystem.cacheDirectory) {
    throw new Error('Device storage is not available.');
  }

  const safeFileName = (originalFileName || 'assignment.pdf')
    .replace(/[<>:"/\\|?*]/g, '_');

  const fileName = safeFileName.toLowerCase().endsWith('.pdf')
    ? safeFileName
    : `${safeFileName}.pdf`;

  const destinationUri =
    `${FileSystem.cacheDirectory}${Date.now()}_${fileName}`;

  const result = await FileSystem.downloadAsync(
    `${API_BASE_URL}/assignments/${assignmentId}/attachment`,
    destinationUri,
    {
      headers: {
        Accept: 'application/pdf',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (result.status !== 200) {
    await FileSystem.deleteAsync(result.uri, { idempotent: true });
    throw new Error(`PDF download failed (HTTP ${result.status}).`);
  }

  return result.uri;
}

// --------------------------------------------------
// FETCH BATCHES
// --------------------------------------------------

export async function fetchAssignmentBatches(): Promise<any[]> {
  const result = await request<{ data?: any; batches?: any[] }>('/batches');

  if (Array.isArray(result.data)) return result.data;
  if (Array.isArray(result.data?.batches)) return result.data.batches;
  if (Array.isArray(result.batches)) return result.batches;

  return [];
}

// --------------------------------------------------
// FETCH SUBJECTS
// --------------------------------------------------

export async function fetchAssignmentSubjects(): Promise<any[]> {
  const result = await request<{ data?: any; subjects?: any[] }>('/subjects');

  if (Array.isArray(result.data)) return result.data;
  if (Array.isArray(result.data?.subjects)) return result.data.subjects;
  if (Array.isArray(result.subjects)) return result.subjects;

  return [];
}

// --------------------------------------------------
// FETCH BATCH SUBJECTS
// --------------------------------------------------

export async function fetchAssignmentBatchSubjects(
  batchId: string
): Promise<any[]> {
  const result = await request<{
    data?: any;
    batchSubjects?: any[];
  }>(`/batch-subjects/batch/${batchId}`);

  if (Array.isArray(result.data?.batchSubjects)) {
    return result.data.batchSubjects;
  }

  if (Array.isArray(result.data)) return result.data;
  if (Array.isArray(result.batchSubjects)) return result.batchSubjects;

  return [];
}
