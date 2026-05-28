// Backend Function: Scheduled professional reports
// Requires Backend Functions enabled. Configure schedules:
// - Growth: every Friday at 20:00 (America/Sao_Paulo)
// - Clinic: every day at 20:00 (America/Sao_Paulo)

export default async function handler(req, res, { base44 }) {
  try {
    // Fetch professionals with report preferences enabled
    const { data: profiles } = await base44.asServiceRole.entities.UserProfile.list({ limit: 2000 });
    const pros = (profiles || []).filter(p => p.type === 'professional' && p.report_preferences?.enabled);

    const now = new Date();
    const tz = 'America/Sao_Paulo';
    const hour = now.toLocaleTimeString('pt-BR', { timeZone: tz, hour: '2-digit', minute: '2-digit' });
    const weekday = now.toLocaleDateString('pt-BR', { timeZone: tz, weekday: 'long' }).toLowerCase();

    const shouldRunFor = (pref, plan) => {
      const timeOk = (pref.time || '20:00') === hour;
      if (!timeOk) return false;
      if (plan === 'clinic') {
        return pref.frequency === 'daily' || (pref.frequency === 'weekly' && (pref.weekday || 'sexta-feira') === weekday);
      }
      if (plan === 'growth') {
        return (pref.frequency || 'weekly') === 'weekly' && (pref.weekday || 'sexta-feira') === weekday;
      }
      return false;
    };

    for (const p of pros) {
      const plan = (p.plan || '').toLowerCase();
      const pref = p.report_preferences || {};
      if (!shouldRunFor(pref, plan)) continue;

      // Gather user metrics
      const [appts, nurse, creations, products] = await Promise.all([
        base44.asServiceRole.entities.Appointment.list({ query: { professional_email: p.user_email }, limit: 2000 }),
        base44.asServiceRole.entities.NurseInteraction.list({ query: { user_email: p.user_email }, limit: 2000 }),
        base44.asServiceRole.entities.AICreation.list({ query: { owner_email: p.user_email }, limit: 2000 }),
        base44.asServiceRole.entities.Product.list({ query: { owner_email: p.user_email }, limit: 2000 })
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
      Métricas de base:
      - Agendamentos: ${summary.appointments_count}
      - Interações IA: ${summary.nurse_count}
      - Chatbots: ${summary.chatbots}
      - Sites: ${summary.sites}
      - Designs: ${summary.designs}
      - Produtos: ${summary.products_count}
      Tom: claro, conciso, pronto para apresentação em eventos e reuniões.`;

      const llm = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt });
      const reportText = typeof llm === 'string' ? llm : (llm?.text || JSON.stringify(llm));

      // Email
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: p.user_email,
        subject: `Relatório de Métricas - ${new Date().toLocaleDateString('pt-BR', { timeZone: tz })}`,
        body: reportText
      });

      // In-app notification
      await base44.asServiceRole.entities.Notification.create({
        recipient_email: p.user_email,
        title: 'Relatório de métricas enviado',
        message: 'Seu relatório individual foi enviado para o seu e-mail. Confira sua caixa de entrada.',
        created_at: new Date().toISOString(),
        is_read: false
      });
    }

    res.status(200).json({ status: 'ok', processed: pros?.length || 0 });
  } catch (e) {
    res.status(500).json({ status: 'error', details: String(e) });
  }
}