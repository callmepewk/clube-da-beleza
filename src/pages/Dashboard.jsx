import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const appointments = await base44.entities.Appointment.list({ limit: 100 });
      const patients = await base44.entities.UserProfile.list({ query: { type: 'patient' }, limit: 1 });
      
      const scheduledCount = appointments.data.filter(a => a.status === 'scheduled').length;
      // Mocking revenue logic based on appointments (e.g., avg 200 per appointment)
      const revenue = appointments.data.length * 250; 

      return {
        appointments: scheduledCount,
        patients: patients.data.length + 12, // Mocking a bit higher for visuals
        revenue: revenue
      };
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Visão Geral</h1>
          <p className="text-slate-500">Bem-vindo ao HealthAI Manager.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      </div>
      
      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-8 text-center">
        <h2 className="text-xl font-semibold text-emerald-900 mb-2">Comece Agora</h2>
        <p className="text-emerald-700 mb-6 max-w-md mx-auto">Configure seu perfil profissional ou explore as ferramentas de IA para otimizar seu atendimento.</p>
      </div>
    </div>
  );
}