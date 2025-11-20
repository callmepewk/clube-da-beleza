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
  Bell
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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

export default function Layout({ children }) {
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

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

  // Enhanced Profile Validation Logic
  const isProfileComplete = React.useMemo(() => {
     if (!profile) return false;
     
     // Required fields check
     const hasName = !!user?.full_name;
     const hasBasic = !!profile.cpf && !!profile.phone && !!profile.type;
     const hasAddress = !!profile.address?.street && !!profile.address?.city && !!profile.address?.state && !!profile.address?.zip;
     
     // Professional specific check
     if (profile.type === 'professional') {
        const hasRegistry = !!profile.professional_registry;
        // If service address is different, check it too (simplified here to just registry for core completion)
        return hasName && hasBasic && hasAddress && hasRegistry;
     }
     
     return hasName && hasBasic && hasAddress;
  }, [profile, user]);

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

  // Define all available pages with requested order
  const navItems = [
    { icon: LayoutDashboard, label: 'Início', path: '/' },
    { icon: Calendar, label: 'Agendamentos', path: '/schedule' },
    { icon: Stethoscope, label: 'Enfermeira Virtual', path: '/nurse' },
    { icon: Bot, label: 'Chatbots', path: '/chatbots' },
    { icon: Globe, label: 'Sites', path: '/sites' },
    { icon: Palette, label: 'Design', path: '/design' },
    { icon: ShoppingBag, label: 'Produtos', path: '/products' },
    { icon: CreditCard, label: 'Planos', path: '/plans' },
    { icon: HelpCircle, label: 'Sobre Nós', path: '/about' },
  ];

  if (profile?.is_admin) {
     navItems.push({ icon: LayoutDashboard, label: 'Painel de Controle', path: '/admin-control' });
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
              <div className="bg-gradient-to-tr from-[#0F766E] to-[#2DD4BF] p-1.5 rounded-xl shadow-lg shadow-teal-200/50">
                  <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-[#0F172A]">HealthAI</span>
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
      
      {/* Global Banner - Registration Reminder */}
      {/* Shows ONLY if user is logged in but profile is incomplete */}
      {user && !isLoading && !isProfileComplete && location.pathname !== '/onboarding' && (
        <div className="bg-gradient-to-r from-[#0F766E] to-[#0D9488] text-white px-4 py-3 text-sm flex flex-col sm:flex-row items-center justify-center gap-3 shadow-lg relative z-50">
          <div className="flex items-center gap-2">
            <span className="bg-white/20 p-1.5 rounded-full animate-pulse"><UserCircle className="w-4 h-4" /></span>
            <span className="font-medium tracking-wide">Complete seu perfil para desbloquear o potencial máximo da HealthAI.</span>
          </div>
          <Link 
            to={createPageUrl('Onboarding')}
            className="bg-white text-[#0F766E] px-6 py-2 rounded-full text-xs font-bold hover:bg-teal-50 transition-all shadow-md transform hover:scale-105 active:scale-95"
          >
            Terminar Cadastro
          </Link>
        </div>
      )}

      {/* Global Banner Display (Ads) */}
      {user && <BannerDisplay userProfile={profile} />}

      <div className="flex flex-1 h-[calc(100vh-64px)]"> 
        {/* Sidebar (Desktop) - Premium Clinic Style */}
        <aside className={`hidden lg:flex w-[240px] flex-col ${theme.sidebar} border-r ${theme.border} sticky top-0 h-screen z-20`}>
           <div className="p-6 pb-0">
              <Link to={createPageUrl('Dashboard')} className="flex items-center gap-3 transition-opacity hover:opacity-80 mb-8">
                 <div className="bg-gradient-to-br from-[#0F766E] to-[#2DD4BF] p-2.5 rounded-2xl shadow-lg shadow-teal-900/10">
                    <Activity className="w-6 h-6 text-white" />
                 </div>
                 <span className="font-bold text-xl tracking-tight text-[#0F172A]">HealthAI</span>
              </Link>

              <nav className="space-y-1">
                 {navItems.map((item) => {
                   const isActive = location.pathname === item.path;
                   return (
                     <Link
                       key={item.path}
                       to={createPageUrl(item.path.replace('/', ''))}
                       className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 group relative
                         ${isActive 
                           ? 'bg-[#F0FDFA] text-[#0D9488] shadow-sm' 
                           : 'text-[#64748B] hover:text-[#0D9488] hover:bg-[#FAFAFA]'
                         }`}
                     >
                       {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-[#0D9488] rounded-r-full"></div>}
                       <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-[#0D9488]' : 'text-[#94A3B8] group-hover:text-[#0D9488]'}`} />
                       <span>{item.label}</span>
                     </Link>
                   );
                 })}
              </nav>
           </div>
           
           <div className="mt-auto p-6 border-t border-[#F1F5F9]">
              {user ? (
                 <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-[#F0FDFA] transition-all cursor-pointer group border border-transparent hover:border-[#CCFBF1]" onClick={() => navigate(createPageUrl('Profile'))}>
                    <div 
                      className="w-11 h-11 rounded-full bg-gradient-to-br from-[#14B8A6] to-[#0F766E] flex items-center justify-center text-white font-bold shadow-lg ring-4 ring-white"
                    >
                       {user.full_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                       <p className="text-sm font-bold text-[#0F172A] truncate group-hover:text-[#0D9488] transition-colors">{user.full_name}</p>
                       <p className="text-xs text-[#64748B] truncate font-medium">Ver Perfil</p>
                    </div>
                 </div>
              ) : (
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
                      Já tenho conta
                    </Button>
                 </div>
              )}
           </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
           {/* Mobile Header */}
           <header className={`lg:hidden h-16 ${theme.sidebar} border-b ${theme.border} flex items-center justify-between px-4 sticky top-0 z-40`}>
              <Link to={createPageUrl('Dashboard')} className="flex items-center gap-2">
                 <Activity className="w-6 h-6 text-[#059669]" />
                 <span className="font-bold text-lg text-[#1E293B]">HealthAI</span>
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
           <main className={`flex-1 overflow-y-auto bg-[#F8FAFC] p-4 lg:p-8 relative`}>
           {/* Ambient Gradient Background Removed for clarity */}
           {/* <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[#E6FFFA] to-transparent pointer-events-none" /> */}
              
              {/* Top Bar (Desktop) */}
              <div className="hidden lg:flex items-center justify-between mb-8 relative z-10">
                 <div className="flex gap-3">
                    <button onClick={() => navigate(-1)} className="bg-white/80 backdrop-blur-sm shadow-sm border border-white/50 rounded-full p-2 text-[#2D3748] hover:scale-105 hover:shadow-md transition-all"><ChevronRight className="w-5 h-5 rotate-180" /></button>
                    <button onClick={() => navigate(1)} className="bg-white/80 backdrop-blur-sm shadow-sm border border-white/50 rounded-full p-2 text-[#2D3748] hover:scale-105 hover:shadow-md transition-all"><ChevronRight className="w-5 h-5" /></button>
                 </div>
                 
                 <div className="flex items-center gap-4">
                    {profile?.is_admin && (
                       <Link to={createPageUrl('AdminControl')} className="text-xs font-bold bg-[#2D3748] text-white px-4 py-2 rounded-full hover:scale-105 transition-transform shadow-md">
                          Painel Admin
                       </Link>
                    )}
                    <button className="text-[#A7AFB4] hover:text-[#3BAE9C] transition-colors bg-white/50 p-2 rounded-full hover:bg-white"><Bell className="w-5 h-5" /></button>
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