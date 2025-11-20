import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2, Upload, Sparkles, Image as ImageIcon, MonitorPlay } from 'lucide-react';

export default function BannerManager() {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState('upload'); // upload | ai
  const [formData, setFormData] = useState({
    title: '',
    link_url: '',
    position: 'center',
    target_audience: 'all',
    media_url: '',
    media_type: 'image'
  });
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const createBannerMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      await base44.entities.Banner.create({
        owner_email: user.email,
        ...formData,
        active: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['banners']);
      alert("Banner criado com sucesso!");
      setFormData({ ...formData, title: '', link_url: '', media_url: '' });
    }
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const res = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, media_url: res.file_url, media_type: file.type.startsWith('video') ? 'video' : 'image' }));
    } catch (err) {
      console.error(err);
      alert("Erro ao enviar arquivo.");
    }
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt) return;
    setIsGenerating(true);
    try {
      // 1. Generate Image
      const imgRes = await base44.integrations.Core.GenerateImage({ prompt: aiPrompt });
      
      // 2. Generate Copy/Title (Optional, simplified here to just use prompt or generic)
      setFormData(prev => ({ 
        ...prev, 
        media_url: imgRes.url, 
        media_type: 'image',
        title: `Campanha IA: ${aiPrompt.substring(0, 20)}...`
      }));
    } catch (err) {
      console.error(err);
      alert("Erro ao gerar banner com IA.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Gerenciador de Anúncios</CardTitle>
        <CardDescription>Crie campanhas visuais para alcançar seu público.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={mode} onValueChange={setMode} className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload de Mídia</TabsTrigger>
            <TabsTrigger value="ai">Criar com IA</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} accept="image/*,video/*" />
              <div className="flex flex-col items-center gap-2 text-slate-500">
                <Upload className="w-8 h-8" />
                <p>Clique ou arraste imagem/vídeo aqui</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4">
            <div className="space-y-2">
              <Label>Descreva seu Banner</Label>
              <Input 
                placeholder="Ex: Promoção de Black Friday para clínica de estética, cores vibrantes, moderno..." 
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              />
            </div>
            <Button onClick={handleAIGenerate} disabled={isGenerating || !aiPrompt} className="w-full bg-purple-600 hover:bg-purple-700">
              {isGenerating ? <Loader2 className="mr-2 animate-spin" /> : <Sparkles className="mr-2 w-4 h-4" />}
              Gerar Banner
            </Button>
          </TabsContent>
        </Tabs>

        {formData.media_url && (
          <div className="mb-6 rounded-lg overflow-hidden border border-slate-200 bg-black/5 relative group">
             {formData.media_type === 'video' ? (
               <video src={formData.media_url} controls className="max-h-[200px] mx-auto" />
             ) : (
               <img src={formData.media_url} alt="Preview" className="max-h-[200px] mx-auto object-contain" />
             )}
             <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs uppercase font-bold">Preview</div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <Label>Título da Campanha</Label>
            <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Identificação interna" />
          </div>
          <div className="space-y-2">
            <Label>Link de Redirecionamento</Label>
            <Input value={formData.link_url} onChange={e => setFormData({...formData, link_url: e.target.value})} placeholder="https://..." />
          </div>
          <div className="space-y-2">
            <Label>Posição</Label>
            <Select value={formData.position} onValueChange={v => setFormData({...formData, position: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="center">Centro (Modal)</SelectItem>
                <SelectItem value="header">Cabeçalho (Topo)</SelectItem>
                <SelectItem value="sidebar_right">Lateral Direita</SelectItem>
                <SelectItem value="sidebar_left">Lateral Esquerda</SelectItem>
                <SelectItem value="bottom">Rodapé (Bottom)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Público Alvo</Label>
            <Select value={formData.target_audience} onValueChange={v => setFormData({...formData, target_audience: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Usuários</SelectItem>
                <SelectItem value="patient">Somente Pacientes</SelectItem>
                <SelectItem value="professional">Somente Profissionais</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={() => createBannerMutation.mutate()} className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={!formData.media_url || createBannerMutation.isPending}>
          {createBannerMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : <MonitorPlay className="w-4 h-4 mr-2" />}
          Publicar Anúncio
        </Button>
      </CardContent>
    </Card>
  );
}