import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Heart, Leaf, Star, Target, Eye, Coffee, Shield, Activity, Package, Award, Zap } from 'lucide-react';
import T from '@/components/TranslatedText';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Import section pages as components
import BeautyTeaPage from './BeautyTea';
import SkinCaretakersPage from './SkinCaretakers';
import SolidBeautyPage from './SolidBeauty';
import RightDosePage from './RightDose';
import BeautyBoxPage from './BeautyBox';
import QualitySealPage from './QualitySeal';
import OurMissionPage from './OurMission';
import ToolsPage from './Tools';
import ImageWithFallback from '@/components/common/ImageWithFallback';

const sections = [
  { id: 'about', label: 'Sobre Nós', icon: Heart },
  { id: 'mission', label: 'Nossa Missão', icon: Target },
  { id: 'tools', label: 'Nossas Ferramentas', icon: Zap },
  { id: 'beautytea', label: 'Chá da Beleza', icon: Coffee },
  { id: 'skincaretakers', label: 'Cuidadores da Pele', icon: Users },
  { id: 'solidbeauty', label: 'Beleza Solidária', icon: Heart },
  { id: 'rightdose', label: 'Dose Certa', icon: Activity },
  { id: 'beautybox', label: 'Beauty Box', icon: Package },
  { id: 'qualityseal', label: 'Selo de Qualidade', icon: Shield },
];

