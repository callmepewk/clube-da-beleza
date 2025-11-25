import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, HelpCircle, BookOpen, Loader2, Sparkles, MessageCircle, GraduationCap, ChevronRight } from 'lucide-react';
import T from '@/components/TranslatedText';

// Perguntas sugeridas
const SUGGESTED_QUESTIONS = [
  "Como faço para agendar um procedimento?",
  "Como funciona a Bia - Cuidadora Virtual?",
  "Como criar meu próprio chatbot?",
  "Como criar um site profissional?",
  "Como funciona o Beauty Space?",
  "Quais são os planos disponíveis?",
  "Como ganho Beauty Coins?",
  "O que é o Selo de Qualidade?",
  "Como faço para virar profissional na plataforma?",
  "Como entro em contato com o suporte humano?"
];

// Tutorial completo
const TUTORIAL_CONTENT = `
📱 **BEM-VINDO AO CLUBE DA BELEZA!**

Vou te explicar tudo de forma simples e rápida:

---

🏠 **INÍCIO (Dashboard)**
Sua página inicial! Aqui você vê novidades, atalhos rápidos e seu resumo na plataforma.

---

📰 **NOTÍCIAS**
Fique por dentro das últimas tendências em estética, saúde e beleza.

---

🔍 **PESQUISA DETALHADA**
Encontre profissionais, clínicas, produtos e procedimentos estéticos. Use filtros avançados como localização, preço, amenidades e muito mais! A busca é realizada no nosso **Mapa da Estética**.

---

💬 **BIA - CUIDADORA VIRTUAL**
Nossa IA especializada em estética! Tire dúvidas sobre:
• Exames e procedimentos
• Cuidados pré e pós
• Medicamentos
• Orientações gerais

---

🎨 **BEAUTY SPACE**
Seu espaço criativo com 3 ferramentas:

**1. Crie Sites** - Landing pages profissionais em minutos
**2. Faça Designs** - Artes para redes sociais com IA
**3. Crie Produtos** - E-books, cursos e modelos 3D

---

💳 **PLANOS**
• **Básico (Grátis)** - Recursos limitados para começar
• **Intermediário** - Mais recursos e criações
• **Premium** - Acesso ilimitado a tudo!

---

⚠️ **LIMITAÇÕES POR PLANO:**

| Recurso | Básico | Intermediário | Premium |
|---------|--------|---------------|---------|
| Conversas Bia/mês | 20 | 50 | Ilimitado |
| Chatbots | 1 | 2 | 5 |
| Sites | 1 | 3 | 10 |
| Designs | 1 | 5 | 10 |

---

🎯 **DICAS RÁPIDAS:**
• Use a **Carol** (chat flutuante) para ajuda rápida
• Ganhe **Beauty Coins** usando a plataforma
• Profissionais podem obter o **Selo de Qualidade**

Alguma dúvida específica? Estou aqui para ajudar! 😊
`;

