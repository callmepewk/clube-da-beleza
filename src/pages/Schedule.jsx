import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import ptBR from 'date-fns/locale/pt-BR';
import 'react-big-calendar/lib/css/react-big-calendar.css';
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

const locales = {
  'pt-BR': ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function SchedulePage() {
  const [isNewEventOpen, setIsNewEventOpen] = useState(false);
  const queryClient = useQueryClient();
  
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

  const eventStyleGetter = (event) => {
    let backgroundColor = '#3174ad';
    switch (event.type) {
      case 'surgery': backgroundColor = '#ef4444'; break;
      case 'exam': backgroundColor = '#f59e0b'; break;
      case 'procedure': backgroundColor = '#8b5cf6'; break;
      case 'consultation': backgroundColor = '#10b981'; break;
      default: break;
    }
    return { style: { backgroundColor } };
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Agendamentos</h1>
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

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          eventPropGetter={eventStyleGetter}
          messages={{
            next: "Próximo",
            previous: "Anterior",
            today: "Hoje",
            month: "Mês",
            week: "Semana",
            day: "Dia"
          }}
          culture="pt-BR"
        />
      </div>
    </div>
  );
}