function AboutSection() {
  const queryClient = useQueryClient();
  const { data: nextEvent } = useQuery({
    queryKey: ['nextBeautyTea'],
    queryFn: async () => {
      const res = await base44.entities.BeautyTeaEvent.list({ limit: 50 });
      const events = res?.data || [];
      const upcoming = events
        .filter(e => e.status === 'active')
        .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
      return upcoming || null;
    }
  });
  const registerMutation = useMutation({
    mutationFn: async () => {
      if (!nextEvent) return;
      const newCount = (nextEvent.reserved_slots || 0) + 1;
      const max = nextEvent.total_slots || newCount;
      if (newCount > max) return;
      await base44.entities.BeautyTeaEvent.update(nextEvent.id, { reserved_slots: newCount });
    },
    onSuccess: () => queryClient.invalidateQueries(['nextBeautyTea'])
  });
  return (
    <div className="space-y-8 pb-10 text-[#2D2416]">
      {/* Hero Section */}
      <div className="relative h-[400px] rounded-[2rem] overflow-hidden shadow-2xl group bg-[#FEFBF7] border border-[#D4A574]/20">
        <div className="absolute inset-0 bg-[url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_68ca933db3f173d5b5ee5174/424de1767_clubeimg.jpeg')] bg-cover bg-center opacity-20"></div>
        <div className="relative z-10 flex flex-col justify-end h-full p-8 max-w-4xl">
           <T as="h1" className="text-5xl font-light tracking-tight text-[#2D2416] mb-4">Sobre o Clube da Beleza</T>
           <T as="p" className="text-[#6B5D4F] text-lg font-light leading-relaxed">
             O maior clube de benefícios exclusivo para quem ama o autocuidado e um planeta mais feliz.
             Democratizando o acesso a serviços de beleza e estética de qualidade no Brasil.
           </T>
           <div className="mt-6">
              <Button 
                onClick={() => window.open('https://clube-da-beleza.base44.app', '_blank')}
                className="bg-[#D4A574] hover:bg-[#C49565] text-white font-light px-8 py-6 rounded-xl text-lg shadow-lg"
                >
                <T>Conheça mais o nosso trabalho</T>
                </Button>
           </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {[
            { number: "500+", label: "Membros Ativos" },
            { number: "100+", label: "Parceiros Certificados" },
            { number: "50+", label: "Cidades Atendidas" },
            { number: "98%", label: "Satisfação" }
         ].map((stat, i) => (
            <Card key={i} className="bg-[#FEFBF7] border-[#D4A574]/20 text-center py-6 shadow-sm">
               <CardContent className="p-0">
                  <div className="text-3xl font-light text-[#D4A574]">{stat.number}</div>
                  <T className="text-sm text-[#6B5D4F] uppercase tracking-wider mt-1 font-light">{stat.label}</T>
               </CardContent>
            </Card>
         ))}
      </div>

      {/* History */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
         <div className="space-y-6">
            <div>
               <T as="h2" className="text-3xl font-light text-[#2D2416] mb-4">Nossa História</T>
               <T as="p" className="text-[#6B5D4F] leading-relaxed font-light">
                 O Clube da Beleza nasceu da visão de democratizar o acesso a serviços de beleza e estética de qualidade no Brasil.
                 Criamos uma plataforma inovadora que não apenas conecta clientes a profissionais certificados, mas também oferece benefícios exclusivos, descontos especiais e uma comunidade engajada em torno do bem-estar e da beleza sustentável.
               </T>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="bg-[#FEFBF7] p-6 rounded-xl border border-[#D4A574]/20 shadow-sm">
                  <Target className="w-8 h-8 text-[#D4A574] mb-3" />
                  <T as="h3" className="font-light text-[#2D2416] mb-2">Nossa Missão</T>
                  <T as="p" className="text-sm text-[#6B5D4F] font-light">
                    Democratizar o acesso a serviços de beleza e estética de qualidade, conectando pessoas a profissionais qualificados e comprometidos com a excelência.
                  </T>
               </div>
               <div className="bg-[#FEFBF7] p-6 rounded-xl border border-[#D4A574]/20 shadow-sm">
                  <Eye className="w-8 h-8 text-[#D4A574] mb-3" />
                  <T as="h3" className="font-light text-[#2D2416] mb-2">Nossa Visão</T>
                  <T as="p" className="text-sm text-[#6B5D4F] font-light">
                    Ser a maior e mais confiável rede de beleza e estética do Brasil, transformando a experiência de autocuidado em algo acessível e prazeroso.
                  </T>
               </div>
            </div>
         </div>
         <div className="relative h-full min-h-[300px] rounded-xl overflow-hidden border border-[#D4A574]/20 shadow-md">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=1200&q=60"
              alt="Beauty Salon"
              className="absolute inset-0 w-full h-full object-cover"
            />
         </div>
      </div>

      {/* Values */}
      <div>
         <T as="h2" className="text-3xl font-light text-[#2D2416] mb-6 text-center">Nossos Valores</T>
         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
               { icon: Heart, title: "Autocuidado", desc: "Acreditamos que cuidar de si mesmo é um ato de amor próprio essencial.", color: "text-[#D4A574]" },
               { icon: Leaf, title: "Sustentabilidade", desc: "Comprometidos com práticas sustentáveis e responsáveis.", color: "text-[#D4A574]" },
               { icon: Users, title: "Comunidade", desc: "Construímos uma rede forte de profissionais e clientes.", color: "text-[#D4A574]" },
               { icon: Star, title: "Excelência", desc: "Selecionamos apenas os melhores profissionais.", color: "text-[#D4A574]" }
            ].map((val, i) => (
               <Card key={i} className="bg-[#FEFBF7] border-[#D4A574]/20 hover:shadow-lg transition-all shadow-sm">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                     <val.icon className={`w-12 h-12 ${val.color} mb-4`} />
                     <T as="h3" className="font-light text-[#2D2416] text-lg mb-2">{val.title}</T>
                     <T as="p" className="text-sm text-[#6B5D4F] font-light">{val.desc}</T>
                  </CardContent>
               </Card>
            ))}
         </div>
      </div>

      {/* Nossa Abordagem */}
      <div className="bg-[#FEFBF7] border border-[#D4A574]/20 rounded-2xl p-6 shadow-sm">
        <T as="h2" className="text-3xl font-light text-[#2D2416] mb-6 text-center">Nossa Abordagem</T>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white/70 border-[#D4A574]/20">
            <CardContent className="p-6 text-center">
              <Heart className="w-8 h-8 text-[#D4A574] mx-auto mb-3" />
              <T as="h3" className="font-light text-[#2D2416] mb-1">Beauty Lovers</T>
              <T as="p" className="text-sm text-[#6B5D4F] font-light">Clientes que amam autocuidado e aproveitam os benefícios exclusivos do clube.</T>
            </CardContent>
          </Card>
          <Card className="bg-white/70 border-[#D4A574]/20">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-[#D4A574] mx-auto mb-3" />
              <T as="h3" className="font-light text-[#2D2416] mb-1">Beauty Doctors</T>
              <T as="p" className="text-sm text-[#6B5D4F] font-light">Profissionais de estética e saúde da pele com foco em excelência e segurança.</T>
            </CardContent>
          </Card>
          <Card className="bg-white/70 border-[#D4A574]/20">
            <CardContent className="p-6 text-center">
              <Award className="w-8 h-8 text-[#D4A574] mx-auto mb-3" />
              <T as="h3" className="font-light text-[#2D2416] mb-1">Beauty Brands</T>
              <T as="p" className="text-sm text-[#6B5D4F] font-light">Marcas parceiras do Clube da Beleza conectadas ao público certo.</T>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Beauty Safe - Seguro de Proteção Civil */}
      <div className="bg-[#FEFBF7] border border-[#D4A574]/20 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-6 h-6 text-[#D4A574]" />
              <T as="h3" className="text-2xl font-light text-[#2D2416]">Beauty Safe — Seguro de Proteção Civil</T>
            </div>
            <T as="p" className="text-[#6B5D4F] font-light text-sm">
              Tranquilidade para quem cuida da beleza: cobertura de responsabilidade civil para profissionais credenciados.
            </T>
            <ul className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-[#6B5D4F] font-light">
              <li className="flex items-start gap-2"><span className="mt-1 w-2 h-2 rounded-full bg-[#D4A574]"></span><T>Cobertura para eventos involuntários durante procedimentos</T></li>
              <li className="flex items-start gap-2"><span className="mt-1 w-2 h-2 rounded-full bg-[#D4A574]"></span><T>Assistência jurídica básica</T></li>
              <li className="flex items-start gap-2"><span className="mt-1 w-2 h-2 rounded-full bg-[#D4A574]"></span><T>Adesão simples e 100% digital</T></li>
              <li className="flex items-start gap-2"><span className="mt-1 w-2 h-2 rounded-full bg-[#D4A574]"></span><T>Condições especiais para membros do Clube</T></li>
            </ul>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={() => (window.location.href = '/plans')} className="bg-[#D4A574] hover:bg-[#C49565] text-white font-light rounded-xl">
              <T>Sou Profissional</T>
            </Button>
            <Button onClick={() => (window.location.href = '/support')} variant="outline" className="border-[#D4A574]/40 text-[#2D2416] hover:bg-[#FFF9F0] font-light rounded-xl">
              <T>Quero saber mais</T>
            </Button>
          </div>
        </div>
      </div>

      {/* Próximo Chá da Beleza - Inscrição Pública */}
      {nextEvent && (
        <div className="bg-[#FEFBF7] border border-[#D4A574]/20 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <T as="h3" className="text-2xl font-light text-[#2D2416] mb-1">Próximo Chá da Beleza</T>
              <p className="text-[#6B5D4F] font-light text-sm">
                {nextEvent.name} • {nextEvent.location} • {nextEvent.date} às {nextEvent.time}
              </p>
              <p className="text-[#B8935C] text-sm font-light mt-1">
                Participantes: <span className="font-bold">{nextEvent.reserved_slots || 0}</span> / {nextEvent.total_slots}
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => registerMutation.mutate()} 
                disabled={(nextEvent.reserved_slots || 0) >= (nextEvent.total_slots || Infinity) || registerMutation.isPending}
                className="bg-[#D4A574] hover:bg-[#C49565] text-white"
              >
                Participar Gratuitamente
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AboutPage() {
  const [activeSection, setActiveSection] = useState('about');

  const renderSection = () => {
    switch (activeSection) {
      case 'about': return <AboutSection />;
      case 'mission': return <OurMissionPage />;
      case 'tools': return <ToolsPage />;
      case 'beautytea': return <BeautyTeaPage />;
      case 'skincaretakers': return <SkinCaretakersPage />;
      case 'solidbeauty': return <SolidBeautyPage />;
      case 'rightdose': return <RightDosePage />;
      case 'beautybox': return <BeautyBoxPage />;
      case 'qualityseal': return <QualitySealPage />;
      default: return <AboutSection />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Selector */}
      <div className="sticky top-0 z-30 bg-[#F5F1E8]/95 backdrop-blur-md py-3 -mx-4 px-4 lg:-mx-12 lg:px-12 border-b border-[#D4A574]/20">
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {sections.map((section) => {
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg font-light text-xs sm:text-sm whitespace-nowrap transition-all duration-300 ${
                  isActive 
                    ? 'bg-[#D4A574] text-white shadow' 
                    : 'bg-[#FEFBF7] text-[#6B5D4F] hover:bg-[#FFF9F0] border border-[#D4A574]/20'
                }`}
              >
                <section.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#D4A574]'}`} />
                <T>{section.label}</T>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section Content */}
      <div className="animate-in fade-in duration-300">
        {renderSection()}
      </div>
    </div>
  );
}