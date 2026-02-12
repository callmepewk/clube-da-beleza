import React, { useState, useEffect, useMemo, useDeferredValue } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, ExternalLink, Newspaper, TrendingUp, Stethoscope, Laptop } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import T from '@/components/TranslatedText';
import PerformanceMetrics from '@/components/perf/PerformanceMetrics';

export default function NewsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const deferredTab = useDeferredValue(activeTab);
  const [fetchMs, setFetchMs] = useState(0);
  const queryClient = useQueryClient();

  const { data: news, isLoading } = useQuery({
    queryKey: ['professionalNews', deferredTab],
    queryFn: async () => {
      const cacheKey = `news_cache_${deferredTab}`;
      const now = Date.now();
      try {
        const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
        if (cached && now - cached.ts < 1000 * 60 * 60) {
          return cached.data;
        }
      } catch {}

      const categoriesStr = deferredTab === 'all' 
        ? "saúde, tecnologia, medicina, estética, beleza, moda, tendências"
        : deferredTab;

      const prompt = `
        Busque e gere 6 notícias REAIS e ATUAIS (da última semana) sobre: ${categoriesStr}.
        Para cada notícia, retorne: titulo, resumo, categoria, nome da fonte (ex: TechCrunch, Vogue, CNN) e uma data recente.
        Retorne JSON array.
      `;

      const start = performance.now();
      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            news: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  summary: { type: "string" },
                  category: { type: "string" },
                  source: { type: "string" },
                  date: { type: "string" }
                }
              }
            }
          }
        }
      });
      setFetchMs(performance.now() - start);
      const data = res.news || [];
      try { localStorage.setItem(cacheKey, JSON.stringify({ ts: now, data })); } catch {}
      return data;
    },
    staleTime: 1000 * 60 * 60, // 1h
    gcTime: 1000 * 60 * 60 * 6, // 6h in cache
    refetchOnWindowFocus: false,
    retry: 1,
    keepPreviousData: true
  });

  const categories = [
    { id: 'all', label: 'Todas', translationKey: 'Todas' },
    { id: 'medicina', label: 'Medicina', translationKey: 'Medicina' },
    { id: 'tecnologia', label: 'Tecnologia', translationKey: 'Tecnologia' },
    { id: 'estetica', label: 'Estética', translationKey: 'Estética' },
    { id: 'negocios', label: 'Negócios', translationKey: 'Negócios' }
  ];

  // Prefetch other categories in idle time to warm cache without blocking UI
  useEffect(() => {
    const ids = ['all', 'medicina', 'tecnologia', 'estetica', 'negocios'].filter(id => id !== deferredTab);
    const now = Date.now();
    const needs = ids.filter(id => {
      try {
        const c = JSON.parse(localStorage.getItem(`news_cache_${id}`) || 'null');
        return !(c && now - c.ts < 1000 * 60 * 60);
      } catch { return true; }
    });
    if (needs.length === 0) return;

    const timer = setTimeout(() => {
      needs.forEach((id) => {
        queryClient.prefetchQuery({
          queryKey: ['professionalNews', id],
          queryFn: async () => {
            const categoriesStr = id === 'all' ? "saúde, tecnologia, medicina, estética, beleza, moda, tendências" : id;
            const prompt = `
              Busque e gere 6 notícias REAIS e ATUAIS (da última semana) sobre: ${categoriesStr}.
              Para cada notícia, retorne: titulo, resumo, categoria, nome da fonte (ex: TechCrunch, Vogue, CNN) e uma data recente.
              Retorne JSON array.
            `;
            const res = await base44.integrations.Core.InvokeLLM({
              prompt,
              add_context_from_internet: true,
              response_json_schema: {
                type: 'object',
                properties: {
                  news: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        title: { type: 'string' },
                        summary: { type: 'string' },
                        category: { type: 'string' },
                        source: { type: 'string' },
                        date: { type: 'string' }
                      }
                    }
                  }
                }
              }
            });
            const data = res.news || [];
            try { localStorage.setItem(`news_cache_${id}`, JSON.stringify({ ts: Date.now(), data })); } catch {}
            return data;
          },
          staleTime: 1000 * 60 * 60,
          gcTime: 1000 * 60 * 60 * 6
        });
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [deferredTab, queryClient]);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center gap-3">
         <div className="bg-blue-100 p-3 rounded-xl">
            <Newspaper className="w-8 h-8 text-blue-600" />
         </div>
         <div>
            <T as="h1" className="text-3xl font-bold text-slate-900">Portal de Notícias & Tendências</T>
            <T as="p" className="text-slate-500">Atualizações semanais para profissionais e parceiros.</T>
         </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent p-0">
           {categories.map(cat => (
              <TabsTrigger 
               key={cat.id} 
               value={cat.id}
               className="data-[state=active]:bg-blue-600 data-[state=active]:text-white bg-white border border-slate-200 px-6 py-2 rounded-full"
              >
               <T>{cat.translationKey}</T>
              </TabsTrigger>
           ))}
        </TabsList>

        <TabsContent value={activeTab}>
           {isLoading ? (
             <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-600" />
                <T as="p">Buscando as últimas notícias do setor...</T>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {news?.map((item, i) => (
                   <Card key={i} className="hover:shadow-lg transition-shadow border-slate-200 flex flex-col overflow-hidden group">
                      <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                      <CardHeader>
                         <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded uppercase">{item.category}</span>
                            <span className="text-xs text-slate-400">{item.date}</span>
                         </div>
                         <CardTitle className="text-lg leading-tight group-hover:text-blue-700 transition-colors">{item.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1">
                         <p className="text-slate-600 text-sm leading-relaxed">{item.summary}</p>
                      </CardContent>
                      <CardFooter className="border-t bg-slate-50 pt-4">
                         <div className="flex justify-between w-full items-center">
                            <span className="text-xs font-bold text-slate-500">{item.source}</span>
                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800 p-0 hover:bg-transparent">
                               <T>Ler Completo</T> <ExternalLink className="w-3 h-3 ml-1" />
                            </Button>
                         </div>
                      </CardFooter>
                   </Card>
                ))}
             </div>
           )}
        </TabsContent>
      </Tabs>
      <PerformanceMetrics pageName="news" fetchTimeMs={fetchMs} />
    </div>
  );
}