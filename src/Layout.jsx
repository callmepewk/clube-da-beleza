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
  CreditCard
} from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

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
      return res.data[0] || null;
    },
    enabled: !!user
  });

  // Redirect logic removed to allow optional browsing

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  // Define menus based on role
  const getNavItems = () => {
    const common = [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
      { icon: UserCircle, label: 'Meu Perfil', path: '/profile' },
      { icon: CreditCard, label: 'Planos', path: '/plans' },
    ];

    if (!profile) return []; // Empty menu if loading or onboarding

    if (profile.type === 'patient') {
      return [
        ...common,
        { icon: Stethoscope, label: 'Enfermeira Virtual', path: '/nurse' },
        { icon: Calendar, label: 'Meus Agendamentos', path: '/schedule' },
      ];
    }

    // Professional
    return [
      ...common,
      { icon: Calendar, label: 'Gestão de Agenda', path: '/schedule' },
      { icon: Stethoscope, label: 'Enfermeira Virtual', path: '/nurse' }, // Pros might want to see it or test it
      { icon: Globe, label: 'Criador de Sites', path: '/sites' },
      { icon: Bot, label: 'Meus Chatbots', path: '/chatbots' },
      { icon: Palette, label: 'Estúdio Design', path: '/design' },
      { icon: ShoppingBag, label: 'Produtos', path: '/products' },
    ];
  };

  const navItems = getNavItems();

  // If on onboarding page, show a simplified layout
  if (location.pathname === '/onboarding') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8">
           <div className="flex items-center gap-2 text-emerald-600">
              <Activity className="w-6 h-6" />
              <span className="font-bold text-xl tracking-tight">HealthAI</span>
           </div>
        </header>
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20 xl:w-64'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="bg-emerald-500 p-1.5 rounded-lg shrink-0">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className={`font-bold text-lg tracking-tight lg:hidden xl:block whitespace-nowrap`}>
                HealthAI
              </span>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={createPageUrl(item.path.replace('/', ''))}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative
                    ${isActive 
                      ? 'bg-emerald-50 text-emerald-600 font-medium' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  title={item.label}
                >
                  <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  <span className={`lg:hidden xl:block whitespace-nowrap`}>{item.label}</span>
                  
                  <div className="hidden lg:block xl:hidden absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-100">
            <div className="mb-4 px-2 lg:hidden xl:block">
               <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Perfil</div>
               <div className="text-sm font-semibold capitalize">{profile?.type === 'professional' ? 'Profissional' : 'Paciente'}</div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              <span className="lg:hidden xl:block">Sair</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Registration Banner for Guest Users */}
        {user && !isLoading && !profile && location.pathname !== '/onboarding' && (
          <div className="bg-indigo-600 text-white px-4 py-2 text-sm flex items-center justify-between shadow-md relative z-10">
            <div className="flex items-center gap-2">
              <span className="bg-white/20 p-1 rounded"><UserCircle className="w-4 h-4" /></span>
              <span className="font-medium">Complete seu perfil para desbloquear todas as funcionalidades.</span>
            </div>
            <Link 
              to={createPageUrl('Onboarding')}
              className="bg-white text-indigo-600 px-3 py-1 rounded text-xs font-bold hover:bg-indigo-50 transition-colors"
            >
              Cadastrar Agora
            </Link>
          </div>
        )}

        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 -ml-2 text-slate-500 hover:text-slate-700 lg:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1" /> 
          <div className="flex items-center gap-4">
             {user && (
               <div className="flex items-center gap-3">
                 <div className="text-right hidden md:block">
                   <p className="text-sm font-medium text-slate-900">{user.full_name}</p>
                   <p className="text-xs text-slate-500">{user.email}</p>
                 </div>
                 <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-medium border border-emerald-200">
                   {user.full_name?.[0]?.toUpperCase() || 'U'}
                 </div>
               </div>
             )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}