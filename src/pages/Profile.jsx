import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MapPin, Save, Loader2, Upload, CreditCard, User as UserIcon, Calendar, Mail, Activity, BarChart3, DollarSign, Zap, Layout, MessageSquare, ShoppingBag, TrendingUp, Trash2, Crown } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { createPageUrl } from '@/utils';
import { getPlanLimits } from '@/components/usage/usageLimits';
import { useNavigate } from 'react-router-dom';
import T from '@/components/TranslatedText';
import ImageWithFallback from '@/components/common/ImageWithFallback';

export default function ProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isLogoutAlertOpen, setIsLogoutAlertOpen] = useState(false);
  
  // Form States
  const [personalData, setPersonalData] = useState({
     full_name: '', phone: '', cpf: '', profile_picture: ''
  });
  const [address, setAddress] = useState({
    street: '', number: '', neighborhood: '', city: '', state: '', zip: '', country: ''
  });
  const [medicalData, setMedicalData] = useState({
    blood_type: '', allergies: '', diseases: '', skin_type: ''
  });
  const [professionalData, setProfessionalData] = useState({
     registry: '', specialties: ''
  });
  const [servicesCatalog, setServicesCatalog] = useState([]);
  const [newService, setNewService] = useState({ category: 'consultation', name: '', price: '', is_free: false });
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['userProfileFull'],
    queryFn: async () => {
       const user = await base44.auth.me();
       if (!user) return null;
       const res = await base44.entities.UserProfile.list({ query: { user_email: user.email }});
       const userProfile = res?.data?.[0] || {};
       if (!userProfile.user_email) userProfile.user_email = user.email;
       return userProfile;
    }
  });

  const { data: stats } = useQuery({
    queryKey: ['userStats'],
    queryFn: async () => {
       const user = await base44.auth.me();
       if (!user) return null;

       const [appts, nurse, creations, products] = await Promise.all([
          base44.entities.Appointment.list({ query: { patient_email: user.email }, limit: 1000 }),
          base44.entities.NurseInteraction.list({ query: { user_email: user.email }, limit: 1000 }),
          base44.entities.AICreation.list({ query: { owner_email: user.email }, limit: 1000 }),
          base44.entities.Product.list({ query: { owner_email: user.email }, limit: 1000 })
       ]);

       const productsValue = products.data.reduce((acc, p) => acc + (p.price || 0), 0);
       // Valuation logic: Product Potential (10x price) + Asset Value
       const valuation = (productsValue * 10) + 
                         (creations.data.filter(c => c.type === 'landing_page').length * 500) +
                         (creations.data.filter(c => c.type === 'chatbot').length * 300) +
                         (creations.data.filter(c => c.type === 'design_project').length * 100);

       // Conversion Power Calculation
       const activityScore = appts.data.length + nurse.data.length + creations.data.length + products.data.length;
       let conversionPower = 'Baixo';
       if (activityScore > 20) conversionPower = 'Alto';
       else if (activityScore > 5) conversionPower = 'Médio';

       return {
          appointments: appts.data.length,
          nurse: nurse.data.length,
          chatbots: creations.data.filter(c => c.type === 'chatbot').length,
          sites: creations.data.filter(c => c.type === 'landing_page').length,
          designs: creations.data.filter(c => c.type === 'design_project').length,
          products: products.data.length,
          productsValue,
          valuation,
          conversionPower
       };
    },
    enabled: !!profile
  });

  useEffect(() => {
     if (profile && profile.id) {
        base44.auth.me().then(user => {
            setPersonalData({ 
                full_name: user.full_name || '',
                phone: profile.phone || '', 
                cpf: profile.cpf || '', 
                profile_picture: profile.profile_picture || '' 
            });
        });

        if (profile.address) setAddress(prev => ({ ...prev, ...profile.address }));
        
        if (profile.medical_history) {
            setMedicalData({ 
               blood_type: profile.medical_history.blood_type || '',
               allergies: Array.isArray(profile.medical_history.allergies) ? profile.medical_history.allergies.join(', ') : '',
               diseases: Array.isArray(profile.medical_history.diseases) ? profile.medical_history.diseases.join(', ') : '',
               skin_type: profile.medical_history.skin_type || ''
            });
        }
        
        if (profile.type === 'professional') {
           setProfessionalData({
              registry: profile.professional_registry || '',
              specialties: Array.isArray(profile.specialties) ? profile.specialties.join(', ') : ''
           });
           if (profile.services_catalog) {
              setServicesCatalog(profile.services_catalog);
           }
        }
     }
  }, [profile]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const res = await base44.integrations.Core.UploadFile({ file });
      setPersonalData(prev => ({ ...prev, profile_picture: res.file_url }));
      alert("Imagem enviada! Clique em Salvar para confirmar.");
    } catch (err) {
      console.error(err);
      alert("Erro ao enviar imagem.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAccount = async () => {
     if (!profile) return;
     try {
        await base44.entities.UserProfile.delete(profile.id);
        await base44.auth.logout();
     } catch (error) {
        console.error("Error deleting account", error);
        alert("Erro ao excluir conta. Entre em contato com o suporte.");
     }
  };

  const handleLogout = async () => {
     await base44.auth.logout();
  };

  const handleLocationClick = () => {
    if (!navigator.geolocation) {
      alert("Geolocalização não suportada pelo seu navegador.");
      return;
    }

    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await response.json();
        
        if (data && data.address) {
          setAddress(prev => ({
            ...prev,
            street: data.address.road || prev.street,
            neighborhood: data.address.suburb || data.address.neighbourhood || prev.neighborhood,
            city: data.address.city || data.address.town || data.address.village || prev.city,
            state: data.address.state || prev.state,
            country: data.address.country || prev.country,
            zip: data.address.postcode || prev.zip,
            number: '' 
          }));
        }
      } catch (error) {
        console.error("Erro ao buscar endereço:", error);
      } finally {
        setIsLoadingLocation(false);
      }
    }, (error) => {
      console.error("Erro de geolocalização:", error);
      setIsLoadingLocation(false);
      alert("Não foi possível obter sua localização.");
    });
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!profile?.id) return;
      
      // Update Auth User Name
      if (personalData.full_name) {
         await base44.auth.updateMe({ full_name: personalData.full_name });
      }

      const updateData = {
         phone: personalData.phone,
         cpf: personalData.cpf,
         profile_picture: personalData.profile_picture,
         address: address,
      };

      if (profile.type === 'patient') {
         updateData.medical_history = {
            blood_type: medicalData.blood_type,
            skin_type: medicalData.skin_type,
            allergies: medicalData.allergies.split(',').map(s => s.trim()).filter(Boolean),
            diseases: medicalData.diseases.split(',').map(s => s.trim()).filter(Boolean)
         };
      }

      if (profile.type === 'professional') {
         updateData.professional_registry = professionalData.registry;
         updateData.specialties = professionalData.specialties.split(',').map(s => s.trim()).filter(Boolean);
         updateData.services_catalog = servicesCatalog;
      }

      await base44.entities.UserProfile.update(profile.id, updateData);
    },
    onSuccess: () => {
       queryClient.invalidateQueries(['userProfileFull']);
       queryClient.invalidateQueries(['currentUserProfile']); // Update layout avatar
       alert("Perfil atualizado com sucesso!");
    },
    onError: () => alert("Erro ao salvar perfil.")
  });

  if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-purple-500" /></div>;

  // Clube da Beleza Theme Classes
  const cardClass = "bg-[#FEFBF7] border border-[#D4A574]/20 text-[#2D2416] hover:shadow-xl transition-all hover:-translate-y-1 duration-300 shadow-[0_2px_8px_rgba(212,165,116,0.04)] rounded-[1.5rem]";
  const inputClass = "w-full bg-[#FFF9F0] border border-[#D4A574]/30 text-[#2D2416] focus:ring-2 focus:ring-[#D4A574]/20 focus:border-[#D4A574] h-14 rounded-xl placeholder:text-[#B8935C]/50 transition-all hover:bg-white hover:border-[#D4A574]/40";
  const labelClass = "text-[#6B5D4F] text-sm font-bold mb-2 block";

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
        <div className="flex justify-between items-center">
          <div>
            <T as="h1" className="text-3xl font-light text-[#2D2416] tracking-tight">Meu Perfil</T>
            <T as="p" className="text-[#6B5D4F] font-light">Gerencie suas informações e preferências.</T>
          </div>
          <Button variant="outline" onClick={() => navigate(createPageUrl('MyPlan'))} className="border-[#D4A574]/30 bg-[#FEFBF7] text-[#6B5D4F] hover:bg-[#FFF9F0] hover:text-[#D4A574] shadow-sm rounded-xl font-light">
             <CreditCard className="w-4 h-4 mr-2 text-[#D4A574]" /> <T>Ver Meu Plano</T>
          </Button>
        </div>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="w-full bg-[#FEFBF7] border border-[#D4A574]/20 p-1.5 rounded-2xl">
            <TabsTrigger value="personal" className="rounded-xl data-[state=active]:bg-[#D4A574] data-[state=active]:text-white data-[state=active]:shadow-sm text-[#6B5D4F] font-light transition-all py-3">
              {profile?.type === 'professional' ? 'Profissional & Pessoal' : 'Dados Pessoais'}
            </TabsTrigger>
            <TabsTrigger value="stats" className="rounded-xl data-[state=active]:bg-[#D4A574] data-[state=active]:text-white data-[state=active]:shadow-sm text-[#6B5D4F] font-light transition-all py-3">Minhas Estatísticas</TabsTrigger>
            {profile?.type === 'patient' && <TabsTrigger value="medical" className="rounded-xl data-[state=active]:bg-[#D4A574] data-[state=active]:text-white data-[state=active]:shadow-sm text-[#6B5D4F] font-light transition-all py-3">Ficha Médica</TabsTrigger>}
            {profile?.type === 'professional' && <TabsTrigger value="professional" className="rounded-xl data-[state=active]:bg-[#D4A574] data-[state=active]:text-white data-[state=active]:shadow-sm text-[#6B5D4F] font-light transition-all py-3">Profissional</TabsTrigger>}
          </TabsList>

          {/* Profile Header Card */}
          <Card className="mb-8 mt-8 border-0 bg-gradient-to-br from-[#D4A574] to-[#C9A868] shadow-2xl shadow-[#D4A574]/30 text-white rounded-[2rem] overflow-hidden relative">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <CardContent className="flex flex-col md:flex-row items-center gap-8 p-10 relative z-10">
              <div className="relative group">
                 <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 shadow-xl overflow-hidden flex items-center justify-center">
                    {personalData.profile_picture ? (
                       <ImageWithFallback src={personalData.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                       <UserIcon className="w-14 h-14 text-white" />
                    )}
                 </div>
                 <label className="absolute bottom-1 right-1 bg-white text-[#D4A574] p-3 rounded-full cursor-pointer hover:bg-[#FFF9F0] shadow-lg transition-all hover:scale-110 hover:rotate-3">
                    <Upload className="w-5 h-5" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                 </label>
              </div>

              <div className="flex-1 text-center md:text-left space-y-3">
                <h2 className="text-3xl font-black text-white tracking-tight">{personalData.full_name || profile?.user_email}</h2>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                   <span className="bg-white/20 px-4 py-1.5 rounded-full text-sm font-bold backdrop-blur-md flex items-center gap-2 shadow-inner border border-white/10">
                      <div className="w-2.5 h-2.5 bg-[#34D399] rounded-full animate-pulse shadow-[0_0_8px_#34D399]"></div>
                      {profile?.type === 'professional' ? 'Profissional Certificado' : profile?.type === 'sponsor' ? 'Patrocinador' : 'Paciente Premium'}
                   </span>
                   <span className="bg-white/20 px-4 py-1.5 rounded-full text-sm font-bold backdrop-blur-md shadow-inner border border-white/10">Plano: {profile?.plan || 'Free'}</span>
                </div>
              </div>


            </CardContent>
          </Card>

        <TabsContent value="stats">
          <Card className="col-span-full bg-gradient-to-r from-[#D4A574] to-[#C9A868] text-white border-0 shadow-2xl shadow-[#D4A574]/30 rounded-[2rem] overflow-hidden relative mb-6">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <CardContent className="p-8 relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Crown className="w-8 h-8 text-yellow-300" />
                    <h3 className="text-2xl font-black">Plano Atual</h3>
                  </div>
                  <p className="text-white/80 text-lg capitalize font-bold">{profile?.plan || 'Free'}</p>
                </div>
                <Button 
                  onClick={() => navigate(createPageUrl('Plans'))}
                  variant="outline"
                  className="bg-white/20 border-white/40 text-white hover:bg-white/30 hover:text-white backdrop-blur-md rounded-xl font-light h-12 px-6"
                >
                  Ver Planos
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                  <p className="text-white/70 text-xs mb-1">Conversas Enfermeira</p>
                  <p className="text-2xl font-bold">{profile?.monthly_usage?.nurse_conversations || 0} / {getPlanLimits(profile?.plan).nurse_conversations_monthly === -1 ? '∞' : getPlanLimits(profile?.plan).nurse_conversations_monthly}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                  <p className="text-white/70 text-xs mb-1">Chatbots</p>
                  <p className="text-2xl font-bold">{profile?.monthly_usage?.chatbots_created || 0} / {getPlanLimits(profile?.plan).chatbots === -1 ? '∞' : getPlanLimits(profile?.plan).chatbots}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                  <p className="text-white/70 text-xs mb-1">Sites</p>
                  <p className="text-2xl font-bold">{profile?.monthly_usage?.sites_created || 0} / {getPlanLimits(profile?.plan).sites === -1 ? '∞' : getPlanLimits(profile?.plan).sites}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                  <p className="text-white/70 text-xs mb-1">Designs</p>
                  <p className="text-2xl font-bold">{profile?.monthly_usage?.designs_created || 0} / {getPlanLimits(profile?.plan).designs === -1 ? '∞' : getPlanLimits(profile?.plan).designs}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
             {/* Valuation & Conversion */}
             <Card className="col-span-1 md:col-span-2 bg-gradient-to-r from-[#B8935C] to-[#D4A574] text-white border-0 shadow-lg">
                <CardHeader className="pb-2">
                   <CardTitle className="text-white/80 text-sm font-light flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Valuation das Criações
                   </CardTitle>
                </CardHeader>
                <CardContent>
                   <div className="text-4xl font-light">R$ {stats?.valuation?.toLocaleString('pt-BR') || '0,00'}</div>
                   <div className="mt-4 flex items-center gap-4">
                      <div className="bg-white/20 px-3 py-1 rounded-lg text-sm font-light backdrop-blur-sm">
                         Poder de Conversão: <span className="text-[#E8E05C] font-light">{stats?.conversionPower || 'N/A'}</span>
                      </div>
                   </div>
                </CardContent>
             </Card>

             <Card className={cardClass}>
                <CardHeader className="pb-2"><CardTitle className="text-[#6B5D4F] text-xs font-light uppercase tracking-wider">Valor em Produtos</CardTitle></CardHeader>
                <CardContent>
                   <div className="text-2xl font-light text-[#C9A868]">R$ {stats?.productsValue?.toLocaleString('pt-BR') || '0,00'}</div>
                </CardContent>
             </Card>
             <Card className={cardClass}>
                <CardHeader className="pb-2"><CardTitle className="text-[#6B5D4F] text-xs font-light uppercase tracking-wider">Total Produtos</CardTitle></CardHeader>
                <CardContent>
                   <div className="text-2xl font-light text-[#2D2416]">{stats?.products || 0}</div>
                </CardContent>
             </Card>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div className="bg-[#FEFBF7] p-4 rounded-2xl border border-[#D4A574]/20 shadow-sm hover:shadow-md transition-all">
                <div className="bg-[#FFF9F0] w-10 h-10 rounded-xl flex items-center justify-center mb-3">
                   <Calendar className="w-5 h-5 text-[#D4A574]" />
                </div>
                <div className="text-2xl font-light text-[#2D2416]">{stats?.appointments || 0}</div>
                <div className="text-xs text-[#6B5D4F] font-light">Agendamentos</div>
             </div>
             <div className="bg-[#FEFBF7] p-4 rounded-2xl border border-[#D4A574]/20 shadow-sm hover:shadow-md transition-all">
                <div className="bg-[#FFF9F0] w-10 h-10 rounded-xl flex items-center justify-center mb-3">
                   <Activity className="w-5 h-5 text-[#B8935C]" />
                </div>
                <div className="text-2xl font-light text-[#2D2416]">{stats?.nurse || 0}</div>
                <div className="text-xs text-[#6B5D4F] font-light">Uso Enfermeira</div>
             </div>
             <div className="bg-[#FEFBF7] p-4 rounded-2xl border border-[#D4A574]/20 shadow-sm hover:shadow-md transition-all">
                <div className="bg-[#FFF9F0] w-10 h-10 rounded-xl flex items-center justify-center mb-3">
                   <MessageSquare className="w-5 h-5 text-[#C9A868]" />
                </div>
                <div className="text-2xl font-light text-[#2D2416]">{stats?.chatbots || 0}</div>
                <div className="text-xs text-[#6B5D4F] font-light">Chatbots Ativos</div>
             </div>
             <div className="bg-[#FEFBF7] p-4 rounded-2xl border border-[#D4A574]/20 shadow-sm hover:shadow-md transition-all">
                <div className="bg-[#FFF9F0] w-10 h-10 rounded-xl flex items-center justify-center mb-3">
                   <Layout className="w-5 h-5 text-[#D4A574]" />
                </div>
                <div className="text-2xl font-light text-[#2D2416]">{stats?.sites || 0}</div>
                <div className="text-xs text-[#6B5D4F] font-light">Sites Criados</div>
             </div>
          </div>
        </TabsContent>

        <TabsContent value="personal" className="space-y-6">
          {/* Professional Services Section - FIRST for professionals */}
          {profile?.type === 'professional' && (
            <Card className={cardClass}>
              <CardHeader className="border-b border-[#D4A574]/20 pb-6 pt-6 px-8">
                <CardTitle className="text-[#2D2416] flex items-center gap-4 text-xl">
                   <div className="bg-[#FFF9F0] p-3 rounded-2xl"><DollarSign className="w-6 h-6 text-[#D4A574]" /></div>
                   <T>Informações Profissionais</T>
                </CardTitle>
                <T as="p" className="text-sm text-[#6B5D4F] mt-2 font-light">Configure seu registro profissional e catálogo completo de serviços</T>
              </CardHeader>
              <CardContent className="space-y-8 pt-8 px-8 pb-8">
                <div className="space-y-2">
                  <Label className={labelClass}>CRM / COREN / Registro Profissional</Label>
                  <Input className={inputClass} value={professionalData.registry} onChange={e => setProfessionalData({...professionalData, registry: e.target.value})} placeholder="00000/UF" />
                </div>
                
                <div className="space-y-2">
                  <Label className={labelClass}>Especialidades</Label>
                  <Input className={inputClass} value={professionalData.specialties} onChange={e => setProfessionalData({...professionalData, specialties: e.target.value})} placeholder="Ex: Dermatologia, Cirurgia Plástica (separe por vírgula)" />
                </div>

                <div className="border-t border-[#D4A574]/20 pt-6 mt-6">
                  <h3 className="font-bold text-[#2D2416] mb-6 flex items-center gap-2 text-lg">
                     <DollarSign className="w-5 h-5 text-[#D4A574]" /> Catálogo de Serviços & Preços
                  </h3>
                  <p className="text-sm text-[#6B5D4F] mb-6">Configure todos os serviços que você oferece, incluindo consultas, exames e procedimentos estéticos.</p>

                  <div className="bg-[#FFF9F0] p-6 rounded-2xl border border-[#D4A574]/20 mb-6">
                     <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-4">
                        <div className="space-y-2 md:col-span-1">
                           <Label className={labelClass}>Categoria *</Label>
                           <select 
                              className={inputClass + " px-4"}
                              value={newService.category}
                              onChange={e => setNewService({...newService, category: e.target.value})}
                           >
                              <option value="consultation">Consulta</option>
                              <option value="exam">Exame</option>
                              <option value="procedure">Procedimento</option>
                           </select>
                        </div>
                        <div className="space-y-2 md:col-span-2 relative">
                           <Label className={labelClass}>Nome do Serviço *</Label>
                           <div className="relative">
                              <Input 
                                 className={inputClass} 
                                 value={newService.name} 
                                 onChange={async (e) => {
                                    const val = e.target.value;
                                    setNewService({...newService, name: val});
                                    if (val.length > 2) {
                                       setIsAiLoading(true);
                                       try {
                                          const categoryMap = {
                                             consultation: 'consultas (presencial, online, teleconsulta)',
                                             exam: 'exames estéticos (dermoscopia, bioimpedância, análise facial)',
                                             procedure: 'procedimentos estéticos (botox, preenchimento, peeling, laser)'
                                          };
                                          const suggestions = await base44.integrations.Core.InvokeLLM({
                                             prompt: `Liste 5 tipos comuns de ${categoryMap[newService.category]} na medicina estética que contenham ou sejam similares a "${val}". Retorne apenas os nomes em um array JSON.`,
                                             response_json_schema: { type: "object", properties: { items: { type: "array", items: { type: "string" } } } }
                                          });
                                          setAiSuggestions(suggestions.items || []);
                                       } catch(e) { 
                                          console.error(e);
                                       } finally { 
                                          setIsAiLoading(false); 
                                       }
                                    } else {
                                       setAiSuggestions([]);
                                    }
                                 }}
                                 placeholder="Digite e veja sugestões..." 
                              />
                              {isAiLoading && <Loader2 className="w-4 h-4 animate-spin absolute right-4 top-5 text-[#B8935C]" />}
                              {aiSuggestions.length > 0 && (
                                 <div className="absolute top-full left-0 right-0 bg-white border border-[#D4A574]/30 shadow-lg rounded-xl mt-1 z-50 max-h-48 overflow-y-auto">
                                    {aiSuggestions.map((s, i) => (
                                       <div 
                                          key={i} 
                                          className="p-3 hover:bg-[#FFF9F0] cursor-pointer text-sm text-[#2D2416] border-b last:border-0"
                                          onClick={() => {
                                             setNewService({...newService, name: s});
                                             setAiSuggestions([]);
                                          }}
                                       >
                                          {s}
                                       </div>
                                    ))}
                                 </div>
                              )}
                           </div>
                        </div>
                        <div className="space-y-2 md:col-span-1">
                           <Label className={labelClass}>Preço (R$)</Label>
                           <Input 
                              type="number" 
                              step="0.01"
                              className={inputClass} 
                              value={newService.price} 
                              onChange={e => setNewService({...newService, price: e.target.value})} 
                              placeholder="0.00"
                              disabled={newService.is_free}
                           />
                        </div>
                     </div>
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <input 
                              type="checkbox" 
                              id="is_free_main" 
                              checked={newService.is_free} 
                              onChange={e => setNewService({...newService, is_free: e.target.checked, price: e.target.checked ? '0' : newService.price})} 
                              className="w-5 h-5 text-[#D4A574] rounded border-[#D4A574]/30 focus:ring-[#D4A574]"
                           />
                           <label htmlFor="is_free_main" className="text-sm font-light text-[#6B5D4F] cursor-pointer">Gratuito / Presente</label>
                        </div>
                        <Button 
                           onClick={() => {
                              if (!newService.name) return alert("Digite o nome do serviço");
                              setServicesCatalog([...servicesCatalog, { ...newService, price: parseFloat(newService.price) || 0 }]);
                              setNewService({ category: 'consultation', name: '', price: '', is_free: false });
                              setAiSuggestions([]);
                           }}
                           className="bg-[#D4A574] hover:bg-[#C49565] text-white font-light rounded-xl h-12 px-6"
                        >
                           + Adicionar Serviço
                        </Button>
                     </div>
                  </div>

                  {/* Revenue Summary */}
                  {servicesCatalog.length > 0 && (
                     <div className="bg-gradient-to-r from-[#FFF9F0] to-[#FFF5E6] p-6 rounded-2xl border border-[#D4A574]/30 mb-6">
                        <div className="flex items-center justify-between">
                           <div>
                              <p className="text-sm text-[#B8935C] font-bold uppercase tracking-wide mb-1">Receita Estimada (Mensal)</p>
                              <p className="text-3xl font-light text-[#2D2416]">
                                 R$ {servicesCatalog.reduce((acc, s) => acc + (s.price || 0), 0).toFixed(2)}
                              </p>
                              <p className="text-xs text-[#6B5D4F] mt-1">Baseado em {servicesCatalog.length} serviço(s) cadastrado(s)</p>
                           </div>
                           <DollarSign className="w-12 h-12 text-[#D4A574]" />
                        </div>
                     </div>
                  )}

                  {/* Services List */}
                  <div className="space-y-3">
                     {servicesCatalog.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-[#D4A574]/30">
                           <Activity className="w-12 h-12 text-[#D4A574]/30 mx-auto mb-3" />
                           <p className="text-[#6B5D4F] font-light">Nenhum serviço cadastrado ainda.</p>
                           <p className="text-xs text-[#B8935C] mt-1">Adicione seus serviços para calcular a receita estimada.</p>
                        </div>
                     )}
                     {servicesCatalog.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-white border border-[#D4A574]/20 rounded-xl shadow-sm hover:shadow-md transition-all">
                           <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-lg ${item.category === 'consultation' ? 'bg-[#FFF9F0] text-[#D4A574]' : item.category === 'exam' ? 'bg-[#FFF9F0] text-[#B8935C]' : 'bg-[#FFF9F0] text-[#C9A868]'}`}>
                                 {item.category === 'consultation' ? <UserIcon className="w-5 h-5" /> : item.category === 'exam' ? <Activity className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                              </div>
                              <div>
                                 <p className="font-light text-[#2D2416] text-base">{item.name}</p>
                                 <p className="text-xs text-[#6B5D4F] capitalize font-light">
                                    {item.category === 'consultation' ? 'Consulta' : item.category === 'exam' ? 'Exame' : 'Procedimento'}
                                 </p>
                              </div>
                           </div>
                           <div className="flex items-center gap-4">
                              <span className={`font-light text-lg ${item.is_free ? 'text-[#C9A868]' : 'text-[#2D2416]'}`}>
                                 {item.is_free ? 'Grátis' : `R$ ${item.price?.toFixed(2)}`}
                              </span>
                              <Button 
                                 size="icon" 
                                 variant="ghost" 
                                 className="text-red-400 hover:text-red-600 hover:bg-red-50"
                                 onClick={() => {
                                    const newCat = [...servicesCatalog];
                                    newCat.splice(idx, 1);
                                    setServicesCatalog(newCat);
                                 }}
                              >
                                 <Trash2 className="w-4 h-4" />
                              </Button>
                           </div>
                        </div>
                     ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className={cardClass}>
            <CardHeader className="border-b border-[#D4A574]/20 pb-6 pt-6 px-8">
              <CardTitle className="text-[#2D2416] flex items-center gap-4 text-xl">
                 <div className="bg-[#FFF9F0] p-3 rounded-2xl"><UserIcon className="w-6 h-6 text-[#D4A574]" /></div>
                 Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 pt-8 px-8 pb-8">
              <div className="space-y-2">
                 <Label className={labelClass}>Nome Completo</Label>
                 <Input className={inputClass} value={personalData.full_name} onChange={e => setPersonalData({...personalData, full_name: e.target.value})} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <Label className={labelClass}>Email</Label>
                    <Input value={profile?.user_email || ''} disabled className={`${inputClass} bg-[#F1F5F9] text-[#94A3B8] cursor-not-allowed border-slate-100`} />
                 </div>
                 <div className="space-y-2">
                    <Label className={labelClass}>Senha</Label>
                    <Input type="password" value="********" disabled className={`${inputClass} bg-[#F1F5F9] text-[#94A3B8] cursor-not-allowed border-slate-100`} />
                    <p className="text-xs text-[#94A3B8] font-medium">A senha pode ser alterada na tela de login.</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label className={labelClass}>CPF</Label>
                    <Input className={inputClass} value={personalData.cpf} onChange={e => setPersonalData({...personalData, cpf: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <Label className={labelClass}>Telefone</Label>
                    <Input className={inputClass} value={personalData.phone} onChange={e => setPersonalData({...personalData, phone: e.target.value})} />
                 </div>
              </div>

              <div className="border-t border-[#D4A574]/20 pt-8 mt-2">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold flex items-center gap-3 text-[#2D2416] text-lg">
                       <div className="bg-[#FFF9F0] p-3 rounded-2xl"><MapPin className="w-5 h-5 text-[#D4A574]" /></div> 
                       Endereço
                    </h3>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={handleLocationClick}
                      disabled={isLoadingLocation}
                      className="text-xs h-10 px-4 bg-white text-[#D4A574] border-[#D4A574]/30 hover:bg-[#FFF9F0] font-light rounded-lg"
                    >
                      {isLoadingLocation ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <MapPin className="w-4 h-4 mr-2" />}
                      Usar minha localização
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-4 mb-4">
                     <div className="space-y-2">
                        <Label className={labelClass}>CEP</Label>
                        <Input className={inputClass} value={address.zip} onChange={e => setAddress({...address, zip: e.target.value})} />
                     </div>
                     <div className="space-y-2">
                        <Label className={labelClass}>Rua</Label>
                        <Input className={inputClass} value={address.street} onChange={e => setAddress({...address, street: e.target.value})} />
                     </div>
                     <div className="space-y-2">
                        <Label className={labelClass}>Número</Label>
                        <Input className={inputClass} value={address.number} onChange={e => setAddress({...address, number: e.target.value})} />
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label className={labelClass}>Bairro</Label>
                        <Input className={inputClass} value={address.neighborhood} onChange={e => setAddress({...address, neighborhood: e.target.value})} />
                     </div>
                     <div className="space-y-2">
                        <Label className={labelClass}>Cidade</Label>
                        <Input className={inputClass} value={address.city} onChange={e => setAddress({...address, city: e.target.value})} />
                     </div>
                     <div className="space-y-2">
                        <Label className={labelClass}>Estado</Label>
                        <Input className={inputClass} value={address.state} onChange={e => setAddress({...address, state: e.target.value})} />
                     </div>
                     <div className="space-y-2">
                        <Label className={labelClass}>País</Label>
                        <Input className={inputClass} value={address.country} onChange={e => setAddress({...address, country: e.target.value})} />
                     </div>
                  </div>
              </div>

              <Button onClick={() => saveMutation.mutate()} className="w-full bg-[#D4A574] hover:bg-[#C49565] text-white h-14 font-light shadow-lg shadow-[#D4A574]/20 hover:shadow-[#D4A574]/30 transition-all rounded-xl text-lg mt-4" disabled={saveMutation.isPending}>
                 {saveMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                 Salvar Alterações
              </Button>
              </CardContent>
              </Card>

              {/* Action Buttons Outside Card */}
              <div className="flex flex-col gap-3 mt-6">
                <Button 
                  variant="outline" 
                  className="w-full border-[#D4A574]/30 text-[#6B5D4F] hover:bg-[#FFF9F0] hover:text-[#D4A574] h-12 rounded-xl font-light"
                  onClick={() => {
                    const type = profile?.type === 'patient' ? 'Profissional' : 'Paciente';
                    if (confirm(`Deseja solicitar a alteração da sua conta para ${type}?`)) {
                       base44.integrations.Core.SendEmail({
                         to: "pedro_hbfreitas@hotmail.com",
                         subject: `Solicitação de Mudança de Tipo de Conta - ${profile?.user_email}`,
                         body: `O usuário ${profile?.user_email} solicitou a mudança de sua conta de ${profile?.type} para ${type.toLowerCase()}.`
                       });
                       alert("Solicitação enviada com sucesso! Aguarde o contato da administração.");
                    }
                  }}
                >
                  Mudar Tipo de Conta
                </Button>
                <Button 
                  variant="outline"
                  className="w-full border-[#D4A574]/30 text-[#6B5D4F] hover:bg-[#FFF9F0] hover:text-[#D4A574] h-12 rounded-xl font-light"
                  onClick={() => setIsLogoutAlertOpen(true)}
                >
                   Sair da Conta
                </Button>
                <Button 
                  variant="outline"
                  className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 h-12 rounded-xl font-light"
                  onClick={() => setIsDeleteAlertOpen(true)}
                >
                   Excluir Conta
                </Button>
              </div>
              </TabsContent>

        <TabsContent value="medical">
          <Card className={cardClass}>
            <CardHeader className="border-b border-[#D4A574]/20 pb-6 pt-6 px-8">
              <CardTitle className="text-[#2D2416] flex items-center gap-4 text-xl">
                 <div className="bg-[#FFF9F0] p-3 rounded-2xl"><Activity className="w-6 h-6 text-[#D4A574]" /></div>
                 Ficha Médica Digital
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className={labelClass}>Tipo Sanguíneo</Label>
                  <Input className={inputClass} value={medicalData.blood_type} onChange={e => setMedicalData({...medicalData, blood_type: e.target.value})} placeholder="Ex: O+" />
                </div>
                <div className="space-y-2">
                  <Label className={labelClass}>Tipo de Pele</Label>
                  <Input className={inputClass} value={medicalData.skin_type} onChange={e => setMedicalData({...medicalData, skin_type: e.target.value})} placeholder="Ex: Oleosa, Seca..." />
                </div>
              </div>
              <div className="space-y-2">
                <Label className={labelClass}>Alergias</Label>
                <Input className={inputClass} value={medicalData.allergies} onChange={e => setMedicalData({...medicalData, allergies: e.target.value})} placeholder="Separe por vírgula" />
              </div>
              <div className="space-y-2">
                <Label className={labelClass}>Doenças Crônicas / Histórico</Label>
                <Input className={inputClass} value={medicalData.diseases} onChange={e => setMedicalData({...medicalData, diseases: e.target.value})} placeholder="Separe por vírgula" />
              </div>
              <Button onClick={() => saveMutation.mutate()} className="w-full bg-[#D4A574] hover:bg-[#C49565] text-white h-14 font-light shadow-lg shadow-[#D4A574]/20 hover:shadow-[#D4A574]/30 transition-all rounded-xl text-lg" disabled={saveMutation.isPending}>
                 {saveMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                 Salvar Alterações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

         <TabsContent value="professional">
          <Card className={cardClass}>
            <CardHeader className="border-b border-[#D4A574]/20 pb-6 pt-6 px-8">
              <CardTitle className="text-[#2D2416] flex items-center gap-4 text-xl">
                 <div className="bg-[#FFF9F0] p-3 rounded-2xl"><Activity className="w-6 h-6 text-[#D4A574]" /></div>
                 Credenciais & Integrações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-8 px-8 pb-8">
              <div className="space-y-2">
                <Label className={labelClass}>CRM / COREN / Registro</Label>
                <Input className={inputClass} value={professionalData.registry} onChange={e => setProfessionalData({...professionalData, registry: e.target.value})} placeholder="00000/UF" />
              </div>
              <div className="space-y-2">
                <Label className={labelClass}>Especialidades</Label>
                <Input className={inputClass} value={professionalData.specialties} onChange={e => setProfessionalData({...professionalData, specialties: e.target.value})} placeholder="Ex: Dermatologia, Cirurgia Plástica" />
              </div>

              <div className="mt-8 pt-6 border-t border-[#D4A574]/20">
                 <h3 className="font-bold text-[#2D2416] mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#D4A574]" /> Integrações de Agenda
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-[#D4A574]/20 rounded-xl p-4 flex items-center justify-between bg-[#FFF9F0]">
                       <div className="flex items-center gap-3">
                          <div className="bg-white p-2 rounded-lg shadow-sm">
                             <Calendar className="w-5 h-5 text-[#D4A574]" />
                          </div>
                          <div>
                             <div className="font-light text-[#2D2416]">Google Agenda</div>
                             <div className="text-xs text-[#6B5D4F]">Sincronizar eventos</div>
                          </div>
                       </div>
                       <Button variant="outline" size="sm" className="border-[#D4A574]/30 text-[#D4A574] hover:bg-white font-light" onClick={() => alert("Google Agenda conectado!")}>Conectar</Button>
                    </div>
                    <div className="border border-[#D4A574]/20 rounded-xl p-4 flex items-center justify-between bg-[#FFF9F0]">
                       <div className="flex items-center gap-3">
                          <div className="bg-white p-2 rounded-lg shadow-sm">
                             <Mail className="w-5 h-5 text-[#B8935C]" />
                          </div>
                          <div>
                             <div className="font-light text-[#2D2416]">Outlook Calendar</div>
                             <div className="text-xs text-[#6B5D4F]">Sincronizar eventos</div>
                          </div>
                       </div>
                       <Button variant="outline" size="sm" className="border-[#D4A574]/30 text-[#D4A574] hover:bg-white font-light" onClick={() => alert("Outlook conectado!")}>Conectar</Button>
                    </div>
                 </div>
              </div>

               <Button onClick={() => saveMutation.mutate()} className="w-full bg-[#D4A574] hover:bg-[#C49565] text-white h-14 font-light shadow-lg shadow-[#D4A574]/20 hover:shadow-[#D4A574]/30 transition-all rounded-xl text-lg mt-8" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                  Salvar Alterações
               </Button>
               </CardContent>
               </Card>
               </TabsContent>
      </Tabs>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent className="bg-[#FEFBF7] border-[#D4A574]/30 text-[#2D2416]">
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription className="text-[#6B5D4F]">
              Esta ação não pode ser desfeita. Isso excluirá permanentemente seu perfil e removerá seus dados de nossos servidores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white border-[#D4A574]/30 text-[#6B5D4F] hover:bg-[#FFF9F0]">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700 text-white border-0">
              Sim, excluir minha conta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isLogoutAlertOpen} onOpenChange={setIsLogoutAlertOpen}>
        <AlertDialogContent className="bg-[#FEFBF7] border-[#D4A574]/30 text-[#2D2416]">
          <AlertDialogHeader>
            <AlertDialogTitle>Deseja sair?</AlertDialogTitle>
            <AlertDialogDescription className="text-[#6B5D4F]">
              Você precisará fazer login novamente para acessar sua conta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white border-[#D4A574]/30 text-[#6B5D4F] hover:bg-[#FFF9F0]">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-[#D4A574] hover:bg-[#C49565] text-white border-0">
              Sair
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}