// Placeholder file, this should be overridden by the generated code


import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import TrendsRealtime from '@/components/admin/TrendsRealtime';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function Home() {
  const { data: news } = useQuery({
    queryKey: ['homeNews'],
    queryFn: async () => {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Traga 3 notícias reais e atuais de estética/dermatologia/beleza com {title, summary, url, image_url, source, date} e retorne JSON`,
        add_context_from_internet: true,
        response_json_schema: { type: 'object', properties: { news: { type: 'array', items: { type: 'object', properties: { title:{type:'string'}, summary:{type:'string'}, url:{type:'string'}, image_url:{type:'string'}, source:{type:'string'}, date:{type:'string'} } } } } }
      });
      return res?.news || [];
    },
    staleTime: 60_000
  });

  return (
    <div className="space-y-8">
      <div className="relative rounded-3xl overflow-hidden border border-[#D4A574]/20 bg-[#FEFBF7]">
        <div className="p-8 md:p-12">
          <h1 className="text-4xl font-light text-[#2D2416] mb-3">Clube da Beleza</h1>
          <p className="text-[#6B5D4F] max-w-2xl">Por que existimos, como fazemos e o que entregamos: nosso Golden Circle para transformar o autocuidado no Brasil.</p>
          <div className="mt-5">
            <Button asChild className="bg-[#D4A574] hover:bg-[#C49565] text-white">
              <a href="https://clube-mais.base44.app/goldendoctors" target="_blank" rel="noopener noreferrer">Conheça mais</a>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-[#FEFBF7] border-[#D4A574]/20">
          <CardHeader><CardTitle className="text-[#2D2416]">Notícias em destaque</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {news?.map((n,i) => (
                <a key={i} href={n.url} target="_blank" rel="noopener noreferrer" className="group border rounded-xl overflow-hidden hover:shadow-md transition">
                  {n.image_url && <img src={n.image_url} alt={n.title} className="h-32 w-full object-cover" />}
                  <div className="p-3">
                    <div className="text-xs text-slate-500 mb-1">{n.source} • {n.date}</div>
                    <div className="text-sm font-medium text-[#2D2416] group-hover:text-[#D4A574]">{n.title}</div>
                  </div>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
        <TrendsRealtime />
      </div>
    </div>
  );
}