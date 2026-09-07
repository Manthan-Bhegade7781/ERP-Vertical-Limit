import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  getCurrentUser,
  login as loginUser,
  logout as logoutUser,
  type AuthUser,
} from '@/services/auth';

type AuthContextType = {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  updateUser: (user: AuthUser) => void;
  login: (
    email: string,
    password: string
  ) => Promise<{
    success: boolean;
    message: string;
    data?: {
      user: AuthUser;
      token: string;
    };
  }>;
  logout: () => Promise<void>;
};

const AuthContext =
  createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore existing login session when app starts
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const currentUser = await getCurrentUser();

        setUser(currentUser);
      } catch (error) {
        console.error(
          'Session restore error:',
          error
        );

        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  // Login
  const login = async (
  email: string,
  password: string
) => {
  const result = await loginUser(email, password);

  if (
    result.success &&
    result.data?.user
  ) {
    setUser(result.data.user);
  }

  return result;
};

// Update user data in the global auth state
const updateUser = (updatedUser: AuthUser) => {
  setUser(updatedUser);
};

  // Logout
  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider'
    );
  }

  return context;
}