import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Send, Bot, Activity, Calendar, MapPin, Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';

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
  const scrollRef = useRef(null);
  
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
         { role: 'assistant', content: 'Olá! Sou sua enfermeira virtual. Para começarmos, qual é o seu nome?' }
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

  const sendMessageMutation = useMutation({
    mutationFn: async ({ userMsg, topic }) => {
      const context = `
        Você é uma Enfermeira Virtual especialista em estética e saúde.
        Paciente: ${name} (${profile?.type || 'visitante'}).
        Tópico de interesse: ${topic || 'Geral'}.
        
        Responda de forma clara, educada e informativa sobre ${topic === 'exam' ? 'exames estéticos' : topic === 'procedure' ? 'procedimentos estéticos' : 'saúde geral'}.
        Se o usuário perguntar preços, dê uma estimativa média de mercado no Brasil.
        
        Pergunta do usuário: ${userMsg}
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
      {/* Timeline (Left) */}
      <Card className="hidden lg:flex lg:col-span-1 flex-col overflow-hidden h-full border-slate-200 shadow-sm">
        <CardHeader className="bg-emerald-50 border-b border-emerald-100 pb-4">
          <CardTitle className="text-emerald-800 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Timeline de Cuidados
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-0 bg-slate-50/50">
          {appointments?.length > 0 ? (
            <div className="p-6 space-y-6">
               {appointments.map((appt, idx) => {
                 const days = differenceInDays(new Date(appt.start_time), new Date());
                 return (
                   <div key={idx} className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                     <div className="text-xs font-bold text-slate-400 uppercase mb-1">
                       {days === 0 ? 'Hoje' : `Em ${days} dias`}
                     </div>
                     <h4 className="font-semibold text-slate-900">{appt.title}</h4>
                     <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                       <Calendar className="w-3 h-3" />
                       {format(new Date(appt.start_time), "dd/MM/yyyy HH:mm")}
                     </div>
                   </div>
                 );
               })}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400">Nenhum agendamento.</div>
          )}
        </CardContent>
      </Card>

      {/* Chat (Right) */}
      <Card className="lg:col-span-2 flex flex-col overflow-hidden h-full border-slate-200 shadow-sm">
        <CardHeader className="bg-white border-b border-slate-100 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-lg">Enfermeira Digital</CardTitle>
              <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Online
              </p>
            </div>
          </div>
        </CardHeader>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50" ref={scrollRef}>
          {chatHistory.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${msg.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'}`}>
                <ReactMarkdown className={`prose prose-sm max-w-none ${msg.role === 'user' ? 'prose-invert' : 'text-slate-700'}`}>{msg.content}</ReactMarkdown>
              </div>
            </div>
          ))}
          
          {/* Suggestion Chips */}
          {step === 'ask_topic' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
               <div>
                 <p className="text-xs font-bold text-slate-400 uppercase ml-1 mb-2">Exames Estéticos</p>
                 <div className="flex flex-wrap gap-2">
                   {EXAM_OPTIONS.map(opt => (
                     <button key={opt} onClick={() => handleOptionClick(opt, 'exam')} className="px-3 py-1.5 bg-white border border-emerald-200 text-emerald-700 rounded-full text-sm hover:bg-emerald-50 transition-colors">
                       {opt}
                     </button>
                   ))}
                 </div>
               </div>
               <div>
                 <p className="text-xs font-bold text-slate-400 uppercase ml-1 mb-2">Procedimentos Estéticos</p>
                 <div className="flex flex-wrap gap-2">
                   {PROCEDURE_OPTIONS.map(opt => (
                     <button key={opt} onClick={() => handleOptionClick(opt, 'procedure')} className="px-3 py-1.5 bg-white border border-purple-200 text-purple-700 rounded-full text-sm hover:bg-purple-50 transition-colors">
                       {opt}
                     </button>
                   ))}
                 </div>
               </div>
            </div>
          )}

          {sendMessageMutation.isPending && (
             <div className="flex justify-start"><div className="bg-white rounded-2xl p-4 shadow-sm border flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin text-emerald-600" /><span className="text-sm text-slate-400">Digitando...</span></div></div>
          )}
        </div>

        <div className="p-4 bg-white border-t border-slate-100">
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-3">
            <Input 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={step === 'ask_name' ? "Digite seu nome..." : "Digite sua dúvida..."}
              className="flex-1 bg-slate-50 focus-visible:ring-emerald-500"
            />
            <Button type="submit" disabled={sendMessageMutation.isPending || !message.trim()} className="bg-emerald-600 hover:bg-emerald-700">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}