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

  // Strict Profile Validation Logic
  const isProfileComplete = React.useMemo(() => {
     if (!profile) return false;
     const hasBasic = !!profile.cpf && !!profile.phone && !!profile.type;
     const hasAddress = !!profile.address?.city && !!profile.address?.state;
     
     if (profile.type === 'professional') {
        return hasBasic && hasAddress && !!profile.professional_registry;
     }
     return hasBasic && hasAddress;
  }, [profile]);

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
  // inicio, agendamentos, enfermeira virtual, chatbots, sites, desgin , produtos, planos
  const navItems = [
    { icon: LayoutDashboard, label: 'Início', path: '/' },
    { icon: Calendar, label: 'Agendamentos', path: '/schedule' },
    { icon: Stethoscope, label: 'Enfermeira Virtual', path: '/nurse' },
    { icon: Bot, label: 'Chatbots', path: '/chatbots' },
    { icon: Globe, label: 'Sites', path: '/sites' },
    { icon: Palette, label: 'Design', path: '/design' },
    { icon: ShoppingBag, label: 'Produtos', path: '/products' },
    { icon: CreditCard, label: 'Planos', path: '/plans' },
    { icon: HelpCircle, label: 'Suporte', path: '/support' },
  ];

  // Premium Dark Spotify-inspired Theme Classes
  const theme = {
    bg: "bg-[#121212]",
    sidebar: "bg-[#000000]",
    card: "bg-[#181818]",
    hover: "hover:bg-[#282828]",
    textPrimary: "text-white",
    textSecondary: "text-[#B3B3B3]",
    accent: "text-[#1DB954]", // Spotify Green
    accentBg: "bg-[#1DB954]",
    border: "border-[#282828]"
  };

  // Onboarding Layout
  if (location.pathname === '/onboarding') {
    return (
      <div className={`min-h-screen ${theme.bg} flex flex-col font-sans text-white`}>
        <header className={`h-16 ${theme.sidebar} border-b ${theme.border} flex items-center justify-between px-4 lg:px-8 sticky top-0 z-50`}>
           <Link to={createPageUrl('Dashboard')} className="flex items-center gap-2 transition-opacity hover:opacity-80">
              <div className="bg-gradient-to-tr from-purple-600 to-blue-600 p-1.5 rounded-lg">
                  <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">HealthAI</span>
           </Link>
           <div className="text-sm font-medium text-[#B3B3B3]">
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
    <div className={`min-h-screen ${theme.bg} flex flex-col font-sans text-[#B3B3B3]`}>
      
      {/* Global Banner - Registration Reminder */}
      {/* Shows ONLY if user is logged in but profile is incomplete */}
      {user && !isLoading && !isProfileComplete && location.pathname !== '/onboarding' && (
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-900 text-white px-4 py-3 text-sm flex flex-col sm:flex-row items-center justify-center gap-3 shadow-lg relative z-50 border-b border-purple-500/30">
          <div className="flex items-center gap-2">
            <span className="bg-white/10 p-1.5 rounded-full animate-pulse"><UserCircle className="w-4 h-4" /></span>
            <span className="font-medium tracking-wide">Complete seu perfil para desbloquear o potencial máximo da HealthAI.</span>
          </div>
          <Link 
            to={createPageUrl('Onboarding')}
            className="bg-white text-purple-900 px-5 py-1.5 rounded-full text-xs font-bold hover:bg-purple-50 transition-all shadow-md transform hover:scale-105 active:scale-95"
          >
            Terminar Cadastro
          </Link>
        </div>
      )}

      {/* Global Banner Display (Ads) */}
      {user && <BannerDisplay userProfile={profile} />}

      <div className="flex flex-1 h-[calc(100vh-64px)]"> 
        {/* Sidebar (Desktop) - Spotify Style */}
        <aside className={`hidden lg:flex w-[240px] flex-col ${theme.sidebar} border-r ${theme.border} sticky top-0 h-screen`}>
           <div className="p-6">
              <Link to={createPageUrl('Dashboard')} className="flex items-center gap-3 transition-opacity hover:opacity-80 mb-8">
                 <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-2 rounded-lg shadow-lg shadow-purple-900/50">
                    <Activity className="w-6 h-6 text-white" />
                 </div>
                 <span className="font-bold text-xl tracking-tight text-white">HealthAI</span>
              </Link>

              <nav className="space-y-2">
                 {navItems.map((item) => {
                   const isActive = location.pathname === item.path;
                   return (
                     <Link
                       key={item.path}
                       to={createPageUrl(item.path.replace('/', ''))}
                       className={`flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-bold transition-all duration-200 group
                         ${isActive 
                           ? 'bg-[#282828] text-white' 
                           : 'text-[#B3B3B3] hover:text-white hover:bg-[#121212]'
                         }`}
                     >
                       <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-purple-400' : 'text-[#B3B3B3] group-hover:text-white'}`} />
                       <span>{item.label}</span>
                     </Link>
                   );
                 })}
              </nav>
           </div>
           
           <div className="mt-auto p-6 border-t border-[#282828]">
              {user ? (
                 <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#282828] transition-colors cursor-pointer group" onClick={() => navigate(createPageUrl('Profile'))}>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-md group-hover:scale-105 transition-transform">
                       {user.full_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                       <p className="text-sm font-bold text-white truncate">{user.full_name}</p>
                       <p className="text-xs text-[#B3B3B3] truncate">Ver Perfil</p>
                    </div>
                 </div>
              ) : (
                 <div className="space-y-2">
                    <Button 
                      onClick={() => navigate(createPageUrl('Onboarding'))}
                      className="w-full bg-purple-600 text-white hover:bg-purple-700 font-bold rounded-full"
                    >
                      Criar Conta
                    </Button>
                    <Button 
                      onClick={() => base44.auth.redirectToLogin(createPageUrl('Dashboard'))}
                      variant="ghost"
                      className="w-full text-[#B3B3B3] hover:text-white hover:bg-transparent h-8 text-xs"
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
                 <Activity className="w-6 h-6 text-purple-500" />
                 <span className="font-bold text-lg text-white">HealthAI</span>
              </Link>
              
              <Sheet>
                 <SheetTrigger asChild>
                   <button className="p-2 text-white hover:bg-[#282828] rounded-full">
                     <Menu className="w-6 h-6" />
                   </button>
                 </SheetTrigger>
                 <SheetContent side="right" className={`${theme.sidebar} border-l ${theme.border} text-white w-[300px]`}>
                    <div className="flex flex-col h-full pt-6">
                       <nav className="space-y-2 flex-1">
                          {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                              <Link
                                key={item.path}
                                to={createPageUrl(item.path.replace('/', ''))}
                                className={`flex items-center gap-4 px-4 py-3 rounded-lg font-medium transition-colors
                                  ${isActive ? 'bg-[#282828] text-white' : 'text-[#B3B3B3] hover:text-white'}`}
                              >
                                <item.icon className={`w-5 h-5 ${isActive ? 'text-purple-400' : ''}`} />
                                {item.label}
                              </Link>
                            );
                          })}
                       </nav>
                       {user && (
                          <div className="pt-6 border-t border-[#282828] space-y-2">
                             <Button variant="ghost" className="w-full justify-start text-[#B3B3B3] hover:text-white hover:bg-[#282828]" onClick={() => navigate(createPageUrl('Profile'))}>
                                <UserCircle className="w-5 h-5 mr-2" /> Perfil
                             </Button>
                             <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-[#282828]" onClick={handleLogout}>
                                <LogOut className="w-5 h-5 mr-2" /> Sair
                             </Button>
                          </div>
                       )}
                    </div>
                 </SheetContent>
              </Sheet>
           </header>

           {/* Scrollable Page Content */}
           <main className={`flex-1 overflow-y-auto bg-gradient-to-b from-[#1f1f1f] to-[#121212] p-4 lg:p-8`}>
              {/* Top Bar (Desktop) */}
              <div className="hidden lg:flex items-center justify-between mb-8">
                 <div className="flex gap-4">
                    <button onClick={() => navigate(-1)} className="bg-[#000000]/70 rounded-full p-2 text-white hover:scale-105 transition-transform"><ChevronRight className="w-6 h-6 rotate-180" /></button>
                    <button onClick={() => navigate(1)} className="bg-[#000000]/70 rounded-full p-2 text-white hover:scale-105 transition-transform"><ChevronRight className="w-6 h-6" /></button>
                 </div>
                 
                 <div className="flex items-center gap-4">
                    {profile?.is_admin && (
                       <Link to={createPageUrl('AdminControl')} className="text-xs font-bold bg-white text-black px-3 py-1.5 rounded-full hover:scale-105 transition-transform">
                          Painel Admin
                       </Link>
                    )}
                    <button className="text-[#B3B3B3] hover:text-white transition-colors"><Bell className="w-5 h-5" /></button>
                    {user && (
                       <div className="relative group">
                          <div 
                            onClick={() => navigate(createPageUrl('Profile'))}
                            className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold cursor-pointer ring-2 ring-transparent group-hover:ring-white transition-all"
                          >
                             {user.full_name?.[0]?.toUpperCase()}
                          </div>
                          <div className="absolute right-0 mt-2 w-48 bg-[#282828] rounded-lg shadow-xl border border-[#181818] py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                             <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-[#B3B3B3] hover:bg-[#3E3E3E] hover:text-white">Sair da conta</button>
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