import React, { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { LANGUAGES, getCurrentLanguage, setLanguage } from '@/components/i18n/i18nUtils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function LanguageSelector() {
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleLanguageChange = () => {
      setCurrentLang(getCurrentLanguage());
    };

    window.addEventListener('languagechange', handleLanguageChange);
    return () => window.removeEventListener('languagechange', handleLanguageChange);
  }, []);

  const handleLanguageChange = (langCode) => {
    setLanguage(langCode);
    setCurrentLang(langCode);
    setIsOpen(false);
    
    // Recarregar a página para aplicar traduções
    window.location.reload();
  };

  const currentLangData = LANGUAGES[currentLang];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-[#A7AFB4] hover:text-[#3BAE9C] transition-colors bg-white/50 hover:bg-white px-3 h-10 rounded-full"
        >
          <span className="text-2xl">{currentLangData?.flag}</span>
          <span className="hidden sm:inline text-sm font-light">{currentLangData?.name}</span>
          <Globe className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0 bg-[#FEFBF7] border border-[#D4A574]/20" align="end">
        <div className="p-4 border-b border-[#D4A574]/20 bg-gradient-to-r from-[#F5F1E8] to-[#FEFBF7]">
          <h4 className="font-bold text-sm text-[#2D2416] flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#D4A574]" />
            Selecione o Idioma
          </h4>
        </div>
        <ScrollArea className="h-[400px]">
          <div className="p-2">
            {Object.entries(LANGUAGES).map(([code, lang]) => (
              <button
                key={code}
                onClick={() => handleLanguageChange(code)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  currentLang === code
                    ? 'bg-gradient-to-r from-[#D4A574] to-[#C9A868] text-white shadow-lg'
                    : 'text-[#2D2416] hover:bg-[#FFF9F0]'
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span className="flex-1 text-left font-light text-sm">{lang.name}</span>
                {currentLang === code && (
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}