import React, { useState } from 'react';
import { Globe, Palette, ShoppingBag, Bot, Sparkles } from 'lucide-react';
import T from '@/components/TranslatedText';

// Import section pages as components
import SitesPage from './Sites';
import DesignPage from './Design';
import ProductsPage from './Products';
import ChatbotsPage from './Chatbots';

const sections = [
  { id: 'chatbots', label: 'Crie Chatbots', icon: Bot },
  { id: 'sites', label: 'Crie Sites', icon: Globe },
  { id: 'design', label: 'Faça Designs', icon: Palette },
  { id: 'products', label: 'Crie Produtos', icon: ShoppingBag },
];

export default function BeautySpacePage() {
  const [activeSection, setActiveSection] = useState('chatbots');

  const renderSection = () => {
    switch (activeSection) {
      case 'chatbots': return <ChatbotsPage />;
      case 'sites': return <SitesPage />;
      case 'design': return <DesignPage />;
      case 'products': return <ProductsPage />;
      default: return <ChatbotsPage />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#D4A574] to-[#B8935C] rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" />
            <T as="h1" className="text-xl sm:text-2xl md:text-3xl font-light tracking-wide">AI Doctor</T>
          </div>
          <T as="p" className="text-white/90 max-w-2xl font-light text-sm sm:text-base">
            O espaço criativo do Clube da Beleza. Crie sites profissionais, designs incríveis e produtos digitais com ajuda da inteligência artificial.
          </T>
        </div>
        <div className="absolute -bottom-10 -right-10 w-24 sm:w-40 h-24 sm:h-40 bg-white/10 rounded-full"></div>
        <div className="absolute -top-5 -right-20 w-20 sm:w-32 h-20 sm:h-32 bg-white/5 rounded-full"></div>
      </div>

      {/* Section Selector */}
      <div className="sticky top-0 z-30 bg-[#F5F1E8]/95 backdrop-blur-md py-4 -mx-3 sm:-mx-4 px-3 sm:px-4 lg:-mx-8 xl:-mx-12 lg:px-8 xl:px-12 border-b border-[#D4A574]/20">
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {sections.map((section) => {
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-light text-xs sm:text-sm whitespace-nowrap transition-all duration-300 ${
                  isActive 
                    ? 'bg-[#D4A574] text-white shadow-lg scale-105' 
                    : 'bg-[#FEFBF7] text-[#6B5D4F] hover:bg-[#FFF9F0] border border-[#D4A574]/20'
                }`}
              >
                <section.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#D4A574]'}`} />
                <T>{section.label}</T>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section Content */}
      <div className="animate-in fade-in duration-300">
        {renderSection()}
      </div>
    </div>
  );
}