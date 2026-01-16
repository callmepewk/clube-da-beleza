import React, { useState, useEffect } from 'react';
import { Globe, Palette, ShoppingBag, Bot, Sparkles } from 'lucide-react';
import T from '@/components/TranslatedText';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import PurchaseQRModal from '../components/purchase/PurchaseQRModal';

// Import section pages as components
import SitesPage from './Sites';
import DesignPage from './Design';
import ProductsPage from './Products';
import ChatbotsPage from './Chatbots';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import UsageLimitBanner from '@/components/usage/UsageLimitBanner';
import ServiceRequestBanner from '@/components/beautyspace/ServiceRequestBanner';
import { getPlanLimits, canUseFeature } from '@/components/usage/usageLimits';

const sections = [
  { id: 'chatbots', label: 'Crie Chatbots', icon: Bot },
  { id: 'sites', label: 'Crie Sites', icon: Globe },
  { id: 'design', label: 'Faça Designs', icon: Palette },
  { id: 'products', label: 'Crie Produtos', icon: ShoppingBag },
];

export default function BeautySpacePage() {
  const [activeSection, setActiveSection] = useState('chatbots');
  const [isAuth, setIsAuth] = useState(false);
  const [canCreate, setCanCreate] = useState(false);
  const [showPurchase, setShowPurchase] = useState(false);

  useEffect(() => {
    const check = async () => {
      const auth = await base44.auth.isAuthenticated();
      setIsAuth(auth);
      if (!auth) setCanCreate(false);
    };
    check();
  }, []);

  const { data: me } = useQuery({
    queryKey: ['me-ai-doctor'],
    queryFn: () => base44.auth.me(),
    enabled: isAuth
  });

  const { data: profile } = useQuery({
    queryKey: ['profile-ai-doctor', me?.email],
    queryFn: async () => {
      if (!me?.email) return null;
      const res = await base44.entities.UserProfile.list({ query: { user_email: me.email }, limit: 1 });
      return res?.data?.[0] || null;
    },
    enabled: !!me?.email
  });

  const queryClient = useQueryClient();

  const { data: counts } = useQuery({
    queryKey: ['creation-counts', me?.email],
    queryFn: async () => {
      if (!me?.email) return { chatbots: 0, sites: 0, designs: 0, products: 0 };
      const [chatbots, sites, designs, products] = await Promise.all([
        base44.entities.AICreation.list({ query: { owner_email: me.email, type: 'chatbot' }, limit: 1000 }),
        base44.entities.AICreation.list({ query: { owner_email: me.email, type: 'landing_page' }, limit: 1000 }),
        base44.entities.AICreation.list({ query: { owner_email: me.email, type: 'design_project' }, limit: 1000 }),
        base44.entities.Product.list({ query: { owner_email: me.email }, limit: 1000 })
      ]);
      return {
        chatbots: chatbots?.data?.length || 0,
        sites: sites?.data?.length || 0,
        designs: designs?.data?.length || 0,
        products: products?.data?.length || 0,
      };
    },
    enabled: !!me?.email
  });

  useEffect(() => {
    if (!isAuth) return;
    const unsubAIC = base44.entities.AICreation.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ['creation-counts', me?.email] });
    });
    const unsubProd = base44.entities.Product.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ['creation-counts', me?.email] });
    });
    return () => {
      unsubAIC && unsubAIC();
      unsubProd && unsubProd();
    };
  }, [isAuth, me?.email]);

  const limits = getPlanLimits(profile?.plan || 'free');
  const isAdmin = !!profile?.is_admin;
  const usageBySection = {
    chatbots: counts?.chatbots || 0,
    sites: counts?.sites || 0,
    design: counts?.designs || 0,
    products: counts?.products || 0,
  };
  const limitBySection = {
    chatbots: limits.chatbots,
    sites: limits.sites,
    design: limits.designs,
    products: limits.products,
  };
  const canUseMap = {
    chatbots: canUseFeature(usageBySection.chatbots, limitBySection.chatbots),
    sites: canUseFeature(usageBySection.sites, limitBySection.sites),
    design: canUseFeature(usageBySection.design, limitBySection.designs),
    products: canUseFeature(usageBySection.products, limitBySection.products),
  };

  const labels = { chatbots: 'Chatbots', sites: 'Sites', design: 'Designs', products: 'Produtos' };

  const renderSection = () => {
    switch (activeSection) {
      case 'chatbots': return <ChatbotsPage />;
      case 'sites': return <SitesPage />;
      case 'design': return <DesignPage />;
      case 'products': return <ProductsPage />;
      default: return <ChatbotsPage />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#D4A574] to-[#B8935C] rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" />
              <T as="h1" className="text-xl sm:text-2xl md:text-3xl font-light tracking-wide">AI Doctor</T>
            </div>
            <Button onClick={() => setShowPurchase(true)} className="bg-white/20 hover:bg-white/30 text-white rounded-lg h-9 sm:h-10 px-3 sm:px-4 font-light">Contratar Criação</Button>
          </div>
          <T as="p" className="text-white/90 max-w-2xl font-light text-sm sm:text-base">
            O espaço criativo do Clube da Beleza. Crie sites profissionais, designs incríveis e produtos digitais com ajuda da inteligência artificial.
          </T>
        </div>
        <div className="absolute -bottom-10 -right-10 w-24 sm:w-40 h-24 sm:h-40 bg-white/10 rounded-full"></div>
        <div className="absolute -top-5 -right-20 w-20 sm:w-32 h-20 sm:h-32 bg-white/5 rounded-full"></div>
      </div>

      <ServiceRequestBanner me={me} />

       {/* Section Selector */}
      <div className="sticky top-0 z-30 bg-[#F5F1E8]/95 backdrop-blur-md py-4 -mx-3 sm:-mx-4 px-3 sm:px-4 lg:-mx-8 xl:-mx-12 lg:px-8 xl:px-12 border-b border-[#D4A574]/20">
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {sections.map((section) => {
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-light text-xs sm:text-sm whitespace-nowrap transition-all duration-300 ${
                  isActive 
                    ? 'bg-[#D4A574] text-white shadow-lg scale-105' 
                    : 'bg-[#FEFBF7] text-[#6B5D4F] hover:bg-[#FFF9F0] border border-[#D4A574]/20'
                }`}
              >
                <section.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#D4A574]'}`} />
                <T>{section.label}</T>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section Content */}
      <div className="animate-in fade-in duration-300">
        {!isAuth ? (
          <div className="bg-[#FEFBF7] border border-[#D4A574]/30 rounded-xl p-6 text-center">
            <T as="p" className="text-[#2D2416] font-light mb-3">Apenas usuários logados podem criar. Você pode contratar a criação avulsa via QR.</T>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button className="bg-[#D4A574] hover:bg-[#C49565] text-white" onClick={() => base44.auth.redirectToLogin()}>Fazer Login</Button>
              <Button variant="outline" onClick={() => setShowPurchase(true)}>Contratar Criação via QR</Button>
            </div>
          </div>
        ) : isAdmin ? (
          renderSection()
        ) : canUseMap[activeSection] ? (
          renderSection()
        ) : (
          <div className="space-y-4">
            <UsageLimitBanner 
              currentUsage={usageBySection[activeSection]}
              limit={limitBySection[activeSection]}
              resourceName={`Criações de ${labels[activeSection]}`}
              planName={profile?.plan || 'free'}
              isUnlimited={limitBySection[activeSection] === -1}
            />
            <div className="bg-[#FEFBF7] border border-[#D4A574]/30 rounded-xl p-6 text-center">
              <T as="p" className="text-[#2D2416] font-light mb-3">Você atingiu o limite do seu plano para {labels[activeSection]}. Escolha uma opção:</T>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button className="bg-[#D4A574] hover:bg-[#C49565] text-white" onClick={() => setShowPurchase(true)}>
                  Contratar criação avulsa via QR
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/plans'}>
                  Ver Planos
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      <PurchaseQRModal open={showPurchase} onOpenChange={setShowPurchase} />
    </div>
  );
}