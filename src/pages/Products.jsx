import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ShoppingBag, Box, FileText, Video, Plus, Loader2, Edit, Trash2, Eye, Sparkles, RotateCcw, Save, MessageCircle, Send, BookOpen, Cuboid, Download } from 'lucide-react';
import * as THREE from 'three';
import UsageLimitBanner from '@/components/usage/UsageLimitBanner';
import { getPlanLimits, canUseFeature, getCurrentMonth, sendWhatsAppMessage } from '@/components/usage/usageLimits';
import T from '@/components/TranslatedText';

export default function ProductsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newProductType, setNewProductType] = useState('ebook');
  const [activeTab, setActiveTab] = useState('all');
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);

  // Bulk Generation State
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [serviceDescription, setServiceDescription] = useState('');

  // AI Generation State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiDetails, setAiDetails] = useState({ audience: '', tone: '', keywords: '' });
  const [generatedProduct, setGeneratedProduct] = useState(null);

  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['userProfileProducts'],
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

  // Fetch Products
  const { data: products, isLoading } = useQuery({
    queryKey: ['myProducts'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return (await base44.entities.Product.list({ query: { owner_email: user?.email } })).data;
    }
  });

  const planLimits = getPlanLimits(profile?.plan);
  const currentMonth = getCurrentMonth();
  const currentUsage = profile?.monthly_usage?.month === currentMonth ? profile?.monthly_usage?.products_created || 0 : 0;
  const canCreateProduct = canUseFeature(currentUsage, planLimits.products);

  const createProductMutation = useMutation({
    mutationFn: async (dataToSave) => {
       if (!canCreateProduct) {
         if (planLimits.products >= 20) {
           sendWhatsAppMessage(user?.full_name || 'Usuário', 'criação de mais produtos');
           throw new Error('Limite atingido. Mensagem enviada à secretaria.');
         }
         throw new Error('Limite atingido. Faça upgrade para criar mais produtos.');
       }

       const u = await base44.auth.me();
       await base44.entities.Product.create({
         owner_email: u.email,
         type: newProductType,
         ...dataToSave,
         status: 'active'
       });
    },
    onSuccess: async () => {
      queryClient.invalidateQueries(['myProducts']);
      setIsCreateOpen(false);
      setGeneratedProduct(null);
      setAiPrompt('');
      setAiDetails({ audience: '', tone: '', keywords: '' });
      
      const month = getCurrentMonth();
      const usage = profile.monthly_usage || {};
      if (usage.month !== month) {
        await base44.entities.UserProfile.update(profile.id, {
          monthly_usage: { month, products_created: 1, nurse_conversations: 0, chatbots_created: 0, sites_created: 0, designs_created: 0, ai_packages_created: 0 }
        });
      } else {
        await base44.entities.UserProfile.update(profile.id, {
          monthly_usage: { ...usage, products_created: (usage.products_created || 0) + 1 }
        });
      }
      queryClient.invalidateQueries(['userProfileProducts']);
    },
    onError: (error) => {
      alert(error.message);
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      await base44.entities.Product.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['myProducts']);
      setEditingProduct(null);
    }
  });

  const generateProductMutation = useMutation({
    mutationFn: async () => {
       // 1. Generate Text
       const textPrompt = `
         Crie um rascunho de produto digital do tipo "${newProductType}".
         Tópico/Ideia: ${aiPrompt}
         Público Alvo: ${aiDetails.audience}
         Tom de Voz: ${aiDetails.tone}
         Palavras-chave: ${aiDetails.keywords}

         Gere um título atraente, uma descrição detalhada de venda (max 300 caracteres) e uma sugestão de preço em BRL.
         Também sugira um prompt em inglês para gerar uma imagem de capa para este produto.

         Se for ebook, gere também um array "chapters" com 5 titulos de capitulos.

         Retorne APENAS JSON.
       `;

       const textRes = await base44.integrations.Core.InvokeLLM({
          prompt: textPrompt,
          response_json_schema: {
             type: "object",
             properties: {
                title: { type: "string" },
                description: { type: "string" },
                price: { type: "number" },
                image_prompt: { type: "string" },
                chapters: { type: "array", items: { type: "string" } }
             }
          }
       });

       let contentData = {};
       if (newProductType === 'ebook') {
          // Generate full content for chapters
          const fullContentPrompt = `Escreva o conteúdo completo para um ebook com os capítulos: ${textRes.chapters.join(', ')}. Cerca de 200 palavras por capitulo.`;
          const contentRes = await base44.integrations.Core.InvokeLLM({
             prompt: fullContentPrompt
          });
          contentData = { chapters: textRes.chapters, full_text: contentRes, page_count: 20 }; // Simulating 20 pages
       } else if (newProductType === '3d_model') {
          contentData = { model_type: 'cube', color: 'blue' }; // Mock 3d data
       }

       // 2. Generate Image
       let imageUrl = '';
       if (textRes.image_prompt) {
          try {
            const imgRes = await base44.integrations.Core.GenerateImage({
              prompt: `Cover image for a ${newProductType}: ${textRes.image_prompt}. Professional, high quality, clean design.`
            });
            imageUrl = imgRes.url;
          } catch (e) {
            console.error("Image gen failed", e);
          }
       }

       return { ...textRes, content_url: imageUrl, content_data: contentData };
    },
    onSuccess: (data) => {
       setGeneratedProduct(data);
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id) => base44.entities.Product.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['myProducts'])
  });

  const generatePackageMutation = useMutation({
     mutationFn: async () => {
        const totalNeeded = 1;
        const remaining = planLimits.ai_packages - (profile?.monthly_usage?.ai_packages_created || 0);
        if (planLimits.ai_packages !== -1 && totalNeeded > remaining) {
          if (planLimits.ai_packages >= 5) {
            sendWhatsAppMessage(user?.full_name || 'Usuário', 'criação de mais pacotes de produtos via IA');
            throw new Error('Limite de pacotes atingido. Mensagem enviada à secretaria.');
          }
          throw new Error('Limite mensal de pacotes atingido. Faça upgrade.');
        }

        const u = await base44.auth.me();
        
        // 1. Generate Product Ideas
        const ideasRes = await base44.integrations.Core.InvokeLLM({
           prompt: `
             Com base na descrição do serviço: "${serviceDescription}".
             Gere 3 produtos digitais complementares:
             1. Um Ebook (10 paginas)
             2. Um Curso (5 modulos/paginas)
             3. Um Produto 3D (modelo simples)
             
             Retorne JSON array.
           `,
           response_json_schema: {
              type: "object",
              properties: {
                 products: {
                    type: "array",
                    items: {
                       type: "object",
                       properties: {
                          type: { type: "string", enum: ["ebook", "course", "3d_model"] },
                          title: { type: "string" },
                          description: { type: "string" },
                          price: { type: "number" },
                          image_prompt: { type: "string" }
                       }
                    }
                 }
              }
           }
        });

        // 2. Create each product
        for (const prod of ideasRes.products) {
           // Generate content mock
           let contentData = {};
           if (prod.type === 'ebook') contentData = { page_count: 10, chapters: ["Intro", "Cap 1", "Cap 2", "Conclusão"], full_text: "Conteúdo gerado automaticamente..." };
           if (prod.type === 'course') contentData = { modules: 5, video_url: "http://sample.com/video.mp4" };
           if (prod.type === '3d_model') contentData = { model_type: 'generated', color: 'random' };

           // Generate Image
           let imgUrl = '';
           try {
             const imgRes = await base44.integrations.Core.GenerateImage({ prompt: prod.image_prompt || `Cover for ${prod.title}` });
             imgUrl = imgRes.url;
           } catch(e) { console.error(e); }

           await base44.entities.Product.create({
              owner_email: u.email,
              type: prod.type,
              title: prod.title,
              description: prod.description,
              price: prod.price,
              content_url: imgUrl,
              content_data: contentData,
              status: 'active'
           });
        }
     },
     onSuccess: async () => {
        queryClient.invalidateQueries(['myProducts']);
        setIsBulkOpen(false);
        setServiceDescription('');
        
        const month = getCurrentMonth();
        const usage = profile.monthly_usage || {};
        if (usage.month !== month) {
          await base44.entities.UserProfile.update(profile.id, {
            monthly_usage: { month, ai_packages_created: 1, nurse_conversations: 0, chatbots_created: 0, sites_created: 0, designs_created: 0, products_created: 0 }
          });
        } else {
          await base44.entities.UserProfile.update(profile.id, {
            monthly_usage: { ...usage, ai_packages_created: (usage.ai_packages_created || 0) + 1 }
          });
        }
        queryClient.invalidateQueries(['userProfileProducts']);
        
        alert("Pacote de 3 produtos gerado com sucesso!");
     },
     onError: (error) => {
        alert(error.message);
     }
  });

  const getIcon = (type) => {
    switch(type) {
      case 'ebook': return <FileText className="w-8 h-8 text-orange-500" />;
      case '3d_model': return <Box className="w-8 h-8 text-purple-500" />;
      case 'course': return <Video className="w-8 h-8 text-blue-500" />;
      default: return <ShoppingBag className="w-8 h-8 text-slate-500" />;
    }
  };

  const handleCreateClick = (type = null) => {
    if (type) setNewProductType(type);
    setIsCreateOpen(true);
  };

  const filteredProducts = products?.filter(p => activeTab === 'all' || p.type === activeTab) || [];

  const ProductList = ({ items }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {items.map(product => (
          <Card key={product.id} className="hover:shadow-md transition-shadow border-slate-200 overflow-hidden flex flex-col">
            {product.content_url && (
               <div className="h-40 w-full bg-slate-100 overflow-hidden relative">
                  <img src={product.content_url} alt={product.title} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-lg shadow-sm">{getIcon(product.type)}</div>
               </div>
            )}
            <CardHeader className={`${product.content_url ? 'pt-4' : ''} pb-2 flex-1`}>
              {!product.content_url && (
                 <div className="flex justify-between items-start mb-2">
                    <div className="bg-slate-50 p-2 rounded-lg w-fit">{getIcon(product.type)}</div>
                 </div>
              )}
              <div className="text-lg font-bold text-emerald-700 mb-1">R$ {product.price}</div>
              <CardTitle className="text-lg leading-tight">{product.title}</CardTitle>
              <CardDescription className="line-clamp-3 mt-2">{product.description}</CardDescription>
            </CardHeader>
            <CardFooter className="pt-2 flex gap-2 mt-auto">
               <Button 
                  variant="outline" 
                  className="flex-1" 
                  title="Editar Detalhes"
                  onClick={() => setEditingProduct(product)}
               >
                 <Edit className="w-4 h-4 mr-2" /> Editar
               </Button>
               <Button 
                 variant="destructive" 
                 size="icon" 
                 onClick={() => { if(confirm('Deletar produto?')) deleteProductMutation.mutate(product.id); }}
                 title="Excluir Produto"
               >
                 <Trash2 className="w-4 h-4" />
               </Button>
            </CardFooter>
          </Card>
        ))}
        {items.length === 0 && (
           <div className="col-span-full text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
             <ShoppingBag className="w-12 h-12 mx-auto text-slate-300 mb-2" />
             <p className="text-slate-500">Nenhum produto encontrado nesta categoria.</p>
           </div>
        )}
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start gap-4">
        <T as="h1" className="text-2xl font-bold text-[#0F172A]">Gerenciar Produtos</T>
        <UsageLimitBanner 
          currentUsage={currentUsage}
          limit={planLimits.products}
          resourceName="Produtos"
          planName={planLimits.name}
        />
      </div>
      <div className="flex justify-end items-center gap-2">
           <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setIsBulkOpen(true)}>
              <Sparkles className="w-4 h-4 mr-2" /> Gerar Pacote com IA
           </Button>
           <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
             <DialogTrigger asChild>
               <Button className="bg-emerald-600 hover:bg-emerald-700">
                 <Plus className="w-4 h-4 mr-2" /> <T>Novo Produto</T>
               </Button>
             </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <T as={DialogTitle}>Criar Novo Produto com IA</T>
            </DialogHeader>
            
            <div className="space-y-4">
               {!generatedProduct ? (
                 <div className="space-y-4 animate-in fade-in">
                    <div className="bg-blue-50 p-3 rounded-lg text-blue-800 text-sm mb-4 flex items-center gap-2 border border-blue-100">
                       <Sparkles className="w-4 h-4 text-blue-600" />
                       <span>Preencha os detalhes e a IA criará o produto completo (texto + imagem) para você.</span>
                    </div>
                    <div className="space-y-2">
                       <Label>Tipo de Produto a Gerar</Label>
                       <Select value={newProductType} onValueChange={setNewProductType}>
                         <SelectTrigger><SelectValue /></SelectTrigger>
                         <SelectContent>
                           <SelectItem value="ebook">E-book</SelectItem>
                           <SelectItem value="3d_model">Modelo 3D</SelectItem>
                           <SelectItem value="course">Curso</SelectItem>
                         </SelectContent>
                       </Select>
                    </div>
                    <div className="space-y-2">
                       <Label>Ideia Principal / Tópico</Label>
                       <Textarea 
                          placeholder="Ex: Um guia completo sobre nutrição vegana para iniciantes..." 
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          className="h-24"
                       />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <Label>Público Alvo</Label>
                          <Input placeholder="Ex: Jovens adultos" value={aiDetails.audience} onChange={e => setAiDetails({...aiDetails, audience: e.target.value})} />
                       </div>
                       <div className="space-y-2">
                          <Label>Tom de Voz</Label>
                          <Input placeholder="Ex: Motivacional" value={aiDetails.tone} onChange={e => setAiDetails({...aiDetails, tone: e.target.value})} />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <Label>Palavras-chave (Opcional)</Label>
                       <Input placeholder="Ex: saúde, dieta..." value={aiDetails.keywords} onChange={e => setAiDetails({...aiDetails, keywords: e.target.value})} />
                    </div>
                    <Button 
                      onClick={() => generateProductMutation.mutate()} 
                      className="w-full bg-purple-600 hover:bg-purple-700" 
                      disabled={generateProductMutation.isPending || !aiPrompt || !canCreateProduct}
                    >
                       {generateProductMutation.isPending ? <><Loader2 className="animate-spin mr-2" /> Gerando Conteúdo e Imagem...</> : <><Sparkles className="mr-2 w-4 h-4" /> Gerar com IA</>}
                    </Button>
                 </div>
               ) : (
               <div className="space-y-4 animate-in zoom-in-95">
                  <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm p-4 space-y-4">
                     <div className="space-y-2">
                        <Label>Imagem de Capa</Label>
                        {generatedProduct.content_url && (
                           <div className="h-40 w-full bg-slate-100 rounded-md overflow-hidden relative mb-2">
                              <img src={generatedProduct.content_url} alt="Cover" className="w-full h-full object-cover" />
                           </div>
                        )}
                        <div className="flex gap-2">
                           <Button variant="outline" size="sm" className="flex-1 relative">
                              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={async (e) => {
                                 const file = e.target.files[0];
                                 if (file) {
                                    const res = await base44.integrations.Core.UploadFile({ file });
                                    setGeneratedProduct({...generatedProduct, content_url: res.file_url});
                                 }
                              }} />
                              <Plus className="w-3 h-3 mr-1" /> Upload
                           </Button>
                           <Button variant="outline" size="sm" className="flex-1" onClick={async () => {
                              const imgRes = await base44.integrations.Core.GenerateImage({
                                 prompt: `Cover for ${generatedProduct.title}, ${newProductType}, high quality`
                              });
                              setGeneratedProduct({...generatedProduct, content_url: imgRes.url});
                           }}>
                              <Sparkles className="w-3 h-3 mr-1" /> Nova Imagem
                           </Button>
                        </div>
                     </div>

                     <div className="space-y-2">
                        <Label>Título</Label>
                        <div className="flex gap-2">
                           <Input value={generatedProduct.title} onChange={(e) => setGeneratedProduct({...generatedProduct, title: e.target.value})} />
                           <Button size="icon" variant="outline" onClick={async () => {
                              const res = await base44.integrations.Core.InvokeLLM({ prompt: `Novo título para produto sobre ${aiPrompt}` });
                              setGeneratedProduct({...generatedProduct, title: res.replace(/"/g, '')});
                           }}><RotateCcw className="w-4 h-4" /></Button>
                        </div>
                     </div>

                     <div className="space-y-2">
                        <Label>Descrição</Label>
                        <div className="relative">
                           <Textarea value={generatedProduct.description} onChange={(e) => setGeneratedProduct({...generatedProduct, description: e.target.value})} className="pr-10" />
                           <Button size="icon" variant="ghost" className="absolute top-2 right-2" onClick={async () => {
                              const res = await base44.integrations.Core.InvokeLLM({ prompt: `Nova descrição curta para produto: ${generatedProduct.title}` });
                              setGeneratedProduct({...generatedProduct, description: res});
                           }}><RotateCcw className="w-4 h-4 text-slate-400" /></Button>
                        </div>
                     </div>

                     <div className="space-y-2">
                        <Label>Preço (R$)</Label>
                        <div className="flex gap-2">
                           <Input type="number" value={generatedProduct.price} onChange={(e) => setGeneratedProduct({...generatedProduct, price: parseFloat(e.target.value)})} />
                           <Button size="icon" variant="outline" onClick={async () => {
                              const res = await base44.integrations.Core.InvokeLLM({ prompt: `Sugira outro preço em BRL para um ebook sobre ${generatedProduct.title}. Apenas numeros.` });
                              const price = parseFloat(res.replace(/[^0-9.]/g, '')) || 97.00;
                              setGeneratedProduct({...generatedProduct, price});
                           }}><RotateCcw className="w-4 h-4" /></Button>
                        </div>
                     </div>
                  </div>

                  <div className="flex gap-2">
                       <Button 
                          variant="outline" 
                          className="flex-1" 
                          onClick={() => setGeneratedProduct(null)} 
                       >
                          <Trash2 className="w-4 h-4 mr-2" /> Descartar
                       </Button>
                       <Button 
                          variant="outline" 
                          className="flex-1" 
                          onClick={() => generateProductMutation.mutate()}
                          disabled={generateProductMutation.isPending}
                       >
                          <RotateCcw className="w-4 h-4 mr-2" /> Tentar Outro
                       </Button>
                    </div>
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => createProductMutation.mutate({
                         title: generatedProduct.title,
                         description: generatedProduct.description,
                         price: generatedProduct.price,
                         content_url: generatedProduct.content_url
                      })}
                      disabled={createProductMutation.isPending || !canCreateProduct}
                    >
                       {createProductMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : <><Save className="w-4 h-4 mr-2" /> Salvar Produto</>}
                    </Button>
                 </div>
               )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Bulk Generator Dialog */}
        <Dialog open={isBulkOpen} onOpenChange={setIsBulkOpen}>
           <DialogContent>
              <DialogHeader>
                 <DialogTitle>Gerar Pacote de Produtos Completo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                 <div className="bg-indigo-50 p-4 rounded-lg text-indigo-800 text-sm">
                    <h4 className="font-bold flex items-center gap-2 mb-2"><Sparkles className="w-4 h-4" /> Como funciona?</h4>
                    <p>Descreva seu serviço ou especialidade e a IA criará automaticamente 3 produtos para você vender:</p>
                    <ul className="list-disc ml-5 mt-2 space-y-1">
                       <li>1 Ebook completo (10 páginas)</li>
                       <li>1 Curso rápido (5 módulos)</li>
                       <li>1 Modelo 3D interativo</li>
                    </ul>
                 </div>
                 <div className="space-y-2">
                    <Label>Descreva seu serviço / especialidade</Label>
                    <Textarea 
                      placeholder="Ex: Sou dermatologista especialista em tratamento de melasma e rejuvenescimento facial..."
                      value={serviceDescription}
                      onChange={e => setServiceDescription(e.target.value)}
                      className="h-32"
                    />
                 </div>
                 <Button 
                   className="w-full bg-indigo-600 hover:bg-indigo-700 h-12"
                   onClick={() => generatePackageMutation.mutate()}
                   disabled={!serviceDescription || generatePackageMutation.isPending}
                 >
                    {generatePackageMutation.isPending ? <><Loader2 className="animate-spin mr-2" /> Criando 3 Produtos...</> : 'Gerar Pacote Agora'}
                 </Button>
              </div>
           </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
           <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                 <DialogTitle>Editar Produto</DialogTitle>
              </DialogHeader>
              {editingProduct && (
                 <div className="space-y-6 py-4">
                    <div className="space-y-2">
                       <Label>Título</Label>
                       <div className="flex gap-2">
                          <Input 
                             value={editingProduct.title} 
                             onChange={(e) => setEditingProduct({...editingProduct, title: e.target.value})} 
                          />
                          <Button 
                             variant="outline"
                             size="icon"
                             title="Gerar novo título com IA"
                             onClick={async () => {
                                const res = await base44.integrations.Core.InvokeLLM({
                                   prompt: `Gere um título curto e atraente para um produto chamado "${editingProduct.title}". Apenas o texto.`,
                                });
                                setEditingProduct({...editingProduct, title: res});
                             }}
                          >
                             <Sparkles className="w-4 h-4 text-purple-600" />
                          </Button>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <Label>Descrição</Label>
                       <Textarea 
                          value={editingProduct.description} 
                          onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})} 
                          className="min-h-[100px]"
                       />
                       <div className="flex justify-end">
                          <Button 
                             variant="ghost"
                             size="sm"
                             className="text-xs text-purple-600"
                             onClick={async () => {
                                const res = await base44.integrations.Core.InvokeLLM({
                                   prompt: `Reescreva esta descrição de produto para ser mais vendedora e persuasiva: "${editingProduct.description}". Max 300 caracteres.`,
                                });
                                setEditingProduct({...editingProduct, description: res});
                             }}
                          >
                             <Sparkles className="w-3 h-3 mr-1" /> Reescrever com IA
                          </Button>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <Label>Preço (R$)</Label>
                       <div className="flex gap-2 items-center">
                          <Input 
                             type="number" 
                             value={editingProduct.price} 
                             onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})} 
                          />
                          <Button 
                             variant="outline"
                             size="sm"
                             onClick={async () => {
                                const res = await base44.integrations.Core.InvokeLLM({
                                   prompt: `Sugira um preço competitivo em BRL para um produto digital do tipo ${editingProduct.type} sobre "${editingProduct.title}". Retorne apenas o número.`,
                                });
                                const price = parseFloat(res.replace(/[^0-9.]/g, ''));
                                if (!isNaN(price)) setEditingProduct({...editingProduct, price});
                             }}
                          >
                             <Sparkles className="w-4 h-4 text-green-600 mr-1" /> Sugerir
                          </Button>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <Label>Imagem de Capa</Label>
                       {editingProduct.content_url && (
                          <div className="relative w-full h-40 bg-slate-100 rounded-lg overflow-hidden mb-2">
                             <img src={editingProduct.content_url} className="w-full h-full object-cover" />
                          </div>
                       )}
                       <div className="grid grid-cols-2 gap-2">
                          <div className="relative">
                             <Button variant="outline" className="w-full relative">
                                <input 
                                   type="file" 
                                   className="absolute inset-0 opacity-0 cursor-pointer" 
                                   onChange={async (e) => {
                                      const file = e.target.files[0];
                                      if (file) {
                                         const res = await base44.integrations.Core.UploadFile({ file });
                                         setEditingProduct({...editingProduct, content_url: res.file_url});
                                      }
                                   }}
                                />
                                Upload
                             </Button>
                          </div>
                          <Button 
                             variant="outline" 
                             onClick={async () => {
                                const imgPrompt = await base44.integrations.Core.InvokeLLM({
                                   prompt: `Create a image generation prompt for this product: ${editingProduct.title} - ${editingProduct.description}. English only.`
                                });
                                const res = await base44.integrations.Core.GenerateImage({ prompt: imgPrompt });
                                setEditingProduct({...editingProduct, content_url: res.url});
                             }}
                          >
                             <Sparkles className="w-4 h-4 mr-2 text-purple-600" /> Gerar Nova
                          </Button>
                       </div>
                    </div>

                    <Button 
                       onClick={() => updateProductMutation.mutate({ id: editingProduct.id, data: editingProduct })} 
                       className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                       disabled={updateProductMutation.isPending}
                    >
                       {updateProductMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : 'Salvar Alterações'}
                    </Button>
                 </div>
              )}
           </DialogContent>
           </Dialog>
           </div>

           {/* Product Viewer Modal */}
           <Dialog open={!!viewingProduct} onOpenChange={(o) => !o && setViewingProduct(null)}>
         <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
               <DialogTitle className="flex items-center gap-2">
                  {viewingProduct?.title}
                  <span className="text-xs font-normal bg-slate-100 px-2 py-1 rounded uppercase">{viewingProduct?.type}</span>
               </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
               <div className="md:col-span-2 space-y-4">
                  {viewingProduct?.type === 'ebook' && (
                     <div className="bg-white border border-slate-200 rounded-lg p-8 min-h-[400px] shadow-inner">
                        <h3 className="text-2xl font-bold text-center mb-8 text-slate-800">{viewingProduct.title}</h3>
                        <div className="prose max-w-none text-slate-600 whitespace-pre-wrap">
                           {viewingProduct.content_data?.full_text || "Conteúdo simulado do ebook..."}
                        </div>
                        <div className="mt-8 text-center text-xs text-slate-400 border-t pt-4">
                           Página 1 de {viewingProduct.content_data?.page_count || 20}
                        </div>
                     </div>
                  )}

                  {viewingProduct?.type === '3d_model' && (
                     <div className="bg-slate-900 rounded-lg h-[400px] flex items-center justify-center relative overflow-hidden" ref={(node) => {
                        if (node && !node.hasChildNodes()) {
                           // Basic Three.js Scene setup
                           const scene = new THREE.Scene();
                           const camera = new THREE.PerspectiveCamera(75, node.clientWidth / node.clientHeight, 0.1, 1000);
                           const renderer = new THREE.WebGLRenderer({ alpha: true });
                           renderer.setSize(node.clientWidth, node.clientHeight);
                           node.appendChild(renderer.domElement);
                           
                           const geometry = new THREE.BoxGeometry( 2, 2, 2 );
                           const material = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true } );
                           const cube = new THREE.Mesh( geometry, material );
                           scene.add( cube );
                           camera.position.z = 5;
                           
                           const animate = function () {
                             requestAnimationFrame( animate );
                             cube.rotation.x += 0.01;
                             cube.rotation.y += 0.01;
                             renderer.render( scene, camera );
                           };
                           animate();
                        }
                     }}>
                        {/* Three.js Canvas will be injected here */}
                        <div className="absolute bottom-4 left-4 text-white text-xs bg-black/50 px-2 py-1 rounded">Modelo 3D Interativo</div>
                     </div>
                  )}
                  
                  {/* Generic/Course View */}
                  {viewingProduct?.type === 'course' && (
                     <div className="bg-slate-100 rounded-lg h-[400px] flex items-center justify-center">
                        <Video className="w-16 h-16 text-slate-300" />
                        <span className="ml-4 text-slate-500">Player de Vídeo do Curso</span>
                     </div>
                  )}

                  <div className="flex gap-2">
                     <Button className="flex-1 bg-indigo-600" onClick={() => alert('Baixando PDF/Arquivo...')}>
                        <Download className="w-4 h-4 mr-2" /> Baixar Arquivo
                     </Button>
                  </div>
               </div>

               {/* Chat for Changes */}
               <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col h-[500px]">
                  <h4 className="font-bold text-sm mb-4 flex items-center gap-2"><MessageCircle className="w-4 h-4" /> Assistente de Produto</h4>
                  <div className="flex-1 bg-white rounded border p-2 mb-2 overflow-y-auto text-sm space-y-2">
                     <div className="bg-slate-100 p-2 rounded-lg text-slate-600">
                        Olá! O que você gostaria de alterar neste produto? Posso mudar o conteúdo, design ou cores.
                     </div>
                     {/* Chat history would go here */}
                  </div>
                  <div className="flex gap-2">
                     <Input placeholder="Ex: Mude a cor para azul..." className="text-xs" />
                     <Button size="icon" variant="ghost"><Send className="w-4 h-4" /></Button>
                  </div>
               </div>
            </div>
         </DialogContent>
      </Dialog>

      {/* Tabs for Management */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="overflow-x-auto pb-2">
           <TabsList className="grid w-full grid-cols-4 max-w-[600px] min-w-[400px]">
             <TabsTrigger value="all">Todos ({products?.length || 0})</TabsTrigger>
             <TabsTrigger value="ebook">E-books ({products?.filter(p => p.type === 'ebook').length || 0})</TabsTrigger>
             <TabsTrigger value="3d_model">3D ({products?.filter(p => p.type === '3d_model').length || 0})</TabsTrigger>
             <TabsTrigger value="course">Cursos ({products?.filter(p => p.type === 'course').length || 0})</TabsTrigger>
           </TabsList>
        </div>

        <TabsContent value={activeTab} className="mt-0">
            {isLoading ? (
              <div className="py-12 text-center"><Loader2 className="animate-spin mx-auto" /></div>
            ) : (
              <ProductList items={filteredProducts} />
            )}
        </TabsContent>
      </Tabs>
    </div>
  );
}