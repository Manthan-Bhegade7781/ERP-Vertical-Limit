
import { API_BASE_URL } from "@/config/api";
import { getToken } from "@/services/auth";

const BASE_URL = API_BASE_URL.replace(/\/+$/, "");

export type MessageFolder =
  | "inbox"
  | "sent"
  | "unread"
  | "archived"
  | "important";

export type MessageStatusAction =
  | "read"
  | "unread"
  | "important"
  | "normal"
  | "archive"
  | "unarchive";

export type MessageCategory =
  | "General"
  | "Academic"
  | "Examination"
  | "Fees"
  | "Reports"
  | "Training"
  | "Events"
  | "Assignments";

export type MessagePriority = "Normal" | "Important";

export type MessageRecipient = {
  id: string;
  fullName: string;
  email: string;
  roles: string[];
  branchId: string | null;
};

export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  count?: number;
  data: T;
};

export type CreateMessagePayload = {
  recipientIds: string[];
  subject: string;
  body: string;
  category?: MessageCategory;
  priority?: MessagePriority;
};

export type ReplyMessagePayload = {
  body: string;
};

// Common authenticated API request
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();

  if (!token) {
    throw new Error("Session expired. Please log in again.");
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const result = await response.json().catch(() => null);

  if (!response.ok || result?.success === false) {
    throw new Error(
      result?.message || `Request failed (${response.status})`
    );
  }

  return result as T;
}

// Get messages for the selected folder
export async function getMessages(
  folder?: MessageFolder
) {
  const query = folder
    ? `?folder=${encodeURIComponent(folder)}`
    : "";

  return request<ApiResponse<unknown[]>>(
    `/messages${query}`,
    { method: "GET" }
  );
}

// Get a single message; the backend may mark it as read
export async function getMessageById(messageId: string) {
  return request<ApiResponse<unknown>>(
    `/messages/${encodeURIComponent(messageId)}`,
    { method: "GET" }
  );
}

// Get users the current user can message
export async function getMessageRecipients() {
  return request<ApiResponse<MessageRecipient[]>>(
    "/users/message-recipients",
    { method: "GET" }
  );
}

// Send a new message
export async function createMessage(
  payload: CreateMessagePayload
) {
  return request<ApiResponse<unknown>>("/messages", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Reply to an existing message
export async function replyToMessage(
  messageId: string,
  payload: ReplyMessagePayload
) {
  return request<ApiResponse<unknown>>(
    `/messages/${encodeURIComponent(messageId)}/reply`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

// Update read, important, and archive status
export async function updateMessageStatus(
  messageId: string,
  action: MessageStatusAction
) {
  return request<ApiResponse<unknown>>(
    `/messages/${encodeURIComponent(messageId)}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ action }),
    }
  );
}

// Delete a message
export async function deleteMessage(messageId: string) {
  return request<ApiResponse<unknown>>(
    `/messages/${encodeURIComponent(messageId)}`,
    { method: "DELETE" }
  );
}
