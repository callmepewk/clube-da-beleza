import React, { useState } from 'react';
import { X, ChevronRight, Calendar, Bot, Globe, Palette, ShoppingBag, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function OnboardingWizard({ isOpen, onClose }) {
  const [selectedTools, setSelectedTools] = useState([]);
  const navigate = useNavigate();

  const tools = [
    {
      id: 'schedule',
      icon: Calendar,
      name: 'Agendamento Inteligente',
      description: 'Gerir minha agenda de consultas e procedimentos',
      page: 'Schedule',
      color: 'from-[#D4A574] to-[#C9A868]'
    },
    {
      id: 'nurse',
      icon: Stethoscope,
      name: 'Bia - Cuidadora Virtual',
      description: 'Tirar dúvidas sobre saúde e estética',
      page: 'Nurse',
      color: 'from-[#B8935C] to-[#A68350]'
    },
    {
      id: 'chatbots',
      icon: Bot,
      name: 'Chatbots',
      description: 'Criar assistentes virtuais para WhatsApp/Instagram',
      page: 'Chatbots',
      color: 'from-[#C9A868] to-[#B59758]'
    },
    {
      id: 'sites',
      icon: Globe,
      name: 'Sites Profissionais',
      description: 'Criar minha presença digital online',
      page: 'Sites',
      color: 'from-[#D4A574] to-[#E0B480]'
    },
    {
      id: 'design',
      icon: Palette,
      name: 'Design com IA',
      description: 'Criar imagens e materiais para redes sociais',
      page: 'Design',
      color: 'from-[#B8935C] to-[#D4A574]'
    },
    {
      id: 'products',
      icon: ShoppingBag,
      name: 'Produtos Digitais',
      description: 'Criar e vender ebooks, cursos e modelos 3D',
      page: 'Products',
      color: 'from-[#C9A868] to-[#D4A574]'
    }
  ];

  const handleToolClick = (toolId) => {
    if (selectedTools.includes(toolId)) {
      setSelectedTools(selectedTools.filter(id => id !== toolId));
    } else {
      setSelectedTools([...selectedTools, toolId]);
    }
  };

  const handleStart = () => {
    if (selectedTools.length === 0) {
      alert('Selecione pelo menos uma ferramenta para começar!');
      return;
    }
    
    // Navigate to the first selected tool
    const firstTool = tools.find(t => t.id === selectedTools[0]);
    onClose();
    navigate(createPageUrl(firstTool.page));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#FEFBF7] rounded-[2rem] max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-[#D4A574]/30 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#D4A574] to-[#C9A868] p-8 flex items-center justify-between z-10">
          <div>
            <h2 className="text-3xl font-light text-white mb-2">Bem-vindo ao Clube da Beleza! ✨</h2>
            <p className="text-white/90 font-light">O que você gostaria de fazer hoje?</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          <p className="text-[#6B5D4F] font-light mb-8 text-center text-lg">
            Selecione as ferramentas que você deseja explorar (pode escolher várias):
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {tools.map((tool) => {
              const isSelected = selectedTools.includes(tool.id);
              return (
                <button
                  key={tool.id}
                  onClick={() => handleToolClick(tool.id)}
                  className={`text-left p-6 rounded-2xl border-2 transition-all ${
                    isSelected
                      ? 'border-[#D4A574] bg-gradient-to-r ' + tool.color + ' text-white shadow-xl scale-105'
                      : 'border-[#D4A574]/20 bg-white text-[#2D2416] hover:border-[#D4A574]/50 hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isSelected ? 'bg-white/20' : 'bg-gradient-to-br ' + tool.color
                    }`}>
                      <tool.icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-white'}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-light text-lg mb-2 ${isSelected ? 'text-white' : 'text-[#2D2416]'}`}>
                        {tool.name}
                      </h3>
                      <p className={`text-sm font-light ${isSelected ? 'text-white/90' : 'text-[#6B5D4F]'}`}>
                        {tool.description}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                        <ChevronRight className="w-4 h-4 text-[#D4A574]" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleStart}
              disabled={selectedTools.length === 0}
              className="flex-1 bg-gradient-to-r from-[#D4A574] to-[#C9A868] hover:from-[#C49565] hover:to-[#B8935C] text-white h-14 rounded-xl font-light text-lg shadow-xl disabled:opacity-50"
            >
              Começar com {selectedTools.length > 0 ? selectedTools.length : ''} {selectedTools.length === 1 ? 'Ferramenta' : 'Ferramentas'}
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="border-2 border-[#D4A574]/30 text-[#6B5D4F] hover:bg-[#FFF9F0] h-14 px-8 rounded-xl font-light"
            >
              Explorar Livremente
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}