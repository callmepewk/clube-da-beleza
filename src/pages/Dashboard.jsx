import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Search, Users, DollarSign, Activity, Microscope, Stethoscope } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BannerManager from "@/components/banners/BannerManager";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('all');

  useEffect(() => {
    const loadUser = async () => {
      const u = await base44.auth.me();
      if (u) {
        const profiles = await base44.entities.UserProfile.list({ query: { user_email: u.email } });
        setUser({ ...u, profile: profiles?.data?.[0] });
      }
    };
    loadUser();
  }, []);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboardStats', user?.profile?.type],
    queryFn: async () => {
      if (!user?.profile) return null;

      // Patient View Stats (Avg Costs)
      if (user.profile.type === 'patient') {
        // Mocking average market data for the patient
        return {
          avgProcedure: 1200,
          avgExam: 350,
          avgConsultation: 250
        };
      }

      // Professional/Admin View Stats
      const appointments = await base44.entities.Appointment.list({ limit: 100 });
      const patients = await base44.entities.UserProfile.list({ query: { type: 'patient' }, limit: 1 });
      
      const scheduledCount = appointments.data.filter(a => a.status === 'scheduled').length;
      const revenue = appointments.data.length * 250; 

      return {
        appointments: scheduledCount,
        patients: patients.data.length + 12,
        revenue: revenue
      };
    },
    enabled: !!user
  });

  // Search Functionality (Mocked for visual)
  const handleSearch = (e) => {
    e.preventDefault();
    // In a real implementation, this would trigger a specific query
    alert(`Pesquisando por "${searchQuery}" em "${searchCategory}"`);
  };

  if (!user) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

  const isPatient = user.profile?.type === 'patient';

  const isSponsor = user.profile?.type === 'sponsor';
  const isProfessionalOrAdmin = user.profile?.type === 'professional' || user.profile?.is_admin;

  // --- PATIENT VIEW ---
  if (isPatient) {
    return (
      <div className="space-y-8 pb-10">
        <div className="relative h-64 rounded-3xl overflow-hidden shadow-xl mb-8 group">
          <img 
            src="https://images.unsplash.com/photo-1501854140884-074cf2b2b3e9?q=80&w=2000&auto=format&fit=crop" 
            alt="Nature" 
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/80 to-transparent flex flex-col justify-center px-10 text-white">
            <h1 className="text-4xl font-bold mb-2">Olá, {user.full_name.split(' ')[0]}</h1>
            <p className="text-emerald-100 text-lg max-w-lg">Sua saúde é nossa prioridade. Explore ferramentas exclusivas para seu bem-estar.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {/* Next Appointment */}
           <Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-all cursor-pointer bg-white/90 backdrop-blur">
              <CardContent className="p-6">
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-700">Próxima Consulta</h3>
                    <Calendar className="w-5 h-5 text-blue-500" />
                 </div>
                 <p className="text-2xl font-bold text-slate-900 mb-1">14 de Out</p>
                 <p className="text-sm text-slate-500">15:30 • Dr. Silva (Dermatologista)</p>
              </CardContent>
           </Card>
           
           {/* Investment */}
           <Card className="border-l-4 border-l-emerald-500 shadow-md hover:shadow-lg transition-all cursor-pointer bg-white/90 backdrop-blur">
              <CardContent className="p-6">
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-700">Investimento em Saúde</h3>
                    <DollarSign className="w-5 h-5 text-emerald-500" />
                 </div>
                 <p className="text-2xl font-bold text-emerald-600 mb-1">R$ {stats?.avgProcedure || 1250},00</p>
                 <p className="text-sm text-slate-500">Economia estimada de 15%</p>
              </CardContent>
           </Card>

           {/* Quick Stats */}
           <Card className="border-l-4 border-l-purple-500 shadow-md hover:shadow-lg transition-all cursor-pointer bg-white/90 backdrop-blur">
              <CardContent className="p-6">
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-700">Minhas Atividades</h3>
                    <Activity className="w-5 h-5 text-purple-500" />
                 </div>
                 <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1"><Stethoscope className="w-3 h-3" /> <span>12 Pesquisas</span></div>
                    <div className="flex items-center gap-1"><Bot className="w-3 h-3" /> <span>3 Chatbots</span></div>
                    <div className="flex items-center gap-1"><Globe className="w-3 h-3" /> <span>1 Site</span></div>
                    <div className="flex items-center gap-1"><Palette className="w-3 h-3" /> <span>4 Designs</span></div>
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-4">O que você procura hoje?</h2>
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
               <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
               <Input 
                 placeholder="Buscar médicos, exames, procedimentos..." 
                 className="pl-10 h-12 text-lg"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
            </div>
            <Button type="submit" className="h-12 px-8 bg-emerald-600 hover:bg-emerald-700 text-lg font-medium">
              Buscar
            </Button>
          </form>
        </div>

        {/* Inspiring Images Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <img src="https://images.unsplash.com/photo-1544367563-12123d895e29?w=500&auto=format&fit=crop&q=60" className="rounded-xl h-48 w-full object-cover shadow-md hover:scale-105 transition-transform duration-500" alt="Wellness" />
           <img src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&auto=format&fit=crop&q=60" className="rounded-xl h-48 w-full object-cover shadow-md hover:scale-105 transition-transform duration-500" alt="Fitness" />
           <img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=60" className="rounded-xl h-48 w-full object-cover shadow-md hover:scale-105 transition-transform duration-500" alt="Healthy Food" />
           <img src="https://images.unsplash.com/photo-1535914254981-b5012eebbd15?w=500&auto=format&fit=crop&q=60" className="rounded-xl h-48 w-full object-cover shadow-md hover:scale-105 transition-transform duration-500" alt="Meditation" />
        </div>
      </div>
    );
  }

  // --- SPONSOR VIEW ---
  if (isSponsor) {
    // We reuse BannerManager but wrap it in a nice dashboard
    return (
      <div className="space-y-8">
         <div className="flex items-center justify-between">
            <div>
               <h1 className="text-3xl font-bold text-slate-900">Painel do Patrocinador</h1>
               <p className="text-slate-500">Gerencie suas campanhas e acompanhe o desempenho.</p>
            </div>
            <Button className="bg-indigo-600 hover:bg-indigo-700"><Activity className="mr-2 w-4 h-4" /> Relatório Completo</Button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white shadow-sm border-slate-200">
               <CardContent className="p-6">
                  <p className="text-sm text-slate-500 font-medium uppercase">Visualizações Totais</p>
                  <p className="text-3xl font-bold text-indigo-600 mt-2">12,450</p>
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">▲ 12% este mês</p>
               </CardContent>
            </Card>
            <Card className="bg-white shadow-sm border-slate-200">
               <CardContent className="p-6">
                  <p className="text-sm text-slate-500 font-medium uppercase">Cliques Totais</p>
                  <p className="text-3xl font-bold text-indigo-600 mt-2">843</p>
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">▲ 5% este mês</p>
               </CardContent>
            </Card>
            <Card className="bg-white shadow-sm border-slate-200">
               <CardContent className="p-6">
                  <p className="text-sm text-slate-500 font-medium uppercase">Banners Ativos</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">3</p>
                  <p className="text-xs text-slate-400 mt-1">De 5 permitidos no plano</p>
               </CardContent>
            </Card>
         </div>

         <BannerManager />
      </div>
    );
  }

  // --- PROFESSIONAL & ADMIN VIEW (Original Layout mostly) ---
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Painel Profissional</h1>
          <p className="text-slate-500">Gerencie sua prática e acompanhe resultados.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Próximas Consultas</h3>
          <p className="text-3xl font-bold text-slate-900 mt-2 flex items-center gap-2">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : stats?.appointments || 14}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Pacientes Ativos</h3>
            <p className="text-3xl font-bold text-slate-900 mt-2 flex items-center gap-2">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : stats?.patients || 142}
            </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Receita Estimada</h3>
            <p className="text-3xl font-bold text-emerald-600 mt-2 flex items-center gap-2">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : `R$ ${stats?.revenue?.toFixed(2) || '3.500,00'}`}
            </p>
        </div>
      </div>

      {user?.profile?.is_admin && (
         <div className="mb-8 bg-slate-100 p-6 rounded-lg border border-slate-200">
            <h3 className="font-bold mb-4 text-slate-700">Admin: Gerenciador de Banners Global</h3>
            <BannerManager />
         </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Busca Rápida no Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <Select value={searchCategory} onValueChange={setSearchCategory}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                <SelectItem value="procedures">Procedimentos</SelectItem>
                <SelectItem value="exams">Exames</SelectItem>
                <SelectItem value="professionals">Profissionais</SelectItem>
              </SelectContent>
            </Select>
            <Input 
              placeholder="Pesquise por nome, CPF ou procedimento..." 
              className="flex-1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
              <Search className="w-4 h-4 mr-2" /> Pesquisar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}