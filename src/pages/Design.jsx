import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Image as ImageIcon, Wand2, Download, MessageSquare, Type, Send } from 'lucide-react';

export default function DesignPage() {
  const [mode, setMode] = useState('text_to_design'); // text_to_design or image_remix
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [showTextTool, setShowTextTool] = useState(false);
  const [textConfig, setTextConfig] = useState({ content: '', position: 'center', style: 'modern' });

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
      setChatHistory(prev => [...prev, { role: 'system', content: 'Design gerado com sucesso! O que achou?' }]);
    }
  });

  const chatMutation = useMutation({
     mutationFn: async () => {
        const newHistory = [...chatHistory, { role: 'user', content: chatMessage }];
        setChatHistory(newHistory);
        setChatMessage('');
        
        // Simulate AI understanding and re-generating
        // In a real app, this would update the prompt context and trigger regeneration
        const response = "Entendi. Vou aplicar essas alterações no design. Aguarde um momento...";
        setChatHistory([...newHistory, { role: 'assistant', content: response }]);
        
        const newPrompt = `${prompt}. Alterações solicitadas: ${chatMessage}`;
        const res = await base44.integrations.Core.GenerateImage({
           prompt: newPrompt
        });
        setResult(res.url);
        return res.url;
     }
  });

  const addTextMutation = useMutation({
     mutationFn: async () => {
        const newPrompt = `${prompt}. Adicionar texto: "${textConfig.content}" na posição ${textConfig.position}, estilo ${textConfig.style}.`;
        const res = await base44.integrations.Core.GenerateImage({ prompt: newPrompt });
        setResult(res.url);
        setShowTextTool(false);
     }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0F172A]">Estúdio de Design & Projetos</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          {/* Legend / Explanation */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 text-sm text-blue-800">
            <h3 className="font-bold mb-2">Como funcionam as opções:</h3>
            <div className="space-y-2">
              <div>
                <span className="font-semibold">1. Texto para Design:</span> Crie imagens do zero descrevendo o que você quer. A IA gera uma imagem única baseada na sua descrição.
              </div>
              <div>
                <span className="font-semibold">2. Remix de Imagem:</span> Faça upload de uma imagem existente e peça alterações. A IA manterá a estrutura base e aplicará o estilo ou modificações solicitadas.
              </div>
            </div>
          </div>

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

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl min-h-[500px] flex items-center justify-center relative overflow-hidden group">
            {result ? (
              <div className="relative w-full h-full flex items-center justify-center bg-slate-800">
                <img src={result} alt="Generated Design" className="max-h-full max-w-full object-contain" />
                
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setShowTextTool(!showTextTool)}>
                    <Type className="w-4 h-4 mr-2" /> Adicionar Texto
                  </Button>
                  <a href={result} target="_blank" download>
                    <Button variant="secondary" size="sm">
                      <Download className="w-4 h-4 mr-2" /> Baixar
                    </Button>
                  </a>
                </div>

                {showTextTool && (
                   <div className="absolute top-16 right-4 bg-white p-4 rounded-lg shadow-xl w-64 space-y-3 animate-in fade-in slide-in-from-top-2">
                      <h4 className="font-bold text-sm">Adicionar Texto</h4>
                      <input 
                        className="w-full border p-2 rounded text-sm" 
                        placeholder="Texto (ex: Promoção 50%)"
                        value={textConfig.content}
                        onChange={e => setTextConfig({...textConfig, content: e.target.value})}
                      />
                      <select 
                        className="w-full border p-2 rounded text-sm"
                        value={textConfig.position}
                        onChange={e => setTextConfig({...textConfig, position: e.target.value})}
                      >
                         <option value="center">Centro</option>
                         <option value="top">Topo</option>
                         <option value="bottom">Base</option>
                         <option value="top-left">Canto Sup. Esq.</option>
                         <option value="bottom-right">Canto Inf. Dir.</option>
                      </select>
                      <input 
                        className="w-full border p-2 rounded text-sm" 
                        placeholder="Estilo (ex: Dourado, Grande)"
                        value={textConfig.style}
                        onChange={e => setTextConfig({...textConfig, style: e.target.value})}
                      />
                      <Button size="sm" className="w-full bg-indigo-600" onClick={() => addTextMutation.mutate()} disabled={addTextMutation.isPending}>
                         {addTextMutation.isPending ? <Loader2 className="animate-spin w-3 h-3" /> : 'Aplicar na Imagem'}
                      </Button>
                   </div>
                )}
              </div>
            ) : (
              <div className="text-center text-slate-400">
                <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Seu design aparecerá aqui</p>
              </div>
            )}
          </div>

          {/* Chat Interface for Changes */}
          {result && (
             <div className="bg-white border border-slate-200 rounded-xl p-4 h-64 flex flex-col">
                <div className="flex items-center gap-2 mb-2 border-b pb-2">
                   <MessageSquare className="w-4 h-4 text-indigo-600" />
                   <span className="font-bold text-sm">Assistente de Design</span>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2 mb-2 pr-2">
                   {chatHistory.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                         <div className={`max-w-[80%] p-2 rounded-lg text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
                            {msg.content}
                         </div>
                      </div>
                   ))}
                   {chatMutation.isPending && (
                      <div className="flex justify-start"><div className="bg-slate-100 p-2 rounded-lg text-xs text-slate-500 italic">Gerando nova versão...</div></div>
                   )}
                </div>
                <div className="flex gap-2">
                   <input 
                     className="flex-1 border rounded-md px-3 py-2 text-sm"
                     placeholder="Peça alterações (ex: mude o fundo para azul, aumente o texto...)"
                     value={chatMessage}
                     onChange={e => setChatMessage(e.target.value)}
                     onKeyDown={e => e.key === 'Enter' && chatMutation.mutate()}
                   />
                   <Button size="icon" onClick={() => chatMutation.mutate()} disabled={!chatMessage || chatMutation.isPending}>
                      <Send className="w-4 h-4" />
                   </Button>
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}