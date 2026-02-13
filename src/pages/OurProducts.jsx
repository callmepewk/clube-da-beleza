import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Plus, Image as ImageIcon, Wand2 } from 'lucide-react';
import T from '@/components/TranslatedText';
import ProductCard from '@/components/products/ProductCard';
import ProductHeroCarousel from '@/components/products/ProductHeroCarousel';

const DEFAULT_LINKS = [
  { 
    title: 'Dermahelp', 
    link_url: 'https://dermahelp.base44.app',
    description: 'Protocolos inteligentes, triagem e orientações clínicas para um cuidado mais seguro e ágil.',
    image_url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691e6fc102be2b10ba4e6392/f220ef32d_dermahelp.jpeg',
    is_featured: true,
    features: [
      'Protocolos baseados em evidências',
      'Triagem inteligente com IA',
      'Orientações seguras para pacientes'
    ]
  },
  { 
    title: 'Mapa da Estética', 
    link_url: 'https://mapa-da-estetica.base44.app',
    description: 'Encontre clínicas e profissionais com filtros avançados, avaliações e agendamento rápido.',
    image_url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691e6fc102be2b10ba4e6392/ea0355f08_mapadaestetica.jpeg',
    is_featured: true,
    features: [
      'Filtros de busca detalhados',
      'Avaliações verificadas',
      'Agendamento simplificado'
    ]
  },
  { 
    title: 'Dr. da Beleza AI', 
    link_url: 'https://dr-da-beleza-ai.base44.app',
    description: 'Assistente de IA para recomendações estéticas personalizadas, dúvidas e planos de cuidado.',
    image_url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop',
    features: [
      'Análise personalizada por IA',
      'Planos de cuidado sugeridos',
      'Tradução multi-idioma'
    ]
  },
  { 
    title: 'Clube+', 
    link_url: 'https://clube-mais.base44.app',
    description: 'Assinaturas e benefícios exclusivos para fidelizar pacientes com recorrência e vantagens reais.',
    image_url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691e6fc102be2b10ba4e6392/917675700_clubmais.jpeg',
    is_featured: true,
    features: [
      'Planos de assinatura flexíveis',
      'Benefícios progressivos',
      'Relatórios de retenção'
    ]
  },
  { 
    title: 'Beauty Banking', 
    link_url: 'https://beautybanking.base44.app',
    description: 'Carteira digital e split de pagamentos com relatórios claros e repasses automáticos.',
    image_url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691e6fc102be2b10ba4e6392/d455c6ee4_beautybanking.png',
    features: [
      'Split e repasse automático',
      'Relatórios financeiros claros',
      'Carteira digital integrada'
    ]
  },
  { 
    title: 'Eccellenza', 
    link_url: 'https://eccellenza.base44.app',
    description: 'Academia de cursos e atualizações premium para elevar a excelência clínica.',
    image_url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691e6fc102be2b10ba4e6392/a2626bf1b_eccelenza.png',
    features: [
      'Catálogo de cursos premium',
      'Certificados e trilhas',
      'Eventos exclusivos'
    ]
  },
  { 
    title: 'LaserCode Pro', 
    link_url: 'https://laser-code-pro.base44.app',
    description: 'Rastreabilidade de lasers e dispositivos, laudos, protocolos e manutenção sob controle.',
    image_url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691e6fc102be2b10ba4e6392/dc44ccd88_lasercode.jpg',
    features: [
      'Controle de dispositivos',
      'Laudos e protocolos',
      'Manutenção e rastreabilidade'
    ]
  },
];

