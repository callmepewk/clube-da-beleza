import React from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function PlansPage() {
  const features = {
    basic: [
      "Agendamento online",
      "Histórico básico",
      "Enfermeira Virtual (Limitado)"
    ],
    pro: [
      "Tudo do Básico",
      "Enfermeira Virtual Ilimitada",
      "Descontos em consultas",
      "Suporte prioritário"
    ],
    premium: [
      "Tudo do Pro",
      "Telemedicina ilimitada",
      "Concierge de saúde 24h",
      "Cashback em exames"
    ]
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-slate-900">Escolha o plano ideal para você</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Desbloqueie todo o potencial da sua saúde ou da sua carreira médica com nossos planos exclusivos.
        </p>
      </div>

      <Tabs defaultValue="patient" className="w-full flex flex-col items-center">
        <TabsList className="grid w-full max-w-[600px] grid-cols-3">
          <TabsTrigger value="patient">Pacientes</TabsTrigger>
          <TabsTrigger value="professional">Profissionais</TabsTrigger>
          <TabsTrigger value="sponsor">Patrocinadores</TabsTrigger>
        </TabsList>

        <TabsContent value="patient" className="w-full mt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Basic */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Básico</CardTitle>
                <div className="text-3xl font-bold mt-2">Grátis</div>
                <CardDescription>Para começar a cuidar da saúde</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {features.basic.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500" /> {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="outline">Plano Atual</Button>
              </CardFooter>
            </Card>

            {/* Premium Patient */}
            <Card className="border-emerald-500 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">POPULAR</div>
              <CardHeader>
                <CardTitle className="text-emerald-700">Premium</CardTitle>
                <div className="text-3xl font-bold mt-2">R$ 29,90<span className="text-sm font-normal text-slate-500">/mês</span></div>
                <CardDescription>Acompanhamento completo</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {features.pro.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500" /> {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700">Assinar Agora</Button>
              </CardFooter>
            </Card>
            
             {/* Family Patient */}
             <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Família</CardTitle>
                <div className="text-3xl font-bold mt-2">R$ 79,90<span className="text-sm font-normal text-slate-500">/mês</span></div>
                <CardDescription>Até 5 dependentes</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {features.premium.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500" /> {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-slate-800 text-white hover:bg-slate-900">Assinar Família</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="professional" className="w-full mt-8">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
             <Card className="border-slate-200">
                <CardHeader><CardTitle>Start</CardTitle><div className="text-3xl font-bold mt-2">R$ 99,00</div></CardHeader>
                <CardContent><p className="text-sm text-slate-500">Agenda básica e perfil público.</p></CardContent>
                <CardFooter><Button className="w-full" variant="outline">Escolher</Button></CardFooter>
             </Card>
             <Card className="border-purple-500 shadow-lg">
                <CardHeader><CardTitle className="text-purple-700">Growth</CardTitle><div className="text-3xl font-bold mt-2">R$ 199,00</div></CardHeader>
                <CardContent><p className="text-sm text-slate-500">IA de atendimento, Chatbots e Sites ilimitados.</p></CardContent>
                <CardFooter><Button className="w-full bg-purple-600 hover:bg-purple-700">Escolher</Button></CardFooter>
             </Card>
             <Card className="border-slate-200">
                <CardHeader><CardTitle>Clinic</CardTitle><div className="text-3xl font-bold mt-2">R$ 499,00</div></CardHeader>
                <CardContent><p className="text-sm text-slate-500">Gestão multi-profissional e relatórios avançados.</p></CardContent>
                <CardFooter><Button className="w-full" variant="outline">Escolher</Button></CardFooter>
             </Card>
           </div>
        </TabsContent>

        <TabsContent value="sponsor" className="w-full mt-8">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
             <Card className="border-amber-200 bg-amber-50">
                <CardHeader><CardTitle className="text-amber-800">Partner</CardTitle><div className="text-3xl font-bold mt-2">R$ 1.000</div></CardHeader>
                <CardContent><p className="text-sm text-slate-600">Visibilidade em buscas locais.</p></CardContent>
                <CardFooter><Button className="w-full bg-amber-600 hover:bg-amber-700">Contatar Vendas</Button></CardFooter>
             </Card>
             <Card className="border-amber-400 bg-amber-100 shadow-md">
                <CardHeader><CardTitle className="text-amber-900">Gold</CardTitle><div className="text-3xl font-bold mt-2">R$ 5.000</div></CardHeader>
                <CardContent><p className="text-sm text-slate-600">Banners na home e destaque em categorias.</p></CardContent>
                <CardFooter><Button className="w-full bg-amber-700 hover:bg-amber-800">Contatar Vendas</Button></CardFooter>
             </Card>
             <Card className="border-slate-900 bg-slate-900 text-white">
                <CardHeader><CardTitle className="text-white">Diamond</CardTitle><div className="text-3xl font-bold mt-2">Sob Consulta</div></CardHeader>
                <CardContent><p className="text-sm text-slate-300">Parceria estratégica e dados de inteligência.</p></CardContent>
                <CardFooter><Button className="w-full bg-white text-slate-900 hover:bg-slate-100">Agendar Reunião</Button></CardFooter>
             </Card>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}