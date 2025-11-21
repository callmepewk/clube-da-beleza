import React, { useState, useEffect } from 'react';
import { getCurrentLanguage, translateText } from '@/components/i18n/i18nUtils';

export default function T({ children, as: Component = 'span', className = '', ...props }) {
  const [translated, setTranslated] = useState(children);
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage());

  useEffect(() => {
    const handleLanguageChange = () => {
      setCurrentLang(getCurrentLanguage());
    };

    window.addEventListener('languagechange', handleLanguageChange);
    return () => window.removeEventListener('languagechange', handleLanguageChange);
  }, []);

  useEffect(() => {
    if (currentLang === 'pt-BR' || !children || typeof children !== 'string') {
      setTranslated(children);
      return;
    }

    let mounted = true;
    
    translateText(children, currentLang).then((result) => {
      if (mounted) {
        setTranslated(result);
      }
    });

    return () => {
      mounted = false;
    };
  }, [children, currentLang]);

  return <Component className={className} {...props}>{translated}</Component>;
}

// Hook simples para uso direto
export function useTranslate() {
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage());

  useEffect(() => {
    const handleLanguageChange = () => {
      setCurrentLang(getCurrentLanguage());
    };

    window.addEventListener('languagechange', handleLanguageChange);
    return () => window.removeEventListener('languagechange', handleLanguageChange);
  }, []);

  const t = async (text) => {
    if (currentLang === 'pt-BR' || !text) return text;
    return await translateText(text, currentLang);
  };

  return { t, currentLanguage: currentLang };
}