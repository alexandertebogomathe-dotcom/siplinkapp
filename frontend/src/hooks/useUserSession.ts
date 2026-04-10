import { useState, useCallback } from 'react';

interface UseUserSession {
  user: string | null;
  showNamePrompt: boolean;
  tempName: string;
  error: string | null;
  saveName: (name: string) => void;
  logout: () => void;
  setTempName: (name: string) => void;
  setUser: (name: string) => void;
}

/**
 * Hook for managing user session and authentication
 * Persists user data to localStorage
 * CRITICAL: Normalizes all names to lowercase
 */
export function useUserSession(): UseUserSession {
  const normalizeNorm = (name: string): string => {
    return name.trim().toLowerCase();
  };

  const [currentUser, setCurrentUserState] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('userName');
      return stored ? normalizeNorm(stored) : null;
    }
    return null;
  });

  const [tempName, setTempName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const saveName = useCallback((name: string) => {
    if (!name || name.trim().length === 0) {
      setError('Please enter a valid name');
      return;
    }

    // CRITICAL: Normalize name before storage
    const normalizedName = normalizeNorm(name);
    try {
      localStorage.setItem('userName', normalizedName);
      setCurrentUserState(normalizedName);
      setTempName('');
      setError(null);
    } catch (err) {
      setError('Failed to save name. Please try again.');
      console.error('Error saving name:', err);
    }
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem('userName');
      setCurrentUserState(null);
      setTempName('');
      setError(null);
    } catch (err) {
      console.error('Error during logout:', err);
    }
  }, []);

  const setCurrentUser = useCallback((name: string) => {
    // CRITICAL: Normalize when setting user directly
    const normalized = name.trim().toLowerCase();
    setCurrentUserState(normalized);
    localStorage.setItem('userName', normalized);
  }, []);

  return {
    user: currentUser,
    showNamePrompt: !currentUser,
    tempName,
    error,
    saveName,
    logout,
    setTempName,
    setUser: setCurrentUser
  };
}
