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
       return res?.data?.[0] || {};
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

  if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Meu Perfil</h1>
        <Button variant="outline" onClick={() => navigate(createPageUrl('MyPlan'))}>
           <CreditCard className="w-4 h-4 mr-2" /> Ver Meu Plano
        </Button>
      </div>

      <Tabs defaultValue="personal">
        <TabsList className="w-full">
          <TabsTrigger value="personal">Dados Pessoais</TabsTrigger>
          {profile?.type === 'patient' && <TabsTrigger value="medical">Ficha Médica</TabsTrigger>}
          {profile?.type === 'professional' && <TabsTrigger value="professional">Profissional</TabsTrigger>}
        </TabsList>

        {/* Profile Header Card */}
        <Card className="mb-6 mt-6 border-emerald-200 bg-emerald-50">
          <CardContent className="flex flex-col md:flex-row items-center gap-6 p-6">
            <div className="relative group">
               <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-sm overflow-hidden flex items-center justify-center">
                  {personalData.profile_picture ? (
                     <img src={personalData.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                     <UserIcon className="w-10 h-10 text-emerald-200" />
                  )}
               </div>
               <label className="absolute bottom-0 right-0 bg-emerald-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-emerald-700 shadow-sm">
                  <Upload className="w-3 h-3" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
               </label>
            </div>
            
            <div className="flex-1 text-center md:text-left space-y-1">
              <h2 className="text-xl font-bold text-emerald-900">{profile?.user_email}</h2>
              <p className="text-emerald-700 capitalize font-medium">{profile?.type === 'professional' ? 'Profissional de Saúde' : 'Paciente'}</p>
              <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                 <span className="text-xs bg-white/50 px-2 py-1 rounded text-emerald-800 border border-emerald-100">Plano: <span className="font-bold uppercase">{profile?.plan || 'Free'}</span></span>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="border-emerald-600 text-emerald-700 hover:bg-emerald-100 bg-white"
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
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                 <Label>Nome Completo</Label>
                 <Input value={personalData.full_name} onChange={e => setPersonalData({...personalData, full_name: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={profile?.user_email || ''} disabled className="bg-slate-100" />
                 </div>
                 <div className="space-y-2">
                    <Label>Senha</Label>
                    <Input type="password" value="********" disabled className="bg-slate-100" />
                    <p className="text-xs text-slate-500">A senha pode ser alterada na tela de login (Esqueci minha senha).</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label>CPF</Label>
                    <Input value={personalData.cpf} onChange={e => setPersonalData({...personalData, cpf: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input value={personalData.phone} onChange={e => setPersonalData({...personalData, phone: e.target.value})} />
                 </div>
              </div>
              
              <div className="border-t pt-4 mt-2">
                  <h3 className="font-medium mb-4 flex items-center gap-2"><MapPin className="w-4 h-4" /> Endereço</h3>
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-4 mb-4">
                     <div className="space-y-2">
                        <Label>CEP</Label>
                        <Input value={address.zip} onChange={e => setAddress({...address, zip: e.target.value})} />
                     </div>
                     <div className="space-y-2">
                        <Label>Rua</Label>
                        <Input value={address.street} onChange={e => setAddress({...address, street: e.target.value})} />
                     </div>
                     <div className="space-y-2">
                        <Label>Número</Label>
                        <Input value={address.number} onChange={e => setAddress({...address, number: e.target.value})} />
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label>Bairro</Label>
                        <Input value={address.neighborhood} onChange={e => setAddress({...address, neighborhood: e.target.value})} />
                     </div>
                     <div className="space-y-2">
                        <Label>Cidade</Label>
                        <Input value={address.city} onChange={e => setAddress({...address, city: e.target.value})} />
                     </div>
                     <div className="space-y-2">
                        <Label>Estado</Label>
                        <Input value={address.state} onChange={e => setAddress({...address, state: e.target.value})} />
                     </div>
                     <div className="space-y-2">
                        <Label>País</Label>
                        <Input value={address.country} onChange={e => setAddress({...address, country: e.target.value})} />
                     </div>
                  </div>
              </div>
              
              <Button onClick={() => saveMutation.mutate()} className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={saveMutation.isPending}>
                 {saveMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                 Salvar Alterações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medical">
          <Card>
            <CardHeader>
              <CardTitle>Ficha Médica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo Sanguíneo</Label>
                  <Input value={medicalData.blood_type} onChange={e => setMedicalData({...medicalData, blood_type: e.target.value})} placeholder="Ex: O+" />
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Pele</Label>
                  <Input value={medicalData.skin_type} onChange={e => setMedicalData({...medicalData, skin_type: e.target.value})} placeholder="Ex: Oleosa, Seca..." />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Alergias</Label>
                <Input value={medicalData.allergies} onChange={e => setMedicalData({...medicalData, allergies: e.target.value})} placeholder="Separe por vírgula" />
              </div>
              <div className="space-y-2">
                <Label>Doenças Crônicas / Histórico</Label>
                <Input value={medicalData.diseases} onChange={e => setMedicalData({...medicalData, diseases: e.target.value})} placeholder="Separe por vírgula" />
              </div>
              <Button onClick={() => saveMutation.mutate()} className="w-full bg-emerald-600" disabled={saveMutation.isPending}>
                 Salvar Dados Médicos
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

         <TabsContent value="professional">
          <Card>
            <CardHeader>
              <CardTitle>Dados Profissionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>CRM / COREN / Registro</Label>
                <Input value={professionalData.registry} onChange={e => setProfessionalData({...professionalData, registry: e.target.value})} placeholder="00000/UF" />
              </div>
              <div className="space-y-2">
                <Label>Especialidades</Label>
                <Input value={professionalData.specialties} onChange={e => setProfessionalData({...professionalData, specialties: e.target.value})} placeholder="Ex: Dermatologia, Cirurgia Plástica" />
              </div>
              <Button onClick={() => saveMutation.mutate()} className="w-full bg-emerald-600" disabled={saveMutation.isPending}>
                 Salvar Dados Profissionais
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}