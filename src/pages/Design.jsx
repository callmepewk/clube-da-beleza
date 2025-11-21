import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Image as ImageIcon, Wand2, Download, MessageSquare, Type, Send } from 'lucide-react';
import UsageLimitBanner from '@/components/usage/UsageLimitBanner';
import { getPlanLimits, canUseFeature, getCurrentMonth, sendWhatsAppMessage } from '@/components/usage/usageLimits';
import T from '@/components/TranslatedText';

const DESIGN_SIZES = {
  instagram: {
    post: { width: 1080, height: 1080, label: 'Instagram Post (Quadrado)' },
    story: { width: 1080, height: 1920, label: 'Instagram Stories' },
    reel: { width: 1080, height: 1920, label: 'Instagram Reels' },
    carousel: { width: 1080, height: 1080, label: 'Instagram Carrossel' }
  },
  facebook: {
    post: { width: 1200, height: 630, label: 'Facebook Post' },
    cover: { width: 820, height: 312, label: 'Facebook Capa' },
    story: { width: 1080, height: 1920, label: 'Facebook Stories' }
  },
  linkedin: {
    post: { width: 1200, height: 627, label: 'LinkedIn Post' },
    banner: { width: 1584, height: 396, label: 'LinkedIn Banner' }
  },
  youtube: {
    thumbnail: { width: 1280, height: 720, label: 'YouTube Thumbnail' },
    banner: { width: 2560, height: 1440, label: 'YouTube Banner' }
  },
  tiktok: {
    video: { width: 1080, height: 1920, label: 'TikTok Vídeo' }
  },
  outros: {
    logo: { width: 512, height: 512, label: 'Logo Quadrado' },
    banner_site: { width: 1920, height: 600, label: 'Banner Site' },
    promocao: { width: 1200, height: 1200, label: 'Banner Promoção' },
    cartao: { width: 1050, height: 600, label: 'Cartão de Visita' }
  }
};

