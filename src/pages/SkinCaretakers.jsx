import React from 'react';
import { Shield, Heart, Star, Award, Users, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SkinCaretakersPage() {
  const caretakerLevels = [
    {
      level: 'Bronze',
      icon: Award,
      color: 'from-[#CD7F32] to-[#B8722D]',
      requirements: ['Mínimo 6 meses de experiência', '20+ clientes atendidos', 'Avaliação média 4.0+'],
      benefits: ['Perfil destacado na plataforma', 'Acesso a treinamentos básicos', 'Suporte prioritário']
    },
    {
      level: 'Prata',
      icon: Star,
      color: 'from-[#C0C0C0] to-[#A8A8A8]',
      requirements: ['Mínimo 1 ano de experiência', '50+ clientes atendidos', 'Avaliação média 4.5+'],
      benefits: ['Tudo do Bronze', 'Acesso a eventos exclusivos', 'Descontos em produtos parceiros', 'Badge de qualidade']
    },
    {
      level: 'Ouro',
      icon: Sparkles,
      color: 'from-[#D4A574] to-[#C9A868]',
      requirements: ['Mínimo 2 anos de experiência', '100+ clientes atendidos', 'Avaliação média 4.8+', 'Certificações especializadas'],
      benefits: ['Tudo do Prata', 'Destaque premium na busca', 'Participação no programa de embaixadores', 'Comissões diferenciadas']
    }
  ];

  const qualities = [
    {
      icon: Shield,
      title: 'Certificação Rigorosa',
      description: 'Processo de validação completo de credenciais, experiência e formação profissional.'
    },
    {
      icon: Heart,
      title: 'Cuidado Humanizado',
      description: 'Profissionais treinados não apenas tecnicamente, mas também no atendimento empático.'
    },
    {
      icon: Users,
      title: 'Comunidade Forte',
      description: 'Rede de apoio entre profissionais para troca de conhecimentos e melhores práticas.'
    },
    {
      icon: Star,
      title: 'Avaliação Contínua',
      description: 'Sistema transparente de feedback de pacientes para garantir qualidade constante.'
    }
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <div className="relative h-[70vh] rounded-[2rem] overflow-hidden shadow-2xl">
        <img 
          src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=2000&auto=format&fit=crop"
          alt="Cuidadores da Pele"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2D2416] via-[#2D2416]/60 to-transparent"></div>
        <div className="relative z-10 flex flex-col justify-end h-full p-12 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-block bg-[#D4A574] text-white px-6 py-3 rounded-full font-light text-sm mb-6 uppercase tracking-wider">
              Programa de Certificação
            </div>
            <h1 className="text-6xl font-light tracking-tight text-white mb-6 leading-tight">
              Cuidadores da <span className="font-normal text-[#E8E05C]">Pele</span>
            </h1>
            <p className="text-white/90 text-2xl font-light leading-relaxed">
              Profissionais certificados que transformam o cuidado com a pele em arte e ciência
            </p>
          </div>
        </div>
      </div>

      {/* Introduction */}
      <div className="max-w-4xl mx-auto text-center space-y-6">
        <h2 className="text-4xl font-light text-[#2D2416]">Excelência em Cada Tratamento</h2>
        <p className="text-[#6B5D4F] font-light leading-relaxed text-lg">
          O programa Cuidadores da Pele é a certificação premium do Clube da Beleza, que reconhece e valoriza profissionais que demonstram excelência técnica, comprometimento ético e paixão genuína pelo cuidado com a pele dos seus pacientes.
        </p>
        <p className="text-[#6B5D4F] font-light leading-relaxed text-lg">
          Mais que uma certificação, é um selo de confiança que garante aos pacientes que estão sendo atendidos pelos melhores profissionais do mercado.
        </p>
      </div>

      {/* Qualities */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {qualities.map((quality, idx) => (
          <div key={idx} className="bg-[#FEFBF7] rounded-[1.5rem] p-8 border border-[#D4A574]/20 text-center hover:shadow-xl hover:-translate-y-2 transition-all">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D4A574] to-[#C9A868] flex items-center justify-center mx-auto mb-6 shadow-lg">
              <quality.icon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-light text-[#2D2416] mb-3">{quality.title}</h3>
            <p className="text-[#6B5D4F] font-light text-sm leading-relaxed">{quality.description}</p>
          </div>
        ))}
      </div>

      {/* Certification Levels */}
      <div>
        <div className="text-center mb-10">
          <h2 className="text-4xl font-light text-[#2D2416] mb-4">Níveis de Certificação</h2>
          <p className="text-[#6B5D4F] font-light text-lg">Evolua sua carreira através do nosso programa de excelência</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {caretakerLevels.map((level, idx) => (
            <div key={idx} className="bg-[#FEFBF7] rounded-[2rem] border border-[#D4A574]/20 overflow-hidden hover:shadow-2xl transition-all group">
              <div className={`bg-gradient-to-r ${level.color} p-8 text-white text-center`}>
                <level.icon className="w-12 h-12 mx-auto mb-4 opacity-90" />
                <h3 className="text-3xl font-light mb-2">{level.level}</h3>
              </div>
              <div className="p-8 space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-[#2D2416] uppercase tracking-wide mb-3">Requisitos</h4>
                  <ul className="space-y-2">
                    {level.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[#6B5D4F] font-light">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#D4A574] mt-1.5 flex-shrink-0"></div>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#2D2416] uppercase tracking-wide mb-3">Benefícios</h4>
                  <ul className="space-y-2">
                    {level.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[#6B5D4F] font-light">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#D4A574] mt-1.5 flex-shrink-0"></div>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA for Professionals */}
      <div className="bg-gradient-to-r from-[#D4A574] to-[#C9A868] rounded-[2rem] p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-4xl font-light mb-4">Torne-se um Cuidador da Pele</h3>
            <p className="text-white/90 text-lg font-light mb-6">
              Junte-se à elite dos profissionais de estética do Brasil. Obtenha sua certificação e destaque-se no mercado.
            </p>
            <Button 
              onClick={() => window.open(`https://wa.me/5531972595643?text=${encodeURIComponent('Olá! Sou profissional e gostaria de solicitar a certificação para o programa Cuidadores da Pele do Clube da Beleza.')}`, '_blank')}
              className="bg-white text-[#D4A574] hover:bg-[#FFF9F0] h-14 px-8 text-lg font-light rounded-xl shadow-xl"
            >
              Solicitar Certificação
            </Button>
          </div>
          <div className="flex justify-center">
            <div className="w-48 h-48 rounded-full bg-white/20 backdrop-blur-md border-4 border-white/30 flex items-center justify-center">
              <Shield className="w-24 h-24 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* For Patients */}
      <div className="bg-[#FEFBF7] rounded-[2rem] p-12 border border-[#D4A574]/20 text-center">
        <h3 className="text-3xl font-light text-[#2D2416] mb-4">Busca por um Cuidador Certificado?</h3>
        <p className="text-[#6B5D4F] font-light text-lg mb-8 max-w-2xl mx-auto">
          Encontre profissionais certificados perto de você e tenha a garantia de estar em mãos de especialistas comprometidos com sua satisfação.
        </p>
        <Button 
          onClick={() => window.open('https://mapa-da-estetica.base44.app', '_blank')}
          className="bg-gradient-to-r from-[#D4A574] to-[#C9A868] hover:from-[#C49565] hover:to-[#B8935C] text-white h-14 px-8 text-lg font-light rounded-xl shadow-xl"
        >
          Buscar Profissionais
        </Button>
      </div>
    </div>
  );
}