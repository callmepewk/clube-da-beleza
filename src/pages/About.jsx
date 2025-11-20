import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Heart, Leaf, Star, Target, Eye } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="space-y-8 pb-10 text-white">
      {/* Hero Section */}
      <div className="relative h-[400px] rounded-xl overflow-hidden shadow-2xl group">
        <div className="absolute inset-0 bg-[url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_68ca933db3f173d5b5ee5174/424de1767_clubeimg.jpeg')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/80 to-transparent"></div>
        <div className="relative z-10 flex flex-col justify-end h-full p-8 max-w-4xl">
           <h1 className="text-5xl font-bold tracking-tight text-white drop-shadow-lg mb-4">Sobre o Club da Beleza</h1>
           <p className="text-[#B3B3B3] text-lg font-medium leading-relaxed">
             O maior clube de benefícios exclusivo para quem ama o autocuidado e um planeta mais feliz.
             Democratizando o acesso a serviços de beleza e estética de qualidade no Brasil.
           </p>
           <div className="mt-6">
              <Button 
                onClick={() => window.location.href = 'https://clube-da-beleza.base44.app'}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-6 rounded-full text-lg shadow-lg transform hover:scale-105 transition-all"
              >
                Conheça mais o nosso trabalho
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
            <Card key={i} className="bg-[#181818] border-[#282828] text-center py-6">
               <CardContent className="p-0">
                  <div className="text-3xl font-bold text-purple-500">{stat.number}</div>
                  <div className="text-sm text-[#B3B3B3] uppercase tracking-wider mt-1">{stat.label}</div>
               </CardContent>
            </Card>
         ))}
      </div>

      {/* History */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
         <div className="space-y-6">
            <div>
               <h2 className="text-3xl font-bold text-white mb-4">Nossa História</h2>
               <p className="text-[#B3B3B3] leading-relaxed">
                 O <strong>Club da Beleza</strong> nasceu da visão de democratizar o acesso a serviços de beleza e estética de qualidade no Brasil.
                 Criamos uma plataforma inovadora que não apenas conecta clientes a profissionais certificados, mas também oferece benefícios exclusivos, descontos especiais e uma comunidade engajada em torno do bem-estar e da beleza sustentável.
               </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="bg-[#181818] p-4 rounded-lg border border-[#282828]">
                  <Target className="w-8 h-8 text-blue-500 mb-3" />
                  <h3 className="font-bold text-white mb-2">Nossa Missão</h3>
                  <p className="text-sm text-[#B3B3B3]">
                    Democratizar o acesso a serviços de beleza e estética de qualidade, conectando pessoas a profissionais qualificados e comprometidos com a excelência.
                  </p>
               </div>
               <div className="bg-[#181818] p-4 rounded-lg border border-[#282828]">
                  <Eye className="w-8 h-8 text-emerald-500 mb-3" />
                  <h3 className="font-bold text-white mb-2">Nossa Visão</h3>
                  <p className="text-sm text-[#B3B3B3]">
                    Ser a maior e mais confiável rede de beleza e estética do Brasil, transformando a experiência de autocuidado em algo acessível e prazeroso.
                  </p>
               </div>
            </div>
         </div>
         <div className="relative h-full min-h-[300px] rounded-xl overflow-hidden border border-[#282828]">
            <img 
              src="https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800&q=80" 
              alt="Beauty Salon" 
              className="absolute inset-0 w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity duration-500"
            />
         </div>
      </div>

      {/* Values */}
      <div>
         <h2 className="text-3xl font-bold text-white mb-6 text-center">Nossos Valores</h2>
         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
               { icon: Heart, title: "Autocuidado", desc: "Acreditamos que cuidar de si mesmo é um ato de amor próprio essencial.", color: "text-pink-500" },
               { icon: Leaf, title: "Sustentabilidade", desc: "Comprometidos com práticas sustentáveis e responsáveis.", color: "text-green-500" },
               { icon: Users, title: "Comunidade", desc: "Construímos uma rede forte de profissionais e clientes.", color: "text-blue-500" },
               { icon: Star, title: "Excelência", desc: "Selecionamos apenas os melhores profissionais.", color: "text-yellow-500" }
            ].map((val, i) => (
               <Card key={i} className="bg-[#181818] border-[#282828] hover:bg-[#222] transition-colors">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                     <val.icon className={`w-12 h-12 ${val.color} mb-4`} />
                     <h3 className="font-bold text-white text-lg mb-2">{val.title}</h3>
                     <p className="text-sm text-[#B3B3B3]">{val.desc}</p>
                  </CardContent>
               </Card>
            ))}
         </div>
      </div>
    </div>
  );
}