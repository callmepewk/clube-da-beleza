import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function PlatformSettingsCard() {
  const qc = useQueryClient();
  const { data: settings } = useQuery({
    queryKey: ['platformSettingsAdmin'],
    queryFn: async () => {
      const res = await base44.entities.PlatformSettings.list({ limit: 1 });
      return res?.data?.[0] || null;
    }
  });
  const [form, setForm] = React.useState({ ga_measurement_id: '', trends_terms: [] });
  React.useEffect(()=>{ if(settings){ setForm({ ga_measurement_id: settings.ga_measurement_id || '', trends_terms: settings.trends_terms || [] }); } }, [settings]);

  const save = useMutation({
    mutationFn: async () => {
      if (settings) return base44.entities.PlatformSettings.update(settings.id, form);
      return base44.entities.PlatformSettings.create(form);
    },
    onSuccess: () => qc.invalidateQueries(['platformSettingsAdmin'])
  });

  return (
    <Card className="bg-[#FEFBF7] border-[#D4A574]/20">
      <CardHeader>
        <CardTitle className="text-[#2D2416]">Configurações da Plataforma (Analytics/Trends)</CardTitle>
        <p className="text-sm text-[#6B5D4F] mt-2">
          • Funcionalidade: conecte seu GA4 (G-XXXX) para pageviews/engajamento em tempo real e defina termos-base para o módulo de Tendências. <br />
          • O que inserir: seu Measurement ID do Google Analytics e 3–10 termos estratégicos (ex: “estética facial, harmonização, depilação a laser”). <br />
          • Inserção automática por IA: clique abaixo e sugerimos termos conforme seu posicionamento e público.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm text-[#6B5D4F]">GA4 Measurement ID</label>
          <Input value={form.ga_measurement_id} onChange={e=>setForm({...form, ga_measurement_id: e.target.value})} placeholder="G-XXXXXXX" className="bg-white" />
        </div>
        <div>
          <label className="text-sm text-[#6B5D4F]">Termos para Trends (separe por vírgula)</label>
          <Input value={form.trends_terms.join(', ')} onChange={e=>setForm({...form, trends_terms: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})} className="bg-white" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={async()=>{
        ...
          </Button>
        </div>
        </CardContent>
    </Card>
  );
}