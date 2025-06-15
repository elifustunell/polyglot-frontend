// app/(tabs)/exercises.tsx - Fixed level unlocking logic

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Animated } from 'react-native';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { Colors, GlobalStyles } from '@/constants/Theme';
import { ResponsiveStyles } from '@/constants/ResponsiveTheme';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CONFIG } from '@/constants/Config';

// Toast Component
const Toast = ({ message, type = 'info', visible, onHide, onAction, actionText }: {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  visible: boolean;
  onHide: () => void;
  onAction?: () => void;
  actionText?: string;
}) => {
  const translateY = new Animated.Value(-100);
  const opacity = new Animated.Value(0);

  const getToastColor = () => {
    switch (type) {
      case 'success': return '#4caf50';
      case 'error': return '#f44336';
      case 'warning': return '#ff9800';
      default: return '#2196f3';
    }
  };

  const getToastIcon = () => {
    switch (type) {
      case 'success': return 'checkmark-circle';
      case 'error': return 'close-circle';
      case 'warning': return 'warning';
      default: return 'information-circle';
    }
  };

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => onHide());
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 50,
        left: 20,
        right: 20,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 12,
        zIndex: 1000,
        borderLeftWidth: 6,
        borderLeftColor: getToastColor(),
        transform: [{ translateY }],
        opacity,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <View style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: getToastColor() + '20',
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 16,
        }}>
          <Ionicons
            name={getToastIcon()}
            size={22}
            color={getToastColor()}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 16,
            color: '#333',
            fontWeight: '500',
            lineHeight: 22,
            marginBottom: onAction ? 12 : 0,
          }}>
            {message}
          </Text>

          {onAction && actionText && (
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: getToastColor(),
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
                onPress={onAction}
              >
                <Ionicons name="arrow-back" size={14} color="#fff" style={{ marginRight: 6 }} />
                <Text style={{
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: '600',
                }}>
                  {actionText}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: '#f5f5f5',
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 8,
                }}
                onPress={onHide}
              >
                <Text style={{
                  color: '#666',
                  fontSize: 14,
                  fontWeight: '600',
                }}>
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {!onAction && (
          <TouchableOpacity
            onPress={onHide}
            style={{
              padding: 4,
              marginLeft: 8,
            }}
          >
            <Ionicons name="close" size={18} color="#666" />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

interface Progress {
  currentLevel: number;
  unlockedLevels: number[];
  totalScore: number;
  completedLevels: any[];
  completedExercises: number;
}

export default function ExercisesScreen() {
  const { sourceLang, targetLang } = useLanguage();
  const { user, loading: authLoading, getFirebaseToken } = useAuth();
  const router = useRouter();
  const layout = useResponsiveLayout();

  // URL parametrelerini al
  const { selectedCategory: urlSelectedCategory, refresh } = useLocalSearchParams();

  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State olarak selectedCategory, default 'vocabulary'
  const [selectedCategory, setSelectedCategory] = useState('vocabulary');

  // Toast state
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    actionText?: string;
    onAction?: () => void;
  }>({
    visible: false,
    message: '',
    type: 'info'
  });

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', actionText?: string, onAction?: () => void) => {
    setToast({ visible: true, message, type, actionText, onAction });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  const API_BASE_URL = CONFIG.API_BASE_URL;

  const categories = [
    {
      id: 'vocabulary',
      name: 'Vocabulary',
      icon: 'book-outline',
      color: '#4caf50',
      description: 'Learn new words and meanings',
      availableLevels: [1, 2, 3]
    },
    {
      id: 'grammar',
      name: 'Grammar',
      icon: 'school-outline',
      color: '#ff9800',
      description: 'Practice grammar rules',
      availableLevels: [1, 2, 3]
    },
    {
      id: 'filltheblanks',
      name: 'Fill the Blanks',
      icon: 'text-outline',
      color: '#2196f3',
      description: 'Complete sentences with missing words',
      availableLevels: [1, 2, 3]
    },
    {
      id: 'sentences',
      name: 'Sentences',
      icon: 'chatbubble-outline',
      color: '#9c27b0',
      description: 'Build and understand sentences',
      availableLevels: [1, 2]
    },
    {
      id: 'imagebased',
      name: 'Image Based',
      icon: 'image-outline',
      color: '#f44336',
      description: 'Learn with visual context',
      availableLevels: [1, 2]
    }
  ];

  // URL'den gelen category'yi ayarla
  useEffect(() => {
    if (urlSelectedCategory && typeof urlSelectedCategory === 'string') {
      console.log(`📋 Setting category from URL: ${urlSelectedCategory}`);
      setSelectedCategory(urlSelectedCategory);
    }
  }, [urlSelectedCategory]);

  // Progress'i yükle - refresh parametresi değiştiğinde de yeniden yükle
  useEffect(() => {
    if (user && targetLang && selectedCategory) {
      loadProgress();
    }
  }, [user, targetLang, selectedCategory, refresh]);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/');
    }
  }, [user, authLoading, router]);

  const makeRequest = async (url: string, options: any = {}) => {
    try {
      console.log(`🔥 Making request to: ${API_BASE_URL}${url}`);

      // Firebase token al
      const token = await getFirebaseToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      console.log('🔑 Firebase Token obtained for exercises');

      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers
        }
      });

      console.log(`📡 Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Error response: ${errorText}`);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log(`✅ Response data:`, data);
      return data;

    } catch (error: any) {
      console.error(`❌ Request failed:`, error);
      throw error;
    }
  };

  const loadProgress = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log(`📊 Loading progress for ${targetLang}/${selectedCategory}`);

      const data = await makeRequest(`/progress/${targetLang}/${selectedCategory}`);

      if (data.success && data.progress) {
        setProgress(data.progress);
        console.log('✅ Progress loaded successfully:', data.progress);

        const category = categories.find(c => c.id === selectedCategory);
        if (category) {
          showToast(
            `${category.name} loaded! ${category.availableLevels.length} levels available.`,
            'success'
          );
        }
      } else {
        throw new Error('Invalid progress data received');
      }

    } catch (error: any) {
      console.error('❌ Failed to load progress:', error);
      setError(error.message);

      // Development mode fallback with mock data
      if (__DEV__) {
        console.log('🔧 Using mock data for development');
        setProgress({
          currentLevel: 1,
          unlockedLevels: [1],
          totalScore: 0,
          completedLevels: [],
          completedExercises: 0
        });

        showToast(
          'Development mode: Using offline data. Some levels may not be available.',
          'warning'
        );
      } else {
        showToast(
          'Failed to connect to server. Please check your internet connection.',
          'error'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // İyileştirilmiş level unlocking logic
  const isLevelUnlocked = (level: number): boolean => {
    if (!progress) return false;

    // Level 1 her zaman unlocked
    if (level === 1) return true;

    // Diğer leveller için: önceki level tamamlanmış olmalı
    const previousLevel = level - 1;
    const isPreviousLevelCompleted = progress.completedLevels.some(
      (completedLevel: any) => completedLevel.level === previousLevel
    );

    console.log(`🔓 Level ${level} unlock check:`, {
      previousLevel,
      isPreviousLevelCompleted,
      completedLevels: progress.completedLevels,
      unlockedLevels: progress.unlockedLevels
    });

    return isPreviousLevelCompleted;
  };

  const handleLevelSelect = async (level: number) => {
    console.log(`🎯 Level ${level} selected for category ${selectedCategory}`);

    // Check if level is available for this category
    const category = categories.find(c => c.id === selectedCategory);
    if (category && !category.availableLevels.includes(level)) {
      showToast(
        `Level ${level} is not available for ${category.name} yet.`,
        'warning'
      );
      return;
    }

    // Check if level is completed (show retry option)
    const isCompleted = progress?.completedLevels.some(cl => cl.level === level);

    if (isCompleted) {
      // Level is completed - offer retry option
      Alert.alert(
        '🏆 Level Already Completed',
        `You have already completed Level ${level}. Would you like to retry it?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Retry Level',
            onPress: async () => {
              await resetAndStartLevel(level);
            }
          },
          {
            text: 'View Results',
            onPress: () => {
              // Navigate without reset - will show current progress
              navigateToLevel(level);
            }
          }
        ]
      );
      return;
    }

    // Check if level is unlocked
    if (!isLevelUnlocked(level)) {
      const previousLevel = level - 1;
      showToast(
        `Level ${level} is locked! Complete Level ${previousLevel} first.`,
        'warning'
      );
      return;
    }

    // Navigate to level normally
    navigateToLevel(level);
  };

  const resetAndStartLevel = async (level: number) => {
    setLoading(true);

    try {
      console.log(`🔄 Resetting level ${level} for retry...`);

      // Call backend to reset level
      const resetResponse = await makeRequest(`/progress/${targetLang}/${selectedCategory}/${level}/reset`, {
        method: 'POST'
      });

      if (resetResponse.success) {
        showToast(`Level ${level} reset successfully! Starting fresh...`, 'success');

        // Navigate to the level
        navigateToLevel(level);

        // Refresh progress after a short delay
        setTimeout(() => {
          loadProgress();
        }, 1000);

      } else {
        throw new Error(resetResponse.message || 'Reset failed');
      }

    } catch (error) {
      console.error('❌ Level reset failed:', error);
      showToast(`Failed to reset level: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const navigateToLevel = async (level: number) => {
    setLoading(true);

    try {
      // Check if exercises exist
      const checkData = await makeRequest(`/progress/${targetLang}/${selectedCategory}/${level}/exercises`);

      if (!checkData.success || !checkData.exercises || checkData.exercises.length === 0) {
        showToast(`No exercises found for Level ${level}.`, 'warning');
        return;
      }

      showToast(`Loading Level ${level} exercises...`, 'info');

      router.push({
        pathname: '/(tabs)/exercise-detail',
        params: {
          language: targetLang,
          category: selectedCategory,
          level: level.toString()
        }
      });

    } catch (error) {
      console.error('❌ Navigation failed:', error);
      showToast(`Failed to load Level ${level}.`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    console.log(`📋 Category changed to: ${categoryId}`);
    setSelectedCategory(categoryId);

    // Progress'i temizle, yeni category için yüklenecek
    setProgress(null);
    setError(null);

    const category = categories.find(c => c.id === categoryId);
    if (category) {
      showToast(
        `Switched to ${category.name}. ${category.availableLevels.length} levels available.`,
        'info'
      );
    }
  };

  if (authLoading) {
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

  const containerStyle = layout.isWeb ?
    ResponsiveStyles.webContainer :
    GlobalStyles.container;

  const cardStyle = layout.isWeb ?
    { ...ResponsiveStyles.webCard, minHeight: '90vh' } :
    GlobalStyles.whiteBackgroundContainer;

  const currentCategory = categories.find(c => c.id === selectedCategory);

  return (
    <View style={containerStyle}>
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
        onAction={toast.onAction}
        actionText={toast.actionText}
      />

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
              onPress={() => router.push('/(tabs)/mainscreen')}
            >
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={[
              GlobalStyles.headerText,
              layout.isWeb && ResponsiveStyles.webTitle
            ]}>
              Exercises
            </Text>
            <TouchableOpacity
              style={GlobalStyles.settingsButton}
              onPress={() => router.push('/(tabs)/settings')}
            >
              <Ionicons name="settings-outline" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={{ paddingHorizontal: layout.isWeb ? 0 : 20 }}>
            {/* Language Info */}
            <View style={{
              backgroundColor: '#e8f5e8',
              borderRadius: 16,
              padding: 20,
              marginBottom: 24,
              alignItems: 'center'
            }}>
              <Text style={{
                fontSize: 20,
                fontWeight: '600',
                color: '#2e7d32',
                textAlign: 'center',
                marginBottom: 8
              }}>
                Learning {targetLang}
              </Text>
              <Text style={{
                fontSize: 14,
                color: '#388e3c',
                textAlign: 'center'
              }}>
                Choose a category and level to start practicing!
              </Text>
              {progress && (
                <View style={{
                  backgroundColor: '#4caf50',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                  marginTop: 12
                }}>
                  <Text style={{
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: '600'
                  }}>
                    Total Score: {progress.totalScore} XP
                  </Text>
                </View>
              )}
            </View>

            {/* Category Selection */}
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              marginBottom: 16,
              color: Colors.text
            }}>
              Choose Category
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 24 }}
            >
              <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 4 }}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={{
                      backgroundColor: selectedCategory === category.id ? category.color : '#f8f9fa',
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: selectedCategory === category.id ? category.color : '#e0e0e0',
                      alignItems: 'center',
                      minWidth: 120,
                      position: 'relative'
                    }}
                    onPress={() => handleCategoryChange(category.id)}
                    disabled={loading}
                  >
                    <Ionicons
                      name={category.icon as any}
                      size={24}
                      color={selectedCategory === category.id ? '#fff' : category.color}
                      style={{ marginBottom: 8 }}
                    />
                    <Text style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: selectedCategory === category.id ? '#fff' : category.color,
                      textAlign: 'center',
                      marginBottom: 4
                    }}>
                      {category.name}
                    </Text>

                    {/* Available levels indicator */}
                    <View style={{
                      backgroundColor: selectedCategory === category.id ? '#ffffff40' : category.color + '20',
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: 8
                    }}>
                      <Text style={{
                        fontSize: 10,
                        fontWeight: '600',
                        color: selectedCategory === category.id ? '#fff' : category.color
                      }}>
                        {category.availableLevels.length} Level{category.availableLevels.length > 1 ? 's' : ''}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Current Category Info */}
            {currentCategory && (
              <View style={{
                backgroundColor: currentCategory.color + '10',
                borderRadius: 12,
                padding: 16,
                marginBottom: 24,
                borderLeftWidth: 4,
                borderLeftColor: currentCategory.color
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Ionicons name={currentCategory.icon as any} size={20} color={currentCategory.color} />
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: currentCategory.color,
                    marginLeft: 8
                  }}>
                    {currentCategory.name}
                  </Text>
                </View>
                <Text style={{
                  fontSize: 14,
                  color: '#666',
                  lineHeight: 20,
                  marginBottom: 8
                }}>
                  {currentCategory.description}
                </Text>
                <Text style={{
                  fontSize: 12,
                  color: currentCategory.color,
                  fontWeight: '600'
                }}>
                  Available Levels: {currentCategory.availableLevels.join(', ')}
                </Text>
              </View>
            )}

            {/* Levels Grid */}
            {loading ? (
              <View style={{ alignItems: 'center', padding: 40 }}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={{ marginTop: 16, color: '#666' }}>Loading levels...</Text>
              </View>
            ) : error && !__DEV__ ? (
              <View style={{ alignItems: 'center', padding: 40 }}>
                <Ionicons name="alert-circle-outline" size={48} color="#f44336" />
                <Text style={{ fontSize: 16, color: '#f44336', textAlign: 'center', marginTop: 16 }}>
                  Failed to load progress
                </Text>
                <Text style={{ fontSize: 14, color: '#999', textAlign: 'center', marginTop: 8 }}>
                  {error}
                </Text>
                <TouchableOpacity
                  style={{
                    backgroundColor: Colors.primary,
                    paddingHorizontal: 24,
                    paddingVertical: 12,
                    borderRadius: 8,
                    marginTop: 16
                  }}
                  onPress={loadProgress}
                >
                  <Text style={{ color: '#fff', fontWeight: '600' }}>Try Again</Text>
                </TouchableOpacity>
              </View>
            ) : progress ? (
              <>
                <Text style={{
                  fontSize: 18,
                  fontWeight: '600',
                  marginBottom: 16,
                  color: Colors.text
                }}>
                  Levels - {currentCategory?.name}
                </Text>

                <View style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: 12
                }}>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((level) => {
                    const isUnlocked = isLevelUnlocked(level);
                    const isCompleted = progress.completedLevels.some((cl: any) => cl.level === level);
                    const isCurrent = progress.currentLevel === level;
                    const isAvailable = currentCategory?.availableLevels.includes(level) || false;

                    let backgroundColor = '#f0f0f0';
                    let borderColor = '#e0e0e0';
                    let textColor = '#999';
                    let iconName = 'lock-closed-outline';

                    if (!isAvailable) {
                      backgroundColor = '#fafafa';
                      borderColor = '#f0f0f0';
                      textColor = '#ccc';
                      iconName = 'time-outline';
                    } else if (isCompleted) {
                      backgroundColor = '#c8e6c9';
                      borderColor = '#4caf50';
                      textColor = '#2e7d32';
                      iconName = 'checkmark-circle';
                    } else if (isUnlocked) {
                      backgroundColor = '#bbdefb';
                      borderColor = '#2196f3';
                      textColor = '#0d47a1';
                      iconName = 'play-circle-outline';
                    }

                    if (isCurrent && isUnlocked && isAvailable) {
                      backgroundColor = '#fff3e0';
                      borderColor = '#ff9800';
                      textColor = '#e65100';
                    }

                    return (
                      <TouchableOpacity
                        key={level}
                        style={{
                          width: layout.isWeb ? 'calc(20% - 10px)' : '18%',
                          aspectRatio: 1,
                          backgroundColor,
                          borderRadius: 16,
                          borderWidth: 2,
                          borderColor,
                          justifyContent: 'center',
                          alignItems: 'center',
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: (isUnlocked && isAvailable) ? 0.1 : 0.05,
                          shadowRadius: 4,
                          elevation: (isUnlocked && isAvailable) ? 3 : 1,
                          opacity: loading ? 0.7 : 1,
                          position: 'relative'
                        }}
                        onPress={() => handleLevelSelect(level)}
                        disabled={!isUnlocked || !isAvailable || loading}
                      >
                        <Ionicons
                          name={iconName as any}
                          size={20}
                          color={textColor}
                          style={{ marginBottom: 4 }}
                        />
                        <Text style={{
                          fontSize: 16,
                          fontWeight: '600',
                          color: textColor
                        }}>
                          {level}
                        </Text>

                        {!isAvailable && (
                          <View style={{
                            position: 'absolute',
                            bottom: 2,
                            backgroundColor: '#ff9800',
                            borderRadius: 6,
                            paddingHorizontal: 4,
                            paddingVertical: 1
                          }}>
                            <Text style={{
                              color: '#fff',
                              fontSize: 8,
                              fontWeight: '600'
                            }}>
                              SOON
                            </Text>
                          </View>
                        )}

                        {!isUnlocked && isAvailable && level > 1 && (
                          <View style={{
                            position: 'absolute',
                            top: -2,
                            right: -2,
                            backgroundColor: '#f44336',
                            borderRadius: 8,
                            paddingHorizontal: 4,
                            paddingVertical: 2
                          }}>
                            <Text style={{
                              color: '#fff',
                              fontSize: 8,
                              fontWeight: '600'
                            }}>
                              LOCKED
                            </Text>
                          </View>
                        )}

                        {isCurrent && isUnlocked && isAvailable && (
                          <View style={{
                            position: 'absolute',
                            top: -2,
                            right: -2,
                            backgroundColor: '#ff9800',
                            borderRadius: 8,
                            paddingHorizontal: 4,
                            paddingVertical: 2
                          }}>
                            <Text style={{
                              color: '#fff',
                              fontSize: 8,
                              fontWeight: '600'
                            }}>
                              NOW
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Progress Summary */}
                <View style={{
                  backgroundColor: '#f8f9fa',
                  borderRadius: 16,
                  padding: 20,
                  marginTop: 24
                }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: Colors.text,
                    marginBottom: 12,
                    textAlign: 'center'
                  }}>
                    Your Progress in {currentCategory?.name}
                  </Text>
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                    alignItems: 'center'
                  }}>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#4caf50' }}>
                        {progress.completedLevels.length}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#666' }}>Completed</Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#2196f3' }}>
                        {progress.currentLevel}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#666' }}>Current</Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#ff9800' }}>
                        {progress.totalScore}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#666' }}>Total XP</Text>
                    </View>
                  </View>

                  {/* Available vs Total Levels */}
                  <View style={{
                    backgroundColor: currentCategory?.color + '10',
                    borderRadius: 12,
                    padding: 12,
                    marginTop: 16,
                    alignItems: 'center'
                  }}>
                    <Text style={{
                      fontSize: 14,
                      color: currentCategory?.color,
                      fontWeight: '600',
                      marginBottom: 4
                    }}>
                      Content Status
                    </Text>
                    <Text style={{
                      fontSize: 12,
                      color: '#666',
                      textAlign: 'center'
                    }}>
                      {currentCategory?.availableLevels.length} of 10 levels available • More coming soon!
                    </Text>
                  </View>

                  {/* Level Unlock Help */}
                  <View style={{
                    backgroundColor: '#e3f2fd',
                    borderRadius: 12,
                    padding: 12,
                    marginTop: 12,
                    borderLeftWidth: 4,
                    borderLeftColor: '#2196f3'
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      <Ionicons name="information-circle-outline" size={16} color="#1976d2" />
                      <Text style={{
                        fontSize: 14,
                        color: '#1976d2',
                        fontWeight: '600',
                        marginLeft: 6
                      }}>
                        How to unlock levels
                      </Text>
                    </View>
                    <Text style={{
                      fontSize: 12,
                      color: '#1565c0',
                      lineHeight: 16
                    }}>
                      Complete each level to unlock the next one!
                    </Text>
                  </View>
                </View>
              </>
            ) : (
              <View style={{ alignItems: 'center', padding: 40 }}>
                <Ionicons name="help-circle-outline" size={48} color="#ccc" />
                <Text style={{ fontSize: 16, color: '#666', textAlign: 'center', marginTop: 16 }}>
                  No progress data available
                </Text>
                <TouchableOpacity
                  style={{
                    backgroundColor: Colors.primary,
                    paddingHorizontal: 24,
                    paddingVertical: 12,
                    borderRadius: 8,
                    marginTop: 16
                  }}
                  onPress={loadProgress}
                >
                  <Text style={{ color: '#fff', fontWeight: '600' }}>Load Progress</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}