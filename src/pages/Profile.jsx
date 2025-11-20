import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MapPin, Save, Loader2, Upload, CreditCard, User as UserIcon } from 'lucide-react';
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
       // Ensure email is populated from auth if missing in profile
       if (!userProfile.user_email) userProfile.user_email = user.email;
       return userProfile;
    }
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

  // Refined Elegant Theme Classes
  const cardClass = "bg-white border border-slate-100 text-[#1E293B] hover:shadow-lg transition-all hover:-translate-y-0.5 duration-300 shadow-sm rounded-2xl";
  const inputClass = "bg-[#F8FAFC] border border-slate-200 text-[#1E293B] focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669] h-12 rounded-xl placeholder:text-[#94A3B8] transition-all hover:bg-[#F1F5F9]";
  const labelClass = "text-[#475569] text-sm font-bold mb-1.5 block";

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#1E293B]">Meu Perfil</h1>
            <p className="text-[#64748B]">Gerencie suas informações e preferências.</p>
          </div>
          <Button variant="outline" onClick={() => navigate(createPageUrl('MyPlan'))} className="border-slate-200 bg-white text-[#1E293B] hover:bg-[#F8FAFC] hover:text-[#059669] shadow-sm rounded-xl">
             <CreditCard className="w-4 h-4 mr-2 text-[#059669]" /> Ver Meu Plano
          </Button>
        </div>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="w-full bg-[#F1F5F9] border border-slate-200 p-1.5 rounded-2xl">
            <TabsTrigger value="personal" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-[#059669] data-[state=active]:shadow-sm text-[#64748B] font-semibold transition-all">Dados Pessoais</TabsTrigger>
            {profile?.type === 'patient' && <TabsTrigger value="medical" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-[#059669] data-[state=active]:shadow-sm text-[#64748B] font-semibold transition-all">Ficha Médica</TabsTrigger>}
            {profile?.type === 'professional' && <TabsTrigger value="professional" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-[#059669] data-[state=active]:shadow-sm text-[#64748B] font-semibold transition-all">Profissional</TabsTrigger>}
          </TabsList>

          {/* Profile Header Card */}
          <Card className="mb-6 mt-6 border-0 bg-gradient-to-r from-[#059669] to-[#34D399] shadow-lg text-white rounded-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <CardContent className="flex flex-col md:flex-row items-center gap-6 p-8 relative z-10">
              <div className="relative group">
                 <div className="w-28 h-28 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 shadow-lg overflow-hidden flex items-center justify-center">
                    {personalData.profile_picture ? (
                       <img src={personalData.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                       <UserIcon className="w-12 h-12 text-white" />
                    )}
                 </div>
                 <label className="absolute bottom-1 right-1 bg-white text-[#059669] p-2 rounded-full cursor-pointer hover:bg-[#F0FDF4] shadow-md transition-all hover:scale-110">
                    <Upload className="w-4 h-4" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                 </label>
              </div>

              <div className="flex-1 text-center md:text-left space-y-2">
                <h2 className="text-2xl font-bold text-white tracking-tight">{personalData.full_name || profile?.user_email}</h2>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                   <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-200 rounded-full animate-pulse"></div>
                      {profile?.type === 'professional' ? 'Profissional Certificado' : 'Paciente Premium'}
                   </span>
                   <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">Plano: {profile?.plan || 'Free'}</span>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10 hover:text-white bg-white/5 backdrop-blur-sm hover:border-white"
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
            </CardContent>
          </Card>

        <TabsContent value="personal">
          <Card className={cardClass}>
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-[#1E293B] flex items-center gap-3">
                 <div className="bg-[#ECFDF5] p-2 rounded-xl"><UserIcon className="w-5 h-5 text-[#059669]" /></div>
                 Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                 <Label className={labelClass}>Nome Completo</Label>
                 <Input className={inputClass} value={personalData.full_name} onChange={e => setPersonalData({...personalData, full_name: e.target.value})} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label className={labelClass}>Email</Label>
                    <Input value={profile?.user_email || ''} disabled className={`${inputClass} bg-slate-50 text-slate-400 cursor-not-allowed`} />
                 </div>
                 <div className="space-y-2">
                    <Label className={labelClass}>Senha</Label>
                    <Input type="password" value="********" disabled className={`${inputClass} bg-slate-50 text-slate-400 cursor-not-allowed`} />
                    <p className="text-xs text-slate-400">A senha pode ser alterada na tela de login.</p>
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

              <div className="border-t border-slate-100 pt-6 mt-2">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold flex items-center gap-3 text-[#1E293B]">
                       <div className="bg-[#ECFDF5] p-2 rounded-xl"><MapPin className="w-4 h-4 text-[#059669]" /></div> 
                       Endereço
                    </h3>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={handleLocationClick}
                      disabled={isLoadingLocation}
                      className="text-xs h-8 bg-white text-[#059669] border-[#059669] hover:bg-[#ECFDF5]"
                    >
                      {isLoadingLocation ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <MapPin className="w-3 h-3 mr-1" />}
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

              <Button onClick={() => saveMutation.mutate()} className="w-full bg-[#059669] hover:bg-[#047857] text-white h-12 font-bold shadow-md hover:shadow-lg transition-all rounded-xl" disabled={saveMutation.isPending}>
                 {saveMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}