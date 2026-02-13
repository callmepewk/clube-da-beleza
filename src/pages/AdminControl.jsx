import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users, LayoutDashboard, DollarSign, Activity, Shield, Trash2, 
  BarChart3, UserCheck, Building2, Loader2, Search, Bell, Send,
  User, Stethoscope, X, Globe, Bot, Palette, Calendar, Eye, MousePointer, BarChart2,
  Lock, Unlock, AlertTriangle, Plus, Image, Clock, CalendarClock, ClipboardList
} from 'lucide-react';
import BeautyTeaAdmin from '@/components/admin/BeautyTeaAdmin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import T from '@/components/TranslatedText';
import GenerateProfessionalReport from '@/components/admin/GenerateProfessionalReport';
import PlatformSettingsCard from '@/components/admin/PlatformSettingsCard';
import TrendsRealtime from '@/components/admin/TrendsRealtime';

// Lista de páginas do sistema
const SYSTEM_PAGES = [
  { path: '/', name: 'Página Inicial' },
  { path: '/news', name: 'Notícias' },
  { path: '/schedule', name: 'Pesquisa Detalhada' },
  { path: '/nurse', name: 'Bia - Cuidadora Virtual' },
  { path: '/chatbots', name: 'Crie Chatbots' },
  { path: '/beautyspace', name: 'Beauty Space' },
  { path: '/sites', name: 'Crie Sites' },
  { path: '/design', name: 'Faça Designs' },
  { path: '/products', name: 'Crie Produtos' },
  { path: '/plans', name: 'Planos' },
  { path: '/about', name: 'Sobre Nós' },
  { path: '/profile', name: 'Meu Perfil' },
  { path: '/tools', name: 'Nossas Ferramentas' },
];

// Keywords de SEO simuladas
const SEO_KEYWORDS = [
  { keyword: 'clinica estetica', position: 1, volume: 12500, change: '+2' },
  { keyword: 'dermatologista', position: 2, volume: 9800, change: '+1' },
  { keyword: 'harmonização facial', position: 3, volume: 8500, change: '0' },
  { keyword: 'botox preço', position: 4, volume: 7200, change: '+3' },
  { keyword: 'preenchimento labial', position: 5, volume: 6800, change: '-1' },
  { keyword: 'limpeza de pele', position: 6, volume: 5500, change: '+2' },
  { keyword: 'peeling facial', position: 7, volume: 4900, change: '+1' },
  { keyword: 'tratamento para acne', position: 8, volume: 4200, change: '0' },
  { keyword: 'depilação a laser', position: 9, volume: 3800, change: '+4' },
  { keyword: 'skincare rotina', position: 10, volume: 3500, change: '-2' },
];

function NotificationSender() {
   const [form, setForm] = useState({ title: '', message: '', link: '', image_url: '', target_type: 'all' });
   const queryClient = useQueryClient();

   const { data: allProfiles } = useQuery({
      queryKey: ['allUserProfiles'],
      queryFn: async () => {
         const res = await base44.entities.UserProfile.list({ limit: 1000 });
         return res.data;
      }
   });

   const sendMutation = useMutation({
      mutationFn: async () => {
         // If target is ALL, send one broadcast notification
         if (form.target_type === 'all') {
            return base44.entities.Notification.create({
               recipient_email: 'ALL',
               title: form.title,
               message: form.message,
               link: form.link || '',
               image_url: form.image_url || '',
               created_at: new Date().toISOString(),
               read_by: []
            });
         }
         
         // Otherwise, send individual notifications to filtered users
         const filtered = allProfiles.filter(p => p.type === form.target_type);
         for (const profile of filtered) {
            await base44.entities.Notification.create({
               recipient_email: profile.user_email,
               title: form.title,
               message: form.message,
               link: form.link || '',
               image_url: form.image_url || '',
               created_at: new Date().toISOString(),
               is_read: false
            });
         }
         
         return { count: filtered.length };
      },
      onSuccess: (result) => {
         queryClient.invalidateQueries(['notifications']);
         const targetLabel = form.target_type === 'all' ? 'todos os usuários' : 
                           form.target_type === 'patient' ? 'todos os pacientes' :
                           form.target_type === 'professional' ? 'todos os profissionais' : 'todos os patrocinadores';
         alert(`Notificação enviada para ${targetLabel}!${result.count ? ` (${result.count} usuários)` : ''}`);
         setForm({ title: '', message: '', link: '', image_url: '', target_type: 'all' });
      }
   });

   const getTargetCount = () => {
      if (!allProfiles) return 0;
      if (form.target_type === 'all') return allProfiles.length;
      return allProfiles.filter(p => p.type === form.target_type).length;
   };

   return (
      <div className="space-y-4">
         <div className="space-y-2">
            <Label className="font-bold">Público Alvo *</Label>
            <Select value={form.target_type} onValueChange={(val) => setForm({...form, target_type: val})}>
               <SelectTrigger className="bg-slate-50 border-slate-200">
                  <SelectValue />
               </SelectTrigger>
               <SelectContent>
                  <SelectItem value="all">
                     <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>Todos os Usuários</span>
                     </div>
                  </SelectItem>
                  <SelectItem value="patient">
                     <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>Apenas Pacientes</span>
                     </div>
                  </SelectItem>
                  <SelectItem value="professional">
                     <div className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4" />
                        <span>Apenas Profissionais</span>
                     </div>
                  </SelectItem>
                  <SelectItem value="sponsor">
                     <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        <span>Apenas Patrocinadores</span>
                     </div>
                  </SelectItem>
               </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
               Será enviado para: <span className="font-bold text-[#0D9488]">{getTargetCount()} usuário(s)</span>
            </p>
         </div>

         <div className="space-y-2">
            <Label className="font-bold">Título *</Label>
            <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Ex: Nova funcionalidade disponível!" className="bg-slate-50" />
         </div>
         
         <div className="space-y-2">
            <Label className="font-bold">Mensagem *</Label>
            <Textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} placeholder="Digite a mensagem..." rows={4} className="bg-slate-50" />
         </div>
         
         <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
               <Label>Link (Opcional)</Label>
               <Input value={form.link} onChange={e => setForm({...form, link: e.target.value})} placeholder="https://..." className="bg-slate-50" />
            </div>
            <div className="space-y-2">
               <Label>Imagem URL (Opcional)</Label>
               <Input value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} placeholder="https://..." className="bg-slate-50" />
            </div>
         </div>

         {form.title && form.message && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
               <p className="text-xs text-blue-700 font-bold mb-2">PREVIEW:</p>
               <div className="bg-white rounded-lg p-3 border border-blue-100">
                  <p className="font-bold text-sm text-slate-800">{form.title}</p>
                  <p className="text-xs text-slate-600 mt-1">{form.message}</p>
                  {form.image_url && <img src={form.image_url} className="w-full h-20 object-cover rounded mt-2" alt="Preview" />}
               </div>
            </div>
         )}

         <Button 
            onClick={() => sendMutation.mutate()} 
            disabled={!form.title || !form.message || sendMutation.isPending}
            className="w-full bg-[#0D9488] hover:bg-[#0F766E] text-white h-12 font-bold shadow-lg"
         >
            {sendMutation.isPending ? (
               <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Enviando...
               </>
            ) : (
               <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Notificação
               </>
            )}
         </Button>
      </div>
   );
}

