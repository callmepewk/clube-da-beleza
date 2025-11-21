import React from 'react';
import { Shield, Award, CheckCircle, Star, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import T from '@/components/TranslatedText';

export default function QualitySealPage() {
  const criteria = [
    {
      icon: Shield,
      title: 'Certificações Validadas',
      description: 'Verificação rigorosa de credenciais profissionais, registros e especializações.'
    },
    {
      icon: Users,
      title: 'Experiência Comprovada',
      description: 'Mínimo de 2 anos de atuação com histórico verificável de atendimentos.'
    },
    {
      icon: Star,
      title: 'Avaliação dos Pacientes',
      description: 'Média mínima de 4.5 estrelas baseada em feedbacks reais de pacientes.'
    },
    {
      icon: CheckCircle,
      title: 'Segurança e Ética',
      description: 'Compromisso com protocolos de segurança e uso de produtos certificados.'
    },
    {
      icon: Award,
      title: 'Educação Continuada',
      description: 'Participação em cursos de atualização e eventos científicos da área.'
    },
    {
      icon: TrendingUp,
      title: 'Resultados Consistentes',
      description: 'Portfólio de antes e depois demonstrando qualidade e naturalidade.'
    }
  ];

  const benefits = {
    professional: [
      'Destaque visual em todas as buscas',
      'Badge de qualidade no perfil',
      'Prioridade no ranking de busca',
      'Acesso a eventos exclusivos',
      'Material de marketing personalizado',
      'Suporte premium dedicado'
    ],
    patient: [
      'Garantia de profissionais verificados',
      'Atendimento de alta qualidade',
      'Protocolos de segurança rigorosos',
      'Transparência em procedimentos',
      'Canais diretos de comunicação',
      'Suporte em caso de intercorrências'
    ]
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <div className="relative h-[70vh] rounded-[2rem] overflow-hidden shadow-2xl bg-gradient-to-br from-[#D4A574] to-[#C9A868]">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2000')] bg-cover bg-center opacity-10"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full p-12 text-center text-white">
          <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-8 border-4 border-white/30 shadow-2xl">
            <Shield className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-6xl font-light tracking-tight mb-6 leading-tight max-w-4xl">
            <T>Selo de</T> <span className="font-normal text-[#E8E05C]"><T>Qualidade</T></span>
          </h1>
          <T as="p" className="text-2xl font-light leading-relaxed max-w-3xl opacity-95">
            A certificação premium que garante excelência, segurança e resultados extraordinários
          </T>
        </div>
      </div>

      {/* Introduction */}
      <div className="max-w-4xl mx-auto text-center space-y-6">
        <div className="inline-block bg-[#E8E05C] text-[#2D2416] px-6 py-3 rounded-full font-light text-sm mb-4 uppercase tracking-wider">
          <T>Certificação Premium</T>
        </div>
        <T as="h2" className="text-4xl font-light text-[#2D2416]">O Que é o Selo de Qualidade?</T>
        <T as="p" className="text-[#6B5D4F] font-light leading-relaxed text-lg">
          O Selo de Qualidade Clube da Beleza é a certificação mais rigorosa e respeitada da medicina estética brasileira. Concedido apenas aos profissionais que demonstram excelência técnica, compromisso ético e dedicação genuína ao bem-estar de seus pacientes.
        </T>
        <T as="p" className="text-[#6B5D4F] font-light leading-relaxed text-lg">
          Mais que um selo, é um compromisso público com a qualidade, transparência e resultados excepcionais.
        </T>
      </div>

      {/* Criteria */}
      <div>
        <T as="h2" className="text-4xl font-light text-[#2D2416] mb-10 text-center">Critérios de Certificação</T>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {criteria.map((criterion, idx) => (
            <div key={idx} className="bg-[#FEFBF7] rounded-[1.5rem] p-8 border border-[#D4A574]/20 hover:shadow-xl hover:-translate-y-2 transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4A574] to-[#C9A868] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <criterion.icon className="w-8 h-8 text-white" />
              </div>
              <T as="h3" className="text-xl font-light text-[#2D2416] mb-3">{criterion.title}</T>
              <T as="p" className="text-[#6B5D4F] font-light text-sm leading-relaxed">{criterion.description}</T>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* For Professionals */}
        <div className="bg-gradient-to-br from-[#D4A574] to-[#C9A868] rounded-[2rem] p-10 text-white shadow-xl">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-6 border-2 border-white/30">
            <Award className="w-8 h-8 text-white" />
          </div>
          <T as="h3" className="text-3xl font-light mb-6">Benefícios para Profissionais</T>
          <ul className="space-y-3">
            {benefits.professional.map((benefit, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 opacity-90" />
                <span className="font-light">{benefit}</span>
              </li>
            ))}
          </ul>
          <Button className="w-full mt-8 bg-white text-[#D4A574] hover:bg-[#FFF9F0] h-12 rounded-xl font-light">
            <T>Solicitar Certificação</T>
          </Button>
        </div>

        {/* For Patients */}
        <div className="bg-[#FEFBF7] rounded-[2rem] p-10 border border-[#D4A574]/20 shadow-lg">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D4A574] to-[#C9A868] flex items-center justify-center mb-6 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <T as="h3" className="text-3xl font-light text-[#2D2416] mb-6">Garantias para Pacientes</T>
          <ul className="space-y-3">
            {benefits.patient.map((benefit, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#D4A574] flex-shrink-0 mt-0.5" />
                <span className="text-[#6B5D4F] font-light">{benefit}</span>
              </li>
            ))}
          </ul>
          <Button className="w-full mt-8 bg-gradient-to-r from-[#D4A574] to-[#C9A868] hover:from-[#C49565] hover:to-[#B8935C] text-white h-12 rounded-xl font-light">
            <T>Buscar Certificados</T>
          </Button>
        </div>
      </div>

      {/* Certification Process */}
      <div className="bg-[#FEFBF7] rounded-[2rem] p-12 border border-[#D4A574]/20">
        <T as="h2" className="text-4xl font-light text-[#2D2416] mb-10 text-center">Processo de Certificação</T>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 max-w-6xl mx-auto">
          {[
            { num: '1', title: 'Inscrição', desc: 'Envio de documentação e portfólio' },
            { num: '2', title: 'Análise', desc: 'Verificação de credenciais e experiência' },
            { num: '3', title: 'Avaliação', desc: 'Revisão de feedbacks e resultados' },
            { num: '4', title: 'Entrevista', desc: 'Conversa com comitê técnico' },
            { num: '5', title: 'Certificação', desc: 'Concessão do Selo de Qualidade' }
          ].map((step, idx) => (
            <div key={idx} className="text-center relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D4A574] to-[#C9A868] flex items-center justify-center mx-auto mb-4 text-white text-2xl font-light shadow-lg">
                {step.num}
              </div>
              <h3 className="text-lg font-light text-[#2D2416] mb-2">{step.title}</h3>
              <p className="text-xs text-[#6B5D4F] font-light">{step.desc}</p>
              {idx < 4 && (
                <div className="hidden md:block absolute top-8 left-[calc(50%+2rem)] w-[calc(100%-2rem)] h-0.5 bg-[#D4A574]/30"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="bg-gradient-to-r from-[#D4A574] to-[#C9A868] rounded-[2rem] p-12 shadow-2xl">
        <T as="h2" className="text-4xl font-light text-white text-center mb-10">Impacto do Selo</T>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '200+', label: 'Profissionais Certificados' },
            { value: '98%', label: 'Satisfação dos Pacientes' },
            { value: '15k+', label: 'Procedimentos Realizados' },
            { value: '4.9/5', label: 'Avaliação Média' }
          ].map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className="text-5xl font-light text-white mb-2">{stat.value}</div>
              <div className="text-white/80 text-sm font-light uppercase tracking-wide">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[#FEFBF7] rounded-[2rem] p-12 border border-[#D4A574]/20 text-center">
        <Shield className="w-16 h-16 text-[#D4A574] mx-auto mb-6" />
        <T as="h3" className="text-4xl font-light text-[#2D2416] mb-4">Conquiste o Selo de Qualidade</T>
        <T as="p" className="text-[#6B5D4F] font-light text-lg mb-8 max-w-2xl mx-auto">
          Junte-se à elite dos profissionais de medicina estética e eleve sua carreira a um novo patamar de reconhecimento e confiança.
        </T>
        <Button className="bg-gradient-to-r from-[#D4A574] to-[#C9A868] hover:from-[#C49565] hover:to-[#B8935C] text-white h-14 px-8 text-lg font-light rounded-xl shadow-xl">
          <T>Iniciar Processo</T>
        </Button>
      </div>
    </div>
  );
}