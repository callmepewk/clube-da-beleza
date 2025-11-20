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
  MapPin
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

export default function Layout({ children }) {
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  
  // Layout States
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [clubDialogOpen, setClubDialogOpen] = useState(false);



  // Sticky/Hideable Header Logic
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsHeaderVisible(false); // Hide on scroll down
      } else {
        setIsHeaderVisible(true); // Show on scroll up
      }
      setLastScrollY(currentScrollY);
    };
    // Attaching to the main element if it's the scroller, or window if body is scroller
    // In this layout, `main` has overflow-y-auto, so we attach to it.
    const mainElement = document.getElementById('main-content');
    if (mainElement) {
       mainElement.addEventListener('scroll', () => {
          const currentScrollY = mainElement.scrollTop;
          if (currentScrollY > lastScrollY && currentScrollY > 50) {
             setIsHeaderVisible(false);
          } else {
             setIsHeaderVisible(true);
          }
          setLastScrollY(currentScrollY);
       });
    }
    return () => mainElement?.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

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
              <h4 className="font-bold text-sm text-slate-700">Notificações ({notifications?.length || 0})</h4>
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
                 <div className="p-8 text-center text-slate-400 text-sm">Nenhuma notificação nova.</div>
              ) : (
                 <div className="divide-y">
                    {notifications?.map(n => (
                       <div key={n.id} className="p-4 hover:bg-slate-50 transition-colors">
                          <h5 className="font-bold text-sm text-slate-800 mb-1">{n.title}</h5>
                          <p className="text-xs text-slate-500 mb-2">{n.message}</p>
                          {n.image_url && <img src={n.image_url} className="w-full h-24 object-cover rounded mb-2" />}
                          {n.link && (
                             <a href={n.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline font-medium">
                                Ver detalhes
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
  const navItems = [
    { icon: LayoutDashboard, label: 'Início', path: '/' },
    { icon: Newspaper, label: 'Notícias', path: '/news' },
    { icon: Calendar, label: 'Agendamentos', path: '/schedule' },
    { icon: Stethoscope, label: 'Enfermeira Virtual', path: '/nurse' },
    { icon: Bot, label: 'Chatbots', path: '/chatbots' },
    { icon: Globe, label: 'Sites', path: '/sites' },
    { icon: Palette, label: 'Design', path: '/design' },
    { icon: ShoppingBag, label: 'Produtos', path: '/products' },
    { icon: CreditCard, label: 'Planos', path: '/plans' },
    { icon: HelpCircle, label: 'Sobre Nós', path: '/about' },
  ];

  // Admin Control Panel - for admin users
  if (profile?.is_admin || user?.email === 'pedro_hbfreitas@hotmail.com') {
     navItems.push({ icon: Shield, label: 'Painel de Controle', path: '/admin-control' });
  }

  // DermaTech Premium Theme (Vibrant, Clean & High Contrast)
  const theme = {
    bg: "bg-[#FAFAFA]", // Neutral crisp white/gray
    sidebar: "bg-[#FFFFFF]", // Pure white
    card: "bg-[#FFFFFF] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] transition-all duration-300",
    hover: "hover:bg-[#F0FDFA]", // Teal tint
    textPrimary: "text-[#0F172A]", // Slate 900 (Sharper contrast)
    textSecondary: "text-[#475569]", // Slate 600 (Readable but softer)
    accent: "text-[#0D9488]", // Teal 600 (Modern Clinical)
    accentBg: "bg-[#0D9488]",
    border: "border-[#E5E7EB]" // Gray 200
  };

  // Onboarding Layout
  if (location.pathname === '/onboarding') {
    return (
      <div className={`min-h-screen ${theme.bg} flex flex-col font-sans text-[#2D3748]`}>
        <header className={`h-16 ${theme.sidebar} border-b ${theme.border} flex items-center justify-between px-4 lg:px-8 sticky top-0 z-50 bg-white/90 backdrop-blur-sm supports-[backdrop-filter]:bg-white/60`}>
           <Link to={createPageUrl('Dashboard')} className="flex items-center gap-2 transition-opacity hover:opacity-80">
              <img 
                 src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691e6fc102be2b10ba4e6392/83b5034e1_beautycenter.png" 
                 alt="Beauty Center"
                 className="h-12 w-auto"
              />
           </Link>
           <div className="text-sm font-medium text-[#475569]">
             Finalizando Cadastro
           </div>
        </header>
        <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.bg} flex flex-col font-sans text-[#0F172A]`}>

      {/* Club Registration Modal */}
      <ClubRegistration open={clubDialogOpen} onOpenChange={setClubDialogOpen} />

      {/* Profile Completion Modal */}
      <AlertDialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <AlertDialogContent className="bg-white border-0 rounded-[2rem] text-[#0F172A] shadow-2xl max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-center text-[#0F766E]">Complete seu Perfil</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-[#64748B] text-base">
               Para aproveitar todas as ferramentas exclusivas do <span className="font-bold text-[#0F172A]">Beauty Center</span>, precisamos de algumas informações adicionais. É rapidinho!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-center py-4">
             <div className="bg-[#F0FDFA] p-4 rounded-full">
                <UserCircle className="w-12 h-12 text-[#0D9488]" />
             </div>
          </div>
          <AlertDialogFooter className="flex-col gap-2 sm:gap-0">
            <Button 
               onClick={() => navigate(createPageUrl('Onboarding'))} 
               className="w-full bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold h-12 rounded-xl shadow-lg shadow-teal-900/20"
            >
               Completar Agora
            </Button>
            <Button 
               variant="ghost" 
               onClick={() => setShowProfileModal(false)}
               className="w-full text-[#64748B] hover:text-[#0F172A]"
            >
               Fazer isso depois
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Global Banner Display (Ads) */}
      {user && <BannerDisplay userProfile={profile} />}

      <div className="flex flex-1 h-[calc(100vh-64px)]"> 
        {/* Sidebar (Desktop) - Premium Clinic Style */}
        <aside className={`hidden lg:flex ${isSidebarCollapsed ? 'w-20' : 'w-[240px]'} flex-col ${theme.sidebar} border-r ${theme.border} sticky top-0 h-screen z-20 transition-all duration-300 ease-in-out`}>
           <div className={`p-6 pb-0 ${isSidebarCollapsed ? 'px-2' : ''}`}>
              <div className="flex items-center justify-between mb-8">
                 {!isSidebarCollapsed && (
                    <Link to={createPageUrl('Dashboard')} className="flex items-center gap-3 transition-opacity hover:opacity-80">
                       <img 
                          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691e6fc102be2b10ba4e6392/83b5034e1_beautycenter.png" 
                          alt="Beauty Center"
                          className="h-14 w-auto"
                       />
                       </Link>
                 )}
                 <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className={`p-2 hover:bg-slate-50 rounded-full text-slate-400 ${isSidebarCollapsed ? 'mx-auto' : ''}`}>
                    {isSidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                 </button>
              </div>

              <nav className="space-y-1">
                 {navItems.map((item) => {
                   const isActive = location.pathname === item.path;
                   return (
                     <Link
                       key={item.path}
                       to={createPageUrl(item.path.replace('/', ''))}
                       className={`flex items-center ${isSidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 group relative
                         ${isActive 
                           ? 'bg-[#F0FDFA] text-[#0D9488] shadow-sm' 
                           : 'text-[#64748B] hover:text-[#0D9488] hover:bg-[#FAFAFA]'
                         }`}
                       title={isSidebarCollapsed ? item.label : ''}
                     >
                       {isActive && !isSidebarCollapsed && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-[#0D9488] rounded-r-full"></div>}
                       <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-[#0D9488]' : 'text-[#94A3B8] group-hover:text-[#0D9488]'}`} />
                       {!isSidebarCollapsed && <span>{item.label}</span>}
                     </Link>
                   );
                 })}
              </nav>
           </div>
           
           <div className={`mt-auto p-6 border-t border-[#F1F5F9] ${isSidebarCollapsed ? 'px-2' : ''}`}>
              {user ? (
                 <div className={`flex items-center gap-3 p-2 rounded-2xl hover:bg-[#F0FDFA] transition-all cursor-pointer group border border-transparent hover:border-[#CCFBF1] ${isSidebarCollapsed ? 'justify-center' : ''}`} onClick={() => navigate(createPageUrl('Profile'))}>
                    <div 
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-[#14B8A6] to-[#0F766E] flex items-center justify-center text-white font-bold shadow-lg ring-4 ring-white min-w-[2.5rem]"
                    >
                       {user.full_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    {!isSidebarCollapsed && (
                       <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-[#0F172A] truncate group-hover:text-[#0D9488] transition-colors">{user.full_name}</p>
                          <p className="text-xs text-[#64748B] truncate font-medium">Ver Perfil</p>
                       </div>
                    )}
                 </div>
              ) : (
                 !isSidebarCollapsed && (
                    <div className="space-y-3">
                       <Button 
                         onClick={() => navigate(createPageUrl('Onboarding'))}
                         className="w-full bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold rounded-xl shadow-lg shadow-teal-500/20 transition-all hover:scale-[1.02]"
                       >
                         Criar Conta
                       </Button>
                       <Button 
                         onClick={() => base44.auth.redirectToLogin(createPageUrl('Dashboard'))}
                         variant="ghost"
                         className="w-full text-[#64748B] hover:text-[#0D9488] hover:bg-[#F0FDFA] h-9 text-xs font-semibold"
                       >
                         Login
                       </Button>
                       <div className="pt-2 border-t border-slate-100">
                          <p className="text-xs text-slate-500 text-center mb-2">Cadastro no Mapa da Estética?</p>
                          <Button 
                            onClick={() => window.open('https://mapa-da-estetica.base44.app', '_blank')}
                            variant="outline"
                            className="w-full border-purple-200 text-purple-700 hover:bg-purple-50 h-9 text-xs font-semibold"
                          >
                            <Globe className="w-3 h-3 mr-2" /> Acessar Mapa
                          </Button>
                       </div>
                    </div>
                 )
              )}
           </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
           {/* Mobile Header */}
           <header className={`lg:hidden h-16 ${theme.sidebar} border-b ${theme.border} flex items-center justify-between px-4 sticky top-0 z-40`}>
              <Link to={createPageUrl('Dashboard')} className="flex items-center gap-2">
                 <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691e6fc102be2b10ba4e6392/83b5034e1_beautycenter.png" 
                    alt="Beauty Center"
                    className="h-10 w-auto"
                 />
              </Link>
              
              <Sheet>
                 <SheetTrigger asChild>
                   <button className="p-2 text-[#1E293B] hover:bg-slate-100 rounded-full">
                     <Menu className="w-6 h-6" />
                   </button>
                 </SheetTrigger>
                 <SheetContent side="right" className={`${theme.sidebar} border-l ${theme.border} text-[#1E293B] w-[300px]`}>
                    <div className="flex flex-col h-full pt-6">
                       <nav className="space-y-2 flex-1">
                          {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                              <Link
                                key={item.path}
                                to={createPageUrl(item.path.replace('/', ''))}
                                className={`flex items-center gap-4 px-4 py-3 rounded-xl font-semibold transition-colors
                                  ${isActive ? 'bg-[#ECFDF5] text-[#059669]' : 'text-[#64748B] hover:text-[#059669] hover:bg-slate-50'}`}
                              >
                                <item.icon className={`w-5 h-5 ${isActive ? 'text-[#059669]' : ''}`} />
                                {item.label}
                              </Link>
                            );
                          })}
                       </nav>
                       {user && (
                          <div className="pt-6 border-t border-slate-100 space-y-2">
                             <Button variant="ghost" className="w-full justify-start text-[#64748B] hover:text-[#059669] hover:bg-slate-50" onClick={() => navigate(createPageUrl('Profile'))}>
                                <UserCircle className="w-5 h-5 mr-2" /> Perfil
                             </Button>
                             <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleLogout}>
                                <LogOut className="w-5 h-5 mr-2" /> Sair
                             </Button>
                          </div>
                       )}
                    </div>
                 </SheetContent>
              </Sheet>
           </header>

           {/* Scrollable Page Content */}
           <main id="main-content" className={`flex-1 overflow-y-auto bg-[#F8FAFC] p-4 lg:p-8 relative`}>
              {/* Top Bar (Desktop) */}
              <div className={`hidden lg:flex items-center justify-between mb-8 sticky top-0 z-30 bg-[#F8FAFC]/90 backdrop-blur-sm py-2 transition-transform duration-300 ${isHeaderVisible ? 'translate-y-0' : '-translate-y-full absolute top-[-100px]'}`}>
                 <div className="flex gap-3">
                    <button onClick={() => setIsHeaderVisible(false)} className="text-xs text-slate-400 hover:text-slate-600 mr-2" title="Ocultar menu">
                       <div className="w-8 h-1 bg-slate-300 rounded-full" />
                    </button>
                 </div>

                 <div className="flex items-center gap-4">
                    {profile?.is_admin && (
                       <Link to={createPageUrl('AdminControl')} className="text-xs font-bold bg-gradient-to-r from-[#2D3748] to-[#1A202C] text-white px-6 py-3 rounded-2xl hover:scale-105 transition-transform shadow-lg flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Painel Admin
                       </Link>
                    )}
                    <NotificationsPopover user={user} />
                    {user && (
                       <div className="relative group">
                          <div 
                            onClick={() => navigate(createPageUrl('Profile'))}
                            className="w-9 h-9 rounded-full bg-gradient-to-br from-[#CDB7FF] to-[#3BAE9C] flex items-center justify-center text-white font-bold cursor-pointer shadow-sm ring-2 ring-white group-hover:ring-[#8EE2C8] transition-all"
                          >
                             {user.full_name?.[0]?.toUpperCase()}
                          </div>
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-[#E2E8F0] py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 transform origin-top-right">
                             <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-[#2D3748] hover:bg-[#F4F7F7] font-medium flex items-center gap-2">
                                <LogOut className="w-4 h-4 text-red-400" /> Sair da conta
                             </button>
                          </div>
                       </div>
                    )}
                 </div>
              </div>

              {/* Header Re-opener Handle */}
              {!isHeaderVisible && (
                 <div className="fixed top-0 left-1/2 -translate-x-1/2 z-40">
                    <button onClick={() => setIsHeaderVisible(true)} className="bg-white border border-t-0 border-slate-200 rounded-b-xl px-4 py-1 shadow-sm hover:bg-slate-50 transition-all group">
                       <div className="w-8 h-1 bg-slate-300 rounded-full group-hover:bg-[#0D9488]" />
                    </button>
                 </div>
              )}

              {/* Actual Page Children */}
              <div className="fade-in-up">
                 {children}
              </div>
           </main>
        </div>
      </div>

      {/* Delete Account Alert */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent className="bg-[#282828] border-[#181818] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription className="text-[#B3B3B3]">
              Esta ação não pode ser desfeita. Isso excluirá permanentemente seu perfil e removerá seus dados de nossos servidores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#3E3E3E] text-white border-transparent hover:bg-[#505050]">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700 text-white border-0">
              Sim, excluir minha conta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}