export default function OurProductsPage() {
  const queryClient = useQueryClient();
  const [user, setUser] = React.useState(null);
  const [profile, setProfile] = React.useState(null);
  const [editing, setEditing] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({ title: '', description: '', link_url: '', image_url: '', is_active: true });
  const isAdmin = !!profile?.is_admin;

  React.useEffect(() => {
    (async () => {
      const u = await base44.auth.me().catch(() => null);
      if (u) {
        setUser(u);
        const res = await base44.entities.UserProfile.list({ query: { user_email: u.email } });
        setProfile(res?.data?.[0] || null);
      }
    })();
  }, []);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['platformProducts'],
    queryFn: async () => {
      const res = await base44.entities.PlatformProduct.list({ limit: 200, sort: { order: 1 } });
      return res?.data || [];
    }
  });

  // Live updates
  React.useEffect(() => {
    const unsub = base44.entities.PlatformProduct.subscribe((evt) => {
      queryClient.invalidateQueries({ queryKey: ['platformProducts'] });
    });
    return unsub;
  }, []);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PlatformProduct.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['platformProducts'] })
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PlatformProduct.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['platformProducts'] })
  });

  const openCreate = () => { setEditing(null); setForm({ title: '', description: '', link_url: '', image_url: '', is_active: true }); setOpen(true); };
  const openEdit = (p) => { setEditing(p); setForm({ title: p.title, description: p.description || '', link_url: p.link_url, image_url: p.image_url || '', is_active: p.is_active !== false }); setOpen(true); };
  const save = () => {
    if (editing) updateMutation.mutate({ id: editing.id, data: form });
    else createMutation.mutate(form);
    setOpen(false);
  };

  const onUpload = async (file) => {
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm((f) => ({ ...f, image_url: file_url }));
  };

  const generateAI = async () => {
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Escreva uma descrição curta (máx 220 caracteres) e envolvente em pt-BR para o produto/plataforma "${form.title}" do segmento de beleza e estética. Tom profissional, claro e convidativo.`
    });
    setForm((f) => ({ ...f, description: typeof res === 'string' ? res : (res?.text || '') }));
  };

  const dataToShow = products.length > 0 ? products.filter(p => p.is_active !== false) : DEFAULT_LINKS;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#D4A574] to-[#B8935C] rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between gap-3">
          <div>
            <T as="h1" className="text-2xl font-light tracking-wide">Nossos Produtos</T>
            <T as="p" className="text-white/90 max-w-2xl font-light">Conheça nossas soluções oficiais e acesse com um clique.</T>
          </div>
          {isAdmin && (
            <Button onClick={openCreate} className="bg-white text-[#D4A574] hover:bg-[#FFF9F0]">
              <Plus className="w-4 h-4 mr-2" /> <T>Novo Produto</T>
            </Button>
          )}
        </div>
      </div>

      {/* Hero carousel with featured products */}
      {(() => {
        const featuredTitles = ['Dermahelp','Mapa da Estética','Clube+'];
        const featured = (dataToShow || []).filter(p => p.is_featured || featuredTitles.includes(p.title));
        if (!featured.length) return null;
        return (
          <ProductHeroCarousel items={featured} />
        );
      })()}

      {isLoading ? (
        <div className="flex items-center gap-2 text-[#6B5D4F]"><Loader2 className="w-4 h-4 animate-spin" /><T>Carregando...</T></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {dataToShow.map((p, i) => (
            <ProductCard key={p.id || i} product={p} onEdit={openEdit} isAdmin={isAdmin} />
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-[#2D2416]">{editing ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <T as="label" className="text-sm text-[#2D2416]">Nome</T>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-white border-[#E8DCC8]" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <T as="label" className="text-sm text-[#2D2416]">Descrição</T>
                <Button type="button" variant="ghost" className="text-[#D4A574]" onClick={generateAI}><Wand2 className="w-4 h-4 mr-1" /> <T>Gerar IA</T></Button>
              </div>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-white border-[#E8DCC8] min-h-[100px]" />
            </div>
            <div className="space-y-1">
              <T as="label" className="text-sm text-[#2D2416]">Link</T>
              <Input value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })} className="bg-white border-[#E8DCC8]" placeholder="https://..." />
            </div>
            <div className="space-y-1">
              <T as="label" className="text-sm text-[#2D2416]">Imagem</T>
              <div className="flex items-center gap-2">
                <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="bg-white border-[#E8DCC8]" placeholder="https://imagem.jpg" />
                <label className="inline-flex items-center gap-2 px-3 py-2 border border-[#D4A574]/30 rounded-md text-sm text-[#6B5D4F] cursor-pointer hover:bg-[#FFF9F0]">
                  <ImageIcon className="w-4 h-4" /> <T>Upload</T>
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) await onUpload(f); }} />
                </label>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <T as="span" className="text-sm text-[#2D2416]">Ativo</T>
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)} className="border-[#D4A574]/30 text-[#6B5D4F] hover:bg-[#FFF9F0]"><T>Cancelar</T></Button>
              <Button onClick={save} className="bg-[#D4A574] hover:bg-[#C49565] text-white"><T>Salvar</T></Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}