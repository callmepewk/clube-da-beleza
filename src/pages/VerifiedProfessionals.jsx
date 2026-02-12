import React from 'react';
import T from '@/components/TranslatedText';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BadgeCheck, FileCheck, ShieldCheck, RefreshCw, Bot, IdCard, HelpCircle } from 'lucide-react';

export default function VerifiedProfessionals() {
  const criteria = [
    { icon: FileCheck, title: 'Documentação profissional validada', desc: 'Diplomas, certificados e comprovantes revisados e autenticados.' },
    { icon: IdCard, title: 'Identidade confirmada', desc: 'Verificação de identidade com múltiplos fatores.' },
    { icon: ShieldCheck, title: 'Registro profissional ativo', desc: 'Checagem em conselhos e bases oficiais atualizadas.' },
    { icon: Bot, title: 'Validação manual e automatizada por IA', desc: 'Combinação de análise humana com sistemas inteligentes.' },
    { icon: RefreshCw, title: 'Auditoria periódica', desc: 'Revalidações regulares para manter o selo atualizado.' },
  ];

  const tips = [
    'Consulte o perfil completo e verifique o selo visível ao lado do nome.',
    'Leia avaliações e histórico de atendimentos recentes.',
    'Prefira canais oficiais da plataforma para marcar consultas.',
    'Em dúvidas, use o botão de suporte para confirmar credenciais.',
  ];

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-[#D4A574] to-[#B8935C] rounded-2xl p-8 text-white">
        <div className="flex items-center gap-3 mb-2">
          <BadgeCheck className="w-8 h-8" />
          <T as="h1" className="text-3xl font-light tracking-wide">Profissionais Verificados</T>
        </div>
        <T as="p" className="text-white/90 max-w-3xl font-light">
          Transparência sobre como verificamos credenciais e o que o selo significa para você.
        </T>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-[#FEFBF7] border-[#D4A574]/20">
          <CardContent className="p-6 space-y-4">
            <T as="h2" className="text-2xl font-light text-[#2D2416]">Critérios do Selo</T>
            <div className="space-y-3">
              {criteria.map((c, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white border border-[#D4A574]/20">
                  <c.icon className="w-5 h-5 text-[#D4A574] flex-shrink-0 mt-0.5" />
                  <div>
                    <T as="h3" className="font-semibold text-[#2D2416] text-sm">{c.title}</T>
                    <T as="p" className="text-xs text-[#6B5D4F]">{c.desc}</T>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#FFF9F0] border-[#D4A574]/30">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-[#2D2416]">
              <HelpCircle className="w-5 h-5 text-[#D4A574]" />
              <T as="h3" className="text-xl font-light">Orientações para Pacientes</T>
            </div>
            <ul className="list-disc pl-5 space-y-2 text-sm text-[#6B5D4F]">
              {tips.map((t, i) => (<li key={i}><T>{t}</T></li>))}
            </ul>
            <Button onClick={() => window.open('/QualitySeal', '_self')} className="w-full bg-[#D4A574] hover:bg-[#C49565] text-white">
              <T>Conheça também o Selo de Qualidade</T>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#FEFBF7] border-[#D4A574]/20">
        <CardContent className="p-6 space-y-3">
          <T as="h2" className="text-2xl font-light text-[#2D2416]">Perguntas Frequentes</T>
          <div className="space-y-2 text-sm text-[#6B5D4F]">
            <div>
              <T as="h4" className="font-semibold text-[#2D2416]">O selo garante resultado?</T>
              <T as="p">Não. O selo atesta verificação reforçada, não substitui a avaliação clínica individual.</T>
            </div>
            <div>
              <T as="h4" className="font-semibold text-[#2D2416]">Como denunciar inconsistências?</T>
              <T as="p">Use o suporte na plataforma e descreva a situação. Casos são auditados com prioridade.</T>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}