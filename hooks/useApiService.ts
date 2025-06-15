// 5. hooks/useApiService.ts - API Service Hook
import { useState, useCallback } from 'react';
import { apiService, Exercise, UserProgress } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export function useApiService() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getFirebaseToken } = useAuth();

  const withAuth = useCallback(async <T>(operation: () => Promise<T>): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const token = await getFirebaseToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      // Token'ı apiService'e geçir
      (apiService as any).token = token;

      const result = await operation();
      return result;
    } catch (err: any) {
      console.error('API operation failed:', err);
      setError(err.message || 'Operation failed');
      return null;
    } finally {
      setLoading(false);
    }
  }, [getFirebaseToken]);

  const getExercises = useCallback(async (language: string, category: string, level: number) => {
    return withAuth(() => apiService.getExercises(language, category, level));
  }, [withAuth]);

  const submitAnswer = useCallback(async (
    exerciseId: string,
    selectedAnswer: string,
    language: string,
    category: string,
    level: number
  ) => {
    return withAuth(() => apiService.submitAnswer(exerciseId, selectedAnswer, language, category, level));
  }, [withAuth]);

  const completeLevel = useCallback(async (language: string, category: string, level: number) => {
    return withAuth(() => apiService.completeLevel(language, category, level));
  }, [withAuth]);

  const getUserProgress = useCallback(async (language: string) => {
    return withAuth(() => apiService.getUserProgress(language));
  }, [withAuth]);

  const getUserStats = useCallback(async () => {
    return withAuth(() => apiService.getUserStats());
  }, [withAuth]);

  return {
    loading,
    error,
    getExercises,
    submitAnswer,
    completeLevel,
    getUserProgress,
    getUserStats
  };
}