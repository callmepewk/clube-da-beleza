import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, startOfWeek, addDays, startOfDay, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Calendar as CalendarIcon, MapPin, Video } from 'lucide-react';

// Calendar Utils
const getWeekDays = (date) => {
  const start = startOfWeek(date, { weekStartsOn: 0 });
  return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
};

export default function SchedulePage() {
  const [isNewEventOpen, setIsNewEventOpen] = useState(false);
  const queryClient = useQueryClient();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const weekDays = getWeekDays(currentDate);

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

  const getEventsForDay = (day) => {
    return events.filter(evt => isSameDay(evt.start, day));
  };

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Appointment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['appointments']);
      setIsNewEventOpen(false);
    }
  });

  const handleCreate = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const start = new Date(formData.get('date') + 'T' + formData.get('time'));
    const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour default duration

    createMutation.mutate({
      title: formData.get('title'),
      type: formData.get('type'),
      modality: formData.get('modality'),
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      patient_email: formData.get('patient_email'),
      professional_email: 'current_user_email_placeholder', // Should be from auth
      location_details: formData.get('location'),
      notes: formData.get('notes'),
      status: 'scheduled'
    });
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

  const nextWeek = () => setCurrentDate(addDays(currentDate, 7));
  const prevWeek = () => setCurrentDate(addDays(currentDate, -7));

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-900">Agendamentos</h1>
          <div className="flex items-center bg-white border rounded-lg p-1 shadow-sm">
            <Button variant="ghost" size="icon" onClick={prevWeek}><ChevronLeft className="w-4 h-4" /></Button>
            <span className="px-4 font-medium">{format(currentDate, "MMMM yyyy", { locale: ptBR })}</span>
            <Button variant="ghost" size="icon" onClick={nextWeek}><ChevronRight className="w-4 h-4" /></Button>
          </div>
        </div>
        <Dialog open={isNewEventOpen} onOpenChange={setIsNewEventOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Agendamento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Agendar Procedimento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select name="type" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">Consulta</SelectItem>
                      <SelectItem value="exam">Exame</SelectItem>
                      <SelectItem value="procedure">Procedimento</SelectItem>
                      <SelectItem value="surgery">Cirurgia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Modalidade</Label>
                  <Select name="modality" required defaultValue="in_person">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_person">Presencial</SelectItem>
                      <SelectItem value="teleconsultation">Teleconsulta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Título / Procedimento</Label>
                <Input name="title" placeholder="Ex: Consulta Dermatologia" required />
              </div>

              <div className="space-y-2">
                <Label>Email do Paciente</Label>
                <Input name="patient_email" type="email" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input name="date" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label>Horário</Label>
                  <Input name="time" type="time" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Localização / Link</Label>
                <Input name="location" placeholder="Endereço ou Link da sala" />
              </div>

              <div className="space-y-2">
                <Label>Notas</Label>
                <Textarea name="notes" placeholder="Instruções especiais..." />
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" className="bg-emerald-600 w-full">Agendar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-100 p-4 overflow-x-auto">
        <div className="grid grid-cols-7 gap-4 min-w-[800px] h-full">
          {weekDays.map((day, i) => {
            const dayEvents = getEventsForDay(day);
            const isToday = isSameDay(day, new Date());
            return (
              <div key={i} className={`flex flex-col h-full ${isToday ? 'bg-emerald-50/30 rounded-lg' : ''}`}>
                <div className="text-center py-2 border-b border-slate-100 mb-2">
                  <div className="text-sm font-medium text-slate-500 uppercase">{format(day, 'EEE', { locale: ptBR })}</div>
                  <div className={`text-lg font-bold ${isToday ? 'text-emerald-600' : 'text-slate-900'}`}>{format(day, 'dd')}</div>
                </div>
                <div className="flex-1 space-y-2 p-1 overflow-y-auto">
                  {dayEvents.map(evt => (
                    <div key={evt.id} className={`p-2 rounded-md text-xs border ${getTypeColor(evt.type)} cursor-pointer hover:opacity-80 transition-opacity`}>
                      <div className="font-bold truncate">{evt.title}</div>
                      <div className="opacity-80">{format(evt.start, 'HH:mm')}</div>
                      {evt.modality === 'teleconsultation' && (
                        <div className="flex items-center gap-1 mt-1 opacity-70"><Video className="w-3 h-3" /> Online</div>
                      )}
                    </div>
                  ))}
                  {dayEvents.length === 0 && isToday && (
                    <div className="text-center text-xs text-slate-300 mt-4">Livre</div>
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