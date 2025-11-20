import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users, LayoutDashboard, DollarSign, Activity, Shield, Trash2, 
  BarChart3, UserCheck, Building2, Loader2, Search, Bell, Send,
  User, Stethoscope, X, Globe, Bot, Palette, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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

  return (
     <Table>
        <TableHeader><TableRow><TableHead>Título</TableHead><TableHead>Dono</TableHead><TableHead>Posição</TableHead><TableHead>Público</TableHead><TableHead>Ações</TableHead></TableRow></TableHeader>
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
                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => { if(confirm('Excluir anúncio?')) deleteBannerMutation.mutate(b.id); }}>
                       <Trash2 className="w-4 h-4" />
                    </Button>
                 </TableCell>
              </TableRow>
           ))}
        </TableBody>
     </Table>
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <Shield className="w-8 h-8 text-indigo-600" /> Painel de Controle
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
             <BarChart3 className="w-4 h-4 mr-2" /> Gerar Relatório PDF
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 h-auto gap-2">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="tools">Ferramentas</TabsTrigger>
          <TabsTrigger value="seo">SEO & Tráfego</TabsTrigger>
          <TabsTrigger value="banners">Anúncios</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">Total de Usuários</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{allUsers?.length || 0}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">Agendamentos</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{analytics?.appointments?.length || 0}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">Interações IA</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{analytics?.nurse?.length || 0}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">Faturamento Total (Est.)</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold text-emerald-600">R$ {(analytics?.appointments?.length || 0) * 250},00</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">Preço Médio Produtos</CardTitle></CardHeader>
              <CardContent>
                 <div className="text-2xl font-bold text-blue-600">
                    R$ {analytics?.avgProductPrice?.toFixed(2) || '0.00'}
                 </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">Valuation Médio</CardTitle></CardHeader>
              <CardContent>
                 <div className="text-2xl font-bold text-purple-600">
                    R$ {analytics?.avgValuation?.toFixed(2) || '0.00'}
                 </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="p-6">
             <CardHeader><CardTitle>Relatório de SEO (Simulado)</CardTitle></CardHeader>
             <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-sm text-green-700 font-bold">Tráfego Orgânico</div>
                      <div className="text-2xl font-bold text-green-900">+15%</div>
                      <div className="text-xs text-green-600">Últimos 30 dias</div>
                   </div>
                   <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-sm text-blue-700 font-bold">Palavras-chave Top 3</div>
                      <div className="text-2xl font-bold text-blue-900">24</div>
                      <div className="text-xs text-blue-600">"clinica estetica", "dermatologista"</div>
                   </div>
                   <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="text-sm text-orange-700 font-bold">Backlinks Ativos</div>
                      <div className="text-2xl font-bold text-orange-900">142</div>
                      <div className="text-xs text-orange-600">Domínios de alta autoridade</div>
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
              <CardHeader><CardTitle>Páginas Mais Frequentadas</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { page: 'Dashboard', visits: 1250 },
                    { page: 'Agendamentos', visits: 980 },
                    { page: 'Enfermeira Virtual', visits: 756 },
                    { page: 'Chatbots', visits: 543 },
                    { page: 'Sites', visits: 421 }
                  ].map((item) => (
                    <div key={item.page} className="flex justify-between items-center p-2 hover:bg-slate-50 rounded">
                      <span className="font-medium">{item.page}</span>
                      <span className="text-sm font-bold text-blue-600">{item.visits} visitas</span>
                    </div>
                  ))}
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

            <Card>
              <CardHeader><CardTitle>Palavras-chave & SEO</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="font-bold text-slate-800 mb-1">Top 3 Keywords</div>
                    <div className="text-sm text-slate-600">• "clinica estetica"</div>
                    <div className="text-sm text-slate-600">• "dermatologista"</div>
                    <div className="text-sm text-slate-600">• "harmonização facial"</div>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <div className="font-bold text-orange-800 mb-1">Backlinks Ativos</div>
                    <div className="text-2xl font-black text-orange-900">142</div>
                    <div className="text-xs text-orange-600">Domínios de alta autoridade</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
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