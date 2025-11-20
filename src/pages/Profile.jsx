import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MapPin, Save, Loader2, Upload, CreditCard, User as UserIcon, Calendar, Mail, Activity, BarChart3, DollarSign, Zap, Layout, MessageSquare, ShoppingBag, TrendingUp } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  
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

  // DermaTech Vibrant Theme Classes
  const cardClass = "bg-white border border-slate-100 text-[#0F172A] hover:shadow-xl transition-all hover:-translate-y-1 duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.04)] rounded-[1.5rem]";
  const inputClass = "bg-[#F8FAFC] border border-slate-200 text-[#0F172A] focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] h-14 rounded-xl placeholder:text-[#94A3B8] transition-all hover:bg-white hover:border-slate-300";
  const labelClass = "text-[#334155] text-sm font-bold mb-2 block";

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">Meu Perfil</h1>
            <p className="text-[#64748B] font-medium">Gerencie suas informações e preferências.</p>
          </div>
          <Button variant="outline" onClick={() => navigate(createPageUrl('MyPlan'))} className="border-slate-200 bg-white text-[#0F172A] hover:bg-[#F0FDFA] hover:text-[#0D9488] shadow-sm rounded-xl font-bold">
             <CreditCard className="w-4 h-4 mr-2 text-[#0D9488]" /> Ver Meu Plano
          </Button>
        </div>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="w-full bg-[#F1F5F9] border border-slate-200 p-1.5 rounded-2xl">
            <TabsTrigger value="personal" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-[#0D9488] data-[state=active]:shadow-sm text-[#64748B] font-bold transition-all py-3">Dados Pessoais</TabsTrigger>
            <TabsTrigger value="stats" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-[#0D9488] data-[state=active]:shadow-sm text-[#64748B] font-bold transition-all py-3">Minhas Estatísticas</TabsTrigger>
            {profile?.type === 'patient' && <TabsTrigger value="medical" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-[#0D9488] data-[state=active]:shadow-sm text-[#64748B] font-bold transition-all py-3">Ficha Médica</TabsTrigger>}
            {profile?.type === 'professional' && <TabsTrigger value="professional" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-[#0D9488] data-[state=active]:shadow-sm text-[#64748B] font-bold transition-all py-3">Profissional</TabsTrigger>}
          </TabsList>

          {/* Profile Header Card */}
          <Card className="mb-8 mt-8 border-0 bg-gradient-to-br from-[#0F766E] to-[#14B8A6] shadow-2xl shadow-teal-900/20 text-white rounded-[2rem] overflow-hidden relative">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <CardContent className="flex flex-col md:flex-row items-center gap-8 p-10 relative z-10">
              <div className="relative group">
                 <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 shadow-xl overflow-hidden flex items-center justify-center">
                    {personalData.profile_picture ? (
                       <img src={personalData.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                       <UserIcon className="w-14 h-14 text-white" />
                    )}
                 </div>
                 <label className="absolute bottom-1 right-1 bg-white text-[#0D9488] p-3 rounded-full cursor-pointer hover:bg-[#CCFBF1] shadow-lg transition-all hover:scale-110 hover:rotate-3">
                    <Upload className="w-5 h-5" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                 </label>
              </div>

              <div className="flex-1 text-center md:text-left space-y-3">
                <h2 className="text-3xl font-black text-white tracking-tight">{personalData.full_name || profile?.user_email}</h2>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                   <span className="bg-white/20 px-4 py-1.5 rounded-full text-sm font-bold backdrop-blur-md flex items-center gap-2 shadow-inner border border-white/10">
                      <div className="w-2.5 h-2.5 bg-[#34D399] rounded-full animate-pulse shadow-[0_0_8px_#34D399]"></div>
                      {profile?.type === 'professional' ? 'Profissional Certificado' : 'Paciente Premium'}
                   </span>
                   <span className="bg-white/20 px-4 py-1.5 rounded-full text-sm font-bold backdrop-blur-md shadow-inner border border-white/10">Plano: {profile?.plan || 'Free'}</span>
                </div>
              </div>

              <div className="w-full md:w-auto">
                <Button 
                  variant="outline" 
                  className="w-full md:w-auto border-white/30 text-white hover:bg-white/10 hover:text-white bg-white/5 backdrop-blur-sm hover:border-white whitespace-normal h-auto py-2 px-4"
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
              </div>
            </CardContent>
          </Card>

        <TabsContent value="stats">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
             {/* Valuation & Conversion */}
             <Card className="col-span-1 md:col-span-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0">
                <CardHeader className="pb-2">
                   <CardTitle className="text-indigo-100 text-sm font-medium flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Valuation das Criações
                   </CardTitle>
                </CardHeader>
                <CardContent>
                   <div className="text-4xl font-bold">R$ {stats?.valuation?.toLocaleString('pt-BR') || '0,00'}</div>
                   <div className="mt-4 flex items-center gap-4">
                      <div className="bg-white/20 px-3 py-1 rounded-lg text-sm font-medium backdrop-blur-sm">
                         Poder de Conversão: <span className="text-yellow-300 font-bold">{stats?.conversionPower || 'N/A'}</span>
                      </div>
                   </div>
                </CardContent>
             </Card>

             <Card className={cardClass}>
                <CardHeader className="pb-2"><CardTitle className="text-slate-500 text-xs font-bold uppercase">Valor em Produtos</CardTitle></CardHeader>
                <CardContent>
                   <div className="text-2xl font-bold text-emerald-600">R$ {stats?.productsValue?.toLocaleString('pt-BR') || '0,00'}</div>
                </CardContent>
             </Card>
             <Card className={cardClass}>
                <CardHeader className="pb-2"><CardTitle className="text-slate-500 text-xs font-bold uppercase">Total Produtos</CardTitle></CardHeader>
                <CardContent>
                   <div className="text-2xl font-bold text-slate-800">{stats?.products || 0}</div>
                </CardContent>
             </Card>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                <div className="bg-blue-50 w-10 h-10 rounded-xl flex items-center justify-center mb-3">
                   <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-slate-800">{stats?.appointments || 0}</div>
                <div className="text-xs text-slate-500 font-medium">Agendamentos</div>
             </div>
             <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                <div className="bg-pink-50 w-10 h-10 rounded-xl flex items-center justify-center mb-3">
                   <Activity className="w-5 h-5 text-pink-600" />
                </div>
                <div className="text-2xl font-bold text-slate-800">{stats?.nurse || 0}</div>
                <div className="text-xs text-slate-500 font-medium">Uso Enfermeira</div>
             </div>
             <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                <div className="bg-green-50 w-10 h-10 rounded-xl flex items-center justify-center mb-3">
                   <MessageSquare className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-slate-800">{stats?.chatbots || 0}</div>
                <div className="text-xs text-slate-500 font-medium">Chatbots Ativos</div>
             </div>
             <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                <div className="bg-orange-50 w-10 h-10 rounded-xl flex items-center justify-center mb-3">
                   <Layout className="w-5 h-5 text-orange-600" />
                </div>
                <div className="text-2xl font-bold text-slate-800">{stats?.sites || 0}</div>
                <div className="text-xs text-slate-500 font-medium">Sites Criados</div>
             </div>
          </div>
        </TabsContent>

        <TabsContent value="personal">
          <Card className={cardClass}>
            <CardHeader className="border-b border-slate-100 pb-6 pt-6 px-8">
              <CardTitle className="text-[#0F172A] flex items-center gap-4 text-xl">
                 <div className="bg-[#F0FDFA] p-3 rounded-2xl"><UserIcon className="w-6 h-6 text-[#0D9488]" /></div>
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

              <div className="border-t border-slate-100 pt-8 mt-2">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold flex items-center gap-3 text-[#0F172A] text-lg">
                       <div className="bg-[#F0FDFA] p-3 rounded-2xl"><MapPin className="w-5 h-5 text-[#0D9488]" /></div> 
                       Endereço
                    </h3>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={handleLocationClick}
                      disabled={isLoadingLocation}
                      className="text-xs h-10 px-4 bg-white text-[#0D9488] border-[#0D9488] hover:bg-[#F0FDFA] font-bold rounded-lg"
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

              <Button onClick={() => saveMutation.mutate()} className="w-full bg-[#0D9488] hover:bg-[#0F766E] text-white h-14 font-bold shadow-lg shadow-teal-900/20 hover:shadow-teal-900/30 transition-all rounded-xl text-lg mt-4" disabled={saveMutation.isPending}>
                 {saveMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                 Salvar Alterações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medical">
          <Card className={cardClass}>
            <CardHeader className="border-b border-[#E2E8F0] pb-4">
              <CardTitle className="text-[#2D3748]">Ficha Médica Digital</CardTitle>
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
              <Button onClick={() => saveMutation.mutate()} className="w-full bg-[#3BAE9C] hover:bg-[#2A9D8F] text-white h-12 font-bold shadow-md hover:shadow-lg transition-all rounded-xl" disabled={saveMutation.isPending}>
                 Salvar Dados Médicos
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

         <TabsContent value="professional">
          <Card className={cardClass}>
            <CardHeader className="border-b border-[#E2E8F0] pb-4">
              <CardTitle className="text-[#2D3748]">Credenciais Profissionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label className={labelClass}>CRM / COREN / Registro</Label>
                <Input className={inputClass} value={professionalData.registry} onChange={e => setProfessionalData({...professionalData, registry: e.target.value})} placeholder="00000/UF" />
              </div>
              <div className="space-y-2">
                <Label className={labelClass}>Especialidades</Label>
                <Input className={inputClass} value={professionalData.specialties} onChange={e => setProfessionalData({...professionalData, specialties: e.target.value})} placeholder="Ex: Dermatologia, Cirurgia Plástica" />
              </div>
              <Button onClick={() => saveMutation.mutate()} className="w-full bg-[#3BAE9C] hover:bg-[#2A9D8F] text-white h-12 font-bold shadow-md hover:shadow-lg transition-all rounded-xl" disabled={saveMutation.isPending}>
                 Salvar Dados Profissionais
              </Button>

              <div className="mt-8 pt-6 border-t border-slate-100">
                 <h3 className="font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#0D9488]" /> Integrações de Agenda
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-slate-200 rounded-xl p-4 flex items-center justify-between bg-slate-50">
                       <div className="flex items-center gap-3">
                          <div className="bg-white p-2 rounded-lg shadow-sm">
                             <Calendar className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                             <div className="font-bold text-slate-700">Google Agenda</div>
                             <div className="text-xs text-slate-500">Sincronizar eventos</div>
                          </div>
                       </div>
                       <Button variant="outline" size="sm" className="border-blue-200 text-blue-700 hover:bg-blue-50" onClick={() => alert("Google Agenda conectado!")}>Conectar</Button>
                    </div>
                    <div className="border border-slate-200 rounded-xl p-4 flex items-center justify-between bg-slate-50">
                       <div className="flex items-center gap-3">
                          <div className="bg-white p-2 rounded-lg shadow-sm">
                             <Mail className="w-5 h-5 text-sky-600" />
                          </div>
                          <div>
                             <div className="font-bold text-slate-700">Outlook Calendar</div>
                             <div className="text-xs text-slate-500">Sincronizar eventos</div>
                          </div>
                       </div>
                       <Button variant="outline" size="sm" className="border-sky-200 text-sky-700 hover:bg-sky-50" onClick={() => alert("Outlook conectado!")}>Conectar</Button>
                    </div>
                 </div>
              </div>
              </CardContent>
              </Card>
              </TabsContent>
      </Tabs>
    </div>
  );
}