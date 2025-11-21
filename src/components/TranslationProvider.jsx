import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentLanguage, translateText } from '@/utils/i18n';

const TranslationContext = createContext({});

export const useT = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useT must be used within TranslationProvider');
  }
  return context;
};

export default function TranslationProvider({ children }) {
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage());
  const [translations, setTranslations] = useState({});

  useEffect(() => {
    const handleLanguageChange = () => {
      const newLang = getCurrentLanguage();
      setCurrentLang(newLang);
      setTranslations({}); // Limpar cache ao mudar idioma
    };

    window.addEventListener('languagechange', handleLanguageChange);
    return () => window.removeEventListener('languagechange', handleLanguageChange);
  }, []);

  const t = (text, options = {}) => {
    // Se for português brasileiro, retorna o texto original
    if (currentLang === 'pt-BR') {
      return text;
    }

    // Verificar se já temos a tradução em cache
    const key = `${currentLang}_${text}`;
    if (translations[key]) {
      return translations[key];
    }

    // Se não tiver em cache, retorna o original e traduz em background
    if (!options.noTranslate) {
      translateText(text, currentLang).then((translated) => {
        setTranslations(prev => ({
          ...prev,
          [key]: translated
        }));
      });
    }

    return text;
  };

  const contextValue = {
    t,
    currentLanguage: currentLang,
    isRTL: currentLang === 'ar'
  };

  return (
    <TranslationContext.Provider value={contextValue}>
      {children}
    </TranslationContext.Provider>
  );
}