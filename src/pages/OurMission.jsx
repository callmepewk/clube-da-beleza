import React from 'react';
import { Heart, Users, Sparkles, Globe, Shield, Target } from 'lucide-react';

export default function OurMissionPage() {
  const principles = [
    {
      icon: Heart,
      title: 'Bem-Estar Acessível',
      description: 'Democratizar o acesso a tratamentos de qualidade, tornando a beleza e o bem-estar acessíveis a todos.',
      color: 'from-[#D4A574] to-[#C9A868]'
    },
    {
      icon: Users,
      title: 'Comunidade Forte',
      description: 'Conectar profissionais, pacientes e marcas em um ecossistema colaborativo de conhecimento e crescimento.',
      color: 'from-[#B8935C] to-[#A68350]'
    },
    {
      icon: Sparkles,
      title: 'Excelência e Inovação',
      description: 'Unir tecnologia de ponta com práticas humanizadas, sempre priorizando qualidade e segurança.',
      color: 'from-[#C9A868] to-[#B59758]'
    },
    {
      icon: Globe,
      title: 'Sustentabilidade',
      description: 'Promover práticas conscientes que respeitem o meio ambiente e contribuam para um planeta mais saudável.',
      color: 'from-[#D4A574] to-[#E0B480]'
    },
    {
      icon: Shield,
      title: 'Segurança e Ética',
      description: 'Garantir transparência, segurança e ética em todos os procedimentos e relações dentro da nossa rede.',
      color: 'from-[#B8935C] to-[#D4A574]'
    },
    {
      icon: Target,
      title: 'Educação Contínua',
      description: 'Capacitar profissionais e educar pacientes com conteúdo de qualidade e baseado em evidências científicas.',
      color: 'from-[#C9A868] to-[#D4A574]'
    }
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <div className="relative min-h-[60vh] rounded-[2rem] overflow-hidden shadow-2xl bg-gradient-to-br from-[#D4A574] to-[#B8935C] text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2000')] bg-cover bg-center opacity-10"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full p-12 text-center">
          <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-8 border-4 border-white/30">
            <Heart className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-6xl font-light tracking-tight mb-6 leading-tight max-w-4xl">
            Nossa <span className="font-normal">Missão</span>
          </h1>
          <p className="text-2xl font-light leading-relaxed max-w-3xl opacity-95">
            Transformar a medicina estética brasileira através da tecnologia, democratizando o acesso a tratamentos de qualidade e conectando pessoas em uma comunidade de bem-estar.
          </p>
        </div>
      </div>

      {/* Manifesto */}
      <div className="bg-[#FEFBF7] rounded-[2rem] p-12 border border-[#D4A574]/20 shadow-lg">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-block bg-[#E8E05C] text-[#2D2416] px-6 py-3 rounded-full font-light text-sm mb-4 uppercase tracking-wider">
            Nosso Manifesto
          </div>
          <h2 className="text-4xl font-light text-[#2D2416] mb-6">Os Princípios do Clube da Beleza</h2>
          <p className="text-lg text-[#6B5D4F] font-light leading-relaxed">
            Acreditamos que a beleza e o bem-estar são direitos de todos. Nascemos com a missão de revolucionar o setor de medicina estética no Brasil, criando uma ponte entre a tecnologia mais avançada e o cuidado humanizado. Somos mais que uma plataforma - somos um movimento de transformação, comprometido com a excelência, a ética e a sustentabilidade.
          </p>
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-[#D4A574] to-transparent mx-auto mt-8"></div>
        </div>
      </div>

      {/* Principles Grid */}
      <div>
        <h2 className="text-4xl font-light text-[#2D2416] mb-10 text-center">Nossos Pilares</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {principles.map((principle, idx) => (
            <div key={idx} className="bg-[#FEFBF7] rounded-[1.5rem] border border-[#D4A574]/20 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
              <div className={`h-2 bg-gradient-to-r ${principle.color}`}></div>
              <div className="p-8 space-y-4">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${principle.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <principle.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-light text-[#2D2416]">{principle.title}</h3>
                <p className="text-[#6B5D4F] font-light leading-relaxed">{principle.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vision Statement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-[#FFF9F0] to-[#FFF5E6] rounded-[2rem] p-10 border border-[#D4A574]/20">
          <h3 className="text-3xl font-light text-[#2D2416] mb-4">Visão</h3>
          <p className="text-[#6B5D4F] font-light leading-relaxed text-lg">
            Ser a maior e mais confiável rede de medicina estética do Brasil, reconhecida pela excelência, inovação e compromisso com o bem-estar de milhões de brasileiros.
          </p>
        </div>
        <div className="bg-gradient-to-br from-[#FFF9F0] to-[#FFF5E6] rounded-[2rem] p-10 border border-[#D4A574]/20">
          <h3 className="text-3xl font-light text-[#2D2416] mb-4">Valores</h3>
          <p className="text-[#6B5D4F] font-light leading-relaxed text-lg">
            Integridade, transparência, respeito, inclusão e paixão por transformar vidas através da tecnologia e do cuidado humanizado.
          </p>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-[#D4A574] to-[#C9A868] rounded-[2rem] p-12 text-white text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative z-10">
          <h3 className="text-4xl font-light mb-4">Faça Parte Desta Revolução</h3>
          <p className="text-white/90 text-lg font-light mb-8 max-w-2xl mx-auto">
            Junte-se a nós nesta jornada de transformação. Seja você profissional ou paciente, há um lugar especial para você no Clube da Beleza.
          </p>
        </div>
      </div>
    </div>
  );
}