import * as SecureStore from 'expo-secure-store';

import { API_BASE_URL } from '@/config/api';

const TOKEN_KEY = 'auth_token';

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  mobileNumber?: string;
  roles: string[];
  branchId?: string | null;
  status: string;
};

type LoginResponse = {
  success: boolean;
  message: string;
  data?: {
    user: AuthUser;
    token: string;
  };
};

type MeResponse = {
  success: boolean;
  message?: string;
  data?: {
    user: AuthUser;
  };
};

type UpdateProfileResponse = {
  success: boolean;
  message: string;
  data?: {
    user: AuthUser;
  };
};

// Login and securely store JWT
export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/auth/login`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim(),
        password,
      }),
    }
  );

  const result: LoginResponse = await response.json();

  if (
    response.ok &&
    result.success &&
    result.data?.token
  ) {
    await SecureStore.setItemAsync(
      TOKEN_KEY,
      result.data.token
    );
  }

  return result;
};

// Get stored JWT
export const getToken = async (): Promise<string | null> => {
  return SecureStore.getItemAsync(TOKEN_KEY);
};

// Get currently logged-in user
export const getCurrentUser =
  async (): Promise<AuthUser | null> => {
    const token = await getToken();

    if (!token) {
      return null;
    }

    const response = await fetch(
      `${API_BASE_URL}/auth/me`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      await logout();
      return null;
    }

    const result: MeResponse =
      await response.json();

    if (!result.success || !result.data?.user) {
      await logout();
      return null;
    }

    return result.data.user;
  };

  // Update currently logged-in user's profile
export const updateCurrentUser = async (
  fullName: string,
  email: string,
  mobileNumber: string
): Promise<UpdateProfileResponse> => {
  const token = await getToken();

  if (!token) {
    return {
      success: false,
      message: 'Authentication required',
    };
  }

  const response = await fetch(
    `${API_BASE_URL}/auth/me`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        fullName: fullName.trim(),
        email: email.trim(),
        mobileNumber: mobileNumber.trim(),
      }),
    }
  );

  const result: UpdateProfileResponse =
    await response.json();

  return result;
};

// Logout
export const logout = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
};