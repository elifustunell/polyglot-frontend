// app/language-selection.tsx - Real-time name updates ile düzeltilmiş

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import { Colors, GlobalStyles } from '@/constants/Theme';
import { ResponsiveStyles } from '@/constants/ResponsiveTheme';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { getFlagImage } from '@/utils/helpers';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter, useFocusEffect } from 'expo-router';

export default function LanguageSelectionScreen() {
    const router = useRouter();
    const { setLanguages } = useLanguage();
    const { user, loading } = useAuth();
    const layout = useResponsiveLayout();
    const [isMounted, setIsMounted] = useState(false);

    // Real-time user name - will update when user changes name in profile
    const [userName, setUserName] = useState(user?.displayName || user?.email?.split('@')[0] || 'User');

    // Component mount tracking
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Auth guard - sadece giriş yapmış kullanıcılar görebilir
    useEffect(() => {
        if (isMounted && !loading && !user) {
            console.log('❌ No user found in language selection, redirecting to welcome');
            router.replace('/');
        }
    }, [user, loading, isMounted, router]);

    // Update user name when user object changes (real-time sync)
    useEffect(() => {
        if (user) {
            const newName = user.displayName || user.email?.split('@')[0] || 'User';
            setUserName(newName);
            console.log('👤 User name updated in Language Selection:', newName);
        }
    }, [user?.displayName, user?.email]);

    // Refresh user data when screen focuses
    useFocusEffect(
        React.useCallback(() => {
            if (user) {
                const newName = user.displayName || user.email?.split('@')[0] || 'User';
                setUserName(newName);
                console.log('🔄 Language Selection screen focused, refreshing user name:', newName);
            }
        }, [user])
    );

    // Loading state
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

    // User yoksa null return (yönlendirilecek)
    if (!user) {
        return null;
    }

    console.log('✅ User found in language selection:', user.email);

    const handleLanguageSelect = (sourceLang: string, targetLang: string) => {
        console.log('🌍 Language selected:', sourceLang, '->', targetLang);
        setLanguages(sourceLang, targetLang);
        router.replace('/(tabs)/mainscreen');
    }

    const containerStyle = layout.isWeb ?
        ResponsiveStyles.webContainer :
        GlobalStyles.container;

    const cardStyle = layout.isWeb ?
        { ...ResponsiveStyles.webCard, minHeight: '90vh' } :
        GlobalStyles.whiteBackgroundContainer;

    const languagePairs = [
        {
            id: 'tr-eng',
            source: 'Turkish',
            target: 'English',
            title: 'Turkish to English',
            subtitle: 'Learn English from Turkish',
            color: '#e3f2fd',
            borderColor: '#2196f3'
        },
        {
            id: 'eng-tr',
            source: 'English',
            target: 'Turkish',
            title: 'English to Turkish',
            subtitle: 'Learn Turkish from English',
            color: '#f3e5f5',
            borderColor: '#9c27b0'
        },
        {
            id: 'eng-gr',
            source: 'English',
            target: 'German',
            title: 'English to German',
            subtitle: 'Learn German from English',
            color: '#fff3e0',
            borderColor: '#ff9800'
        },
        {
            id: 'eng-spn',
            source: 'English',
            target: 'Spanish',
            title: 'English to Spanish',
            subtitle: 'Learn Spanish from English',
            color: '#e8f5e8',
            borderColor: '#4caf50'
        },
    ];

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
                        <View style={{ width: 24 }} />
                        <Text style={[
                            GlobalStyles.headerText,
                            layout.isWeb && ResponsiveStyles.webTitle
                        ]}>
                            Choose Your Language
                        </Text>
                        <TouchableOpacity
                            style={GlobalStyles.settingsButton}
                            onPress={() => router.push('/(tabs)/settings')}
                        >
                            <Ionicons name="settings-outline" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <View style={{ paddingHorizontal: layout.isWeb ? 0 : 20 }}>
                        {/* Welcome Message with Real-time Name */}
                        <View style={{
                            backgroundColor: '#e8f5e8',
                            borderRadius: 16,
                            padding: 20,
                            marginBottom: 30,
                            alignItems: 'center'
                        }}>
                            <Ionicons name="person-circle-outline" size={48} color="#4caf50" style={{ marginBottom: 12 }} />
                            <Text style={{
                                fontSize: 20,
                                fontWeight: '600',
                                color: '#2e7d32',
                                textAlign: 'center',
                                marginBottom: 8
                            }}>
                                Welcome, {userName}! 🎉
                            </Text>
                            <Text style={{
                                fontSize: 14,
                                color: '#388e3c',
                                textAlign: 'center',
                                lineHeight: 20
                            }}>
                                Select your learning path below. You can always change this later in settings.
                            </Text>
                        </View>

                        {/* Language Selection Grid */}
                        <View style={{
                            flexDirection: 'row',
                            flexWrap: 'wrap',
                            justifyContent: 'space-between',
                            gap: layout.isWeb ? 16 : 12
                        }}>
                            {languagePairs.map((pair, index) => (
                                <TouchableOpacity
                                    key={pair.id}
                                    style={{
                                        width: layout.isWeb ? 'calc(50% - 8px)' : '48%',
                                        backgroundColor: pair.color,
                                        borderRadius: 16,
                                        padding: 20,
                                        marginBottom: 16,
                                        borderWidth: 2,
                                        borderColor: pair.borderColor,
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.1,
                                        shadowRadius: 8,
                                        elevation: 4
                                    }}
                                    onPress={() => handleLanguageSelect(pair.source, pair.target)}
                                >
                                    {/* Flag Images */}
                                    <View style={{
                                        flexDirection: 'row',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginBottom: 16
                                    }}>
                                        <Image
                                            source={getFlagImage(pair.source) || require('@/assets/images/flags/eng.png')}
                                            style={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: 20,
                                                borderWidth: 2,
                                                borderColor: '#fff'
                                            }}
                                        />
                                        <Ionicons
                                            name="arrow-forward"
                                            size={20}
                                            color={pair.borderColor}
                                            style={{ marginHorizontal: 12 }}
                                        />
                                        <Image
                                            source={getFlagImage(pair.target) || require('@/assets/images/flags/tr.png')}
                                            style={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: 20,
                                                borderWidth: 2,
                                                borderColor: '#fff'
                                            }}
                                        />
                                    </View>

                                    {/* Language Info */}
                                    <Text style={{
                                        fontSize: 16,
                                        fontWeight: '600',
                                        color: Colors.text,
                                        textAlign: 'center',
                                        marginBottom: 4
                                    }}>
                                        {pair.title}
                                    </Text>
                                    <Text style={{
                                        fontSize: 12,
                                        color: '#666',
                                        textAlign: 'center',
                                        marginBottom: 12
                                    }}>
                                        {pair.subtitle}
                                    </Text>

                                    {/* Start Button */}
                                    <View style={{
                                        backgroundColor: pair.borderColor,
                                        paddingVertical: 8,
                                        paddingHorizontal: 16,
                                        borderRadius: 20,
                                        alignSelf: 'center'
                                    }}>
                                        <Text style={{
                                            color: '#fff',
                                            fontSize: 12,
                                            fontWeight: '600'
                                        }}>
                                            Start Learning
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>




                        {/* Learning Tips */}
                        <View style={{
                            backgroundColor: '#e3f2fd',
                            borderRadius: 12,
                            padding: 16,
                            marginTop: 16,
                            borderLeftWidth: 4,
                            borderLeftColor: '#2196f3'
                        }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                                <Ionicons name="lightbulb-outline" size={20} color="#1976d2" />
                                <Text style={{
                                    fontSize: 16,
                                    fontWeight: '600',
                                    color: '#1565c0',
                                    marginLeft: 8
                                }}>
                                    Learning Tips
                                </Text>
                            </View>
                            <Text style={{
                                fontSize: 14,
                                color: '#1565c0',
                                lineHeight: 20
                            }}>
                                • Practice daily for 10-15 minutes for best results{'\n'}
                                • Complete at least 60% of exercises to unlock new levels{'\n'}
                                • Use different categories to improve various skills{'\n'}
                                • Track your progress in the Profile section
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}