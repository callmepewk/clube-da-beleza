import React from 'react';
import { Heart, Users, Gift, Sparkles, Globe, HandHeart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SolidBeautyPage() {
  const impacts = [
    { number: '500+', label: 'Pessoas Beneficiadas' },
    { number: '50+', label: 'Parceiros Solidários' },
    { number: 'R$ 200k+', label: 'Em Procedimentos Doados' },
    { number: '15', label: 'Cidades Atendidas' }
  ];

  const howItWorks = [
    {
      icon: HandHeart,
      title: 'Profissionais Voluntários',
      description: 'Especialistas certificados doam seus serviços para quem mais precisa.'
    },
    {
      icon: Users,
      title: 'Seleção de Beneficiários',
      description: 'Pacientes em situação de vulnerabilidade são cuidadosamente selecionados.'
    },
    {
      icon: Gift,
      title: 'Procedimentos Gratuitos',
      description: 'Tratamentos estéticos e de saúde são oferecidos sem custo algum.'
    },
    {
      icon: Heart,
      title: 'Transformação de Vidas',
      description: 'Autoestima elevada, confiança restaurada e sorrisos renovados.'
    }
  ];

  const stories = [
    {
      name: 'Maria Silva',
      story: 'Recuperei minha autoestima após um tratamento de harmonização facial. Hoje me sinto mais confiante para buscar emprego.',
      procedure: 'Harmonização Facial',
      city: 'São Paulo - SP'
    },
    {
      name: 'João Santos',
      story: 'O tratamento a laser mudou minha vida. Finalmente consegui superar as marcas de acne que me incomodavam há anos.',
      procedure: 'Tratamento a Laser',
      city: 'Rio de Janeiro - RJ'
    },
    {
      name: 'Ana Costa',
      story: 'Ganhei muito mais do que um tratamento estético. Ganhei dignidade, cuidado e a chance de me sentir bonita novamente.',
      procedure: 'Skincare Completo',
      city: 'Belo Horizonte - MG'
    }
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <div className="relative h-[70vh] rounded-[2rem] overflow-hidden shadow-2xl">
        <img 
          src="https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=2000&auto=format&fit=crop"
          alt="Beleza Solidária"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#2D2416]/90 via-[#2D2416]/70 to-transparent"></div>
        <div className="relative z-10 flex flex-col justify-center h-full p-12 max-w-3xl">
          <div className="inline-block bg-[#E8E05C] text-[#2D2416] px-6 py-3 rounded-full font-light text-sm mb-6 uppercase tracking-wider w-fit">
            Projeto Social
          </div>
          <h1 className="text-6xl font-light tracking-tight text-white mb-6 leading-tight">
            Beleza <span className="font-normal text-[#E8E05C]">Solidária</span>
          </h1>
          <p className="text-white/90 text-2xl font-light leading-relaxed mb-8">
            Transformando vidas através da beleza, oferecendo tratamentos estéticos gratuitos para quem mais precisa.
          </p>
          <div className="flex gap-4">
            <Button 
              onClick={() => window.open(`https://wa.me/5531972595643?text=${encodeURIComponent('Olá! Gostaria de fazer uma doação para o projeto Beleza Solidária do Clube da Beleza.')}`, '_blank')}
              className="bg-[#D4A574] hover:bg-[#C49565] text-white h-14 px-8 text-lg font-light rounded-xl shadow-xl"
            >
              <Gift className="w-5 h-5 mr-2" />
              Fazer uma Doação
            </Button>
            <Button 
              onClick={() => window.open(`https://wa.me/5531972595643?text=${encodeURIComponent('Olá! Gostaria de ser voluntário(a) no projeto Beleza Solidária do Clube da Beleza.')}`, '_blank')}
              className="border-2 border-white bg-white/20 text-white hover:bg-white/30 h-14 px-8 text-lg font-light rounded-xl backdrop-blur-sm"
            >
              Seja Voluntário
            </Button>
          </div>
        </div>
      </div>

      {/* Mission */}
      <div className="max-w-4xl mx-auto text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D4A574] to-[#C9A868] flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Heart className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-4xl font-light text-[#2D2416]">Nossa Missão Social</h2>
        <p className="text-[#6B5D4F] font-light leading-relaxed text-lg">
          O Projeto Beleza Solidária nasceu da crença de que todos merecem se sentir bem consigo mesmos, independentemente de sua condição financeira. Através de parcerias com profissionais voluntários, marcas solidárias e doadores generosos, oferecemos procedimentos estéticos gratuitos que transformam não apenas a aparência, mas a vida de pessoas em situação de vulnerabilidade.
        </p>
        <p className="text-[#6B5D4F] font-light leading-relaxed text-lg">
          Acreditamos que a autoestima é um direito de todos e que pequenos gestos de cuidado podem gerar grandes transformações.
        </p>
      </div>

      {/* Impact Numbers */}
      <div className="bg-gradient-to-r from-[#D4A574] to-[#C9A868] rounded-[2rem] p-12 shadow-2xl">
        <h2 className="text-4xl font-light text-white text-center mb-10">Nosso Impacto</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {impacts.map((impact, idx) => (
            <div key={idx} className="text-center">
              <div className="text-5xl font-light text-white mb-2">{impact.number}</div>
              <div className="text-white/80 text-sm font-light uppercase tracking-wide">{impact.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How it Works */}
      <div>
        <h2 className="text-4xl font-light text-[#2D2416] mb-10 text-center">Como Funciona</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {howItWorks.map((step, idx) => (
            <div key={idx} className="bg-[#FEFBF7] rounded-[1.5rem] p-8 border border-[#D4A574]/20 text-center hover:shadow-xl hover:-translate-y-2 transition-all">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D4A574] to-[#C9A868] flex items-center justify-center mx-auto mb-6 shadow-lg">
                <step.icon className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-light text-[#D4A574] mb-3">{idx + 1}</div>
              <h3 className="text-xl font-light text-[#2D2416] mb-3">{step.title}</h3>
              <p className="text-[#6B5D4F] font-light text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Success Stories */}
      <div>
        <div className="text-center mb-10">
          <h2 className="text-4xl font-light text-[#2D2416] mb-4">Histórias de Transformação</h2>
          <p className="text-[#6B5D4F] font-light text-lg">Vidas reais transformadas pela solidariedade</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stories.map((story, idx) => (
            <div key={idx} className="bg-[#FEFBF7] rounded-[2rem] p-8 border border-[#D4A574]/20 hover:shadow-xl transition-all">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4A574] to-[#C9A868] flex items-center justify-center text-white font-light text-xl">
                  {story.name[0]}
                </div>
                <div>
                  <div className="font-light text-[#2D2416]">{story.name}</div>
                  <div className="text-xs text-[#6B5D4F] font-light">{story.city}</div>
                </div>
              </div>
              <p className="text-[#6B5D4F] font-light leading-relaxed italic mb-4">"{story.story}"</p>
              <div className="inline-block bg-[#FFF9F0] px-4 py-2 rounded-full text-xs text-[#D4A574] font-light border border-[#D4A574]/20">
                {story.procedure}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-[#FFF9F0] to-[#FFF5E6] rounded-[2rem] p-10 border border-[#D4A574]/20 text-center">
          <Gift className="w-12 h-12 text-[#D4A574] mx-auto mb-6" />
          <h3 className="text-3xl font-light text-[#2D2416] mb-4">Faça uma Doação</h3>
          <p className="text-[#6B5D4F] font-light leading-relaxed mb-6">
            Sua contribuição permite que mais pessoas tenham acesso a tratamentos que transformam vidas.
          </p>
          <Button 
            onClick={() => window.open(`https://wa.me/5531972595643?text=${encodeURIComponent('Olá! Gostaria de fazer uma doação para o projeto Beleza Solidária do Clube da Beleza.')}`, '_blank')}
            className="bg-gradient-to-r from-[#D4A574] to-[#C9A868] hover:from-[#C49565] hover:to-[#B8935C] text-white h-12 px-8 rounded-xl font-light"
          >
            Doar Agora
          </Button>
        </div>
        <div className="bg-gradient-to-br from-[#FFF9F0] to-[#FFF5E6] rounded-[2rem] p-10 border border-[#D4A574]/20 text-center">
          <HandHeart className="w-12 h-12 text-[#D4A574] mx-auto mb-6" />
          <h3 className="text-3xl font-light text-[#2D2416] mb-4">Seja Voluntário</h3>
          <p className="text-[#6B5D4F] font-light leading-relaxed mb-6">
            Profissionais certificados podem doar suas habilidades e fazer a diferença na vida de alguém.
          </p>
          <Button 
            onClick={() => window.open(`https://wa.me/5531972595643?text=${encodeURIComponent('Olá! Gostaria de ser voluntário(a) no projeto Beleza Solidária do Clube da Beleza.')}`, '_blank')}
            className="bg-gradient-to-r from-[#D4A574] to-[#C9A868] hover:from-[#C49565] hover:to-[#B8935C] text-white h-12 px-8 rounded-xl font-light"
          >
            Quero Ajudar
          </Button>
        </div>
      </div>
    </div>
  );
}