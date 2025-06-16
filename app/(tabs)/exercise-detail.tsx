// app/(tabs)/exercise-detail.tsx - Tüm exercise tiplerini destekleyen unified component

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
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
  options?: string[];
  points: number;
  order: number;
  difficulty: string;
  explanation?: string;
  answer?: string;
  // Category specific fields
  dialogue?: Array<{
    speaker: string;
    text: string;
    blank: boolean;
    options?: string[];
    correct?: string;
  }>;
  image?: string;
  words?: string[];
  scrambled?: string[];
  hint?: string;
  target?: string;
  sourceWord?: string;
  targetWord?: string;
  matchPairs?: Array<{ source: string; target: string; id: number }>;
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

  // Category-specific states
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [matchSelections, setMatchSelections] = useState<{ [key: number]: number }>({});
  const [shuffledTargets, setShuffledTargets] = useState<any[]>([]);

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

        // Initialize category-specific states
        initializeCategoryState(data.exercises[0]);
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
            { text: 'Try Again', onPress: () => loadExercises() },
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

  const initializeCategoryState = (exercise: Exercise) => {
    if (category === 'sentences' && exercise.scrambled) {
      setAvailableWords([...exercise.scrambled]);
      setSelectedWords([]);
    } else if (category === 'vocabulary' && exercise.matchPairs) {
      const shuffled = [...exercise.matchPairs].sort(() => Math.random() - 0.5);
      setShuffledTargets(shuffled);
      setMatchSelections({});
    }
  };

  const resetCategoryState = () => {
    setSelectedWords([]);
    setAvailableWords([]);
    setMatchSelections({});
    setShuffledTargets([]);
  };

  const handleAnswerSelect = (answer: string) => {
    if (showResult || loading) return;
    setSelectedAnswer(answer);
  };

  // Fill the blanks specific handler
  const handleFillBlanksSelect = (answer: string) => {
    if (showResult || loading) return;
    setSelectedAnswer(answer);
  };

  // Sentences specific handlers
  const handleWordSelect = (word: string, fromAvailable: boolean) => {
    if (showResult) return;

    if (fromAvailable) {
      const index = availableWords.indexOf(word);
      if (index !== -1) {
        const updatedAvailable = [...availableWords];
        updatedAvailable.splice(index, 1);
        setAvailableWords(updatedAvailable);
        setSelectedWords(prev => [...prev, word]);
      }
    } else {
      const index = selectedWords.indexOf(word);
      if (index !== -1) {
        const updatedSelected = [...selectedWords];
        updatedSelected.splice(index, 1);
        setSelectedWords(updatedSelected);
        setAvailableWords(prev => [...prev, word]);
      }
    }
  };

  const clearSentence = () => {
    const currentExercise = exercises[currentIndex];
    if (currentExercise && currentExercise.scrambled) {
      setAvailableWords([...currentExercise.scrambled]);
      setSelectedWords([]);
    }
  };

  // Vocabulary specific handlers
  const handleVocabularyMatch = (sourceId: number, targetId: number) => {
    if (showResult) return;
    setMatchSelections(prev => ({ ...prev, [sourceId]: targetId }));
  };

  const getUserAnswer = () => {
    const currentExercise = exercises[currentIndex];

    switch (category) {
      case 'filltheblanks':
        return selectedAnswer;
      case 'sentences':
        return selectedWords.join(' ').trim();
      case 'vocabulary':
        // Return match selections as JSON string for backend
        return JSON.stringify(matchSelections);
      case 'grammar':
      case 'imagebased':
      default:
        return selectedAnswer;
    }
  };

  const isAnswerComplete = () => {
    const currentExercise = exercises[currentIndex];

    switch (category) {
      case 'filltheblanks':
      case 'grammar':
      case 'imagebased':
        return !!selectedAnswer;
      case 'sentences':
        return selectedWords.length > 0;
      case 'vocabulary':
        if (!currentExercise.matchPairs) return false;
        return Object.keys(matchSelections).length === currentExercise.matchPairs.length;
      default:
        return false;
    }
  };

  const submitAnswer = async () => {
    const userAnswer = getUserAnswer();
    if (!userAnswer || !exercises[currentIndex] || !mounted) {
      Alert.alert('Error', 'Please provide an answer');
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
            userAnswer: userAnswer
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

  const nextQuestion = async () => {
    if (!mounted) return;

    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setResult(null);
      resetCategoryState();

      // Initialize next question's category state
      initializeCategoryState(exercises[currentIndex + 1]);
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
                  resetCategoryState();
                  if (exercises.length > 0) {
                    initializeCategoryState(exercises[0]);
                  }
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
                  resetCategoryState();
                  if (exercises.length > 0) {
                    initializeCategoryState(exercises[0]);
                  }
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

  // Component render methods for different categories
  const renderFillTheBlanksContent = (exercise: Exercise) => {
    if (!exercise.dialogue) return null;

    return (
      <View style={{
        backgroundColor: '#f8f9fa',
        borderRadius: 16,
        padding: 24,
        marginBottom: 30
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 20
        }}>
          <Ionicons name="chatbubbles-outline" size={24} color={Colors.primary} />
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: Colors.primary,
            marginLeft: 8
          }}>
            Conversation
          </Text>
        </View>

        {exercise.dialogue.map((line, index) => (
          <View key={index} style={{
            marginBottom: 16,
            padding: 16,
            backgroundColor: line.speaker === 'A' ? '#e3f2fd' : '#f3e5f5',
            borderRadius: 12,
            borderLeft: `4px solid ${line.speaker === 'A' ? '#2196f3' : '#9c27b0'}`
          }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: line.speaker === 'A' ? '#1565c0' : '#7b1fa2',
              marginBottom: 8
            }}>
              Speaker {line.speaker}:
            </Text>

            <Text style={{
              fontSize: 18,
              lineHeight: 28,
              color: '#333'
            }}>
              {line.blank ? (
                <>
                  {line.text.split('_____')[0]}
                  <Text style={{
                    backgroundColor: showResult
                      ? (selectedAnswer === line.correct ? '#c8e6c9' : '#ffcdd2')
                      : (selectedAnswer ? '#bbdefb' : '#fff'),
                    borderWidth: 2,
                    borderColor: showResult
                      ? (selectedAnswer === line.correct ? '#4caf50' : '#f44336')
                      : (selectedAnswer ? '#2196f3' : '#e0e0e0'),
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    borderRadius: 8,
                    fontSize: 18,
                    fontWeight: '600',
                    color: showResult
                      ? (selectedAnswer === line.correct ? '#2e7d32' : '#c62828')
                      : (selectedAnswer ? '#0d47a1' : '#666'),
                    minWidth: 80,
                    textAlign: 'center'
                  }}>
                    {selectedAnswer || '_____'}
                  </Text>
                  {line.text.split('_____')[1]}
                </>
              ) : (
                line.text
              )}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderFillTheBlanksOptions = (exercise: Exercise) => {
    if (!exercise.dialogue) return null;

    const blankLine = exercise.dialogue.find(line => line.blank);
    if (!blankLine || !blankLine.options) return null;

    return (
      <View style={{ gap: 12, marginBottom: 30 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: Colors.text,
          marginBottom: 8
        }}>
          Choose the correct word:
        </Text>

        {blankLine.options.map((option, index) => {
          let buttonStyle = {
            backgroundColor: '#fff',
            borderWidth: 2,
            borderColor: '#e0e0e0'
          };
          let textColor = '#333';

          if (selectedAnswer === option) {
            if (showResult) {
              if (option === blankLine.correct) {
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
          } else if (showResult && option === blankLine.correct) {
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
              onPress={() => handleFillBlanksSelect(option)}
              disabled={showResult}
            >
              <Text style={{
                fontSize: 18,
                fontWeight: '600',
                color: textColor
              }}>
                {option}
              </Text>

              {showResult && option === blankLine.correct && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color="#4caf50"
                  style={{ position: 'absolute', top: 8, right: 8 }}
                />
              )}

              {showResult && selectedAnswer === option && option !== blankLine.correct && (
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
    );
  };

  const renderGrammarContent = (exercise: Exercise) => {
    return (
      <View style={{
        backgroundColor: '#f8f9fa',
        borderRadius: 16,
        padding: 24,
        marginBottom: 30,
        alignItems: 'center'
      }}>
        <View style={{
          backgroundColor: exercise.difficulty === 'easy' ? '#c8e6c9' :
                         exercise.difficulty === 'medium' ? '#fff3e0' : '#ffcdd2',
          paddingHorizontal: 12,
          paddingVertical: 4,
          borderRadius: 12,
          marginBottom: 16
        }}>
          <Text style={{
            fontSize: 12,
            fontWeight: '600',
            color: exercise.difficulty === 'easy' ? '#2e7d32' :
                   exercise.difficulty === 'medium' ? '#e65100' : '#c62828'
          }}>
            {exercise.difficulty?.toUpperCase()} • {exercise.points} XP
          </Text>
        </View>

        {exercise.image && (
          <Image
            source={{ uri: exercise.image }}
            style={{
              width: 150,
              height: 150,
              borderRadius: 12,
              marginBottom: 16
            }}
            resizeMode="contain"
          />
        )}

        <Text style={{
          fontSize: 20,
          fontWeight: '600',
          color: Colors.text,
          textAlign: 'center',
          lineHeight: 28
        }}>
          {exercise.question}
        </Text>
      </View>
    );
  };

  const renderImageBasedContent = (exercise: Exercise) => {
    return (
      <View style={{
        backgroundColor: '#f8f9fa',
        borderRadius: 20,
        padding: 24,
        marginBottom: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8
      }}>
        <View style={{
          backgroundColor: '#fff',
          borderRadius: 16,
          padding: 20,
          marginBottom: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4
        }}>
          {exercise.image ? (
            <Image
              source={{ uri: exercise.image }}
              style={{
                width: layout.isWeb ? 200 : 180,
                height: layout.isWeb ? 200 : 180,
                borderRadius: 12
              }}
              resizeMode="contain"
            />
          ) : (
            <View
              style={{
                width: layout.isWeb ? 200 : 180,
                height: layout.isWeb ? 200 : 180,
                borderRadius: 12,
                backgroundColor: '#eeeeee',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Text style={{ color: '#999' }}>No image available</Text>
            </View>
          )}
        </View>

        <View style={{
          backgroundColor: '#e8f5e8',
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 20,
          marginBottom: 16
        }}>
          <Text style={{
            fontSize: 12,
            color: '#2e7d32',
            fontWeight: '600'
          }}>
            🔍 Study the image carefully
          </Text>
        </View>

        <Text style={{
          fontSize: 20,
          fontWeight: '600',
          color: Colors.text,
          textAlign: 'center',
          lineHeight: 28
        }}>
          {exercise.question}
        </Text>
      </View>
    );
  };

  const renderSentencesContent = (exercise: Exercise) => {
    if (!exercise.hint) return null;

    return (
      <>
        {/* Hint */}
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
              Hint
            </Text>
          </View>
          <Text style={{
            fontSize: 14,
            color: '#bf360c',
            lineHeight: 20
          }}>
            {exercise.hint}
          </Text>
        </View>

        {/* Sentence Display Area */}
        <View style={{
          backgroundColor: '#f8f9fa',
          borderRadius: 16,
          padding: 20,
          marginBottom: 24,
          minHeight: 80,
          justifyContent: 'center',
          borderWidth: showResult ? 2 : 1,
          borderColor: showResult
            ? (selectedWords.join(' ').trim() === exercise.target?.trim() ? '#4caf50' : '#f44336')
            : '#e0e0e0'
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 12
          }}>
            <Ionicons
              name="create-outline"
              size={20}
              color={Colors.primary}
            />
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: Colors.primary,
              marginLeft: 8
            }}>
              Your Sentence:
            </Text>

            {selectedWords.length > 0 && (
              <TouchableOpacity
                onPress={clearSentence}
                style={{ marginLeft: 'auto' }}
                disabled={showResult}
              >
                <Ionicons name="refresh-outline" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>

          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
            minHeight: 40
          }}>
            {selectedWords.length === 0 ? (
              <Text style={{
                fontSize: 16,
                color: '#999',
                fontStyle: 'italic'
              }}>
                Tap words below to build your sentence...
              </Text>
            ) : (
              selectedWords.map((word, index) => (
                <TouchableOpacity
                  key={`selected-${index}`}
                  style={{
                    backgroundColor: showResult
                      ? (selectedWords.join(' ').trim() === exercise.target?.trim() ? '#c8e6c9' : '#ffcdd2')
                      : '#bbdefb',
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 8,
                    marginRight: 8,
                    marginBottom: 8,
                    borderWidth: 1,
                    borderColor: showResult
                      ? (selectedWords.join(' ').trim() === exercise.target?.trim() ? '#4caf50' : '#f44336')
                      : '#2196f3'
                  }}
                  onPress={() => handleWordSelect(word, false)}
                  disabled={showResult}
                >
                  <Text style={{
                    fontSize: 16,
                    color: showResult
                      ? (selectedWords.join(' ').trim() === exercise.target?.trim() ? '#2e7d32' : '#c62828')
                      : '#0d47a1',
                    fontWeight: '500'
                  }}>
                    {word}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>

          {showResult && (
            <View style={{
              marginTop: 12,
              padding: 12,
              backgroundColor: selectedWords.join(' ').trim() === exercise.target?.trim() ? '#e8f5e8' : '#fce4ec',
              borderRadius: 8
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Ionicons
                  name={selectedWords.join(' ').trim() === exercise.target?.trim() ? "checkmark-circle" : "close-circle"}
                  size={16}
                  color={selectedWords.join(' ').trim() === exercise.target?.trim() ? '#4caf50' : '#f44336'}
                />
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: selectedWords.join(' ').trim() === exercise.target?.trim() ? '#2e7d32' : '#c62828',
                  marginLeft: 4
                }}>
                  {selectedWords.join(' ').trim() === exercise.target?.trim() ? 'Correct!' : 'Incorrect'}
                </Text>
              </View>
              <Text style={{
                fontSize: 14,
                color: selectedWords.join(' ').trim() === exercise.target?.trim() ? '#2e7d32' : '#c62828'
              }}>
                Correct answer: "{exercise.target}"
              </Text>
            </View>
          )}
        </View>

        {/* Available Words */}
        <View style={{
          marginBottom: 30
        }}>
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: Colors.text,
            marginBottom: 12
          }}>
            Available Words:
          </Text>

          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            backgroundColor: '#fff',
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: '#e0e0e0',
            minHeight: 60,
            justifyContent: availableWords.length === 0 ? 'center' : 'flex-start',
            alignItems: availableWords.length === 0 ? 'center' : 'flex-start'
          }}>
            {availableWords.length === 0 ? (
              <Text style={{
                fontSize: 14,
                color: '#999',
                fontStyle: 'italic'
              }}>
                All words used! ✨
              </Text>
            ) : (
              availableWords.map((word, index) => (
                <TouchableOpacity
                  key={`available-${index}-${word}`}
                  style={{
                    backgroundColor: '#f0f0f0',
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 8,
                    marginRight: 8,
                    marginBottom: 8,
                    borderWidth: 1,
                    borderColor: '#ddd'
                  }}
                  onPress={() => handleWordSelect(word, true)}
                  disabled={showResult}
                >
                  <Text style={{
                    fontSize: 16,
                    color: '#333',
                    fontWeight: '500'
                  }}>
                    {word}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>
      </>
    );
  };

  const renderVocabularyContent = (exercise: Exercise) => {
    if (!exercise.matchPairs) return null;

    return (
      <View style={{
        marginBottom: 30
      }}>
        <Text style={{
          fontSize: 18,
          fontWeight: '600',
          color: '#1976d2',
          textAlign: 'center',
          marginBottom: 20
        }}>
          Match the Words
        </Text>

        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between'
        }}>
          {/* Source words column */}
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: Colors.text,
              marginBottom: 12,
              textAlign: 'center'
            }}>
              {language === 'English' ? 'English' : 'German'}
            </Text>
            {exercise.matchPairs.map((item, index) => (
              <View key={index} style={{
                padding: 12,
                marginVertical: 4,
                borderRadius: 10,
                backgroundColor: '#fff',
                borderWidth: 2,
                borderColor: '#ccc'
              }}>
                <Text style={{ fontSize: 16, textAlign: 'center' }}>{item.source}</Text>
              </View>
            ))}
          </View>

          {/* Target words column */}
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: Colors.text,
              marginBottom: 12,
              textAlign: 'center'
            }}>
              {language === 'English' ? 'Turkish' : 'English'}
            </Text>
            {shuffledTargets.map((item, index) => {
              const selected = Object.values(matchSelections).includes(item.id);
              const correct = showResult && matchSelections[item.id] === item.id;

              return (
                <TouchableOpacity
                  key={index}
                  style={{
                    padding: 12,
                    marginVertical: 4,
                    borderRadius: 10,
                    backgroundColor: showResult
                      ? correct ? '#c8e6c9' : selected ? '#ffcdd2' : '#fff'
                      : selected ? '#bbdefb' : '#fff',
                    borderWidth: 2,
                    borderColor: showResult
                      ? correct ? '#4caf50' : selected ? '#f44336' : '#ccc'
                      : selected ? '#2196f3' : '#ccc'
                  }}
                  onPress={() => {
                    const unselectedSource = exercise.matchPairs?.find(q => !matchSelections[q.id]);
                    if (unselectedSource) {
                      handleVocabularyMatch(unselectedSource.id, item.id);
                    }
                  }}
                  disabled={showResult || selected}
                >
                  <Text style={{
                    fontSize: 16,
                    textAlign: 'center',
                    color: showResult && correct
                      ? '#2e7d32'
                      : showResult && selected
                      ? '#c62828'
                      : '#333'
                  }}>
                    {item.target}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  const renderStandardOptions = (exercise: Exercise) => {
    if (!exercise.options) return null;

    return (
      <View style={{ gap: 12, marginBottom: 30 }}>
        {exercise.options.map((option, index) => {
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
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: category === 'imagebased' ? 20 : 16,
                  borderRadius: category === 'imagebased' ? 16 : 12,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: category === 'imagebased' ? 8 : 4,
                  elevation: category === 'imagebased' ? 3 : 2,
                  position: 'relative'
                },
                buttonStyle
              ]}
              onPress={() => handleAnswerSelect(option)}
              disabled={showResult || loading}
            >
              {category === 'imagebased' && (
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: textColor + '20',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 16
                  }}>
                    <Text style={{
                      fontSize: 18,
                      fontWeight: 'bold',
                      color: textColor
                    }}>
                      {String.fromCharCode(65 + index)}
                    </Text>
                  </View>
                </View>
              )}

              <Text style={{
                fontSize: category === 'imagebased' ? 18 : 16,
                fontWeight: '600',
                color: textColor,
                textAlign: 'center',
                flex: category === 'imagebased' ? 1 : undefined
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
    );
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
          paddingBottom: layout.isWeb ? 40 : 20
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

            {/* Category-specific Content */}
            {category === 'filltheblanks' && renderFillTheBlanksContent(currentExercise)}
            {category === 'grammar' && renderGrammarContent(currentExercise)}
            {category === 'imagebased' && renderImageBasedContent(currentExercise)}
            {category === 'sentences' && renderSentencesContent(currentExercise)}
            {category === 'vocabulary' && renderVocabularyContent(currentExercise)}

            {/* Standard question display for non-special categories */}
            {!['filltheblanks', 'sentences', 'vocabulary'].includes(String(category)) && (
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
            )}

            {/* Options */}
            {category === 'filltheblanks' && renderFillTheBlanksOptions(currentExercise)}
            {(['grammar', 'imagebased'].includes(String(category)) ||
              (!['filltheblanks', 'sentences', 'vocabulary'].includes(String(category)))) &&
              renderStandardOptions(currentExercise)}

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
            {showResult && result && category !== 'sentences' && (
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
                opacity: (!showResult && !isAnswerComplete()) || loading ? 0.6 : 1
              }}
              onPress={showResult ? nextQuestion : submitAnswer}
              disabled={(!showResult && !isAnswerComplete()) || loading}
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