import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Send, 
  Bot, 
  User, 
  MapPin, 
  Calendar, 
  Info, 
  AlertCircle,
  CheckCircle2,
  PlayCircle,
  FileText,
  Loader2,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';

export default function NursePage() {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', content: 'Olá! Sou sua enfermeira virtual. Como posso ajudar com seus procedimentos, exames ou dúvidas de saúde hoje?' }
  ]);
  const scrollRef = useRef(null);
  const [userProfile, setUserProfile] = useState(null);

  // Fetch User Profile for Context
  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const user = await base44.auth.me();
      if (!user) return null;
      const profiles = await base44.entities.UserProfile.list({
          query: { user_email: user.email },
          limit: 1
      });
      return profiles.data[0] || { user_email: user.email, type: 'patient' }; // Fallback
    }
  });

  // Fetch Upcoming Appointments for Context
  const { data: appointments } = useQuery({
    queryKey: ['myAppointments'],
    queryFn: async () => {
      const user = await base44.auth.me();
      if (!user) return [];
      // Using generic list as we don't know if user is patient or pro yet perfectly without profile
      // Ideally filter by patient_email or professional_email
      return (await base44.entities.Appointment.list({
          sort: { start_time: 1 },
          limit: 5
      })).data;
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (userMsg) => {
      // Construct comprehensive context
      const context = `
        Você é uma Enfermeira Virtual empática, profissional e altamente qualificada.
        
        DADOS DO PACIENTE:
        ${JSON.stringify(profile, null, 2)}

        PRÓXIMOS AGENDAMENTOS:
        ${JSON.stringify(appointments, null, 2)}

        SUAS FUNÇÕES:
        1. Explicar procedimentos e exames (pré e pós operatório).
        2. Calcular dias para exames e dar alertas baseados na data atual (${new Date().toISOString()}).
        3. Se o usuário perguntar sobre localização, use os dados do agendamento.
        4. Indicar cuidados caseiros e medicamentos (sugestão genérica segura).
        5. Se houver vídeos do youtube relevantes, sugira buscar por termos específicos.
        6. Seja acolhedora.

        PERGUNTA DO USUÁRIO:
        ${userMsg}
      `;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: context,
        add_context_from_internet: true // To fetch real medical info/youtube links
      });
      return response;
    },
    onSuccess: (data) => {
      setChatHistory(prev => [...prev, { role: 'assistant', content: data }]);
    }
  });

  const handleSend = () => {
    if (!message.trim()) return;
    
    if (!profile) {
      setChatHistory(prev => [...prev, 
        { role: 'user', content: message },
        { role: 'assistant', content: '⚠️ **Acesso Restrito**: Para continuar nossa conversa e receber orientações de saúde personalizadas, por favor **finalize seu cadastro** clicando no banner acima.' }
      ]);
      setMessage('');
      return;
    }

    const newMsg = message;
    setChatHistory(prev => [...prev, { role: 'user', content: newMsg }]);
    setMessage('');
    sendMessageMutation.mutate(newMsg);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
      {/* Left: Context & Timeline */}
      <Card className="lg:col-span-1 flex flex-col overflow-hidden h-full border-slate-200 shadow-sm">
        <CardHeader className="bg-emerald-50 border-b border-emerald-100 pb-4">
          <CardTitle className="text-emerald-800 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Timeline de Cuidados
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-0 bg-slate-50/50">
          {appointments && appointments.length > 0 ? (
            <div className="relative p-6 space-y-8">
              <div className="absolute left-9 top-6 bottom-6 w-0.5 bg-slate-200" />
              {appointments.map((appt, idx) => {
                const days = differenceInDays(new Date(appt.start_time), new Date());
                return (
                  <div key={idx} className="relative flex gap-4">
                    <div className={`relative z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 bg-white ${days < 0 ? 'border-slate-300 text-slate-300' : days === 0 ? 'border-emerald-500 text-emerald-500 animate-pulse' : 'border-blue-500 text-blue-500'}`}>
                      <div className={`w-2 h-2 rounded-full ${days < 0 ? 'bg-slate-300' : days === 0 ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                    </div>
                    <div className="flex-1 bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          {days === 0 ? 'Hoje' : days < 0 ? `${Math.abs(days)} dias atrás` : `Em ${days} dias`}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${appt.type === 'surgery' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                          {appt.type}
                        </span>
                      </div>
                      <h4 className="font-semibold text-slate-900">{appt.title}</h4>
                      <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(appt.start_time), "dd 'de' MMMM, HH:mm", { locale: ptBR })}
                      </p>
                      {appt.location_details && (
                        <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          {appt.location_details}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Nenhum agendamento encontrado.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Right: Chat Interface */}
      <Card className="lg:col-span-2 flex flex-col overflow-hidden h-full border-slate-200 shadow-sm">
        <CardHeader className="bg-white border-b border-slate-100 flex flex-row items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-lg">Enfermeira Digital</CardTitle>
              <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Online
              </p>
            </div>
          </div>
        </CardHeader>
        
        <div 
          className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50" 
          ref={scrollRef}
        >
          {chatHistory.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-emerald-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                }`}
              >
                <ReactMarkdown className={`prose prose-sm max-w-none ${msg.role === 'user' ? 'prose-invert' : 'text-slate-700'}`}>
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}
          {sendMessageMutation.isPending && (
             <div className="flex justify-start">
               <div className="bg-white rounded-2xl rounded-tl-none p-4 shadow-sm border border-slate-100 flex items-center gap-2">
                 <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                 <span className="text-sm text-slate-400">Digitando...</span>
               </div>
             </div>
          )}
        </div>

        <div className="p-4 bg-white border-t border-slate-100">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex gap-3"
          >
            <Input 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tire suas dúvidas sobre exames, sintomas ou cuidados..."
              className="flex-1 bg-slate-50 border-slate-200 focus-visible:ring-emerald-500"
            />
            <Button 
              type="submit" 
              disabled={sendMessageMutation.isPending || !message.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}