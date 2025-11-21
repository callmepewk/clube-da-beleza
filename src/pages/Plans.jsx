import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Check, X, Crown, ShieldCheck, Star, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import T from '@/components/TranslatedText';

export default function PlansPage() {
  const [userProfile, setUserProfile] = useState(null);
  const [currency, setCurrency] = useState('BRL');

  useEffect(() => {
    const load = async () => {
       const user = await base44.auth.me();
       if (user) {
          const res = await base44.entities.UserProfile.list({ query: { user_email: user.email }});
          setUserProfile(res?.data?.[0]);
       }
    };
    load();
  }, []);

  const hasPlan = userProfile && userProfile.plan && userProfile.plan !== 'free';
  const planName = userProfile?.plan || 'Gratuito';

  const features = {
    basic: ["Agendamento online", "Histórico básico", "Enfermeira Virtual (Limitado)"],
    pro: ["Tudo do Básico", "Enfermeira Virtual Ilimitada", "Descontos em consultas", "Suporte prioritário"],
    premium: ["Tudo do Pro", "Telemedicina ilimitada", "Concierge de saúde 24h", "Cashback em exames"]
  };

  const formatPrice = (brlPrice) => {
    if (currency === 'USD') {
      return `$${(brlPrice / 5).toFixed(2)}`;
    }
    return `R$ ${brlPrice.toFixed(2)}`;
  };

  return (
    <div className="space-y-8 pb-10">
      
      {/* Active Plan Banner */}
      {hasPlan ? (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white shadow-xl border border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
             <div className="flex items-center gap-4">
                <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
                   <Crown className="w-8 h-8 text-yellow-300" />
                </div>
                <div>
                   <p className="text-indigo-100 font-medium mb-1">Seu Plano Atual</p>
                   <h1 className="text-3xl font-bold capitalize text-white">{planName.replace('_', ' ')}</h1>
                   {userProfile.test_account_start_date && (
                      <Badge className="mt-2 bg-yellow-400 text-yellow-900 hover:bg-yellow-500">Período de Teste (7 dias)</Badge>
                   )}
                </div>
             </div>
             <div className="flex gap-3">
                <Button className="bg-white text-indigo-600 hover:bg-indigo-50 border-0">Gerenciar Assinatura</Button>
             </div>
          </div>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-white/20">
             <div className="flex items-center gap-3"><ShieldCheck className="w-5 h-5 text-green-300" /> <span>Suporte Premium Ativo</span></div>
             <div className="flex items-center gap-3"><Star className="w-5 h-5 text-yellow-300" /> <span>Acesso Ilimitado à IA</span></div>
             <div className="flex items-center gap-3"><Check className="w-5 h-5 text-blue-300" /> <span>Benefícios Exclusivos</span></div>
          </div>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <div className="flex justify-center items-center gap-4 mb-4">
            <T as="h1" className="text-4xl font-bold text-[#0F172A]">Escolha o plano ideal para você</T>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BRL">🇧🇷 BRL</SelectItem>
                <SelectItem value="USD">🇺🇸 USD</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <T as="p" className="text-lg text-[#475569] max-w-2xl mx-auto">
            Desbloqueie todo o potencial da sua saúde ou da sua carreira médica com nossos planos exclusivos.
          </T>
        </div>
      )}

      <Tabs defaultValue="patient" className="w-full flex flex-col items-center">
        <TabsList className="grid w-full max-w-[600px] grid-cols-3 bg-slate-100 text-slate-500">
          <TabsTrigger value="patient" className="data-[state=active]:bg-white data-[state=active]:text-[#0F172A] data-[state=active]:shadow-sm"><T>Pacientes</T></TabsTrigger>
          <TabsTrigger value="professional" className="data-[state=active]:bg-white data-[state=active]:text-[#0F172A] data-[state=active]:shadow-sm"><T>Profissionais</T></TabsTrigger>
          <TabsTrigger value="sponsor" className="data-[state=active]:bg-white data-[state=active]:text-[#0F172A] data-[state=active]:shadow-sm"><T>Patrocinadores</T></TabsTrigger>
        </TabsList>

        <TabsContent value="patient" className="w-full mt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Basic */}
            <Card className={`bg-white border-slate-200 shadow-sm hover:shadow-md transition-all ${planName === 'free' ? 'ring-2 ring-emerald-500' : ''}`}>
              <CardHeader>
                <T as={CardTitle} className="text-[#0F172A]">Básico</T>
                <T className="text-3xl font-bold mt-2 text-[#0F172A]">Grátis</T>
                <T as={CardDescription} className="text-[#64748B]">Para começar a cuidar da saúde</T>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-[#64748B]">
                  {features.basic.map((f, i) => <li key={i} className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-emerald-500" /> <T>{f}</T></li>)}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full border-slate-200 text-[#0F172A] hover:bg-slate-50" variant={planName === 'free' ? "secondary" : "outline"} disabled={planName === 'free'}>
                  {planName === 'free' ? <T>Plano Atual</T> : <T>Escolher</T>}
                </Button>
              </CardFooter>
            </Card>

            {/* Premium Patient */}
            <Card className={`bg-white border-emerald-500 shadow-lg relative overflow-hidden ${planName === 'premium' ? 'ring-4 ring-emerald-50' : ''}`}>
              <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">POPULAR</div>
              <CardHeader>
                <T as={CardTitle} className="text-emerald-600">Premium</T>
                <div className="text-3xl font-bold mt-2 text-[#0F172A]">{formatPrice(29.90)}<T as="span" className="text-sm font-normal text-[#64748B]">/mês</T></div>
                <T as={CardDescription} className="text-[#64748B]">Acompanhamento completo</T>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-[#64748B]">
                  {features.pro.map((f, i) => <li key={i} className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-emerald-500" /> <T>{f}</T></li>)}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" disabled={planName === 'premium'}>
                   {planName === 'premium' ? <T>Plano Atual</T> : <T>Assinar Agora</T>}
                </Button>
              </CardFooter>
            </Card>
            
             {/* Family Patient */}
             <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all">
              <CardHeader>
                <T as={CardTitle} className="text-[#0F172A]">Família</T>
                <div className="text-3xl font-bold mt-2 text-[#0F172A]">{formatPrice(79.90)}<T as="span" className="text-sm font-normal text-[#64748B]">/mês</T></div>
                <T as={CardDescription} className="text-[#64748B]">Até 5 dependentes</T>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-[#64748B]">
                  {features.premium.map((f, i) => <li key={i} className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-emerald-500" /> <T>{f}</T></li>)}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-[#0F172A] text-white hover:bg-slate-800"><T>Assinar Família</T></Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="professional" className="w-full mt-8">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
             <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md">
                <CardHeader><T as={CardTitle} className="text-[#0F172A]">Start</T><div className="text-3xl font-bold mt-2 text-[#0F172A]">{formatPrice(99.00)}</div></CardHeader>
                <CardContent><T as="p" className="text-sm text-[#64748B]">Agenda básica e perfil público.</T></CardContent>
                <CardFooter><Button className="w-full border-slate-200 text-[#0F172A] hover:bg-slate-50" variant="outline"><T>Escolher</T></Button></CardFooter>
             </Card>
             <Card className="bg-white border-purple-500 shadow-lg">
                <CardHeader><T as={CardTitle} className="text-purple-600">Growth</T><div className="text-3xl font-bold mt-2 text-[#0F172A]">{formatPrice(199.00)}</div></CardHeader>
                <CardContent><T as="p" className="text-sm text-[#64748B]">IA de atendimento, Chatbots e Sites ilimitados.</T></CardContent>
                <CardFooter><Button className="w-full bg-purple-600 hover:bg-purple-700 text-white"><T>Escolher</T></Button></CardFooter>
             </Card>
             <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md">
                <CardHeader><T as={CardTitle} className="text-[#0F172A]">Clinic</T><div className="text-3xl font-bold mt-2 text-[#0F172A]">{formatPrice(499.00)}</div></CardHeader>
                <CardContent><T as="p" className="text-sm text-[#64748B]">Gestão multi-profissional e relatórios avançados.</T></CardContent>
                <CardFooter><Button className="w-full border-slate-200 text-[#0F172A] hover:bg-slate-50" variant="outline"><T>Escolher</T></Button></CardFooter>
             </Card>
           </div>
        </TabsContent>

        <TabsContent value="sponsor" className="w-full mt-8">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
             <Card className="bg-white border-amber-200 shadow-sm hover:shadow-md">
                <CardHeader><T as={CardTitle} className="text-amber-600">Partner</T><div className="text-3xl font-bold mt-2 text-[#0F172A]">{formatPrice(1000)}</div></CardHeader>
                <CardContent><T as="p" className="text-sm text-[#64748B]">Visibilidade em buscas locais.</T></CardContent>
                <CardFooter><Button className="w-full bg-amber-600 hover:bg-amber-700 text-white"><T>Contatar Vendas</T></Button></CardFooter>
             </Card>
             <Card className="bg-white border-amber-500 shadow-lg">
                <CardHeader><T as={CardTitle} className="text-amber-600">Gold</T><div className="text-3xl font-bold mt-2 text-[#0F172A]">{formatPrice(5000)}</div></CardHeader>
                <CardContent><T as="p" className="text-sm text-[#64748B]">Banners na home e destaque em categorias.</T></CardContent>
                <CardFooter><Button className="w-full bg-amber-600 hover:bg-amber-700 text-white"><T>Contatar Vendas</T></Button></CardFooter>
             </Card>
             <Card className="bg-gradient-to-b from-slate-900 to-slate-800 border-slate-800 text-white">
                <CardHeader><T as={CardTitle} className="text-white">Diamond</T><T className="text-3xl font-bold mt-2 text-white">Sob Consulta</T></CardHeader>
                <CardContent><T as="p" className="text-sm text-slate-300">Parceria estratégica e dados de inteligência.</T></CardContent>
                <CardFooter><Button className="w-full bg-white text-black hover:bg-gray-100"><T>Agendar Reunião</T></Button></CardFooter>
             </Card>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}