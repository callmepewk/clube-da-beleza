import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Search, Users, DollarSign, Activity, Microscope, Stethoscope, Globe, Palette, Bot, BarChart2 } from 'lucide-react';
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
      <div className="space-y-8 pb-10 text-white">
        {/* Hero Section - Gradient Background */}
        <div className="relative h-72 rounded-xl overflow-hidden shadow-2xl group bg-gradient-to-br from-purple-900 via-indigo-900 to-black border border-white/5">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop')] opacity-20 mix-blend-overlay bg-cover bg-center"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent"></div>
          <div className="relative z-10 flex flex-col justify-end h-full p-8">
             <div className="flex items-end gap-4 mb-2">
                <h1 className="text-5xl font-bold tracking-tight text-white drop-shadow-lg">Olá, {user.full_name.split(' ')[0]}</h1>
             </div>
             <p className="text-[#B3B3B3] text-lg max-w-xl font-medium">Sua jornada de saúde, reimaginada com inteligência artificial.</p>
          </div>
        </div>

        {/* Action Cards - Spotify Style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           {/* Next Appointment */}
           <div className="bg-[#181818] hover:bg-[#282828] transition-all duration-300 rounded-lg p-4 cursor-pointer group border border-transparent hover:border-[#ffffff10] flex items-center gap-4">
               <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-md shadow-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Calendar className="text-white w-8 h-8" />
               </div>
               <div>
                  <h3 className="font-bold text-white text-base group-hover:text-blue-400 transition-colors">Próxima Consulta</h3>
                  <p className="text-[#B3B3B3] text-sm">14 Out • 15:30</p>
               </div>
           </div>
           
           {/* Investment */}
           <div className="bg-[#181818] hover:bg-[#282828] transition-all duration-300 rounded-lg p-4 cursor-pointer group border border-transparent hover:border-[#ffffff10] flex items-center gap-4">
               <div className="h-16 w-16 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-md shadow-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                  <DollarSign className="text-white w-8 h-8" />
               </div>
               <div>
                  <h3 className="font-bold text-white text-base group-hover:text-emerald-400 transition-colors">Investimento</h3>
                  <p className="text-[#B3B3B3] text-sm">R$ {stats?.avgProcedure || 1250},00 (Economia)</p>
               </div>
           </div>

           {/* Quick Stats */}
           <div className="bg-[#181818] hover:bg-[#282828] transition-all duration-300 rounded-lg p-4 cursor-pointer group border border-transparent hover:border-[#ffffff10] flex items-center gap-4">
               <div className="h-16 w-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-md shadow-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Activity className="text-white w-8 h-8" />
               </div>
               <div>
                  <h3 className="font-bold text-white text-base group-hover:text-purple-400 transition-colors">Atividades</h3>
                  <p className="text-[#B3B3B3] text-sm">12 Pesquisas • 3 Bots</p>
               </div>
           </div>
        </div>

        {/* Search Bar - Modern */}
        <div className="bg-gradient-to-b from-[#222222] to-[#181818] p-8 rounded-xl shadow-xl border border-[#333]">
          <h2 className="text-2xl font-bold text-white mb-6">O que você procura hoje?</h2>
          <form onSubmit={handleSearch} className="relative">
             <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#B3B3B3]" />
             <Input 
               placeholder="Buscar médicos, exames, procedimentos..." 
               className="pl-12 h-14 text-lg bg-[#121212] border-none text-white rounded-full focus:ring-2 focus:ring-white/20 placeholder:text-[#555]"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
             <Button type="submit" className="absolute right-2 top-2 h-10 px-6 bg-white text-black hover:bg-gray-200 rounded-full font-bold text-sm transition-transform active:scale-95">
               Buscar
             </Button>
          </form>
        </div>

        {/* Categories / Inspiration */}
        <div>
            <h2 className="text-2xl font-bold text-white mb-4 hover:underline cursor-pointer decoration-white">Navegar por categorias</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
               {[
                  { title: "Bem-estar", img: "https://images.unsplash.com/photo-1544367563-12123d895e29?w=500&q=60", color: "bg-orange-600" },
                  { title: "Fitness", img: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&q=60", color: "bg-blue-600" },
                  { title: "Nutrição", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=60", color: "bg-green-600" },
                  { title: "Mente", img: "https://images.unsplash.com/photo-1535914254981-b5012eebbd15?w=500&q=60", color: "bg-purple-600" }
               ].map((cat, i) => (
                  <div key={i} className="relative h-48 rounded-lg overflow-hidden cursor-pointer group transition-all duration-300 hover:bg-[#282828] bg-[#181818]">
                     <div className={`absolute top-4 left-4 text-2xl font-bold text-white z-10`}>{cat.title}</div>
                     <img src={cat.img} className="absolute -right-4 -bottom-4 w-32 h-32 rounded shadow-2xl transform rotate-[25deg] group-hover:rotate-[15deg] group-hover:scale-110 transition-all duration-500 object-cover" alt={cat.title} />
                  </div>
               ))}
            </div>
        </div>
      </div>
    );
  }

  // --- SPONSOR VIEW ---
  if (isSponsor) {
    return (
      <div className="space-y-8">
         <div className="flex items-center justify-between">
            <div>
               <h1 className="text-3xl font-bold text-slate-900">Painel do Patrocinador</h1>
               <p className="text-slate-500">Gerencie suas campanhas e acompanhe o desempenho.</p>
            </div>
            <Button className="bg-indigo-600 hover:bg-indigo-700"><BarChart2 className="mr-2 w-4 h-4" /> Relatório Completo</Button>
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

  // --- PROFESSIONAL & ADMIN VIEW (Dark Mode) ---
  return (
    <div className="space-y-8 text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Painel Profissional</h1>
          <p className="text-[#B3B3B3] mt-1">Gerencie sua prática e acompanhe resultados com precisão.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#181818] p-6 rounded-xl shadow-lg border border-[#282828] hover:bg-[#282828] transition-colors group">
          <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-[#B3B3B3] uppercase tracking-wider">Próximas Consultas</h3>
              <Calendar className="w-5 h-5 text-purple-500 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-4xl font-bold text-white mt-2 flex items-center gap-2">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-purple-500" /> : stats?.appointments || 14}
          </p>
          <p className="text-xs text-green-500 mt-2 font-medium">▲ 12% esta semana</p>
        </div>
        
        <div className="bg-[#181818] p-6 rounded-xl shadow-lg border border-[#282828] hover:bg-[#282828] transition-colors group">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-[#B3B3B3] uppercase tracking-wider">Pacientes Ativos</h3>
              <Users className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-4xl font-bold text-white mt-2 flex items-center gap-2">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-blue-500" /> : stats?.patients || 142}
            </p>
            <p className="text-xs text-green-500 mt-2 font-medium">▲ 5 novos hoje</p>
        </div>

        <div className="bg-[#181818] p-6 rounded-xl shadow-lg border border-[#282828] hover:bg-[#282828] transition-colors group">
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-xs font-bold text-[#B3B3B3] uppercase tracking-wider">Receita Estimada</h3>
               <DollarSign className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-4xl font-bold text-white mt-2 flex items-center gap-2">
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-emerald-500" /> : `R$ ${stats?.revenue?.toFixed(2) || '3.500,00'}`}
            </p>
             <p className="text-xs text-[#B3B3B3] mt-2">Baseado nos agendamentos</p>
        </div>
      </div>

      {/* Banner Manager Section */}
      <div className="mb-8 bg-gradient-to-r from-[#181818] to-[#121212] p-8 rounded-xl border border-[#282828] mt-8 shadow-2xl">
         <div className="flex items-center gap-3 mb-6">
            <div className="bg-purple-600 p-2 rounded-lg"><Palette className="w-5 h-5 text-white" /></div>
            <div>
               <h3 className="font-bold text-xl text-white">Gerenciador de Anúncios</h3>
               <p className="text-sm text-[#B3B3B3]">Crie campanhas visuais de alto impacto.</p>
            </div>
         </div>
         <BannerManager />
      </div>

      {/* Search Section */}
      <div className="bg-[#181818] rounded-xl border border-[#282828] p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Busca Rápida</h2>
        </div>
        <div className="w-full">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <Select value={searchCategory} onValueChange={setSearchCategory}>
              <SelectTrigger className="w-full md:w-[200px] bg-[#282828] border-none text-white h-12">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent className="bg-[#282828] border-[#3E3E3E] text-white">
                <SelectItem value="all">Todas as Categorias</SelectItem>
                <SelectItem value="procedures">Procedimentos</SelectItem>
                <SelectItem value="exams">Exames</SelectItem>
                <SelectItem value="professionals">Profissionais</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex-1 relative">
               <Input 
                 placeholder="Pesquise por nome, CPF ou procedimento..." 
                 className="w-full bg-[#282828] border-none text-white h-12 pl-4 rounded-lg focus:ring-2 focus:ring-white/20"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
            </div>
            <Button type="submit" className="bg-white text-black hover:bg-gray-200 h-12 px-8 font-bold rounded-lg">
              <Search className="w-4 h-4 mr-2" /> Pesquisar
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}