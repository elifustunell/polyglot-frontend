// app/(tabs)/exercise-detail.tsx - %60 başarı kuralı ve düzgün navigation ile

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Colors, GlobalStyles } from '@/constants/Theme';
import { ResponsiveStyles } from '@/constants/ResponsiveTheme';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import Ionicons from '@expo/vector-icons/Ionicons';
import { CONFIG } from '@/constants/Config';

interface Exercise {
  _id: string;
  question: string;
  options: string[];
  points: number;
  order: number;
  difficulty: string;
  explanation?: string;
}

interface SubmitResult {
  isCorrect: boolean;
  correctAnswer: string;
  explanation?: string;
  pointsEarned: number;
  totalScore: number;
  levelCompleted: boolean;
  nextLevelUnlocked: boolean;
  unlockedLevels: number[];
  currentLevel: number;
  exercisesCompletedInLevel?: number;
  totalExercisesInLevel?: number;
}

export default function ExerciseDetailScreen() {
  const { language, category, level } = useLocalSearchParams();
  const { user, getFirebaseToken } = useAuth();
  const router = useRouter();
  const layout = useResponsiveLayout();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  const API_BASE_URL = CONFIG.API_BASE_URL;

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (mounted && user && language && category && level) {
      console.log(`🎯 Loading exercises for: ${language}/${category}/${level}`);
      loadExercises();
    }
  }, [mounted, user, language, category, level]);

  // Parameter validation
  useEffect(() => {
    if (mounted && (!language || !category || !level)) {
      console.error('❌ Missing required parameters:', { language, category, level });
      Alert.alert(
        'Error',
        'Missing required parameters. Returning to exercises.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }
  }, [mounted, language, category, level]);

  const makeRequest = async (url: string, options: any = {}) => {
    try {
      console.log(`🔥 Making request to: ${API_BASE_URL}${url}`);

      const token = await getFirebaseToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      console.log('🔑 Firebase Token obtained:', token.substring(0, 20) + '...');

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
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = await response.text() || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log(`✅ Response received, success: ${data.success}`);
      return data;
    } catch (error: any) {
      console.error('❌ API Request failed:', error);
      throw error;
    }
  };

  const loadExercises = async () => {
    if (!mounted) return;

    setLoading(true);
    try {
      console.log(`📚 Loading exercises for ${language}/${category}/${level}`);

      const data = await makeRequest(`/progress/${language}/${category}/${level}/exercises`);

      if (data.success && data.exercises && data.exercises.length > 0) {
        setExercises(data.exercises);
        console.log(`✅ Loaded ${data.exercises.length} exercises`);

        // Reset state for new exercises
        setCurrentIndex(0);
        setSelectedAnswer(null);
        setShowResult(false);
        setResult(null);
        setCorrectCount(0);
        setScore(0);
      } else {
        throw new Error('No exercises found for this level');
      }

    } catch (error: any) {
      console.error('❌ Failed to load exercises:', error);

      if (mounted) {
        Alert.alert(
          'Error Loading Exercises',
          `Failed to load exercises: ${error.message}`,
          [
            {
              text: 'Try Again',
              onPress: async () => {
                await handleTryAgain();
              }
            }
            { text: 'Go Back', onPress: () => router.back() }
          ]
        );
      }
    } finally {
      if (mounted) {
        setLoading(false);
      }
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (showResult || loading) return;
    setSelectedAnswer(answer);
  };

  const submitAnswer = async () => {
    if (!selectedAnswer || !exercises[currentIndex] || !mounted) {
      Alert.alert('Error', 'Please select an answer');
      return;
    }

    setLoading(true);
    try {
      const exercise = exercises[currentIndex];

      const data = await makeRequest(
        `/progress/${language}/${category}/${level}/submit`,
        {
          method: 'POST',
          body: JSON.stringify({
            exerciseId: exercise._id,
            userAnswer: selectedAnswer
          })
        }
      );

      if (data.success && data.result) {
        setResult(data.result);
        setShowResult(true);

        // Update score from backend response (total accumulated score)
        setScore(data.result.totalScore);

        if (data.result.isCorrect) {
          setCorrectCount(correctCount + 1);
        }

        console.log('✅ Answer submitted successfully');
        console.log('📊 Updated total score:', data.result.totalScore);
      } else {
        throw new Error('Failed to submit answer');
      }

    } catch (error: any) {
      console.error('❌ Failed to submit answer:', error);
      if (mounted) {
        Alert.alert('Error', `Failed to submit answer: ${error.message}`);
      }
    } finally {
      if (mounted) {
        setLoading(false);
      }
    }
  };

  // Fixed nextQuestion function in exercise-detail.tsx

  const nextQuestion = async () => {
    if (!mounted) return;

    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setResult(null);
    } else {
      // All questions completed - calculate final results
      const finalCorrectCount = correctCount + (result?.isCorrect ? 1 : 0);
      const finalScore = result?.totalScore || score;
      const percentage = Math.round((finalCorrectCount / exercises.length) * 100);
      const passThreshold = 60; // %60 geçme notu
      const isPassed = percentage >= passThreshold;

      console.log('🎉 Level completion stats:', {
        correctAnswers: finalCorrectCount,
        totalQuestions: exercises.length,
        percentage,
        totalScore: finalScore,
        isPassed,
        passThreshold,
        willCallAPI: isPassed
      });

      // Show loading state
      setLoading(true);

      try {
        if (isPassed) {
          console.log('🚀 Attempting to complete level with backend...');

          // Call backend to complete level
          const completeResponse = await makeRequest(`/progress/${language}/${category}/${level}/complete`, {
            method: 'POST',
            body: JSON.stringify({
              percentage: percentage,
              correctAnswers: finalCorrectCount,
              totalQuestions: exercises.length
            })
          });

          console.log('✅ Backend response:', completeResponse);

          if (completeResponse.success) {
            // SUCCESS: Level completed
            Alert.alert(
              '🎉 Level Completed!',
              `Congratulations! You passed Level ${level} with ${percentage}%!\n\nScore: ${finalCorrectCount}/${exercises.length} correct\nTotal XP: ${finalScore}\n\n🎊 Next level unlocked!`,
              [
                {
                  text: 'Continue to Exercises',
                  onPress: () => {
                    router.replace({
                      pathname: '/(tabs)/exercises',
                      params: {
                        selectedCategory: category,
                        refresh: Date.now().toString()
                      }
                    });
                  }
                }
              ]
            );
          } else {
            // Backend rejected completion
            throw new Error(completeResponse.message || 'Level completion failed');
          }
        } else {
          // FAILURE: Not enough score
          console.log('❌ Level failed - not enough score');

          Alert.alert(
            '📚 Try Again!',
            `You need at least ${passThreshold}% to pass this level.\n\nYour score: ${finalCorrectCount}/${exercises.length} correct (${percentage}%)\nTotal XP: ${finalScore}\n\n📝 Keep practicing to improve!`,
            [
              {
                text: 'Return to Exercises',
                onPress: () => {
                  router.replace({
                    pathname: '/(tabs)/exercises',
                    params: {
                      selectedCategory: category,
                      refresh: Date.now().toString()
                    }
                  });
                }
              },
              {
                text: 'Try Again',
                onPress: () => {
                  // Reset to retry the level
                  setCurrentIndex(0);
                  setSelectedAnswer(null);
                  setShowResult(false);
                  setResult(null);
                  setCorrectCount(0);
                  // Don't reset total score - it's cumulative
                }
              }
            ]
          );
        }
      } catch (error) {
        console.error('❌ Level completion error:', error);

        // Handle backend rejection (60% rule)
        if (error.message.includes('need at least')) {
          Alert.alert(
            '📚 Level Not Passed',
            `${error.message}\n\nYour score: ${finalCorrectCount}/${exercises.length} correct (${percentage}%)\n\nTry again to improve your score!`,
            [
              {
                text: 'Return to Exercises',
                onPress: () => {
                  router.replace({
                    pathname: '/(tabs)/exercises',
                    params: {
                      selectedCategory: category,
                      refresh: Date.now().toString()
                    }
                  });
                }
              },
              {
                text: 'Try Again',
                onPress: () => {
                  setCurrentIndex(0);
                  setSelectedAnswer(null);
                  setShowResult(false);
                  setResult(null);
                  setCorrectCount(0);
                }
              }
            ]
          );
        } else {
          // Network or other error
          Alert.alert(
            '⚠️ Connection Error',
            `Could not save your progress: ${error.message}\n\nYour score: ${finalCorrectCount}/${exercises.length} correct (${percentage}%)\n\nPlease check your internet connection.`,
            [
              {
                text: 'Return to Exercises',
                onPress: () => {
                  router.replace({
                    pathname: '/(tabs)/exercises',
                    params: {
                      selectedCategory: category,
                      refresh: Date.now().toString()
                    }
                  });
                }
              },
              {
                text: 'Try Again',
                onPress: async () => {
                  // Retry the completion call
                  try {
                    if (isPassed) {
                      await makeRequest(`/progress/${language}/${category}/${level}/complete`, {
                        method: 'POST',
                        body: JSON.stringify({
                          percentage: percentage,
                          correctAnswers: finalCorrectCount,
                          totalQuestions: exercises.length
                        })
                      });

                      Alert.alert(
                        '✅ Success!',
                        'Your progress has been saved successfully!',
                        [
                          {
                            text: 'Continue',
                            onPress: () => {
                              router.replace({
                                pathname: '/(tabs)/exercises',
                                params: {
                                  selectedCategory: category,
                                  refresh: Date.now().toString()
                                }
                              });
                            }
                          }
                        ]
                      );
                    }
                  } catch (retryError) {
                    Alert.alert('Error', 'Still unable to save progress. Please try again later.');
                  }
                }
              }
            ]
          );
        }
      } finally {
        setLoading(false);
      }
    }
  };

  // New function to reset and retry level
  const resetAndRetryLevel = async () => {
    setLoading(true);

    try {
      console.log(`🔄 Resetting level ${level} for retry...`);

      // Call backend to reset level progress
      const resetResponse = await makeRequest(`/progress/${language}/${category}/${level}/reset`, {
        method: 'POST'
      });

      if (resetResponse.success) {
        console.log('✅ Level reset successful, reloading exercises...');

        // Reset all local state
        setCurrentIndex(0);
        setSelectedAnswer(null);
        setShowResult(false);
        setResult(null);
        setCorrectCount(0);
        // Note: Don't reset total score as it's now updated by backend

        // Reload exercises to ensure fresh start
        await loadExercises();

        // Show success message
        Alert.alert(
          '🔄 Level Reset',
          `Level ${level} has been reset successfully!\n\nYou can now retry all questions with a fresh start.`,
          [{ text: 'Start Again', onPress: () => console.log('✅ Ready to retry') }]
        );

      } else {
        throw new Error(resetResponse.message || 'Failed to reset level');
      }

    } catch (error) {
      console.error('❌ Level reset failed:', error);
      Alert.alert(
        'Reset Failed',
        `Could not reset the level: ${error.message}\n\nYou can still retry by going back to exercises and selecting this level again.`,
        [
          {
            text: 'Go to Exercises',
            onPress: () => {
              router.replace({
                pathname: '/(tabs)/exercises',
                params: {
                  selectedCategory: category,
                  refresh: Date.now().toString()
                }
              });
            }
          }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  // Also add this function to handle manual retry from Try Again button in existing logic
  const handleTryAgain = async () => {
    setLoading(true);

    try {
      // Reset level progress in backend
      await makeRequest(`/progress/${language}/${category}/${level}/reset`, {
        method: 'POST'
      });

      // Reset local state
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setShowResult(false);
      setResult(null);
      setCorrectCount(0);

      // Reload exercises
      await loadExercises();

      console.log('✅ Level reset for retry');

    } catch (error) {
      console.error('❌ Reset failed:', error);
      Alert.alert('Error', 'Could not reset level. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading && exercises.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 16, color: '#666' }}>Loading exercises...</Text>
      </View>
    );
  }

  // No exercises state
  if (exercises.length === 0 && !loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Ionicons name="book-outline" size={64} color="#ccc" />
        <Text style={{ fontSize: 18, color: '#666', textAlign: 'center', marginTop: 16 }}>
          No exercises available for this level
        </Text>
        <Text style={{ fontSize: 14, color: '#999', textAlign: 'center', marginTop: 8 }}>
          {language} • {category} • Level {level}
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: Colors.primary,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 8,
            marginTop: 24
          }}
          onPress={() => router.back()}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentExercise = exercises[currentIndex];
  const containerStyle = layout.isWeb ? ResponsiveStyles.webContainer : GlobalStyles.container;
  const cardStyle = layout.isWeb ? { ...ResponsiveStyles.webCard, minHeight: '90vh' } : GlobalStyles.whiteBackgroundContainer;

  return (
    <View style={containerStyle}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: layout.isWeb ? 40 : 20 // Tab bar için daha az padding
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
              {String(category).charAt(0).toUpperCase() + String(category).slice(1)} - Level {level}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={{ paddingHorizontal: layout.isWeb ? 0 : 20 }}>
            {/* Progress Bar */}
            <View style={{
              backgroundColor: '#f0f0f0',
              height: 8,
              borderRadius: 4,
              marginBottom: 20,
              overflow: 'hidden'
            }}>
              <View style={{
                backgroundColor: Colors.primary,
                height: '100%',
                width: `${((currentIndex + 1) / exercises.length) * 100}%`,
                borderRadius: 4
              }} />
            </View>

            {/* Question Counter with Pass Requirement */}
            <View style={{
              backgroundColor: '#e3f2fd',
              padding: 16,
              borderRadius: 12,
              marginBottom: 24,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <View>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#1976d2'
                }}>
                  Question {currentIndex + 1} of {exercises.length}
                </Text>
                <Text style={{
                  fontSize: 12,
                  color: '#1565c0',
                  marginTop: 2
                }}>
                  Need 60% to pass level
                </Text>
              </View>
              <View style={{
                backgroundColor: '#4caf50',
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 12
              }}>
                <Text style={{
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: '600'
                }}>
                  {correctCount}/{exercises.length} ✓
                </Text>
              </View>
            </View>

            {/* Question */}
            <View style={{
              backgroundColor: '#f8f9fa',
              borderRadius: 16,
              padding: 24,
              marginBottom: 30,
              alignItems: 'center'
            }}>
              <View style={{
                backgroundColor: currentExercise.difficulty === 'easy' ? '#c8e6c9' :
                               currentExercise.difficulty === 'medium' ? '#fff3e0' : '#ffcdd2',
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 12,
                marginBottom: 16
              }}>
                <Text style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: currentExercise.difficulty === 'easy' ? '#2e7d32' :
                         currentExercise.difficulty === 'medium' ? '#e65100' : '#c62828'
                }}>
                  {currentExercise.difficulty?.toUpperCase()} • {currentExercise.points} XP
                </Text>
              </View>

              <Text style={{
                fontSize: 20,
                fontWeight: '600',
                color: Colors.text,
                textAlign: 'center',
                lineHeight: 28
              }}>
                {currentExercise.question}
              </Text>
            </View>

            {/* Options */}
            <View style={{
              gap: 12,
              marginBottom: 30
            }}>
              {currentExercise.options.map((option, index) => {
                let buttonStyle = {
                  backgroundColor: '#fff',
                  borderWidth: 2,
                  borderColor: '#e0e0e0'
                };
                let textColor = '#333';

                if (selectedAnswer === option) {
                  if (showResult && result) {
                    if (option === result.correctAnswer) {
                      buttonStyle = {
                        backgroundColor: '#c8e6c9',
                        borderWidth: 2,
                        borderColor: '#4caf50'
                      };
                      textColor = '#2e7d32';
                    } else {
                      buttonStyle = {
                        backgroundColor: '#ffcdd2',
                        borderWidth: 2,
                        borderColor: '#f44336'
                      };
                      textColor = '#c62828';
                    }
                  } else {
                    buttonStyle = {
                      backgroundColor: '#bbdefb',
                      borderWidth: 2,
                      borderColor: '#2196f3'
                    };
                    textColor = '#0d47a1';
                  }
                } else if (showResult && result && option === result.correctAnswer) {
                  buttonStyle = {
                    backgroundColor: '#c8e6c9',
                    borderWidth: 2,
                    borderColor: '#4caf50'
                  };
                  textColor = '#2e7d32';
                }

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      {
                        padding: 16,
                        borderRadius: 12,
                        alignItems: 'center',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 2,
                        position: 'relative'
                      },
                      buttonStyle
                    ]}
                    onPress={() => handleAnswerSelect(option)}
                    disabled={showResult || loading}
                  >
                    <Text style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: textColor,
                      textAlign: 'center'
                    }}>
                      {option}
                    </Text>

                    {showResult && result && option === result.correctAnswer && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#4caf50"
                        style={{ position: 'absolute', top: 8, right: 8 }}
                      />
                    )}

                    {showResult && selectedAnswer === option && result && option !== result.correctAnswer && (
                      <Ionicons
                        name="close-circle"
                        size={20}
                        color="#f44336"
                        style={{ position: 'absolute', top: 8, right: 8 }}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Explanation */}
            {showResult && result?.explanation && (
              <View style={{
                backgroundColor: '#fff3e0',
                padding: 16,
                borderRadius: 12,
                marginBottom: 20,
                borderLeft: '4px solid #ff9800'
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Ionicons name="bulb-outline" size={20} color="#f57c00" />
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: '#e65100',
                    marginLeft: 8
                  }}>
                    Explanation
                  </Text>
                </View>
                <Text style={{
                  fontSize: 14,
                  color: '#bf360c',
                  lineHeight: 20
                }}>
                  {result.explanation}
                </Text>
              </View>
            )}

            {/* Result Banner */}
            {showResult && result && (
              <View style={{
                backgroundColor: result.isCorrect ? '#c8e6c9' : '#ffcdd2',
                padding: 16,
                borderRadius: 12,
                marginBottom: 20,
                alignItems: 'center'
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Ionicons
                    name={result.isCorrect ? "checkmark-circle" : "close-circle"}
                    size={24}
                    color={result.isCorrect ? '#2e7d32' : '#c62828'}
                  />
                  <Text style={{
                    fontSize: 18,
                    fontWeight: '600',
                    color: result.isCorrect ? '#2e7d32' : '#c62828',
                    marginLeft: 8
                  }}>
                    {result.isCorrect ? 'Correct!' : 'Incorrect'}
                  </Text>
                </View>
                <Text style={{
                  fontSize: 14,
                  color: result.isCorrect ? '#388e3c' : '#d32f2f',
                  textAlign: 'center'
                }}>
                  {result.isCorrect
                    ? `+${result.pointsEarned} XP earned!`
                    : `Correct answer: ${result.correctAnswer}`
                  }
                </Text>
              </View>
            )}

            {/* Action Button */}
            <TouchableOpacity
              style={{
                backgroundColor: showResult ? (result?.isCorrect ? '#4caf50' : '#2196f3') : Colors.primary,
                padding: 16,
                borderRadius: 12,
                alignItems: 'center',
                marginBottom: 20,
                opacity: (!showResult && !selectedAnswer) || loading ? 0.6 : 1
              }}
              onPress={showResult ? nextQuestion : submitAnswer}
              disabled={(!showResult && !selectedAnswer) || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons
                    name={showResult ?
                      (currentIndex < exercises.length - 1 ? "arrow-forward" : "checkmark-done") :
                      "send"
                    }
                    size={20}
                    color="#fff"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={{
                    color: '#fff',
                    fontSize: 16,
                    fontWeight: '600'
                  }}>
                    {showResult ?
                      (currentIndex < exercises.length - 1 ? 'Next Question' : 'Complete Level') :
                      'Submit Answer'
                    }
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Score Display */}
            <View style={{
              backgroundColor: '#f8f9fa',
              padding: 16,
              borderRadius: 12,
              alignItems: 'center'
            }}>
              <Text style={{
                fontSize: 14,
                color: '#666',
                marginBottom: 4
              }}>
                Total Score
              </Text>
              <Text style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: Colors.primary
              }}>
                {score} XP
              </Text>
              <Text style={{
                fontSize: 12,
                color: '#999',
                marginTop: 4
              }}>
                This session: {correctCount}/{currentIndex + (showResult ? 1 : 0)} correct
              </Text>
              <Text style={{
                fontSize: 12,
                color: Math.round((correctCount / exercises.length) * 100) >= 60 ? '#4caf50' : '#ff9800',
                marginTop: 2,
                fontWeight: '600'
              }}>
                Current: {Math.round((correctCount / Math.max(currentIndex + (showResult ? 1 : 0), 1)) * 100)}%
                {Math.round((correctCount / exercises.length) * 100) >= 60 ? ' ✓' : ' (Need 60%)'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}