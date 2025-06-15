// app/(tabs)/settings.tsx - Functional Dark Mode with ThemeContext

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Switch, ScrollView, ActivityIndicator, Animated } from 'react-native';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter, useFocusEffect } from 'expo-router';

// Toast Component with Dark Mode Support
const Toast = ({ message, type = 'info', visible, onHide }: {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  visible: boolean;
  onHide: () => void;
}) => {
  const { colors } = useTheme();
  const translateY = new Animated.Value(-100);
  const opacity = new Animated.Value(0);

  const getToastColor = () => {
    switch (type) {
      case 'success': return colors.success;
      case 'error': return colors.error;
      case 'warning': return colors.warning;
      default: return colors.info;
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
      }, 3000);

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
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: colors.shadow,
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
        color: colors.text,
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
        <Ionicons name="close" size={18} color={colors.textSecondary} />
      </TouchableOpacity>
    </Animated.View>
  );
};

// Logout Confirmation Modal Component with Dark Mode
const LogoutModal = ({ visible, onConfirm, onCancel, loading }: {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) => {
  const { colors } = useTheme();
  const opacity = new Animated.Value(0);

  React.useEffect(() => {
    if (visible) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1001,
        opacity,
      }}
    >
      <View style={{
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 24,
        margin: 20,
        minWidth: 280,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 12,
      }}>
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <View style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: colors.warning + '20',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 16,
          }}>
            <Ionicons name="log-out-outline" size={28} color={colors.warning} />
          </View>

          <Text style={{
            fontSize: 20,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 8,
            textAlign: 'center',
          }}>
            Logout Confirmation
          </Text>

          <Text style={{
            fontSize: 16,
            color: colors.textSecondary,
            textAlign: 'center',
            lineHeight: 22,
          }}>
            Are you sure you want to logout? You will need to sign in again next time.
          </Text>
        </View>

        <View style={{
          flexDirection: 'row',
          gap: 12,
        }}>
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: colors.surface,
              padding: 14,
              borderRadius: 12,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.border,
            }}
            onPress={onCancel}
            disabled={loading}
          >
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: colors.textSecondary,
            }}>
              Cancel
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: loading ? colors.error + '80' : colors.error,
              padding: 14,
              borderRadius: 12,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
            }}
            onPress={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
            ) : (
              <Ionicons name="log-out-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
            )}
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: '#fff',
            }}>
              {loading ? 'Logging out...' : 'Logout'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

export default function SettingsScreen() {
  const { sourceLang, targetLang } = useLanguage();
  const { logout, user, loading } = useAuth();
  const { colors, isDarkMode, toggleDarkMode } = useTheme();
  const router = useRouter();
  const layout = useResponsiveLayout();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Real-time user name - will update when user changes name in profile
  const [userName, setUserName] = useState(user?.displayName || user?.email?.split('@')[0] || 'User');

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

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && !user && isMounted) {
      console.log('🚪 User logged out, redirecting to welcome screen');
      showToast('Successfully logged out. See you next time!', 'success');

      const timer = setTimeout(() => {
        router.replace('/login');
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [user, loading, isMounted, router]);

  // Update user name when user object changes (real-time sync)
  useEffect(() => {
    if (user) {
      const newName = user.displayName || user.email?.split('@')[0] || 'User';
      setUserName(newName);
      console.log('👤 User name updated in Settings:', newName);
    }
  }, [user?.displayName, user?.email]);

  // Refresh user data when screen focuses
  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        const newName = user.displayName || user.email?.split('@')[0] || 'User';
        setUserName(newName);
        console.log('🔄 Settings screen focused, refreshing user name:', newName);
      }
    }, [user])
  );

  // Early returns - hook'lardan sonra
  if (loading || !isMounted) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background
      }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{
          marginTop: 16,
          fontSize: 16,
          color: colors.textSecondary
        }}>
          Loading...
        </Text>
      </View>
    );
  }

  if (!user) {
    return null;
  }

  const handleLogoutPress = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    try {
      console.log('🚪 Logout confirmed, calling logout...');
      await logout();
      console.log('✅ Logout completed successfully');
      setShowLogoutModal(false);

      // Hemen yönlendir, eğer useEffect çalışmazsa
      showToast('Successfully logged out. See you next time!', 'success');

      setTimeout(() => {
        console.log('🔄 Force redirecting to welcome screen...');
        router.replace('/login');
      }, 1000);

    } catch (error: any) {
      console.error('❌ Logout error in settings:', error);
      setIsLoggingOut(false);
      setShowLogoutModal(false);

      const errorMessage = error.message || 'Failed to logout. Please try again.';
      showToast(errorMessage, 'error');
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  const handleNotificationToggle = (value: boolean) => {
    setPushNotifications(value);
    showToast(
      value ? 'Push notifications enabled' : 'Push notifications disabled',
      'info'
    );
  };

  const handleDarkModeToggle = async () => {
    const newMode = !isDarkMode;
    toggleDarkMode();
    showToast(
      newMode ? 'Dark mode enabled! 🌙' : 'Light mode enabled! ☀️',
      'success'
    );
  };

  const containerStyle = layout.isWeb ? {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  } : {
    flex: 1,
    backgroundColor: colors.background
  };

  const cardStyle = layout.isWeb ? {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 40,
    width: '100%',
    maxWidth: 800,
    minHeight: '90vh',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6
  } : {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 0
  };

  return (
    <View style={containerStyle}>
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
      />

      <LogoutModal
        visible={showLogoutModal}
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
        loading={isLoggingOut}
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
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: layout.isWeb ? 0 : 20,
            paddingVertical: 16,
            marginBottom: layout.isWeb ? 30 : 20
          }}>
            <TouchableOpacity
              style={{
                padding: 8,
                borderRadius: 8,
                backgroundColor: colors.surface
              }}
              onPress={() => router.push('/(tabs)/mainscreen')}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={{
              flex: 1,
              textAlign: 'center',
              fontSize: layout.fontSize?.xlarge || 24,
              fontWeight: 'bold',
              color: colors.text
            }}>
              Settings
            </Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={{
            paddingHorizontal: layout.isWeb ? 0 : 16
          }}>
            {/* User Info Section with Real-time Name */}
            <View style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 20,
              marginBottom: 24,
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.border
            }}>
              <View style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: colors.primary + '20',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 16
              }}>
                <Ionicons name="person" size={30} color={colors.primary} />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: colors.text,
                  marginBottom: 4
                }}>
                  {userName}
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: colors.textSecondary
                }}>
                  {user?.email}
                </Text>
                <View style={{
                  backgroundColor: colors.success,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 4,
                  alignSelf: 'flex-start',
                  marginTop: 4
                }}>
                  <Text style={{ color: '#fff', fontSize: 12, fontWeight: '500' }}>
                    Active Session
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => router.push('/(tabs)/profile')}
                style={{
                  padding: 8,
                  borderRadius: 8,
                  backgroundColor: colors.background
                }}
              >
                <Ionicons name="create-outline" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Learning Section */}
            <View style={{ marginBottom: 32 }}>
              <Text style={{
                fontSize: 18,
                fontWeight: '600',
                marginBottom: 16,
                color: colors.text
              }}>
                Learning
              </Text>

              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: colors.surface,
                  padding: 16,
                  borderRadius: 12,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: colors.border
                }}
                onPress={() => router.push('/language-selection')}
              >
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: colors.info + '20',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 12
                }}>
                  <Ionicons name="language-outline" size={20} color={colors.info} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '500',
                    color: colors.text
                  }}>
                    Change Language
                  </Text>
                  <Text style={{
                    fontSize: 14,
                    color: colors.textSecondary,
                    marginTop: 2
                  }}>
                    {sourceLang} → {targetLang}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: colors.surface,
                  padding: 16,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.border
                }}
                onPress={() => router.push('/(tabs)/profile')}
              >
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: colors.warning + '20',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 12
                }}>
                  <Ionicons name="stats-chart-outline" size={20} color={colors.warning} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '500',
                    color: colors.text
                  }}>
                    View Progress
                  </Text>
                  <Text style={{
                    fontSize: 14,
                    color: colors.textSecondary,
                    marginTop: 2
                  }}>
                    Track your learning journey
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Preferences Section */}
            <View style={{ marginBottom: 32 }}>
              <Text style={{
                fontSize: 18,
                fontWeight: '600',
                marginBottom: 16,
                color: colors.text
              }}>
                Preferences
              </Text>

              <View style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border,
                overflow: 'hidden'
              }}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border
                }}>
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: colors.success + '20',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12
                  }}>
                    <Ionicons name="notifications-outline" size={20} color={colors.success} />
                  </View>
                  <Text style={{
                    flex: 1,
                    fontSize: 16,
                    fontWeight: '500',
                    color: colors.text
                  }}>
                    Push Notifications
                  </Text>
                  <Switch
                    value={pushNotifications}
                    onValueChange={handleNotificationToggle}
                    trackColor={{ false: colors.border, true: colors.primary + '40' }}
                    thumbColor={pushNotifications ? colors.primary : colors.textSecondary}
                  />
                </View>

                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 16
                }}>
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: (isDarkMode ? '#FFD700' : colors.info) + '20',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12
                  }}>
                    <Ionicons
                      name={isDarkMode ? "moon" : "sunny-outline"}
                      size={20}
                      color={isDarkMode ? '#FFD700' : colors.info}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: 16,
                      fontWeight: '500',
                      color: colors.text
                    }}>
                      Dark Mode
                    </Text>
                    <Text style={{
                      fontSize: 12,
                      color: colors.textSecondary,
                      marginTop: 2
                    }}>
                      {isDarkMode ? 'Currently using dark theme' : 'Currently using light theme'}
                    </Text>
                  </View>
                  <Switch
                    value={isDarkMode}
                    onValueChange={handleDarkModeToggle}
                    trackColor={{ false: colors.border, true: colors.primary + '40' }}
                    thumbColor={isDarkMode ? colors.primary : colors.textSecondary}
                  />
                </View>
              </View>
            </View>

            {/* Support Section */}
            <View style={{ marginBottom: 32 }}>
              <Text style={{
                fontSize: 18,
                fontWeight: '600',
                marginBottom: 16,
                color: colors.text
              }}>
                Support & About
              </Text>

              <View style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border,
                overflow: 'hidden'
              }}>
                {[
                  { icon: 'help-circle-outline', title: 'Help & Support', color: colors.warning },
                  { icon: 'shield-outline', title: 'Privacy Policy', color: colors.success },
                  { icon: 'document-text-outline', title: 'Terms of Service', color: colors.info },
                  { icon: 'information-circle-outline', title: 'About PolyGlotPal', color: colors.primary }
                ].map((item, index, array) => (
                  <TouchableOpacity
                    key={index}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 16,
                      borderBottomWidth: index < array.length - 1 ? 1 : 0,
                      borderBottomColor: colors.border
                    }}
                    onPress={() => showToast(`Opening ${item.title}...`, 'info')}
                  >
                    <View style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: item.color + '20',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 12
                    }}>
                      <Ionicons name={item.icon} size={20} color={item.color} />
                    </View>
                    <Text style={{
                      flex: 1,
                      fontSize: 16,
                      fontWeight: '500',
                      color: colors.text
                    }}>
                      {item.title}
                    </Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Logout Button */}
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                backgroundColor: colors.surface,
                padding: 16,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
                borderWidth: 2,
                borderColor: colors.error
              }}
              onPress={handleLogoutPress}
            >
              <Ionicons name="log-out-outline" size={20} color={colors.error} />
              <Text style={{
                color: colors.error,
                fontSize: 16,
                fontWeight: '600',
                marginLeft: 8
              }}>
                Logout
              </Text>
            </TouchableOpacity>

            {/* App Info */}
            <View style={{
              backgroundColor: colors.info + '20',
              borderRadius: 12,
              padding: 16,
              borderLeftWidth: 4,
              borderLeftColor: colors.info
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Ionicons name="information-circle-outline" size={20} color={colors.info} />
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: colors.info,
                  marginLeft: 8
                }}>
                  PolyGlotPal v1.0.0
                </Text>
              </View>
              <Text style={{
                fontSize: 14,
                color: colors.info,
                lineHeight: 20
              }}>
                Your personalized language learning companion. Keep practicing and achieve fluency faster!
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}