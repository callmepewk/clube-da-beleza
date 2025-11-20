import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users, LayoutDashboard, DollarSign, Activity, Shield, Trash2, 
  BarChart3, UserCheck, Building2, Loader2, Search, Bell, Send
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
      // Mocking aggregate queries since backend aggregation isn't available in SDK directly
      const appts = await base44.entities.Appointment.list({ limit: 1000 });
      const nurseInts = await base44.entities.NurseInteraction.list({ limit: 1000 });
      const creations = await base44.entities.AICreation.list({ limit: 1000 });
      const products = await base44.entities.Product.list({ limit: 1000 });
      
      return {
        appointments: appts.data,
        nurse: nurseInts.data,
        creations: creations.data,
        products: products.data
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
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 h-auto gap-2">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="appointments">Agendamentos</TabsTrigger>
          <TabsTrigger value="nurse">Enfermeira</TabsTrigger>
          <TabsTrigger value="creations">IA & Produtos</TabsTrigger>
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
                    R$ {analytics?.products?.length ? (analytics.products.reduce((acc, p) => acc + (p.price || 0), 0) / analytics.products.length).toFixed(2) : '0.00'}
                 </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">Valuation Médio (Criações)</CardTitle></CardHeader>
              <CardContent>
                 <div className="text-2xl font-bold text-purple-600">
                    R$ {analytics?.creations?.length ? ((analytics.creations.length * 300) / analytics.creations.length).toFixed(2) : '0.00'}
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
                    <TableHead>Email</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers?.map(u => (
                    <TableRow key={u.id}>
                      <TableCell>{u.user_email}</TableCell>
                      <TableCell>
                        <Badge variant={u.type === 'professional' ? 'default' : u.type === 'sponsor' ? 'secondary' : 'outline'}>
                          {u.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize">{u.plan || 'Free'}</TableCell>
                      <TableCell>
                         {u.is_admin ? <Badge className="bg-purple-100 text-purple-800">Admin</Badge> : <span className="text-slate-500">Ativo</span>}
                         {u.plan === 'test_trial' && <Badge className="ml-2 bg-orange-100 text-orange-800">Teste 7 Dias</Badge>}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                           <Select onValueChange={(val) => updateUserMutation.mutate({ id: u.id, data: { plan: val } })}>
                             <SelectTrigger className="w-[100px] h-8"><SelectValue placeholder="Plano" /></SelectTrigger>
                             <SelectContent>
                               <SelectItem value="free">Free</SelectItem>
                               <SelectItem value="pro">Pro</SelectItem>
                               <SelectItem value="premium">Premium</SelectItem>
                               <SelectItem value="sponsor_gold">Sponsor Gold</SelectItem>
                             </SelectContent>
                           </Select>
                           
                           <Select onValueChange={(val) => grantTestAccessMutation.mutate({ id: u.id, type: val })}>
                             <SelectTrigger className="w-[30px] h-8 p-0 flex justify-center" title="Criar Conta Teste"><Loader2 className="w-4 h-4" /></SelectTrigger>
                             <SelectContent>
                               <SelectItem value="patient">Teste Paciente</SelectItem>
                               <SelectItem value="professional">Teste Profissional</SelectItem>
                               <SelectItem value="sponsor">Teste Patrocinador</SelectItem>
                             </SelectContent>
                           </Select>

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

        {/* Appointments Tab */}
        <TabsContent value="appointments" className="space-y-6">
           <Card>
             <CardHeader><CardTitle>Relatórios de Agendamento</CardTitle></CardHeader>
             <CardContent>
               <Table>
                 <TableHeader>
                   <TableRow><TableHead>Titulo</TableHead><TableHead>Tipo</TableHead><TableHead>Data</TableHead><TableHead>Profissional</TableHead></TableRow>
                 </TableHeader>
                 <TableBody>
                   {analytics?.appointments?.slice(0, 50).map(a => (
                     <TableRow key={a.id}>
                       <TableCell>{a.title}</TableCell>
                       <TableCell>{a.type}</TableCell>
                       <TableCell>{format(new Date(a.start_time), 'dd/MM/yyyy HH:mm')}</TableCell>
                       <TableCell>{a.professional_email}</TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             </CardContent>
           </Card>
        </TabsContent>
        
        {/* Nurse Analytics Tab */}
        <TabsContent value="nurse" className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                 <CardHeader><CardTitle>Tópicos Mais Buscados</CardTitle></CardHeader>
                 <CardContent>
                    {/* Mock aggregation display */}
                    <div className="space-y-2">
                       <div className="flex justify-between"><span className="font-medium">Exames</span><span>45%</span></div>
                       <div className="w-full bg-slate-100 h-2 rounded"><div className="bg-emerald-500 h-2 rounded w-[45%]"></div></div>
                       
                       <div className="flex justify-between"><span className="font-medium">Procedimentos</span><span>30%</span></div>
                       <div className="w-full bg-slate-100 h-2 rounded"><div className="bg-purple-500 h-2 rounded w-[30%]"></div></div>
                       
                       <div className="flex justify-between"><span className="font-medium">Medicamentos</span><span>25%</span></div>
                       <div className="w-full bg-slate-100 h-2 rounded"><div className="bg-blue-500 h-2 rounded w-[25%]"></div></div>
                    </div>
                 </CardContent>
              </Card>
              <Card>
                 <CardHeader><CardTitle>Interações Recentes</CardTitle></CardHeader>
                 <CardContent className="max-h-[300px] overflow-y-auto">
                    {analytics?.nurse?.map(n => (
                       <div key={n.id} className="mb-3 pb-3 border-b last:border-0 text-sm">
                          <div className="font-semibold">{n.user_name} ({n.topic})</div>
                          <div className="text-slate-500 italic">"{n.query}"</div>
                       </div>
                    ))}
                 </CardContent>
              </Card>
           </div>
        </TabsContent>

        {/* Banners Tab */}
        <TabsContent value="banners" className="space-y-6">
            <Card>
               <CardHeader><CardTitle>Gestão de Anúncios</CardTitle></CardHeader>
               <CardContent>
                  {/* Fetch banners inline for simplicity in admin view */}
                  <BannerAdminList />
               </CardContent>
            </Card>
        </TabsContent>

        {/* Creations Tab */}
        <TabsContent value="creations" className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                 <CardHeader><CardTitle>Sites & Chatbots Criados</CardTitle></CardHeader>
                 <CardContent>
                    <Table>
                       <TableHeader><TableRow><TableHead>Tipo</TableHead><TableHead>Título</TableHead><TableHead>Link</TableHead></TableRow></TableHeader>
                       <TableBody>
                          {analytics?.creations?.map(c => (
                             <TableRow key={c.id}>
                                <TableCell className="capitalize">{c.type}</TableCell>
                                <TableCell>{c.title}</TableCell>
                                <TableCell><a href="#" className="text-blue-600 hover:underline truncate block w-[150px]">Ver Link</a></TableCell>
                             </TableRow>
                          ))}
                       </TableBody>
                    </Table>
                 </CardContent>
              </Card>
              <Card>
                 <CardHeader><CardTitle>Produtos na Loja</CardTitle></CardHeader>
                 <CardContent>
                    <Table>
                       <TableHeader><TableRow><TableHead>Tipo</TableHead><TableHead>Preço</TableHead><TableHead>Dono</TableHead></TableRow></TableHeader>
                       <TableBody>
                          {analytics?.products?.map(p => (
                             <TableRow key={p.id}>
                                <TableCell className="capitalize">{p.type}</TableCell>
                                <TableCell>R$ {p.price}</TableCell>
                                <TableCell className="truncate max-w-[100px]">{p.owner_email}</TableCell>
                             </TableRow>
                          ))}
                       </TableBody>
                    </Table>
                 </CardContent>
              </Card>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}