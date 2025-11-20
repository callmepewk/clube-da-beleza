import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Heart, Leaf, Star, Target, Eye } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="space-y-8 pb-10 text-[#0F172A]">
      {/* Hero Section */}
      <div className="relative h-[400px] rounded-xl overflow-hidden shadow-2xl group bg-white border border-slate-100">
        <div className="absolute inset-0 bg-[url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_68ca933db3f173d5b5ee5174/424de1767_clubeimg.jpeg')] bg-cover bg-center opacity-20"></div>
        <div className="relative z-10 flex flex-col justify-end h-full p-8 max-w-4xl">
           <h1 className="text-5xl font-bold tracking-tight text-[#0F172A] mb-4">Sobre o Club da Beleza</h1>
           <p className="text-[#475569] text-lg font-medium leading-relaxed">
             O maior clube de benefícios exclusivo para quem ama o autocuidado e um planeta mais feliz.
             Democratizando o acesso a serviços de beleza e estética de qualidade no Brasil.
           </p>
           <div className="mt-6">
              <Button 
                onClick={() => window.open('https://clube-da-beleza.base44.app', '_blank')}
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
            <Card key={i} className="bg-white border-slate-200 text-center py-6 shadow-sm">
               <CardContent className="p-0">
                  <div className="text-3xl font-bold text-purple-600">{stat.number}</div>
                  <div className="text-sm text-[#475569] uppercase tracking-wider mt-1 font-bold">{stat.label}</div>
               </CardContent>
            </Card>
         ))}
      </div>

      {/* History */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
         <div className="space-y-6">
            <div>
               <h2 className="text-3xl font-bold text-[#0F172A] mb-4">Nossa História</h2>
               <p className="text-[#475569] leading-relaxed font-medium">
                 O <strong>Club da Beleza</strong> nasceu da visão de democratizar o acesso a serviços de beleza e estética de qualidade no Brasil.
                 Criamos uma plataforma inovadora que não apenas conecta clientes a profissionais certificados, mas também oferece benefícios exclusivos, descontos especiais e uma comunidade engajada em torno do bem-estar e da beleza sustentável.
               </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <Target className="w-8 h-8 text-blue-600 mb-3" />
                  <h3 className="font-bold text-[#0F172A] mb-2">Nossa Missão</h3>
                  <p className="text-sm text-[#475569] font-medium">
                    Democratizar o acesso a serviços de beleza e estética de qualidade, conectando pessoas a profissionais qualificados e comprometidos com a excelência.
                  </p>
               </div>
               <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <Eye className="w-8 h-8 text-emerald-600 mb-3" />
                  <h3 className="font-bold text-[#0F172A] mb-2">Nossa Visão</h3>
                  <p className="text-sm text-[#475569] font-medium">
                    Ser a maior e mais confiável rede de beleza e estética do Brasil, transformando a experiência de autocuidado em algo acessível e prazeroso.
                  </p>
               </div>
            </div>
         </div>
         <div className="relative h-full min-h-[300px] rounded-xl overflow-hidden border border-slate-200 shadow-md">
            <img 
              src="https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800&q=80" 
              alt="Beauty Salon" 
              className="absolute inset-0 w-full h-full object-cover"
            />
         </div>
      </div>

      {/* Values */}
      <div>
         <h2 className="text-3xl font-bold text-[#0F172A] mb-6 text-center">Nossos Valores</h2>
         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
               { icon: Heart, title: "Autocuidado", desc: "Acreditamos que cuidar de si mesmo é um ato de amor próprio essencial.", color: "text-pink-600" },
               { icon: Leaf, title: "Sustentabilidade", desc: "Comprometidos com práticas sustentáveis e responsáveis.", color: "text-emerald-600" },
               { icon: Users, title: "Comunidade", desc: "Construímos uma rede forte de profissionais e clientes.", color: "text-blue-600" },
               { icon: Star, title: "Excelência", desc: "Selecionamos apenas os melhores profissionais.", color: "text-yellow-500" }
            ].map((val, i) => (
               <Card key={i} className="bg-white border-slate-200 hover:shadow-lg transition-all shadow-sm">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                     <val.icon className={`w-12 h-12 ${val.color} mb-4`} />
                     <h3 className="font-bold text-[#0F172A] text-lg mb-2">{val.title}</h3>
                     <p className="text-sm text-[#475569] font-medium">{val.desc}</p>
                  </CardContent>
               </Card>
            ))}
         </div>
      </div>
    </div>
  );
}