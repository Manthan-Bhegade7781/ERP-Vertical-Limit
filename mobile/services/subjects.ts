import { API_BASE_URL } from "../config/api";
import { getToken } from "./auth";

export type SubjectApiRecord = {
  _id: string;
  name: string;
  code: string;
  standard: string;
  type: string;
  duration?: string;
  description?: string;
  status: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
};

export type SubjectPayload = {
  name: string;
  code: string;
  standard: string;
  type: string;
  duration?: string;
  description?: string;
  status?: "active" | "inactive";
};

type SubjectResponse = {
  success?: boolean;
  message?: string;
  data?: { subjects?: SubjectApiRecord[]; subject?: SubjectApiRecord };
};

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getToken();
  if (!token) throw new Error("Please sign in again. Your session token was not found.");
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new Error("Unable to connect to the server. Check API_BASE_URL and network connectivity.");
  }
  const result = (await response.json().catch(() => ({}))) as SubjectResponse;
  if (!response.ok || result.success === false) {
    throw new Error(result.message || `Request failed (${response.status}).`);
  }
  return result as T;
}

export async function fetchSubjects(): Promise<SubjectApiRecord[]> {
  const result = await request<SubjectResponse>("/subjects");
  return Array.isArray(result.data?.subjects) ? result.data.subjects : [];
}

export async function createSubject(payload: SubjectPayload): Promise<SubjectApiRecord> {
  const result = await request<SubjectResponse>("/subjects", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!result.data?.subject) throw new Error("The server did not return the created subject.");
  return result.data.subject;
}

export async function updateSubject(id: string, payload: SubjectPayload): Promise<SubjectApiRecord> {
  const result = await request<SubjectResponse>(`/subjects/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  if (!result.data?.subject) throw new Error("The server did not return the updated subject.");
  return result.data.subject;
}

export async function updateSubjectStatus(id: string, status: "active" | "inactive"): Promise<SubjectApiRecord> {
  const result = await request<SubjectResponse>(`/subjects/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  if (!result.data?.subject) throw new Error("The server did not return the updated subject.");
  return result.data.subject;
}