export default function SupportPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Olá! 👋 Sou o assistente de suporte do **Clube da Beleza**. Estou aqui para ajudar você com qualquer dúvida sobre a plataforma!\n\nVocê pode me perguntar o que quiser ou clicar em uma das sugestões abaixo. Se preferir, clique em **"Quero Tutorial"** para um guia completo!' }
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: async (userMessage) => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `
          Você é o assistente de suporte oficial do Clube da Beleza - uma plataforma de estética e beleza.
          Responda de forma prestativa, educada, amigável e CONCISA (máximo 3 parágrafos).
          Use emojis ocasionalmente para ser mais amigável.
          
          SOBRE A PLATAFORMA:
          - Dashboard/Início: Página inicial com resumo e atalhos
          - Notícias: Novidades sobre estética e beleza
          - Pesquisa Detalhada: Busca de profissionais, clínicas, produtos e procedimentos no "Mapa da Estética"
          - Bia (Cuidadora Virtual): IA especializada em saúde estética para tirar dúvidas
          - Beauty Space: Contém 3 ferramentas - Crie Sites, Faça Designs, Crie Produtos
          - Planos: Básico (grátis), Intermediário e Premium com diferentes limites
          - Sobre Nós: Informações sobre a plataforma, missão e ferramentas
          - Suporte: Esta página de ajuda
          
          FERRAMENTAS INTEGRADAS (Beauty Space):
          - Crie Sites: Gera landing pages profissionais com IA
          - Faça Designs: Cria artes para redes sociais com IA
          - Crie Produtos: Cria e-books, cursos e modelos 3D
          
          LIMITAÇÕES POR PLANO:
          - Básico: 20 conversas Bia/mês, 1 chatbot, 1 site, 1 design
          - Intermediário: 50 conversas, 2 chatbots, 3 sites, 5 designs
          - Premium: Ilimitado
          
          OUTRAS FUNCIONALIDADES:
          - Beauty Coins: Moeda virtual ganha ao usar a plataforma
          - Selo de Qualidade: Certificação para profissionais verificados
          - Carol: Assistente flutuante disponível em todas as páginas
          - Clube+: Programa de fidelidade
          
          Pergunta do usuário: "${userMessage}"
        `,
      });
      return response;
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, { role: 'assistant', content: data }]);
    }
  });

  const handleSend = (customMessage) => {
    const msg = customMessage || input;
    if (!msg.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setInput('');
    chatMutation.mutate(msg);
  };

  const handleTutorial = () => {
    setMessages(prev => [
      ...prev, 
      { role: 'user', content: 'Quero um tutorial completo da plataforma' },
      { role: 'assistant', content: TUTORIAL_CONTENT }
    ]);
  };

  const handleSuggestionClick = (question) => {
    handleSend(question);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#D4A574] to-[#B8935C] rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <HelpCircle className="w-8 h-8" />
            <T as="h1" className="text-2xl md:text-3xl font-light tracking-wide">Central de Suporte</T>
          </div>
          <T as="p" className="text-white/90 max-w-2xl font-light">
            Tire suas dúvidas sobre a plataforma, aprenda a usar todas as funcionalidades e descubra como aproveitar ao máximo o Clube da Beleza.
          </T>
        </div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tutorial Quick Access */}
        <Card className="bg-gradient-to-br from-[#FFF9F0] to-[#F5F1E8] border-[#D4A574]/30 lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#D4A574] p-3 rounded-full">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <T as="h3" className="font-semibold text-[#2D2416]">Tutorial Completo</T>
                <T as="p" className="text-xs text-[#6B5D4F]">Aprenda tudo sobre a plataforma</T>
              </div>
            </div>
            <T as="p" className="text-sm text-[#6B5D4F] mb-4">
              Receba um guia completo e interativo explicando cada página, ferramenta e funcionalidade do Clube da Beleza.
            </T>
            <Button 
              onClick={handleTutorial}
              className="w-full bg-[#D4A574] hover:bg-[#C49565] text-white font-medium"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              <T>Quero Tutorial</T>
            </Button>
          </CardContent>
        </Card>

        {/* Suggested Questions */}
        <Card className="bg-[#FEFBF7] border-[#E8DCC8] lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-[#2D2416] flex items-center gap-2 text-base">
              <Sparkles className="w-5 h-5 text-[#D4A574]" />
              <T>Perguntas Frequentes</T>
            </CardTitle>
            <CardDescription className="text-[#6B5D4F]">
              <T>Clique em uma pergunta para obter a resposta</T>
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SUGGESTED_QUESTIONS.map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(question)}
                  disabled={chatMutation.isPending}
                  className="text-left p-3 rounded-lg border border-[#E8DCC8] bg-white hover:bg-[#FFF9F0] hover:border-[#D4A574]/50 transition-all group disabled:opacity-50"
                >
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-[#D4A574] flex-shrink-0" />
                    <span className="text-sm text-[#2D2416] group-hover:text-[#D4A574] transition-colors">{question}</span>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chat Interface */}
      <Card className="bg-[#FEFBF7] border-[#E8DCC8] shadow-lg">
        <CardHeader className="border-b border-[#E8DCC8] bg-gradient-to-r from-[#FFF9F0] to-white">
          <CardTitle className="flex items-center gap-3 text-[#2D2416]">
            <div className="bg-[#D4A574] p-2 rounded-full">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <T as="span" className="block">Assistente de Suporte</T>
              <T as="span" className="text-xs font-normal text-[#6B5D4F]">Tire suas dúvidas em tempo real</T>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px] p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] ${m.role === 'user' ? 'order-2' : 'order-1'}`}>
                    <div className="flex items-end gap-2">
                      {m.role === 'assistant' && (
                        <div className="bg-[#D4A574] p-1.5 rounded-full flex-shrink-0 mb-1">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className={`p-4 rounded-2xl shadow-sm ${
                        m.role === 'user' 
                          ? 'bg-[#D4A574] text-white rounded-br-md' 
                          : 'bg-white border border-[#E8DCC8] text-[#2D2416] rounded-bl-md'
                      }`}>
                        <div className="text-sm whitespace-pre-wrap leading-relaxed">
                          {m.content.split('**').map((part, idx) => 
                            idx % 2 === 1 ? <strong key={idx}>{part}</strong> : part
                          )}
                        </div>
                      </div>
                      {m.role === 'user' && (
                        <div className="bg-[#6B5D4F] p-1.5 rounded-full flex-shrink-0 mb-1">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {chatMutation.isPending && (
                <div className="flex justify-start">
                  <div className="flex items-end gap-2">
                    <div className="bg-[#D4A574] p-1.5 rounded-full flex-shrink-0 mb-1">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white border border-[#E8DCC8] p-4 rounded-2xl rounded-bl-md flex items-center gap-2 text-[#6B5D4F] text-sm">
                      <Loader2 className="w-4 h-4 animate-spin text-[#D4A574]" /> Digitando...
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="p-4 bg-white border-t border-[#E8DCC8]">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex gap-2"
            >
              <Input 
                placeholder="Digite sua dúvida aqui..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-[#FEFBF7] border-[#E8DCC8] focus:border-[#D4A574]"
              />
              <Button 
                type="submit" 
                disabled={!input.trim() || chatMutation.isPending} 
                className="bg-[#D4A574] hover:bg-[#C49565] text-white"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}