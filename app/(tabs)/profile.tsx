// app/(tabs)/profile.tsx - Real user data ile güncellenmiş

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Colors, GlobalStyles } from '@/constants/Theme';
import { ResponsiveStyles } from '@/constants/ResponsiveTheme';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter, useFocusEffect } from 'expo-router';

import { CONFIG } from '@/constants/Config';

interface UserStats {
  totalScore: number;
  completedLevels: number;
  completedExercises: number;
  categoriesStarted: number;
  lastActivity: number;
  streakDays: number;
}

interface TodayActivity {
  exercisesCompleted: number;
  pointsEarned: number;
  levelsCompleted: number;
  timeSpent: number;
}

export default function ProfileScreen() {
  const { user, loading: authLoading, getFirebaseToken } = useAuth();
  const { sourceLang, targetLang } = useLanguage();
  const router = useRouter();
  const layout = useResponsiveLayout();
  const [name, setName] = useState(user?.displayName || user?.email?.split('@')[0] || '');
  const [email] = useState(user?.email || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Real user stats from API
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [todayActivity, setTodayActivity] = useState<TodayActivity | null>(null);
  const [loading, setLoading] = useState(false);
  const [joinDate] = useState(user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString()
    : new Date().toLocaleDateString()
  );



  const API_BASE_URL = CONFIG.API_BASE_URL;


  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!authLoading && !user && isMounted) {
      const timer = setTimeout(() => {
        router.replace('/');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [user, authLoading, isMounted, router]);

  // Load user stats when screen focuses
  useFocusEffect(
    React.useCallback(() => {
      if (isMounted && user && !authLoading) {
        console.log('👤 Profile screen focused, loading user stats...');
        loadUserStats();
      }
    }, [isMounted, user, authLoading])
  );

  const makeRequest = async (url: string, options: any = {}) => {
    try {
      const token = await getFirebaseToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error(`❌ Request failed:`, error);
      throw error;
    }
  };

  const loadUserStats = async () => {
    if (!isMounted || !targetLang) return;

    setLoading(true);
    try {
      console.log(`📊 Loading user stats for ${targetLang}...`);

      // Get overall stats
      try {
        const statsData = await makeRequest(`/progress/${targetLang}/stats`);
        if (statsData.success) {
          setUserStats({
            ...statsData.stats,
            streakDays: calculateStreakDays(statsData.stats.lastActivity)
          });
          console.log('✅ User stats loaded:', statsData.stats);
        }
      } catch (error) {
        console.log('⚠️ Stats loading failed, using defaults');
        setUserStats({
          totalScore: 0,
          completedLevels: 0,
          completedExercises: 0,
          categoriesStarted: 0,
          lastActivity: Date.now(),
          streakDays: 0
        });
      }

      // Get today's activity
      try {
        const todayData = await makeRequest(`/progress/${targetLang}/today`);
        if (todayData.success) {
          setTodayActivity(todayData.activity);
          console.log('✅ Today activity loaded:', todayData.activity);
        }
      } catch (error) {
        console.log('⚠️ Today activity loading failed, using defaults');
        setTodayActivity({
          exercisesCompleted: 0,
          pointsEarned: 0,
          levelsCompleted: 0,
          timeSpent: 0
        });
      }

    } catch (error: any) {
      console.error('❌ Failed to load user stats:', error);
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  };

  const calculateStreakDays = (lastActivity: number): number => {
    const today = new Date();
    const lastActivityDate = new Date(lastActivity);
    const diffTime = Math.abs(today.getTime() - lastActivityDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // If last activity was today or yesterday, consider it a streak
    return diffDays <= 1 ? Math.max(1, 7 - diffDays) : 0;
  };

  const calculateLevel = (totalScore: number): number => {
    // Every 200 XP = 1 level
    return Math.floor(totalScore / 200) + 1;
  };

  const calculateLevelProgress = (totalScore: number): number => {
    // Progress within current level (0-100%)
    const progressInLevel = totalScore % 200;
    return Math.round((progressInLevel / 200) * 100);
  };

  const calculateXPToNextLevel = (totalScore: number): number => {
    const progressInLevel = totalScore % 200;
    return 200 - progressInLevel;
  };

  const handleSave = async () => {
    try {
      // In a real app, you would update the user's display name
      // For now, just show success message
      Alert.alert('Success', 'Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  if (authLoading || !isMounted) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 16, color: '#666' }}>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return null;
  }

  const currentLevel = userStats ? calculateLevel(userStats.totalScore) : 1;
  const levelProgress = userStats ? calculateLevelProgress(userStats.totalScore) : 0;
  const xpToNext = userStats ? calculateXPToNextLevel(userStats.totalScore) : 200;

  const containerStyle = layout.isWeb ?
    ResponsiveStyles.webContainer :
    GlobalStyles.container;

  const cardStyle = layout.isWeb ?
    { ...ResponsiveStyles.webCard, minHeight: '90vh' } :
    GlobalStyles.whiteBackgroundContainer;

  return (
    <View style={containerStyle}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: layout.isWeb ? 40 : 100
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={cardStyle}>
          {/* Header */}
          <View style={[
            GlobalStyles.headerContainer,
            layout.isWeb && { paddingHorizontal: 0, marginBottom: 30 }
          ]}>
            <TouchableOpacity
              style={GlobalStyles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={[
              GlobalStyles.headerText,
              layout.isWeb && ResponsiveStyles.webTitle
            ]}>
              Profile
            </Text>
            <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
              <Ionicons
                name={isEditing ? "checkmark" : "create-outline"}
                size={24}
                color="#007AFF"
              />
            </TouchableOpacity>
          </View>

          <View style={{ paddingHorizontal: layout.isWeb ? 0 : 20 }}>
            {/* Profile Header */}
            <View style={{
              backgroundColor: '#f8f9fa',
              borderRadius: 20,
              padding: 24,
              marginBottom: 24,
              alignItems: 'center'
            }}>
              <View style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: Colors.primary + '20',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4
              }}>
                <Ionicons name="person" size={50} color={Colors.primary} />
              </View>

              <Text style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: Colors.text,
                marginBottom: 4
              }}>
                {name || user?.email?.split('@')[0] || 'User'}
              </Text>

              <View style={{
                backgroundColor: Colors.primary + '20',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
                marginBottom: 8
              }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: Colors.primary
                }}>
                  Level {currentLevel}
                </Text>
              </View>

              <Text style={{
                fontSize: 16,
                color: '#666',
                marginBottom: 16
              }}>
                Learning {sourceLang?.toUpperCase()} → {targetLang?.toUpperCase()}
              </Text>

              {/* XP Bar */}
              <View style={{
                width: '100%',
                backgroundColor: '#e0e0e0',
                height: 8,
                borderRadius: 4,
                overflow: 'hidden',
                marginBottom: 8
              }}>
                <View style={{
                  backgroundColor: Colors.primary,
                  height: '100%',
                  width: `${levelProgress}%`,
                  borderRadius: 4
                }} />
              </View>

              <Text style={{
                fontSize: 12,
                color: '#666'
              }}>
                {userStats?.totalScore || 0} XP • {xpToNext} XP to next level
              </Text>
            </View>

            {/* Loading Stats */}
            {loading ? (
              <View style={{ alignItems: 'center', padding: 40 }}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={{ marginTop: 16, color: '#666' }}>Loading your progress...</Text>
              </View>
            ) : (
              <>
                {/* Stats Grid */}
                <View style={{ marginBottom: 24 }}>
                  <Text style={{
                    fontSize: 18,
                    fontWeight: '600',
                    color: Colors.text,
                    marginBottom: 16
                  }}>
                    Learning Progress
                  </Text>

                  <View style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    gap: 12
                  }}>
                    {[
                      {
                        icon: 'checkmark-circle-outline',
                        label: 'Exercises',
                        value: userStats?.completedExercises || 0,
                        color: '#4caf50'
                      },
                      {
                        icon: 'trophy-outline',
                        label: 'Levels',
                        value: userStats?.completedLevels || 0,
                        color: '#2196f3'
                      },
                      {
                        icon: 'flame-outline',
                        label: 'Day Streak',
                        value: userStats?.streakDays || 0,
                        color: '#ff9800'
                      },
                      {
                        icon: 'star-outline',
                        label: 'Total XP',
                        value: userStats?.totalScore || 0,
                        color: '#9c27b0'
                      }
                    ].map((stat, index) => (
                      <View key={index} style={{
                        width: layout.isWeb ? 'calc(50% - 6px)' : '48%',
                        backgroundColor: '#fff',
                        borderRadius: 12,
                        padding: 16,
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: '#f0f0f0',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 2
                      }}>
                        <View style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: stat.color + '20',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginBottom: 8
                        }}>
                          <Ionicons name={stat.icon} size={20} color={stat.color} />
                        </View>
                        <Text style={{
                          fontSize: 24,
                          fontWeight: 'bold',
                          color: stat.color,
                          marginBottom: 4
                        }}>
                          {stat.value}
                        </Text>
                        <Text style={{
                          fontSize: 12,
                          color: '#666',
                          textAlign: 'center'
                        }}>
                          {stat.label}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Today's Activity */}
                {todayActivity && (
                  <View style={{ marginBottom: 24 }}>
                    <Text style={{
                      fontSize: 18,
                      fontWeight: '600',
                      color: Colors.text,
                      marginBottom: 16
                    }}>
                      Today's Activity
                    </Text>

                    <View style={{
                      backgroundColor: '#e3f2fd',
                      borderRadius: 12,
                      padding: 16
                    }}>
                      <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-around',
                        alignItems: 'center'
                      }}>
                        <View style={{ alignItems: 'center' }}>
                          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1976d2' }}>
                            {todayActivity.exercisesCompleted}
                          </Text>
                          <Text style={{ fontSize: 12, color: '#666' }}>Exercises</Text>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1976d2' }}>
                            {todayActivity.pointsEarned}
                          </Text>
                          <Text style={{ fontSize: 12, color: '#666' }}>XP Earned</Text>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1976d2' }}>
                            {todayActivity.timeSpent}m
                          </Text>
                          <Text style={{ fontSize: 12, color: '#666' }}>Time</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                )}
              </>
            )}

            {/* Profile Form */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{
                fontSize: 18,
                fontWeight: '600',
                color: Colors.text,
                marginBottom: 16
              }}>
                Personal Information
              </Text>

              <View style={{
                backgroundColor: '#fff',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#f0f0f0',
                overflow: 'hidden'
              }}>
                <View style={{
                  padding: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: '#f0f0f0'
                }}>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: Colors.text,
                    marginBottom: 8
                  }}>
                    Display Name
                  </Text>
                  <TextInput
                    style={{
                      fontSize: 16,
                      color: isEditing ? Colors.text : '#666',
                      backgroundColor: isEditing ? '#f8f9fa' : 'transparent',
                      padding: isEditing ? 12 : 0,
                      borderRadius: isEditing ? 8 : 0,
                      borderWidth: isEditing ? 1 : 0,
                      borderColor: '#e0e0e0'
                    }}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your display name"
                    editable={isEditing}
                  />
                </View>

                <View style={{
                  padding: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: '#f0f0f0'
                }}>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: Colors.text,
                    marginBottom: 8
                  }}>
                    Email Address
                  </Text>
                  <Text style={{
                    fontSize: 16,
                    color: '#666'
                  }}>
                    {email}
                  </Text>
                </View>

                <View style={{ padding: 16 }}>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: Colors.text,
                    marginBottom: 8
                  }}>
                    Member Since
                  </Text>
                  <Text style={{
                    fontSize: 16,
                    color: '#666'
                  }}>
                    {joinDate}
                  </Text>
                </View>
              </View>

              {isEditing && (
                <TouchableOpacity
                  style={{
                    backgroundColor: Colors.primary,
                    padding: 16,
                    borderRadius: 12,
                    alignItems: 'center',
                    marginTop: 16
                  }}
                  onPress={handleSave}
                >
                  <Text style={{
                    color: '#fff',
                    fontSize: 16,
                    fontWeight: '600'
                  }}>
                    Save Changes
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Categories Progress */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{
                fontSize: 18,
                fontWeight: '600',
                color: Colors.text,
                marginBottom: 16
              }}>
                Categories Progress
              </Text>

              <View style={{
                backgroundColor: '#fff',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#f0f0f0',
                overflow: 'hidden'
              }}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 16
                }}>
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: '#4caf50' + '20',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12
                  }}>
                    <Ionicons name="library-outline" size={20} color="#4caf50" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: Colors.text,
                      marginBottom: 2
                    }}>
                      Categories Started
                    </Text>
                    <Text style={{
                      fontSize: 14,
                      color: '#666'
                    }}>
                      Exploring different learning paths
                    </Text>
                  </View>
                  <Text style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                    color: '#4caf50'
                  }}>
                    {userStats?.categoriesStarted || 0}
                  </Text>
                </View>
              </View>
            </View>



          </View>
        </View>
      </ScrollView>
    </View>
  );
}