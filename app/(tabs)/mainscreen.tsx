// app/(tabs)/mainscreen.tsx - Real-time name updates ile güncellenmiş

import { ResponsiveStyles } from '@/constants/ResponsiveTheme';
import { Colors, GlobalStyles } from '@/constants/Theme';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { getFlagImage } from '@/utils/helpers';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { CONFIG } from '@/constants/Config';

interface ProgressStats {
  totalScore: number;
  completedLevels: number;
  completedExercises: number;
  categoriesStarted: number;
}

interface TodayActivity {
  exercisesCompleted: number;
  pointsEarned: number;
  levelsCompleted: number;
  timeSpent: number;
}

export default function MainScreen() {
  const { user, loading, getFirebaseToken } = useAuth();
  const router = useRouter();
  const layout = useResponsiveLayout();
  const { sourceLang, targetLang } = useLanguage();
  const [isMounted, setIsMounted] = useState(false);
  const [progressStats, setProgressStats] = useState<ProgressStats | null>(null);
  const [todayActivity, setTodayActivity] = useState<TodayActivity | null>(null);
  const [progressLoading, setProgressLoading] = useState(false);

  // Real-time user name - will update when user changes name in profile
  const [userName, setUserName] = useState(user?.displayName || user?.email?.split('@')[0] || '');

  const API_BASE_URL = CONFIG.API_BASE_URL;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && !user && isMounted) {
      const timer = setTimeout(() => {
        router.replace('/');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [user, loading, isMounted, router]);

  // Update user name when user object changes (real-time sync)
  useEffect(() => {
    if (user) {
      const newName = user.displayName || user.email?.split('@')[0] || '';
      setUserName(newName);
      console.log('👤 User name updated in MainScreen:', newName);
    }
  }, [user?.displayName, user?.email]);

  // Load progress when screen focuses (after completing exercises)
  useFocusEffect(
    React.useCallback(() => {
      if (isMounted && user && !loading) {
        console.log('🏠 Main screen focused, loading progress...');
        loadUserProgress();
      }
    }, [isMounted, user, loading])
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

  const loadUserProgress = async () => {
    if (!isMounted) return;

    setProgressLoading(true);
    try {
      console.log(`📊 Loading user progress for ${targetLang}...`);

      // Get overall stats
      try {
        console.log('🔍 Fetching stats endpoint...');
        const statsData = await makeRequest(`/progress/${targetLang}/stats`);
        if (statsData.success) {
          setProgressStats(statsData.stats);
          console.log('✅ Progress stats loaded:', statsData.stats);
        } else {
          console.log('⚠️ Stats request failed:', statsData);
        }
      } catch (error) {
        console.log('❌ Stats endpoint error:', error.message);
        // Try to get stats from individual categories as fallback
        try {
          console.log('🔄 Trying fallback: loading individual category progress...');

          const categories = ['vocabulary', 'grammar', 'filltheblanks', 'imagebased', 'sentences'];
          let totalScore = 0;
          let completedLevels = 0;
          let completedExercises = 0;
          let categoriesStarted = 0;

          for (const category of categories) {
            try {
              const categoryData = await makeRequest(`/progress/${targetLang}/${category}`);
              if (categoryData.success && categoryData.progress) {
                const progress = categoryData.progress;
                totalScore += progress.totalScore || 0;
                completedLevels += progress.completedLevels?.length || 0;
                completedExercises += progress.completedExercises || 0;
                if (progress.completedExercises > 0 || progress.currentLevel > 1) {
                  categoriesStarted++;
                }
              }
            } catch (catError) {
              console.log(`⚠️ Failed to load ${category}:`, catError.message);
            }
          }

          setProgressStats({
            totalScore,
            completedLevels,
            completedExercises,
            categoriesStarted
          });

          console.log('✅ Fallback stats calculated:', {
            totalScore,
            completedLevels,
            completedExercises,
            categoriesStarted
          });

        } catch (fallbackError) {
          console.log('❌ Fallback also failed:', fallbackError.message);
          setProgressStats({
            totalScore: 0,
            completedLevels: 0,
            completedExercises: 0,
            categoriesStarted: 0
          });
        }
      }

      // Get today's activity
      try {
        console.log('🔍 Fetching today endpoint...');
        const todayData = await makeRequest(`/progress/${targetLang}/today`);
        if (todayData.success) {
          setTodayActivity(todayData.activity);
          console.log('✅ Today activity loaded:', todayData.activity);
        } else {
          console.log('⚠️ Today request failed:', todayData);
        }
      } catch (error) {
        console.log('❌ Today endpoint error:', error.message);
        // Create today activity from progress stats if available
        if (progressStats) {
          const mockTodayActivity = {
            exercisesCompleted: Math.min(progressStats.completedExercises, 10),
            pointsEarned: Math.min(progressStats.totalScore, 200),
            levelsCompleted: Math.min(progressStats.completedLevels, 3),
            timeSpent: Math.min(progressStats.completedExercises * 2, 30)
          };
          setTodayActivity(mockTodayActivity);
          console.log('✅ Mock today activity created:', mockTodayActivity);
        } else {
          setTodayActivity({
            exercisesCompleted: 0,
            pointsEarned: 0,
            levelsCompleted: 0,
            timeSpent: 0
          });
        }
      }

    } catch (error: any) {
      console.error('❌ Critical error loading progress:', error);
      // Set default values on error
      setProgressStats({
        totalScore: 0,
        completedLevels: 0,
        completedExercises: 0,
        categoriesStarted: 0
      });
      setTodayActivity({
        exercisesCompleted: 0,
        pointsEarned: 0,
        levelsCompleted: 0,
        timeSpent: 0
      });
    } finally {
      if (isMounted) {
        setProgressLoading(false);
      }
    }
  };

  if (loading || !isMounted || !user) {
    return null;
  }

  const containerStyle = layout.isWeb ?
    ResponsiveStyles.webContainer :
    GlobalStyles.container;

  const cardStyle = layout.isWeb ?
    { ...ResponsiveStyles.webCard, minHeight: '80vh' } :
    GlobalStyles.whiteBackgroundContainer;

  const learningActivities = [
    {
      title: 'Vocabulary',
      subtitle: 'Learn new words',
      icon: 'book-outline',
      color: '#FF6B6B',
      category: 'vocabulary'
    },
    {
      title: 'Grammar',
      subtitle: 'Master grammar rules',
      icon: 'library-outline',
      color: '#4ECDC4',
      category: 'grammar'
    },
    {
      title: 'Fill the Blanks',
      subtitle: 'Complete sentences',
      icon: 'create-outline',
      color: '#45B7D1',
      category: 'filltheblanks'
    },
    {
      title: 'Image Based',
      subtitle: 'Visual learning',
      icon: 'image-outline',
      color: '#FFA726',
      category: 'imagebased'
    },
    {
      title: 'Sentences',
      subtitle: 'Build sentences',
      icon: 'chatbubble-outline',
      color: '#AB47BC',
      category: 'sentences'
    }
  ];

  const handleActivityPress = (category: string) => {
    console.log(`🎯 Navigating to exercises with category: ${category}`);
    router.push(`/(tabs)/exercises?selectedCategory=${category}`);
  };

  // Calculate progress percentage based on today's activity
  const todayTargetExercises = 10;
  const progressPercentage = todayActivity ? Math.min((todayActivity.exercisesCompleted / todayTargetExercises) * 100, 100) : 0;

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
          {/* Header with Dynamic User Name */}
          <View style={[
            GlobalStyles.headerContainer,
            layout.isWeb && { paddingHorizontal: 0, marginBottom: 30 }
          ]}>
            <View style={{ width: 24 }} />
            <Text style={[
              GlobalStyles.headerText,
              layout.isWeb && ResponsiveStyles.webTitle
            ]}>
              Learn {targetLang?.toUpperCase()}
            </Text>
            <TouchableOpacity
              style={GlobalStyles.settingsButton}
              onPress={() => router.push('/(tabs)/settings')}
            >
              <Ionicons name="settings-outline" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Welcome Message with Real-time Name */}
          <View style={{
            backgroundColor: '#e8f5e8',
            borderRadius: 16,
            padding: 20,
            marginBottom: 30,
            marginHorizontal: layout.isWeb ? 0 : 20,
            alignItems: 'center'
          }}>
            <Ionicons name="person-circle-outline" size={48} color="#4caf50" style={{ marginBottom: 12 }} />
            <Text style={{
              fontSize: 22,
              fontWeight: '600',
              color: '#2e7d32',
              textAlign: 'center',
              marginBottom: 8
            }}>
              Welcome back, {userName}! 🎉
            </Text>
            <Text style={{
              fontSize: 14,
              color: '#388e3c',
              textAlign: 'center',
              lineHeight: 20
            }}>
              Ready to continue your language learning journey?
            </Text>
          </View>

          {/* Language Display */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 30,
            paddingHorizontal: 20,
            paddingVertical: 16,
            backgroundColor: '#f8f9fa',
            borderRadius: 12,
            marginHorizontal: layout.isWeb ? 0 : 20
          }}>
            <View style={{ alignItems: 'center' }}>
              <Image
                source={getFlagImage(sourceLang) || require('@/assets/images/flags/tr.png')}
                style={{ width: 40, height: 40, borderRadius: 20, marginBottom: 8 }}
              />
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#666' }}>
                {sourceLang?.toUpperCase()}
              </Text>
            </View>

            <Ionicons name="arrow-forward" size={24} color="#666" style={{ marginHorizontal: 20 }} />

            <View style={{ alignItems: 'center' }}>
              <Image
                source={getFlagImage(targetLang) || require('@/assets/images/flags/eng.png')}
                style={{ width: 40, height: 40, borderRadius: 20, marginBottom: 8 }}
              />
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#666' }}>
                {targetLang?.toUpperCase()}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => router.push('/language-selection')}
              style={{ marginLeft: 20 }}
            >
              <Ionicons name="swap-horizontal" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>

          {/* Progress Section - Real Data */}
          <View style={{
            backgroundColor: '#e3f2fd',
            padding: 20,
            borderRadius: 12,
            marginHorizontal: layout.isWeb ? 0 : 20,
            marginBottom: 30
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#1976d2' }}>
                Today's Progress
              </Text>
              {progressLoading && (
                <ActivityIndicator size="small" color="#1976d2" />
              )}
            </View>

            <Text style={{ fontSize: 14, color: '#666', marginBottom: 12 }}>
              {todayActivity?.exercisesCompleted ?
                `Great job, ${userName}! Keep up your learning streak!` :
                `Start your learning journey today, ${userName}!`
              }
            </Text>

            {/* Progress Bar */}
            <View style={{
              backgroundColor: '#bbdefb',
              height: 8,
              borderRadius: 4,
              overflow: 'hidden',
              marginBottom: 8
            }}>
              <View style={{
                backgroundColor: '#1976d2',
                height: '100%',
                width: `${progressPercentage}%`,
                borderRadius: 4
              }} />
            </View>

            <Text style={{ fontSize: 12, color: '#666', marginBottom: 12 }}>
              {todayActivity?.exercisesCompleted || 0} of {todayTargetExercises} exercises completed
            </Text>

            {/* Today's Stats Row */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1976d2' }}>
                  {todayActivity?.pointsEarned || 0}
                </Text>
                <Text style={{ fontSize: 10, color: '#666' }}>XP Earned</Text>
              </View>

              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1976d2' }}>
                  {todayActivity?.levelsCompleted || 0}
                </Text>
                <Text style={{ fontSize: 10, color: '#666' }}>Levels Done</Text>
              </View>

              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1976d2' }}>
                  {todayActivity?.timeSpent || 0}m
                </Text>
                <Text style={{ fontSize: 10, color: '#666' }}>Time Spent</Text>
              </View>

              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1976d2' }}>
                  {progressStats?.totalScore || 0}
                </Text>
                <Text style={{ fontSize: 10, color: '#666' }}>Total XP</Text>
              </View>
            </View>
          </View>

          {/* Learning Activities Grid */}
          <View style={{
            paddingHorizontal: layout.isWeb ? 0 : 20
          }}>
            <Text style={{
              fontSize: 20,
              fontWeight: '600',
              color: Colors.text,
              marginBottom: 20
            }}>
              Learning Activities
            </Text>

            <View style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              gap: layout.isWeb ? 20 : 15
            }}>
              {learningActivities.map((activity, index) => (
                <TouchableOpacity
                  key={index}
                  style={{
                    width: layout.isWeb ? 'calc(50% - 10px)' : '48%',
                    backgroundColor: '#fff',
                    borderRadius: 16,
                    padding: 20,
                    marginBottom: 15,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 3,
                    borderWidth: 1,
                    borderColor: '#f0f0f0'
                  }}
                  onPress={() => handleActivityPress(activity.category)}
                >
                  <View style={{
                    width: 50,
                    height: 50,
                    backgroundColor: activity.color + '20',
                    borderRadius: 25,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 15
                  }}>
                    <Ionicons name={activity.icon} size={24} color={activity.color} />
                  </View>

                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: Colors.text,
                    marginBottom: 4
                  }}>
                    {activity.title}
                  </Text>

                  <Text style={{
                    fontSize: 12,
                    color: '#666'
                  }}>
                    {activity.subtitle}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Daily Challenge - Updated with real data and user name */}
          <View style={{
            backgroundColor: '#fff3e0',
            padding: 20,
            borderRadius: 12,
            marginHorizontal: layout.isWeb ? 0 : 20,
            marginTop: 20,
            borderLeft: '4px solid #ff9800'
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Ionicons name="trophy-outline" size={20} color="#ff9800" />
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#e65100',
                marginLeft: 8
              }}>
                Daily Challenge for {userName}
              </Text>
            </View>
            <Text style={{ fontSize: 14, color: '#bf360c', marginBottom: 12 }}>
              {(todayActivity?.exercisesCompleted || 0) >= 5 ?
                `🎉 Challenge completed, ${userName}! You've done ${todayActivity?.exercisesCompleted} exercises today!` :
                `Complete 5 vocabulary exercises today, ${userName}! (${todayActivity?.exercisesCompleted || 0}/5)`
              }
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: (todayActivity?.exercisesCompleted || 0) >= 5 ? '#4caf50' : '#ff9800',
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
                alignSelf: 'flex-start'
              }}
              onPress={() => handleActivityPress('vocabulary')}
            >
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>
                {(todayActivity?.exercisesCompleted || 0) >= 5 ? 'Keep Learning!' : 'Start Challenge'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}