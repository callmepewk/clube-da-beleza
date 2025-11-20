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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [user, setUser] = useState(null);
  
  const [formData, setFormData] = useState({
    cpf: '',
    email: '',
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
  const queryClient = useQueryClient();

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

  // Aesthetic Premium Theme Classes
  const cardClass = "bg-white border border-[#E2E8F0] text-[#2D3748] hover:shadow-xl transition-all hover:-translate-y-1 duration-300 shadow-md rounded-2xl";
  const inputClass = "bg-[#F4F7F7] border border-[#E2E8F0] text-[#2D3748] focus:ring-2 focus:ring-[#3BAE9C]/20 focus:border-[#3BAE9C] h-12 rounded-xl placeholder:text-[#A7AFB4] transition-all";
  const labelClass = "text-[#4A5568] text-sm font-bold mb-1.5 block";

  return (
    <div className="max-w-3xl mx-auto pt-10 px-4 pb-20 text-[#2D3748]">
      {step === 1 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-[#2D3748] tracking-tight drop-shadow-sm">Bem-vindo ao HealthAI</h1>
            <p className="text-[#A7AFB4] text-lg">Selecione como você deseja usar a plataforma</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div 
              className={`${cardClass} cursor-pointer p-8 flex flex-col items-center text-center space-y-4 group`}
              onClick={() => { setRole('patient'); setStep(2); }}
            >
                <div className="w-20 h-20 bg-gradient-to-br from-[#3BAE9C] to-[#2A9D8F] text-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <User className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-[#2D3748]">Sou Paciente</h3>
                  <p className="text-sm text-[#A7AFB4] mt-2 leading-relaxed">Busco atendimento, agendamento e acompanhamento.</p>
                </div>
            </div>

            <div 
              className={`${cardClass} cursor-pointer p-8 flex flex-col items-center text-center space-y-4 group`}
              onClick={() => { setRole('professional'); setStep(2); }}
            >
                <div className="w-20 h-20 bg-gradient-to-br from-[#CDB7FF] to-[#9F7AEA] text-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Stethoscope className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-[#2D3748]">Sou Profissional</h3>
                  <p className="text-sm text-[#A7AFB4] mt-2 leading-relaxed">Gerenciar agenda, pacientes e oferecer serviços.</p>
                </div>
            </div>

            <div 
              className={`${cardClass} cursor-pointer p-8 flex flex-col items-center text-center space-y-4 md:col-span-2 lg:col-span-1 group`}
              onClick={() => { setRole('sponsor'); setStep(2); }}
            >
                <div className="w-20 h-20 bg-gradient-to-br from-[#D9C79F] to-[#B794F4] text-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Building2 className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-[#2D3748]">Sou Patrocinador</h3>
                  <p className="text-sm text-[#A7AFB4] mt-2 leading-relaxed">Investir e promover produtos na plataforma.</p>
                </div>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <Card className="bg-white border border-[#E2E8F0] text-[#2D3748] shadow-2xl animate-in fade-in slide-in-from-right-8 rounded-3xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-[#3BAE9C] to-[#8EE2C8]"></div>
          <CardHeader>
            <div className="flex items-center gap-2 mb-4">
               <Button variant="ghost" size="icon" onClick={() => setStep(1)} className="h-8 w-8 -ml-2 text-[#A7AFB4] hover:text-[#3BAE9C] hover:bg-[#F4F7F7]">
                  <ArrowLeft className="w-4 h-4" />
               </Button>
               <span className="text-sm text-[#A7AFB4] cursor-pointer hover:text-[#3BAE9C] transition-colors font-medium" onClick={() => setStep(1)}>Voltar para seleção</span>
            </div>
            <CardTitle className="text-3xl font-bold text-[#2D3748]">Cadastro de <span className="text-[#3BAE9C]">{role === 'patient' ? 'Paciente' : 'Profissional'}</span></CardTitle>
            <CardDescription className="text-[#A7AFB4] text-lg">
               {user 
                  ? 'Confirme seus dados para finalizar o acesso.' 
                  : 'Preencha seus dados. Login e senha na próxima etapa.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Dados Pessoais */}
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-[#2D3748] uppercase tracking-wider border-b border-[#E2E8F0] pb-2 flex items-center gap-2">
                  <div className="bg-[#E6FFFA] p-1 rounded-md"><User className="w-4 h-4 text-[#3BAE9C]" /></div> Dados Pessoais
                </h4>
                
                {/* Auth Info Handling */}
                {user ? (
                   <div className="grid grid-cols-1 gap-4 bg-[#F4F7F7] p-6 rounded-xl border border-[#E2E8F0]">
                      <div className="space-y-2">
                         <Label className={labelClass}>Conta Conectada</Label>
                         <div className="flex items-center gap-3 font-bold text-[#2D3748] text-lg">
                            <div className="w-3 h-3 bg-[#3BAE9C] rounded-full animate-pulse shadow-[0_0_10px_#3BAE9C]"></div>
                            {user.email}
                         </div>
                      </div>
                   </div>
                ) : (
                   <div className="space-y-2">
                     <Label className={labelClass}>Email *</Label>
                     <Input 
                       className={inputClass}
                       required 
                       type="email"
                       value={formData.email} 
                       onChange={e => setFormData({...formData, email: e.target.value})} 
                       placeholder="seu@email.com"
                     />
                     <div className="text-xs text-[#B3B3B3] flex items-center gap-2 mt-1">
                        <LogIn className="w-3 h-3" />
                        <span>Você definirá sua senha na próxima etapa.</span>
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
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                   <h4 className="font-bold text-sm text-[#2D3748] uppercase tracking-wider flex items-center gap-2">
                    <div className="bg-[#E6FFFA] p-1 rounded-md"><MapPin className="w-4 h-4 text-[#3BAE9C]" /></div> Endereço
                  </h4>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={handleLocationClick}
                    disabled={isLoadingLocation}
                    className="text-xs h-8 bg-white text-[#3BAE9C] border-[#3BAE9C] hover:bg-[#E6FFFA]"
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
                      <SelectContent className="bg-white text-[#2D3748] border-[#E2E8F0]">
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
              <div className="pt-6 mt-6 border-t border-[#E2E8F0] space-y-6">
                <div className="flex items-start space-x-3 bg-[#F4F7F7] p-4 rounded-xl border border-[#E2E8F0]">
                  <Checkbox 
                    id="terms" 
                    checked={acceptedTerms}
                    onCheckedChange={setAcceptedTerms}
                    required
                    className="mt-1 border-[#A7AFB4] data-[state=checked]:bg-[#3BAE9C] data-[state=checked]:border-[#3BAE9C]"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="terms" className="text-sm font-medium leading-snug cursor-pointer text-[#4A5568]">
                      Li e aceito os Termos e Condições e a Política de Privacidade
                    </Label>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="link" className="p-0 h-auto text-xs text-[#3BAE9C] w-fit flex items-center gap-1 font-bold hover:text-[#2A9D8F]">
                          <ScrollText className="w-3 h-3" /> Ler termos completos
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white border-[#E2E8F0] text-[#2D3748]">
                        <DialogHeader>
                          <DialogTitle className="text-[#2D3748]">Termos de Uso e Privacidade - HealthAI</DialogTitle>
                          <DialogDescription className="text-[#A7AFB4]">Última atualização: {new Date().toLocaleDateString()}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 text-sm text-[#4A5568]">
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
                  className="w-full bg-[#3BAE9C] hover:bg-[#2A9D8F] h-14 text-lg shadow-lg hover:shadow-xl transition-all font-bold rounded-xl" 
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