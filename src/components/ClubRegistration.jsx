import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Briefcase, MapPin, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import T from '@/components/TranslatedText';

export default function ClubRegistration({ open, onOpenChange }) {
  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    cpf: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    country: 'Brasil'
  });

  const handleLocationClick = () => {
    if (!navigator.geolocation) {
      alert("Geolocalização não suportada pelo seu navegador.");
      return;
    }

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
            country: data.address.country || prev.country
          }));
        }
      } catch (error) {
        console.error("Erro ao buscar endereço:", error);
      }
    }, (error) => {
      console.error("Erro de geolocalização:", error);
      alert("Não foi possível obter sua localização.");
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Send registration to admin
      await base44.integrations.Core.SendEmail({
        to: "pedro_hbfreitas@hotmail.com",
        subject: `Novo Registro no Clube da Beleza - ${accountType}`,
        body: `
          Nova solicitação de registro no Clube da Beleza:
          
          Tipo de Conta: ${accountType === 'patient' ? 'Paciente' : 'Profissional'}
          Nome: ${formData.full_name}
          Email: ${formData.email}
          Telefone: ${formData.phone}
          CPF: ${formData.cpf}
          
          Endereço:
          ${formData.street}, ${formData.number}${formData.complement ? ' - ' + formData.complement : ''}
          ${formData.neighborhood}, ${formData.city} - ${formData.state}
          ${formData.country}
        `
      });
      
      alert("Registro enviado com sucesso! Você receberá um e-mail com as instruções de acesso.");
      onOpenChange(false);
      setStep(1);
      setAccountType('');
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        cpf: '',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        country: 'Brasil'
      });
    } catch (error) {
      console.error(error);
      alert("Erro ao enviar registro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-[#FFF9F0] border border-[#D4A574] text-[#3E2723] focus:ring-2 focus:ring-[#8B6F47] focus:border-[#8B6F47] h-12 rounded-lg placeholder:text-[#8B6F47]/50 transition-all";
  const labelClass = "text-[#3E2723] text-sm font-bold mb-2 block";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-[#D4A574] to-[#8B6F47] text-white border-0 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-white/20 pb-4">
          <T as={DialogTitle} className="text-3xl font-black text-white">Registre-se no Club da Beleza</T>
          <T as={DialogDescription} className="text-white/80 text-base">
            Conecte-se ao ecossistema completo de estética e bem-estar
          </T>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-6 pt-6">
            <div>
              <T as={Label} className="text-white text-base font-bold mb-4 block">Tipo de Conta *</T>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => { setAccountType('patient'); setStep(2); }}
                  className={`p-6 rounded-2xl border-2 transition-all hover:scale-105 ${
                    accountType === 'patient' 
                      ? 'bg-white text-[#8B6F47] border-white shadow-xl' 
                      : 'bg-white/10 text-white border-white/30 backdrop-blur-sm hover:bg-white/20'
                  }`}
                >
                  <User className="w-10 h-10 mb-3 mx-auto" />
                  <T className="font-bold text-lg">Paciente</T>
                  <T className="text-sm mt-1 opacity-80">Busco tratamentos</T>
                </button>
                <button
                  onClick={() => { setAccountType('professional'); setStep(2); }}
                  className={`p-6 rounded-2xl border-2 transition-all hover:scale-105 ${
                    accountType === 'professional' 
                      ? 'bg-white text-[#8B6F47] border-white shadow-xl' 
                      : 'bg-white/10 text-white border-white/30 backdrop-blur-sm hover:bg-white/20'
                  }`}
                >
                  <Briefcase className="w-10 h-10 mb-3 mx-auto" />
                  <T className="font-bold text-lg">Profissional</T>
                  <T className="text-sm mt-1 opacity-80">Ofereço serviços</T>
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-6 pt-6">
            <div className="space-y-4">
              <div>
                <T as={Label} className={labelClass}>Nome Completo *</T>
                <Input 
                  required
                  className={inputClass}
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  placeholder="Seu nome completo"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <T as={Label} className={labelClass}>E-mail *</T>
                  <Input 
                    required
                    type="email"
                    className={inputClass}
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="seu@email.com"
                  />
                </div>
                <div>
                  <T as={Label} className={labelClass}>Telefone/WhatsApp *</T>
                  <Input 
                    required
                    className={inputClass}
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              <div>
                <T as={Label} className={labelClass}>CPF *</T>
                <Input 
                  required
                  className={inputClass}
                  value={formData.cpf}
                  onChange={(e) => setFormData({...formData, cpf: e.target.value})}
                  placeholder="000.000.000-00"
                />
              </div>
            </div>

            <div className="border-t border-white/20 pt-6">
              <div className="flex items-center justify-between mb-4">
                <T as="h3" className="text-xl font-bold text-white">Localização</T>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleLocationClick}
                  className="bg-white/20 border-white/40 text-white hover:bg-white/30 backdrop-blur-md"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  <T>Usar Localização Atual</T>
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-4">
                  <div>
                    <T as={Label} className={labelClass}>Endereço</T>
                    <Input 
                      className={inputClass}
                      value={formData.street}
                      onChange={(e) => setFormData({...formData, street: e.target.value})}
                      placeholder="Rua, Avenida..."
                    />
                  </div>
                  <div>
                    <T as={Label} className={labelClass}>Número</T>
                    <Input 
                      className={inputClass}
                      value={formData.number}
                      onChange={(e) => setFormData({...formData, number: e.target.value})}
                      placeholder="123"
                    />
                  </div>
                  <div>
                    <T as={Label} className={labelClass}>Complemento</T>
                    <Input 
                      className={inputClass}
                      value={formData.complement}
                      onChange={(e) => setFormData({...formData, complement: e.target.value})}
                      placeholder="Apto, Bloco..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <T as={Label} className={labelClass}>Bairro</T>
                    <Input 
                      className={inputClass}
                      value={formData.neighborhood}
                      onChange={(e) => setFormData({...formData, neighborhood: e.target.value})}
                      placeholder="Seu bairro"
                    />
                  </div>
                  <div>
                    <T as={Label} className={labelClass}>Cidade</T>
                    <Input 
                      className={inputClass}
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      placeholder="Sua cidade"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <T as={Label} className={labelClass}>Estado</T>
                    <Input 
                      className={inputClass}
                      value={formData.state}
                      onChange={(e) => setFormData({...formData, state: e.target.value})}
                      placeholder="UF"
                    />
                  </div>
                  <div>
                    <T as={Label} className={labelClass}>País</T>
                    <Input 
                      className={inputClass}
                      value={formData.country}
                      onChange={(e) => setFormData({...formData, country: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1 bg-white/20 border-white/40 text-white hover:bg-white/30 h-14 rounded-xl font-bold"
              >
                <T>Voltar</T>
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-white text-[#8B6F47] hover:bg-white/90 h-14 rounded-xl font-bold shadow-xl"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                <T>Finalizar Registro</T>
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}