function BannerAdminList() {
  const queryClient = useQueryClient();
  const [showCreateBanner, setShowCreateBanner] = useState(false);
  const [newBanner, setNewBanner] = useState({
    title: '',
    media_url: '',
    link_url: '',
    position: 'center',
    target_audience: 'all',
    contact_email: '',
    contact_phone: ''
  });

  const { data: banners } = useQuery({
    queryKey: ['adminBanners'],
    queryFn: async () => (await base44.entities.Banner.list({ limit: 100 })).data
  });

  const deleteBannerMutation = useMutation({
    mutationFn: (id) => base44.entities.Banner.delete(id),
    onSuccess: () => {
       queryClient.invalidateQueries(['adminBanners']);
       alert("Banner excluído.");
    }
  });

  const createBannerMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.Banner.create({
        ...newBanner,
        owner_email: user.email,
        active: true,
        views: 0,
        clicks: 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminBanners']);
      setShowCreateBanner(false);
      setNewBanner({ title: '', media_url: '', link_url: '', position: 'center', target_audience: 'all', contact_email: '', contact_phone: '' });
      alert("Banner criado com sucesso!");
    }
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setNewBanner(prev => ({ ...prev, media_url: file_url }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Banner Button */}
      <div className="flex justify-end">
        <Button onClick={() => setShowCreateBanner(!showCreateBanner)} className="bg-[#D4A574] hover:bg-[#C49565] text-white">
          <Plus className="w-4 h-4 mr-2" />
          <T>Criar Banner</T>
        </Button>
      </div>

      {/* Create Banner Form */}
      {showCreateBanner && (
        <Card className="bg-[#FFF9F0] border-[#D4A574]/30">
          <CardHeader>
            <CardTitle className="text-[#2D2416]"><T>Novo Banner</T></CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label><T>Título</T></Label>
                <Input value={newBanner.title} onChange={e => setNewBanner(p => ({ ...p, title: e.target.value }))} placeholder="Nome do banner" />
              </div>
              <div className="space-y-2">
                <Label><T>Link de Destino</T></Label>
                <Input value={newBanner.link_url} onChange={e => setNewBanner(p => ({ ...p, link_url: e.target.value }))} placeholder="https://..." />
              </div>
            </div>
            <div className="space-y-2">
              <Label><T>Imagem do Banner</T></Label>
              <div className="flex gap-4 items-center">
                <Input type="file" accept="image/*" onChange={handleImageUpload} className="flex-1" />
                {newBanner.media_url && <img src={newBanner.media_url} className="w-20 h-20 object-cover rounded" />}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label><T>Posição</T></Label>
                <Select value={newBanner.position} onValueChange={v => setNewBanner(p => ({ ...p, position: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="center">Centro</SelectItem>
                    <SelectItem value="header">Cabeçalho</SelectItem>
                    <SelectItem value="sidebar_right">Lateral Direita</SelectItem>
                    <SelectItem value="sidebar_left">Lateral Esquerda</SelectItem>
                    <SelectItem value="bottom">Rodapé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label><T>Público Alvo</T></Label>
                <Select value={newBanner.target_audience} onValueChange={v => setNewBanner(p => ({ ...p, target_audience: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="patient">Pacientes</SelectItem>
                    <SelectItem value="professional">Profissionais</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label><T>Email de Contato</T></Label>
                <Input value={newBanner.contact_email} onChange={e => setNewBanner(p => ({ ...p, contact_email: e.target.value }))} placeholder="contato@empresa.com" />
              </div>
              <div className="space-y-2">
                <Label><T>Telefone de Contato</T></Label>
                <Input value={newBanner.contact_phone} onChange={e => setNewBanner(p => ({ ...p, contact_phone: e.target.value }))} placeholder="(11) 99999-9999" />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowCreateBanner(false)}><T>Cancelar</T></Button>
              <Button onClick={() => createBannerMutation.mutate()} disabled={!newBanner.title || !newBanner.media_url || !newBanner.link_url || createBannerMutation.isPending} className="bg-[#D4A574] hover:bg-[#C49565] text-white">
                {createBannerMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <T>Criar Banner</T>}
              </Button>
            </div>
            </CardContent>
        </Card>
        </>
        )}

        {/* Banner List */}
      <Table>
        <TableHeader><TableRow><TableHead>Título</TableHead><TableHead>Dono</TableHead><TableHead>Posição</TableHead><TableHead>Público</TableHead><TableHead>Views/Clicks</TableHead><TableHead>Ações</TableHead></TableRow></TableHeader>
        <TableBody>
           {banners?.map(b => (
              <TableRow key={b.id}>
                 <TableCell>
                    <div className="flex items-center gap-2">
                       <img src={b.media_url} className="w-8 h-8 rounded object-cover" />
                       {b.title}
                    </div>
                 </TableCell>
                 <TableCell>{b.owner_email}</TableCell>
                 <TableCell>{b.position}</TableCell>
                 <TableCell>{b.target_audience}</TableCell>
                 <TableCell>
                   <span className="text-blue-600">{b.views || 0}</span> / <span className="text-green-600">{b.clicks || 0}</span>
                 </TableCell>
                 <TableCell>
                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => { if(confirm('Excluir anúncio?')) deleteBannerMutation.mutate(b.id); }}>
                       <Trash2 className="w-4 h-4" />
                    </Button>
                 </TableCell>
              </TableRow>
           ))}
        </TableBody>
     </Table>
    </div>
  );
}

// Page Block Management Component
function PageBlockManager() {
  const queryClient = useQueryClient();
  const [schedulingPage, setSchedulingPage] = useState(null);
  const [scheduleType, setScheduleType] = useState('unblock'); // 'block' or 'unblock'
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  
  const { data: pageBlocks, isLoading } = useQuery({
    queryKey: ['pageBlocks'],
    queryFn: async () => {
      const res = await base44.entities.PageBlock.list({ limit: 100 });
      return res.data || [];
    }
  });

  // Check for scheduled actions on load
  React.useEffect(() => {
    const checkSchedules = () => {
      if (!pageBlocks) return;
      const now = new Date();
      
      pageBlocks.forEach(async (block) => {
        // Check scheduled block
        if (block.scheduled_block_date && new Date(block.scheduled_block_date) <= now && !block.is_blocked) {
          await base44.entities.PageBlock.update(block.id, { 
            is_blocked: true, 
            scheduled_block_date: null 
          });
          queryClient.invalidateQueries(['pageBlocks']);
        }
        // Check scheduled unblock
        if (block.scheduled_unblock_date && new Date(block.scheduled_unblock_date) <= now && block.is_blocked) {
          await base44.entities.PageBlock.update(block.id, { 
            is_blocked: false, 
            scheduled_unblock_date: null 
          });
          queryClient.invalidateQueries(['pageBlocks']);
        }
      });
    };
    
    checkSchedules();
    const interval = setInterval(checkSchedules, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [pageBlocks, queryClient]);

  const updateBlockMutation = useMutation({
    mutationFn: async ({ pageData, isBlocked }) => {
      const existing = pageBlocks?.find(p => p.page_path === pageData.path);
      if (existing) {
        return base44.entities.PageBlock.update(existing.id, { is_blocked: isBlocked });
      } else {
        return base44.entities.PageBlock.create({
          page_path: pageData.path,
          page_name: pageData.name,
          is_blocked: isBlocked
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pageBlocks']);
    }
  });

  const scheduleBlockMutation = useMutation({
    mutationFn: async ({ pageData, type, dateTime }) => {
      const existing = pageBlocks?.find(p => p.page_path === pageData.path);
      const updateData = type === 'block' 
        ? { scheduled_block_date: dateTime }
        : { scheduled_unblock_date: dateTime };
      
      if (existing) {
        return base44.entities.PageBlock.update(existing.id, updateData);
      } else {
        return base44.entities.PageBlock.create({
          page_path: pageData.path,
          page_name: pageData.name,
          is_blocked: false,
          ...updateData
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pageBlocks']);
      setSchedulingPage(null);
      setScheduleDate('');
      setScheduleTime('');
      alert('Agendamento salvo com sucesso!');
    }
  });

  const clearScheduleMutation = useMutation({
    mutationFn: async ({ pageData, type }) => {
      const existing = pageBlocks?.find(p => p.page_path === pageData.path);
      if (existing) {
        const updateData = type === 'block' 
          ? { scheduled_block_date: null }
          : { scheduled_unblock_date: null };
        return base44.entities.PageBlock.update(existing.id, updateData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pageBlocks']);
    }
  });

  const blockAllMutation = useMutation({
    mutationFn: async (block) => {
      for (const page of SYSTEM_PAGES) {
        const existing = pageBlocks?.find(p => p.page_path === page.path);
        if (existing) {
          await base44.entities.PageBlock.update(existing.id, { is_blocked: block });
        } else {
          await base44.entities.PageBlock.create({
            page_path: page.path,
            page_name: page.name,
            is_blocked: block
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pageBlocks']);
    }
  });

  const isPageBlocked = (path) => {
    const block = pageBlocks?.find(p => p.page_path === path);
    return block?.is_blocked || false;
  };

  const getPageSchedule = (path) => {
    return pageBlocks?.find(p => p.page_path === path);
  };

  const handleSaveSchedule = () => {
    if (!scheduleDate || !scheduleTime || !schedulingPage) return;
    const dateTime = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
    scheduleBlockMutation.mutate({ pageData: schedulingPage, type: scheduleType, dateTime });
  };

  return (
    <Card className="border-[#D4A574]/30">
      <CardHeader className="bg-gradient-to-r from-[#D4A574] to-[#B8935C] text-white rounded-t-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5" />
            <CardTitle><T>Bloqueio de Páginas</T></CardTitle>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="secondary"
              size="sm"
              onClick={() => blockAllMutation.mutate(false)}
              disabled={blockAllMutation.isPending}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Unlock className="w-4 h-4 mr-2" />
              <T>Liberar Todas</T>
            </Button>
            <Button 
              variant="outline"
              size="sm"
              onClick={() => blockAllMutation.mutate(true)}
              disabled={blockAllMutation.isPending}
              className="bg-white text-[#D4A574] hover:bg-[#FFF9F0]"
            >
              <Lock className="w-4 h-4 mr-2" />
              <T>Bloquear Todas</T>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <T as="p" className="font-bold text-yellow-800">Atenção</T>
              <T as="p" className="text-sm text-yellow-700">
                Páginas bloqueadas exibirão uma mensagem de manutenção. Apenas admins podem acessá-las.
              </T>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <CalendarClock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <T as="p" className="font-bold text-blue-800">Agendamento</T>
              <T as="p" className="text-sm text-blue-700">
                Agende bloqueios/desbloqueios automáticos para lançamentos ou manutenções programadas.
              </T>
            </div>
          </div>
        </div>

        {/* Pages Grid */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-[#D4A574]" />
          </div>
        ) : (
          <div className="space-y-3">
            {SYSTEM_PAGES.map((page) => {
              const blocked = isPageBlocked(page.path);
              const schedule = getPageSchedule(page.path);
              const hasBlockSchedule = !!schedule?.scheduled_block_date;
              const hasUnblockSchedule = !!schedule?.scheduled_unblock_date;
              
              return (
                <div 
                  key={page.path}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    blocked 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-green-50 border-green-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${blocked ? 'bg-red-100' : 'bg-green-100'}`}>
                        <Lock className={`w-4 h-4 ${blocked ? 'text-red-600' : 'text-green-600'}`} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{page.name}</p>
                        <p className="text-xs text-slate-500">{page.path}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={blocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}>
                        {blocked ? 'Bloqueada' : 'Liberada'}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSchedulingPage(page);
                          setScheduleType(blocked ? 'unblock' : 'block');
                        }}
                        className="text-xs border-[#D4A574]/30 text-[#6B5D4F] hover:bg-[#FFF9F0]"
                      >
                        <CalendarClock className="w-3 h-3 mr-1" />
                        Agendar
                      </Button>
                      <Switch 
                        checked={!blocked}
                        onCheckedChange={(checked) => updateBlockMutation.mutate({ pageData: page, isBlocked: !checked })}
                        disabled={updateBlockMutation.isPending}
                      />
                    </div>
                  </div>
                  
                  {/* Show scheduled actions */}
                  {(hasBlockSchedule || hasUnblockSchedule) && (
                    <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap gap-2">
                      {hasBlockSchedule && (
                        <div className="flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs">
                          <Clock className="w-3 h-3" />
                          <span>Bloqueio: {format(new Date(schedule.scheduled_block_date), "dd/MM/yyyy 'às' HH:mm")}</span>
                          <button 
                            onClick={() => clearScheduleMutation.mutate({ pageData: page, type: 'block' })}
                            className="ml-1 hover:bg-red-200 rounded p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      {hasUnblockSchedule && (
                        <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-xs">
                          <Clock className="w-3 h-3" />
                          <span>Desbloqueio: {format(new Date(schedule.scheduled_unblock_date), "dd/MM/yyyy 'às' HH:mm")}</span>
                          <button 
                            onClick={() => clearScheduleMutation.mutate({ pageData: page, type: 'unblock' })}
                            className="ml-1 hover:bg-green-200 rounded p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* Schedule Modal */}
      {schedulingPage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSchedulingPage(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[#2D2416]">Agendar {scheduleType === 'block' ? 'Bloqueio' : 'Desbloqueio'}</h3>
              <Button variant="ghost" size="icon" onClick={() => setSchedulingPage(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="bg-[#FFF9F0] border border-[#D4A574]/30 rounded-lg p-4">
                <p className="font-medium text-[#2D2416]">{schedulingPage.name}</p>
                <p className="text-sm text-[#6B5D4F]">{schedulingPage.path}</p>
              </div>

              <div className="space-y-2">
                <Label>Tipo de Agendamento</Label>
                <Select value={scheduleType} onValueChange={setScheduleType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="block">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-red-500" />
                        <span>Agendar Bloqueio</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="unblock">
                      <div className="flex items-center gap-2">
                        <Unlock className="w-4 h-4 text-green-500" />
                        <span>Agendar Desbloqueio</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input 
                    type="date" 
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Horário</Label>
                  <Input 
                    type="time" 
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                <p className="font-medium mb-1">💡 Dica</p>
                <p>Use para lançamentos: bloqueie a página, prepare tudo e agende o desbloqueio para o momento do lançamento!</p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setSchedulingPage(null)}>
                  Cancelar
                </Button>
                <Button 
                  className="flex-1 bg-[#D4A574] hover:bg-[#C49565] text-white"
                  onClick={handleSaveSchedule}
                  disabled={!scheduleDate || !scheduleTime || scheduleBlockMutation.isPending}
                >
                  {scheduleBlockMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar Agendamento'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

function ServiceRequestsAdmin() {
  const { useState } = React;
  const queryClient = useQueryClient();
  const { data: requests, isLoading } = useQuery({
    queryKey: ['serviceRequests'],
    queryFn: async () => (await base44.entities.ServiceRequest.list({ limit: 1000 })).data || []
  });

  const [searchEmail, setSearchEmail] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all'); // gratuito | pago
  const [wlFilter, setWlFilter] = useState('all'); // all | true | false
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [areaFilter, setAreaFilter] = useState('');

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => base44.entities.ServiceRequest.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries(['serviceRequests'])
  });
  const updatePriority = useMutation({
    mutationFn: ({ id, priority }) => base44.entities.ServiceRequest.update(id, { priority }),
    onSuccess: () => queryClient.invalidateQueries(['serviceRequests'])
  });

  const allCategories = Array.from(new Set((requests || []).flatMap(r => Array.isArray(r.categories) ? r.categories : [])));
  const filtered = (requests || []).filter(r => {
    const emailOk = !searchEmail || (r.user_email || '').toLowerCase().includes(searchEmail.toLowerCase());
    const statusOk = statusFilter === 'all' || r.status === statusFilter;
    const typeOk = typeFilter === 'all' || r.type === typeFilter;
    const wlOk = wlFilter === 'all' || (!!r.white_label === (wlFilter === 'true'));
    const catOk = categoryFilter === 'all' || (Array.isArray(r.categories) && r.categories.includes(categoryFilter));
    const areaOk = !areaFilter || (r.area || '').toLowerCase().includes(areaFilter.toLowerCase());
    return emailOk && statusOk && typeOk && wlOk && catOk && areaOk;
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-[#FEFBF7] border border-[#D4A574]/20 p-3 rounded-xl">
        <Input placeholder="Buscar por email" value={searchEmail} onChange={e => setSearchEmail(e.target.value)} className="bg-white" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="bg-white"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos (Status)</SelectItem>
            <SelectItem value="novo">Novo</SelectItem>
            <SelectItem value="em_analise">Em Análise</SelectItem>
            <SelectItem value="aprovado">Aprovado</SelectItem>
            <SelectItem value="concluido">Concluído</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="bg-white"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos (Tipo)</SelectItem>
            <SelectItem value="gratuito">Gratuito</SelectItem>
            <SelectItem value="pago">Pago</SelectItem>
          </SelectContent>
        </Select>
        <Select value={wlFilter} onValueChange={setWlFilter}>
          <SelectTrigger className="bg-white"><SelectValue placeholder="White Label" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">WL: Todos</SelectItem>
            <SelectItem value="true">WL: Sim</SelectItem>
            <SelectItem value="false">WL: Não</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="bg-white"><SelectValue placeholder="Categoria" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas (Categorias)</SelectItem>
            {allCategories.map(c => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
          </SelectContent>
        </Select>
        <Input placeholder="Área de atuação" value={areaFilter} onChange={e => setAreaFilter(e.target.value)} className="bg-white md:col-span-2" />
      </div>

      <div className="bg-[#FFF9F0] border border-[#D4A574]/20 rounded-xl p-3 text-sm text-[#6B5D4F]">
        Total: <Badge className="bg-white text-[#2D2416] border-[#D4A574]/20">{filtered.length}</Badge>{' '}
        | Novos: {filtered.filter(r=>r.status==='novo').length} | Em Análise: {filtered.filter(r=>r.status==='em_analise').length}
      </div>

      {isLoading ? (
        <div className="py-6 text-center text-[#6B5D4F]">Carregando solicitações...</div>
      ) : filtered.length === 0 ? (
        <div className="py-10 text-center text-[#6B5D4F]">Nenhuma solicitação encontrada.</div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Categorias</TableHead>
                <TableHead>Área</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>WL</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Notas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(r => (
                <TableRow key={r.id} className="hover:bg-[#FEFBF7]">
                  <TableCell>{new Date(r.created_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="font-medium text-[#2D2416]">{r.user_email}</div>
                    {r.user_name && <div className="text-xs text-[#6B5D4F]">{r.user_name}</div>}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[220px]">
                      {(r.categories || []).map(c => (<Badge key={c} className="bg-white text-[#2D2416] border-[#D4A574]/30">{c}</Badge>))}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{r.area}</TableCell>
                  <TableCell>
                    <Badge className={r.type === 'pago' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}>{r.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={r.white_label ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'}>{r.white_label ? 'Sim' : 'Não'}</Badge>
                  </TableCell>
                  <TableCell>
                    <Select defaultValue={r.status} onValueChange={(v) => updateStatus.mutate({ id: r.id, status: v })}>
                      <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="novo">Novo</SelectItem>
                        <SelectItem value="em_analise">Em Análise</SelectItem>
                        <SelectItem value="aprovado">Aprovado</SelectItem>
                        <SelectItem value="concluido">Concluído</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select defaultValue={r.priority || 'media'} onValueChange={(v) => updatePriority.mutate({ id: r.id, priority: v })}>
                      <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baixa">Baixa</SelectItem>
                        <SelectItem value="media">Média</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="max-w-[260px] truncate" title={r.notes || ''}>{r.notes || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

export default function AdminControlPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [reportPeriod, setReportPeriod] = useState('monthly');
  const [editingUser, setEditingUser] = useState(null);
  const queryClient = useQueryClient();

  // 1. Fetch All Users
  const { data: allUsers, isLoading: usersLoading } = useQuery({
    queryKey: ['adminAllUsers'],
    queryFn: async () => {
      // In a real app with thousands of users, this should be paginated backend search
      // For now, we fetch list and filter client side for the demo
      const res = await base44.entities.UserProfile.list({ limit: 1000 });
      return res.data;
    }
  });

  // 2. Fetch Analytics Data
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['adminAnalytics'],
    queryFn: async () => {
      const appts = await base44.entities.Appointment.list({ limit: 1000 });
      const nurseInts = await base44.entities.NurseInteraction.list({ limit: 1000 });
      const creations = await base44.entities.AICreation.list({ limit: 1000 });
      const products = await base44.entities.Product.list({ limit: 1000 });
      const banners = await base44.entities.Banner.list({ limit: 1000 });
      
      // Calculate averages
      const avgProductPrice = products.data.length > 0 
        ? products.data.reduce((acc, p) => acc + (p.price || 0), 0) / products.data.length 
        : 0;
      
      const avgValuation = products.data.length > 0
        ? (products.data.reduce((acc, p) => acc + (p.price || 0), 0) * 10) / products.data.length
        : 0;
      
      // Top nurse topics
      const topicsCount = {};
      nurseInts.data.forEach(n => {
        topicsCount[n.topic] = (topicsCount[n.topic] || 0) + 1;
      });
      
      // Tool usage by users
      const toolUsage = {
        nurse: nurseInts.data.length,
        sites: creations.data.filter(c => c.type === 'landing_page').length,
        chatbots: creations.data.filter(c => c.type === 'chatbot').length,
        designs: creations.data.filter(c => c.type === 'design_project').length,
        products: products.data.length
      };
      
      return {
        appointments: appts.data,
        nurse: nurseInts.data,
        creations: creations.data,
        products: products.data,
        banners: banners.data,
        avgProductPrice,
        avgValuation,
        topicsCount,
        toolUsage
      };
    }
  });

  // Mutations
  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.UserProfile.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminAllUsers']);
      alert("Usuário atualizado com sucesso!");
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id) => base44.entities.UserProfile.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminAllUsers']);
      alert("Usuário excluído.");
    }
  });

  const grantCoinsMutation = useMutation({
    mutationFn: ({ userId, coins }) => {
      const currentCoins = allUsers?.find(u => u.id === userId)?.beauty_coins || 0;
      return base44.entities.UserProfile.update(userId, { 
        beauty_coins: currentCoins + parseInt(coins) 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminAllUsers']);
      alert("Beauty Coins concedidos com sucesso!");
    }
  });

  const grantClubPointsMutation = useMutation({
    mutationFn: ({ userId, points }) => {
      const currentPoints = allUsers?.find(u => u.id === userId)?.club_points || 0;
      return base44.entities.UserProfile.update(userId, { 
        club_points: currentPoints + parseInt(points) 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminAllUsers']);
      alert("Pontos do Clube concedidos com sucesso!");
    }
  });

  const grantTestAccessMutation = useMutation({
     mutationFn: ({ id, type }) => base44.entities.UserProfile.update(id, {
        type: type,
        plan: 'test_trial',
        test_account_start_date: new Date().toISOString()
     }),
     onSuccess: () => {
        queryClient.invalidateQueries(['adminAllUsers']);
        alert("Conta de teste configurada por 7 dias.");
     }
  });

  // Filters
  const filteredUsers = allUsers?.filter(u => {
     const matchesSearch = u.user_email.toLowerCase().includes(searchTerm.toLowerCase());
     const matchesType = filterType === 'all' || u.type === filterType;
     return matchesSearch && matchesType;
  });

  // Chart Data Prep
  const getAppointmentsChartData = () => {
     if (!analytics?.appointments) return [];
     // Group by date
     const grouped = analytics.appointments.reduce((acc, curr) => {
        const date = curr.start_time.split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
     }, {});
     return Object.entries(grouped).map(([date, count]) => ({ date, count })).sort((a,b) => new Date(a.date) - new Date(b.date));
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-light text-[#2D2416] flex items-center gap-3">
            <Shield className="w-8 h-8 text-[#D4A574]" /> Painel de Controle
          </h1>
          <p className="text-[#6B5D4F] mt-1 font-light">Gestão completa da plataforma</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()} className="border-[#D4A574]/30 text-[#6B5D4F] hover:bg-[#FFF9F0] font-light">
             <BarChart3 className="w-4 h-4 mr-2" /> Gerar Relatório PDF
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex flex-wrap h-auto gap-2 bg-[#FEFBF7] border border-[#D4A574]/20 p-2">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[#D4A574] data-[state=active]:text-white text-[#6B5D4F] font-light text-xs sm:text-sm">Visão Geral</TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-[#D4A574] data-[state=active]:text-white text-[#6B5D4F] font-light text-xs sm:text-sm">Usuários</TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-[#D4A574] data-[state=active]:text-white text-[#6B5D4F] font-light text-xs sm:text-sm">Analytics</TabsTrigger>
          <TabsTrigger value="tools" className="data-[state=active]:bg-[#D4A574] data-[state=active]:text-white text-[#6B5D4F] font-light text-xs sm:text-sm">Ferramentas</TabsTrigger>
          <TabsTrigger value="seo" className="data-[state=active]:bg-[#D4A574] data-[state=active]:text-white text-[#6B5D4F] font-light text-xs sm:text-sm">SEO & Tráfego</TabsTrigger>
          <TabsTrigger value="page-blocks" className="data-[state=active]:bg-[#D4A574] data-[state=active]:text-white text-[#6B5D4F] font-light text-xs sm:text-sm">Bloqueio</TabsTrigger>
          <TabsTrigger value="banners" className="data-[state=active]:bg-[#D4A574] data-[state=active]:text-white text-[#6B5D4F] font-light text-xs sm:text-sm">Anúncios</TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-[#D4A574] data-[state=active]:text-white text-[#6B5D4F] font-light text-xs sm:text-sm">Notificações</TabsTrigger>
          <TabsTrigger value="service-requests" className="data-[state=active]:bg-[#D4A574] data-[state=active]:text-white text-[#6B5D4F] font-light text-xs sm:text-sm">Solicitações</TabsTrigger>
          <TabsTrigger value="beauty-tea" className="data-[state=active]:bg-[#D4A574] data-[state=active]:text-white text-[#6B5D4F] font-light text-xs sm:text-sm">Chá da Beleza</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-[#FEFBF7] border-[#D4A574]/20 shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="text-xs font-light text-[#6B5D4F] uppercase tracking-wider">Total de Usuários</CardTitle></CardHeader>
              <CardContent><div className="text-3xl font-light text-[#2D2416]">{allUsers?.length || 0}</div></CardContent>
            </Card>
            <Card className="bg-[#FEFBF7] border-[#D4A574]/20 shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="text-xs font-light text-[#6B5D4F] uppercase tracking-wider">Agendamentos</CardTitle></CardHeader>
              <CardContent><div className="text-3xl font-light text-[#2D2416]">{analytics?.appointments?.length || 0}</div></CardContent>
            </Card>
            <Card className="bg-[#FEFBF7] border-[#D4A574]/20 shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="text-xs font-light text-[#6B5D4F] uppercase tracking-wider">Interações IA</CardTitle></CardHeader>
              <CardContent><div className="text-3xl font-light text-[#2D2416]">{analytics?.nurse?.length || 0}</div></CardContent>
            </Card>
            <Card className="bg-[#FEFBF7] border-[#D4A574]/20 shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="text-xs font-light text-[#6B5D4F] uppercase tracking-wider">Faturamento Total (Est.)</CardTitle></CardHeader>
              <CardContent><div className="text-3xl font-light text-[#C9A868]">R$ {(analytics?.appointments?.length || 0) * 250},00</div></CardContent>
            </Card>
            <Card className="bg-[#FEFBF7] border-[#D4A574]/20 shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="text-xs font-light text-[#6B5D4F] uppercase tracking-wider">Preço Médio Produtos</CardTitle></CardHeader>
              <CardContent>
                 <div className="text-3xl font-light text-[#B8935C]">
                    R$ {analytics?.avgProductPrice?.toFixed(2) || '0.00'}
                 </div>
              </CardContent>
            </Card>
            <Card className="bg-[#FEFBF7] border-[#D4A574]/20 shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="text-xs font-light text-[#6B5D4F] uppercase tracking-wider">Valuation Médio</CardTitle></CardHeader>
              <CardContent>
                 <div className="text-3xl font-light text-[#D4A574]">
                    R$ {analytics?.avgValuation?.toFixed(2) || '0.00'}
                 </div>
              </CardContent>
            </Card>
            <Card className="bg-[#FEFBF7] border-[#D4A574]/20 shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="text-xs font-light text-[#6B5D4F] uppercase tracking-wider flex items-center gap-2"><Eye className="w-4 h-4" /> Total de Visualizações</CardTitle></CardHeader>
              <CardContent>
                 <div className="text-3xl font-light text-[#2D2416]">
                    {analytics?.banners?.reduce((acc, b) => acc + (b.views || 0), 0) || 0}
                 </div>
              </CardContent>
            </Card>
            <Card className="bg-[#FEFBF7] border-[#D4A574]/20 shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="text-xs font-light text-[#6B5D4F] uppercase tracking-wider flex items-center gap-2"><MousePointer className="w-4 h-4" /> Total de Cliques</CardTitle></CardHeader>
              <CardContent>
                 <div className="text-3xl font-light text-[#2D2416]">
                    {analytics?.banners?.reduce((acc, b) => acc + (b.clicks || 0), 0) || 0}
                 </div>
              </CardContent>
            </Card>
          </div>
          
          <TrendsRealtime />
          <Card className="p-6">
            <CardHeader><CardTitle>SEO & Palavras‑chave</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-green-700 font-bold">Tráfego Orgânico</div>
                  <div className="text-2xl font-bold text-green-900">+15%</div>
                  <div className="text-xs text-green-600">Últimos 30 dias</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-blue-700 font-bold">Keywords Top 10</div>
                  <div className="text-2xl font-bold text-blue-900">10</div>
                  <div className="text-xs text-blue-600">Palavras rankeadas</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-sm text-orange-700 font-bold">Backlinks Ativos</div>
                  <div className="text-2xl font-bold text-orange-900">142</div>
                  <div className="text-xs text-orange-600">Domínios de alta autoridade</div>
                </div>

                {/* Top 10 Keywords Table */}
                <div className="bg-slate-50 rounded-xl p-4">
                  <h4 className="font-bold text-slate-800 mb-4">Top 10 Palavras-Chave</h4>
                  <div className="space-y-2">
                    {SEO_KEYWORDS.map((kw, idx) => (
                      <div key={kw.keyword} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-[#D4A574] text-white text-xs font-bold flex items-center justify-center">{idx + 1}</span>
                          <span className="font-medium text-slate-800">{kw.keyword}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-slate-500">{kw.volume.toLocaleString()} buscas/mês</span>
                          <span className={`font-bold ${kw.change.startsWith('+') ? 'text-green-600' : kw.change.startsWith('-') ? 'text-red-600' : 'text-slate-500'}`}>
                            {kw.change}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  </div>
                  </CardContent>
            </Card>
            <Card className="p-6">
            <CardTitle className="mb-4">Fluxo de Agendamentos</CardTitle>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getAppointmentsChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} name="Consultas" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        <div className="mt-6">
          <GenerateProfessionalReport />
        </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <CardTitle>Gerenciamento de Usuários</CardTitle>
                <div className="flex gap-2">
                   <Select value={filterType} onValueChange={setFilterType}>
                     <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filtrar por tipo" /></SelectTrigger>
                     <SelectContent>
                       <SelectItem value="all">Todos</SelectItem>
                       <SelectItem value="patient">Pacientes</SelectItem>
                       <SelectItem value="professional">Profissionais</SelectItem>
                       <SelectItem value="sponsor">Patrocinadores</SelectItem>
                     </SelectContent>
                   </Select>
                   <div className="relative">
                     <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                     <Input placeholder="Buscar email..." className="pl-8 w-[250px]" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                   </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Moedas/Pontos</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers?.map(u => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-bold shadow-md">
                            {u.user_email?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{u.user_email}</div>
                            {u.phone && <div className="text-xs text-slate-500">{u.phone}</div>}
                            {u.cpf && <div className="text-xs text-slate-400">CPF: {u.cpf}</div>}
                            {u.type === 'professional' && u.professional_registry && (
                              <div className="text-xs text-blue-600 font-medium">CRM: {u.professional_registry}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select value={u.type} onValueChange={(val) => updateUserMutation.mutate({ id: u.id, data: { type: val } })}>
                          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="patient">Paciente</SelectItem>
                            <SelectItem value="professional">Profissional</SelectItem>
                            <SelectItem value="sponsor">Patrocinador</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select value={u.plan || 'free'} onValueChange={(val) => updateUserMutation.mutate({ id: u.id, data: { plan: val } })}>
                          <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="free">Free</SelectItem>
                            <SelectItem value="pro">Pro</SelectItem>
                            <SelectItem value="premium">Premium</SelectItem>
                            <SelectItem value="sponsor_gold">Gold</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">Coins:</span>
                            <span className="font-bold text-amber-600">{u.beauty_coins || 0}</span>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-6 w-6"
                              onClick={() => {
                                const coins = prompt("Quantos Beauty Coins conceder?");
                                if (coins) grantCoinsMutation.mutate({ userId: u.id, coins });
                              }}
                            >
                              <DollarSign className="w-3 h-3 text-amber-600" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">Pontos:</span>
                            <span className="font-bold text-purple-600">{u.club_points || 0}</span>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-6 w-6"
                              onClick={() => {
                                const points = prompt("Quantos Pontos do Clube conceder?");
                                if (points) grantClubPointsMutation.mutate({ userId: u.id, points });
                              }}
                            >
                              <Activity className="w-3 h-3 text-purple-600" />
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                         {u.is_admin ? <Badge className="bg-purple-100 text-purple-800">Admin</Badge> : <span className="text-slate-500">Ativo</span>}
                         {u.plan === 'test_trial' && <Badge className="ml-2 bg-orange-100 text-orange-800">Teste 7d</Badge>}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                           <Button 
                             variant="ghost" 
                             size="icon" 
                             className="h-8 w-8"
                             title="Ver/Editar Detalhes"
                             onClick={() => setEditingUser(u)}
                           >
                             <UserCheck className="w-4 h-4 text-blue-600" />
                           </Button>

                           <Button 
                             variant="ghost" 
                             size="icon" 
                             className="h-8 w-8"
                             title="Tornar Admin"
                             onClick={() => updateUserMutation.mutate({ id: u.id, data: { is_admin: !u.is_admin } })}
                           >
                             <Shield className={`w-4 h-4 ${u.is_admin ? 'text-purple-600' : 'text-slate-300'}`} />
                           </Button>

                           <Button 
                             variant="ghost" 
                             size="icon" 
                             className="h-8 w-8 text-red-500 hover:text-red-700"
                             onClick={() => { if(confirm('Excluir usuário?')) deleteUserMutation.mutate(u.id); }}
                           >
                             <Trash2 className="w-4 h-4" />
                           </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Relatórios Analíticos</h3>
            <Select value={reportPeriod} onValueChange={setReportPeriod}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Diário</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="monthly">Mensal</SelectItem>
                <SelectItem value="annual">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Principais Pesquisas - Enfermeira</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.topicsCount && Object.entries(analytics.topicsCount).sort((a,b) => b[1] - a[1]).slice(0, 5).map(([topic, count]) => (
                    <div key={topic} className="flex justify-between items-center">
                      <span className="font-medium capitalize">{topic}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-teal-500 h-full" style={{ width: `${(count / analytics.nurse.length) * 100}%` }}></div>
                        </div>
                        <span className="text-sm font-bold text-slate-600">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Uso por Ferramenta</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[{label:'Enfermeira Virtual', key:'nurse', color:'bg-teal-500'}, {label:'Sites', key:'sites', color:'bg-purple-500'}, {label:'Chatbots', key:'chatbots', color:'bg-green-500'}, {label:'Designs', key:'designs', color:'bg-orange-500'}, {label:'Produtos', key:'products', color:'bg-pink-500'}].map(item => {
                    const total = (analytics?.toolUsage?.nurse||0)+(analytics?.toolUsage?.sites||0)+(analytics?.toolUsage?.chatbots||0)+(analytics?.toolUsage?.designs||0)+(analytics?.toolUsage?.products||0) || 1;
                    const count = analytics?.toolUsage?.[item.key] || 0;
                    const pct = Math.round((count/total)*100);
                    return (
                      <div key={item.key} className="">
                        <div className="flex justify-between text-sm text-slate-600 mb-1"><span>{item.label}</span><span className="font-bold">{count}</span></div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden"><div className={`${item.color} h-2`} style={{width: `${pct}%`}}></div></div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tools Usage Tab */}
        <TabsContent value="tools" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Utilização de Ferramentas por Usuários</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-slate-700">Enfermeira Virtual</h4>
                    <Activity className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-3xl font-black text-blue-700">{analytics?.toolUsage?.nurse || 0}</div>
                  <div className="text-xs text-blue-600 mt-1">Total de conversas</div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-slate-700">Sites Criados</h4>
                    <Globe className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-3xl font-black text-purple-700">{analytics?.toolUsage?.sites || 0}</div>
                  <div className="text-xs text-purple-600 mt-1">Landing pages</div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-slate-700">Chatbots</h4>
                    <Bot className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-3xl font-black text-green-700">{analytics?.toolUsage?.chatbots || 0}</div>
                  <div className="text-xs text-green-600 mt-1">Assistentes ativos</div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-slate-700">Designs</h4>
                    <Palette className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="text-3xl font-black text-orange-700">{analytics?.toolUsage?.designs || 0}</div>
                  <div className="text-xs text-orange-600 mt-1">Projetos visuais</div>
                </div>

                <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-slate-700">Produtos</h4>
                    <BarChart2 className="w-6 h-6 text-pink-600" />
                  </div>
                  <div className="text-3xl font-black text-pink-700">{analytics?.toolUsage?.products || 0}</div>
                  <div className="text-xs text-pink-600 mt-1">Itens na loja</div>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-slate-700">Agendamentos</h4>
                    <Calendar className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="text-3xl font-black text-indigo-700">{analytics?.appointments?.length || 0}</div>
                  <div className="text-xs text-indigo-600 mt-1">Consultas marcadas</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="space-y-6">
          <PlatformSettingsCard />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Métricas de Tráfego</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                    <div>
                      <div className="text-sm text-green-700 font-bold">Tráfego Orgânico</div>
                      <div className="text-2xl font-black text-green-900">+15%</div>
                    </div>
                    <div className="text-xs text-green-600">Últimos 30 dias</div>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                    <div>
                      <div className="text-sm text-blue-700 font-bold">Visualizações Totais</div>
                      <div className="text-2xl font-black text-blue-900">{analytics?.banners?.reduce((acc, b) => acc + (b.views || 0), 0) || 0}</div>
                    </div>
                    <div className="text-xs text-blue-600">Banners</div>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                    <div>
                      <div className="text-sm text-purple-700 font-bold">Cliques Totais</div>
                      <div className="text-2xl font-black text-purple-900">{analytics?.banners?.reduce((acc, b) => acc + (b.clicks || 0), 0) || 0}</div>
                    </div>
                    <div className="text-xs text-purple-600">CTR: {analytics?.banners?.length ? ((analytics.banners.reduce((acc, b) => acc + (b.clicks || 0), 0) / analytics.banners.reduce((acc, b) => acc + (b.views || 0), 1)) * 100).toFixed(2) : 0}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <TrendsRealtime />
          </div>
        </TabsContent>

        {/* Page Blocks Tab */}
        <TabsContent value="page-blocks" className="space-y-6">
          <PageBlockManager />
        </TabsContent>

        {/* Banners Tab */}
        <TabsContent value="banners" className="space-y-6">
            <Card>
               <CardHeader><CardTitle>Gestão de Anúncios</CardTitle></CardHeader>
               <CardContent>
                  <BannerAdminList />
               </CardContent>
            </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
           <Card>
              <CardHeader>
                 <CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5 text-[#0D9488]" /> Criar Notificação para Usuários</CardTitle>
                 <CardDescription>Envie notificações segmentadas por tipo de usuário ou para todos.</CardDescription>
              </CardHeader>
              <CardContent className="max-w-2xl">
                 <NotificationSender />
              </CardContent>
           </Card>
        </TabsContent>

        {/* Service Requests Tab */}
        <TabsContent value="service-requests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ClipboardList className="w-5 h-5 text-[#D4A574]" /> Solicitações de Serviços</CardTitle>
              <CardDescription>Veja todos os tickets criados pelos usuários, filtre por status, tipo, white label, categoria e área de atuação.</CardDescription>
            </CardHeader>
            <CardContent>
              <ServiceRequestsAdmin />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Beauty Tea Tab */}
        <TabsContent value="beauty-tea">
          <BeautyTeaAdmin />
        </TabsContent>
      </Tabs>

      {/* User Details Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEditingUser(null)}>
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-emerald-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-bold shadow-lg">
                    {editingUser.user_email?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{editingUser.user_email}</h2>
                    <p className="text-teal-100 capitalize">{editingUser.type} • {editingUser.plan || 'Free'}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setEditingUser(null)} className="text-white hover:bg-white/20">
                  <X className="w-6 h-6" />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg mb-4 text-slate-800">Informações Pessoais</h3>
                  <div className="space-y-3 text-sm">
                    <div><span className="font-medium text-slate-600">CPF:</span> <span className="text-slate-900">{editingUser.cpf || 'N/A'}</span></div>
                    <div><span className="font-medium text-slate-600">Telefone:</span> <span className="text-slate-900">{editingUser.phone || 'N/A'}</span></div>
                    <div><span className="font-medium text-slate-600">Endereço:</span> <span className="text-slate-900">{editingUser.address?.street ? `${editingUser.address.street}, ${editingUser.address.number} - ${editingUser.address.city}/${editingUser.address.state}` : 'N/A'}</span></div>
                    <div><span className="font-medium text-slate-600">Beauty Coins:</span> <span className="text-amber-600 font-bold">{editingUser.beauty_coins || 0}</span></div>
                    <div><span className="font-medium text-slate-600">Pontos Clube:</span> <span className="text-purple-600 font-bold">{editingUser.club_points || 0}</span></div>
                  </div>
                </div>

                {editingUser.type === 'professional' && (
                  <div>
                    <h3 className="font-bold text-lg mb-4 text-slate-800">Informações Profissionais</h3>
                    <div className="space-y-3 text-sm">
                      <div><span className="font-medium text-slate-600">Registro:</span> <span className="text-slate-900">{editingUser.professional_registry || 'N/A'}</span></div>
                      <div><span className="font-medium text-slate-600">Especialidades:</span> <span className="text-slate-900">{editingUser.specialties?.join(', ') || 'N/A'}</span></div>
                      <div><span className="font-medium text-slate-600">Serviços:</span> <span className="text-slate-900">{editingUser.services_catalog?.length || 0} cadastrados</span></div>
                    </div>
                  </div>
                )}

                {editingUser.type === 'patient' && editingUser.medical_history && (
                  <div>
                    <h3 className="font-bold text-lg mb-4 text-slate-800">Ficha Médica</h3>
                    <div className="space-y-3 text-sm">
                      <div><span className="font-medium text-slate-600">Tipo Sanguíneo:</span> <span className="text-slate-900">{editingUser.medical_history.blood_type || 'N/A'}</span></div>
                      <div><span className="font-medium text-slate-600">Tipo de Pele:</span> <span className="text-slate-900">{editingUser.medical_history.skin_type || 'N/A'}</span></div>
                      <div><span className="font-medium text-slate-600">Alergias:</span> <span className="text-slate-900">{editingUser.medical_history.allergies?.join(', ') || 'Nenhuma'}</span></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button onClick={() => setEditingUser(null)} className="flex-1 bg-slate-100 text-slate-700 hover:bg-slate-200">
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}