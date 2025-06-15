// context/AuthContext.tsx - Mevcut bağlantıları koruyarak isim güncelleme eklendi

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { auth } from '../config/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  getFirebaseToken: () => Promise<string | null>;
  // YENİ EKLENENLER - Mevcut kodları bozmayacak
  updateDisplayName: (newName: string) => Promise<void>;
  updateUserProfile: (profileData: { displayName?: string; photoURL?: string }) => Promise<void>;
  updateUserEmail: (newEmail: string, currentPassword: string) => Promise<void>;
  updateUserPassword: (currentPassword: string, newPassword: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔥 Setting up Firebase auth listener...');

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('🔥 Auth state changed:', firebaseUser ? 'User logged in' : 'No user');

      if (firebaseUser) {
        console.log('✅ User authenticated:', firebaseUser.email);
        console.log('👤 Display Name:', firebaseUser.displayName);
        setUser(firebaseUser);
      } else {
        console.log('❌ No user authenticated');
        setUser(null);
      }

      setLoading(false);
    });

    return () => {
      console.log('🔥 Cleaning up auth listener');
      unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      console.log('🔐 Attempting login with:', email);
      setLoading(true);

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Login successful for:', userCredential.user.email);

      // User state will be updated by onAuthStateChanged
    } catch (error: any) {
      console.error('❌ Login error:', error);

      // Transform Firebase errors to user-friendly messages
      let friendlyError = new Error('Login failed. Please try again.');

      switch (error.code) {
        case 'auth/user-not-found':
          friendlyError = new Error('No account found with this email address.');
          friendlyError.code = 'auth/user-not-found';
          break;
        case 'auth/wrong-password':
          friendlyError = new Error('Incorrect password. Please try again.');
          friendlyError.code = 'auth/wrong-password';
          break;
        case 'auth/invalid-email':
          friendlyError = new Error('Invalid email address format.');
          friendlyError.code = 'auth/invalid-email';
          break;
        case 'auth/user-disabled':
          friendlyError = new Error('This account has been disabled.');
          friendlyError.code = 'auth/user-disabled';
          break;
        case 'auth/too-many-requests':
          friendlyError = new Error('Too many failed attempts. Please wait before trying again.');
          friendlyError.code = 'auth/too-many-requests';
          break;
        case 'auth/network-request-failed':
          friendlyError = new Error('Network error. Please check your internet connection.');
          friendlyError.code = 'auth/network-request-failed';
          break;
        case 'auth/invalid-credential':
          friendlyError = new Error('Invalid email or password. Please check your credentials.');
          friendlyError.code = 'auth/invalid-credential';
          break;
        default:
          friendlyError.message = error.message || 'An unexpected error occurred during login.';
          friendlyError.code = error.code;
      }

      setLoading(false);
      throw friendlyError;
    }
  };

  const register = async (email: string, password: string, name?: string): Promise<void> => {
    try {
      console.log('👤 Attempting registration with:', email);
      setLoading(true);

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('✅ Registration successful for:', userCredential.user.email);

      // Update user profile with display name if provided
      if (name && userCredential.user) {
        try {
          await updateProfile(userCredential.user, {
            displayName: name
          });
          console.log('✅ Profile updated with name:', name);
        } catch (profileError) {
          console.log('⚠️ Failed to update profile name:', profileError);
          // Don't throw error for profile update failure
        }
      }

      // User state will be updated by onAuthStateChanged
    } catch (error: any) {
      console.error('❌ Registration error:', error);

      // Transform Firebase errors to user-friendly messages
      let friendlyError = new Error('Registration failed. Please try again.');

      switch (error.code) {
        case 'auth/email-already-in-use':
          friendlyError = new Error('An account with this email already exists. Please use a different email or try logging in.');
          friendlyError.code = 'auth/email-already-in-use';
          break;
        case 'auth/invalid-email':
          friendlyError = new Error('Invalid email address format.');
          friendlyError.code = 'auth/invalid-email';
          break;
        case 'auth/operation-not-allowed':
          friendlyError = new Error('Email/password registration is currently disabled. Please contact support.');
          friendlyError.code = 'auth/operation-not-allowed';
          break;
        case 'auth/weak-password':
          friendlyError = new Error('Password is too weak. Please choose a stronger password.');
          friendlyError.code = 'auth/weak-password';
          break;
        case 'auth/network-request-failed':
          friendlyError = new Error('Network error. Please check your internet connection.');
          friendlyError.code = 'auth/network-request-failed';
          break;
        case 'auth/too-many-requests':
          friendlyError = new Error('Too many registration attempts. Please wait before trying again.');
          friendlyError.code = 'auth/too-many-requests';
          break;
        default:
          friendlyError.message = error.message || 'An unexpected error occurred during registration.';
          friendlyError.code = error.code;
      }

      setLoading(false);
      throw friendlyError;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log('🚪 Attempting logout...');
      setLoading(true);

      await signOut(auth);
      console.log('✅ Logout successful');

      // User state will be updated by onAuthStateChanged
    } catch (error: any) {
      console.error('❌ Logout error:', error);
      setLoading(false);
      throw new Error('Failed to logout. Please try again.');
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      console.log('📧 Sending password reset email to:', email);

      await sendPasswordResetEmail(auth, email);
      console.log('✅ Password reset email sent successfully');

    } catch (error: any) {
      console.error('❌ Password reset error:', error);

      // Transform Firebase errors to user-friendly messages
      let friendlyError = new Error('Failed to send password reset email. Please try again.');

      switch (error.code) {
        case 'auth/user-not-found':
          friendlyError = new Error('No account found with this email address.');
          break;
        case 'auth/invalid-email':
          friendlyError = new Error('Invalid email address format.');
          break;
        case 'auth/too-many-requests':
          friendlyError = new Error('Too many requests. Please wait before trying again.');
          break;
        case 'auth/network-request-failed':
          friendlyError = new Error('Network error. Please check your internet connection.');
          break;
        default:
          friendlyError.message = error.message || 'An unexpected error occurred.';
      }

      throw friendlyError;
    }
  };

  const getFirebaseToken = async (): Promise<string | null> => {
    try {
      if (!user) {
        console.log('⚠️ No user available for token');
        return null;
      }

      const token = await user.getIdToken();
      console.log('🔑 Firebase token obtained successfully');
      return token;
    } catch (error) {
      console.error('❌ Failed to get Firebase token:', error);
      return null;
    }
  };

  // YENİ: İsim güncelleme işlevi (mevcut kodlarla uyumlu)
  const updateDisplayName = async (newName: string): Promise<void> => {
    try {
      if (!user) {
        throw new Error('No user is currently logged in.');
      }

      if (!newName.trim()) {
        throw new Error('Name cannot be empty.');
      }

      console.log('✏️ Updating display name to:', newName);
      setLoading(true);

      await updateProfile(user, {
        displayName: newName.trim()
      });

      // Force refresh user data to get updated profile
      await user.reload();

      console.log('✅ Display name updated successfully to:', newName);

      // Trigger a state update by manually setting the user
      // This ensures UI components get the updated displayName immediately
      setUser({ ...user });

    } catch (error: any) {
      console.error('❌ Update display name error:', error);
      setLoading(false);

      let friendlyError = new Error('Failed to update name. Please try again.');

      switch (error.code) {
        case 'auth/network-request-failed':
          friendlyError = new Error('Network error. Please check your internet connection.');
          break;
        case 'auth/too-many-requests':
          friendlyError = new Error('Too many requests. Please wait before trying again.');
          break;
        default:
          friendlyError.message = error.message || 'An unexpected error occurred while updating your name.';
      }

      throw friendlyError;
    } finally {
      setLoading(false);
    }
  };

  // YENİ: Genel profil güncelleme işlevi (profile.tsx için)
  const updateUserProfile = async (profileData: { displayName?: string; photoURL?: string }): Promise<void> => {
    try {
      if (!user) {
        throw new Error('No user is currently logged in.');
      }

      console.log('🔄 Updating user profile:', profileData);
      setLoading(true);

      await updateProfile(user, profileData);

      // Force refresh user data to get updated profile
      await user.reload();

      console.log('✅ User profile updated successfully');

      // Trigger a state update to ensure all components get updated data
      setUser({ ...user });

    } catch (error: any) {
      console.error('❌ Update profile error:', error);
      setLoading(false);

      let friendlyError = new Error('Failed to update profile. Please try again.');

      switch (error.code) {
        case 'auth/network-request-failed':
          friendlyError = new Error('Network error. Please check your internet connection.');
          break;
        case 'auth/too-many-requests':
          friendlyError = new Error('Too many requests. Please wait before trying again.');
          break;
        default:
          friendlyError.message = error.message || 'An unexpected error occurred while updating your profile.';
      }

      throw friendlyError;
    } finally {
      setLoading(false);
    }
  };

  // YENİ: Email güncelleme işlevi (re-authentication gerektirir)
  const updateUserEmail = async (newEmail: string, currentPassword: string): Promise<void> => {
    try {
      if (!user || !user.email) {
        throw new Error('No user is currently logged in.');
      }

      console.log('📧 Updating email from', user.email, 'to', newEmail);
      setLoading(true);

      // Re-authenticate user first
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      console.log('✅ Re-authentication successful');

      // Update email
      await updateEmail(user, newEmail);
      console.log('✅ Email updated successfully to:', newEmail);

    } catch (error: any) {
      console.error('❌ Update email error:', error);
      setLoading(false);

      let friendlyError = new Error('Failed to update email. Please try again.');

      switch (error.code) {
        case 'auth/wrong-password':
          friendlyError = new Error('Current password is incorrect.');
          break;
        case 'auth/email-already-in-use':
          friendlyError = new Error('This email is already in use by another account.');
          break;
        case 'auth/invalid-email':
          friendlyError = new Error('Invalid email address format.');
          break;
        case 'auth/requires-recent-login':
          friendlyError = new Error('Please log out and log back in before changing your email.');
          break;
        case 'auth/network-request-failed':
          friendlyError = new Error('Network error. Please check your internet connection.');
          break;
        default:
          friendlyError.message = error.message || 'An unexpected error occurred while updating your email.';
      }

      throw friendlyError;
    } finally {
      setLoading(false);
    }
  };

  // YENİ: Şifre güncelleme işlevi (re-authentication gerektirir)
  const updateUserPassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      if (!user || !user.email) {
        throw new Error('No user is currently logged in.');
      }

      console.log('🔐 Updating password for:', user.email);
      setLoading(true);

      // Re-authenticate user first
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      console.log('✅ Re-authentication successful');

      // Update password
      await updatePassword(user, newPassword);
      console.log('✅ Password updated successfully');

    } catch (error: any) {
      console.error('❌ Update password error:', error);
      setLoading(false);

      let friendlyError = new Error('Failed to update password. Please try again.');

      switch (error.code) {
        case 'auth/wrong-password':
          friendlyError = new Error('Current password is incorrect.');
          break;
        case 'auth/weak-password':
          friendlyError = new Error('New password is too weak. Please choose a stronger password.');
          break;
        case 'auth/requires-recent-login':
          friendlyError = new Error('Please log out and log back in before changing your password.');
          break;
        case 'auth/network-request-failed':
          friendlyError = new Error('Network error. Please check your internet connection.');
          break;
        default:
          friendlyError.message = error.message || 'An unexpected error occurred while updating your password.';
      }

      throw friendlyError;
    } finally {
      setLoading(false);
    }
  };

  // YENİ: Kullanıcı verilerini yenileme işlevi (real-time sync için)
  const refreshUser = async (): Promise<void> => {
    try {
      if (!user) {
        console.log('⚠️ No user to refresh');
        return;
      }

      console.log('🔄 Refreshing user data...');
      await user.reload();

      // Force state update to trigger re-render with fresh data across all components
      setUser({ ...user });

      console.log('✅ User data refreshed and synced across app');
    } catch (error) {
      console.error('❌ Failed to refresh user data:', error);
      // Don't throw error for refresh failure, it's not critical
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    resetPassword,
    getFirebaseToken,
    // YENİ işlevler - mevcut kodları bozmayacak
    updateDisplayName,
    updateUserProfile,
    updateUserEmail,
    updateUserPassword,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}