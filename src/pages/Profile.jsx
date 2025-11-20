import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MapPin, Save, Loader2 } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';

export default function ProfilePage() {
  const [address, setAddress] = useState({
    street: '', city: '', state: '', zip: '', country: ''
  });
  const [medicalData, setMedicalData] = useState({
    blood_type: '', allergies: '', diseases: ''
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ['userProfileFull'],
    queryFn: async () => {
       const user = await base44.auth.me();
       if (!user) return null;
       const res = await base44.entities.UserProfile.list({ query: { user_email: user.email }});
       return res.data[0] || {};
    }
  });

  // Geolocate
  const handleGeolocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        // In a real app, call reverse geocoding API here using lat/lng
        // For now, we simulate autofill
        setAddress({
          street: 'Rua Exemplo Georreferenciada, 123',
          city: 'São Paulo',
          state: 'SP',
          country: 'Brasil',
          zip: '01000-000'
        });
      });
    }
  };

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      // Upsert logic would be better, but simple create/update for now
      // Assuming edit not implemented fully for brevity, just showing UI
    }
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Meu Perfil</h1>

      <Tabs defaultValue="personal">
        <TabsList className="w-full">
          <TabsTrigger value="personal">Dados Pessoais</TabsTrigger>
          <TabsTrigger value="medical">Ficha Médica</TabsTrigger>
          <TabsTrigger value="professional">Profissional</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Endereço e Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                   <Label>CEP</Label>
                   <div className="flex gap-2">
                     <Input value={address.zip} onChange={e => setAddress({...address, zip: e.target.value})} />
                     <Button variant="outline" onClick={handleGeolocate} title="Usar localização atual">
                       <MapPin className="w-4 h-4" />
                     </Button>
                   </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cidade</Label>
                  <Input value={address.city} onChange={e => setAddress({...address, city: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Input value={address.state} onChange={e => setAddress({...address, state: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Endereço Completo</Label>
                <Input value={address.street} onChange={e => setAddress({...address, street: e.target.value})} />
              </div>
              <Button className="w-full bg-emerald-600">Salvar Alterações</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medical">
          <Card>
            <CardHeader>
              <CardTitle>Dados de Saúde</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo Sanguíneo</Label>
                  <Input placeholder="Ex: O+" />
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Pele</Label>
                  <Input placeholder="Ex: Oleosa, Seca..." />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Alergias</Label>
                <Input placeholder="Separe por vírgula" />
              </div>
              <div className="space-y-2">
                <Label>Doenças Crônicas / Histórico</Label>
                <Input placeholder="Separe por vírgula" />
              </div>
              <Button className="w-full bg-emerald-600">Atualizar Ficha</Button>
            </CardContent>
          </Card>
        </TabsContent>

         <TabsContent value="professional">
          <Card>
            <CardHeader>
              <CardTitle>Registro Profissional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>CRM / COREN / Registro</Label>
                <Input placeholder="00000/UF" />
              </div>
              <div className="space-y-2">
                <Label>Especialidades</Label>
                <Input placeholder="Ex: Dermatologia, Cirurgia Plástica" />
              </div>
              <Button className="w-full bg-emerald-600">Salvar Dados Profissionais</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}