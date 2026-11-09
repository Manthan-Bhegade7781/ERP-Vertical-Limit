import { API_BASE_URL } from '@/config/api';
import { getToken } from '@/services/auth';

export type ApiRole = 'super_admin' | 'admin' | 'teacher' | 'student';
export type ApiStatus = 'pending' | 'active' | 'rejected' | 'inactive';

export type ApiUser = {
  _id?: string;
  id?: string;
  fullName: string;
  email: string;
  mobileNumber?: string;
  roles: ApiRole[];
  branchId?: string | { _id?: string; id?: string; name?: string; code?: string } | null;
  status: ApiStatus;
  createdAt?: string;
  updatedAt?: string;
  employeeId?: string;
};

export type BranchOption = { _id: string; name: string; code?: string };

type ApiEnvelope<T> = { success?: boolean; message?: string; data?: T; count?: number };

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  if (!token) throw new Error('Your session has expired. Please log in again.');
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.success === false) {
    throw new Error(result.message || `Request failed (${response.status})`);
  }
  return result as T;
}

export async function fetchUsers(): Promise<ApiUser[]> {
  const result = await request<ApiEnvelope<ApiUser[]>>('/users');
  return Array.isArray(result.data) ? result.data : [];
}

export async function createUser(payload: {
  fullName: string; email: string; password: string; mobileNumber: string;
  role: 'admin' | 'teacher'; branchId: string; employeeId?: string;
}): Promise<ApiUser> {
  const result = await request<ApiEnvelope<{ user: ApiUser }>>('/users', {
    method: 'POST', body: JSON.stringify(payload),
  });
  if (!result.data?.user) throw new Error('The server did not return the created user.');
  return result.data.user;
}

export async function updateUser(id: string, payload: {
  fullName: string; email: string; mobileNumber: string; branchId?: string | null;
}): Promise<ApiUser> {
  const result = await request<ApiEnvelope<{ user: ApiUser }>>(`/users/${id}`, {
    method: 'PUT', body: JSON.stringify(payload),
  });
  if (!result.data?.user) throw new Error('The server did not return the updated user.');
  return result.data.user;
}

export async function updateUserRole(id: string, role: 'admin' | 'teacher', currentRole?: 'Admin' | 'Teacher'): Promise<ApiUser> {
  const path = role === 'admin' && currentRole === 'Teacher'
    ? `/admin/users/${id}/promote-to-admin`
    : `/users/${id}/role`;
  const result = await request<ApiEnvelope<{ user: ApiUser }>>(path, {
    method: 'PATCH', body: JSON.stringify({ role }),
  });
  if (!result.data?.user) throw new Error('The server did not return the updated role.');
  return result.data.user;
}

export async function updateUserStatus(id: string, status: 'active' | 'inactive'): Promise<ApiUser> {
  const result = await request<ApiEnvelope<{ user: ApiUser }>>(`/users/${id}/status`, {
    method: 'PATCH', body: JSON.stringify({ status }),
  });
  if (!result.data?.user) throw new Error('The server did not return the updated status.');
  return result.data.user;
}

export async function deleteUser(id: string): Promise<void> {
  await request<ApiEnvelope<unknown>>(`/users/${id}`, { method: 'DELETE' });
}

export async function fetchBranches(): Promise<BranchOption[]> {
  const result = await request<ApiEnvelope<BranchOption[] | { branches?: BranchOption[] }>>('/branches');
  if (Array.isArray(result.data)) return result.data;
  if (result.data && Array.isArray(result.data.branches)) return result.data.branches;
  return [];
}
