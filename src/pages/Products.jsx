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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ShoppingBag, Box, FileText, Video, Plus, Loader2, Edit, Trash2, Eye, Sparkles, RotateCcw, Save } from 'lucide-react';

export default function ProductsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newProductType, setNewProductType] = useState('ebook');
  const [activeTab, setActiveTab] = useState('all');
  const [formData, setFormData] = useState({ title: '', description: '', price: '', content_url: '' });
  
  // AI Generation State
  const [creationMode, setCreationMode] = useState('manual'); // 'manual' | 'ai'
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiDetails, setAiDetails] = useState({ audience: '', tone: '', keywords: '' });
  const [generatedProduct, setGeneratedProduct] = useState(null);

  const queryClient = useQueryClient();

  // Fetch Products
  const { data: products, isLoading } = useQuery({
    queryKey: ['myProducts'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return (await base44.entities.Product.list({ query: { owner_email: user?.email } })).data;
    }
  });

  const createProductMutation = useMutation({
    mutationFn: async (dataToSave) => {
       const user = await base44.auth.me();
       const productData = dataToSave || {
         title: formData.title,
         description: formData.description,
         price: parseFloat(formData.price) || 0,
         content_url: formData.content_url,
       };

       await base44.entities.Product.create({
         owner_email: user.email,
         type: newProductType,
         ...productData,
         status: 'active'
       });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['myProducts']);
      setIsCreateOpen(false);
      setFormData({ title: '', description: '', price: '', content_url: '' });
      setGeneratedProduct(null);
      setAiPrompt('');
      setAiDetails({ audience: '', tone: '', keywords: '' });
    }
  });

  const generateProductMutation = useMutation({
    mutationFn: async () => {
       const prompt = `
         Crie um rascunho de produto digital do tipo "${newProductType}".
         Tópico/Ideia: ${aiPrompt}
         Público Alvo: ${aiDetails.audience}
         Tom de Voz: ${aiDetails.tone}
         Palavras-chave: ${aiDetails.keywords}

         Gere um título atraente, uma descrição detalhada de venda (max 300 caracteres) e uma sugestão de preço em BRL.
         Retorne APENAS JSON.
       `;

       const res = await base44.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
             type: "object",
             properties: {
                title: { type: "string" },
                description: { type: "string" },
                price: { type: "number" }
             }
          }
       });
       return res;
    },
    onSuccess: (data) => {
       setGeneratedProduct(data);
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id) => base44.entities.Product.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['myProducts'])
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
          <Card key={product.id} className="hover:shadow-md transition-shadow border-slate-200">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                 <div className="bg-slate-50 p-2 rounded-lg w-fit">{getIcon(product.type)}</div>
                 <div className="text-lg font-bold text-emerald-700">R$ {product.price}</div>
              </div>
              <CardTitle className="mt-4 text-lg">{product.title}</CardTitle>
              <CardDescription className="line-clamp-2">{product.description}</CardDescription>
            </CardHeader>
            <CardFooter className="pt-2 flex gap-2">
               <Button variant="outline" className="flex-1" title="Visualizar detalhes">
                 <Eye className="w-4 h-4 mr-2" /> Visualizar
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Gerenciar Produtos</h1>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" /> Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Novo Produto</DialogTitle>
            </DialogHeader>
            
            <Tabs value={creationMode} onValueChange={setCreationMode} className="w-full">
               <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="manual">Manual</TabsTrigger>
                  <TabsTrigger value="ai" className="flex gap-2"><Sparkles className="w-3 h-3" /> Assistente IA</TabsTrigger>
               </TabsList>

               <TabsContent value="manual" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tipo de Produto</Label>
                    <Select value={newProductType} onValueChange={setNewProductType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ebook">E-book / PDF</SelectItem>
                        <SelectItem value="3d_model">Modelo 3D</SelectItem>
                        <SelectItem value="course">Curso Online</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Título</Label>
                    <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Preço (R$)</Label>
                    <Input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                  </div>
                  <Button onClick={() => createProductMutation.mutate()} className="w-full bg-emerald-600" disabled={createProductMutation.isPending}>
                    {createProductMutation.isPending ? <Loader2 className="animate-spin" /> : 'Criar Produto'}
                  </Button>
               </TabsContent>

               <TabsContent value="ai" className="space-y-4">
                  {!generatedProduct ? (
                    <div className="space-y-4 animate-in fade-in">
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
                             <Input placeholder="Ex: Motivacional, Técnico" value={aiDetails.tone} onChange={e => setAiDetails({...aiDetails, tone: e.target.value})} />
                          </div>
                       </div>
                       <div className="space-y-2">
                          <Label>Palavras-chave (Opcional)</Label>
                          <Input placeholder="Ex: saúde, dieta, verde..." value={aiDetails.keywords} onChange={e => setAiDetails({...aiDetails, keywords: e.target.value})} />
                       </div>
                       <Button 
                          onClick={() => generateProductMutation.mutate()} 
                          className="w-full bg-purple-600 hover:bg-purple-700" 
                          disabled={generateProductMutation.isPending || !aiPrompt}
                       >
                          {generateProductMutation.isPending ? <><Loader2 className="animate-spin mr-2" /> Gerando Ideias...</> : <><Sparkles className="mr-2 w-4 h-4" /> Gerar com IA</>}
                       </Button>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-in zoom-in-95">
                       <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                          <h3 className="font-bold text-purple-900 text-lg mb-1">{generatedProduct.title}</h3>
                          <p className="text-purple-700 text-sm mb-3">{generatedProduct.description}</p>
                          <div className="flex items-center gap-2">
                             <span className="bg-white px-2 py-1 rounded border border-purple-200 text-purple-800 font-bold text-sm">
                                Sugestão de Preço: R$ {generatedProduct.price}
                             </span>
                          </div>
                       </div>
                       
                       <div className="flex gap-2">
                          <Button 
                             variant="outline" 
                             className="flex-1" 
                             onClick={() => setGeneratedProduct(null)} // "Delete"/Discard logic simply resets the state
                          >
                             <Trash2 className="w-4 h-4 mr-2" /> Descartar
                          </Button>
                          <Button 
                             variant="outline" 
                             className="flex-1" 
                             onClick={() => generateProductMutation.mutate()}
                             disabled={generateProductMutation.isPending}
                          >
                             <RotateCcw className="w-4 h-4 mr-2" /> Gerar Outro
                          </Button>
                       </div>
                       <Button 
                          className="w-full bg-green-600 hover:bg-green-700"
                          onClick={() => createProductMutation.mutate({
                             title: generatedProduct.title,
                             description: generatedProduct.description,
                             price: generatedProduct.price,
                             content_url: '' // Placeholder
                          })}
                          disabled={createProductMutation.isPending}
                       >
                          {createProductMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : <><Save className="w-4 h-4 mr-2" /> Salvar Produto</>}
                       </Button>
                    </div>
                  )}
               </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs for Management */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-[600px]">
          <TabsTrigger value="all">Todos ({products?.length || 0})</TabsTrigger>
          <TabsTrigger value="ebook">E-books ({products?.filter(p => p.type === 'ebook').length || 0})</TabsTrigger>
          <TabsTrigger value="3d_model">3D ({products?.filter(p => p.type === '3d_model').length || 0})</TabsTrigger>
          <TabsTrigger value="course">Cursos ({products?.filter(p => p.type === 'course').length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
            {isLoading ? (
              <div className="py-12 text-center"><Loader2 className="animate-spin mx-auto" /></div>
            ) : (
              <ProductList items={filteredProducts} />
            )}
        </TabsContent>
      </Tabs>

      {/* Quick Create Shortcuts */}
      <div className="mt-12 pt-8 border-t border-slate-200">
         <h3 className="text-lg font-semibold mb-4 text-slate-800">Atalhos de Criação</h3>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="cursor-pointer hover:border-emerald-500 transition-all bg-slate-50/50" onClick={() => handleCreateClick('ebook')}>
            <CardContent className="p-4 flex items-center gap-4">
               <div className="bg-orange-100 p-2 rounded-lg">{getIcon('ebook')}</div>
               <div>
                  <h3 className="font-bold">Adicionar E-book</h3>
               </div>
            </CardContent>
            </Card>
            <Card className="cursor-pointer hover:border-emerald-500 transition-all bg-slate-50/50" onClick={() => handleCreateClick('3d_model')}>
            <CardContent className="p-4 flex items-center gap-4">
               <div className="bg-purple-100 p-2 rounded-lg">{getIcon('3d_model')}</div>
               <div>
                  <h3 className="font-bold">Adicionar Modelo 3D</h3>
               </div>
            </CardContent>
            </Card>
            <Card className="cursor-pointer hover:border-emerald-500 transition-all bg-slate-50/50" onClick={() => handleCreateClick('course')}>
            <CardContent className="p-4 flex items-center gap-4">
               <div className="bg-blue-100 p-2 rounded-lg">{getIcon('course')}</div>
               <div>
                  <h3 className="font-bold">Adicionar Curso</h3>
               </div>
            </CardContent>
            </Card>
         </div>
      </div>
    </div>
  );
}