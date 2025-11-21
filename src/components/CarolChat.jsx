import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { getCurrentLanguage } from '@/components/i18n/i18nUtils';
import T from '@/components/TranslatedText';

const CAROL_IMAGE = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691e6fc102be2b10ba4e6392/f90ca3f97_carolia.png";

const PAGE_INFO = {
  '/': 'Página inicial com apresentação do Clube da Beleza e suas funcionalidades',
  '/news': 'Notícias sobre beleza, estética e saúde',
  '/schedule': 'Agendamento inteligente de consultas e procedimentos',
  '/nurse': 'Bia - Cuidadora Virtual com IA para tirar dúvidas sobre saúde',
  '/chatbots': 'Criação de chatbots personalizados para WhatsApp e Instagram',
  '/sites': 'Criador de sites e landing pages profissionais com IA',
  '/design': 'Design de imagens e materiais para redes sociais',
  '/products': 'Criação e venda de produtos digitais (ebooks, cursos)',
  '/tools': 'Visão geral de todas as ferramentas disponíveis',
  '/plans': 'Planos e preços do Clube da Beleza',
  '/profile': 'Seu perfil e configurações pessoais',
  '/admincontrol': 'Painel administrativo (apenas para administradores)',
  '/about': 'Sobre o Clube da Beleza e nossa missão',
  '/OurMission': 'Nossa missão e valores do Clube da Beleza',
  '/BeautyTea': 'Chá da Beleza - eventos exclusivos de networking',
  '/SkinCaretakers': 'Programa de certificação Cuidadores da Pele',
  '/SolidBeauty': 'Beleza Solidária - projeto social de estética',
  '/RightDose': 'Campanha educativa sobre dosagens seguras',
  '/BeautyBox': 'Assinatura mensal de produtos de beleza',
  '/QualitySeal': 'Selo de Qualidade - certificação premium',
  '/ClubePlus': 'Clube+ - programa de benefícios exclusivos'
};

const QUICK_QUESTIONS_RAW = [
  'O que é o Clube da Beleza?',
  'Quais ferramentas estão disponíveis?',
  'Como funcionam os planos?',
  'O que tem nesta página?',
  'Como usar a Bia?',
  'Como criar um chatbot?'
];

export default function CarolChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const chatRef = useRef(null);
  const scrollRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    if (messages.length === 0) {
      const greeting = 'Olá! Sou a Carol, a host do Clube da Beleza! 👋\n\nEstou aqui para te ajudar a explorar todas as funcionalidades da nossa plataforma. O que você gostaria de saber?';
      setMessages([{
        role: 'assistant',
        content: greeting
      }]);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatRef.current && !chatRef.current.contains(event.target) && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const sendMessageMutation = useMutation({
    mutationFn: async (userMsg) => {
      const currentPage = PAGE_INFO[location.pathname] || 'uma página do Clube da Beleza';
      const currentLang = getCurrentLanguage();
      const langName = currentLang === 'pt-BR' ? 'Português Brasileiro' : currentLang === 'en' ? 'English' : currentLang;
      
      const context = `You are Carol, the friendly and helpful host of Clube da Beleza.
      
      Clube da Beleza is a complete health, aesthetics and wellness platform that offers:
      - Bia (Virtual Caregiver): AI assistant for health and beauty questions
      - Smart Scheduling: Complete appointment management system
      - Chatbot Creation: For WhatsApp and Instagram
      - Website Creation: Professional landing page generator with AI
      - Image Design: Visual content creation for social media
      - Digital Products: Create and sell ebooks, courses and 3D models
      - Beauty Box: Monthly premium product subscription
      - Club+: Exclusive benefits and discounts program
      - Quality Seal: Premium certification for professionals
      
      User is currently on: ${currentPage}
      
      IMPORTANT: You MUST respond in ${langName} language only.
      Be brief, friendly and objective. Use emojis when appropriate.
      User question: ${userMsg}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: context,
        add_context_from_internet: false
      });
      
      return response;
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, { role: 'assistant', content: data, needsTranslation: false }]);
    }
  });

  const handleSend = (messageText = null) => {
    const msg = messageText || input;
    if (!msg.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setInput('');
    sendMessageMutation.mutate(msg);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-2xl hover:scale-110 transition-transform z-50 group"
          style={{ 
            backgroundImage: `url(${CAROL_IMAGE})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute top-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-t from-[#D4A574]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          ref={chatRef}
          className="fixed bottom-6 right-6 w-[400px] h-[600px] bg-[#FEFBF7] rounded-[2rem] shadow-2xl border-2 border-[#D4A574]/30 flex flex-col z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#D4A574] to-[#C9A868] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div 
                  className="w-12 h-12 rounded-full border-2 border-white shadow-lg"
                  style={{ 
                    backgroundImage: `url(${CAROL_IMAGE})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h3 className="text-white font-light text-lg">Carol</h3>
                <T as="p" className="text-white/80 text-xs font-light">A Host do Clube</T>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FFF9F0]">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-[#D4A574] to-[#C9A868] text-white rounded-tr-none'
                      : 'bg-white text-[#2D2416] border border-[#D4A574]/20 rounded-tl-none shadow-sm'
                  }`}
                >
                  <p className="text-sm font-light whitespace-pre-wrap">{msg.needsTranslation ? <T>{msg.content}</T> : msg.content}</p>
                </div>
              </div>
            ))}
            
            {sendMessageMutation.isPending && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-[#D4A574]/20 shadow-sm flex gap-1">
                  <span className="w-2 h-2 bg-[#D4A574] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-[#D4A574] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-[#D4A574] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>

          {/* Quick Questions */}
          {messages.length <= 2 && (
            <div className="p-3 bg-white border-t border-[#D4A574]/20 overflow-x-auto">
              <div className="flex gap-2 flex-wrap">
                {QUICK_QUESTIONS_RAW.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    className="text-xs bg-[#FFF9F0] hover:bg-[#D4A574] hover:text-white text-[#6B5D4F] px-3 py-2 rounded-full border border-[#D4A574]/30 transition-all font-light whitespace-nowrap"
                  >
                    <T>{q}</T>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 bg-white border-t border-[#D4A574]/20">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
              <Input
                placeholder="Digite sua pergunta..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={sendMessageMutation.isPending}
                className="flex-1 border-[#D4A574]/30 focus:ring-[#D4A574]/20 focus:border-[#D4A574] bg-[#FFF9F0] text-[#2D2416] font-light"
              />
              <Button
                type="submit"
                disabled={!input.trim() || sendMessageMutation.isPending}
                className="bg-gradient-to-r from-[#D4A574] to-[#C9A868] hover:from-[#C49565] hover:to-[#B8935C] text-white"
              >
                {sendMessageMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}