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

  // DermaTech High-Vis Theme Classes
  const cardClass = "bg-white border border-slate-100 text-[#0F172A] hover:shadow-2xl transition-all hover:-translate-y-2 duration-300 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)] rounded-[2rem]";
  const inputClass = "bg-[#F8FAFC] border border-slate-200 text-[#0F172A] focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] h-14 rounded-2xl placeholder:text-[#94A3B8] transition-all hover:bg-white";
  const labelClass = "text-[#334155] text-sm font-extrabold mb-2 block uppercase tracking-wide";

  return (
    <div className="max-w-4xl mx-auto pt-12 px-6 pb-24 text-[#0F172A]">
      {step === 1 && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-black text-[#0F172A] tracking-tight">Bem-vindo ao <span className="text-[#0D9488]">HealthAI</span></h1>
            <p className="text-[#64748B] text-xl font-medium max-w-xl mx-auto">A plataforma inteligente para o futuro da sua saúde.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div 
              className={`${cardClass} cursor-pointer p-10 flex flex-col items-center text-center space-y-6 group border-2 border-transparent hover:border-[#0D9488]/20`}
              onClick={() => { setRole('patient'); setStep(2); }}
            >
                <div className="w-24 h-24 bg-gradient-to-br from-[#0D9488] to-[#2DD4BF] text-white rounded-full flex items-center justify-center shadow-xl shadow-teal-200 group-hover:scale-110 transition-transform ring-8 ring-teal-50">
                  <User className="w-12 h-12" />
                </div>
                <div>
                  <h3 className="font-black text-2xl text-[#0F172A]">Sou Paciente</h3>
                  <p className="text-base text-[#64748B] mt-3 font-medium leading-relaxed">Busco atendimento premium e acompanhamento.</p>
                </div>
            </div>

            <div 
              className={`${cardClass} cursor-pointer p-10 flex flex-col items-center text-center space-y-6 group border-2 border-transparent hover:border-[#7C3AED]/20`}
              onClick={() => { setRole('professional'); setStep(2); }}
            >
                <div className="w-24 h-24 bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] text-white rounded-full flex items-center justify-center shadow-xl shadow-purple-200 group-hover:scale-110 transition-transform ring-8 ring-purple-50">
                  <Stethoscope className="w-12 h-12" />
                </div>
                <div>
                  <h3 className="font-black text-2xl text-[#0F172A]">Sou Profissional</h3>
                  <p className="text-base text-[#64748B] mt-3 font-medium leading-relaxed">Gerenciar agenda e oferecer serviços de alta performance.</p>
                </div>
            </div>

            <div 
              className={`${cardClass} cursor-pointer p-10 flex flex-col items-center text-center space-y-6 md:col-span-2 lg:col-span-1 group border-2 border-transparent hover:border-[#D97706]/20`}
              onClick={() => { setRole('sponsor'); setStep(2); }}
            >
                <div className="w-24 h-24 bg-gradient-to-br from-[#D97706] to-[#FBBF24] text-white rounded-full flex items-center justify-center shadow-xl shadow-amber-200 group-hover:scale-110 transition-transform ring-8 ring-amber-50">
                  <Building2 className="w-12 h-12" />
                </div>
                <div>
                  <h3 className="font-black text-2xl text-[#0F172A]">Sou Patrocinador</h3>
                  <p className="text-base text-[#64748B] mt-3 font-medium leading-relaxed">Investir e promover produtos exclusivos.</p>
                </div>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <Card className="bg-white border-0 text-[#0F172A] shadow-2xl animate-in fade-in slide-in-from-right-8 rounded-[2.5rem] overflow-hidden">
          <div className="h-3 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF]"></div>
          <CardHeader className="px-10 pt-10 pb-2">
            <div className="flex items-center gap-3 mb-6">
               <Button variant="ghost" size="icon" onClick={() => setStep(1)} className="h-10 w-10 -ml-2 text-[#94A3B8] hover:text-[#0D9488] hover:bg-[#F0FDFA] rounded-full">
                  <ArrowLeft className="w-5 h-5" />
               </Button>
               <span className="text-sm text-[#64748B] cursor-pointer hover:text-[#0D9488] transition-colors font-bold uppercase tracking-wide" onClick={() => setStep(1)}>Voltar</span>
            </div>
            <CardTitle className="text-4xl font-black text-[#0F172A]">Cadastro de <span className="text-[#0D9488]">{role === 'patient' ? 'Paciente' : 'Profissional'}</span></CardTitle>
            <CardDescription className="text-[#64748B] text-lg mt-2 font-medium">
               {user 
                  ? 'Confirme seus dados para desbloquear seu acesso exclusivo.' 
                  : 'Preencha seus dados para iniciar.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-10 pt-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Dados Pessoais */}
              <div className="space-y-6">
                <h4 className="font-extrabold text-sm text-[#0F172A] uppercase tracking-widest border-b-2 border-slate-100 pb-3 flex items-center gap-4">
                  <div className="bg-[#F0FDFA] p-2 rounded-xl"><User className="w-5 h-5 text-[#0D9488]" /></div> Dados Pessoais
                </h4>
                
                {/* Auth Info Handling */}
                {user ? (
                   <div className="grid grid-cols-1 gap-4 bg-[#F8FAFC] p-8 rounded-[1.5rem] border border-slate-100">
                      <div className="space-y-3">
                         <Label className={labelClass}>Conta Conectada</Label>
                         <div className="flex items-center gap-4 font-bold text-[#0F172A] text-xl">
                            <div className="w-4 h-4 bg-[#0D9488] rounded-full animate-pulse shadow-[0_0_15px_#0D9488]"></div>
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
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
                   <h4 className="font-extrabold text-sm text-[#0F172A] uppercase tracking-widest flex items-center gap-4">
                    <div className="bg-[#F0FDFA] p-2 rounded-xl"><MapPin className="w-5 h-5 text-[#0D9488]" /></div> Endereço
                  </h4>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={handleLocationClick}
                    disabled={isLoadingLocation}
                    className="text-xs h-10 px-4 bg-white text-[#0D9488] border-2 border-[#0D9488] hover:bg-[#F0FDFA] font-bold rounded-xl"
                  >
                    {isLoadingLocation ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <MapPin className="w-4 h-4 mr-2" />}
                    Usar minha localização
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <SelectContent className="bg-white text-[#0F172A] border-slate-200">
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
              <div className="pt-8 mt-8 border-t-2 border-slate-50 space-y-8">
                <div className="flex items-start space-x-4 bg-[#F8FAFC] p-6 rounded-2xl border border-slate-100">
                  <Checkbox 
                    id="terms" 
                    checked={acceptedTerms}
                    onCheckedChange={setAcceptedTerms}
                    required
                    className="mt-1 w-5 h-5 border-2 border-slate-300 data-[state=checked]:bg-[#0D9488] data-[state=checked]:border-[#0D9488] rounded-md"
                  />
                  <div className="grid gap-2 leading-none">
                    <Label htmlFor="terms" className="text-sm font-bold leading-snug cursor-pointer text-[#334155]">
                      Li e aceito os Termos e Condições e a Política de Privacidade
                    </Label>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="link" className="p-0 h-auto text-xs text-[#0D9488] w-fit flex items-center gap-1.5 font-extrabold hover:text-[#0F766E] uppercase tracking-wide">
                          <ScrollText className="w-4 h-4" /> Ler termos completos
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white border-slate-100 text-[#0F172A]">
                        <DialogHeader>
                          <DialogTitle className="text-[#0F172A] text-2xl font-bold">Termos de Uso e Privacidade</DialogTitle>
                          <DialogDescription className="text-[#64748B]">Última atualização: {new Date().toLocaleDateString()}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 text-sm text-[#475569] leading-relaxed">
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
                  className="w-full bg-[#0D9488] hover:bg-[#0F766E] h-16 text-xl shadow-xl shadow-teal-900/20 hover:shadow-2xl hover:shadow-teal-900/30 transition-all font-black rounded-2xl tracking-wide" 
                  disabled={!acceptedTerms || createProfileMutation.isPending}
                >
                  {createProfileMutation.isPending ? (
                    <><Loader2 className="w-6 h-6 animate-spin mr-3" /> Processando...</>
                  ) : (
                    user ? <><CheckCircle2 className="w-6 h-6 mr-3" /> FINALIZAR CADASTRO</> : <><LogIn className="w-6 h-6 mr-3" /> CRIAR LOGIN</>
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