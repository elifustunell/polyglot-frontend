// services/api.js
import { auth } from '../config/firebase';

// Local development için IP adresinizi kontrol edin
const API_BASE_URL = __DEV__
  ? 'http://192.168.1.102:3000/api'  // Geliştirme
  : 'https://yourapi.com/api';        // Production

class ApiService {
  // Token al
  async getAuthToken() {
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        return token;
      }
      throw new Error('User not authenticated');
    } catch (error) {
      console.error('Error getting auth token:', error);
      throw error;
    }
  }

  // API isteği gönder
  async makeRequest(endpoint, options = {}) {
    try {
      let config = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      };

      // Sadece protected endpoint'ler için token ekle
      if (options.requireAuth !== false) {
        try {
          const token = await this.getAuthToken();
          config.headers.Authorization = `Bearer ${token}`;
        } catch (authError) {
          console.log('No auth token available, proceeding without auth');
        }
      }

      console.log(`Making request to: ${API_BASE_URL}${endpoint}`);
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Kullanıcı işlemleri
  async getUser() {
    return this.makeRequest('/users/me');
  }

  async updateUser(userData) {
    return this.makeRequest('/users/update', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async updateProgress(points) {
    return this.makeRequest('/users/progress', {
      method: 'PUT',
      body: JSON.stringify({ points })
    });
  }

  // Egzersiz işlemleri
  async getExercises(language, category, level) {
    return this.makeRequest(`/exercises/${language}/${category}/${level}`);
  }

  // Dil listesi (public endpoint)
  async getLanguages() {
    return this.makeRequest('/languages', { requireAuth: false });
  }

  // Ayarlar
  async updateSettings(settings) {
    return this.makeRequest('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  }

  // Sağlık kontrolü (public endpoint)
  async healthCheck() {
    return this.makeRequest('/health', { requireAuth: false });
  }
}

export default new ApiService();