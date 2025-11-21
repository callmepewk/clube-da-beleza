import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Send, Bot, Activity, Calendar, MapPin, Loader2, Sparkles, User 
} from 'lucide-react';
import UsageLimitBanner from '@/components/usage/UsageLimitBanner';
import { getPlanLimits, canUseFeature, getCurrentMonth } from '@/components/usage/usageLimits';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area'; 
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format, differenceInDays, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import T from '@/components/TranslatedText';
import { getCurrentLanguage } from '@/components/i18n/i18nUtils';

const NURSE_IMAGE = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691e6fc102be2b10ba4e6392/6ad7fd07e_nurse.png";

const EXAM_OPTIONS = [
  "Hemograma Completo", "Ultrassom Dermatológico", "Biópsia de Pele", 
  "Teste de Alergia", "Análise de Fototipo", "Mapeamento Corporal",
  "Exames Hormonais", "Dermatoscopia Digital"
];

const PROCEDURE_OPTIONS = [
  "Toxina Botulínica (Botox)", "Preenchimento Labial", "Harmonização Facial",
  "Microagulhamento", "Peeling Químico", "Bioestimuladores de Colágeno",
  "Fios de Sustentação", "Laser CO2 Fracionado", "Limpeza de Pele Profunda"
];

export default function NursePage() {
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState('ask_name'); // ask_name, ask_topic, chat
  const [chatHistory, setChatHistory] = useState([]);
  const [conversationActive, setConversationActive] = useState(true);
  const scrollRef = useRef(null);
  const queryClient = useQueryClient();
  
  // Context Data
  const { data: profile } = useQuery({
    queryKey: ['userProfileNurse'],
    queryFn: async () => {
      const user = await base44.auth.me();
      if (!user) return null;
      const profiles = await base44.entities.UserProfile.list({ query: { user_email: user.email } });
      return profiles?.data?.[0] || null;
    },
  });

  const planLimits = getPlanLimits(profile?.plan);
  const currentMonth = getCurrentMonth();
  const currentUsage = profile?.monthly_usage?.month === currentMonth ? profile?.monthly_usage?.nurse_conversations || 0 : 0;
  const canUseNurse = canUseFeature(currentUsage, planLimits.nurse_conversations_monthly);

  const { data: appointments } = useQuery({
    queryKey: ['myAppointmentsNurse'],
    queryFn: async () => {
       return (await base44.entities.Appointment.list({ sort: { start_time: 1 }, limit: 5 })).data;
    }
  });

  // Initialize Chat
  useEffect(() => {
    if (chatHistory.length === 0) {
      setChatHistory([
         { role: 'assistant', content: 'Olá! Sou a Bia, sua cuidadora virtual. Para começarmos, qual é o seu nome?' }
      ]);
    }
  }, []);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, step]);

  const logInteractionMutation = useMutation({
    mutationFn: (data) => base44.entities.NurseInteraction.create(data)
  });

  // Track conversation completion
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (conversationActive && chatHistory.length > 2 && profile) {
        await incrementNurseUsage();
      }
    };

    const handleVisibilityChange = async () => {
      if (document.hidden && conversationActive && chatHistory.length > 2 && profile) {
        await incrementNurseUsage();
        setConversationActive(false);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [conversationActive, chatHistory, profile]);

  const incrementNurseUsage = async () => {
    if (!profile) return;
    const month = getCurrentMonth();
    const usage = profile.monthly_usage || {};
    
    if (usage.month !== month) {
      await base44.entities.UserProfile.update(profile.id, {
        monthly_usage: {
          month,
          nurse_conversations: 1,
          chatbots_created: 0,
          sites_created: 0,
          designs_created: 0,
          products_created: 0,
          ai_packages_created: 0
        }
      });
    } else {
      await base44.entities.UserProfile.update(profile.id, {
        monthly_usage: {
          ...usage,
          nurse_conversations: (usage.nurse_conversations || 0) + 1
        }
      });
    }
    queryClient.invalidateQueries(['userProfileNurse']);
  };

  const handleEndChat = async () => {
    if (conversationActive && chatHistory.length > 2 && profile) {
      await incrementNurseUsage();
      setConversationActive(false);
      alert("Conversa encerrada. Obrigado por conversar com a Bia!");
      setChatHistory([{ role: 'assistant', content: 'Olá! Sou a Bia, sua cuidadora virtual. Para começarmos, qual é o seu nome?' }]);
      setStep('ask_name');
      setConversationActive(true);
    }
  };

  const sendMessageMutation = useMutation({
    mutationFn: async ({ userMsg, topic }) => {
      const currentLang = getCurrentLanguage();
      const langName = currentLang === 'pt-BR' ? 'Português Brasileiro' : 
                       currentLang === 'en' ? 'English' :
                       currentLang === 'es' ? 'Español' :
                       currentLang === 'fr' ? 'Français' :
                       currentLang === 'de' ? 'Deutsch' :
                       currentLang === 'it' ? 'Italiano' :
                       currentLang === 'zh' ? '中文' :
                       currentLang === 'ja' ? '日本語' :
                       currentLang === 'ko' ? '한국어' :
                       currentLang === 'ar' ? 'العربية' :
                       currentLang === 'ru' ? 'Русский' : 'English';
      
      const context = `You are Bia, a virtual caregiver specialized in aesthetics and health.
        Patient: ${name} (${profile?.type || 'visitor'}).
        Topic of interest: ${topic || 'General'}.
        
        Respond clearly, politely and informatively about ${topic === 'exam' ? 'aesthetic exams' : topic === 'procedure' ? 'aesthetic procedures' : 'general health'}.
        If the user asks about prices, provide average market estimates in Brazil (BRL).
        
        CRITICAL: You MUST respond in ${langName} language only. All your responses must be in ${langName}.
        
        User question: ${userMsg}
      `;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: context,
        add_context_from_internet: true
      });
      return response;
    },
    onSuccess: (data, variables) => {
      setChatHistory(prev => [...prev, { role: 'assistant', content: data }]);
      
      // Log interaction
      if (profile) {
        logInteractionMutation.mutate({
          user_email: profile.user_email,
          user_name: name,
          topic: variables.topic || 'general',
          query: variables.userMsg,
          sentiment_score: 0.8, // Mocked
          suggested_budget: 0 // Could be extracted from LLM
        });
      }
    }
  });

  const handleSend = (overrideMsg = null) => {
    const msg = overrideMsg || message;
    if (!msg.trim()) return;

    // 1. Name Collection
    if (step === 'ask_name') {
      setName(msg);
      setChatHistory(prev => [
        ...prev, 
        { role: 'user', content: msg },
        { role: 'assistant', content: `Certo, ${msg}. Sobre o que você gostaria de saber hoje? Selecione uma opção ou digite sua dúvida.` }
      ]);
      setStep('ask_topic');
      setMessage('');
      return;
    }

    // 2. Topic Selection or Chat
    setChatHistory(prev => [...prev, { role: 'user', content: msg }]);
    setMessage('');
    
    // Detect topic simply if manual input
    let topic = 'general';
    if (step === 'ask_topic') {
       setStep('chat'); // Move to free chat after first interaction
    }
    
    sendMessageMutation.mutate({ userMsg: msg, topic });
  };

  const handleOptionClick = (option, type) => {
    const text = `Gostaria de saber mais sobre ${option}`;
    setChatHistory(prev => [...prev, { role: 'user', content: text }]);
    setStep('chat');
    sendMessageMutation.mutate({ userMsg: text, topic: type });
  };

  if (!canUseNurse) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <UsageLimitBanner 
          currentUsage={currentUsage}
          limit={planLimits.nurse_conversations_monthly}
          resourceName="Conversas com a Bia"
          planName={planLimits.name}
        />
        <div className="text-center py-12 text-slate-500">
          <Bot className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <T as="p" className="text-lg font-semibold">Limite mensal atingido</T>
          <T as="p" className="text-sm mt-2">Faça upgrade para continuar conversando com a Bia</T>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <UsageLimitBanner 
        currentUsage={currentUsage}
        limit={planLimits.nurse_conversations_monthly}
        resourceName="Conversas com Enfermeira Virtual"
        planName={planLimits.name}
        isUnlimited={planLimits.nurse_conversations_monthly === -1}
      />
      
      <div className="h-[calc(100vh-12rem)] flex gap-6 overflow-hidden">
      
      {/* Interactive Nurse Avatar Section */}
      <div className="w-1/3 hidden lg:flex flex-col items-center justify-center relative">
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
          <div className="relative">
             <div className="absolute -inset-4 bg-emerald-400/20 blur-3xl rounded-full" />
             <img 
               src={NURSE_IMAGE} 
               alt="Nurse" 
               className="w-auto max-h-[60vh] object-contain drop-shadow-2xl relative z-10" 
             />
             
             {/* Speech Bubble */}
             {chatHistory.length > 0 && chatHistory[chatHistory.length - 1].role === 'assistant' && (
                 <div className="absolute -top-4 -right-20 bg-white p-4 rounded-2xl rounded-bl-none shadow-xl border-2 border-emerald-100 max-w-[250px] z-20">
                    <p className="text-sm text-slate-700 line-clamp-3">
                      {chatHistory[chatHistory.length - 1].content}
                    </p>
                    <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-b-2 border-l-2 border-emerald-100 transform rotate-45" />
                 </div>
             )}
          </div>
        </div>
        
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/50 to-white/0 rounded-3xl -z-0" />
      </div>

      {/* Main Interface Area */}
      <div className="flex-1 flex flex-col h-full gap-4">
         
         {/* Top Stats / Context */}
         <div className="grid grid-cols-2 gap-4 shrink-0">
            <Card className="bg-white/80 backdrop-blur border-emerald-100">
               <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                     <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                     <T as="p" className="text-xs text-slate-500">Status da IA</T>
                     <T as="p" className="text-sm font-bold text-emerald-700">Ativa e Pronta</T>
                  </div>
               </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur border-emerald-100">
               <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                     <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                     <T as="p" className="text-xs text-slate-500">Próximo Compromisso</T>
                     <T as="p" className="text-sm font-bold text-slate-700">
                        {appointments?.[0] ? formatDistanceToNow(new Date(appointments[0].start_time), { locale: ptBR, addSuffix: true }) : 'Nenhum agendado'}
                     </T>
                  </div>
               </CardContent>
            </Card>
         </div>

         {/* Chat Card */}
         <Card className="flex-1 flex flex-col shadow-xl border-slate-200 overflow-hidden bg-white/90 backdrop-blur rounded-2xl">
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center gap-3 bg-white shadow-sm z-10">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center border-2 border-emerald-500 overflow-hidden">
                <img src={NURSE_IMAGE} alt="Icon" className="w-full h-full object-cover scale-150 pt-2" />
              </div>
              <div>
               <T as="h2" className="font-bold text-slate-800">Bia - Cuidadora Virtual</T>
               <p className="text-xs text-slate-500 flex items-center gap-1">
                 <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                 <T>Online</T> • <T>IA Assistente de Saúde</T>
               </p>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/50" ref={scrollRef}>
              <div className="space-y-4 max-w-3xl mx-auto">
                {chatHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <Avatar className={`w-8 h-8 ${msg.role === 'assistant' ? 'bg-emerald-100 border-emerald-200' : 'bg-indigo-100 border-indigo-200'} border`}>
                      {msg.role === 'assistant' ? (
                        <AvatarImage src={NURSE_IMAGE} className="object-cover scale-150 pt-1" />
                      ) : null}
                      <AvatarFallback className={msg.role === 'assistant' ? 'text-emerald-700' : 'text-indigo-700'}>
                        {msg.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className={`flex flex-col gap-1 max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <span className="text-xs text-slate-400 px-1">
                         {msg.role === 'assistant' ? 'Bia' : <T>Você</T>}
                      </span>
                      <div
                        className={`p-3 rounded-2xl text-sm shadow-sm ${
                          msg.role === 'user'
                            ? 'bg-indigo-600 text-white rounded-tr-none'
                            : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  </div>
                ))}
                
                {sendMessageMutation.isPending && (
                  <div className="flex gap-3">
                    <Avatar className="w-8 h-8 bg-emerald-100 border border-emerald-200">
                      <AvatarImage src={NURSE_IMAGE} className="object-cover scale-150 pt-1" />
                    </Avatar>
                    <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex gap-1 items-center">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Interactive Suggestions */}
               {step === 'ask_topic' && (
                  <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 overflow-x-auto flex flex-col gap-2 no-scrollbar max-h-32">
                     <div className="flex gap-2 flex-wrap">
                       {EXAM_OPTIONS.map((item) => (
                          <Button 
                             key={item} 
                             variant="outline" 
                             size="sm" 
                             onClick={() => handleOptionClick(item, 'exam')}
                             className="whitespace-nowrap border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-transform"
                          >
                             {item}
                          </Button>
                       ))}
                     </div>
                     <div className="flex gap-2 flex-wrap">
                       {PROCEDURE_OPTIONS.map((item) => (
                          <Button 
                             key={item} 
                             variant="outline" 
                             size="sm" 
                             onClick={() => handleOptionClick(item, 'procedure')}
                             className="whitespace-nowrap border-purple-200 text-purple-700 hover:bg-purple-50 transition-transform"
                          >
                             {item}
                          </Button>
                       ))}
                     </div>
                  </div>
               )}

            {/* Input Area */}
            <div className="p-4 bg-white border-t">
             <form
               onSubmit={(e) => {
                 e.preventDefault();
                 handleSend();
               }}
               className="flex gap-2 max-w-3xl mx-auto"
             >
               <Input
                 placeholder={
                    step === 'ask_name' ? "Digite seu nome..." :
                    step === 'ask_topic' ? "Sobre o que gostaria de falar?" :
                    "Digite sua mensagem..."
                 }
                 value={message}
                 onChange={(e) => setMessage(e.target.value)}
                 disabled={sendMessageMutation.isPending}
                 className="flex-1 border-slate-200 focus:ring-emerald-500"
               />
               <Button 
                  type="button"
                  onClick={handleEndChat}
                  variant="outline"
                  className="text-red-600 hover:bg-red-50"
               >
                 <T>Encerrar</T>
               </Button>
               <Button 
                  type="submit" 
                  disabled={!message.trim() || sendMessageMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 transition-all hover:scale-105"
               >
                 {sendMessageMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
               </Button>
             </form>
            </div>
            </Card>
            </div>
            </div>
            </div>
            );
            }