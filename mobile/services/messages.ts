import { API_BASE_URL } from "@/config/api";
import { getToken } from "@/services/auth";

export type MessageFolder =
  | "inbox"
  | "sent"
  | "unread"
  | "archived"
  | "important";

export type MessageCategory =
  | "General"
  | "Academic"
  | "Examination"
  | "Fees"
  | "Reports"
  | "Training"
  | "Events"
  | "Assignments";

export type MessageUser = {
  _id?: string;
  id?: string;
  fullName?: string;
  email?: string;
  roles?: string[];
};

export type MessageRecipient = {
  user: MessageUser | string;
  readAt?: string | null;
  archivedAt?: string | null;
  isImportant?: boolean;
};

export type MessageRecord = {
  _id: string;
  sender: MessageUser | string;
  recipients: MessageRecipient[];
  subject: string;
  body: string;
  category: MessageCategory;
  priority: "Important" | "Normal";
  replyTo?: string | null;
  branchId?: string | null;
  createdAt: string;
  updatedAt?: string;
};

export type MessageContact = {
  id: string;
  fullName: string;
  email: string;
  roles: string[];
  branchId?: string | null;
};

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getToken();

  if (!token) {
    throw new Error("Your session has expired. Please log in again.");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || result.success === false) {
    throw new Error(
      result.message || `Request failed (${response.status})`,
    );
  }

  return result as T;
}

export async function fetchMessages(
  folder: MessageFolder = "inbox",
): Promise<MessageRecord[]> {
  const result = await request<{
    data?: MessageRecord[];
  }>(`/messages?folder=${folder}`);

  return Array.isArray(result.data) ? result.data : [];
}

export async function fetchMessageById(
  id: string,
): Promise<MessageRecord> {
  const result = await request<{
    data?: MessageRecord;
  }>(`/messages/${id}`);

  if (!result.data) {
    throw new Error("Message details could not be loaded.");
  }

  return result.data;
}

export async function fetchMessageContacts(): Promise<MessageContact[]> {
  const result = await request<{
    data?: MessageContact[];
  }>("/users/message-recipients");

  return Array.isArray(result.data) ? result.data : [];
}

export async function sendMessage(payload: {
  recipientIds: string[];
  subject: string;
  body: string;
  category: MessageCategory;
  priority: "Important" | "Normal";
}): Promise<MessageRecord> {
  const result = await request<{
    data?: MessageRecord;
  }>("/messages", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!result.data) {
    throw new Error("Message could not be sent.");
  }

  return result.data;
}

export async function replyToMessage(
  id: string,
  body: string,
): Promise<MessageRecord> {
  const result = await request<{
    data?: MessageRecord;
  }>(`/messages/${id}/reply`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });

  if (!result.data) {
    throw new Error("Reply could not be sent.");
  }

  return result.data;
}

export async function updateMessageStatus(
  id: string,
  action:
    | "read"
    | "unread"
    | "important"
    | "normal"
    | "archive"
    | "unarchive",
): Promise<void> {
  await request(`/messages/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ action }),
  });
}

export async function deleteMessage(id: string): Promise<void> {
  await request(`/messages/${id}`, {
    method: "DELETE",
  });
}

// Backward-compatibility aliases for Student & Admin dashboards
export const getMessages = fetchMessages;
export const getMessageById = fetchMessageById;
export const getMessageRecipients = fetchMessageContacts;
export const createMessage = sendMessage;