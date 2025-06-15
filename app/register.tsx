// app/register.tsx - Modern toast bildirimleri ile güncellenmiş

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Animated } from 'react-native';
import { Colors } from '@/constants/Theme';
import { ResponsiveStyles } from '@/constants/ResponsiveTheme';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import Checkbox from 'expo-checkbox';
import Ionicons from '@expo/vector-icons/Ionicons';

// Toast Component
const Toast = ({ message, type = 'info', visible, onHide }: {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  visible: boolean;
  onHide: () => void;
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
      }, 4000);

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
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
        zIndex: 1000,
        borderLeftWidth: 4,
        borderLeftColor: getToastColor(),
        transform: [{ translateY }],
        opacity,
      }}
    >
      <View style={{
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: getToastColor() + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
      }}>
        <Ionicons
          name={getToastIcon()}
          size={20}
          color={getToastColor()}
        />
      </View>

      <Text style={{
        flex: 1,
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
        lineHeight: 22,
      }}>
        {message}
      </Text>

      <TouchableOpacity
        onPress={onHide}
        style={{
          padding: 4,
          marginLeft: 8,
        }}
      >
        <Ionicons name="close" size={18} color="#666" />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({
    visible: false,
    message: '',
    type: 'info'
  });

  const { register, user, loading: authLoading } = useAuth();
  const layout = useResponsiveLayout();

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  // Eğer kullanıcı zaten giriş yapmışsa yönlendir
  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/language-selection');
    }
  }, [user, authLoading]);

  // Auth loading state
  if (authLoading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5'
      }}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{
          marginTop: 16,
          fontSize: 16,
          color: '#666'
        }}>
          Loading...
        </Text>
      </View>
    );
  }

  // Eğer user varsa boş return
  if (user) {
    return null;
  }

  const handleRegister = async () => {
    // Comprehensive validation with toast messages
    if (!name.trim()) {
      showToast('Please enter your full name to continue.', 'warning');
      return;
    }

    if (name.trim().length < 2) {
      showToast('Please enter a valid name (at least 2 characters).', 'warning');
      return;
    }

    if (!email.trim()) {
      showToast('Please enter your email address to continue.', 'warning');
      return;
    }

    if (!email.includes('@') || !email.includes('.') || email.length < 5) {
      showToast('Please enter a valid email address (e.g., user@example.com)', 'error');
      return;
    }

    if (!password) {
      showToast('Please create a password to secure your account.', 'warning');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters long for security.', 'warning');
      return;
    }

    if (password.length > 128) {
      showToast('Password must be less than 128 characters.', 'warning');
      return;
    }

    if (!confirmPassword) {
      showToast('Please confirm your password by typing it again.', 'warning');
      return;
    }

    if (password !== confirmPassword) {
      showToast('The passwords you entered don\'t match. Please check and try again.', 'error');
      return;
    }

    if (!agreeTerms) {
      showToast('Please agree to the Terms of Service and Privacy Policy to continue.', 'warning');
      return;
    }

    setLoading(true);
    try {
      console.log('👤 Starting registration process...');
      await register(email, password, name);
      console.log('✅ Registration completed successfully');

      // Show success toast
      showToast(`🎉 Welcome to PolyGlotPal, ${name}! Account created successfully.`, 'success');

      // Redirect after a short delay
      setTimeout(() => {
        router.replace('/language-selection');
      }, 2000);

    } catch (error: any) {
      console.error('❌ Registration failed:', error);

      // Show specific error messages based on Firebase error codes
      let message = 'An unexpected error occurred. Please try again.';

      if (error.code === 'auth/email-already-in-use') {
        message = 'An account with this email already exists. Please use a different email or try logging in.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'The email address is not valid. Please enter a correct email address.';
      } else if (error.code === 'auth/operation-not-allowed') {
        message = 'Email/password registration is currently disabled. Please contact support.';
      } else if (error.code === 'auth/weak-password') {
        message = 'The password is too weak. Please choose a stronger password with letters, numbers, and symbols.';
      } else if (error.code === 'auth/network-request-failed') {
        message = 'Please check your internet connection and try again.';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Too many registration attempts. Please wait a few minutes before trying again.';
      } else if (error.message) {
        message = error.message;
      }

      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = layout.isWeb ?
    ResponsiveStyles.webContainer :
    { flex: 1, backgroundColor: '#f5f5f5' };

  const cardStyle = layout.isWeb ?
    ResponsiveStyles.webCard :
    { flex: 1, backgroundColor: '#fff', margin: 20, borderRadius: 12, padding: 20 };

  return (
    <View style={containerStyle}>
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
      />

      <ScrollView
        contentContainerStyle={layout.isWeb ? {} : { flexGrow: 1, justifyContent: 'center' }}
        showsVerticalScrollIndicator={false}
      >
        <View style={cardStyle}>
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 30
          }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                padding: 8,
                marginRight: 16,
                borderRadius: 8,
                backgroundColor: '#f8f9fa'
              }}
            >
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>

            <View style={{ flex: 1 }}>
              <Text style={layout.isWeb ? ResponsiveStyles.webTitle : {
                fontSize: layout.fontSize.xlarge,
                fontWeight: 'bold',
                color: Colors.text
              }}>
                Create Account
              </Text>

              <Text style={{
                fontSize: layout.fontSize.medium,
                color: '#666',
                marginTop: 4
              }}>
                Join PolyGlotPal and start learning!
              </Text>
            </View>
          </View>

          {/* Name Input */}
          <View style={layout.isWeb ? ResponsiveStyles.webFormGroup : { marginBottom: 20 }}>
            <Text style={layout.isWeb ? ResponsiveStyles.webLabel : {
              fontSize: layout.fontSize.medium,
              fontWeight: 'bold',
              color: Colors.text,
              marginBottom: 8
            }}>
              Full Name <Text style={{ color: '#f44336' }}>*</Text>
            </Text>
            <TextInput
              style={[
                layout.isWeb ? ResponsiveStyles.webInput : {
                  borderWidth: 1,
                  borderColor: name.trim().length >= 2 ? '#4caf50' :
                              (name.length > 0 && name.trim().length < 2) ? '#f44336' : '#ddd',
                  padding: 12,
                  borderRadius: 8,
                  fontSize: layout.fontSize.medium
                },
                focusedInput === 'name' && (layout.isWeb ? ResponsiveStyles.webInputFocused : {
                  borderColor: Colors.primary
                })
              ]}
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              autoCapitalize="words"
              onFocus={() => setFocusedInput('name')}
              onBlur={() => setFocusedInput(null)}
            />
            {name.length > 0 && name.trim().length < 2 && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <Ionicons name="warning-outline" size={14} color="#f44336" />
                <Text style={{ fontSize: 12, color: '#f44336', marginLeft: 4 }}>
                  Name must be at least 2 characters
                </Text>
              </View>
            )}
          </View>

          {/* Email Input */}
          <View style={layout.isWeb ? ResponsiveStyles.webFormGroup : { marginBottom: 20 }}>
            <Text style={layout.isWeb ? ResponsiveStyles.webLabel : {
              fontSize: layout.fontSize.medium,
              fontWeight: 'bold',
              color: Colors.text,
              marginBottom: 8
            }}>
              Email Address <Text style={{ color: '#f44336' }}>*</Text>
            </Text>
            <TextInput
              style={[
                layout.isWeb ? ResponsiveStyles.webInput : {
                  borderWidth: 1,
                  borderColor: (email.includes('@') && email.includes('.')) ? '#4caf50' :
                              (email.length > 0 && (!email.includes('@') || !email.includes('.'))) ? '#f44336' : '#ddd',
                  padding: 12,
                  borderRadius: 8,
                  fontSize: layout.fontSize.medium
                },
                focusedInput === 'email' && (layout.isWeb ? ResponsiveStyles.webInputFocused : {
                  borderColor: Colors.primary
                })
              ]}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email address"
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setFocusedInput('email')}
              onBlur={() => setFocusedInput(null)}
            />
            {email.length > 0 && (!email.includes('@') || !email.includes('.')) && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <Ionicons name="warning-outline" size={14} color="#f44336" />
                <Text style={{ fontSize: 12, color: '#f44336', marginLeft: 4 }}>
                  Please enter a valid email address
                </Text>
              </View>
            )}
          </View>

          {/* Password Input */}
          <View style={layout.isWeb ? ResponsiveStyles.webFormGroup : { marginBottom: 20 }}>
            <Text style={layout.isWeb ? ResponsiveStyles.webLabel : {
              fontSize: layout.fontSize.medium,
              fontWeight: 'bold',
              color: Colors.text,
              marginBottom: 8
            }}>
              Password <Text style={{ color: '#f44336' }}>*</Text>
            </Text>
            <View style={{ position: 'relative' }}>
              <TextInput
                style={[
                  layout.isWeb ? ResponsiveStyles.webInput : {
                    borderWidth: 1,
                    borderColor: password.length >= 6 ? '#4caf50' :
                                (password.length > 0 && password.length < 6) ? '#f44336' : '#ddd',
                    padding: 12,
                    borderRadius: 8,
                    fontSize: layout.fontSize.medium,
                    paddingRight: 50
                  },
                  focusedInput === 'password' && (layout.isWeb ? ResponsiveStyles.webInputFocused : {
                    borderColor: Colors.primary
                  })
                ]}
                value={password}
                onChangeText={setPassword}
                placeholder="Create a strong password"
                secureTextEntry={!showPassword}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
              />
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  right: 12,
                  top: 12,
                  padding: 4
                }}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              <Ionicons
                name={password.length >= 6 ? "checkmark-circle" : "information-circle-outline"}
                size={14}
                color={password.length >= 6 ? '#4caf50' : '#666'}
              />
              <Text style={{
                fontSize: 12,
                color: password.length >= 6 ? '#4caf50' : '#666',
                marginLeft: 4
              }}>
                Must be at least 6 characters
              </Text>
            </View>
          </View>

          {/* Confirm Password Input */}
          <View style={layout.isWeb ? ResponsiveStyles.webFormGroup : { marginBottom: 20 }}>
            <Text style={layout.isWeb ? ResponsiveStyles.webLabel : {
              fontSize: layout.fontSize.medium,
              fontWeight: 'bold',
              color: Colors.text,
              marginBottom: 8
            }}>
              Confirm Password <Text style={{ color: '#f44336' }}>*</Text>
            </Text>
            <View style={{ position: 'relative' }}>
              <TextInput
                style={[
                  layout.isWeb ? ResponsiveStyles.webInput : {
                    borderWidth: 1,
                    borderColor: (confirmPassword.length > 0 && password === confirmPassword) ? '#4caf50' :
                                (confirmPassword.length > 0 && password !== confirmPassword) ? '#f44336' : '#ddd',
                    padding: 12,
                    borderRadius: 8,
                    fontSize: layout.fontSize.medium,
                    paddingRight: 50
                  },
                  focusedInput === 'confirmPassword' && (layout.isWeb ? ResponsiveStyles.webInputFocused : {
                    borderColor: Colors.primary
                  })
                ]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm your password"
                secureTextEntry={!showConfirmPassword}
                onFocus={() => setFocusedInput('confirmPassword')}
                onBlur={() => setFocusedInput(null)}
              />
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  right: 12,
                  top: 12,
                  padding: 4
                }}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
            {confirmPassword.length > 0 && password !== confirmPassword && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <Ionicons name="close-circle-outline" size={14} color="#f44336" />
                <Text style={{ fontSize: 12, color: '#f44336', marginLeft: 4 }}>
                  Passwords don't match
                </Text>
              </View>
            )}
            {confirmPassword.length > 0 && password === confirmPassword && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <Ionicons name="checkmark-circle" size={14} color="#4caf50" />
                <Text style={{ fontSize: 12, color: '#4caf50', marginLeft: 4 }}>
                  Passwords match
                </Text>
              </View>
            )}
          </View>

          {/* Terms Agreement */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            marginBottom: 32,
            backgroundColor: agreeTerms ? '#e8f5e8' : '#fff3e0',
            padding: 16,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: agreeTerms ? '#4caf50' : '#ff9800'
          }}>
            <Checkbox
              style={{ marginRight: 12, marginTop: 2 }}
              value={agreeTerms}
              onValueChange={setAgreeTerms}
              color={Colors.primary}
            />
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: layout.fontSize.small,
                color: Colors.text,
                lineHeight: 20
              }}>
                I agree to the{' '}
                <Text style={{ color: Colors.primary, fontWeight: '600' }}>
                  Terms of Service
                </Text>
                {' '}and{' '}
                <Text style={{ color: Colors.primary, fontWeight: '600' }}>
                  Privacy Policy
                </Text>
              </Text>
              {!agreeTerms && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <Ionicons name="warning-outline" size={12} color="#f57c00" />
                  <Text style={{ fontSize: 11, color: '#f57c00', marginLeft: 4 }}>
                    Required to create an account
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={[
              layout.isWeb ? ResponsiveStyles.webButton : {
                backgroundColor: Colors.primary,
                padding: 16,
                borderRadius: 8,
                alignItems: 'center',
                marginBottom: 24,
                shadowColor: Colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6
              },
              {
                opacity: (name.trim().length >= 2 &&
                         email.includes('@') && email.includes('.') &&
                         password.length >= 6 &&
                         password === confirmPassword &&
                         agreeTerms && !loading) ? 1 : 0.6
              }
            ]}
            onPress={handleRegister}
            disabled={loading ||
                     name.trim().length < 2 ||
                     !email.includes('@') ||
                     !email.includes('.') ||
                     password.length < 6 ||
                     password !== confirmPassword ||
                     !agreeTerms}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="person-add-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={layout.isWeb ? ResponsiveStyles.webButtonText : {
                  color: '#fff',
                  fontSize: layout.fontSize.medium,
                  fontWeight: '600'
                }}>
                  Create Account
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <Text style={{
            textAlign: 'center',
            fontSize: layout.fontSize.small,
            color: '#666'
          }}>
            Already have an account?{' '}
            <Text
              style={{ color: Colors.primary, fontWeight: '600' }}
              onPress={() => router.replace('/login')}
            >
              Sign In
            </Text>
          </Text>


        </View>
      </ScrollView>
    </View>
  );
}