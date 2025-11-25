import React from 'react';
import { Package, Gift, Star, Sparkles, Heart, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import T from '@/components/TranslatedText';

export default function BeautyBoxPage() {
  const boxes = [
    {
      name: 'Beauty Box Essencial',
      price: 'R$ 99,90',
      color: 'from-[#B8935C] to-[#A68350]',
      products: ['Sérum hidratante premium', 'Máscara facial revitalizante', 'Creme para os olhos', 'Protetor solar FPS 50', 'Brinde surpresa exclusivo'],
      value: 'R$ 280,00'
    },
    {
      name: 'Beauty Box Premium',
      price: 'R$ 199,90',
      color: 'from-[#D4A574] to-[#C9A868]',
      products: ['Todos os itens da Box Essencial', 'Ácido hialurônico puro', 'Vitamina C concentrada', 'Tratamento anti-idade', 'Kit de pincéis profissionais', '2 brindes exclusivos'],
      value: 'R$ 580,00',
      popular: true
    },
    {
      name: 'Beauty Box Deluxe',
      price: 'R$ 349,90',
      color: 'from-[#C9A868] to-[#E0B480]',
      products: ['Todos os itens da Box Premium', 'Aparelho de LED facial', 'Dermaroller profissional', 'Kit completo de skincare', 'Consulta online gratuita', 'Acesso VIP ao Clube+'],
      value: 'R$ 950,00'
    }
  ];

  const benefits = [
    {
      icon: Star,
      title: 'Produtos Premium',
      description: 'Seleção cuidadosa de produtos de alta qualidade e marcas renomadas.'
    },
    {
      icon: Gift,
      title: 'Economia Garantida',
      description: 'Receba até 3x o valor da sua assinatura em produtos.'
    },
    {
      icon: Sparkles,
      title: 'Novidades Mensais',
      description: 'Descubra novos produtos e tratamentos todos os meses.'
    },
    {
      icon: Heart,
      title: 'Personalização',
      description: 'Boxes adaptadas ao seu tipo de pele e necessidades.'
    }
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <div className="relative h-[70vh] rounded-[2rem] overflow-hidden shadow-2xl">
        <img 
          src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=2000&auto=format&fit=crop"
          alt="Beauty Box"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2D2416] via-[#2D2416]/60 to-transparent"></div>
        <div className="relative z-10 flex flex-col justify-end h-full p-12 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-block bg-[#E8E05C] text-[#2D2416] px-6 py-3 rounded-full font-light text-sm mb-6 uppercase tracking-wider">
              <T>Assinatura Mensal</T>
            </div>
            <h1 className="text-6xl font-light tracking-tight text-white mb-6 leading-tight">
              Beauty <span className="font-normal text-[#E8E05C]">Box</span>
            </h1>
            <T as="p" className="text-white/90 text-2xl font-light leading-relaxed mb-8">
              Caixa exclusiva com produtos premium de autocuidado para assinantes do Clube da Beleza
            </T>
            <Button className="bg-[#D4A574] hover:bg-[#C49565] text-white h-14 px-8 text-lg font-light rounded-xl shadow-xl">
              <Package className="w-5 h-5 mr-2" />
              <T>Assinar Agora</T>
            </Button>
          </div>
        </div>
      </div>

      {/* Introduction */}
      <div className="max-w-4xl mx-auto text-center space-y-6">
        <T as="h2" className="text-4xl font-light text-[#2D2416]">Sua Caixa Premium de Autocuidado</T>
        <T as="p" className="text-[#6B5D4F] font-light leading-relaxed text-lg">
          A Beauty Box é uma caixa exclusiva com diversos produtos de autocuidado feitos especialmente para os assinantes do Clube da Beleza. Produtos premium selecionados que transformam sua rotina de beleza.
        </T>
        <T as="p" className="text-[#6B5D4F] font-light leading-relaxed text-lg">
          Você pode adquirir sua Beauty Box usando Beauty Coins (nossa moeda virtual) ou acumulando pontos no Mapa da Estética ao adquirir produtos, serviços, planos ou indicar amigos.
        </T>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {benefits.map((benefit, idx) => (
          <div key={idx} className="bg-[#FEFBF7] rounded-[1.5rem] p-8 border border-[#D4A574]/20 text-center hover:shadow-xl hover:-translate-y-2 transition-all">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D4A574] to-[#C9A868] flex items-center justify-center mx-auto mb-6 shadow-lg">
              <benefit.icon className="w-8 h-8 text-white" />
            </div>
            <T as="h3" className="text-xl font-light text-[#2D2416] mb-3">{benefit.title}</T>
            <T as="p" className="text-[#6B5D4F] font-light text-sm leading-relaxed">{benefit.description}</T>
          </div>
        ))}
      </div>

      {/* Box Plans */}
      <div>
        <T as="h2" className="text-4xl font-light text-[#2D2416] mb-10 text-center">Escolha Sua Beauty Box</T>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {boxes.map((box, idx) => (
            <div key={idx} className={`bg-[#FEFBF7] rounded-[2rem] border-2 ${box.popular ? 'border-[#D4A574] shadow-2xl scale-105' : 'border-[#D4A574]/20'} overflow-hidden hover:shadow-2xl transition-all relative`}>
              {box.popular && (
                <div className="absolute top-4 right-4 bg-[#E8E05C] text-[#2D2416] px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider z-10">
                  <T>Mais Popular</T>
                </div>
              )}
              <div className={`bg-gradient-to-r ${box.color} p-8 text-white text-center`}>
                <Package className="w-12 h-12 mx-auto mb-4 opacity-90" />
                <h3 className="text-3xl font-light mb-2">{box.name}</h3>
                <div className="text-4xl font-light mb-2">{box.price}</div>
                <div className="text-sm opacity-80">por mês</div>
              </div>
              <div className="p-8 space-y-6">
                <div className="text-center bg-[#FFF9F0] p-4 rounded-xl border border-[#D4A574]/20">
                  <div className="text-sm text-[#6B5D4F] font-light mb-1">Valor total dos produtos</div>
                  <div className="text-2xl font-light text-[#D4A574]">{box.value}</div>
                  <div className="text-xs text-green-600 font-bold mt-1">
                    Economize {Math.round(((parseFloat(box.value.replace('R$ ', '').replace(',', '.')) - parseFloat(box.price.replace('R$ ', '').replace(',', '.'))) / parseFloat(box.value.replace('R$ ', '').replace(',', '.'))) * 100)}%
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#2D2416] uppercase tracking-wide mb-3">Itens Inclusos</h4>
                  <ul className="space-y-2">
                    {box.products.map((product, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[#6B5D4F] font-light">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#D4A574] mt-1.5 flex-shrink-0"></div>
                        {product}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button className={`w-full bg-gradient-to-r ${box.color} hover:opacity-90 text-white h-12 rounded-xl font-light`}>
                  Assinar {box.name.split(' ')[2]}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How it Works */}
      <div className="bg-[#FEFBF7] rounded-[2rem] p-12 border border-[#D4A574]/20">
        <h2 className="text-4xl font-light text-[#2D2416] mb-10 text-center">Como Funciona</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {[
            { num: '1', title: 'Escolha seu Plano', desc: 'Selecione a Beauty Box ideal para você' },
            { num: '2', title: 'Personalize', desc: 'Conte-nos sobre seu tipo de pele e preferências' },
            { num: '3', title: 'Receba em Casa', desc: 'Sua box chega todo mês na sua porta' },
            { num: '4', title: 'Aproveite', desc: 'Descubra e experimente produtos incríveis' }
          ].map((step, idx) => (
            <div key={idx} className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D4A574] to-[#C9A868] flex items-center justify-center mx-auto mb-4 text-white text-2xl font-light shadow-lg">
                {step.num}
              </div>
              <h3 className="text-xl font-light text-[#2D2416] mb-2">{step.title}</h3>
              <p className="text-sm text-[#6B5D4F] font-light">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-gradient-to-br from-[#FFF9F0] to-[#FFF5E6] rounded-[2rem] p-12 border border-[#D4A574]/20">
        <h2 className="text-4xl font-light text-[#2D2416] mb-10 text-center">O Que Nossas Assinantes Dizem</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Juliana M.', text: 'Adoro receber minha Beauty Box todo mês! É como ganhar um presente de mim mesma. Os produtos são incríveis!', rating: 5 },
            { name: 'Camila S.', text: 'Melhor custo-benefício! Já descobri várias marcas que agora são minhas favoritas. Vale muito a pena!', rating: 5 },
            { name: 'Fernanda L.', text: 'A qualidade dos produtos é excepcional. Minha pele nunca esteve tão bonita. Super recomendo!', rating: 5 }
          ].map((testimonial, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl border border-[#D4A574]/20">
              <div className="flex gap-1 mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#D4A574] text-[#D4A574]" />
                ))}
              </div>
              <p className="text-[#6B5D4F] font-light italic mb-4">"{testimonial.text}"</p>
              <div className="font-light text-[#2D2416]">- {testimonial.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-[#D4A574] to-[#C9A868] rounded-[2rem] p-12 text-white text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative z-10">
          <Gift className="w-16 h-16 mx-auto mb-6 opacity-90" />
          <h3 className="text-4xl font-light mb-4">Comece Sua Jornada de Autocuidado</h3>
          <p className="text-white/90 text-lg font-light mb-8 max-w-2xl mx-auto">
            Assine agora e receba sua primeira Beauty Box com 20% de desconto + frete grátis
          </p>
          <Button className="bg-white text-[#D4A574] hover:bg-[#FFF9F0] h-14 px-8 text-lg font-light rounded-xl shadow-xl">
            Garantir Desconto
          </Button>
        </div>
      </div>
    </div>
  );
}