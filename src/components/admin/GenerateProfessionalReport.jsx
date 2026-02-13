import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function GenerateProfessionalReport() {
  const [selected, setSelected] = React.useState('');

  const { data: pros = [] } = useQuery({
    queryKey: ['allProsForReports'],
    queryFn: async () => {
      const res = await base44.entities.UserProfile.list({ limit: 1000 });
      return (res.data || []).filter(p => p.type === 'professional');
    }
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const p = pros.find(x => x.id === selected);
      if (!p) throw new Error('Selecione um profissional');
      const [appts, nurse, creations, products] = await Promise.all([
        base44.entities.Appointment.list({ query: { professional_email: p.user_email }, limit: 2000 }),
        base44.entities.NurseInteraction.list({ query: { user_email: p.user_email }, limit: 2000 }),
        base44.entities.AICreation.list({ query: { owner_email: p.user_email }, limit: 2000 }),
        base44.entities.Product.list({ query: { owner_email: p.user_email }, limit: 2000 })
      ]);

      const summary = {
        appointments_count: appts.data?.length || 0,
        nurse_count: nurse.data?.length || 0,
        chatbots: (creations.data || []).filter(c => c.type === 'chatbot').length,
        sites: (creations.data || []).filter(c => c.type === 'landing_page').length,
        designs: (creations.data || []).filter(c => c.type === 'design_project').length,
        products_count: products.data?.length || 0,
      };

      const prompt = `Elabore um RELATÓRIO FORMAL e executivo, em pt-BR, para o profissional ${p.user_email}.
      Inclua seções com números e percentuais quando possível: Visão Geral, Crescimento e Retenção, Tráfego e Engajamento, Gargalos e Oportunidades, Recomendações Prioritárias.
      Métricas de base:\n${JSON.stringify(summary, null, 2)}`;

      const llm = await base44.integrations.Core.InvokeLLM({ prompt });
      const reportText = typeof llm === 'string' ? llm : (llm?.text || JSON.stringify(llm));

      await base44.integrations.Core.SendEmail({
        to: p.user_email,
        subject: 'Relatório de Métricas - Geração Manual',
        body: reportText
      });

      await base44.entities.Notification.create({
        recipient_email: p.user_email,
        title: 'Relatório de métricas enviado',
        message: 'Seu relatório individual foi enviado para o seu e-mail.',
        created_at: new Date().toISOString(),
        is_read: false
      });
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Relatório Individual por Profissional</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row gap-3">
        <Select value={selected} onValueChange={setSelected}>
          <SelectTrigger className="w-full sm:w-[300px]"><SelectValue placeholder="Selecionar profissional" /></SelectTrigger>
          <SelectContent>
            {pros.map(p => (
              <SelectItem key={p.id} value={p.id}>{p.user_email}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => mutation.mutate()} disabled={!selected || mutation.isPending} className="bg-[#D4A574] hover:bg-[#C49565] text-white">
          {mutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Gerando...</> : 'Gerar Relatório Agora'}
        </Button>
      </CardContent>
    </Card>
  );
}