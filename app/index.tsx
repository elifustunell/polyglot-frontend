// app/index.tsx - Düzeltilmiş Welcome Screen
import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Colors, GlobalStyles } from '@/constants/Theme';
import { ResponsiveStyles } from '@/constants/ResponsiveTheme';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function WelcomeScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();
  const { user, loading } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  // Component mount tracking
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auth state kontrolü - SADECE user varsa yönlendir
  useEffect(() => {
    if (isMounted && !loading && user) {
      console.log('User found, redirecting to language selection:', user.email);
      router.replace('/language-selection');
    }
  }, [user, loading, isMounted, router]);

  // Loading state - auth loading bitene kadar bekle
  if (loading || !isMounted) {
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

  // Eğer user varsa null return (yönlendirilecek)
  if (user) {
    return null;
  }

  // User yoksa Welcome Screen'i göster
  console.log('No user found, showing welcome screen');

  const containerStyle = layout.isWeb ?
    ResponsiveStyles.webContainer :
    GlobalStyles.container;

  const cardStyle = layout.isWeb ?
    { ...ResponsiveStyles.webCard, minHeight: '90vh' } :
    { flex: 1, padding: 20 };

  return (
    <View style={containerStyle}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingVertical: layout.isWeb ? 40 : 20
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={cardStyle}>
          {/* Logo and Title */}
          <View style={{ alignItems: 'center', marginBottom: 40 }}>
            <View style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: Colors.primary + '20',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 24,
              shadowColor: Colors.primary,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 12
            }}>
              <Ionicons name="language" size={50} color={Colors.primary} />
            </View>

            <Text style={layout.isWeb ? ResponsiveStyles.webTitle : {
              textAlign: 'center',
              fontSize: layout.fontSize.xlarge * 1.3,
              fontWeight: 'bold',
              fontFamily: 'Arial',
              color: Colors.primary,
              marginBottom: 12
            }}>
              Welcome to PolyGlotPal!
            </Text>

            <Text style={layout.isWeb ? ResponsiveStyles.webSubtitle : {
              textAlign: 'center',
              fontSize: layout.fontSize.large,
              fontWeight: '600',
              color: '#333',
              marginBottom: 8
            }}>
              Learn a language for free, Forever
            </Text>

            <Text style={{
              textAlign: 'center',
              fontSize: layout.fontSize.medium,
              color: '#666',
              fontStyle: 'italic'
            }}>
              Master new languages with interactive lessons
            </Text>
          </View>

          {/* Hero Image */}
          <View style={{ alignItems: 'center', marginBottom: 40 }}>
            <View style={{
              backgroundColor: '#fff',
              borderRadius: 24,
              padding: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.15,
              shadowRadius: 24,
              elevation: 12
            }}>
              <Image
                source={require('../assets/images/language.png')}
                style={{
                  width: layout.isWeb ? 280 : layout.screenWidth * 0.55,
                  height: layout.isWeb ? 220 : layout.screenWidth * 0.44,
                  borderRadius: 16
                }}
                contentFit="contain"
              />
            </View>
          </View>

          {/* Features */}
          <View style={{
            backgroundColor: '#f8f9fa',
            borderRadius: 20,
            padding: 24,
            marginBottom: 32,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 6
          }}>
            <Text style={{
              fontSize: layout.fontSize.large,
              fontWeight: '700',
              color: Colors.text,
              textAlign: 'center',
              marginBottom: 20
            }}>
              Why Choose PolyGlotPal?
            </Text>

            <View style={{ gap: 16 }}>
              {[
                { icon: '🎯', text: 'Interactive learning exercises', color: '#FF6B6B' },
                { icon: '🏆', text: 'Track your progress daily', color: '#4ECDC4' },
                { icon: '🌍', text: 'Multiple language support', color: '#45B7D1' },
                { icon: '💯', text: 'Completely free forever', color: '#96CEB4' }
              ].map((feature, index) => (
                <View key={index} style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#fff',
                  padding: 16,
                  borderRadius: 12,
                  shadowColor: feature.color,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 3
                }}>
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: feature.color + '20',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 16
                  }}>
                    <Text style={{ fontSize: 20 }}>{feature.icon}</Text>
                  </View>
                  <Text style={{
                    fontSize: layout.fontSize.medium,
                    color: Colors.text,
                    fontWeight: '500',
                    flex: 1
                  }}>
                    {feature.text}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={{
            alignItems: 'center',
            gap: 16,
          }}>
            {/* Get Started Button */}
            <TouchableOpacity
              style={layout.isWeb ? ResponsiveStyles.webButton : [
                GlobalStyles.button,
                {
                  width: layout.buttonWidth,
                  marginBottom: 0,
                  backgroundColor: Colors.primary,
                  shadowColor: Colors.primary,
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.4,
                  shadowRadius: 12,
                  elevation: 8,
                  borderRadius: 16
                }
              ]}
              onPress={() => {
                console.log('Navigating to register');
                router.push('/register');
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="rocket-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={layout.isWeb ? ResponsiveStyles.webButtonText : [
                  GlobalStyles.buttonText,
                  { fontSize: layout.fontSize.medium, fontWeight: '700' }
                ]}>
                  Get Started - It's Free!
                </Text>
              </View>
            </TouchableOpacity>

            {/* Sign In Button */}
            <TouchableOpacity
              style={layout.isWeb ? [
                ResponsiveStyles.webButton,
                ResponsiveStyles.webButtonSecondary
              ] : [
                GlobalStyles.button,
                {
                  width: layout.buttonWidth,
                  backgroundColor: 'transparent',
                  borderWidth: 2,
                  borderColor: Colors.primary,
                  borderRadius: 16
                }
              ]}
              onPress={() => {
                console.log('Navigating to login');
                router.push('/login');
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="person-outline" size={20} color={Colors.primary} style={{ marginRight: 8 }} />
                <Text style={layout.isWeb ? ResponsiveStyles.webButtonSecondaryText : [
                  GlobalStyles.buttonText,
                  { fontSize: layout.fontSize.medium, color: Colors.primary, fontWeight: '600' }
                ]}>
                  I Already Have an Account
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={{
            marginTop: 40,
            paddingTop: 24,
            borderTopWidth: 1,
            borderTopColor: '#e0e0e0',
            alignItems: 'center'
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 8
            }}>
              <Ionicons name="people-outline" size={16} color="#888" />
              <Text style={{
                fontSize: layout.fontSize.small,
                color: '#888',
                marginLeft: 4,
                fontWeight: '500'
              }}>
                Join millions of learners worldwide
              </Text>
            </View>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center'
            }}>
              <Ionicons name="shield-checkmark-outline" size={16} color="#4CAF50" />
              <Text style={{
                fontSize: layout.fontSize.small,
                color: '#4CAF50',
                marginLeft: 4,
                fontWeight: '500'
              }}>
                100% Free & Secure
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}