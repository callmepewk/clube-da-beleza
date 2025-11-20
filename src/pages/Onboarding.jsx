import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from "@/components/ui/checkbox";
import { User, Stethoscope, CheckCircle2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(null); // 'patient' | 'professional'
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [formData, setFormData] = useState({
    cpf: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    country: '',
    zip: '',
    crm: '', // for pros
    service_street: '', // for pros
    same_address: true
  });

  const navigate = useNavigate();

  const createProfileMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      const commonData = {
        user_email: user.email,
        type: role,
        terms_accepted: true,
        terms_accepted_date: new Date().toISOString(),
        cpf: formData.cpf,
        phone: formData.phone,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          zip: formData.zip
        }
      };

      if (role === 'professional') {
        Object.assign(commonData, {
          professional_registry: formData.crm,
          service_address: {
            is_same_as_personal: formData.same_address,
            street: formData.same_address ? formData.street : formData.service_street,
            city: formData.same_address ? formData.city : '', // simplify for demo
            state: formData.same_address ? formData.state : '',
            country: formData.same_address ? formData.country : ''
          }
        });
      }

      return base44.entities.UserProfile.create(commonData);
    },
    onSuccess: () => {
      navigate(createPageUrl('Dashboard'));
      window.location.reload(); // Reload to refresh layout state
    }
  });

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createProfileMutation.mutate();
  };

  return (
    <div className="max-w-2xl mx-auto pt-10">
      {step === 1 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">Bem-vindo ao HealthAI</h1>
            <p className="text-slate-500">Para começarmos, como você deseja utilizar a plataforma?</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card 
              className="cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all"
              onClick={() => handleRoleSelect('patient')}
            >
              <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Sou Paciente</h3>
                  <p className="text-sm text-slate-500 mt-2">Quero cuidar da minha saúde, agendar consultas e ter acompanhamento.</p>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all"
              onClick={() => handleRoleSelect('professional')}
            >
              <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                  <Stethoscope className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Sou Profissional</h3>
                  <p className="text-sm text-slate-500 mt-2">Quero gerenciar minha clínica, pacientes e oferecer meus serviços.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {step === 2 && (
        <Card className="animate-in fade-in slide-in-from-right-8">
          <CardHeader>
            <CardTitle>Complete seu Cadastro</CardTitle>
            <CardDescription>Precisamos de alguns dados para configurar seu perfil de {role === 'patient' ? 'Paciente' : 'Profissional'}.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-slate-900 uppercase tracking-wider border-b pb-2">Dados Pessoais</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>CPF</Label>
                    <Input required value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} placeholder="000.000.000-00" />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="(00) 00000-0000" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Endereço Residencial</Label>
                  <Input required value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} placeholder="Rua, Número, Bairro" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                    <Label>Cidade</Label>
                    <Input required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Estado</Label>
                    <Input required value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
                  </div>
                </div>
              </div>

              {role === 'professional' && (
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-slate-900 uppercase tracking-wider border-b pb-2 mt-6">Dados Profissionais</h4>
                  <div className="space-y-2">
                    <Label>Registro Profissional (CRM/COREN/Outros)</Label>
                    <Input required value={formData.crm} onChange={e => setFormData({...formData, crm: e.target.value})} />
                  </div>
                  
                  <div className="flex items-center space-x-2 py-2">
                    <Checkbox 
                      id="same_address" 
                      checked={formData.same_address}
                      onCheckedChange={(checked) => setFormData({...formData, same_address: checked})}
                    />
                    <Label htmlFor="same_address">Atendo no meu endereço residencial</Label>
                  </div>

                  {!formData.same_address && (
                    <div className="space-y-2 animate-in fade-in height-auto">
                      <Label>Endereço de Atendimento</Label>
                      <Input 
                        required 
                        value={formData.service_street} 
                        onChange={e => setFormData({...formData, service_street: e.target.value})} 
                        placeholder="Endereço completo da clínica/consultório"
                      />
                      <p className="text-xs text-slate-500">Este endereço será visível para seus pacientes.</p>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-4 space-y-4 border-t mt-6">
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="terms" 
                    checked={acceptedTerms}
                    onCheckedChange={setAcceptedTerms}
                    required
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Aceito os Termos e Condições
                    </Label>
                    <p className="text-xs text-slate-500">
                      Concordo com a política de privacidade e tratamento de dados de saúde.
                    </p>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={!acceptedTerms || createProfileMutation.isPending}>
                  {createProfileMutation.isPending ? 'Criando Perfil...' : 'Finalizar Cadastro'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}