// 6. utils/constants.ts - App sabitleri
export const CATEGORIES = [
{
    id: 'vocabulary',
name: 'Vocabulary',
subtitle: 'Learn new words',
icon: 'book-outline',
color: '#FF6B6B',
route: '/(tabs)/vocabulary'
  },
  {
    id: 'grammar',
    name: 'Grammar',
    subtitle: 'Master grammar rules',
    icon: 'library-outline',
    color: '#4ECDC4',
    route: '/(tabs)/grammar'
  },
  {
    id: 'fill-blanks',
    name: 'Fill the Blanks',
    subtitle: 'Complete sentences',
    icon: 'create-outline',
    color: '#45B7D1',
    route: '/(tabs)/filltheblanks'
  },
  {
    id: 'image-based',
    name: 'Image Based',
    subtitle: 'Visual learning',
    icon: 'image-outline',
    color: '#FFA726',
    route: '/(tabs)/imagebased'
  },
  {
    id: 'sentences',
    name: 'Sentences',
    subtitle: 'Build sentences',
    icon: 'chatbubble-outline',
    color: '#AB47BC',
    route: '/(tabs)/sentences'
  }
];

export const LANGUAGES = [
  {
    code: 'English',
    name: 'English',
    flag: 'eng'
  },
  {
    code: 'Turkish',
    name: 'Turkish',
    flag: 'tr'
  },
  {
    code: 'German',
    name: 'German',
    flag: 'de'
  },
  {
    code: 'Spanish',
    name: 'Spanish',
    flag: 'es'
  },
  {
    code: 'French',
    name: 'French',
    flag: 'fr'
  }
];

export const LANGUAGE_PAIRS = [
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
    id: 'eng-de',
    source: 'English',
    target: 'German',
    title: 'English to German',
    subtitle: 'Learn German from English',
    color: '#fff3e0',
    borderColor: '#ff9800'
  },
  {
    id: 'eng-es',
    source: 'English',
    target: 'Spanish',
    title: 'English to Spanish',
    subtitle: 'Learn Spanish from English',
    color: '#e8f5e8',
    borderColor: '#4caf50'
  },
  {
    id: 'eng-fr',
    source: 'English',
    target: 'French',
    title: 'English to French',
    subtitle: 'Learn French from English',
    color: '#fce4ec',
    borderColor: '#e91e63'
  }
];

export const MAX_LEVEL = 10;