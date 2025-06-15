// context/ProgressContext.tsx - Kullanıcı ilerlemesi yönetimi

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { CONFIG } from '@/constants/Config';

interface UserStats {
  totalPoints: number;
  completedLevels: number;
  completedExercises: number;
  streak: number;
  todayProgress: {
    exercisesCompleted: number;
    pointsEarned: number;
    target: number;
  };
  categories: Array<{
    category: string;
    unlockedLevel: number;
    totalPoints: number;
    completedLevels: number;
  }>;
}

interface ProgressContextType {
  userStats: UserStats | null;
  loading: boolean;
  error: string | null;

  // Functions
  loadUserStats: () => Promise<void>;
  updateProgress: (category: string, pointsEarned: number) => void;
  refreshProgress: () => Promise<void>;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const API_BASE_URL = CONFIG.API_BASE_URL;

  useEffect(() => {
    if (user) {
      loadUserStats();
    }
  }, [user]);

  const makeRequest = async (url: string, options: any = {}) => {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Request failed');
      }

      return await response.json();
    } catch (error: any) {
      console.error('API Request failed:', error);
      throw error;
    }
  };

  const loadUserStats = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      console.log('📊 Loading user stats...');

      const data = await makeRequest('/progress/user/stats');

      if (data.success && data.stats) {
        // Calculate today's progress
        const today = new Date().toDateString();
        const todayExercises = data.stats.todayExercises || 0;
        const todayPoints = data.stats.todayPoints || 0;

        setUserStats({
          totalPoints: data.stats.totalPoints || 0,
          completedLevels: data.stats.totalCompletedLevels || 0,
          completedExercises: data.stats.totalCompletedExercises || 0,
          streak: data.stats.streak || 0,
          todayProgress: {
            exercisesCompleted: todayExercises,
            pointsEarned: todayPoints,
            target: 10 // Daily target
          },
          categories: data.stats.categories || []
        });

        console.log('✅ User stats loaded successfully');
      } else {
        throw new Error('Invalid stats data received');
      }

    } catch (error: any) {
      console.error('❌ Failed to load user stats:', error);
      setError(error.message);

      // Set default stats for new users
      setUserStats({
        totalPoints: 0,
        completedLevels: 0,
        completedExercises: 0,
        streak: 0,
        todayProgress: {
          exercisesCompleted: 0,
          pointsEarned: 0,
          target: 10
        },
        categories: []
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = (category: string, pointsEarned: number) => {
    if (!userStats) return;

    setUserStats(prev => {
      if (!prev) return prev;

      return {
        ...prev,
        totalPoints: prev.totalPoints + pointsEarned,
        completedExercises: prev.completedExercises + 1,
        todayProgress: {
          ...prev.todayProgress,
          exercisesCompleted: prev.todayProgress.exercisesCompleted + 1,
          pointsEarned: prev.todayProgress.pointsEarned + pointsEarned
        }
      };
    });
  };

  const refreshProgress = async () => {
    await loadUserStats();
  };

  return (
    <ProgressContext.Provider value={{
      userStats,
      loading,
      error,
      loadUserStats,
      updateProgress,
      refreshProgress
    }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}