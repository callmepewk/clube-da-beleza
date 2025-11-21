import { base44 } from '@/api/base44Client';

// Idiomas suportados
export const LANGUAGES = {
  'pt-BR': { name: 'Português (BR)', flag: '🇧🇷', code: 'pt-BR' },
  'pt-PT': { name: 'Português (PT)', flag: '🇵🇹', code: 'pt-PT' },
  'en': { name: 'English', flag: '🇺🇸', code: 'en' },
  'es': { name: 'Español', flag: '🇪🇸', code: 'es' },
  'fr': { name: 'Français', flag: '🇫🇷', code: 'fr' },
  'de': { name: 'Deutsch', flag: '🇩🇪', code: 'de' },
  'it': { name: 'Italiano', flag: '🇮🇹', code: 'it' },
  'ja': { name: '日本語', flag: '🇯🇵', code: 'ja' },
  'zh': { name: '中文', flag: '🇨🇳', code: 'zh' },
  'ru': { name: 'Русский', flag: '🇷🇺', code: 'ru' },
  'ar': { name: 'العربية', flag: '🇸🇦', code: 'ar' }
};

// Cache de traduções
const translationCache = {};

// Detectar idioma do navegador
export const detectBrowserLanguage = () => {
  const browserLang = navigator.language || navigator.userLanguage;
  
  if (browserLang.startsWith('pt-BR') || browserLang.startsWith('pt_BR')) return 'pt-BR';
  if (browserLang.startsWith('pt')) return 'pt-PT';
  if (browserLang.startsWith('en')) return 'en';
  if (browserLang.startsWith('es')) return 'es';
  if (browserLang.startsWith('fr')) return 'fr';
  if (browserLang.startsWith('de')) return 'de';
  if (browserLang.startsWith('it')) return 'it';
  if (browserLang.startsWith('ja')) return 'ja';
  if (browserLang.startsWith('zh')) return 'zh';
  if (browserLang.startsWith('ru')) return 'ru';
  if (browserLang.startsWith('ar')) return 'ar';
  
  return 'pt-BR'; // Fallback
};

// Obter idioma atual
export const getCurrentLanguage = () => {
  if (typeof window === 'undefined') return 'pt-BR';
  
  const stored = localStorage.getItem('i18n_language');
  if (stored && LANGUAGES[stored]) return stored;
  
  const detected = detectBrowserLanguage();
  localStorage.setItem('i18n_language', detected);
  return detected;
};

// Definir idioma
export const setLanguage = (lang) => {
  if (LANGUAGES[lang]) {
    localStorage.setItem('i18n_language', lang);
    window.dispatchEvent(new Event('languagechange'));
    
    // Aplicar direção RTL para árabe
    if (lang === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = lang;
    }
  }
};

// Traduzir texto usando IA
export const translateText = async (text, targetLang, sourceLang = 'pt-BR') => {
  if (targetLang === sourceLang || !text || text.trim() === '') return text;
  
  const cacheKey = `${sourceLang}_${targetLang}_${text}`;
  
  // Verificar cache
  if (translationCache[cacheKey]) {
    return translationCache[cacheKey];
  }
  
  try {
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Traduza o seguinte texto de ${LANGUAGES[sourceLang]?.name || sourceLang} para ${LANGUAGES[targetLang]?.name || targetLang}. Retorne APENAS a tradução, sem explicações ou texto adicional:\n\n"${text}"`,
      response_json_schema: {
        type: "object",
        properties: {
          translation: { type: "string" }
        }
      }
    });
    
    const translation = result.translation || text;
    translationCache[cacheKey] = translation;
    
    return translation;
  } catch (error) {
    console.error('Translation error:', error);
    return text;
  }
};

// Inicializar direção do documento
if (typeof window !== 'undefined') {
  const initLang = getCurrentLanguage();
  if (initLang === 'ar') {
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'ar';
  } else {
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = initLang;
  }
}