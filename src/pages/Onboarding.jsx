import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Stethoscope, CheckCircle2, MapPin, Loader2, ScrollText, Building2, LogIn, ArrowLeft } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [user, setUser] = useState(null);
  
  const [formData, setFormData] = useState({
    cpf: '',
    phone: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    country: 'Brasil',
    zip: '',
    crm: '',
    service_street: '',
    same_address: true,
    full_name: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const u = await base44.auth.me();
      setUser(u);

      // Check for saved onboarding data
      const savedData = localStorage.getItem('onboarding_temp_data');
      if (savedData) {
         const parsed = JSON.parse(savedData);
         setRole(parsed.role);
         setFormData(parsed.formData);
         setAcceptedTerms(parsed.acceptedTerms);
         setStep(2); 
      } else if (u && u.full_name) {
          // Pre-fill name if available
          setFormData(prev => ({ ...prev, full_name: u.full_name }));
      }
    };
    init();
  }, []);

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
          setFormData(prev => ({
            ...prev,
            street: data.address.road || prev.street,
            neighborhood: data.address.suburb || data.address.neighbourhood || prev.neighborhood,
            city: data.address.city || data.address.town || data.address.village || prev.city,
            state: data.address.state || prev.state,
            country: data.address.country || prev.country,
            zip: data.address.postcode || prev.zip,
            number: '' // Usually precise number is hard to get, let user fill
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

  const createProfileMutation = useMutation({
    mutationFn: async () => {
      const currentUser = await base44.auth.me();
      if (!currentUser) throw new Error("Usuário não autenticado");

      // 1. Update Auth User Name if provided
      if (formData.full_name) {
         await base44.auth.updateMe({ full_name: formData.full_name });
      }

      // 2. Create User Profile Entity
      const commonData = {
        user_email: currentUser.email, // Ensuring exact email match
        type: role,
        terms_accepted: true,
        terms_accepted_date: new Date().toISOString(),
        cpf: formData.cpf,
        phone: formData.phone,
        address: {
          street: formData.street || '',
          number: formData.number || '',
          neighborhood: formData.neighborhood || '',
          city: formData.city || '',
          state: formData.state || '',
          country: formData.country || '',
          zip: formData.zip || ''
        }
      };

      if (role === 'professional') {
        Object.assign(commonData, {
          professional_registry: formData.crm,
          service_address: {
            is_same_as_personal: formData.same_address,
            street: formData.same_address ? (formData.street || '') : (formData.service_street || ''),
            number: formData.same_address ? (formData.number || '') : '', 
            neighborhood: formData.same_address ? (formData.neighborhood || '') : '',
            city: formData.same_address ? (formData.city || '') : '',
            state: formData.same_address ? (formData.state || '') : '',
            country: formData.same_address ? (formData.country || '') : ''
          }
        });
      }

      return base44.entities.UserProfile.create(commonData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['userProfileFull'] });
      localStorage.removeItem('onboarding_temp_data');
      window.location.href = createPageUrl('Dashboard');
    },
    onError: (error) => {
      alert("Erro ao salvar perfil: " + error.message);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!acceptedTerms) {
      alert("Você deve aceitar os termos e condições.");
      return;
    }

    if (!user) {
       // Save state and redirect to login/signup
       const dataToSave = {
          role,
          formData,
          acceptedTerms
       };
       localStorage.setItem('onboarding_temp_data', JSON.stringify(dataToSave));
       
       // Redirect to login, telling it to return here
       base44.auth.redirectToLogin(window.location.href);
    } else {
       createProfileMutation.mutate();
    }
  };

  // Dark Theme Classes
  const cardClass = "bg-[#181818] border border-[#282828] text-white hover:bg-[#282828] transition-all hover:scale-[1.02] duration-300 shadow-lg";
  const inputClass = "bg-[#282828] border-none text-white focus:ring-2 focus:ring-purple-500 h-12 rounded-md placeholder:text-[#555]";
  const labelClass = "text-[#B3B3B3] text-sm font-bold mb-1 block";

  return (
    <div className="max-w-3xl mx-auto pt-10 px-4 pb-20 text-white">
      {step === 1 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-white tracking-tight">Bem-vindo ao HealthAI</h1>
            <p className="text-[#B3B3B3]">Selecione como você deseja usar a plataforma</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div 
              className={`${cardClass} cursor-pointer p-8 flex flex-col items-center text-center space-y-4 rounded-xl`}
              onClick={() => { setRole('patient'); setStep(2); }}
            >
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-full flex items-center justify-center shadow-lg">
                  <User className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-white">Sou Paciente</h3>
                  <p className="text-sm text-[#B3B3B3] mt-2 leading-relaxed">Busco atendimento, agendamento e acompanhamento.</p>
                </div>
            </div>

            <div 
              className={`${cardClass} cursor-pointer p-8 flex flex-col items-center text-center space-y-4 rounded-xl`}
              onClick={() => { setRole('professional'); setStep(2); }}
            >
                <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-purple-800 text-white rounded-full flex items-center justify-center shadow-lg">
                  <Stethoscope className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-white">Sou Profissional</h3>
                  <p className="text-sm text-[#B3B3B3] mt-2 leading-relaxed">Gerenciar agenda, pacientes e oferecer serviços.</p>
                </div>
            </div>

            <div 
              className={`${cardClass} cursor-pointer p-8 flex flex-col items-center text-center space-y-4 rounded-xl md:col-span-2 lg:col-span-1`}
              onClick={() => { setRole('sponsor'); setStep(2); }}
            >
                <div className="w-20 h-20 bg-gradient-to-br from-amber-600 to-amber-800 text-white rounded-full flex items-center justify-center shadow-lg">
                  <Building2 className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-white">Sou Patrocinador</h3>
                  <p className="text-sm text-[#B3B3B3] mt-2 leading-relaxed">Investir e promover produtos na plataforma.</p>
                </div>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <Card className="bg-[#181818] border-[#282828] text-white shadow-2xl animate-in fade-in slide-in-from-right-8">
          <CardHeader>
            <div className="flex items-center gap-2 mb-4">
               <Button variant="ghost" size="icon" onClick={() => setStep(1)} className="h-8 w-8 -ml-2 text-[#B3B3B3] hover:text-white hover:bg-[#282828]">
                  <ArrowLeft className="w-4 h-4" />
               </Button>
               <span className="text-sm text-[#B3B3B3] cursor-pointer hover:text-white transition-colors" onClick={() => setStep(1)}>Voltar para seleção</span>
            </div>
            <CardTitle className="text-2xl font-bold">Cadastro de {role === 'patient' ? 'Paciente' : 'Profissional'}</CardTitle>
            <CardDescription className="text-[#B3B3B3]">
               {user 
                  ? 'Confirme seus dados para finalizar o acesso.' 
                  : 'Preencha seus dados. Login e senha na próxima etapa.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Dados Pessoais */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-slate-900 uppercase tracking-wider border-b pb-2 flex items-center gap-2">
                  <User className="w-4 h-4" /> Dados Pessoais
                </h4>
                
                {/* Auth Info Handling */}
                {user ? (
                   <div className="grid grid-cols-1 gap-4 bg-[#282828] p-4 rounded-lg border border-[#3E3E3E]">
                      <div className="space-y-2">
                         <Label className={labelClass}>Conta Conectada</Label>
                         <div className="flex items-center gap-2 font-medium text-white">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            {user.email}
                         </div>
                      </div>
                   </div>
                ) : (
                   <div className="bg-[#282828] p-4 rounded-lg border border-[#3E3E3E] flex gap-3 items-start">
                      <div className="bg-purple-900/30 p-2 rounded-full"><LogIn className="w-4 h-4 text-purple-400" /></div>
                      <div>
                         <h4 className="font-bold text-white text-sm">Login e Senha</h4>
                         <p className="text-xs text-[#B3B3B3] mt-1">
                            Após preencher os dados, você será redirecionado para criar seu login com segurança.
                         </p>
                      </div>
                   </div>
                )}

                <div className="space-y-2">
                   <Label className={labelClass}>Nome Completo *</Label>
                   <Input 
                     className={inputClass}
                     required 
                     value={formData.full_name} 
                     onChange={e => setFormData({...formData, full_name: e.target.value})} 
                     placeholder="Seu nome completo"
                   />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className={labelClass}>CPF *</Label>
                    <Input className={inputClass} required value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} placeholder="000.000.000-00" />
                  </div>
                  <div className="space-y-2">
                    <Label className={labelClass}>Telefone *</Label>
                    <Input className={inputClass} required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="(00) 00000-0000" />
                  </div>
                </div>
              </div>

              {/* Endereço */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#282828] pb-2">
                   <h4 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-purple-500" /> Endereço
                  </h4>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={handleLocationClick}
                    disabled={isLoadingLocation}
                    className="text-xs h-8 bg-[#282828] text-[#B3B3B3] border-[#3E3E3E] hover:bg-[#3E3E3E] hover:text-white"
                  >
                    {isLoadingLocation ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <MapPin className="w-3 h-3 mr-1" />}
                    Usar minha localização
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className={labelClass}>CEP</Label>
                    <Input className={inputClass} value={formData.zip} onChange={e => setFormData({...formData, zip: e.target.value})} placeholder="00000-000" />
                  </div>
                  <div className="space-y-2">
                    <Label className={labelClass}>País</Label>
                    <Select value={formData.country} onValueChange={val => setFormData({...formData, country: val})}>
                      <SelectTrigger className={inputClass}>
                        <SelectValue placeholder="Selecione o país" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#181818] text-white border-[#282828]">
                        <SelectItem value="Brasil">Brasil</SelectItem>
                        <SelectItem value="Estados Unidos">Estados Unidos</SelectItem>
                        <SelectItem value="Portugal">Portugal</SelectItem>
                        <SelectItem value="Outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">
                  <div className="space-y-2">
                    <Label className={labelClass}>Rua / Logradouro</Label>
                    <Input className={inputClass} value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} placeholder="Ex: Av. Paulista" />
                  </div>
                  <div className="space-y-2">
                    <Label className={labelClass}>Número</Label>
                    <Input className={inputClass} value={formData.number} onChange={e => setFormData({...formData, number: e.target.value})} placeholder="123" />
                  </div>
                </div>

                <div className="space-y-2">
                   <Label className={labelClass}>Bairro</Label>
                   <Input className={inputClass} value={formData.neighborhood} onChange={e => setFormData({...formData, neighborhood: e.target.value})} placeholder="Centro" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                    <Label className={labelClass}>Cidade</Label>
                    <Input className={inputClass} value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label className={labelClass}>Estado</Label>
                    <Input className={inputClass} value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} placeholder="UF" />
                  </div>
                </div>
              </div>

              {/* Área Profissional (Condicional) */}
              {role === 'professional' && (
                <div className="space-y-4 pt-2">
                  <h4 className="font-medium text-sm text-slate-900 uppercase tracking-wider border-b pb-2 mt-6 flex items-center gap-2">
                    <Stethoscope className="w-4 h-4" /> Dados Profissionais
                  </h4>
                  <div className="space-y-2">
                    <Label>Registro Profissional (CRM/COREN/Outros) *</Label>
                    <Input required value={formData.crm} onChange={e => setFormData({...formData, crm: e.target.value})} />
                  </div>
                  
                  <div className="flex items-center space-x-2 py-2 bg-slate-50 p-3 rounded-md">
                    <Checkbox 
                      id="same_address" 
                      checked={formData.same_address}
                      onCheckedChange={(checked) => setFormData({...formData, same_address: checked})}
                    />
                    <Label htmlFor="same_address" className="cursor-pointer">Atendo no meu endereço residencial cadastrado acima</Label>
                  </div>

                  {!formData.same_address && (
                    <div className="space-y-2 animate-in fade-in height-auto p-4 border rounded-md border-slate-200">
                      <Label>Endereço de Atendimento Público *</Label>
                      <Input 
                        required 
                        value={formData.service_street} 
                        onChange={e => setFormData({...formData, service_street: e.target.value})} 
                        placeholder="Endereço completo da clínica/consultório"
                      />
                      <p className="text-xs text-slate-500">Este endereço será visível para seus pacientes no agendamento.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Termos e Submit */}
              <div className="pt-6 mt-6 border-t space-y-6">
                <div className="flex items-start space-x-3 bg-[#282828] p-4 rounded-lg border border-[#3E3E3E]">
                  <Checkbox 
                    id="terms" 
                    checked={acceptedTerms}
                    onCheckedChange={setAcceptedTerms}
                    required
                    className="mt-1 border-white/20 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="terms" className="text-sm font-medium leading-snug cursor-pointer text-[#B3B3B3]">
                      Li e aceito os Termos e Condições e a Política de Privacidade
                    </Label>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="link" className="p-0 h-auto text-xs text-purple-400 w-fit flex items-center gap-1">
                          <ScrollText className="w-3 h-3" /> Ler termos completos
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-[#181818] border-[#282828] text-white">
                        <DialogHeader>
                          <DialogTitle className="text-white">Termos de Uso e Privacidade - HealthAI</DialogTitle>
                          <DialogDescription className="text-[#B3B3B3]">Última atualização: {new Date().toLocaleDateString()}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 text-sm text-[#B3B3B3]">
                          <div className="space-y-4 text-justify">
                            <p><strong>1. ACEITAÇÃO DOS TERMOS</strong><br/>
                            Ao acessar e utilizar a plataforma HealthAI ("Plataforma"), você concorda, sem restrições, com estes Termos e Condições de Uso ("Termos"). Se você não concorda com qualquer parte destes Termos, não deve utilizar nossos serviços. Estes Termos aplicam-se a todos os visitantes, usuários e outras pessoas que acessam ou usam o Serviço.</p>
                            
                            <p><strong>2. PRIVACIDADE E PROTEÇÃO DE DADOS (LGPD)</strong><br/>
                            Sua privacidade é fundamental para nós. Coletamos, armazenamos e processamos seus dados pessoais e de saúde (dados sensíveis) em estrita conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).<br/>
                            a) <strong>Dados Coletados:</strong> Nome, CPF, dados de contato, localização, histórico médico, alergias e informações profissionais (quando aplicável).<br/>
                            b) <strong>Finalidade:</strong> Os dados são utilizados exclusivamente para agendamento de consultas, fornecimento de recomendações de saúde pela IA, histórico médico digital e conexão entre paciente e profissional.<br/>
                            c) <strong>Segurança:</strong> Utilizamos criptografia de ponta a ponta. Seus dados de saúde não são compartilhados com terceiros para fins publicitários.</p>
                            
                            <p><strong>3. USO DA INTELIGÊNCIA ARTIFICIAL</strong><br/>
                            A HealthAI utiliza sistemas de Inteligência Artificial para fornecer recomendações, lembretes e triagem inicial.<br/>
                            a) <strong>Não Substituição:</strong> A IA NÃO SUBSTITUI o aconselhamento, diagnóstico ou tratamento médico profissional. Sempre procure o conselho de seu médico ou outro profissional de saúde qualificado.<br/>
                            b) <strong>Limitações:</strong> Embora nos esforcemos pela precisão, a IA pode gerar informações imprecisas. O usuário deve verificar informações críticas.</p>
                            
                            <p><strong>4. RESPONSABILIDADES DOS USUÁRIOS</strong><br/>
                            a) <strong>Pacientes:</strong> São responsáveis pela veracidade das informações de saúde fornecidas e pelo comparecimento aos agendamentos.<br/>
                            b) <strong>Profissionais:</strong> São inteiramente responsáveis pelos atos médicos, diagnósticos e tratamentos realizados, bem como pela validação de seu registro profissional (CRM/COREN).</p>
                            
                            <p><strong>5. GEOLOCALIZAÇÃO</strong><br/>
                            A funcionalidade de geolocalização é utilizada para sugerir endereços e encontrar profissionais próximos. Ao autorizar, você concorda com a coleta momentânea de sua posição geográfica.</p>
                            
                            <p><strong>6. ALTERAÇÕES NOS TERMOS</strong><br/>
                            Reservamo-nos o direito de modificar ou substituir estes Termos a qualquer momento. Alterações materiais serão notificadas com 30 dias de antecedência.</p>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-purple-600 hover:bg-purple-700 h-12 text-lg shadow-md hover:shadow-lg transition-all font-bold" 
                  disabled={!acceptedTerms || createProfileMutation.isPending}
                >
                  {createProfileMutation.isPending ? (
                    <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Criando seu perfil...</>
                  ) : (
                    user ? <><CheckCircle2 className="w-5 h-5 mr-2" /> Finalizar Cadastro</> : <><LogIn className="w-5 h-5 mr-2" /> Continuar para Criação de Login</>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}