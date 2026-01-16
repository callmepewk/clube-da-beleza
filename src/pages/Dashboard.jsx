import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Calendar, Sparkles, ChevronRight, DollarSign, Bot, Globe, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import OnboardingWizard from '@/components/OnboardingWizard';
import { createPageUrl } from '@/utils';
import T from '@/components/TranslatedText';
import { sendWhatsAppMessage } from '@/components/usage/usageLimits';

const PatientNewsFeed = () => {
   const { data: news, isLoading } = useQuery({
      queryKey: ['patientNews'],
      queryFn: async () => {
         const res = await base44.integrations.Core.InvokeLLM({
            prompt: "Gere 4 notícias recentes e interessantes sobre saúde, estética, beleza e moda. Para cada notícia, retorne JSON com 'title', 'category', 'image_keyword', 'summary' e 'url' (link real de artigo ou notícia sobre o tema).",
            add_context_from_internet: true,
            response_json_schema: {
               type: "object",
               properties: {
                  news: { type: "array", items: { type: "object", properties: { title: {type:"string"}, category: {type:"string"}, image_keyword: {type:"string"}, summary: {type:"string"}, url: {type:"string"} } } }
               }
            }
         });
         return res.news || [];
      },
      staleTime: 1000 * 60 * 60 * 24 // 24h cache
   });

   if (isLoading) return <div className="flex gap-4 justify-center py-8"><Loader2 className="animate-spin text-[#D4A574]" /> <T className="text-[#6B5D4F]">Carregando notícias...</T></div>;

   return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
         {news?.map((item, idx) => (
            <a 
               key={idx} 
               href={item.url || `https://www.google.com/search?q=${encodeURIComponent(item.title + ' ' + item.category)}`}
               target="_blank"
               rel="noopener noreferrer"
               className="bg-[#FEFBF7] rounded-xl lg:rounded-2xl overflow-hidden shadow-md border border-[#D4A574]/20 hover:shadow-xl transition-all flex flex-col md:flex-row cursor-pointer group"
            >
               <div className="h-48 md:h-auto md:w-2/5 lg:w-1/3 bg-slate-100 relative overflow-hidden flex-shrink-0">
                  <img 
                     src={`https://source.unsplash.com/400x300/?${item.image_keyword || 'health,beauty'}`} 
                     className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                     alt={item.title}
                  />
                  <div className="absolute top-2 left-2 bg-white/95 px-3 py-1 rounded-lg text-xs font-bold uppercase text-[#2D2416] shadow-sm">
                     {item.category}
                  </div>
               </div>
               <div className="p-4 md:p-6 md:w-3/5 lg:w-2/3 flex flex-col justify-center">
                  <h3 className="font-light text-base md:text-lg text-[#2D2416] mb-2 group-hover:text-[#D4A574] transition-colors">{item.title}</h3>
                  <p className="text-[#6B5D4F] text-sm font-light line-clamp-2 md:line-clamp-3">{item.summary}</p>
               </div>
            </a>
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
                {user ? <><T>Olá</T>, {user.full_name?.split(' ')[0]}</> : <><T>Bem-vindo ao</T> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4A574] to-[#B8935C] font-normal"><T>Clube da Beleza</T></span></>}
              </h1>

              <T as="p" className="text-xl lg:text-2xl text-[#6B5D4F] leading-relaxed font-light mb-10">
                A maior comunidade de skincare do planeta. Transforme sua rotina de autocuidado com ferramentas de IA, gestão inteligente, criação de conteúdo profissional e muito mais.
              </T>

              <div className="flex flex-wrap gap-4">
                {!user ? (
                  <>
                    <Button 
                      onClick={() => base44.auth.redirectToLogin()} 
                      className="bg-[#D4A574] hover:bg-[#C49565] text-white h-14 px-8 text-lg font-light shadow-xl rounded-2xl"
                    >
                      <T>Entrar / Cadastrar</T>
                    </Button>
                    <Button 
                      onClick={() => window.open('https://mapa-da-estetica.base44.app', '_blank')}
                      variant="outline"
                      className="border-2 border-[#D4A574]/40 text-[#B8935C] hover:bg-[#FFF9F0] h-14 px-8 text-lg font-light rounded-2xl"
                    >
                      <T>Já uso o Mapa da Estética</T>
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={() => setShowWizard(true)}
                    className="bg-[#D4A574] hover:bg-[#C49565] text-white h-14 px-8 text-lg font-light shadow-xl rounded-2xl"
                  >
                    <T>Começar Agora</T>
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-[#FEFBF7] p-8 rounded-3xl border border-[#D4A574]/20 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2">
                <div className="bg-gradient-to-br from-[#D4A574] to-[#C9A868] w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <T className="text-lg font-light text-[#2D2416] mb-2">Agendamento Inteligente</T>
                <T className="text-sm text-[#6B5D4F] leading-relaxed font-light">Gestão completa de consultas com IA</T>
              </div>

              <div className="bg-[#FEFBF7] p-8 rounded-3xl border border-[#D4A574]/20 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 mt-8">
                <div className="bg-gradient-to-br from-[#B8935C] to-[#A68350] w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <T className="text-lg font-light text-[#2D2416] mb-2">Chatbots 24/7</T>
                <T className="text-sm text-[#6B5D4F] leading-relaxed font-light">Atendimento automático</T>
              </div>

              <div className="bg-[#FEFBF7] p-8 rounded-3xl border border-[#D4A574]/20 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2">
                <div className="bg-gradient-to-br from-[#C9A868] to-[#B59758] w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <T as="p" className="text-lg font-light text-[#2D2416] mb-2">Sites Profissionais</T>
                <T as="p" className="text-sm text-[#6B5D4F] leading-relaxed font-light">Presença digital em minutos</T>
              </div>

              <div className="bg-[#FEFBF7] p-8 rounded-3xl border border-[#D4A574]/20 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 mt-8">
                <div className="bg-gradient-to-br from-[#D4A574] to-[#E0B480] w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Palette className="w-8 h-8 text-white" />
                </div>
                <T as="p" className="text-lg font-light text-[#2D2416] mb-2">Design com IA</T>
                <T as="p" className="text-sm text-[#6B5D4F] leading-relaxed font-light">Criação visual automatizada</T>
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
              <T as="h3" className="font-light text-[#2D2416] text-xl group-hover:text-[#D4A574] transition-colors">Próxima Consulta</T>
              <T as="p" className="text-[#6B5D4F] text-sm font-light mt-1">Em breve</T>
            </div>
          </div>

          <div className="bg-[#FEFBF7] hover:shadow-[0_20px_40px_-12px_rgba(212,165,116,0.2)] hover:-translate-y-1 transition-all duration-300 rounded-[1.5rem] p-8 cursor-pointer group border border-[#D4A574]/20 flex items-center gap-6">
            <div className="h-16 w-16 bg-[#FFF9F0] rounded-2xl flex items-center justify-center group-hover:bg-[#B8935C] transition-colors duration-300">
              <DollarSign className="text-[#B8935C] w-8 h-8 group-hover:text-white transition-colors" />
            </div>
            <div>
              <T as="h3" className="font-light text-[#2D2416] text-xl group-hover:text-[#B8935C] transition-colors">Meu Plano</T>
              <p className="text-[#6B5D4F] text-sm font-light mt-1">{user.profile?.plan || 'Free'}</p>
            </div>
          </div>

          <div className="bg-[#FEFBF7] hover:shadow-[0_20px_40px_-12px_rgba(212,165,116,0.2)] hover:-translate-y-1 transition-all duration-300 rounded-[1.5rem] p-8 cursor-pointer group border border-[#D4A574]/20 flex items-center gap-6">
            <div className="h-16 w-16 bg-[#FFF9F0] rounded-2xl flex items-center justify-center group-hover:bg-[#C9A868] transition-colors duration-300">
              <Sparkles className="text-[#C9A868] w-8 h-8 group-hover:text-white transition-colors" />
            </div>
            <div>
              <T as="h3" className="font-light text-[#2D2416] text-xl group-hover:text-[#C9A868] transition-colors">Ferramentas</T>
              <T as="p" className="text-[#6B5D4F] text-sm font-light mt-1">6 Disponíveis</T>
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
              <T>Tecnologia Humanizada</T>
            </div>
            <T as="h3" className="text-2xl lg:text-3xl font-light text-[#2D2416] mb-4">A Rede Credenciada</T>
            <T as="p" className="text-[#6B5D4F] font-light leading-relaxed">
              Clubdabeleza.com usa o melhor da transformação digital para o benefício das boas práticas na estética brasileira. O Clubdabeleza.com por essa razão tem uma plataforma digital que irá impulsionar seu consultório, clínica ou negócio sem você se distanciar de cada paciente.
            </T>
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
              <T>+ Compromisso</T>
            </div>
            <T as="h3" className="text-2xl lg:text-3xl font-light text-[#2D2416] mb-4">O Selo PREMIUM</T>
            <T as="p" className="text-[#6B5D4F] font-light leading-relaxed mb-4">
              O SELO PREMIUM do Clubdabeleza.com tem como missão destacar os especialistas quem melhor atendem. Somente especialista talentosos verificados e aplicados a submissão do SELO PREMIUM podem fazer parte.
            </T>
            <T as="p" className="text-[#6B5D4F] font-light leading-relaxed">
              Aqui segurança e eficácia é básico. Solicite mais informações de como ter o SELO PREMIUM Clubdabeleza.com na sua Clínica ou consultório.
            </T>
          </div>
        </div>

        {/* Mais Pacientes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-[#FEFBF7] rounded-3xl overflow-hidden border border-[#D4A574]/20 shadow-lg">
          <div className="p-8 lg:p-12">
            <div className="inline-block bg-[#E8E05C] text-[#2D2416] px-6 py-2 rounded-full font-light text-sm mb-6 uppercase tracking-wider">
              <T>+ Pacientes</T>
            </div>
            <T as="h3" className="text-2xl lg:text-3xl font-light text-[#2D2416] mb-4">Gerador de Ordem de Serviços</T>
            <T as="p" className="text-[#6B5D4F] font-light leading-relaxed">
              Gostaria de ter mais pacientes? Está procurando aumentar o número de procedimentos que realiza? O SELO EXCELÊNCIA do Clubdabeleza.com oferece para seu consultório o gerador de ordem de serviços. Uma ferramenta que aproxima pacientes qualificados. Destaque seus serviços e leva até você mais pedidos.
            </T>
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
              <T>Fidelize +</T>
            </div>
            <T as="h3" className="text-2xl lg:text-3xl font-light text-[#2D2416] mb-4">O Selo Clube+</T>
            <T as="p" className="text-[#6B5D4F] font-light leading-relaxed">
              Mantenha seus pacientes mais perto de você. O Selo Clube+ Clubdabeleza.com facilita em tudo o controle de seus pacientes mais fiéis e aproxima os pacientes novos em 98%.
            </T>
          </div>
        </div>
      </div>

      {/* Programa Spa da Pele */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-[#FEFBF7] rounded-3xl overflow-hidden border border-[#D4A574]/20 shadow-lg">
        <div className="p-8 lg:p-12">
          <div className="inline-block bg-[#E8E05C] text-[#2D2416] px-6 py-2 rounded-full font-light text-sm mb-6 uppercase tracking-wider">
            <T>Clube de Benefícios</T>
          </div>
          <T as="h3" className="text-2xl lg:text-3xl font-light text-[#2D2416] mb-4">Programa Spa da Pele</T>
          <T as="p" className="text-[#6B5D4F] font-light leading-relaxed mb-3">Um conjunto de tratamentos planejados para resultados reais. O Clube da Beleza é um clube de benefícios que facilita seu cuidado mês a mês.</T>
          <T as="p" className="text-[#6B5D4F] font-light leading-relaxed mb-6">Com o Beauty Pass você tem direito a banner e segmentação dentro da nossa rede, além de agendar pelo Mapa da Estética.</T>
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={() => sendWhatsAppMessage(user?.full_name || 'Visitante', 'Beauty Pass - Spa da Pele')}
              className="bg-[#D4A574] hover:bg-[#C49565] text-white"
            >
              <T>Solicitar Beauty Pass</T>
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.open('https://mapa-da-estetica.base44.app', '_blank')}
              className="border-2 border-[#D4A574]/40 text-[#B8935C] hover:bg-[#FFF9F0]"
            >
              <T>Agendar pelo Mapa da Estética</T>
            </Button>
          </div>
        </div>
        <div className="relative h-64 lg:h-96">
          <img 
            src="https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800&auto=format&fit=crop" 
            alt="Spa da Pele"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#FEFBF7] to-transparent"></div>
        </div>
      </div>

      {/* Explorar Procedimentos */}
      <div>
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-[#2D2416] mb-6 lg:mb-8 flex items-center gap-3 lg:gap-4">
          <div className="w-1.5 lg:w-2 h-6 lg:h-8 bg-[#D4A574] rounded-full"></div>
          <T>Explorar Procedimentos</T>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
          {[
            { title: "Skincare", img: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&q=60", url: 'https://www.google.com/search?q=tratamentos+skincare+faciais+est%C3%A9tica' },
            { title: "Laser", img: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=500&q=60", url: 'https://www.google.com/search?q=tratamentos+a+laser+est%C3%A9tica+depila%C3%A7%C3%A3o' },
            { title: "Harmonização", img: "https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=500&q=60", url: 'https://www.google.com/search?q=harmoniza%C3%A7%C3%A3o+facial+preenchimento+botox' },
            { title: "Nutrologia", img: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=500&q=60", url: 'https://www.google.com/search?q=nutrologia+est%C3%A9tica+sa%C3%BAde+emagrecimento' }
          ].map((cat, i) => (
            <a 
              key={i} 
              href={cat.url}
              target="_blank"
              rel="noopener noreferrer"
              className="relative h-40 md:h-48 lg:h-56 rounded-xl lg:rounded-2xl overflow-hidden cursor-pointer group transition-all duration-500 hover:shadow-2xl shadow-md block"
            >
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all z-10"></div>
              <div className="absolute bottom-3 md:bottom-4 left-3 md:left-4 text-base md:text-lg lg:text-xl font-bold text-white z-20 drop-shadow-md">{cat.title}</div>
              <img src={cat.img} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={cat.title} />
              <div className="absolute top-3 md:top-4 right-3 md:right-4 bg-white/20 backdrop-blur-md p-1.5 md:p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <ChevronRight className="text-white w-3 h-3 md:w-4 md:h-4" />
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* News Feed */}
      <div className="space-y-4 lg:space-y-6">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-[#2D2416] flex items-center gap-3 lg:gap-4">
          <div className="w-1.5 lg:w-2 h-6 lg:h-8 bg-[#D4A574] rounded-full"></div>
          <T>Notícias & Tendências</T>
        </h2>
        <PatientNewsFeed />
      </div>
    </div>
  );
}