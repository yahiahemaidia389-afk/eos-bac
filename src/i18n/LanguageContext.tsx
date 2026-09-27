import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, Direction, TranslationSchema } from './types';
import { fr } from './locales/fr';
import { en } from './locales/en';
import { ar } from './locales/ar';
import { uiTranslations } from './uiTranslations';

const translations: Record<Language, TranslationSchema> = {
  fr,
  en,
  ar,
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  dir: Direction;
  isRTL: boolean;
  isArabic: boolean;
  isEnglish: boolean;
  isFrench: boolean;
  t: TranslationSchema;
  getLocalizedText: (frText: string, enText?: string, arText?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('eosbac_language') || localStorage.getItem('bacnext_language');
    if (saved === 'fr' || saved === 'en' || saved === 'ar') {
      return saved;
    }
    return 'fr';
  });

  const dir: Direction = language === 'ar' ? 'rtl' : 'ltr';
  const isRTL = language === 'ar';
  const isArabic = language === 'ar';
  const isEnglish = language === 'en';
  const isFrench = language === 'fr';

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('eosbac_language', lang);
    localStorage.setItem('bacnext_language', lang);
  };

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
    if (isRTL) {
      document.body.classList.add('rtl-mode');
    } else {
      document.body.classList.remove('rtl-mode');
    }
  }, [language, dir, isRTL]);

  const t = translations[language] || translations.fr;

  const getLocalizedText = (frText: string, enText?: string, arText?: string): string => {
    if (language === 'ar') {
      if (arText) return arText;
      const match = uiTranslations[frText.trim()];
      if (match?.ar) return match.ar;
      return frText;
    }
    if (language === 'en') {
      if (enText) return enText;
      const match = uiTranslations[frText.trim()];
      if (match?.en) return match.en;
      return frText;
    }
    return frText;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        dir,
        isRTL,
        isArabic,
        isEnglish,
        isFrench,
        t,
        getLocalizedText,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};


export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
