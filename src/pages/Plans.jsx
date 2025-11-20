import React from 'react';
import { Check, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PlansPage() {
  const plans = [
    {
      name: 'Básico',
      price: 'Grátis',
      description: 'Para pacientes e profissionais iniciantes',
      features: ['Perfil Básico', 'Agendamentos Limitados', 'Enfermeira Virtual (Básico)', 'Busca de Profissionais'],
      highlight: false
    },
    {
      name: 'Profissional Pro',
      price: 'R$ 89,90/mês',
      description: 'Ideal para médicos e clínicas',
      features: ['Agenda Inteligente Ilimitada', 'Criação de Sites e Chatbots', 'Estúdio de Design IA', 'Gestão Financeira', 'Teleconsulta HD'],
      highlight: true
    },
    {
      name: 'Paciente Premium',
      price: 'R$ 29,90/mês',
      description: 'Cuidado extra para você e família',
      features: ['Monitoramento 24h IA', 'Prioridade em Agendamentos', 'Descontos em Exames', 'Histórico Familiar'],
      highlight: false
    }
  ];

  return (
    <div className="space-y-8 py-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-slate-900">Planos e Preços</h1>
        <p className="text-slate-500 max-w-2xl mx-auto">Escolha o plano ideal para suas necessidades de saúde ou gestão de consultório.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
        {plans.map((plan) => (
          <div key={plan.name} className={`relative bg-white rounded-2xl p-8 shadow-sm border ${plan.highlight ? 'border-emerald-500 ring-1 ring-emerald-500 shadow-emerald-100' : 'border-slate-200'}`}>
            {plan.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                Mais Popular
              </div>
            )}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-slate-900">{plan.price}</span>
              </div>
              <p className="mt-4 text-sm text-slate-500">{plan.description}</p>
            </div>
            <ul className="space-y-3 mb-8">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm text-slate-600">
                  <Check className={`w-4 h-4 ${plan.highlight ? 'text-emerald-500' : 'text-slate-400'}`} />
                  {feature}
                </li>
              ))}
            </ul>
            <Button className={`w-full ${plan.highlight ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-900 hover:bg-slate-800'}`}>
              Escolher Plano
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}