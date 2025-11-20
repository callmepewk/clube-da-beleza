import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Crown, ShieldCheck, Star, Check, CreditCard, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function MyPlanPage() {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
       try {
         const user = await base44.auth.me();
         if (user) {
            const res = await base44.entities.UserProfile.list({ query: { user_email: user.email }});
            setUserProfile(res?.data?.[0]);
         }
       } catch (e) {
         console.error(e);
       } finally {
         setLoading(false);
       }
    };
    load();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;
  
  if (!userProfile) {
     return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center space-y-4">
           <h2 className="text-2xl font-bold">Perfil não encontrado</h2>
           <p className="text-slate-500">Você precisa completar seu cadastro para ver seu plano.</p>
           <Button onClick={() => navigate(createPageUrl('Onboarding'))} className="bg-indigo-600">Ir para Cadastro</Button>
           <Button variant="ghost" onClick={() => navigate(createPageUrl('Dashboard'))}>Voltar ao Início</Button>
        </div>
     );
  }

  const planName = userProfile.plan || 'free';
  const isFree = planName === 'free';

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10 pt-6 px-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl('Dashboard'))}>
           <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-3xl font-bold text-slate-900">Meu Plano Atual</h1>
      </div>
      
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
             <div className="flex items-center gap-4">
                <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
                   <Crown className="w-8 h-8 text-yellow-300" />
                </div>
                <div>
                   <p className="text-indigo-100 font-medium mb-1">Status da Assinatura</p>
                   <h1 className="text-4xl font-bold capitalize">{planName.replace('_', ' ')}</h1>
                   {userProfile.test_account_start_date && (
                      <Badge className="mt-2 bg-yellow-400 text-yellow-900 hover:bg-yellow-500 border-0">Período de Teste (7 dias)</Badge>
                   )}
                </div>
             </div>
             <div className="flex gap-3">
                <Button 
                  onClick={() => navigate(createPageUrl('Plans'))} 
                  className="bg-white text-indigo-600 hover:bg-indigo-50 border-0 font-semibold"
                >
                  {isFree ? 'Fazer Upgrade' : 'Alterar Plano'}
                </Button>
             </div>
          </div>
          
          {!isFree && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-white/20">
                <div className="flex items-center gap-3"><ShieldCheck className="w-5 h-5 text-green-300" /> <span>Suporte Premium Ativo</span></div>
                <div className="flex items-center gap-3"><Star className="w-5 h-5 text-yellow-300" /> <span>Acesso Ilimitado à IA</span></div>
                <div className="flex items-center gap-3"><Check className="w-5 h-5 text-blue-300" /> <span>Benefícios Exclusivos</span></div>
            </div>
          )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5" /> Detalhes do Pagamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isFree ? (
              <p className="text-slate-500">Você está utilizando o plano gratuito. Nenhuma cobrança está sendo realizada.</p>
            ) : (
              <>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-slate-600">Valor Mensal</span>
                  <span className="font-bold">R$ 29,90</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-slate-600">Próxima Cobrança</span>
                  <span className="font-bold">20/12/2025</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-600">Método</span>
                  <span className="font-bold flex items-center gap-2">•••• 4242 <Badge variant="outline">Visa</Badge></span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Histórico de Uso</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                <div>
                   <div className="flex justify-between text-sm mb-1">
                      <span>Consultas com IA</span>
                      <span className="font-bold">{isFree ? '5 / 10' : 'Ilimitado'}</span>
                   </div>
                   <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: isFree ? '50%' : '100%' }}></div>
                   </div>
                </div>
                <div>
                   <div className="flex justify-between text-sm mb-1">
                      <span>Armazenamento</span>
                      <span className="font-bold">{isFree ? '100MB' : '10GB'}</span>
                   </div>
                   <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full" style={{ width: '15%' }}></div>
                   </div>
                </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}