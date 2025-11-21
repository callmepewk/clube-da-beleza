import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  LayoutDashboard, 
  Stethoscope, 
  Calendar, 
  Bot, 
  Globe, 
  Palette, 
  ShoppingBag, 
  UserCircle, 
  LogOut,
  Menu,
  X,
  Activity,
  CreditCard,
  LogIn,
  Trash2,
  FileText,
  HelpCircle,
  ChevronRight,
  Bell,
  Newspaper,
  CheckCheck,
  Trash,
  Shield,
  ShieldCheck,
  MapPin,
  Zap,
  Heart
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import BannerDisplay from '@/components/banners/BannerDisplay';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import ClubRegistration from '@/components/ClubRegistration';
import Footer from '@/components/Footer';
import CarolChat from '@/components/CarolChat';
import LanguageSelector from '@/components/LanguageSelector';
import TranslationProvider from '@/components/TranslationProvider';
import T from '@/components/TranslatedText';

export default function Layout({ children }) {
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  
  // Layout States
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [clubDialogOpen, setClubDialogOpen] = useState(false);





  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        const userData = await base44.auth.me();
        setUser(userData);
      }
    };
    checkAuth();
  }, []);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      const u = await base44.auth.me();
      if (!u) return null;
      const res = await base44.entities.UserProfile.list({ query: { user_email: u.email } });
      return res?.data?.[0] || null;
    },
    enabled: !!user
  });

  // Activity Tracking
  const updateActivityMutation = useMutation({
     mutationFn: async () => {
        if (!profile) return;
        await base44.entities.UserProfile.update(profile.id, { 
           last_active_at: new Date().toISOString()
        });
     }
  });

  // Update activity every 5 minutes if user is active
  useEffect(() => {
     if (!user || !profile) return;
     
     // Initial update
     updateActivityMutation.mutate();

     const interval = setInterval(() => {
        if (document.visibilityState === 'visible') {
           updateActivityMutation.mutate();
        }
     }, 5 * 60 * 1000); // 5 minutes

     return () => clearInterval(interval);
  }, [user?.email, profile?.id]);

  // Enhanced Profile Validation Logic
  const isProfileComplete = React.useMemo(() => {
     if (!profile) return false;
     
     const hasName = !!user?.full_name;
     const hasBasic = !!profile.cpf && !!profile.phone && !!profile.type;
     const hasAddress = !!profile.address?.street && !!profile.address?.city && !!profile.address?.state && !!profile.address?.zip;
     
     if (profile.type === 'professional') {
        const hasRegistry = !!profile.professional_registry;
        return hasName && hasBasic && hasAddress && hasRegistry;
     }
     
     return hasName && hasBasic && hasAddress;
  }, [profile, user]);

  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
     if (user && !isLoading && !isProfileComplete) {
        const hasSeenModal = sessionStorage.getItem('profile_modal_seen');
        if (!hasSeenModal) {
           setShowProfileModal(true);
           sessionStorage.setItem('profile_modal_seen', 'true');
        }
     }
  }, [user, isLoading, isProfileComplete]);

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  const handleDeleteAccount = async () => {
     if (!profile) return;
     try {
        // Since we can't delete auth user directly via SDK usually, we delete the profile data
        // and logout, simulating deletion. In a real app, triggers a cloud function.
        await base44.entities.UserProfile.delete(profile.id);
        await base44.auth.logout();
     } catch (error) {
        console.error("Error deleting account", error);
        alert("Erro ao excluir conta. Entre em contato com o suporte.");
     }
  };

  // Notifications Component
  const NotificationsPopover = ({ user }) => {
    const queryClient = useQueryClient();
    const { data: notifications } = useQuery({
      queryKey: ['notifications', user?.email],
      queryFn: async () => {
        if (!user?.email) return [];
        // Fetch notifications for this user OR broadcast ('ALL')
        // Since we can't do complex OR queries easily in one go with limited SDK, we fetch user specific and ALL
        const [specific, broadcast] = await Promise.all([
           base44.entities.Notification.list({ query: { recipient_email: user.email }, limit: 50, sort: { created_at: -1 } }),
           base44.entities.Notification.list({ query: { recipient_email: 'ALL' }, limit: 20, sort: { created_at: -1 } })
        ]);
        
        // Merge and Sort
        let all = [...(specific.data || []), ...(broadcast.data || [])];
        all = all.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        
        // Filter out "read" broadcasts locally
        return all.filter(n => {
           if (n.recipient_email === 'ALL') {
              return !n.read_by?.includes(user.email);
           }
           return !n.is_read;
        });
      },
      enabled: !!user?.email,
      refetchInterval: 30000 // Check every 30s
    });

    const markAllReadMutation = useMutation({
      mutationFn: async () => {
        if (!notifications) return;
        for (const n of notifications) {
           if (n.recipient_email === 'ALL') {
              const currentReadBy = n.read_by || [];
              if (!currentReadBy.includes(user.email)) {
                 await base44.entities.Notification.update(n.id, { read_by: [...currentReadBy, user.email] });
              }
           } else {
              await base44.entities.Notification.update(n.id, { is_read: true });
           }
        }
      },
      onSuccess: () => queryClient.invalidateQueries(['notifications'])
    });

    const deleteAllMutation = useMutation({
      mutationFn: async () => {
         if (!notifications) return;
         // Only delete personal notifications. Broadcasts are just hidden (marked read logic)
         const personal = notifications.filter(n => n.recipient_email !== 'ALL');
         for (const n of personal) {
            await base44.entities.Notification.delete(n.id);
         }
         // For broadcast, we just mark read
         const broadcast = notifications.filter(n => n.recipient_email === 'ALL');
         for (const n of broadcast) {
             const currentReadBy = n.read_by || [];
             if (!currentReadBy.includes(user.email)) {
                 await base44.entities.Notification.update(n.id, { read_by: [...currentReadBy, user.email] });
             }
         }
      },
      onSuccess: () => queryClient.invalidateQueries(['notifications'])
    });

    return (
      <Popover>
        <PopoverTrigger asChild>
          <button className="text-[#A7AFB4] hover:text-[#3BAE9C] transition-colors bg-white/50 p-2 rounded-full hover:bg-white relative">
             <Bell className="w-5 h-5" />
             {notifications?.length > 0 && (
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
             )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
           <div className="p-4 border-b flex justify-between items-center bg-slate-50">
              <h4 className="font-bold text-sm text-slate-700"><T>Notificações</T> ({notifications?.length || 0})</h4>
              <div className="flex gap-1">
                 <Button variant="ghost" size="icon" className="h-6 w-6" title="Marcar lidas" onClick={() => markAllReadMutation.mutate()}>
                    <CheckCheck className="w-4 h-4 text-green-600" />
                 </Button>
                 <Button variant="ghost" size="icon" className="h-6 w-6" title="Limpar" onClick={() => deleteAllMutation.mutate()}>
                    <Trash className="w-4 h-4 text-red-500" />
                 </Button>
              </div>
           </div>
           <ScrollArea className="h-[300px]">
              {notifications?.length === 0 ? (
                 <div className="p-8 text-center text-slate-400 text-sm"><T>Nenhuma notificação nova.</T></div>
              ) : (
                 <div className="divide-y">
                    {notifications?.map(n => (
                       <div key={n.id} className="p-4 hover:bg-slate-50 transition-colors">
                          <h5 className="font-bold text-sm text-slate-800 mb-1">{n.title}</h5>
                          <p className="text-xs text-slate-500 mb-2">{n.message}</p>
                          {n.image_url && <img src={n.image_url} className="w-full h-24 object-cover rounded mb-2" />}
                          {n.link && (
                             <a href={n.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline font-medium">
                                <T>Ver detalhes</T>
                             </a>
                          )}
                       </div>
                    ))}
                 </div>
              )}
           </ScrollArea>
        </PopoverContent>
      </Popover>
    );
  };

  // Define all available pages with requested order
  const navItems = React.useMemo(() => {
    const items = [
      { icon: LayoutDashboard, label: 'Início', path: '/', translationKey: 'Início' },
      { icon: Newspaper, label: 'Notícias', path: '/news', translationKey: 'Notícias' },
      { icon: Calendar, label: 'Agendamentos', path: '/schedule', translationKey: 'Agendamentos' },
      { icon: Stethoscope, label: 'Bia - Cuidadora Virtual', path: '/nurse', translationKey: 'Bia - Cuidadora Virtual' },
      { icon: Bot, label: 'Chatbots', path: '/chatbots', translationKey: 'Chatbots' },
      { icon: Globe, label: 'Sites', path: '/sites', translationKey: 'Sites' },
      { icon: Palette, label: 'Design', path: '/design', translationKey: 'Design' },
      { icon: ShoppingBag, label: 'Produtos', path: '/products', translationKey: 'Produtos' },
      { icon: Zap, label: 'Ferramentas', path: '/tools', translationKey: 'Ferramentas' },
      { icon: CreditCard, label: 'Planos', path: '/plans', translationKey: 'Planos' },
      { icon: FileText, label: 'Nossa Missão', path: '/OurMission', translationKey: 'Nossa Missão' },
      { icon: Activity, label: 'Chá da Beleza', path: '/BeautyTea', translationKey: 'Chá da Beleza' },
      { icon: UserCircle, label: 'Cuidadores da Pele', path: '/SkinCaretakers', translationKey: 'Cuidadores da Pele' },
      { icon: Heart, label: 'Beleza Solidária', path: '/SolidBeauty', translationKey: 'Beleza Solidária' },
      { icon: Activity, label: 'Dose Certa', path: '/RightDose', translationKey: 'Dose Certa' },
      { icon: ShoppingBag, label: 'Beauty Box', path: '/BeautyBox', translationKey: 'Beauty Box' },
      { icon: ShieldCheck, label: 'Selo de Qualidade', path: '/QualitySeal', translationKey: 'Selo de Qualidade' },
      { icon: HelpCircle, label: 'Sobre Nós', path: '/about', translationKey: 'Sobre Nós' },
    ];

    // Add Controle page only for admins
    if (profile?.is_admin) {
      items.splice(1, 0, { icon: Shield, label: 'Controle', path: '/admincontrol', translationKey: 'Controle' });
    }

    return items;
  }, [profile?.is_admin]);



  // Clube da Beleza Luxury Theme (Gold & Nude)
  const theme = {
    bg: "bg-[#F5F1E8]", // Nude/beige background
    sidebar: "bg-[#FEFBF7]", // Lighter nude for sidebar
    card: "bg-[#FEFBF7] shadow-[0_2px_15px_-3px_rgba(212,165,116,0.15)] hover:shadow-[0_8px_25px_-5px_rgba(212,165,116,0.25)] transition-all duration-300 border border-[#D4A574]/20",
    hover: "hover:bg-[#FFF9F0]", // Light gold tint
    textPrimary: "text-[#2D2416]", // Dark brown/black
    textSecondary: "text-[#6B5D4F]", // Muted brown
    accent: "text-[#D4A574]", // Gold
    accentBg: "bg-[#D4A574]",
    border: "border-[#E8DCC8]" // Soft beige border
  };

  // Onboarding Layout
  if (location.pathname === '/onboarding') {
    return (
      <div className={`min-h-screen ${theme.bg} flex flex-col font-serif ${theme.textPrimary}`}>
        <header className={`h-20 ${theme.sidebar} border-b ${theme.border} flex items-center justify-between px-4 lg:px-8 sticky top-0 z-50 backdrop-blur-sm`}>
           <Link to={createPageUrl('Dashboard')} className="flex items-center gap-3 transition-opacity hover:opacity-80">
              <div className="text-2xl font-light tracking-wider ${theme.textPrimary}">CLUBE DA BELEZA</div>
           </Link>
           <div className="flex items-center gap-4">
             <LanguageSelector />
             <div className="text-sm font-light ${theme.textSecondary} tracking-wide">
               <T>Finalizando Cadastro</T>
             </div>
           </div>
        </header>
        <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">
          {children}
        </main>
      </div>
    );
  }

  return (
    <TranslationProvider>
    <div className={`min-h-screen ${theme.bg} flex font-serif ${theme.textPrimary}`}>

      {/* Club Registration Modal */}
      <ClubRegistration open={clubDialogOpen} onOpenChange={setClubDialogOpen} />

      {/* Profile Completion Modal */}
      <AlertDialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <AlertDialogContent className={`${theme.sidebar} border ${theme.border} rounded-3xl ${theme.textPrimary} shadow-2xl max-w-lg`}>
          <AlertDialogHeader>
            <AlertDialogTitle className={`text-2xl font-light text-center ${theme.accent} tracking-wide`}><T>Complete seu Perfil</T></AlertDialogTitle>
            <AlertDialogDescription className={`text-center ${theme.textSecondary} text-base font-light`}>
               <T>Para aproveitar todas as ferramentas exclusivas do Clube da Beleza, precisamos de algumas informações adicionais. É rapidinho!</T>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-center py-4">
             <div className="bg-[#FFF9F0] p-4 rounded-full border border-[#D4A574]/30">
                <UserCircle className={`w-12 h-12 ${theme.accent}`} />
             </div>
          </div>
          <AlertDialogFooter className="flex-col gap-2 sm:gap-0">
            <Button 
               onClick={() => navigate(createPageUrl('Onboarding'))} 
               className={`w-full ${theme.accentBg} hover:bg-[#C49565] text-white font-light h-12 rounded-2xl shadow-lg tracking-wide`}
               >
               <T>Completar Agora</T>
               </Button>
               <Button 
               variant="ghost" 
               onClick={() => setShowProfileModal(false)}
               className={`w-full ${theme.textSecondary} hover:${theme.textPrimary} font-light`}
               >
               <T>Fazer isso depois</T>
               </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Global Banner Display (Ads) */}
      {user && <BannerDisplay userProfile={profile} />}

      {/* Left Sidebar Navigation (Desktop) */}
      <aside className={`hidden lg:flex flex-col ${theme.sidebar} border-r ${theme.border} w-72 fixed left-0 top-0 bottom-0 z-50 overflow-y-auto`}>
        {/* Logo */}
        <div className="p-8 border-b border-[#D4A574]/20">
          <Link to={createPageUrl('Dashboard')}>
            <div className={`text-2xl font-light tracking-[0.2em] ${theme.textPrimary} text-center`}>
              CLUBE DA<br/>BELEZA
            </div>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-[#D4A574] to-transparent mt-4"></div>
          </Link>
          <div className="mt-4 flex justify-center">
            <LanguageSelector />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto min-h-0 pb-32">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={createPageUrl(item.path.replace('/', ''))}
                className={`flex items-center gap-4 px-4 py-4 rounded-xl font-light text-sm tracking-wide transition-all duration-300
                  ${isActive 
                    ? `${theme.accentBg} text-white shadow-lg` 
                    : `${theme.textSecondary} ${theme.hover} hover:${theme.accent}`
                  }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : theme.accent}`} />
                <T>{item.translationKey}</T>
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section */}
        {user ? (
          <div className="p-6 border-t border-[#D4A574]/20">
            <Popover>
              <PopoverTrigger asChild>
                <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#FFF9F0] transition-all">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-[#D4A574] to-[#B8935C] flex items-center justify-center text-white font-light shadow-lg`}>
                    {user.full_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="text-left flex-1">
                    <p className={`text-sm font-medium ${theme.textPrimary}`}>{user.full_name?.split(' ')[0]}</p>
                    <p className={`text-xs ${theme.textSecondary} font-light`}>
                      {profile?.plan ? profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1) : 'Free'}
                    </p>
                  </div>
                </button>
              </PopoverTrigger>
              <PopoverContent className={`w-64 p-0 ${theme.sidebar} border ${theme.border}`} align="end" side="top">
                <div className="p-4 border-b border-[#D4A574]/20">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-[#D4A574] to-[#B8935C] flex items-center justify-center text-white font-light shadow-lg`}>
                      {user.full_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className={`font-medium ${theme.textPrimary}`}>{user.full_name}</p>
                      <p className={`text-xs ${theme.textSecondary} font-light`}>{user.email}</p>
                    </div>
                  </div>
                </div>

                <div className="py-2">
                  <button 
                    onClick={() => navigate(createPageUrl('Profile'))}
                    className={`w-full text-left px-4 py-3 hover:bg-[#FFF9F0] transition-colors flex items-center gap-3 text-sm font-light ${theme.textPrimary}`}
                  >
                    <UserCircle className={`w-4 h-4 ${theme.accent}`} />
                    <T>Meu Perfil</T>
                  </button>

                  <button 
                    onClick={() => navigate(createPageUrl('Plans'))}
                    className={`w-full text-left px-4 py-3 hover:bg-[#FFF9F0] transition-colors flex items-center gap-3 text-sm font-light ${theme.textPrimary}`}
                  >
                    <CreditCard className={`w-4 h-4 ${theme.accent}`} />
                    <div className="flex-1 flex items-center justify-between">
                      <T>Plano Atual</T>
                      <span className={`text-xs font-medium ${theme.accent} uppercase`}>
                        {profile?.plan || 'Free'}
                      </span>
                    </div>
                  </button>

                  {profile?.is_admin && (
                    <button 
                      onClick={() => navigate(createPageUrl('AdminControl'))}
                      className={`w-full text-left px-4 py-3 hover:bg-[#FFF9F0] transition-colors flex items-center gap-3 text-sm font-light ${theme.textPrimary}`}
                    >
                      <Shield className={`w-4 h-4 ${theme.accent}`} />
                      <T>Controle</T>
                    </button>
                  )}
                </div>

                <div className="border-t border-[#D4A574]/20 py-2">
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 hover:bg-red-50 transition-colors flex items-center gap-3 text-sm font-light text-red-600"
                    >
                    <LogOut className="w-4 h-4" />
                    <T>Sair da Conta</T>
                    </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        ) : (
          <div className="p-6 border-t border-[#D4A574]/20 space-y-2">
            <Button 
              onClick={() => base44.auth.redirectToLogin(createPageUrl('Dashboard'))}
              variant="outline"
              className={`w-full border ${theme.border} ${theme.textSecondary} hover:${theme.accentBg} hover:text-white font-light rounded-2xl`}
              >
              <T>Login</T>
              </Button>
            <Button 
              onClick={() => navigate(createPageUrl('Onboarding'))}
              className={`w-full ${theme.accentBg} hover:bg-[#C49565] text-white font-light rounded-2xl shadow-lg`}
              >
              <T>Criar Conta</T>
              </Button>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-72">
        {/* Mobile Header */}
        <header className={`lg:hidden h-16 ${theme.sidebar} border-b ${theme.border} flex items-center justify-between px-4 sticky top-0 z-40`}>
          <Link to={createPageUrl('Dashboard')} className="flex items-center gap-2">
            <div className={`text-lg font-light tracking-wider ${theme.textPrimary}`}>CLUBE DA BELEZA</div>
          </Link>

          <div className="flex items-center gap-2">
            <LanguageSelector />
            <Sheet>
              <SheetTrigger asChild>
                <button className={`p-2 ${theme.textPrimary} hover:bg-[#FFF9F0] rounded-full`}>
                  <Menu className="w-6 h-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className={`${theme.sidebar} border-l ${theme.border} ${theme.textPrimary} w-[300px]`}>
                <div className="flex flex-col h-full pt-6">
                  <nav className="space-y-2 flex-1">
                    {navItems.map((item) => {
                      const isActive = location.pathname === item.path;
                      return (
                        <Link
                          key={item.path}
                          to={createPageUrl(item.path.replace('/', ''))}
                          className={`flex items-center gap-4 px-4 py-3 rounded-xl font-light transition-colors
                            ${isActive ? `${theme.accentBg} text-white` : `${theme.textSecondary} hover:bg-[#FFF9F0]`}`}
                            >
                            <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : theme.accent}`} />
                            <T>{item.translationKey}</T>
                            </Link>
                      );
                    })}
                  </nav>
                  {user && (
                    <div className="pt-6 border-t border-[#D4A574]/20 space-y-2">
                      <Button variant="ghost" className={`w-full justify-start ${theme.textSecondary} hover:bg-[#FFF9F0] font-light`} onClick={() => navigate(createPageUrl('Profile'))}>
                        <UserCircle className="w-5 h-5 mr-2" /> <T>Perfil</T>
                      </Button>
                      <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 font-light" onClick={handleLogout}>
                        <LogOut className="w-5 h-5 mr-2" /> <T>Sair</T>
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main id="main-content" className={`flex-1 overflow-y-auto ${theme.bg}`}>
          <div className="p-4 lg:p-12 max-w-7xl mx-auto">
            {children}
          </div>
          <Footer />
        </main>
      </div>

      {/* Delete Account Alert */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent className={`${theme.sidebar} border ${theme.border} ${theme.textPrimary} rounded-3xl`}>
          <AlertDialogHeader>
            <AlertDialogTitle className={theme.textPrimary}><T>Tem certeza absoluta?</T></AlertDialogTitle>
            <AlertDialogDescription className={theme.textSecondary}>
              <T>Esta ação não pode ser desfeita. Isso excluirá permanentemente seu perfil e removerá seus dados de nossos servidores.</T>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={`${theme.border} ${theme.textSecondary} hover:bg-[#FFF9F0]`}><T>Cancelar</T></AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700 text-white border-0">
              <T>Sim, excluir minha conta</T>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Carol Chat */}
      <CarolChat />
      </div>
    </TranslationProvider>
      );
      }