import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Coffee, Plus, Edit, Trash2, Calendar, MapPin, Users, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import T from '@/components/TranslatedText';

export default function BeautyTeaAdmin() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    theme: '',
    location: '',
    date: '',
    time: '',
    total_slots: 20
  });

  const queryClient = useQueryClient();

  const { data: events } = useQuery({
    queryKey: ['adminBeautyTeaEvents'],
    queryFn: async () => {
      const res = await base44.entities.BeautyTeaEvent.list({ limit: 100, sort: { date: -1 } });
      return res.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.BeautyTeaEvent.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminBeautyTeaEvents']);
      queryClient.invalidateQueries(['beautyTeaEvents']);
      setIsCreateOpen(false);
      resetForm();
      alert('Evento criado com sucesso!');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.BeautyTeaEvent.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminBeautyTeaEvents']);
      queryClient.invalidateQueries(['beautyTeaEvents']);
      setEditingEvent(null);
      resetForm();
      alert('Evento atualizado!');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BeautyTeaEvent.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminBeautyTeaEvents']);
      queryClient.invalidateQueries(['beautyTeaEvents']);
      alert('Evento excluído!');
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      theme: '',
      location: '',
      date: '',
      time: '',
      total_slots: 20
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingEvent) {
      updateMutation.mutate({ id: editingEvent.id, data: formData });
    } else {
      createMutation.mutate({ ...formData, status: 'active', reserved_slots: 0 });
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      theme: event.theme,
      location: event.location,
      date: event.date,
      time: event.time,
      total_slots: event.total_slots
    });
    setIsCreateOpen(true);
  };

  const handleDelete = (id) => {
    if (confirm('Tem certeza que deseja excluir este evento?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-[#2D2416] flex items-center gap-2">
            <Coffee className="w-6 h-6 text-[#D4A574]" />
            <T>Gestão do Chá da Beleza</T>
          </h3>
          <T as="p" className="text-sm text-[#6B5D4F] mt-1">Gerencie os eventos e encontros exclusivos</T>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) {
            setEditingEvent(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-[#D4A574] hover:bg-[#C49565] text-white">
              <Plus className="w-4 h-4 mr-2" />
              <T>Novo Evento</T>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingEvent ? <T>Editar Evento</T> : <T>Criar Novo Evento</T>}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <T as={Label}>Nome do Evento *</T>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Chá da Beleza - Edição Verão"
                    required
                  />
                </div>
                
                <div className="col-span-2">
                  <T as={Label}>Tema *</T>
                  <Input
                    value={formData.theme}
                    onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                    placeholder="Ex: Tendências de Verão 2025"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <T as={Label}>Local *</T>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Ex: São Paulo - SP"
                    required
                  />
                </div>

                <div>
                  <T as={Label}>Data *</T>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <T as={Label}>Horário *</T>
                  <Input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <T as={Label}>Total de Vagas *</T>
                  <Input
                    type="number"
                    min="1"
                    value={formData.total_slots}
                    onChange={(e) => setFormData({ ...formData, total_slots: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsCreateOpen(false);
                    setEditingEvent(null);
                    resetForm();
                  }}
                >
                  <T>Cancelar</T>
                </Button>
                <Button 
                  type="submit" 
                  className="bg-[#D4A574] hover:bg-[#C49565]"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  {editingEvent ? <T>Atualizar</T> : <T>Criar Evento</T>}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle><T>Eventos Cadastrados</T></CardTitle>
        </CardHeader>
        <CardContent>
          {events && events.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><T>Evento</T></TableHead>
                  <TableHead><T>Data & Horário</T></TableHead>
                  <TableHead><T>Local</T></TableHead>
                  <TableHead><T>Vagas</T></TableHead>
                  <TableHead><T>Status</T></TableHead>
                  <TableHead><T>Ações</T></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => {
                  const availableSlots = event.total_slots - (event.reserved_slots || 0);
                  return (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div>
                          <div className="font-bold text-[#2D2416]">{event.name}</div>
                          <div className="text-xs text-[#D4A574]">{event.theme}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-[#D4A574]" />
                          {format(new Date(event.date), 'dd/MM/yyyy')} às {event.time}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-[#D4A574]" />
                          {event.location}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-[#D4A574]" />
                          <span className={availableSlots === 0 ? 'text-red-600 font-bold' : 'text-[#6B5D4F]'}>
                            {availableSlots}/{event.total_slots}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          event.status === 'active' ? 'bg-green-100 text-green-800' :
                          event.status === 'full' ? 'bg-red-100 text-red-800' :
                          event.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {event.status === 'active' ? <T>Ativo</T> :
                           event.status === 'full' ? <T>Lotado</T> :
                           event.status === 'completed' ? <T>Realizado</T> :
                           <T>Cancelado</T>}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(event)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(event.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-[#6B5D4F]">
              <Coffee className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <T as="p">Nenhum evento cadastrado ainda.</T>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}