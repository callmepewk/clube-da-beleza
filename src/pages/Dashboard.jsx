import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Search, Users, DollarSign, Activity, Microscope, Stethoscope, Globe, Palette, Bot, BarChart2, Calendar, Sparkles, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BannerManager from "@/components/banners/BannerManager";

const PatientNewsFeed = () => {
   const { data: news, isLoading } = useQuery({
      queryKey: ['patientNews'],
      queryFn: async () => {
         const res = await base44.integrations.Core.InvokeLLM({
            prompt: "Gere 4 notícias recentes e interessantes sobre saúde, estética, beleza e moda. Retorne JSON array com 'title', 'category', 'image_keyword' e 'summary'.",
            add_context_from_internet: true,
            response_json_schema: {
               type: "object",
               properties: {
                  news: { type: "array", items: { type: "object", properties: { title: {type:"string"}, category: {type:"string"}, image_keyword: {type:"string"}, summary: {type:"string"} } } }
               }
            }
         });
         return res.news || [];
      },
      staleTime: 1000 * 60 * 60 * 24 // 24h cache
   });

   if (isLoading) return <div className="flex gap-4"><Loader2 className="animate-spin" /> Carregando notícias...</div>;

   return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {news?.map((item, idx) => (
            <div key={idx} className="bg-white rounded-2xl overflow-hidden shadow-md border border-slate-100 hover:shadow-xl transition-all flex flex-col md:flex-row">
               <div className="h-48 md:h-auto md:w-1/3 bg-slate-100 relative overflow-hidden">
                  <img 
                     src={`https://source.unsplash.com/400x300/?${item.image_keyword || 'health'}`} 
                     className="w-full h-full object-cover absolute inset-0" 
                     alt={item.title}
                  />
                  <div className="absolute top-2 left-2 bg-white/90 px-2 py-1 rounded text-xs font-bold uppercase text-slate-800">
                     {item.category}
                  </div>
               </div>
               <div className="p-6 md:w-2/3">
                  <h3 className="font-bold text-lg text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-500 text-sm line-clamp-3">{item.summary}</p>
               </div>
            </div>
         ))}
      </div>
   );
};

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
      const appointments = await base44.entities.Appointment.list({ limit: 1000 });
      
      // Real Active Patients Logic
      // Fetch all patients
      const allPatients = await base44.entities.UserProfile.list({ query: { type: 'patient' }, limit: 1000 });
      
      // Filter for active in last 30 minutes
      const now = new Date();
      const activeThreshold = new Date(now.getTime() - 30 * 60 * 1000); // 30 mins ago
      
      const activePatientsList = allPatients.data.filter(p => {
         if (!p.last_active_at) return false;
         return new Date(p.last_active_at) > activeThreshold;
      });

      const scheduledCount = appointments.data.filter(a => a.status === 'scheduled').length;
      
      // Real Revenue Calculation (sum of costs)
      const revenue = appointments.data.reduce((acc, curr) => acc + (curr.cost || 0), 0);

      return {
        appointments: scheduledCount,
        patients: activePatientsList.length,
        activePatientsDetails: activePatientsList,
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

  // Guest View (Non-logged in)
  if (!user) {
     return (
        <div className="space-y-8 pb-10">
           <div className="relative h-96 rounded-[2rem] overflow-hidden shadow-2xl group bg-[#FEFBF7] border border-[#D4A574]/20">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1616391182219-e080b4d1043a?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-[0.08]"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-[#FEFBF7] via-[#FEFBF7]/90 to-[#FEFBF7]/20"></div>
              <div className="relative z-10 flex items-center justify-between h-full p-12">
                 <div className="max-w-xl">
                    <h1 className="text-5xl font-light tracking-tight text-[#2D2416] mb-6 leading-tight">Bem-vindo ao <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4A574] to-[#B8935C] font-normal">Clube da Beleza</span></h1>
                    <p className="text-[#6B5D4F] text-xl font-light leading-relaxed mb-8">Sua plataforma completa de saúde, estética e bem-estar.</p>
                    <div className="flex flex-col sm:flex-row gap-4">
                       <Button onClick={() => base44.auth.redirectToLogin()} className="bg-[#D4A574] hover:bg-[#C49565] text-white px-8 py-4 rounded-2xl text-lg font-light shadow-lg">Entrar / Cadastrar</Button>
                       <Button 
                          onClick={() => window.open('https://mapa-da-estetica.base44.app', '_blank')}
                          variant="outline"
                          className="border-2 border-[#D4A574]/40 text-[#B8935C] hover:bg-[#FFF9F0] px-8 py-4 rounded-2xl text-lg font-light"
                       >
                          Já uso o Mapa da Estética
                       </Button>
                    </div>
                 </div>
                 <div className="hidden lg:block">
                    <img 
                       src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691e6fc102be2b10ba4e6392/aee9cf465_clubeimg.jpeg" 
                       alt="Clube da Beleza"
                       className="h-64 w-64 object-contain opacity-90"
                    />
                 </div>
              </div>
           </div>

           {/* Features Section - Same for all users */}
           <div className="space-y-12 mb-16">
             {/* Tecnologia Humanizada */}
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-[#FEFBF7] rounded-3xl overflow-hidden border border-[#D4A574]/20 shadow-lg">
               <div className="p-12">
                 <div className="inline-block bg-[#E8E05C] text-[#2D2416] px-6 py-2 rounded-full font-light text-sm mb-6 uppercase tracking-wider">
                   Tecnologia Humanizada
                 </div>
                 <h3 className="text-3xl font-light text-[#2D2416] mb-4">A Rede Credenciada</h3>
                 <p className="text-[#6B5D4F] font-light leading-relaxed">
                   Clubdabeleza.com usa o melhor da transformação digital para o benefício das boas práticas na estética brasileira. O Clubdabeleza.com por essa razão tem uma plataforma digital que irá impulsionar seu consultório, clínica ou negócio sem você se distanciar de cada paciente.
                 </p>
               </div>
               <div className="relative h-96 lg:h-full">
                 <img 
                   src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=800&auto=format&fit=crop" 
                   alt="Tecnologia em Estética"
                   className="w-full h-full object-cover"
                 />
                 <div className="absolute inset-0 bg-gradient-to-r from-[#FEFBF7] to-transparent"></div>
               </div>
             </div>

             {/* Compromisso */}
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-[#FEFBF7] rounded-3xl overflow-hidden border border-[#D4A574]/20 shadow-lg">
               <div className="relative h-96 lg:h-full order-2 lg:order-1">
                 <img 
                   src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop" 
                   alt="Profissionais Premium"
                   className="w-full h-full object-cover"
                 />
                 <div className="absolute inset-0 bg-gradient-to-l from-[#FEFBF7] to-transparent"></div>
               </div>
               <div className="p-12 order-1 lg:order-2">
                 <div className="inline-block bg-[#E8E05C] text-[#2D2416] px-6 py-2 rounded-full font-light text-sm mb-6 uppercase tracking-wider">
                   + Compromisso
                 </div>
                 <h3 className="text-3xl font-light text-[#2D2416] mb-4">O Selo PREMIUM</h3>
                 <p className="text-[#6B5D4F] font-light leading-relaxed mb-4">
                   O SELO PREMIUM do Clubdabeleza.com tem como missão destacar os especialistas quem melhor atendem. Somente especialista talentosos verificados e aplicados a submissão do SELO PREMIUM podem fazer parte.
                 </p>
                 <p className="text-[#6B5D4F] font-light leading-relaxed">
                   Aqui segurança e eficácia é básico. Solicite mais informações de como ter o SELO PREMIUM Clubdabeleza.com na sua Clínica ou consultório.
                 </p>
               </div>
             </div>

             {/* Mais Pacientes */}
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-[#FEFBF7] rounded-3xl overflow-hidden border border-[#D4A574]/20 shadow-lg">
               <div className="p-12">
                 <div className="inline-block bg-[#E8E05C] text-[#2D2416] px-6 py-2 rounded-full font-light text-sm mb-6 uppercase tracking-wider">
                   + Pacientes
                 </div>
                 <h3 className="text-3xl font-light text-[#2D2416] mb-4">Gerador de Ordem de Serviços</h3>
                 <p className="text-[#6B5D4F] font-light leading-relaxed">
                   Gostaria de ter mais pacientes? Está procurando aumentar o número de procedimentos que realiza? O SELO EXCELÊNCIA do Clubdabeleza.com oferece para seu consultório o gerador de ordem de serviços. Uma ferramenta que aproxima pacientes qualificados. Destaque seus serviços e leva até você mais pedidos.
                 </p>
               </div>
               <div className="relative h-96 lg:h-full">
                 <img 
                   src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=800&auto=format&fit=crop" 
                   alt="Mais Pacientes"
                   className="w-full h-full object-cover"
                 />
                 <div className="absolute inset-0 bg-gradient-to-r from-[#FEFBF7] to-transparent"></div>
               </div>
             </div>

             {/* Fidelize */}
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-[#FEFBF7] rounded-3xl overflow-hidden border border-[#D4A574]/20 shadow-lg">
               <div className="relative h-96 lg:h-full order-2 lg:order-1">
                 <img 
                   src="https://images.unsplash.com/photo-1551836022-4c4c79ecde51?q=80&w=800&auto=format&fit=crop" 
                   alt="Fidelização"
                   className="w-full h-full object-cover"
                 />
                 <div className="absolute inset-0 bg-gradient-to-l from-[#FEFBF7] to-transparent"></div>
               </div>
               <div className="p-12 order-1 lg:order-2">
                 <div className="inline-block bg-[#E8E05C] text-[#2D2416] px-6 py-2 rounded-full font-light text-sm mb-6 uppercase tracking-wider">
                   Fidelize +
                 </div>
                 <h3 className="text-3xl font-light text-[#2D2416] mb-4">O Selo Clube+</h3>
                 <p className="text-[#6B5D4F] font-light leading-relaxed">
                   Mantenha seus pacientes mais perto de você. O Selo Clube+ Clubdabeleza.com facilita em tudo o controle de seus pacientes mais fiéis e aproxima os pacientes novos em 98%.
                 </p>
               </div>
             </div>
           </div>

           <div className="space-y-6">
              <h2 className="text-2xl font-light text-[#2D2416] flex items-center gap-4">
                 <div className="w-2 h-8 bg-[#D4A574] rounded-full"></div>
                 Últimas Notícias & Tendências
              </h2>
              <PatientNewsFeed />
           </div>
        </div>
     );
  }

  const isPatient = user.profile?.type === 'patient';

  const isSponsor = user.profile?.type === 'sponsor';
  const isProfessionalOrAdmin = user.profile?.type === 'professional' || user.profile?.is_admin;

  // --- PATIENT VIEW (Premium Medical Aesthetic) ---
  if (isPatient) {
    return (
      <div className="space-y-8 pb-10">
        {/* Hero Section - DermaTech Vivid Aesthetic */}
        <div className="relative h-80 rounded-[2rem] overflow-hidden shadow-2xl group bg-white border border-slate-100">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1616391182219-e080b4d1043a?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-[0.1]"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/20"></div>
          <div className="relative z-10 flex flex-col justify-center h-full p-12 max-w-2xl">
             <h1 className="text-5xl font-extrabold tracking-tight text-[#0F172A] mb-6 leading-tight">Olá, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0D9488] to-[#2DD4BF]">{user.full_name.split(' ')[0]}</span></h1>
             <p className="text-[#475569] text-xl font-medium leading-relaxed">Sua jornada de estética avançada e tecnologia de ponta.</p>
          </div>
        </div>

        {/* Action Cards - High Contrast & Rounded */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {/* Next Appointment */}
           <div className="bg-[#FEFBF7] hover:shadow-[0_20px_40px_-12px_rgba(212,165,116,0.2)] hover:-translate-y-1 transition-all duration-300 rounded-[1.5rem] p-8 cursor-pointer group border border-[#D4A574]/20 flex items-center gap-6">
               <div className="h-16 w-16 bg-[#FFF9F0] rounded-2xl flex items-center justify-center group-hover:bg-[#D4A574] transition-colors duration-300">
                  <Calendar className="text-[#D4A574] w-8 h-8 group-hover:text-white transition-colors" />
               </div>
               <div>
                  <h3 className="font-light text-[#2D2416] text-xl group-hover:text-[#D4A574] transition-colors">Próxima Consulta</h3>
                  <p className="text-[#6B5D4F] text-sm font-light mt-1">14 Out • 15:30</p>
               </div>
           </div>

           {/* Investment */}
           <div className="bg-[#FEFBF7] hover:shadow-[0_20px_40px_-12px_rgba(212,165,116,0.2)] hover:-translate-y-1 transition-all duration-300 rounded-[1.5rem] p-8 cursor-pointer group border border-[#D4A574]/20 flex items-center gap-6">
               <div className="h-16 w-16 bg-[#FFF9F0] rounded-2xl flex items-center justify-center group-hover:bg-[#B8935C] transition-colors duration-300">
                  <DollarSign className="text-[#B8935C] w-8 h-8 group-hover:text-white transition-colors" />
               </div>
               <div>
                  <h3 className="font-light text-[#2D2416] text-xl group-hover:text-[#B8935C] transition-colors">Investimento</h3>
                  <p className="text-[#6B5D4F] text-sm font-light mt-1">R$ {stats?.avgProcedure || 1250},00</p>
               </div>
           </div>

           {/* Quick Stats */}
           <div className="bg-[#FEFBF7] hover:shadow-[0_20px_40px_-12px_rgba(212,165,116,0.2)] hover:-translate-y-1 transition-all duration-300 rounded-[1.5rem] p-8 cursor-pointer group border border-[#D4A574]/20 flex items-center gap-6">
               <div className="h-16 w-16 bg-[#FFF9F0] rounded-2xl flex items-center justify-center group-hover:bg-[#C9A868] transition-colors duration-300">
                  <Sparkles className="text-[#C9A868] w-8 h-8 group-hover:text-white transition-colors" />
               </div>
               <div>
                  <h3 className="font-light text-[#2D2416] text-xl group-hover:text-[#C9A868] transition-colors">Tratamentos</h3>
                  <p className="text-[#6B5D4F] text-sm font-light mt-1">3 Ativos • 1 Plano</p>
               </div>
           </div>
        </div>

        {/* Search Bar - High Visibility */}
        <div className="bg-[#FEFBF7] p-10 rounded-[2rem] shadow-xl shadow-[#D4A574]/10 border border-[#D4A574]/20">
          <h2 className="text-2xl font-light text-[#2D2416] mb-8">O que você deseja agendar hoje?</h2>
          <form onSubmit={handleSearch} className="relative">
             <Search className="absolute left-8 top-1/2 transform -translate-y-1/2 w-6 h-6 text-[#B8935C]" />
             <Input 
               placeholder="Buscar dermatologistas, laser, harmonização..." 
               className="pl-20 h-20 text-xl bg-[#FFF9F0] border-2 border-transparent text-[#2D2416] rounded-[1.5rem] focus:ring-4 focus:ring-[#D4A574]/10 focus:border-[#D4A574] transition-all placeholder:text-[#B8935C]/50 hover:bg-white font-light"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
             <Button type="submit" className="absolute right-4 top-4 bottom-4 px-10 bg-[#D4A574] text-white hover:bg-[#C49565] rounded-2xl font-light text-lg transition-all shadow-lg shadow-[#D4A574]/20 hover:shadow-[#D4A574]/40 hover:scale-105">
               Buscar
             </Button>
          </form>
        </div>

        {/* Features Section */}
        <div className="space-y-12 mb-16">
          {/* Tecnologia Humanizada */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-[#FEFBF7] rounded-3xl overflow-hidden border border-[#D4A574]/20 shadow-lg">
            <div className="p-12">
              <div className="inline-block bg-[#E8E05C] text-[#2D2416] px-6 py-2 rounded-full font-light text-sm mb-6 uppercase tracking-wider">
                Tecnologia Humanizada
              </div>
              <h3 className="text-3xl font-light text-[#2D2416] mb-4">A Rede Credenciada</h3>
              <p className="text-[#6B5D4F] font-light leading-relaxed">
                Clubdabeleza.com usa o melhor da transformação digital para o benefício das boas práticas na estética brasileira. O Clubdabeleza.com por essa razão tem uma plataforma digital que irá impulsionar seu consultório, clínica ou negócio sem você se distanciar de cada paciente.
              </p>
            </div>
            <div className="relative h-96 lg:h-full">
              <img 
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=800&auto=format&fit=crop" 
                alt="Tecnologia em Estética"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#FEFBF7] to-transparent"></div>
            </div>
          </div>

          {/* Compromisso */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-[#FEFBF7] rounded-3xl overflow-hidden border border-[#D4A574]/20 shadow-lg">
            <div className="relative h-96 lg:h-full order-2 lg:order-1">
              <img 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop" 
                alt="Profissionais Premium"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-[#FEFBF7] to-transparent"></div>
            </div>
            <div className="p-12 order-1 lg:order-2">
              <div className="inline-block bg-[#E8E05C] text-[#2D2416] px-6 py-2 rounded-full font-light text-sm mb-6 uppercase tracking-wider">
                + Compromisso
              </div>
              <h3 className="text-3xl font-light text-[#2D2416] mb-4">O Selo PREMIUM</h3>
              <p className="text-[#6B5D4F] font-light leading-relaxed mb-4">
                O SELO PREMIUM do Clubdabeleza.com tem como missão destacar os especialistas quem melhor atendem. Somente especialista talentosos verificados e aplicados a submissão do SELO PREMIUM podem fazer parte.
              </p>
              <p className="text-[#6B5D4F] font-light leading-relaxed">
                Aqui segurança e eficácia é básico. Solicite mais informações de como ter o SELO PREMIUM Clubdabeleza.com na sua Clínica ou consultório.
              </p>
            </div>
          </div>

          {/* Mais Pacientes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-[#FEFBF7] rounded-3xl overflow-hidden border border-[#D4A574]/20 shadow-lg">
            <div className="p-12">
              <div className="inline-block bg-[#E8E05C] text-[#2D2416] px-6 py-2 rounded-full font-light text-sm mb-6 uppercase tracking-wider">
                + Pacientes
              </div>
              <h3 className="text-3xl font-light text-[#2D2416] mb-4">Gerador de Ordem de Serviços</h3>
              <p className="text-[#6B5D4F] font-light leading-relaxed">
                Gostaria de ter mais pacientes? Está procurando aumentar o número de procedimentos que realiza? O SELO EXCELÊNCIA do Clubdabeleza.com oferece para seu consultório o gerador de ordem de serviços. Uma ferramenta que aproxima pacientes qualificados. Destaque seus serviços e leva até você mais pedidos.
              </p>
            </div>
            <div className="relative h-96 lg:h-full">
              <img 
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=800&auto=format&fit=crop" 
                alt="Mais Pacientes"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#FEFBF7] to-transparent"></div>
            </div>
          </div>

          {/* Fidelize */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-[#FEFBF7] rounded-3xl overflow-hidden border border-[#D4A574]/20 shadow-lg">
            <div className="relative h-96 lg:h-full order-2 lg:order-1">
              <img 
                src="https://images.unsplash.com/photo-1551836022-4c4c79ecde51?q=80&w=800&auto=format&fit=crop" 
                alt="Fidelização"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-[#FEFBF7] to-transparent"></div>
            </div>
            <div className="p-12 order-1 lg:order-2">
              <div className="inline-block bg-[#E8E05C] text-[#2D2416] px-6 py-2 rounded-full font-light text-sm mb-6 uppercase tracking-wider">
                Fidelize +
              </div>
              <h3 className="text-3xl font-light text-[#2D2416] mb-4">O Selo Clube+</h3>
              <p className="text-[#6B5D4F] font-light leading-relaxed">
                Mantenha seus pacientes mais perto de você. O Selo Clube+ Clubdabeleza.com facilita em tudo o controle de seus pacientes mais fiéis e aproxima os pacientes novos em 98%.
              </p>
            </div>
          </div>
        </div>

        {/* Patient News Feed */}
        <div className="space-y-6">
           <h2 className="text-2xl font-light text-[#2D2416] flex items-center gap-4">
              <div className="w-2 h-8 bg-[#D4A574] rounded-full"></div>
              Notícias & Tendências
           </h2>
           <PatientNewsFeed />
        </div>

        {/* Categories / Inspiration - Vivid */}
        <div>
            <h2 className="text-2xl font-light text-[#2D2416] mb-8 flex items-center gap-4">
              <div className="w-2 h-8 bg-[#D4A574] rounded-full"></div>
              Explorar Procedimentos
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
               {[
                  { title: "Skincare", img: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&q=60" },
                  { title: "Laser", img: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=500&q=60" },
                  { title: "Harmonização", img: "https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=500&q=60" },
                  { title: "Nutrologia", img: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=500&q=60" }
               ].map((cat, i) => (
                  <div key={i} className="relative h-56 rounded-2xl overflow-hidden cursor-pointer group transition-all duration-500 hover:shadow-2xl shadow-md">
                     <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all z-10"></div>
                     <div className={`absolute bottom-4 left-4 text-xl font-bold text-white z-20 drop-shadow-md`}>{cat.title}</div>
                     <img src={cat.img} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={cat.title} />
                     <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20">
                        <ChevronRight className="text-white w-4 h-4" />
                     </div>
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
      <div className="space-y-8 pb-10">
         <div className="flex items-center justify-between">
            <div>
               <h1 className="text-3xl font-light text-[#2D2416]">Painel do Patrocinador</h1>
               <p className="text-[#6B5D4F] font-light">Gerencie suas campanhas e acompanhe o desempenho.</p>
            </div>
            <Button className="bg-[#D4A574] hover:bg-[#C49565] text-white font-light"><BarChart2 className="mr-2 w-4 h-4" /> Relatório Completo</Button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-[#FEFBF7] shadow-sm border-[#D4A574]/20">
               <CardContent className="p-6">
                  <p className="text-sm text-[#6B5D4F] font-light uppercase">Visualizações Totais</p>
                  <p className="text-3xl font-light text-[#2D2416] mt-2">12,450</p>
                  <p className="text-xs text-[#C9A868] mt-1 flex items-center gap-1">▲ 12% este mês</p>
               </CardContent>
            </Card>
            <Card className="bg-[#FEFBF7] shadow-sm border-[#D4A574]/20">
               <CardContent className="p-6">
                  <p className="text-sm text-[#6B5D4F] font-light uppercase">Cliques Totais</p>
                  <p className="text-3xl font-light text-[#2D2416] mt-2">843</p>
                  <p className="text-xs text-[#C9A868] mt-1 flex items-center gap-1">▲ 5% este mês</p>
               </CardContent>
            </Card>
            <Card className="bg-[#FEFBF7] shadow-sm border-[#D4A574]/20">
               <CardContent className="p-6">
                  <p className="text-sm text-[#6B5D4F] font-light uppercase">Banners Ativos</p>
                  <p className="text-3xl font-light text-[#2D2416] mt-2">3</p>
                  <p className="text-xs text-[#B8935C] mt-1">De 5 permitidos no plano</p>
               </CardContent>
            </Card>
         </div>

         <BannerManager />

         {/* Features Section - Same for all users */}
         <div className="space-y-12 mt-16">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-[#FEFBF7] rounded-3xl overflow-hidden border border-[#D4A574]/20 shadow-lg">
             <div className="p-12">
               <div className="inline-block bg-[#E8E05C] text-[#2D2416] px-6 py-2 rounded-full font-light text-sm mb-6 uppercase tracking-wider">
                 Tecnologia Humanizada
               </div>
               <h3 className="text-3xl font-light text-[#2D2416] mb-4">A Rede Credenciada</h3>
               <p className="text-[#6B5D4F] font-light leading-relaxed">
                 Clubdabeleza.com usa o melhor da transformação digital para o benefício das boas práticas na estética brasileira. O Clubdabeleza.com por essa razão tem uma plataforma digital que irá impulsionar seu consultório, clínica ou negócio sem você se distanciar de cada paciente.
               </p>
             </div>
             <div className="relative h-96 lg:h-full">
               <img 
                 src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=800&auto=format&fit=crop" 
                 alt="Tecnologia em Estética"
                 className="w-full h-full object-cover"
               />
               <div className="absolute inset-0 bg-gradient-to-r from-[#FEFBF7] to-transparent"></div>
             </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-[#FEFBF7] rounded-3xl overflow-hidden border border-[#D4A574]/20 shadow-lg">
             <div className="relative h-96 lg:h-full order-2 lg:order-1">
               <img 
                 src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop" 
                 alt="Profissionais Premium"
                 className="w-full h-full object-cover"
               />
               <div className="absolute inset-0 bg-gradient-to-l from-[#FEFBF7] to-transparent"></div>
             </div>
             <div className="p-12 order-1 lg:order-2">
               <div className="inline-block bg-[#E8E05C] text-[#2D2416] px-6 py-2 rounded-full font-light text-sm mb-6 uppercase tracking-wider">
                 + Compromisso
               </div>
               <h3 className="text-3xl font-light text-[#2D2416] mb-4">O Selo PREMIUM</h3>
               <p className="text-[#6B5D4F] font-light leading-relaxed mb-4">
                 O SELO PREMIUM do Clubdabeleza.com tem como missão destacar os especialistas quem melhor atendem. Somente especialista talentosos verificados e aplicados a submissão do SELO PREMIUM podem fazer parte.
               </p>
               <p className="text-[#6B5D4F] font-light leading-relaxed">
                 Aqui segurança e eficácia é básico. Solicite mais informações de como ter o SELO PREMIUM Clubdabeleza.com na sua Clínica ou consultório.
               </p>
             </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-[#FEFBF7] rounded-3xl overflow-hidden border border-[#D4A574]/20 shadow-lg">
             <div className="p-12">
               <div className="inline-block bg-[#E8E05C] text-[#2D2416] px-6 py-2 rounded-full font-light text-sm mb-6 uppercase tracking-wider">
                 + Pacientes
               </div>
               <h3 className="text-3xl font-light text-[#2D2416] mb-4">Gerador de Ordem de Serviços</h3>
               <p className="text-[#6B5D4F] font-light leading-relaxed">
                 Gostaria de ter mais pacientes? Está procurando aumentar o número de procedimentos que realiza? O SELO EXCELÊNCIA do Clubdabeleza.com oferece para seu consultório o gerador de ordem de serviços. Uma ferramenta que aproxima pacientes qualificados. Destaque seus serviços e leva até você mais pedidos.
               </p>
             </div>
             <div className="relative h-96 lg:h-full">
               <img 
                 src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=800&auto=format&fit=crop" 
                 alt="Mais Pacientes"
                 className="w-full h-full object-cover"
               />
               <div className="absolute inset-0 bg-gradient-to-r from-[#FEFBF7] to-transparent"></div>
             </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-[#FEFBF7] rounded-3xl overflow-hidden border border-[#D4A574]/20 shadow-lg">
             <div className="relative h-96 lg:h-full order-2 lg:order-1">
               <img 
                 src="https://images.unsplash.com/photo-1551836022-4c4c79ecde51?q=80&w=800&auto=format&fit=crop" 
                 alt="Fidelização"
                 className="w-full h-full object-cover"
               />
               <div className="absolute inset-0 bg-gradient-to-l from-[#FEFBF7] to-transparent"></div>
             </div>
             <div className="p-12 order-1 lg:order-2">
               <div className="inline-block bg-[#E8E05C] text-[#2D2416] px-6 py-2 rounded-full font-light text-sm mb-6 uppercase tracking-wider">
                 Fidelize +
               </div>
               <h3 className="text-3xl font-light text-[#2D2416] mb-4">O Selo Clube+</h3>
               <p className="text-[#6B5D4F] font-light leading-relaxed">
                 Mantenha seus pacientes mais perto de você. O Selo Clube+ Clubdabeleza.com facilita em tudo o controle de seus pacientes mais fiéis e aproxima os pacientes novos em 98%.
               </p>
             </div>
           </div>
         </div>
      </div>
    );
  }

  // --- PROFESSIONAL & ADMIN VIEW (Light Mode) ---
  return (
    <div className="text-[#0F172A]">
      {/* Hero Section - Full Width Landing Page Style */}
      <div className="relative min-h-[70vh] bg-[#FEFBF7] -mx-4 lg:-mx-8 -mt-4 lg:-mt-8">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F5F1E8] via-[#FEFBF7] to-[#FFF9F0]"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522338140262-f46f5913618a?q=80&w=2000')] bg-cover bg-center opacity-[0.03]"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#FEFBF7]/95 via-[#FEFBF7]/90 to-transparent"></div>

        <div className="relative z-10 max-w-[1600px] mx-auto px-6 lg:px-12 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="mb-8">
                <div className="text-3xl font-light tracking-[0.3em] text-[#2D2416]">
                  CLUBE DA BELEZA
                </div>
                <div className="w-32 h-px bg-gradient-to-r from-[#D4A574] to-transparent mt-3"></div>
              </div>

              <h1 className="text-6xl lg:text-7xl font-light tracking-tight text-[#2D2416] mb-6 leading-[1.1]">
                Inovação em <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4A574] to-[#B8935C] font-normal">Saúde Estética</span>
              </h1>

              <p className="text-xl lg:text-2xl text-[#6B5D4F] leading-relaxed font-light mb-10">
                O Clube da Beleza é a plataforma mais avançada para profissionais da medicina estética. 
                Transforme sua prática com ferramentas de IA, gestão inteligente de agendamentos, 
                criação de sites profissionais, chatbots personalizados e muito mais.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button className="bg-[#D4A574] hover:bg-[#C49565] text-white h-14 px-8 text-lg font-light shadow-xl rounded-2xl">
                  Começar Agora
                </Button>
                <Button variant="outline" className="border-2 border-[#D4A574] text-[#B8935C] hover:bg-[#FFF9F0] h-14 px-8 text-lg font-light rounded-2xl">
                  Ver Demonstração
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-[#FEFBF7] p-8 rounded-3xl border border-[#D4A574]/20 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2">
                <div className="bg-gradient-to-br from-[#D4A574] to-[#C9A868] w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <div className="text-lg font-light text-[#2D2416] mb-2">Agendamento Inteligente</div>
                <div className="text-sm text-[#6B5D4F] leading-relaxed font-light">Gestão completa de consultas com IA</div>
              </div>

              <div className="bg-[#FEFBF7] p-8 rounded-3xl border border-[#D4A574]/20 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 mt-8">
                <div className="bg-gradient-to-br from-[#B8935C] to-[#A68350] w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <div className="text-lg font-light text-[#2D2416] mb-2">Chatbots 24/7</div>
                <div className="text-sm text-[#6B5D4F] leading-relaxed font-light">Atendimento automático para pacientes</div>
              </div>

              <div className="bg-[#FEFBF7] p-8 rounded-3xl border border-[#D4A574]/20 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2">
                <div className="bg-gradient-to-br from-[#C9A868] to-[#B59758] w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <div className="text-lg font-light text-[#2D2416] mb-2">Sites Profissionais</div>
                <div className="text-sm text-[#6B5D4F] leading-relaxed font-light">Crie sua presença digital em minutos</div>
              </div>

              <div className="bg-[#FEFBF7] p-8 rounded-3xl border border-[#D4A574]/20 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 mt-8">
                <div className="bg-gradient-to-br from-[#D4A574] to-[#E0B480] w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Palette className="w-8 h-8 text-white" />
                </div>
                <div className="text-lg font-light text-[#2D2416] mb-2">Design com IA</div>
                <div className="text-sm text-[#6B5D4F] leading-relaxed font-light">Criação visual automatizada</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section - Same for all users */}
      <div className="space-y-12 mb-16 mt-16">
        {/* Tecnologia Humanizada */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-[#FEFBF7] rounded-3xl overflow-hidden border border-[#D4A574]/20 shadow-lg">
          <div className="p-12">
            <div className="inline-block bg-[#E8E05C] text-[#2D2416] px-6 py-2 rounded-full font-light text-sm mb-6 uppercase tracking-wider">
              Tecnologia Humanizada
            </div>
            <h3 className="text-3xl font-light text-[#2D2416] mb-4">A Rede Credenciada</h3>
            <p className="text-[#6B5D4F] font-light leading-relaxed">
              Clubdabeleza.com usa o melhor da transformação digital para o benefício das boas práticas na estética brasileira. O Clubdabeleza.com por essa razão tem uma plataforma digital que irá impulsionar seu consultório, clínica ou negócio sem você se distanciar de cada paciente.
            </p>
          </div>
          <div className="relative h-96 lg:h-full">
            <img 
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=800&auto=format&fit=crop" 
              alt="Tecnologia em Estética"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#FEFBF7] to-transparent"></div>
          </div>
        </div>

        {/* Compromisso */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-[#FEFBF7] rounded-3xl overflow-hidden border border-[#D4A574]/20 shadow-lg">
          <div className="relative h-96 lg:h-full order-2 lg:order-1">
            <img 
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop" 
              alt="Profissionais Premium"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-[#FEFBF7] to-transparent"></div>
          </div>
          <div className="p-12 order-1 lg:order-2">
            <div className="inline-block bg-[#E8E05C] text-[#2D2416] px-6 py-2 rounded-full font-light text-sm mb-6 uppercase tracking-wider">
              + Compromisso
            </div>
            <h3 className="text-3xl font-light text-[#2D2416] mb-4">O Selo PREMIUM</h3>
            <p className="text-[#6B5D4F] font-light leading-relaxed mb-4">
              O SELO PREMIUM do Clubdabeleza.com tem como missão destacar os especialistas quem melhor atendem. Somente especialista talentosos verificados e aplicados a submissão do SELO PREMIUM podem fazer parte.
            </p>
            <p className="text-[#6B5D4F] font-light leading-relaxed">
              Aqui segurança e eficácia é básico. Solicite mais informações de como ter o SELO PREMIUM Clubdabeleza.com na sua Clínica ou consultório.
            </p>
          </div>
        </div>

        {/* Mais Pacientes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-[#FEFBF7] rounded-3xl overflow-hidden border border-[#D4A574]/20 shadow-lg">
          <div className="p-12">
            <div className="inline-block bg-[#E8E05C] text-[#2D2416] px-6 py-2 rounded-full font-light text-sm mb-6 uppercase tracking-wider">
              + Pacientes
            </div>
            <h3 className="text-3xl font-light text-[#2D2416] mb-4">Gerador de Ordem de Serviços</h3>
            <p className="text-[#6B5D4F] font-light leading-relaxed">
              Gostaria de ter mais pacientes? Está procurando aumentar o número de procedimentos que realiza? O SELO EXCELÊNCIA do Clubdabeleza.com oferece para seu consultório o gerador de ordem de serviços. Uma ferramenta que aproxima pacientes qualificados. Destaque seus serviços e leva até você mais pedidos.
            </p>
          </div>
          <div className="relative h-96 lg:h-full">
            <img 
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=800&auto=format&fit=crop" 
              alt="Mais Pacientes"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#FEFBF7] to-transparent"></div>
          </div>
        </div>

        {/* Fidelize */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-[#FEFBF7] rounded-3xl overflow-hidden border border-[#D4A574]/20 shadow-lg">
          <div className="relative h-96 lg:h-full order-2 lg:order-1">
            <img 
              src="https://images.unsplash.com/photo-1551836022-4c4c79ecde51?q=80&w=800&auto=format&fit=crop" 
              alt="Fidelização"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-[#FEFBF7] to-transparent"></div>
          </div>
          <div className="p-12 order-1 lg:order-2">
            <div className="inline-block bg-[#E8E05C] text-[#2D2416] px-6 py-2 rounded-full font-light text-sm mb-6 uppercase tracking-wider">
              Fidelize +
            </div>
            <h3 className="text-3xl font-light text-[#2D2416] mb-4">O Selo Clube+</h3>
            <p className="text-[#6B5D4F] font-light leading-relaxed">
              Mantenha seus pacientes mais perto de você. O Selo Clube+ Clubdabeleza.com facilita em tudo o controle de seus pacientes mais fiéis e aproxima os pacientes novos em 98%.
            </p>
          </div>
        </div>
      </div>

      {/* Stats & Dashboard Section */}
      <div className="mt-16 space-y-8 px-4 lg:px-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-light text-[#2D2416] tracking-tight">Painel de Controle</h2>
            <p className="text-[#6B5D4F] mt-1 font-light">Acompanhe o desempenho da sua prática em tempo real.</p>
          </div>
        </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#FEFBF7] p-6 rounded-2xl shadow-md border border-[#D4A574]/20 hover:shadow-lg transition-all group">
          <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-light text-[#6B5D4F] uppercase tracking-wider">Próximas Consultas</h3>
              <Calendar className="w-5 h-5 text-[#D4A574] group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-4xl font-light text-[#2D2416] mt-2 flex items-center gap-2">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-[#D4A574]" /> : stats?.appointments || 14}
          </p>
          <p className="text-xs text-[#C9A868] mt-2 font-light">▲ 12% esta semana</p>
        </div>

        <div className="bg-[#FEFBF7] p-6 rounded-2xl shadow-md border border-[#D4A574]/20 hover:shadow-lg transition-all group relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-light text-[#6B5D4F] uppercase tracking-wider">Pacientes Ativos (30min)</h3>
              <Users className="w-5 h-5 text-[#B8935C] group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-4xl font-light text-[#2D2416] mt-2 flex items-center gap-2">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-[#B8935C]" /> : stats?.patients || 0}
            </p>

            {/* Active Users List Tooltip/Preview */}
            {stats?.activePatientsDetails?.length > 0 && (
               <div className="mt-4 space-y-2 border-t border-[#D4A574]/20 pt-2 max-h-32 overflow-y-auto">
                  {stats.activePatientsDetails.map(p => (
                     <div key={p.id} className="text-xs text-[#6B5D4F] flex justify-between items-center">
                        <span>{p.user_email.split('@')[0]}</span>
                        <span className="text-[#B8935C] flex items-center gap-1">
                           <span className="w-1.5 h-1.5 bg-[#D4A574] rounded-full animate-pulse"></span>
                           {p.address?.city || 'Local desc.'}
                        </span>
                     </div>
                  ))}
               </div>
            )}
        </div>

        <div className="bg-[#FEFBF7] p-6 rounded-2xl shadow-md border border-[#D4A574]/20 hover:shadow-lg transition-all group">
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-xs font-light text-[#6B5D4F] uppercase tracking-wider">Receita Estimada</h3>
               <DollarSign className="w-5 h-5 text-[#C9A868] group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-4xl font-light text-[#2D2416] mt-2 flex items-center gap-2">
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-[#C9A868]" /> : `R$ ${stats?.revenue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}`}
            </p>
             <p className="text-xs text-[#6B5D4F] mt-2 font-light">Soma dos valores de agendamentos</p>
        </div>
      </div>

      {/* Banner Manager Section */}
      <div className="mb-8 bg-white p-8 rounded-xl border border-slate-200 mt-8 shadow-md">
         <div className="flex items-center gap-3 mb-6">
            <div className="bg-indigo-50 p-2 rounded-lg"><Palette className="w-5 h-5 text-indigo-600" /></div>
            <div>
               <h3 className="font-bold text-xl text-[#0F172A]">Gerenciador de Anúncios</h3>
               <p className="text-sm text-[#64748B]">Crie campanhas visuais de alto impacto.</p>
            </div>
         </div>
         <BannerManager />
      </div>

      {/* Search Section */}
      <div className="bg-[#FEFBF7] rounded-2xl border border-[#D4A574]/20 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-light text-[#2D2416]">Busca Rápida</h2>
        </div>
        <div className="w-full">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <Select value={searchCategory} onValueChange={setSearchCategory}>
              <SelectTrigger className="w-full md:w-[200px] bg-[#FFF9F0] border-[#D4A574]/30 text-[#2D2416] h-12 font-light">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent className="bg-[#FEFBF7] border-[#D4A574]/30 text-[#2D2416]">
                <SelectItem value="all">Todas as Categorias</SelectItem>
                <SelectItem value="procedures">Procedimentos</SelectItem>
                <SelectItem value="exams">Exames</SelectItem>
                <SelectItem value="professionals">Profissionais</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex-1 relative">
               <Input 
                 placeholder="Pesquise por nome, CPF ou procedimento..." 
                 className="w-full bg-[#FFF9F0] border-[#D4A574]/30 text-[#2D2416] h-12 pl-4 rounded-xl focus:ring-2 focus:ring-[#D4A574]/20 font-light"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
            </div>
            <Button type="submit" className="bg-[#D4A574] text-white hover:bg-[#C49565] h-12 px-8 font-light rounded-xl">
              <Search className="w-4 h-4 mr-2" /> Pesquisar
            </Button>
          </form>
        </div>
      </div>
    </div>
    </div>
  );
}