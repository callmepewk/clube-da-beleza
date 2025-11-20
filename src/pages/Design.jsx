import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Image as ImageIcon, Wand2, Download } from 'lucide-react';

export default function DesignPage() {
  const [mode, setMode] = useState('text_to_design'); // text_to_design or image_remix
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState(null);

  const generateDesignMutation = useMutation({
    mutationFn: async () => {
      // Simulation of Design AI - usually would invoke Image Gen or custom layout engine
      // Here we use GenerateImage for the "slide/post" look
      const res = await base44.integrations.Core.GenerateImage({
        prompt: `Design profissional de slide ou post instagram sobre: ${prompt}. Estilo clean, médico, tipografia moderna. Alta qualidade, 4k.`
      });
      return res.url;
    },
    onSuccess: (url) => {
      setResult(url);
    }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Estúdio de Design & Projetos</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="font-semibold text-lg">Criar Novo Design</h2>
              
              <div className="flex gap-2 mb-4">
                <Button 
                  variant={mode === 'text_to_design' ? 'default' : 'outline'} 
                  onClick={() => setMode('text_to_design')}
                  className="flex-1 text-xs"
                >
                  Texto p/ Design
                </Button>
                <Button 
                  variant={mode === 'image_remix' ? 'default' : 'outline'}
                  onClick={() => setMode('image_remix')}
                  className="flex-1 text-xs"
                >
                  Remixar Imagem
                </Button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">O que você quer criar?</label>
                <textarea
                  className="w-full h-32 p-3 border rounded-md bg-slate-50 text-sm"
                  placeholder="Ex: Um post para instagram anunciando Botox Day, com fundo dourado e branco..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>

              <Button 
                onClick={() => generateDesignMutation.mutate()}
                disabled={!prompt || generateDesignMutation.isPending}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {generateDesignMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Criando Arte...</>
                ) : (
                  <><Wand2 className="w-4 h-4 mr-2" /> Gerar Design</>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl min-h-[500px] flex items-center justify-center relative overflow-hidden">
            {result ? (
              <div className="relative w-full h-full flex items-center justify-center bg-slate-800">
                <img src={result} alt="Generated Design" className="max-h-full max-w-full object-contain" />
                <div className="absolute top-4 right-4">
                  <a href={result} target="_blank" download>
                    <Button variant="secondary" size="sm">
                      <Download className="w-4 h-4 mr-2" /> Baixar
                    </Button>
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-400">
                <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Seu design aparecerá aqui</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}