export default function DesignPage() {
  const [mode, setMode] = useState('text_to_design');
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [showTextTool, setShowTextTool] = useState(false);
  const [textConfig, setTextConfig] = useState({ content: '', position: 'center', style: 'modern' });
  const [selectedPlatform, setSelectedPlatform] = useState('instagram');
  const [selectedSize, setSelectedSize] = useState('post');
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['userProfileDesign'],
    queryFn: async () => {
      const user = await base44.auth.me();
      if (!user) return null;
      const profiles = await base44.entities.UserProfile.list({ query: { user_email: user.email } });
      return profiles?.data?.[0] || null;
    },
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const planLimits = getPlanLimits(profile?.plan);
  const currentMonth = getCurrentMonth();
  const currentUsage = profile?.monthly_usage?.month === currentMonth ? profile?.monthly_usage?.designs_created || 0 : 0;
  const canCreate = canUseFeature(currentUsage, planLimits.designs);

  const generateDesignMutation = useMutation({
    mutationFn: async () => {
      if (!canCreate) {
        if (planLimits.designs >= 20) {
          sendWhatsAppMessage(user?.full_name || 'Usuário', 'criação de mais designs');
          throw new Error('Limite atingido. Mensagem enviada à secretaria.');
        }
        throw new Error('Limite atingido. Faça upgrade para criar mais designs.');
      }

      const sizeInfo = DESIGN_SIZES[selectedPlatform]?.[selectedSize];
      const dimensionText = sizeInfo ? `${sizeInfo.width}x${sizeInfo.height}px, formato ${sizeInfo.label}` : '';

      const res = await base44.integrations.Core.GenerateImage({
        prompt: `Design profissional: ${prompt}. Dimensões: ${dimensionText}. Estilo clean, medicina estética, tipografia moderna, alta qualidade, otimizado para ${selectedPlatform}.`
      });
      return res.url;
    },
    onSuccess: async (url) => {
      setResult(url);
      setChatHistory(prev => [...prev, { role: 'system', content: 'Design gerado com sucesso! O que achou?' }]);
      
      const month = getCurrentMonth();
      const usage = profile.monthly_usage || {};
      if (usage.month !== month) {
        await base44.entities.UserProfile.update(profile.id, {
          monthly_usage: { month, designs_created: 1, nurse_conversations: 0, chatbots_created: 0, sites_created: 0, products_created: 0, ai_packages_created: 0 }
        });
      } else {
        await base44.entities.UserProfile.update(profile.id, {
          monthly_usage: { ...usage, designs_created: (usage.designs_created || 0) + 1 }
        });
      }
      queryClient.invalidateQueries(['userProfileDesign']);
    },
    onError: (error) => {
      alert(error.message);
    }
  });

  const chatMutation = useMutation({
     mutationFn: async (message) => {
        const newHistory = [...chatHistory, { role: 'user', content: message }];
        setChatHistory(newHistory);
        
        const response = "Entendi. Vou aplicar essas alterações no design. Aguarde um momento...";
        setChatHistory([...newHistory, { role: 'assistant', content: response }]);
        
        const sizeInfo = DESIGN_SIZES[selectedPlatform]?.[selectedSize];
        const dimensionText = sizeInfo ? `${sizeInfo.width}x${sizeInfo.height}px, formato ${sizeInfo.label}` : '';
        
        const newPrompt = `${prompt}. Alterações solicitadas: ${message}. Dimensões: ${dimensionText}. Estilo clean, medicina estética, otimizado para ${selectedPlatform}.`;
        const res = await base44.integrations.Core.GenerateImage({
           prompt: newPrompt
        });
        setResult(res.url);
        setChatHistory(prev => [...prev, { role: 'assistant', content: 'Design atualizado! Como ficou?' }]);
        return res.url;
     },
     onError: (error) => {
        setChatHistory(prev => [...prev, { role: 'assistant', content: 'Desculpe, houve um erro ao gerar a alteração. Tente novamente.' }]);
     }
  });

  const addTextMutation = useMutation({
     mutationFn: async () => {
        if (!textConfig.content) {
          throw new Error('Digite o texto que deseja adicionar.');
        }
        const sizeInfo = DESIGN_SIZES[selectedPlatform]?.[selectedSize];
        const dimensionText = sizeInfo ? `${sizeInfo.width}x${sizeInfo.height}px` : '';
        const newPrompt = `${prompt}. Adicionar texto: "${textConfig.content}" na posição ${textConfig.position}, estilo ${textConfig.style}. Dimensões: ${dimensionText}.`;
        const res = await base44.integrations.Core.GenerateImage({ prompt: newPrompt });
        setResult(res.url);
        setShowTextTool(false);
        setTextConfig({ content: '', position: 'center', style: 'modern' });
     },
     onError: (error) => {
        alert(error.message || 'Erro ao adicionar texto. Tente novamente.');
     }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start gap-4">
        <T as="h1" className="text-2xl font-bold text-[#0F172A]">Estúdio de Design & Projetos</T>
        <UsageLimitBanner 
          currentUsage={currentUsage}
          limit={planLimits.designs}
          resourceName="Designs"
          planName={planLimits.name}
        />
      </div>
      
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
                <label className="text-sm font-medium text-slate-700">Selecione o Formato *</label>
                <div className="grid grid-cols-2 gap-2">
                  <select 
                    className="border rounded-md p-2 text-sm bg-white"
                    value={selectedPlatform}
                    onChange={(e) => {
                      setSelectedPlatform(e.target.value);
                      setSelectedSize(Object.keys(DESIGN_SIZES[e.target.value])[0]);
                    }}
                  >
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="youtube">YouTube</option>
                    <option value="tiktok">TikTok</option>
                    <option value="outros">Outros</option>
                  </select>
                  <select 
                    className="border rounded-md p-2 text-sm bg-white"
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                  >
                    {Object.entries(DESIGN_SIZES[selectedPlatform] || {}).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                </div>
                <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded">
                  📐 Tamanho: {DESIGN_SIZES[selectedPlatform]?.[selectedSize]?.width} × {DESIGN_SIZES[selectedPlatform]?.[selectedSize]?.height}px
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">O que você quer criar?</label>
                <textarea
                  className="w-full h-32 p-3 border rounded-md bg-slate-50 text-sm"
                  placeholder="Ex: Promoção de Botox Day, fundo dourado e branco, foto de mulher sorrindo..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  <button onClick={() => {setPrompt("Antes e Depois de Harmonização Facial, estilo minimalista e clean."); setSelectedPlatform('instagram'); setSelectedSize('post');}} className="text-xs bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-full transition-colors">Post Antes/Depois</button>
                  <button onClick={() => {setPrompt("Promoção de Botox Day com 30% OFF, fundo dourado, texto elegante, chamada para ação."); setSelectedPlatform('instagram'); setSelectedSize('story');}} className="text-xs bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-full transition-colors">Story Promoção</button>
                  <button onClick={() => {setPrompt("Banner de clínica de estética moderna, foto de recepção luxuosa, tons pastéis."); setSelectedPlatform('outros'); setSelectedSize('banner_site');}} className="text-xs bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-full transition-colors">Banner Site</button>
                  <button onClick={() => {setPrompt("Logo minimalista para clínica de dermatologia, símbolo abstrato de pele, azul e dourado."); setSelectedPlatform('outros'); setSelectedSize('logo');}} className="text-xs bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-full transition-colors">Logo</button>
                </div>
              </div>

              <Button 
                onClick={() => generateDesignMutation.mutate()}
                disabled={!prompt || generateDesignMutation.isPending || !canCreate}
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
                    onKeyDown={e => {
                      if (e.key === 'Enter' && chatMessage && !chatMutation.isPending) {
                        chatMutation.mutate(chatMessage);
                        setChatMessage('');
                      }
                    }}
                  />
                  <Button size="icon" onClick={() => { chatMutation.mutate(chatMessage); setChatMessage(''); }} disabled={!chatMessage || chatMutation.isPending}>
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