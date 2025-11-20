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
import { ShoppingBag, Box, FileText, Video, Plus, Loader2, Edit, Trash2, Eye, Sparkles, RotateCcw, Save } from 'lucide-react';

export default function ProductsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newProductType, setNewProductType] = useState('ebook');
  const [activeTab, setActiveTab] = useState('all');
  const [editingProduct, setEditingProduct] = useState(null);
  
  // AI Generation State
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
       await base44.entities.Product.create({
         owner_email: user.email,
         type: newProductType,
         ...dataToSave,
         status: 'active'
       });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['myProducts']);
      setIsCreateOpen(false);
      setGeneratedProduct(null);
      setAiPrompt('');
      setAiDetails({ audience: '', tone: '', keywords: '' });
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
                image_prompt: { type: "string" }
             }
          }
       });

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

       return { ...textRes, content_url: imageUrl };
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Gerenciar Produtos</h1>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" /> Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Novo Produto com IA</DialogTitle>
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
                       disabled={generateProductMutation.isPending || !aiPrompt}
                    >
                       {generateProductMutation.isPending ? <><Loader2 className="animate-spin mr-2" /> Gerando Conteúdo e Imagem...</> : <><Sparkles className="mr-2 w-4 h-4" /> Gerar com IA</>}
                    </Button>
                 </div>
               ) : (
                 <div className="space-y-4 animate-in zoom-in-95">
                    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                       {generatedProduct.content_url && (
                          <div className="h-48 w-full bg-slate-100 relative">
                             <img src={generatedProduct.content_url} alt="Cover" className="w-full h-full object-cover" />
                          </div>
                       )}
                       <div className="p-4 space-y-3">
                          <h3 className="font-bold text-slate-900 text-xl">{generatedProduct.title}</h3>
                          <p className="text-slate-600 text-sm">{generatedProduct.description}</p>
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                             <span className="text-slate-500 text-sm">Sugestão de Preço:</span>
                             <span className="text-emerald-600 font-bold text-lg">R$ {generatedProduct.price}</span>
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
                       disabled={createProductMutation.isPending}
                    >
                       {createProductMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : <><Save className="w-4 h-4 mr-2" /> Salvar Produto</>}
                    </Button>
                 </div>
               )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
           <DialogContent>
              <DialogHeader>
                 <DialogTitle>Editar Produto</DialogTitle>
              </DialogHeader>
              {editingProduct && (
                 <div className="space-y-4 py-4">
                    <div className="space-y-2">
                       <Label>Título</Label>
                       <Input 
                          value={editingProduct.title} 
                          onChange={(e) => setEditingProduct({...editingProduct, title: e.target.value})} 
                       />
                    </div>
                    <div className="space-y-2">
                       <Label>Preço (R$)</Label>
                       <Input 
                          type="number" 
                          value={editingProduct.price} 
                          onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})} 
                       />
                    </div>
                    <div className="space-y-2">
                       <Label>Descrição</Label>
                       <Textarea 
                          value={editingProduct.description} 
                          onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})} 
                       />
                    </div>
                    <div className="space-y-2">
                       <Label>URL da Imagem</Label>
                       <Input 
                          value={editingProduct.content_url || ''} 
                          onChange={(e) => setEditingProduct({...editingProduct, content_url: e.target.value})} 
                       />
                    </div>
                    <Button 
                       onClick={() => updateProductMutation.mutate({ id: editingProduct.id, data: editingProduct })} 
                       className="w-full bg-blue-600 hover:bg-blue-700"
                       disabled={updateProductMutation.isPending}
                    >
                       {updateProductMutation.isPending ? <Loader2 className="animate-spin" /> : 'Salvar Alterações'}
                    </Button>
                 </div>
              )}
           </DialogContent>
        </Dialog>
      </div>

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