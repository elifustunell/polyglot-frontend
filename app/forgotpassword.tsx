// app/forgotpassword.tsx - Düzeltilmiş forgot password
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/Theme';
import { ResponsiveStyles } from '@/constants/ResponsiveTheme';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const { user, loading: authLoading, resetPassword } = useAuth();
  const layout = useResponsiveLayout();

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

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      setEmailSent(true);
      Alert.alert(
        'Email Sent!',
        'Password reset instructions have been sent to your email address.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message);
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

            <Text style={layout.isWeb ? ResponsiveStyles.webTitle : {
              fontSize: layout.fontSize.xlarge,
              fontWeight: 'bold',
              color: Colors.text
            }}>
              Reset Password
            </Text>
          </View>

          {!emailSent ? (
            <>
              {/* Icon */}
              <View style={{
                alignItems: 'center',
                marginBottom: 30
              }}>
                <View style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: Colors.primary + '20',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 16
                }}>
                  <Ionicons name="mail-outline" size={40} color={Colors.primary} />
                </View>

                <Text style={{
                  fontSize: layout.fontSize.medium,
                  color: '#666',
                  textAlign: 'center',
                  lineHeight: 24
                }}>
                  Enter your email address and we'll send you instructions to reset your password.
                </Text>
              </View>

              {/* Email Input */}
              <View style={layout.isWeb ? ResponsiveStyles.webFormGroup : { marginBottom: 24 }}>
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

              {/* Send Reset Email Button */}
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
                onPress={handleForgotPassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="mail-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={layout.isWeb ? ResponsiveStyles.webButtonText : {
                      color: '#fff',
                      fontSize: layout.fontSize.medium,
                      fontWeight: '600'
                    }}>
                      Send Reset Email
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </>
          ) : (
            /* Success State */
            <View style={{ alignItems: 'center' }}>
              <View style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: '#4caf50' + '20',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 24
              }}>
                <Ionicons name="checkmark-circle" size={40} color="#4caf50" />
              </View>

              <Text style={{
                fontSize: layout.fontSize.large,
                fontWeight: '600',
                color: Colors.text,
                textAlign: 'center',
                marginBottom: 16
              }}>
                Check Your Email
              </Text>

              <Text style={{
                fontSize: layout.fontSize.medium,
                color: '#666',
                textAlign: 'center',
                lineHeight: 24,
                marginBottom: 32
              }}>
                We've sent password reset instructions to{'\n'}
                <Text style={{ fontWeight: '600', color: Colors.primary }}>
                  {email}
                </Text>
              </Text>

              <TouchableOpacity
                style={layout.isWeb ? ResponsiveStyles.webButton : {
                  backgroundColor: Colors.primary,
                  padding: 16,
                  borderRadius: 8,
                  alignItems: 'center',
                  marginBottom: 16
                }}
                onPress={() => router.push('/login')}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="arrow-back" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={layout.isWeb ? ResponsiveStyles.webButtonText : {
                    color: '#fff',
                    fontSize: layout.fontSize.medium,
                    fontWeight: '600'
                  }}>
                    Back to Login
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setEmailSent(false);
                  setEmail('');
                }}
              >
                <Text style={{
                  fontSize: layout.fontSize.small,
                  color: Colors.primary,
                  fontWeight: '600'
                }}>
                  Didn't receive email? Try again
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Back to Login Link */}
          {!emailSent && (
            <Text style={{
              textAlign: 'center',
              fontSize: layout.fontSize.small,
              color: '#666'
            }}>
              Remember your password?{' '}
              <Text
                style={{ color: Colors.primary, fontWeight: '600' }}
                onPress={() => router.push('/login')}
              >
                Back to Login
              </Text>
            </Text>
          )}

          {/* Additional Help */}
          <View style={{
            backgroundColor: '#e3f2fd',
            borderRadius: 12,
            padding: 16,
            marginTop: 24,
            borderLeft: '4px solid #2196f3'
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 8
            }}>
              <Ionicons name="help-circle-outline" size={20} color="#1976d2" />
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#1565c0',
                marginLeft: 8
              }}>
                Need Help?
              </Text>
            </View>
            <Text style={{
              fontSize: 14,
              color: '#1565c0',
              lineHeight: 20
            }}>
              • Check your spam/junk folder{'\n'}
              • Make sure you entered the correct email{'\n'}
              • It may take a few minutes to receive the email{'\n'}
              • If you still don't receive it, try again or contact support
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}