
import { Platform } from 'react-native';
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
  studentId?: string;
  standard?: string;
  batchName?: string;
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

export type ChangePasswordResponse = {
  success: boolean;
  message: string;
};

/**
 * Platform-aware token storage.
 *
 * Web: localStorage (development convenience).
 * Native: Expo SecureStore.
 *
 * For production web apps, prefer secure, HttpOnly cookies
 * configured by the backend instead of localStorage.
 */
const tokenStorage = {
  async get(): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(TOKEN_KEY);
    }

    return SecureStore.getItemAsync(TOKEN_KEY);
  },

  async set(token: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(TOKEN_KEY, token);
      return;
    }

    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },

  async remove(): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(TOKEN_KEY);
      return;
    }

    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },
};

// Login and store JWT
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
    await tokenStorage.set(result.data.token);
  }

  return result;
};

// Get stored JWT
export const getToken = async (): Promise<string | null> => {
  return tokenStorage.get();
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

    const result: MeResponse = await response.json();

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
  await tokenStorage.remove();
};

// Change Password
export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<ChangePasswordResponse> => {
  const token = await getToken();

  if (!token) {
    return {
      success: false,
      message: 'Authentication required',
    };
  }

  const response = await fetch(
    `${API_BASE_URL}/auth/change-password`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    }
  );

  const result: ChangePasswordResponse = await response.json();
  return result;
};

export type ForgotPasswordResponse = {
  success: boolean;
  message: string;
  debugOtp?: string;
};

export type VerifyOtpResponse = {
  success: boolean;
  message: string;
};

export type ResetPasswordResponse = {
  success: boolean;
  message: string;
};

// Request password reset OTP
export const requestPasswordResetOtp = async (
  email: string
): Promise<ForgotPasswordResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        success: false,
        message: result?.message || 'Failed to send OTP code.',
      };
    }

    return result;
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Network error while requesting OTP.',
    };
  }
};

// Verify OTP
export const verifyPasswordResetOtp = async (
  email: string,
  otp: string
): Promise<VerifyOtpResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      }),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        success: false,
        message: result?.message || 'Invalid or expired OTP code.',
      };
    }

    return result;
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Network error while verifying OTP.',
    };
  }
};

// Reset password with verified OTP
export const resetPasswordWithOtp = async (
  email: string,
  otp: string,
  newPassword: string
): Promise<ResetPasswordResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        newPassword,
      }),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        success: false,
        message: result?.message || 'Failed to reset password.',
      };
    }

    return result;
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Network error while resetting password.',
    };
  }
};
