import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function TrendsRealtime() {
  const { data: settings } = useQuery({
    queryKey: ['platformSettingsPublic'],
    queryFn: async () => {
      const res = await base44.entities.PlatformSettings.list({ limit: 1 });
      return res?.data?.[0] || null;
    }
  });

  const { data, isLoading } = useQuery({
    queryKey: ['trendsRealtime', settings?.trends_terms?.join('|') || ''],
    queryFn: async () => {
      const terms = (settings?.trends_terms || ['estética','dermatologia']).slice(0,5).join(', ');
      return await base44.integrations.Core.InvokeLLM({
        prompt: `Pesquise em tempo real nos portais e Google Trends os tópicos mais quentes relacionados a: ${terms}. Retorne um JSON com até 10 entradas {keyword, interest:number (0-100), change:string ('+x' ou '-x')} focado no Brasil e no segmento de beleza/saúde estética.`,
        add_context_from_internet: true,
        response_json_schema: { type: 'object', properties: { items: { type: 'array', items: { type: 'object', properties: { keyword: {type:'string'}, interest: {type:'number'}, change: {type:'string'} } } } } }
      });
    },
    enabled: !!settings,
    refetchInterval: 60000
  });

  const items = data?.items || [];

  return (
    <Card className="bg-[#FEFBF7] border-[#D4A574]/20">
      <CardHeader><CardTitle className="text-[#2D2416]">Tendências (tempo real)</CardTitle></CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2 text-[#6B5D4F]"><Loader2 className="w-4 h-4 animate-spin" />Carregando...</div>
        ) : items.length === 0 ? (
          <div className="text-[#6B5D4F]">Sem dados no momento.</div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {items.map((kw, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-white rounded-lg text-sm border">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#D4A574] text-white text-xs font-bold flex items-center justify-center">{idx+1}</span>
                  <span className="font-medium text-slate-700">{kw.keyword}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-600 font-bold">{Math.round(kw.interest || 0)}</span>
                  <span className={`font-bold text-xs ${String(kw.change||'').startsWith('+') ? 'text-green-600' : String(kw.change||'').startsWith('-') ? 'text-red-600' : 'text-slate-500'}`}>{kw.change || '0'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}