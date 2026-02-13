import React from 'react';

export default function OnePageReport({ mode = 'admin', data = {} }) {
  const palette = {
    bg: '#FFFFFF',
    cardBg: '#FEFBF7',
    textPrimary: '#2D2416',
    textSecondary: '#6B5D4F',
    accent: '#D4A574',
    border: 'rgba(212,165,116,0.2)'
  };

  const title = mode === 'admin' ? 'Relatório Executivo - Admin' : 'Relatório Executivo - Profissional';
  const today = new Date().toLocaleDateString('pt-BR');

  const {
    usersCount = 0,
    appointmentsCount = 0,
    nurseCount = 0,
    estimatedRevenue = 0,
    bannerViews = 0,
    bannerClicks = 0,
    bannerCTR = 0,
  } = data || {};

  const kpiTile = (label, value, note) => (
    <div className="rounded-xl p-4" style={{ background: palette.cardBg, border: `1px solid ${palette.border}` }}>
      <div className="text-xs uppercase tracking-wider" style={{ color: palette.textSecondary }}>{label}</div>
      <div className="text-3xl font-light" style={{ color: palette.textPrimary }}>{value}</div>
      {note && <div className="text-xs mt-1" style={{ color: palette.textSecondary }}>{note}</div>}
    </div>
  );

  return (
    <div
      className="w-[794px] h-[1123px] p-8 flex flex-col justify-between"
      style={{ background: palette.bg, color: palette.textPrimary }}
    >
      {/* Header */}
      <header>
        <div className="flex items-center justify-between">
          <div>
            <div className="tracking-[0.2em] text-xl">CLUBE DA BELEZA</div>
            <div className="mt-1 text-sm" style={{ color: palette.textSecondary }}>{title}</div>
          </div>
          <div className="text-sm" style={{ color: palette.textSecondary }}>Data: {today}</div>
        </div>
        <div className="h-px w-full mt-4" style={{ background: `linear-gradient(90deg, transparent, ${palette.accent}, transparent)` }} />
      </header>

      {/* Body - KPIs */}
      <section className="mt-6 flex-1">
        <div className="grid grid-cols-2 gap-4">
          {kpiTile('Total de Usuários', usersCount.toLocaleString('pt-BR'))}
          {kpiTile('Agendamentos', appointmentsCount.toLocaleString('pt-BR'))}
          {kpiTile('Interações IA (Nurse)', nurseCount.toLocaleString('pt-BR'))}
          {kpiTile('Faturamento Estimado', `R$ ${Number(estimatedRevenue).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Base R$ 250/consulta')}

          {/* Banners Block spans 2 columns */}
          <div className="col-span-2 rounded-xl p-4" style={{ background: palette.cardBg, border: `1px solid ${palette.border}` }}>
            <div className="text-xs uppercase tracking-wider" style={{ color: palette.textSecondary }}>Banners (Tráfego)</div>
            <div className="mt-2 grid grid-cols-3 gap-4">
              <div>
                <div className="text-2xl font-light" style={{ color: palette.textPrimary }}>{bannerViews.toLocaleString('pt-BR')}</div>
                <div className="text-xs" style={{ color: palette.textSecondary }}>Views</div>
              </div>
              <div>
                <div className="text-2xl font-light" style={{ color: palette.textPrimary }}>{bannerClicks.toLocaleString('pt-BR')}</div>
                <div className="text-xs" style={{ color: palette.textSecondary }}>Cliques</div>
              </div>
              <div>
                <div className="text-2xl font-light" style={{ color: palette.textPrimary }}>{bannerCTR.toFixed(2)}%</div>
                <div className="text-xs" style={{ color: palette.textSecondary }}>CTR</div>
              </div>
            </div>
            <div className="mt-3 h-1 w-full rounded" style={{ background: '#EDE7DD' }}>
              <div
                className="h-1 rounded"
                style={{ width: `${Math.min(100, bannerCTR)}%`, background: palette.accent }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Notes / Footer */}
      <footer>
        <div className="h-px w-full mb-3" style={{ background: `linear-gradient(90deg, transparent, ${palette.accent}, transparent)` }} />
        <div className="text-[10px] leading-4" style={{ color: palette.textSecondary }}>
          • Relatório 1 página (A4 Retrato). • Dados sujeitos a atualização em tempo real. • Uso interno do Clube da Beleza.
        </div>
      </footer>
    </div>
  );
}