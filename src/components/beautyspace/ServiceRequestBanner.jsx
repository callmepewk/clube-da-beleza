import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Rocket, Layers, Building2, ShieldCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import T from '@/components/TranslatedText';

const OPTIONS = [
  'CRM',
  'Site',
  'Clube de Assinatura',
  'Clube de Benefícios',
  'Automação (Fluxos/CRM)',
  'Analytics/Relatórios',
  'Landing Pages',
  'E-commerce de Serviços/Produtos'
];

export default function ServiceRequestBanner({ me }) {
  const [selected, setSelected] = React.useState(['CRM', 'Site']);
  const [area, setArea] = React.useState('Clínica/Consultório');
  const [type, setType] = React.useState('pago');
  const [whiteLabel, setWhiteLabel] = React.useState(true);
  const [notes, setNotes] = React.useState('Quero um pacote completo com foco em captação e fidelização.');
  const [submitting, setSubmitting] = React.useState(false);
  const [done, setDone] = React.useState(false);

  const toggle = (opt) => {
    setSelected((prev) => prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]);
  };

  const handleSubmit = async () => {
    if (!selected.length || !area) return alert('Selecione ao menos uma opção e informe sua área de atuação.');
    setSubmitting(true);
    try {
      const user = me || await base44.auth.me();
      await base44.entities.ServiceRequest.create({
        user_email: user?.email || 'anon@guest',
        user_name: user?.full_name || '',
        categories: selected,
        area,
        type,
        white_label: !!whiteLabel,
        notes,
        status: 'novo',
        priority: 'media'
      });
      const phone = '5554991554136';
      const msg = `Olá! Solicitação de Proposta Personalizada%0A%0A` +
        `Nome: ${encodeURIComponent(user?.full_name || '')}%0A` +
        `Email: ${encodeURIComponent(user?.email || '')}%0A` +
        `Soluções: ${encodeURIComponent(selected.join(', '))}%0A` +
        `Área: ${encodeURIComponent(area)}%0A` +
        `Tipo: ${encodeURIComponent(type)}%0A` +
        `White Label: ${whiteLabel ? 'Sim' : 'Não'}%0A` +
        `Notas: ${encodeURIComponent(notes)}`;
      window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
      setDone(true);
      setSelected(['CRM', 'Site']);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="bg-gradient-to-r from-[#D4A574] to-[#B8935C] text-white border-0 shadow-2xl rounded-2xl overflow-hidden">
      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-white/20 rounded-xl p-2"><Rocket className="w-6 h-6 text-white" /></div>
              <T as="h2" className="text-2xl sm:text-3xl font-light leading-tight">Contrate Soluções sob Medida (White Label)</T>
            </div>
            <T as="p" className="text-white/90 font-light mb-4">
              Nossa equipe entrega sistemas completos de crescimento: CRM, Sites, Clubes de Assinatura e Benefícios, automações e mais — tudo com a sua marca.
            </T>

            <div className="flex flex-wrap gap-2 mb-4">
              {OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => toggle(opt)}
                  className={`px-3 py-1.5 rounded-full text-xs sm:text-sm border backdrop-blur-md transition-all ${
                    selected.includes(opt)
                      ? 'bg-white text-[#2D2416] border-white'
                      : 'bg-white/10 text-white border-white/30 hover:bg-white/20'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <div className="bg-white/10 rounded-xl p-3">
                <div className="text-xs opacity-80 mb-1 flex items-center gap-2"><Building2 className="w-4 h-4" />Área de atuação</div>
                <Input value={area} onChange={(e) => setArea(e.target.value)} className="bg-white/90 text-[#2D2416] h-10" />
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <div className="text-xs opacity-80 mb-1">Tipo (gratuito/pago)</div>
                <div className="flex gap-2">
                  {['gratuito','pago'].map(v => (
                    <button key={v} onClick={() => setType(v)} className={`px-3 py-1.5 rounded-full text-xs border ${type===v? 'bg-white text-[#2D2416] border-white' : 'bg-white/10 text-white border-white/30'}`}>{v}</button>
                  ))}
                </div>
              </div>
              <div className="bg-white/10 rounded-xl p-3 flex items-center justify-between">
                <div className="text-xs opacity-80 flex items-center gap-2"><Layers className="w-4 h-4" />White Label</div>
                <Switch checked={whiteLabel} onCheckedChange={setWhiteLabel} />
              </div>
            </div>

            <div className="bg-white/10 rounded-xl p-3 mb-4">
              <div className="text-xs opacity-80 mb-1 flex items-center gap-2"><ShieldCheck className="w-4 h-4" />Detalhes e objetivos</div>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="bg-white/90 text-[#2D2416] min-h-[72px]" />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={handleSubmit} disabled={submitting} className="bg-white text-[#D4A574] hover:bg-[#FFF9F0]">
                {submitting ? 'Enviando...' : 'Solicitar Proposta Personalizada'}
              </Button>
              {done && <Badge className="bg-emerald-100 text-emerald-800">Pedido enviado! Nossa equipe entrará em contato.</Badge>}
            </div>
          </div>

          <div className="w-full lg:w-80 bg-white/10 rounded-2xl p-5 border border-white/20">
            <div className="text-sm font-medium mb-3">Como funciona</div>
            <ul className="space-y-2 text-sm text-white/90">
              <li>1. Você seleciona as soluções desejadas</li>
              <li>2. Geramos um ticket para nossa equipe</li>
              <li>3. Admins podem filtrar por usuário, categoria, área e tipo</li>
              <li>4. Entrega White Label pronta para escalar</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}