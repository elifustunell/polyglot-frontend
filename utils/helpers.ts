import { ImageSourcePropType } from 'react-native';

// Language code mapping
const languageMapping: { [key: string]: string } = {
'tr': 'Turkish',
'eng': 'English',
'eng-tr': 'Turkish',
'tr-eng': 'English',
'eng-gr': 'German',
'eng-spn': 'Spanish',
'English': 'English',
'Turkish': 'Turkish',
'German': 'German',
'Spanish': 'Spanish',

};

// Flag images mapping
const flagMapping: { [key: string]: ImageSourcePropType } = {
'tr': require('@/assets/images/flags/tr.png'),
  'eng': require('@/assets/images/flags/eng.png'),
  'Turkish': require('@/assets/images/flags/tr.png'),
  'English': require('@/assets/images/flags/eng.png'),
  'German': require('@/assets/images/flags/gr.png'),
  'Spanish': require('@/assets/images/flags/spn.png'),
};

export const getFlagImage = (languageCode: string): ImageSourcePropType | null => {
  return flagMapping[languageCode] || flagMapping['eng'];
};

export const getLanguageName = (languageCode: string): string => {
  return languageMapping[languageCode] || languageCode;
};

export const mapLanguageToBackend = (language: string): string => {
  const mapping: { [key: string]: string } = {
    'Turkish': 'Turkish',
    'English': 'English',
    'German': 'German',
    'Spanish': 'Spanish',
  };
  return mapping[language] || language;
};

export const mapCategoryToBackend = (category: string): string => {
  const mapping: { [key: string]: string } = {
    'Vocabulary': 'Vocabulary',
    'Grammar': 'Grammar',
    'Fill the Blanks': 'Fill in the Blanks',
    'Image Based': 'Image Based',
    'Sentences': 'Sentence'
  };
  return mapping[category] || category;
};
