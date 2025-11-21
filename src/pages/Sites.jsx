import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2, Globe, ExternalLink, Save, Plus, Image as ImageIcon, FileText, Link as LinkIcon, Share2, Wand2, MessageSquare, Send, Layers, Layout } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import UsageLimitBanner from '@/components/usage/UsageLimitBanner';
import { getPlanLimits, canUseFeature, getCurrentMonth, sendWhatsAppMessage } from '@/components/usage/usageLimits';
import T from '@/components/TranslatedText';

export default function SitesPage() {
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState(null);
  const [siteImages, setSiteImages] = useState([]);
  const [imageConfig, setImageConfig] = useState({ count: 1, prompt: '', position: 'center' });
  
  // New options
  const [generateLink, setGenerateLink] = useState(true);
  const [targetImageCount, setTargetImageCount] = useState(3);
  const [imageUploadMode, setImageUploadMode] = useState('auto'); // auto (AI) or manual
  
  // Chat
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['userProfileSites'],
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

  const { data: sites } = useQuery({
    queryKey: ['mySites'],
    queryFn: async () => {
       const user = await base44.auth.me();
       const res = await base44.entities.AICreation.list({
           query: { type: 'landing_page', owner_email: user?.email }
       });
       return res?.data || [];
    }
  });

  const planLimits = getPlanLimits(profile?.plan);
  const currentMonth = getCurrentMonth();
  const currentUsage = profile?.monthly_usage?.month === currentMonth ? profile?.monthly_usage?.sites_created || 0 : 0;
  const canCreate = canUseFeature(currentUsage, planLimits.sites);

  const generateSiteMutation = useMutation({
    mutationFn: async (userPrompt) => {
      if (!canCreate) {
        if (planLimits.sites >= 10) {
          sendWhatsAppMessage(user?.full_name || 'Usuário', 'criação de mais sites');
          throw new Error('Limite atingido. Mensagem enviada à secretaria.');
        }
        throw new Error('Limite atingido. Faça upgrade para criar mais sites.');
      }

      const imageInstructions = siteImages.length > 0 
        ? `Inclua as seguintes imagens no layout (use as URLs fornecidas): ${JSON.stringify(siteImages)}. Respeite a posição solicitada (topo, centro, lateral, baixo).`
        : "Gere placeholders para imagens se necessário.";

      const response = await base44.integrations.Core.InvokeLLM({
      prompt: `
        Crie uma Landing Page completa e funcional baseada neste pedido: "${userPrompt}".
        ${imageInstructions}

        Retorne APENAS um objeto JSON com a seguinte estrutura (sem markdown em volta):
        {
          "title": "Titulo da Pagina",
          "html_content": "<div>...seu html completo com tailwind css inline...</div>",
          "theme": "medical"
        }

        Certifique-se que o HTML seja bonito, use classes tailwind, e seja responsivo.
      `,
      response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            html_content: { type: "string" },
            theme: { type: "string" }
          }
        }
      });
      return response; // integration returns the object directly if schema provided
    },
    onSuccess: async (data) => {
      setGeneratedContent(data);
      
      const month = getCurrentMonth();
      const usage = profile.monthly_usage || {};
      if (usage.month !== month) {
        await base44.entities.UserProfile.update(profile.id, {
          monthly_usage: { month, sites_created: 1, nurse_conversations: 0, chatbots_created: 0, designs_created: 0, products_created: 0, ai_packages_created: 0 }
        });
      } else {
        await base44.entities.UserProfile.update(profile.id, {
          monthly_usage: { ...usage, sites_created: (usage.sites_created || 0) + 1 }
        });
      }
      queryClient.invalidateQueries(['userProfileSites']);
    },
    onError: (error) => {
      alert(error.message);
    }
  });

  const saveSiteMutation = useMutation({
    mutationFn: async () => {
       const user = await base44.auth.me();
       await base44.entities.AICreation.create({
         owner_email: user.email,
         type: 'landing_page',
         title: generatedContent.title,
         content_data: generatedContent,
         public_url: `/site-preview/${Date.now()}`, // Simulation of external URL
         status: 'active'
       });
    },
    onSuccess: () => {
      setGeneratedContent(null);
      setPrompt('');
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <T as="h1" className="text-2xl font-bold text-[#0F172A]">Gerador de Landing Pages</T>
      </div>
      
      <UsageLimitBanner 
        currentUsage={currentUsage}
        limit={planLimits.sites}
        resourceName="Sites Criados"
        planName={planLimits.name}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <T as={CardTitle}>Nova Página com IA</T>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Configuration Section */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                 <div className="space-y-2">
                    <label className="text-xs font-medium flex items-center gap-1"><LinkIcon className="w-3 h-3" /> Gerar Link de Acesso?</label>
                    <div className="flex items-center h-10">
                       <input type="checkbox" className="w-4 h-4 mr-2 accent-emerald-600" checked={generateLink} onChange={e => setGenerateLink(e.target.checked)} />
                       <span className="text-sm">{generateLink ? 'Sim, gerar URL pública' : 'Não, apenas rascunho'}</span>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-medium flex items-center gap-1"><ImageIcon className="w-3 h-3" /> Quantidade de Imagens</label>
                    <input 
                      type="number" 
                      min="0" 
                      max="10" 
                      className="w-full border rounded p-2 h-9 text-sm" 
                      value={targetImageCount}
                      onChange={e => setTargetImageCount(parseInt(e.target.value))}
                    />
                 </div>
              </div>

              {/* Image Management Section */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
                 <div className="flex justify-between items-center">
                    <h4 className="font-bold text-sm text-slate-700 flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Gerenciamento de Imagens</h4>
                    <select 
                      className="text-xs border rounded p-1"
                      value={imageUploadMode}
                      onChange={e => setImageUploadMode(e.target.value)}
                    >
                       <option value="auto">Gerar com IA</option>
                       <option value="manual">Fazer Upload Manual</option>
                    </select>
                 </div>
                 
                 {imageUploadMode === 'manual' ? (
                 <div className="space-y-2 animate-in fade-in">
                    <label className="text-xs font-medium">Upload Manual</label>
                    <Button variant="outline" size="sm" className="w-full relative">
                          <input 
                             type="file" 
                             multiple
                             accept="image/*"
                             className="absolute inset-0 opacity-0 cursor-pointer"
                             onChange={async (e) => {
                                const files = Array.from(e.target.files);
                                if (siteImages.length + files.length > 10) {
                                   alert("Máximo de 10 imagens permitidas.");
                                   return;
                                }
                                for (const file of files) {
                                   const res = await base44.integrations.Core.UploadFile({ file });
                                   setSiteImages(prev => [...prev, { url: res.file_url, position: 'center' }]);
                                }
                             }}
                          />
                          <Plus className="w-3 h-3 mr-1" /> Carregar Imagens do Dispositivo
                       </Button>
                 </div>
                 ) : (
                 <div className="space-y-2 animate-in fade-in">
                    <label className="text-xs font-medium">IA Geradora</label>
                    <div className="flex gap-2">
                       <input 
                         className="flex-1 border rounded px-2 text-xs h-9" 
                         placeholder="Descreva a imagem (ex: consultório moderno)"
                         value={imageConfig.prompt}
                         onChange={(e) => setImageConfig({...imageConfig, prompt: e.target.value})}
                       />
                       <select 
                          className="border rounded px-2 text-xs h-9"
                          value={imageConfig.position}
                          onChange={e => setImageConfig({...imageConfig, position: e.target.value})}
                       >
                          <option value="center"><T>Centro</T></option>
                          <option value="header"><T>Topo (Header)</T></option>
                          <option value="background"><T>Fundo</T></option>
                          <option value="gallery"><T>Galeria</T></option>
                       </select>
                       <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={async () => {
                             if (siteImages.length >= 10) return;
                             const res = await base44.integrations.Core.GenerateImage({ prompt: imageConfig.prompt || "Medical clinic abstract background" });
                             setSiteImages(prev => [...prev, { url: res.url, position: imageConfig.position }]);
                          }}
                       >
                          <Wand2 className="w-3 h-3" /> Gerar
                       </Button>
                    </div>
                 </div>
                 )}

                 {siteImages.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto py-2">
                       {siteImages.map((img, i) => (
                          <div key={i} className="relative w-16 h-16 flex-shrink-0 group">
                             <img src={img.url} className="w-full h-full object-cover rounded-md border" />
                             <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-white text-xs cursor-pointer" onClick={() => {
                                const newPos = prompt('Posição (topo, centro, lateral, baixo):', img.position);
                                if(newPos) {
                                   const newImages = [...siteImages];
                                   newImages[i].position = newPos;
                                   setSiteImages(newImages);
                                }
                             }}>
                                {img.position}
                             </div>
                          </div>
                       ))}
                    </div>
                 )}
              </div>

              <div className="space-y-2">
                <T as="label" className="text-sm font-medium">Descreva sua página</T>
                <textarea
                  className="w-full min-h-[150px] p-3 border rounded-md bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="Ex: Uma página de captura para minha clínica de dermatologia, com foco em tratamento de acne, tons de azul e branco, formulário de contato..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
                
                {/* Suggestions Chips */}
                <div className="flex flex-wrap gap-2 mt-2">
                  <button 
                    onClick={() => setPrompt("Página inicial moderna para Cardiologista, tons de vermelho e branco, com seção de agendamento e depoimentos.")}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded-full transition-colors"
                  >
                    Cardiologista
                  </button>
                  <button 
                    onClick={() => setPrompt("Landing page elegante para Dermatologista, foco em estética, tons pastéis, galeria de antes e depois.")}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded-full transition-colors"
                  >
                    Dermatologista (Estética)
                  </button>
                  <button 
                    onClick={() => setPrompt("Site institucional para Clínica de Fisioterapia, verde e cinza, lista de serviços e equipe.")}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded-full transition-colors"
                  >
                    Clínica de Fisioterapia
                  </button>
                  <button 
                    onClick={() => setPrompt("Página de captura para Nutricionista, foco em emagrecimento, cores vibrantes, ebook grátis.")}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded-full transition-colors"
                  >
                    Nutricionista
                  </button>
                </div>
              </div>
              <Button 
                onClick={() => generateSiteMutation.mutate(prompt)}
                disabled={generateSiteMutation.isPending || !prompt || !canCreate}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                {generateSiteMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> <T>Gerando...</T></>
                ) : (
                  <><Globe className="w-4 h-4 mr-2" /> <T>Criar Página</T></>
                )}
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <T as="h3" className="font-semibold text-lg">Meus Sites</T>
            {sites?.map(site => (
              <Card key={site.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{site.title}</h4>
                    <p className="text-xs text-slate-500">Criado em {new Date(site.created_date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2">
                     <Button variant="outline" size="icon" title="Salvar como PDF" onClick={() => alert("Download do PDF iniciado...")}>
                        <FileText className="w-4 h-4" />
                     </Button>
                     <Button variant="outline" size="icon" title="Copiar Link Público" onClick={() => {
                        navigator.clipboard.writeText(`https://healthai.com${site.public_url}`);
                        alert("Link copiado para a área de transferência!");
                     }}>
                        <Share2 className="w-4 h-4" />
                     </Button>
                     <Button variant="outline" size="sm">
                       <ExternalLink className="w-4 h-4 mr-2" /> Visualizar
                     </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Preview Area */}
        <div className="bg-slate-100 rounded-xl border border-slate-200 min-h-[500px] flex flex-col overflow-hidden">
          <div className="bg-slate-200 px-4 py-2 flex items-center gap-2 border-b border-slate-300">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 bg-white rounded px-3 py-1 text-xs text-center text-slate-500">
              preview-mode.healthai.com
            </div>
          </div>
          
          <div className="flex-1 overflow-auto bg-white relative border-b border-slate-200">
           {generatedContent ? (
             <>
               <div dangerouslySetInnerHTML={{ __html: generatedContent.html_content }} />
               <div className="absolute bottom-4 right-4 z-10">
                 <Button onClick={() => saveSiteMutation.mutate()} className="bg-emerald-600 shadow-lg">
                   <Save className="w-4 h-4 mr-2" /> <T>Salvar & Publicar</T>
                 </Button>
               </div>
             </>
           ) : (
             <div className="flex flex-col items-center justify-center h-full text-slate-400">
               <Globe className="w-16 h-16 mb-4 opacity-20" />
               <T as="p">O preview do seu site aparecerá aqui</T>
             </div>
           )}
          </div>

          {/* Site Chat Assistant */}
          {generatedContent && (
           <div className="h-64 bg-white p-4 flex flex-col">
              <div className="flex items-center gap-2 mb-2 text-sm font-bold text-slate-700">
                 <MessageSquare className="w-4 h-4 text-emerald-600" /> Assistente de Edição
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 mb-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                 <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 p-2 rounded-lg text-xs text-slate-600 max-w-[80%] shadow-sm">
                       Olá! O que você gostaria de alterar no site? Posso mudar cores, textos ou layout.
                    </div>
                 </div>
                 {chatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                       <div className={`max-w-[80%] p-2 rounded-lg text-xs ${msg.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>
                          {msg.content}
                       </div>
                    </div>
                 ))}
              </div>
              <div className="flex gap-2">
                 <input 
                   className="flex-1 border rounded px-3 py-2 text-sm"
                   placeholder="Ex: Mude o fundo para azul marinho..."
                   value={chatMessage}
                   onChange={e => setChatMessage(e.target.value)}
                   onKeyDown={e => {
                      if (e.key === 'Enter') {
                         const newHist = [...chatHistory, { role: 'user', content: chatMessage }];
                         setChatHistory(newHist);
                         setChatMessage('');
                         setTimeout(() => setChatHistory([...newHist, { role: 'assistant', content: 'Entendi, aplicando alterações...' }]), 1000);
                      }
                   }}
                 />
                 <Button size="icon" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => {
                      const newHist = [...chatHistory, { role: 'user', content: chatMessage }];
                      setChatHistory(newHist);
                      setChatMessage('');
                      setTimeout(() => setChatHistory([...newHist, { role: 'assistant', content: 'Entendi, aplicando alterações...' }]), 1000);
                 }}>
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