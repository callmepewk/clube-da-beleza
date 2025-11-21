import React from 'react';
import { Crown, Gift, Star, Zap, Calendar, Percent, Users, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ClubePlusPage() {
  const benefits = [
    {
      icon: Percent,
      title: 'Descontos Exclusivos',
      description: 'De 10% a 40% de desconto em procedimentos e produtos de parceiros premium.'
    },
    {
      icon: Gift,
      title: 'Programa de Pontos',
      description: 'Acumule pontos a cada procedimento e troque por tratamentos gratuitos.'
    },
    {
      icon: Calendar,
      title: 'Prioridade em Agendamentos',
      description: 'Agende consultas com prioridade e acesso antecipado a novos profissionais.'
    },
    {
      icon: Sparkles,
      title: 'Eventos Exclusivos',
      description: 'Convites VIP para lançamentos, workshops e eventos do Clube da Beleza.'
    },
    {
      icon: Zap,
      title: 'Conteúdo Premium',
      description: 'Acesso a masterclasses, tutoriais e conteúdos exclusivos sobre beleza.'
    },
    {
      icon: Users,
      title: 'Comunidade VIP',
      description: 'Grupo exclusivo de membros para networking e troca de experiências.'
    }
  ];

  const plans = [
    {
      name: 'Clube+ Essencial',
      price: 'R$ 49,90',
      period: '/mês',
      color: 'from-[#B8935C] to-[#A68350]',
      features: [
        '10% de desconto em todos os procedimentos',
        '100 pontos de boas-vindas',
        'Acesso a eventos selecionados',
        'Conteúdo premium básico',
        'Prioridade em agendamentos'
      ]
    },
    {
      name: 'Clube+ Premium',
      price: 'R$ 99,90',
      period: '/mês',
      color: 'from-[#D4A574] to-[#C9A868]',
      popular: true,
      features: [
        'Tudo do Essencial',
        '20% de desconto em procedimentos',
        '300 pontos de boas-vindas',
        'Acesso a todos os eventos',
        'Conteúdo premium completo',
        '1 consulta gratuita por trimestre',
        'Beauty Box com desconto'
      ]
    },
    {
      name: 'Clube+ Black',
      price: 'R$ 199,90',
      period: '/mês',
      color: 'from-[#2D2416] to-[#1a1410]',
      features: [
        'Tudo do Premium',
        '40% de desconto em procedimentos',
        '1000 pontos de boas-vindas',
        'Concierge pessoal de beleza',
        'Acesso ilimitado a eventos VIP',
        '1 procedimento gratuito por mês',
        'Beauty Box premium grátis',
        'Consultoria trimestral com especialista'
      ]
    }
  ];

  const partners = [
    'Clínica Essence', 'Derma Center', 'Beleza Natural Spa', 'Laser Clinic Pro',
    'Harmonia Estética', 'Face Plus', 'Wellness Center', 'Beauty Lab'
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <div className="relative h-[70vh] rounded-[2rem] overflow-hidden shadow-2xl bg-gradient-to-br from-[#D4A574] via-[#C9A868] to-[#B8935C]">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=2000')] bg-cover bg-center opacity-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full p-12 text-center text-white">
          <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-8 border-4 border-white/30 shadow-2xl">
            <Crown className="w-16 h-16 text-[#E8E05C]" />
          </div>
          <h1 className="text-7xl font-light tracking-tight mb-6 leading-tight">
            Clube<span className="font-normal text-[#E8E05C]">+</span>
          </h1>
          <p className="text-2xl font-light leading-relaxed max-w-3xl opacity-95 mb-8">
            O clube de benefícios exclusivo para quem ama autocuidado e um planeta mais feliz
          </p>
          <Button className="bg-white text-[#D4A574] hover:bg-[#FFF9F0] h-14 px-8 text-lg font-light rounded-xl shadow-xl">
            <Crown className="w-5 h-5 mr-2" />
            Tornar-se Membro
          </Button>
        </div>
      </div>

      {/* Introduction */}
      <div className="max-w-4xl mx-auto text-center space-y-6">
        <h2 className="text-4xl font-light text-[#2D2416]">Mais Que um Clube, uma Comunidade</h2>
        <p className="text-[#6B5D4F] font-light leading-relaxed text-lg">
          O Clube+ é a experiência premium do Clube da Beleza. Criado para quem valoriza o autocuidado e busca os melhores tratamentos, produtos e experiências no universo da beleza e bem-estar.
        </p>
        <p className="text-[#6B5D4F] font-light leading-relaxed text-lg">
          Membros do Clube+ têm acesso a descontos incríveis, eventos exclusivos, conteúdos premium e uma comunidade vibrante de pessoas que compartilham a mesma paixão pelo cuidado pessoal.
        </p>
      </div>

      {/* Benefits */}
      <div>
        <h2 className="text-4xl font-light text-[#2D2416] mb-10 text-center">Benefícios Exclusivos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, idx) => (
            <div key={idx} className="bg-[#FEFBF7] rounded-[1.5rem] p-8 border border-[#D4A574]/20 hover:shadow-xl hover:-translate-y-2 transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4A574] to-[#C9A868] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <benefit.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-light text-[#2D2416] mb-3">{benefit.title}</h3>
              <p className="text-[#6B5D4F] font-light text-sm leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Plans */}
      <div>
        <div className="text-center mb-10">
          <h2 className="text-4xl font-light text-[#2D2416] mb-4">Escolha Seu Plano</h2>
          <p className="text-[#6B5D4F] font-light text-lg">Desfrute dos melhores benefícios de acordo com suas necessidades</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <div key={idx} className={`bg-[#FEFBF7] rounded-[2rem] border-2 ${plan.popular ? 'border-[#D4A574] shadow-2xl scale-105' : 'border-[#D4A574]/20'} overflow-hidden hover:shadow-2xl transition-all relative`}>
              {plan.popular && (
                <div className="absolute top-4 right-4 bg-[#E8E05C] text-[#2D2416] px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider z-10">
                  Mais Escolhido
                </div>
              )}
              <div className={`bg-gradient-to-r ${plan.color} p-8 text-white text-center`}>
                <Crown className="w-12 h-12 mx-auto mb-4 opacity-90" />
                <h3 className="text-3xl font-light mb-2">{plan.name}</h3>
                <div className="text-5xl font-light mb-1">{plan.price}</div>
                <div className="text-sm opacity-80">{plan.period}</div>
              </div>
              <div className="p-8 space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Star className="w-5 h-5 text-[#D4A574] flex-shrink-0 mt-0.5" />
                      <span className="text-[#6B5D4F] font-light text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className={`w-full bg-gradient-to-r ${plan.color} hover:opacity-90 text-white h-12 rounded-xl font-light mt-6`}>
                  Assinar {plan.name.split(' ')[1]}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Partners */}
      <div className="bg-[#FEFBF7] rounded-[2rem] p-12 border border-[#D4A574]/20">
        <h2 className="text-4xl font-light text-[#2D2416] mb-4 text-center">Parceiros Premium</h2>
        <p className="text-center text-[#6B5D4F] font-light mb-10">Descontos exclusivos em mais de 100 estabelecimentos parceiros</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {partners.map((partner, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl border border-[#D4A574]/20 text-center hover:shadow-md transition-all">
              <div className="text-[#2D2416] font-light">{partner}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-[#D4A574] to-[#C9A868] rounded-[2rem] p-12 text-white text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative z-10">
          <Crown className="w-16 h-16 mx-auto mb-6 text-[#E8E05C]" />
          <h3 className="text-4xl font-light mb-4">Faça Parte do Clube+</h3>
          <p className="text-white/90 text-lg font-light mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de membros que já transformaram sua rotina de autocuidado
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-white text-[#D4A574] hover:bg-[#FFF9F0] h-14 px-8 text-lg font-light rounded-xl shadow-xl">
              Começar Agora
            </Button>
            <Button variant="outline" className="border-2 border-white text-white hover:bg-white/10 h-14 px-8 text-lg font-light rounded-xl backdrop-blur-sm">
              Conhecer Benefícios
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}