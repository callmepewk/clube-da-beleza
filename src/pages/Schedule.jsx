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
import { ptBR } from 'date-fns/locale';
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
import { Plus, ChevronLeft, ChevronRight, Video, MapPin, Sparkles, Calendar as CalendarIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const queryClient = useQueryClient();
  const [userProfile, setUserProfile] = useState(null);

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
        <div className="flex justify-between items-start">
           <div>
             <h1 className="text-2xl font-bold text-[#0F172A]">Gestão de Agenda</h1>
             <p className="text-[#64748B]">Configure seus horários e disponibilidades.</p>
           </div>
           <div className="bg-blue-50 p-2 rounded border border-blue-100 text-sm text-blue-800 max-w-md">
             <span className="font-bold">Local de Atendimento Atual:</span> {userProfile?.service_address?.street || 'Não definido'}
           </div>
        </div>

        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100">
          <CardContent className="p-6">
            <div className="flex gap-4 items-start">
              <div className="bg-white p-3 rounded-full shadow-sm text-indigo-600">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="flex-1 space-y-3">
                <h3 className="font-semibold text-lg text-indigo-900">Assistente de Agenda Inteligente</h3>
                <p className="text-sm text-slate-600">
                  Diga-me quais dias e horários você atende e para quais procedimentos. Eu organizarei sua grade automaticamente com as cores corretas.
                </p>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Ex: Atendo consultas segunda e quarta das 08h às 12h, e cirurgias sexta à tarde..." 
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="bg-white"
                  />
                  <Button 
                    onClick={() => aiAvailabilityMutation.mutate()} 
                    disabled={!aiPrompt || aiAvailabilityMutation.isPending}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    {aiAvailabilityMutation.isPending ? 'Configurando...' : 'Gerar Agenda'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex flex-col">
           <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Sua Grade Semanal</h3>
              <div className="flex items-center bg-slate-50 border rounded-lg p-1">
                <Button variant="ghost" size="icon" onClick={prevWeek}><ChevronLeft className="w-4 h-4" /></Button>
                <span className="px-4 font-medium text-sm min-w-[120px] text-center capitalize">
                  {format(currentDate, "MMMM yyyy", { locale: ptBR })}
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
                         <div className="text-xs font-bold text-slate-400 uppercase">{format(day, 'EEE', { locale: ptBR })}</div>
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

  // Render for Patient (My Appointments)
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      {/* AI Scheduling Modal */}
      <Dialog>
         <DialogTrigger asChild>
            <Button className="w-full sm:w-auto bg-black hover:bg-gray-900 text-[#D4AF37] border border-[#D4AF37] shadow-md font-bold">
              <Sparkles className="w-4 h-4 mr-2 text-[#D4AF37]" /> Agendar com IA
            </Button>
         </DialogTrigger>
         <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Agendamento Inteligente</DialogTitle>
              <DialogDescription>Preencha os detalhes e deixe a IA encontrar o melhor profissional para você.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
               <div className="space-y-2">
                  <Label>O que você precisa?</Label>
                  <Input placeholder="Ex: Consulta Dermatologista, Botox, Exame de Sangue..." />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <Label>Quando?</Label>
                     <Input type="date" />
                  </div>
                  <div className="space-y-2">
                     <Label>Horário Preferido</Label>
                     <Select>
                        <SelectTrigger><SelectValue placeholder="Qualquer horário" /></SelectTrigger>
                        <SelectContent>
                           <SelectItem value="morning">Manhã</SelectItem>
                           <SelectItem value="afternoon">Tarde</SelectItem>
                           <SelectItem value="night">Noite</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>
               </div>
               <div className="space-y-2">
                  <Label>Onde?</Label>
                  <Input placeholder="Bairro, Cidade ou Online" defaultValue={userProfile?.address?.city || ''} />
               </div>
               <div className="space-y-2">
                  <Label>Faixa de Preço (R$)</Label>
                  <Input placeholder="Ex: até 300,00" type="number" />
               </div>
               <Button className="w-full bg-indigo-600">Buscar & Agendar</Button>
            </div>
         </DialogContent>
      </Dialog>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-[#0F172A]">Meus Agendamentos</h1>
          <div className="flex items-center bg-white border rounded-lg p-1 shadow-sm">
            <Button variant="ghost" size="icon" onClick={prevWeek}><ChevronLeft className="w-4 h-4" /></Button>
            <span className="px-4 font-medium min-w-[140px] text-center capitalize">
              {format(currentDate, "MMMM yyyy", { locale: ptBR })}
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
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{format(day, 'EEE', { locale: ptBR })}</div>
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
                      <span className="block">Livre</span>
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