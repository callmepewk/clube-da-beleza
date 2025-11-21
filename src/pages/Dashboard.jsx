import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Calendar, Sparkles, ChevronRight, DollarSign, Bot, Globe, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import OnboardingWizard from '@/components/OnboardingWizard';

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

   if (isLoading) return <div className="flex gap-4 justify-center py-8"><Loader2 className="animate-spin text-[#D4A574]" /> <span className="text-[#6B5D4F]">Carregando notícias...</span></div>;

   return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {news?.map((item, idx) => (
            <div key={idx} className="bg-[#FEFBF7] rounded-2xl overflow-hidden shadow-md border border-[#D4A574]/20 hover:shadow-xl transition-all flex flex-col">
               <div className="h-48 bg-slate-100 relative overflow-hidden">
                  <img 
                     src={`https://source.unsplash.com/400x300/?${item.image_keyword || 'health'}`} 
                     className="w-full h-full object-cover" 
                     alt={item.title}
                  />
                  <div className="absolute top-2 left-2 bg-white/90 px-3 py-1 rounded-lg text-xs font-bold uppercase text-[#2D2416]">
                     {item.category}
                  </div>
               </div>
               <div className="p-6">
                  <h3 className="font-light text-lg text-[#2D2416] mb-2">{item.title}</h3>
                  <p className="text-[#6B5D4F] text-sm font-light line-clamp-3">{item.summary}</p>
               </div>
            </div>
         ))}
      </div>
   );
};

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        const u = await base44.auth.me();
        if (u) {
          const profiles = await base44.entities.UserProfile.list({ query: { user_email: u.email } });
          setUser({ ...u, profile: profiles?.data?.[0] });
        }
      }
    };
    loadUser();
  }, []);

  return (
    <div className="space-y-12 pb-16">
      {/* Onboarding Wizard */}
      <OnboardingWizard isOpen={showWizard} onClose={() => setShowWizard(false)} />

      {/* Hero Section - Unified for All Users */}
      <div className="relative min-h-[70vh] rounded-[2rem] overflow-hidden shadow-2xl bg-[#FEFBF7] border border-[#D4A574]/20">
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

              <h1 className="text-5xl lg:text-7xl font-light tracking-tight text-[#2D2416] mb-6 leading-[1.1]">
                {user ? `Olá, ${user.full_name?.split(' ')[0]}` : 'Bem-vindo ao'} <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4A574] to-[#B8935C] font-normal">{user ? '' : 'Clube da Beleza'}</span>
              </h1>

              <p className="text-xl lg:text-2xl text-[#6B5D4F] leading-relaxed font-light mb-10">
                Sua plataforma completa de saúde, estética e bem-estar. 
                Transforme sua rotina com ferramentas de IA, gestão inteligente, 
                criação de conteúdo profissional e muito mais.
              </p>

              <div className="flex flex-wrap gap-4">
                {!user ? (
                  <>
                    <Button 
                      onClick={() => base44.auth.redirectToLogin()} 
                      className="bg-[#D4A574] hover:bg-[#C49565] text-white h-14 px-8 text-lg font-light shadow-xl rounded-2xl"
                    >
                      Entrar / Cadastrar
                    </Button>
                    <Button 
                      onClick={() => window.open('https://mapa-da-estetica.base44.app', '_blank')}
                      variant="outline"
                      className="border-2 border-[#D4A574]/40 text-[#B8935C] hover:bg-[#FFF9F0] h-14 px-8 text-lg font-light rounded-2xl"
                    >
                      Já uso o Mapa da Estética
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={() => setShowWizard(true)}
                    className="bg-[#D4A574] hover:bg-[#C49565] text-white h-14 px-8 text-lg font-light shadow-xl rounded-2xl"
                  >
                    Começar Agora
                  </Button>
                )}
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
                <div className="text-sm text-[#6B5D4F] leading-relaxed font-light">Atendimento automático</div>
              </div>

              <div className="bg-[#FEFBF7] p-8 rounded-3xl border border-[#D4A574]/20 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2">
                <div className="bg-gradient-to-br from-[#C9A868] to-[#B59758] w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <div className="text-lg font-light text-[#2D2416] mb-2">Sites Profissionais</div>
                <div className="text-sm text-[#6B5D4F] leading-relaxed font-light">Presença digital em minutos</div>
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

      {/* Action Cards */}
      {user && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#FEFBF7] hover:shadow-[0_20px_40px_-12px_rgba(212,165,116,0.2)] hover:-translate-y-1 transition-all duration-300 rounded-[1.5rem] p-8 cursor-pointer group border border-[#D4A574]/20 flex items-center gap-6">
            <div className="h-16 w-16 bg-[#FFF9F0] rounded-2xl flex items-center justify-center group-hover:bg-[#D4A574] transition-colors duration-300">
              <Calendar className="text-[#D4A574] w-8 h-8 group-hover:text-white transition-colors" />
            </div>
            <div>
              <h3 className="font-light text-[#2D2416] text-xl group-hover:text-[#D4A574] transition-colors">Próxima Consulta</h3>
              <p className="text-[#6B5D4F] text-sm font-light mt-1">Em breve</p>
            </div>
          </div>

          <div className="bg-[#FEFBF7] hover:shadow-[0_20px_40px_-12px_rgba(212,165,116,0.2)] hover:-translate-y-1 transition-all duration-300 rounded-[1.5rem] p-8 cursor-pointer group border border-[#D4A574]/20 flex items-center gap-6">
            <div className="h-16 w-16 bg-[#FFF9F0] rounded-2xl flex items-center justify-center group-hover:bg-[#B8935C] transition-colors duration-300">
              <DollarSign className="text-[#B8935C] w-8 h-8 group-hover:text-white transition-colors" />
            </div>
            <div>
              <h3 className="font-light text-[#2D2416] text-xl group-hover:text-[#B8935C] transition-colors">Meu Plano</h3>
              <p className="text-[#6B5D4F] text-sm font-light mt-1">{user.profile?.plan || 'Free'}</p>
            </div>
          </div>

          <div className="bg-[#FEFBF7] hover:shadow-[0_20px_40px_-12px_rgba(212,165,116,0.2)] hover:-translate-y-1 transition-all duration-300 rounded-[1.5rem] p-8 cursor-pointer group border border-[#D4A574]/20 flex items-center gap-6">
            <div className="h-16 w-16 bg-[#FFF9F0] rounded-2xl flex items-center justify-center group-hover:bg-[#C9A868] transition-colors duration-300">
              <Sparkles className="text-[#C9A868] w-8 h-8 group-hover:text-white transition-colors" />
            </div>
            <div>
              <h3 className="font-light text-[#2D2416] text-xl group-hover:text-[#C9A868] transition-colors">Ferramentas</h3>
              <p className="text-[#6B5D4F] text-sm font-light mt-1">6 Disponíveis</p>
            </div>
          </div>
        </div>
      )}

      {/* Features Section */}
      <div className="space-y-12">
        {/* Tecnologia Humanizada */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-[#FEFBF7] rounded-3xl overflow-hidden border border-[#D4A574]/20 shadow-lg">
          <div className="p-8 lg:p-12">
            <div className="inline-block bg-[#E8E05C] text-[#2D2416] px-6 py-2 rounded-full font-light text-sm mb-6 uppercase tracking-wider">
              Tecnologia Humanizada
            </div>
            <h3 className="text-2xl lg:text-3xl font-light text-[#2D2416] mb-4">A Rede Credenciada</h3>
            <p className="text-[#6B5D4F] font-light leading-relaxed">
              Clubdabeleza.com usa o melhor da transformação digital para o benefício das boas práticas na estética brasileira. O Clubdabeleza.com por essa razão tem uma plataforma digital que irá impulsionar seu consultório, clínica ou negócio sem você se distanciar de cada paciente.
            </p>
          </div>
          <div className="relative h-64 lg:h-96">
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
          <div className="relative h-64 lg:h-96 order-2 lg:order-1">
            <img 
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop" 
              alt="Profissionais Premium"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-[#FEFBF7] to-transparent"></div>
          </div>
          <div className="p-8 lg:p-12 order-1 lg:order-2">
            <div className="inline-block bg-[#E8E05C] text-[#2D2416] px-6 py-2 rounded-full font-light text-sm mb-6 uppercase tracking-wider">
              + Compromisso
            </div>
            <h3 className="text-2xl lg:text-3xl font-light text-[#2D2416] mb-4">O Selo PREMIUM</h3>
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
          <div className="p-8 lg:p-12">
            <div className="inline-block bg-[#E8E05C] text-[#2D2416] px-6 py-2 rounded-full font-light text-sm mb-6 uppercase tracking-wider">
              + Pacientes
            </div>
            <h3 className="text-2xl lg:text-3xl font-light text-[#2D2416] mb-4">Gerador de Ordem de Serviços</h3>
            <p className="text-[#6B5D4F] font-light leading-relaxed">
              Gostaria de ter mais pacientes? Está procurando aumentar o número de procedimentos que realiza? O SELO EXCELÊNCIA do Clubdabeleza.com oferece para seu consultório o gerador de ordem de serviços. Uma ferramenta que aproxima pacientes qualificados. Destaque seus serviços e leva até você mais pedidos.
            </p>
          </div>
          <div className="relative h-64 lg:h-96">
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
          <div className="relative h-64 lg:h-96 order-2 lg:order-1">
            <img 
              src="https://images.unsplash.com/photo-1551836022-4c4c79ecde51?q=80&w=800&auto=format&fit=crop" 
              alt="Fidelização"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-[#FEFBF7] to-transparent"></div>
          </div>
          <div className="p-8 lg:p-12 order-1 lg:order-2">
            <div className="inline-block bg-[#E8E05C] text-[#2D2416] px-6 py-2 rounded-full font-light text-sm mb-6 uppercase tracking-wider">
              Fidelize +
            </div>
            <h3 className="text-2xl lg:text-3xl font-light text-[#2D2416] mb-4">O Selo Clube+</h3>
            <p className="text-[#6B5D4F] font-light leading-relaxed">
              Mantenha seus pacientes mais perto de você. O Selo Clube+ Clubdabeleza.com facilita em tudo o controle de seus pacientes mais fiéis e aproxima os pacientes novos em 98%.
            </p>
          </div>
        </div>
      </div>

      {/* Explorar Procedimentos */}
      <div>
        <h2 className="text-3xl lg:text-4xl font-light text-[#2D2416] mb-8 flex items-center gap-4">
          <div className="w-2 h-8 bg-[#D4A574] rounded-full"></div>
          Explorar Procedimentos
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          {[
            { title: "Skincare", img: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&q=60" },
            { title: "Laser", img: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=500&q=60" },
            { title: "Harmonização", img: "https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=500&q=60" },
            { title: "Nutrologia", img: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=500&q=60" }
          ].map((cat, i) => (
            <div key={i} className="relative h-48 lg:h-56 rounded-2xl overflow-hidden cursor-pointer group transition-all duration-500 hover:shadow-2xl shadow-md">
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all z-10"></div>
              <div className="absolute bottom-4 left-4 text-lg lg:text-xl font-bold text-white z-20 drop-shadow-md">{cat.title}</div>
              <img src={cat.img} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={cat.title} />
              <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <ChevronRight className="text-white w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* News Feed */}
      <div className="space-y-6">
        <h2 className="text-3xl lg:text-4xl font-light text-[#2D2416] flex items-center gap-4">
          <div className="w-2 h-8 bg-[#D4A574] rounded-full"></div>
          Notícias & Tendências
        </h2>
        <PatientNewsFeed />
      </div>
    </div>
  );
}