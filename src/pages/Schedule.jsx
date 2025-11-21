import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  format, 
  startOfWeek, 
  addDays, 
  startOfDay, 
  isSameDay, 
  parseISO,
  addHours 
} from 'date-fns';
import { ptBR, enUS, es, fr, de, it, ja, zhCN, ru, ar as arSA } from 'date-fns/locale';
import { getCurrentLanguage } from '@/components/i18n/i18nUtils';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, ChevronLeft, ChevronRight, Video, MapPin, Sparkles, Calendar as CalendarIcon, Loader2, Globe, ExternalLink, Navigation } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import ClubRegistration from '@/components/ClubRegistration';
import T from '@/components/TranslatedText';

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const queryClient = useQueryClient();
  const [userProfile, setUserProfile] = useState(null);
  const [clubDialogOpen, setClubDialogOpen] = useState(false);
  
  const getDateLocale = () => {
    const lang = getCurrentLanguage();
    const locales = {
      'pt-BR': ptBR, 'pt-PT': ptBR, 'en': enUS, 'es': es, 
      'fr': fr, 'de': de, 'it': it, 'ja': ja, 'zh': zhCN, 'ru': ru, 'ar': arSA
    };
    return locales[lang] || ptBR;
  };

  // Fetch Profile for Access Control
  useEffect(() => {
    const loadProfile = async () => {
      const user = await base44.auth.me();
      const res = await base44.entities.UserProfile.list({ query: { user_email: user.email }});
      setUserProfile(res?.data?.[0]);
    };
    loadProfile();
  }, []);
  
  // Utils
  const getWeekDays = (date) => {
    const start = startOfWeek(date, { weekStartsOn: 0 });
    return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
  };

  const weekDays = getWeekDays(currentDate);
  const nextWeek = () => setCurrentDate(addDays(currentDate, 7));
  const prevWeek = () => setCurrentDate(addDays(currentDate, -7));

  // Fetch Appointments
  const { data: events = [] } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const res = await base44.entities.Appointment.list({ limit: 100 });
      return res.data.map(evt => ({
        ...evt,
        start: new Date(evt.start_time),
        end: new Date(evt.end_time),
      }));
    }
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Appointment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['appointments']);
    }
  });

  // Mock Integrations State
  const [integrations, setIntegrations] = useState({ google: false, outlook: false });
  const [isSyncing, setIsSyncing] = useState(false);

  const handleConnect = (type) => {
    setIsSyncing(true);
    // Simulate connection delay
    setTimeout(() => {
      setIntegrations(prev => ({ ...prev, [type]: !prev[type] }));
      setIsSyncing(false);
      alert(`${type === 'google' ? 'Google Calendar' : 'Outlook'} ${!integrations[type] ? 'conectado e sincronizado' : 'desconectado'} com sucesso!`);
      if (!integrations[type]) {
         // Add mock holidays/birthdays
         createMutation.mutate({
            title: "Feriado Nacional (Importado)",
            type: 'consultation',
            modality: 'in_person',
            start_time: addDays(startOfDay(new Date()), 2).toISOString(),
            end_time: addDays(startOfDay(new Date()), 2).toISOString(),
            patient_email: 'system',
            professional_email: userProfile?.user_email,
            status: 'scheduled'
         });
      }
    }, 1500);
  };

  // Professional: AI Availability Setup
  const [aiPrompt, setAiPrompt] = useState('');
  const aiAvailabilityMutation = useMutation({
    mutationFn: async () => {
      // This simulates the "AI questions which days and hours"
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `O profissional médico informou sua disponibilidade: "${aiPrompt}". 
        Data de referência: ${new Date().toISOString()}.
        Gere uma lista JSON de objetos de disponibilidade para os próximos 7 dias.
        Exemplo: [{"title": "Disponível - Consulta", "start": "ISO_DATE", "end": "ISO_DATE", "type": "consultation"}]`,
        response_json_schema: {
          type: "object",
          properties: {
            slots: { 
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: {type: "string"},
                  start: {type: "string"},
                  end: {type: "string"},
                  type: {type: "string"}
                }
              }
            }
          }
        }
      });
      return res.slots;
    },
    onSuccess: (slots) => {
      // Bulk create slots (simplified)
      slots.forEach(slot => {
        createMutation.mutate({
          title: slot.title,
          type: slot.type,
          modality: 'in_person', // default
          start_time: slot.start,
          end_time: slot.end,
          patient_email: 'available_slot', // Flag as open
          professional_email: userProfile?.user_email,
          location_details: userProfile?.service_address?.street || 'Consultório',
          status: 'scheduled'
        });
      });
      setAiPrompt('');
      alert('Agenda configurada com sucesso pela IA!');
    }
  });

  const getEventsForDay = (day) => {
    return events.filter(evt => isSameDay(evt.start, day));
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'surgery': return 'bg-red-100 text-red-800 border-red-200';
      case 'exam': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'procedure': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'consultation': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  // Render for Professional (Availability Manager)
  if (userProfile?.type === 'professional') {
    return (
      <div className="h-[calc(100vh-8rem)] flex flex-col space-y-6">
        <ClubRegistration open={clubDialogOpen} onOpenChange={setClubDialogOpen} />
        
        <div className="flex justify-between items-start">
           <div>
             <T as="h1" className="text-2xl font-bold text-[#0F172A]">Gestão de Agenda</T>
             <T as="p" className="text-[#64748B]">Configure seus horários e disponibilidades.</T>
           </div>
           <div className="flex gap-3">
              <Button 
               onClick={() => setClubDialogOpen(true)}
               variant="outline"
               className="bg-gradient-to-r from-[#D4A574] to-[#8B6F47] text-white border-0 hover:opacity-90 font-bold shadow-lg"
              >
               <Globe className="w-4 h-4 mr-2" />
               <T>Club da Beleza</T>
              </Button>
              <div className="bg-blue-50 p-2 rounded border border-blue-100 text-sm text-blue-800 max-w-md">
               <T as="span" className="font-bold">Local:</T> {userProfile?.service_address?.street || <T>Não definido</T>}
              </div>
           </div>
        </div>

        {/* Integrations Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <Card className="bg-white border-slate-200">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                 <div>
                   <T as="h3" className="font-bold text-[#0F172A] mb-2 flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5 text-[#0D9488]" /> Integrações de Calendário
                   </T>
                   <T as="p" className="text-sm text-[#64748B] mb-4">Conecte suas agendas externas para sincronizar feriados, aniversários e compromissos automaticamente.</T>
                 </div>
                 <div className="flex gap-3">
                    <Button 
                      variant="outline"
                      className={`flex-1 border-blue-200 text-blue-600 hover:bg-blue-50 ${integrations.google ? 'bg-green-50 text-green-700 border-green-200' : ''}`}
                      onClick={() => handleConnect('google')}
                      disabled={isSyncing}
                    >
                       <ExternalLink className="w-4 h-4 mr-2" />
                       {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : (integrations.google ? <T>✓ Conectado</T> : <T>Conectar Google Agenda</T>)}
                    </Button>
                    <Button 
                      variant="outline"
                      className={`flex-1 border-sky-200 text-sky-600 hover:bg-sky-50 ${integrations.outlook ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}`}
                      onClick={() => handleConnect('outlook')}
                      disabled={isSyncing}
                    >
                       <ExternalLink className="w-4 h-4 mr-2" />
                       {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : (integrations.outlook ? <T>✓ Conectado</T> : <T>Conectar Outlook</T>)}
                    </Button>
                 </div>
              </CardContent>
           </Card>

           <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100">
             <CardContent className="p-6">
               <div className="flex gap-4 items-start">
                 <div className="bg-white p-3 rounded-full shadow-sm text-indigo-600">
                   <Sparkles className="w-6 h-6" />
                 </div>
                 <div className="flex-1 space-y-3">
                   <T as="h3" className="font-semibold text-lg text-indigo-900">Assistente de Agenda Inteligente</T>
                   <T as="p" className="text-sm text-slate-600">
                     Diga-me quais dias e horários você atende e para quais procedimentos. Eu organizarei sua grade automaticamente com as cores corretas.
                   </T>
                   <div className="flex gap-2">
                     <Input 
                       placeholder="Ex: Atendo consultas segunda e quarta das 08h às 12h..." 
                       value={aiPrompt}
                       onChange={(e) => setAiPrompt(e.target.value)}
                       className="bg-white"
                     />
                     <Button 
                       onClick={() => aiAvailabilityMutation.mutate()} 
                       disabled={!aiPrompt || aiAvailabilityMutation.isPending}
                       className="bg-indigo-600 hover:bg-indigo-700 text-white"
                     >
                       {aiAvailabilityMutation.isPending ? <T>Configurando...</T> : <T>Gerar Agenda</T>}
                     </Button>
                   </div>
                 </div>
               </div>
             </CardContent>
           </Card>
        </div>

        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex flex-col">
           <div className="flex items-center justify-between mb-4">
              <T as="h3" className="font-semibold">Sua Grade Semanal</T>
              <div className="flex items-center bg-slate-50 border rounded-lg p-1">
                <Button variant="ghost" size="icon" onClick={prevWeek}><ChevronLeft className="w-4 h-4" /></Button>
                <span className="px-4 font-medium text-sm min-w-[120px] text-center capitalize">
                  {format(currentDate, "MMMM yyyy", { locale: getDateLocale() })}
                </span>
                <Button variant="ghost" size="icon" onClick={nextWeek}><ChevronRight className="w-4 h-4" /></Button>
              </div>
           </div>
           
           <div className="flex-1 overflow-x-auto">
              <div className="grid grid-cols-7 gap-4 min-w-[800px] h-full">
                {weekDays.map((day, i) => {
                  const dayEvents = getEventsForDay(day);
                  return (
                    <div key={i} className="flex flex-col h-full border-r border-slate-50 last:border-0 pr-2">
                      <div className="text-center py-2 mb-2">
                           <div className="text-xs font-bold text-slate-400 uppercase">{format(day, 'EEE', { locale: getDateLocale() })}</div>
                           <div className="text-lg font-bold text-slate-700">{format(day, 'dd')}</div>
                      </div>
                      <div className="space-y-2">
                        {dayEvents.map(evt => (
                          <div key={evt.id} className={`p-2 rounded text-xs border ${getTypeColor(evt.type)}`}>
                            <div className="font-bold">{evt.title}</div>
                            <div>{format(evt.start, 'HH:mm')} - {format(evt.end, 'HH:mm')}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
           </div>
        </div>
      </div>
    );
  }

  // Patient Scheduling States
  const [aiSearchQuery, setAiSearchQuery] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [locationInput, setLocationInput] = useState({
    street: '', number: '', neighborhood: '', city: '', state: '', complement: ''
  });
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const handleSearchChange = async (value) => {
    setAiSearchQuery(value);
    if (value.length > 2) {
      setIsLoadingSuggestions(true);
      try {
        const res = await base44.integrations.Core.InvokeLLM({
          prompt: `O usuário está buscando por: "${value}". Liste 5 tratamentos, consultas, procedimentos ou exames médicos/estéticos relacionados com a faixa de preço média em reais (Brasil). Retorne JSON com nome e faixa de preço realista.`,
          response_json_schema: {
            type: "object",
            properties: {
              suggestions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    price_range: { type: "string" }
                  }
                }
              }
            }
          }
        });
        setAiSuggestions(res.suggestions || []);
      } catch (e) {
        console.error('Erro ao buscar sugestões:', e);
        setAiSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    } else {
      setAiSuggestions([]);
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocalização não suportada.");
      return;
    }
    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await response.json();
        if (data && data.address) {
          setLocationInput({
            street: data.address.road || '',
            number: '',
            neighborhood: data.address.suburb || data.address.neighbourhood || '',
            city: data.address.city || data.address.town || '',
            state: data.address.state || '',
            complement: ''
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingLocation(false);
      }
    }, () => {
      setIsLoadingLocation(false);
      alert("Não foi possível obter sua localização.");
    });
  };

  // Render for Patient (My Appointments)
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      {/* AI Scheduling Modal */}
      <Dialog>
         <DialogTrigger asChild>
            <Button className="w-full sm:w-auto bg-black hover:bg-gray-900 text-[#D4AF37] border border-[#D4AF37] shadow-md font-bold">
             <Sparkles className="w-4 h-4 mr-2 text-[#D4AF37]" /> <T>Agendar com IA</T>
            </Button>
         </DialogTrigger>
         <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
             <T as={DialogTitle}>Agendamento Inteligente</T>
             <T as={DialogDescription}>Preencha os detalhes e deixe a IA encontrar o melhor profissional para você.</T>
            </DialogHeader>
            <div className="space-y-4 py-4">
               <div className="space-y-2">
                  <T as={Label}>O que você precisa?</T>
                  <div className="relative">
                    <Input 
                      placeholder="Ex: Consulta Dermatologista, Botox, Exame de Sangue..." 
                      value={aiSearchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                    />
                    {isLoadingSuggestions && (
                      <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin text-slate-400" />
                    )}
                    {aiSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg mt-1 z-50 max-h-48 overflow-y-auto">
                        {aiSuggestions.map((sug, i) => (
                          <div 
                            key={i}
                            className="p-3 hover:bg-slate-50 cursor-pointer border-b last:border-0"
                            onClick={() => {
                              setAiSearchQuery(sug.name);
                              setAiSuggestions([]);
                            }}
                          >
                            <div className="font-medium text-sm text-slate-900">{sug.name}</div>
                            <div className="text-xs text-slate-500">Faixa de preço: {sug.price_range}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <T as={Label}>Quando?</T>
                     <Input type="date" />
                  </div>
                  <div className="space-y-2">
                     <T as={Label}>Horário Preferido</T>
                     <Select>
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                           {Array.from({ length: 24 }).map((_, i) => (
                             <SelectItem key={i} value={`${i}:00`}>
                               {`${String(i).padStart(2, '0')}:00`}
                             </SelectItem>
                           ))}
                        </SelectContent>
                     </Select>
                  </div>
               </div>

               <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <T as={Label}>Onde?</T>
                    <Button 
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleUseMyLocation}
                      disabled={isLoadingLocation}
                      className="text-xs"
                    >
                      {isLoadingLocation ? (
                        <Loader2 className="w-3 h-3 animate-spin mr-2" />
                      ) : (
                        <Navigation className="w-3 h-3 mr-2" />
                      )}
                      <T>Usar minha localização</T>
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input 
                      placeholder="Cidade" 
                      value={locationInput.city}
                      onChange={(e) => setLocationInput({...locationInput, city: e.target.value})}
                    />
                    <Input 
                      placeholder="Estado" 
                      value={locationInput.state}
                      onChange={(e) => setLocationInput({...locationInput, state: e.target.value})}
                    />
                  </div>
                  <Input 
                    placeholder="Rua" 
                    value={locationInput.street}
                    onChange={(e) => setLocationInput({...locationInput, street: e.target.value})}
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <Input 
                      placeholder="Número" 
                      value={locationInput.number}
                      onChange={(e) => setLocationInput({...locationInput, number: e.target.value})}
                    />
                    <Input 
                      placeholder="Bairro" 
                      value={locationInput.neighborhood}
                      onChange={(e) => setLocationInput({...locationInput, neighborhood: e.target.value})}
                      className="col-span-2"
                    />
                  </div>
                  <Input 
                    placeholder="Complemento (opcional)" 
                    value={locationInput.complement}
                    onChange={(e) => setLocationInput({...locationInput, complement: e.target.value})}
                  />
               </div>

               <div className="space-y-2">
                  <T as={Label}>Faixa de Preço (R$) - Opcional</T>
                  <Input placeholder="Ex: até 300,00" type="number" />
               </div>
               <Button 
                 className="w-full bg-indigo-600 hover:bg-indigo-700"
                 onClick={() => alert('Funcionalidade em desenvolvimento. Em breve você poderá agendar diretamente com profissionais disponíveis!')}
               >
                 <T>Buscar & Agendar</T>
               </Button>
            </div>
         </DialogContent>
      </Dialog>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <T as="h1" className="text-2xl font-bold text-[#0F172A]">Meus Agendamentos</T>
          <div className="flex items-center bg-white border rounded-lg p-1 shadow-sm">
            <Button variant="ghost" size="icon" onClick={prevWeek}><ChevronLeft className="w-4 h-4" /></Button>
            <span className="px-4 font-medium min-w-[140px] text-center capitalize">
              {format(currentDate, "MMMM yyyy", { locale: getDateLocale() })}
            </span>
            <Button variant="ghost" size="icon" onClick={nextWeek}><ChevronRight className="w-4 h-4" /></Button>
          </div>
        </div>
        </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-100 p-4 overflow-x-auto">
        <div className="grid grid-cols-7 gap-4 min-w-[800px] h-full">
          {weekDays.map((day, i) => {
            const dayEvents = getEventsForDay(day);
            const isToday = isSameDay(day, new Date());
            return (
              <div key={i} className={`flex flex-col h-full ${isToday ? 'bg-emerald-50/30 rounded-lg border border-emerald-100' : ''}`}>
                <div className="text-center py-3 border-b border-slate-100 mb-2">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{format(day, 'EEE', { locale: getDateLocale() })}</div>
                  <div className={`text-xl font-bold mt-1 ${isToday ? 'text-emerald-600' : 'text-slate-700'}`}>{format(day, 'dd')}</div>
                </div>
                <div className="flex-1 space-y-2 p-2 overflow-y-auto">
                  {dayEvents.map(evt => (
                    <div key={evt.id} className={`p-2 rounded-lg text-xs border shadow-sm ${getTypeColor(evt.type)} hover:brightness-95 transition-all cursor-pointer`}>
                      <div className="font-bold truncate mb-1" title={evt.title}>{evt.title}</div>
                      <div className="flex items-center justify-between opacity-80">
                        <span>{format(evt.start, 'HH:mm')}</span>
                        {evt.modality === 'teleconsultation' && <Video className="w-3 h-3" />}
                      </div>
                      {evt.location_details && (
                        <div className="flex items-center gap-1 mt-1 opacity-70 truncate">
                          <MapPin className="w-3 h-3" /> {evt.location_details}
                        </div>
                      )}
                    </div>
                  ))}
                  {dayEvents.length === 0 && isToday && (
                    <div className="flex flex-col items-center justify-center h-20 text-slate-300 text-xs">
                      <T as="span" className="block">Livre</T>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}