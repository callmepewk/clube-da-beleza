import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar, Stethoscope, Bot, Globe, Palette, ShoppingBag, MapPin, Zap, Heart, Sparkles, ExternalLink, ArrowRight } from 'lucide-react';

export default function ToolsPage() {
  const internalTools = [
    {
      icon: Calendar,
      name: 'Agendamento Inteligente com IA',
      description: 'Sistema completo de gestão de consultas com inteligência artificial para otimizar sua agenda.',
      features: ['Sincronização com Google Calendar', 'Lembretes automáticos', 'Gestão de pacientes'],
      color: 'from-[#D4A574] to-[#C9A868]',
      link: '/schedule'
    },
    {
      icon: Stethoscope,
      name: 'Bia - Cuidadora Virtual',
      description: 'Assistente de saúde com IA disponível 24/7 para tirar dúvidas sobre procedimentos e cuidados.',
      features: ['Respostas instantâneas', 'Base de conhecimento médico', 'Orientações personalizadas'],
      color: 'from-[#B8935C] to-[#A68350]',
      link: '/nurse'
    },
    {
      icon: Bot,
      name: 'Criação de Chatbots',
      description: 'Crie chatbots personalizados para WhatsApp e Instagram para automatizar seu atendimento.',
      features: ['Integração WhatsApp/Instagram', 'Personalização completa', 'Respostas automatizadas'],
      color: 'from-[#C9A868] to-[#B59758]',
      link: '/chatbots'
    },
    {
      icon: Globe,
      name: 'Criação de Sites e Landing Pages',
      description: 'Gerador de sites profissionais com IA. Crie sua presença digital em minutos.',
      features: ['Templates profissionais', 'Geração com IA', 'Responsivo e otimizado'],
      color: 'from-[#D4A574] to-[#E0B480]',
      link: '/sites'
    },
    {
      icon: Palette,
      name: 'Design de Imagens e Textos',
      description: 'Crie designs profissionais para redes sociais, materiais de marketing e muito mais.',
      features: ['Múltiplos formatos', 'IA generativa', 'Editor de texto integrado'],
      color: 'from-[#B8935C] to-[#D4A574]',
      link: '/design'
    },
    {
      icon: ShoppingBag,
      name: 'Criação de Produtos Digitais',
      description: 'Desenvolva e venda ebooks, cursos e modelos 3D diretamente na plataforma.',
      features: ['E-books interativos', 'Cursos online', 'Modelos 3D'],
      color: 'from-[#C9A868] to-[#D4A574]',
      link: '/products'
    }
  ];

  const externalTools = [
    {
      icon: MapPin,
      name: 'Mapa da Estética',
      description: 'Encontre os melhores profissionais perto de você',
      details: 'A maior plataforma de busca e conexão com profissionais de estética e beleza do Brasil. Mais de 500 profissionais certificados em todo o país.',
      features: ['Busca por localização e especialidade', 'Perfis verificados de profissionais', 'Avaliações e depoimentos reais', 'Agendamento online facilitado', 'Dr. Beleza - Assistente com IA'],
      stats: [
        { value: '500+', label: 'Profissionais' },
        { value: '50+', label: 'Cidades' },
        { value: '12+', label: 'Estados' }
      ],
      url: 'https://mapa-da-estetica.base44.app',
      color: 'from-[#D4A574] to-[#C9A868]',
      badge: 'Disponível Agora',
      image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691e6fc102be2b10ba4e6392/9b6f558a9_image.png'
    },
    {
      icon: Zap,
      name: 'Laser Code Pro',
      description: 'Tecnologia de ponta para depilação a laser',
      details: 'Sistema profissional completo para gestão e otimização de tratamentos de depilação a laser, com protocolos personalizados e acompanhamento em tempo real.',
      features: ['Protocolos personalizados por tipo de pele', 'Gestão completa de clientes', 'Controle de sessões e resultados', 'Relatórios de progresso detalhados', 'Interface intuitiva e profissional'],
      stats: [
        { value: '100+', label: 'Clínicas' },
        { value: '10k+', label: 'Sessões' },
        { value: '98%', label: 'Satisfação' }
      ],
      url: 'https://laser-code-pro.base44.app',
      color: 'from-[#B8935C] to-[#A68350]',
      badge: 'Disponível Agora',
      image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691e6fc102be2b10ba4e6392/452ad56c8_image.png'
    },
    {
      icon: Heart,
      name: 'Dr. Spok PD',
      description: 'Sua saúde na palma da mão',
      details: 'Plataforma de telemedicina e gestão de saúde que conecta pacientes a profissionais qualificados, com prontuários digitais e acompanhamento personalizado.',
      features: ['Consultas online com especialistas', 'Prontuário eletrônico seguro', 'Receitas e prescrições digitais', 'Lembretes de medicamentos', 'Histórico médico completo'],
      stats: [
        { value: '200+', label: 'Médicos' },
        { value: '5k+', label: 'Consultas' },
        { value: '3k+', label: 'Usuários' }
      ],
      url: 'https://dr-spok-pd.base44.app',
      color: 'from-[#C9A868] to-[#B59758]',
      badge: 'Disponível Agora',
      image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691e6fc102be2b10ba4e6392/f9fbdc650_image.png'
    },
    {
      icon: Sparkles,
      name: 'Clube+',
      description: 'Clube Exclusivo de Benefícios',
      details: 'Este é o clube de benefícios exclusivo para quem ama o autocuidado e um planeta mais feliz! Acesse vantagens exclusivas, descontos e uma comunidade vibrante.',
      features: ['Descontos exclusivos em tratamentos', 'Programa de fidelidade', 'Eventos exclusivos para membros', 'Acesso antecipado a novidades', 'Comunidade de entusiastas'],
      stats: [
        { value: '500+', label: 'Associados' },
        { value: '100+', label: 'Parceiros' },
        { value: '98%', label: 'Satisfação' }
      ],
      url: 'https://clube-da-beleza.base44.app',
      color: 'from-[#D4A574] to-[#E0B480]',
      badge: 'Clube Exclusivo de Benefícios',
      image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691e6fc102be2b10ba4e6392/7ea4d15e3_image.png'
    },
    {
      icon: Stethoscope,
      name: 'Dr. Beleza',
      description: 'IA Especialista em Medicina Estética',
      details: 'Inteligência artificial avançada com conhecimento profundo sobre tratamentos, procedimentos, cirurgias, doenças e valores do mundo da medicina e medicina estética. Consultoria 24/7 com precisão e atualização constante.',
      features: ['Conhecimento completo sobre procedimentos', 'Informações sobre valores e custos', 'Orientações sobre tratamentos', 'Base de dados médica atualizada', 'Respostas instantâneas e precisas'],
      stats: [
        { value: '1000+', label: 'Procedimentos' },
        { value: '24/7', label: 'Disponível' },
        { value: '99%', label: 'Precisão' }
      ],
      url: 'https://dr-beleza-ai.base44.app',
      color: 'from-[#B8935C] to-[#D4A574]',
      badge: 'IA Especializada',
      image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691e6fc102be2b10ba4e6392/8a99916a6_image.png'
    },
    {
      icon: Sparkles,
      name: 'Eccellenza',
      description: 'Excelência em Gestão Estética',
      details: 'Plataforma completa de gestão para clínicas e profissionais de estética, com ferramentas avançadas para otimizar seu negócio e elevar seus resultados.',
      features: ['Gestão completa de clientes', 'Controle financeiro integrado', 'Agendamento inteligente', 'Relatórios e análises', 'Sistema de fidelização'],
      stats: [
        { value: '80+', label: 'Clínicas' },
        { value: '15k+', label: 'Agendamentos' },
        { value: '99%', label: 'Satisfação' }
      ],
      url: 'https://eccellenza.base44.app',
      color: 'from-[#D4A574] to-[#C9A868]',
      badge: 'Gestão Premium',
      image: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800&q=80'
    }
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <div className="relative h-96 rounded-[2rem] overflow-hidden shadow-2xl group bg-[#FEFBF7] border border-[#D4A574]/20">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-[0.08]"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#FEFBF7] via-[#FEFBF7]/90 to-[#FEFBF7]/20"></div>
        <div className="relative z-10 flex items-center justify-center h-full p-12">
          <div className="text-center max-w-3xl">
            <h1 className="text-6xl font-light tracking-tight text-[#2D2416] mb-6 leading-tight">
              Nossas <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4A574] to-[#B8935C] font-normal">Ferramentas</span>
            </h1>
            <p className="text-[#6B5D4F] text-2xl font-light leading-relaxed">
              Descubra todo o ecossistema de tecnologia e inovação do Clube da Beleza
            </p>
          </div>
        </div>
      </div>

      {/* Internal Tools Section */}
      <div>
        <div className="mb-10">
          <h2 className="text-4xl font-light text-[#2D2416] mb-4 flex items-center gap-4">
            <div className="w-2 h-10 bg-[#D4A574] rounded-full"></div>
            Ferramentas Integradas
          </h2>
          <p className="text-[#6B5D4F] text-lg font-light ml-6">
            Ferramentas poderosas incluídas na sua assinatura do Clube da Beleza
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {internalTools.map((tool, idx) => (
            <Card key={idx} className="bg-[#FEFBF7] border-[#D4A574]/20 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group cursor-pointer rounded-[1.5rem] overflow-hidden">
              <div className={`h-2 bg-gradient-to-r ${tool.color}`}></div>
              <CardHeader className="pb-4 pt-8 px-8">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <tool.icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-[#2D2416] text-xl font-light">{tool.name}</CardTitle>
                <CardDescription className="text-[#6B5D4F] font-light">{tool.description}</CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-8 space-y-4">
                <ul className="space-y-2">
                  {tool.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#6B5D4F] font-light">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#D4A574] mt-1.5 flex-shrink-0"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  onClick={() => window.location.href = tool.link}
                  className="w-full bg-gradient-to-r from-[#D4A574] to-[#C9A868] hover:from-[#C49565] hover:to-[#B8935C] text-white h-12 rounded-xl font-light shadow-lg group-hover:shadow-xl transition-all"
                >
                  Acessar Ferramenta <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* External Tools Section */}
      <div>
        <div className="mb-10">
          <h2 className="text-4xl font-light text-[#2D2416] mb-4 flex items-center gap-4">
            <div className="w-2 h-10 bg-[#D4A574] rounded-full"></div>
            Ferramentas Especializadas
          </h2>
          <p className="text-[#6B5D4F] text-lg font-light ml-6">
            Plataformas completas do Clube da Beleza para transformar sua prática profissional
          </p>
        </div>

        <div className="space-y-12">
          {externalTools.map((tool, idx) => (
            <div key={idx} className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-[#FEFBF7] rounded-[2rem] overflow-hidden border border-[#D4A574]/20 shadow-lg hover:shadow-2xl transition-all ${idx % 2 === 1 ? 'lg:grid-flow-dense' : ''}`}>
              {/* Image */}
              <div className={`relative h-96 lg:h-full ${idx % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                <img 
                  src={tool.image}
                  alt={tool.name}
                  className="w-full h-full object-contain object-center bg-white"
                />
                <div className={`absolute inset-0 bg-gradient-to-${idx % 2 === 1 ? 'l' : 'r'} from-[#FEFBF7] to-transparent opacity-50`}></div>
                
                {/* Floating Card */}
                <div className="absolute bottom-8 left-8 right-8 bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-[#D4A574]/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xl font-light text-[#2D2416] mb-1">{tool.name}</h4>
                      <p className="text-sm text-[#6B5D4F] font-light">{tool.badge}</p>
                    </div>
                    <div className="bg-[#FFF9F0] p-3 rounded-full">
                      <tool.icon className="w-6 h-6 text-[#D4A574]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className={`p-12 ${idx % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
                <div className={`inline-block bg-gradient-to-r ${tool.color} text-white px-4 py-2 rounded-full font-light text-sm mb-6 uppercase tracking-wider shadow-lg`}>
                  <tool.icon className="w-4 h-4 inline mr-2" />
                  {tool.badge}
                </div>
                
                <h3 className="text-3xl font-light text-[#2D2416] mb-3">{tool.name}</h3>
                <p className="text-[#B8935C] text-lg font-light mb-4">{tool.description}</p>
                <p className="text-[#6B5D4F] font-light leading-relaxed mb-6">{tool.details}</p>
                
                {/* Features */}
                <div className="space-y-2 mb-6">
                  {tool.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-[#FFF9F0] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-[#D4A574]"></div>
                      </div>
                      <span className="text-[#6B5D4F] font-light">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8 bg-[#FFF9F0] p-6 rounded-2xl border border-[#D4A574]/20">
                  {tool.stats.map((stat, i) => (
                    <div key={i} className="text-center">
                      <div className="text-3xl font-light text-[#D4A574] mb-1">{stat.value}</div>
                      <div className="text-xs text-[#6B5D4F] font-light uppercase tracking-wide">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={() => window.open(tool.url, '_blank')}
                  className={`w-full bg-gradient-to-r ${tool.color} hover:opacity-90 text-white h-14 rounded-xl font-light text-lg shadow-xl hover:shadow-2xl transition-all group`}
                >
                  Visitar Plataforma <ExternalLink className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-[#D4A574] to-[#C9A868] rounded-[2rem] p-12 text-white text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative z-10">
          <h3 className="text-4xl font-light mb-4">Pronto para transformar sua prática?</h3>
          <p className="text-white/90 text-lg font-light mb-8 max-w-2xl mx-auto">
            Junte-se a centenas de profissionais que já estão revolucionando a medicina estética com nossas ferramentas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-white text-[#D4A574] hover:bg-[#FFF9F0] h-14 px-8 text-lg font-light rounded-xl shadow-xl">
              Criar Conta Grátis
            </Button>
            <Button variant="outline" className="border-2 border-white text-white hover:bg-white/10 h-14 px-8 text-lg font-light rounded-xl">
              Falar com Vendas
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}