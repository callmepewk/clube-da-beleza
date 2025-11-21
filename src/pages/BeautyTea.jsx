import React from 'react';
import { Coffee, Heart, Users, Sparkles, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BeautyTeaPage() {
  const benefits = [
    'Networking com profissionais da área',
    'Troca de experiências e conhecimentos',
    'Discussões sobre tendências do mercado',
    'Ambiente acolhedor e inspirador',
    'Degustação de chás especiais',
    'Sorteios e brindes exclusivos'
  ];

  const upcomingEvents = [
    {
      date: '15 Dez',
      title: 'Chá da Beleza - Edição Verão',
      location: 'São Paulo - SP',
      spots: 20
    },
    {
      date: '22 Jan',
      title: 'Chá da Beleza - Tendências 2025',
      location: 'Rio de Janeiro - RJ',
      spots: 25
    },
    {
      date: '10 Fev',
      title: 'Chá da Beleza - Networking',
      location: 'Belo Horizonte - MG',
      spots: 15
    }
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <div className="relative h-[70vh] rounded-[2rem] overflow-hidden shadow-2xl">
        <img 
          src="https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=2000&auto=format&fit=crop"
          alt="Chá da Beleza"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#2D2416]/80 via-[#2D2416]/60 to-transparent"></div>
        <div className="relative z-10 flex flex-col justify-center h-full p-12 max-w-3xl">
          <div className="inline-block bg-[#E8E05C] text-[#2D2416] px-6 py-3 rounded-full font-light text-sm mb-6 uppercase tracking-wider w-fit">
            Evento Exclusivo
          </div>
          <h1 className="text-6xl font-light tracking-tight text-white mb-6 leading-tight">
            Chá da <span className="font-normal text-[#E8E05C]">Beleza</span>
          </h1>
          <p className="text-white/90 text-2xl font-light leading-relaxed mb-8">
            Encontros mensais que celebram a beleza, o bem-estar e a conexão entre profissionais e entusiastas do universo estético.
          </p>
          <Button className="bg-[#D4A574] hover:bg-[#C49565] text-white h-14 px-8 text-lg font-light rounded-xl shadow-xl w-fit">
            <Calendar className="w-5 h-5 mr-2" />
            Participar do Próximo Encontro
          </Button>
        </div>
      </div>

      {/* What is */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-4xl font-light text-[#2D2416] mb-6">O Que é o Chá da Beleza?</h2>
          <p className="text-[#6B5D4F] font-light leading-relaxed text-lg mb-6">
            O Chá da Beleza é um evento mensal exclusivo do Clube da Beleza, onde profissionais da medicina estética, entusiastas de beleza e parceiros se reúnem para trocar experiências, fazer networking e celebrar a arte do bem-estar.
          </p>
          <p className="text-[#6B5D4F] font-light leading-relaxed text-lg mb-6">
            Em um ambiente sofisticado e acolhedor, oferecemos uma seleção especial de chás, cafés e delícias, enquanto promovemos conversas inspiradoras sobre as últimas tendências, técnicas e inovações do setor.
          </p>
          <p className="text-[#6B5D4F] font-light leading-relaxed text-lg">
            Mais que um encontro, é uma celebração da comunidade que acredita que beleza e autocuidado transformam vidas.
          </p>
        </div>
        <div className="relative h-96 rounded-[2rem] overflow-hidden shadow-lg">
          <img 
            src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800&auto=format&fit=crop"
            alt="Chá"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-[#FEFBF7] rounded-[2rem] p-12 border border-[#D4A574]/20 shadow-lg">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-light text-[#2D2416] mb-4">Por Que Participar?</h2>
          <p className="text-[#6B5D4F] font-light text-lg">Benefícios exclusivos para membros do Clube da Beleza</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, idx) => (
            <div key={idx} className="flex items-start gap-3 bg-white p-6 rounded-xl border border-[#D4A574]/20 hover:shadow-md transition-all">
              <div className="w-8 h-8 rounded-full bg-[#FFF9F0] flex items-center justify-center flex-shrink-0 mt-1">
                <div className="w-3 h-3 rounded-full bg-[#D4A574]"></div>
              </div>
              <span className="text-[#6B5D4F] font-light">{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Events */}
      <div>
        <h2 className="text-4xl font-light text-[#2D2416] mb-10 text-center">Próximos Encontros</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {upcomingEvents.map((event, idx) => (
            <div key={idx} className="bg-[#FEFBF7] rounded-[1.5rem] border border-[#D4A574]/20 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all group">
              <div className="bg-gradient-to-r from-[#D4A574] to-[#C9A868] p-6 text-white text-center">
                <div className="text-4xl font-light mb-2">{event.date.split(' ')[0]}</div>
                <div className="text-sm font-light uppercase tracking-wide opacity-90">{event.date.split(' ')[1]}</div>
              </div>
              <div className="p-6 space-y-4">
                <h3 className="text-xl font-light text-[#2D2416]">{event.title}</h3>
                <div className="flex items-center gap-2 text-[#6B5D4F] text-sm">
                  <MapPin className="w-4 h-4 text-[#D4A574]" />
                  {event.location}
                </div>
                <div className="flex items-center gap-2 text-[#6B5D4F] text-sm">
                  <Users className="w-4 h-4 text-[#D4A574]" />
                  {event.spots} vagas disponíveis
                </div>
                <Button className="w-full bg-gradient-to-r from-[#D4A574] to-[#C9A868] hover:from-[#C49565] hover:to-[#B8935C] text-white h-12 rounded-xl font-light">
                  Reservar Vaga
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-[#D4A574] to-[#C9A868] rounded-[2rem] p-12 text-white text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative z-10">
          <Coffee className="w-16 h-16 mx-auto mb-6 opacity-90" />
          <h3 className="text-4xl font-light mb-4">Venha Tomar um Chá Conosco</h3>
          <p className="text-white/90 text-lg font-light mb-8 max-w-2xl mx-auto">
            Inscreva-se para receber convites exclusivos para os próximos encontros do Chá da Beleza.
          </p>
          <Button className="bg-white text-[#D4A574] hover:bg-[#FFF9F0] h-14 px-8 text-lg font-light rounded-xl shadow-xl">
            Quero Participar
          </Button>
        </div>
      </div>
    </div>
  );
}