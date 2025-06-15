// utils/api.ts - Güncellenmiş API Service
import { auth } from '../config/firebase';

//const API_BASE_URL = __DEV__ ? 'http://localhost:3000/api' : 'https://your-production-api.com/api';
import Constants from 'expo-constants';

const API_BASE_URL = Constants.manifest.extra.apiUrl;

interface ApiResponse<T> {
success: boolean;
data?: T;
message?: string;
}

interface Exercise {
_id: string;
language: string;
category: string;
level: number;
question: string;
options: string[];
imageUrl?: string;
points: number;
explanation?: string;
}

interface UserProgress {
category: string;
currentLevel: number;
completedLevels: number[];
totalCorrectAnswers: number;
totalQuestions: number;
accuracyRate: number;
pointsEarned: number;
}

interface SubmitAnswerResponse {
isCorrect: boolean;
correctAnswer: string;
explanation?: string;
pointsEarned: number;
userProgress: {
totalCorrectAnswers: number;
totalQuestions: number;
accuracyRate: number;
currentLevel: number;
};
}

class ApiService {
private async getAuthHeaders() {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const token = await user.getIdToken();
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
    } catch (error) {
      console.error('Error getting auth headers:', error);
      throw new Error('Authentication failed');
    }
  }

  async getExercises(language: string, category: string, level: number): Promise<{
    exercises: Exercise[];
    currentLevel: number;
    totalLevels: number;
    userProgress: UserProgress | null;
  }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/exercises/${encodeURIComponent(language)}/${encodeURIComponent(category)}/${level}`,
        {
          method: 'GET',
          headers
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching exercises:', error);
      throw error;
    }
  }

  async submitAnswer(
    exerciseId: string,
    selectedAnswer: string,
    language: string,
    category: string,
    level: number
  ): Promise<SubmitAnswerResponse> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/exercises/submit`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          exerciseId,
          selectedAnswer,
          language,
          category,
          level
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error submitting answer:', error);
      throw error;
    }
  }

  async completeLevel(language: string, category: string, level: number): Promise<{
    message: string;
    completedLevel: number;
    nextLevel: number;
    isLastLevel: boolean;
  }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/exercises/complete-level`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          language,
          category,
          level
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error completing level:', error);
      throw error;
    }
  }

  async getUserProgress(language: string): Promise<{
    language: string;
    categories: UserProgress[];
  }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/progress/${encodeURIComponent(language)}`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user progress:', error);
      throw error;
    }
  }

  async registerUser(email: string, name: string, selectedLanguage: string) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          email,
          name,
          selectedLanguage
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }

  async getUserStats(): Promise<{
    totalPoints: number;
    streak: number;
    categoriesProgress: { [key: string]: UserProgress };
    overallAccuracy: number;
    totalQuestionsAnswered: number;
    totalCorrectAnswers: number;
  }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/users/stats`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }

  async getUser() {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
export type { Exercise, UserProgress, SubmitAnswerResponse };