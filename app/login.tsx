// app/login.tsx - Modern toast bildirimleri ile
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

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

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

  const { login, user, loading: authLoading } = useAuth();
  const layout = useResponsiveLayout();

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  // Redirect if user is already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      console.log('✅ User found in login, redirecting...');
      router.replace('/language-selection');
    }
  }, [user, authLoading]);

  if (authLoading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5'
      }}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#666' }}>Loading...</Text>
      </View>
    );
  }

  if (user) {
    return null;
  }

  const handleLogin = async () => {
    // Basic validation with toast messages
    if (!email || !password) {
      showToast('Please fill in all fields to continue.', 'warning');
      return;
    }

    if (!email.includes('@')) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    setLoading(true);

    try {
      console.log('🔐 Starting login process...');
      await login(email, password);
      showToast('Login successful! Welcome back!', 'success');
      console.log('✅ Login completed, should redirect automatically');
    } catch (error: any) {
      console.error('❌ Login failed in component:', error.message);

      // Show detailed error message with toast
      let errorMessage = 'Login failed. Please try again.';

      if (error.message.includes('user-not-found')) {
        errorMessage = 'No account found with this email address.';
      } else if (error.message.includes('wrong-password')) {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.message.includes('invalid-email')) {
        errorMessage = 'Invalid email address format.';
      } else if (error.message.includes('too-many-requests')) {
        errorMessage = 'Too many login attempts. Please wait and try again.';
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      showToast(errorMessage, 'error');
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
                Welcome Back!
              </Text>

              <Text style={{
                fontSize: layout.fontSize.medium,
                color: '#666',
                marginTop: 4
              }}>
                Sign in to continue your learning journey
              </Text>
            </View>
          </View>

          {/* Email Input */}
          <View style={layout.isWeb ? ResponsiveStyles.webFormGroup : { marginBottom: 20 }}>
            <Text style={layout.isWeb ? ResponsiveStyles.webLabel : {
              fontSize: layout.fontSize.medium,
              fontWeight: 'bold',
              color: Colors.text,
              marginBottom: 8
            }}>
              Email Address
            </Text>
            <TextInput
              style={[
                layout.isWeb ? ResponsiveStyles.webInput : {
                  borderWidth: 1,
                  borderColor: '#ddd',
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
          </View>

          {/* Password Input */}
          <View style={layout.isWeb ? ResponsiveStyles.webFormGroup : { marginBottom: 20 }}>
            <Text style={layout.isWeb ? ResponsiveStyles.webLabel : {
              fontSize: layout.fontSize.medium,
              fontWeight: 'bold',
              color: Colors.text,
              marginBottom: 8
            }}>
              Password
            </Text>
            <View style={{ position: 'relative' }}>
              <TextInput
                style={[
                  layout.isWeb ? ResponsiveStyles.webInput : {
                    borderWidth: 1,
                    borderColor: '#ddd',
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
                placeholder="Enter your password"
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
          </View>

          {/* Remember Me & Forgot Password */}
          <View style={{
            flexDirection: layout.isWeb ? 'row' : 'column',
            justifyContent: 'space-between',
            alignItems: layout.isWeb ? 'center' : 'flex-start',
            marginBottom: 32,
            gap: layout.isWeb ? 0 : 16
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Checkbox
                style={{ marginRight: 8 }}
                value={rememberMe}
                onValueChange={setRememberMe}
                color={Colors.primary}
              />
              <Text style={{ fontSize: layout.fontSize.small, color: Colors.text }}>
                Remember me
              </Text>
            </View>

            <TouchableOpacity onPress={() => router.push('/forgotpassword')}>
              <Text style={{
                fontSize: layout.fontSize.small,
                color: Colors.primary,
                fontWeight: '600'
              }}>
                Forgot Password?
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={layout.isWeb ? ResponsiveStyles.webButton : {
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
            }}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="log-in-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={layout.isWeb ? ResponsiveStyles.webButtonText : {
                  color: '#fff',
                  fontSize: layout.fontSize.medium,
                  fontWeight: '600'
                }}>
                  Sign In
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Sign Up Link */}
          <Text style={{
            textAlign: 'center',
            fontSize: layout.fontSize.small,
            color: '#666'
          }}>
            Don't have an account?{' '}
            <Text
              style={{ color: Colors.primary, fontWeight: '600' }}
              onPress={() => router.replace('/register')}
            >
              Sign Up
            </Text>
          </Text>


        </View>
      </ScrollView>
    </View>
  );
}