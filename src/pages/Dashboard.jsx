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

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Visão Geral</h1>
          <p className="text-slate-500">
            {isPatient 
              ? 'Encontre procedimentos, exames e profissionais.' 
              : 'Gerencie sua prática e acompanhe resultados.'}
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isPatient ? (
          <>
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-2">
                   <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Activity className="w-5 h-5" /></div>
                   <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Média Procedimentos</h3>
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : `R$ ${stats?.avgProcedure},00`}
                </p>
             </div>
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-2">
                   <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Microscope className="w-5 h-5" /></div>
                   <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Média Exames</h3>
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : `R$ ${stats?.avgExam},00`}
                </p>
             </div>
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-2">
                   <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><Stethoscope className="w-5 h-5" /></div>
                   <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Média Consultas</h3>
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : `R$ ${stats?.avgConsultation},00`}
                </p>
             </div>
          </>
        ) : (
          <>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Próximas Consultas</h3>
              <p className="text-3xl font-bold text-slate-900 mt-2 flex items-center gap-2">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : stats?.appointments || 0}
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
               <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Pacientes Ativos</h3>
               <p className="text-3xl font-bold text-slate-900 mt-2 flex items-center gap-2">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : stats?.patients || 0}
               </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
               <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Receita Estimada</h3>
               <p className="text-3xl font-bold text-emerald-600 mt-2 flex items-center gap-2">
                 {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : `R$ ${stats?.revenue?.toFixed(2) || '0,00'}`}
               </p>
            </div>
          </>
        )}
      </div>

      {/* Sponsor/Admin Banner Manager */}
      {(user?.profile?.type === 'sponsor' || user?.profile?.is_admin) && (
         <div className="mb-8">
            <BannerManager />
         </div>
      )}

      {/* Search Section for Everyone */}
      <Card>
        <CardHeader>
          <CardTitle>Busca Rápida</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <Select value={searchCategory} onValueChange={setSearchCategory}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                <SelectItem value="procedures">Procedimentos Estéticos</SelectItem>
                <SelectItem value="exams">Exames</SelectItem>
                <SelectItem value="professionals">Profissionais</SelectItem>
              </SelectContent>
            </Select>
            <Input 
              placeholder="Pesquise por nome do profissional, procedimento ou exame..." 
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
      
      {!isPatient && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-8 text-center">
          <h2 className="text-xl font-semibold text-emerald-900 mb-2">Comece Agora</h2>
          <p className="text-emerald-700 mb-6 max-w-md mx-auto">Configure seu perfil profissional ou explore as ferramentas de IA para otimizar seu atendimento.</p>
        </div>
      )}
    </div>
  );
}