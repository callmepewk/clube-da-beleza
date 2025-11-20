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
  FileText
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
  ];

  // If on onboarding page
  if (location.pathname === '/onboarding') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-50">
           <Link to={createPageUrl('Dashboard')} className="flex items-center gap-2 text-emerald-600 hover:opacity-80 transition-opacity">
              <Activity className="w-6 h-6" />
              <span className="font-bold text-xl tracking-tight">HealthAI</span>
           </Link>
           <div className="text-sm font-medium text-slate-500">
             Finalizando Cadastro
           </div>
        </header>
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      
      {/* Registration Banner */}
      {user && !isLoading && !profile && location.pathname !== '/onboarding' && (
        <div className="bg-indigo-600 text-white px-4 py-2 text-sm flex items-center justify-center gap-4 shadow-md relative z-50 text-center">
          <div className="flex items-center gap-2 inline-flex">
            <span className="bg-white/20 p-1 rounded hidden sm:inline"><UserCircle className="w-4 h-4" /></span>
            <span className="font-medium">Complete seu perfil para desbloquear todas as funcionalidades.</span>
          </div>
          <Link 
            to={createPageUrl('Onboarding')}
            className="bg-white text-indigo-600 px-4 py-1 rounded-full text-xs font-bold hover:bg-indigo-50 transition-all shadow-sm hover:shadow"
          >
            Cadastrar Agora
          </Link>
        </div>
      )}

      {/* Horizontal Header Navigation */}
      <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-[1920px] mx-auto h-full px-4 lg:px-8 flex items-center justify-between">
          
          {/* Logo & Desktop Nav */}
          <div className="flex items-center gap-8 shrink-0 overflow-x-auto no-scrollbar">
            <Link to={createPageUrl('Dashboard')} className="flex items-center gap-2 text-emerald-600 hover:opacity-80 transition-opacity shrink-0">
              <div className="bg-emerald-500 p-1.5 rounded-lg">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight hidden sm:block">HealthAI</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={createPageUrl(item.path.replace('/', ''))}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap
                      ${isActive 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                  >
                    <item.icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden xl:block">
                  <p className="text-sm font-medium text-slate-900">{user.full_name}</p>
                  <p className="text-xs text-slate-500 truncate max-w-[150px]">{user.email}</p>
                </div>
                
                <div className="relative group">
                  <button className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-medium border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all">
                    {user.full_name?.[0]?.toUpperCase() || 'U'}
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-100 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50">
                    <div className="px-4 py-2 border-b border-slate-50 lg:hidden">
                      <p className="text-sm font-medium text-slate-900 truncate">{user.full_name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                    {profile && (
                      <div className="px-4 py-2 text-xs text-slate-400 uppercase tracking-wider font-semibold">
                        {profile.type === 'professional' ? 'Profissional' : 'Paciente'}
                      </div>
                    )}
                    
                    {profile?.is_admin && (
                      <Link to={createPageUrl('AdminControl')} className="flex items-center gap-2 px-4 py-2 text-sm text-indigo-700 font-semibold hover:bg-indigo-50 bg-indigo-50/30">
                        <Activity className="w-4 h-4" /> Painel de Controle
                      </Link>
                    )}
                    <Link to={createPageUrl('Profile')} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                      <UserCircle className="w-4 h-4" /> Meu Perfil
                    </Link>
                    <Link to={createPageUrl('MyPlan')} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                      <CreditCard className="w-4 h-4" /> Meu Plano
                    </Link>
                    
                    <div className="border-t border-slate-100 my-1"></div>
                    
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" /> Sair
                    </button>
                    <button 
                      onClick={() => setIsDeleteAlertOpen(true)}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" /> Excluir Conta
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Button 
                onClick={() => base44.auth.redirectToLogin(createPageUrl('Dashboard'))}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm"
              >
                <LogIn className="w-4 h-4 mr-2" /> Entrar
              </Button>
            )}

            {/* Mobile Menu Trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-md lg:hidden">
                  <Menu className="w-6 h-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col h-full pt-6">
                  <div className="flex items-center gap-2 mb-8 px-2">
                    <div className="bg-emerald-500 p-1.5 rounded-lg">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-xl tracking-tight">HealthAI</span>
                  </div>
                  
                  <nav className="flex-1 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                      const isActive = location.pathname === item.path;
                      return (
                        <Link
                          key={item.path}
                          to={createPageUrl(item.path.replace('/', ''))}
                          className={`flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors
                            ${isActive 
                              ? 'bg-emerald-50 text-emerald-700' 
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                        >
                          <item.icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                          {item.label}
                        </Link>
                      );
                    })}
                  </nav>

                  {user && (
                     <div className="border-t border-slate-100 pt-4 mt-4 pb-6 space-y-2">
                        <Link to={createPageUrl('Profile')} className="flex items-center gap-3 px-3 py-3 rounded-lg text-slate-600 hover:bg-slate-50 font-medium">
                          <UserCircle className="w-5 h-5" /> Meu Perfil
                        </Link>
                        <button 
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-3 py-3 w-full rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                        >
                          <LogOut className="w-5 h-5" /> Sair
                        </button>
                     </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Delete Account Alert */}
        <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Isso excluirá permanentemente seu perfil e removerá seus dados de nossos servidores.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700 focus:ring-red-600">
                Sim, excluir minha conta
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[1920px] mx-auto px-4 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}