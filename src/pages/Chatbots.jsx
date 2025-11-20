import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Bot, MessageCircle, Instagram, Settings, Loader2, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';

export default function ChatbotsPage() {
  const [activeTab, setActiveTab] = useState('config');
  const [config, setConfig] = useState({
    name: '',
    personality: 'friendly',
    platform: 'whatsapp'
  });

  const deployMutation = useMutation({
    mutationFn: async () => {
      await new Promise(r => setTimeout(r, 2000)); // Simulate deployment
      return { success: true };
    }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0F172A]">Meus Chatbots</h1>
      
      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="create">Criar Novo</TabsTrigger>
          <TabsTrigger value="manage">Gerenciar</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Configuração do Assistente</CardTitle>
                <CardDescription>Defina como seu bot irá interagir com os pacientes.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome do Chatbot</label>
                  <input 
                    className="w-full p-2 border rounded-md"
                    placeholder="Ex: Atendente Virtual Dr. Silva"
                    value={config.name}
                    onChange={(e) => setConfig({...config, name: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Personalidade / Tom de Voz</label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={config.personality}
                    onChange={(e) => setConfig({...config, personality: e.target.value})}
                  >
                    <option value="friendly">Amigável e Acolhedor</option>
                    <option value="formal">Formal e Direto</option>
                    <option value="clinical">Clínico e Técnico</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Plataforma de Integração</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => setConfig({...config, platform: 'whatsapp'})}
                      className={`p-4 rounded-lg border flex flex-col items-center gap-2 transition-colors ${config.platform === 'whatsapp' ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-200 hover:bg-slate-50'}`}
                    >
                      <MessageCircle className="w-6 h-6" />
                      <span className="text-sm font-medium">WhatsApp</span>
                    </button>
                    <button 
                      onClick={() => setConfig({...config, platform: 'instagram'})}
                      className={`p-4 rounded-lg border flex flex-col items-center gap-2 transition-colors ${config.platform === 'instagram' ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-slate-200 hover:bg-slate-50'}`}
                    >
                      <Instagram className="w-6 h-6" />
                      <span className="text-sm font-medium">Instagram</span>
                    </button>
                  </div>
                </div>

                <Button 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 mt-4"
                  onClick={() => deployMutation.mutate()}
                  disabled={deployMutation.isPending || !config.name}
                >
                  {deployMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Implementando IA...</>
                  ) : (
                    <><Bot className="w-4 h-4 mr-2" /> Criar e Integrar</>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Simulation Preview */}
            <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-xl">
                <div className="w-[148px] h-[18px] bg-gray-800 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute"></div>
                <div className="h-[32px] w-[3px] bg-gray-800 absolute -start-[17px] top-[72px] rounded-s-lg"></div>
                <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[124px] rounded-s-lg"></div>
                <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[178px] rounded-s-lg"></div>
                <div className="h-[64px] w-[3px] bg-gray-800 absolute -end-[17px] top-[142px] rounded-e-lg"></div>
                <div className="rounded-[2rem] overflow-hidden w-[272px] h-[572px] bg-white dark:bg-gray-800 relative flex flex-col">
                    {/* Chat Header */}
                    <div className={`p-4 ${config.platform === 'whatsapp' ? 'bg-[#075E54]' : 'bg-gradient-to-r from-purple-500 to-orange-500'} text-white`}>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                          <Bot className="w-5 h-5" />
                        </div>
                        <div className="text-sm font-medium">{config.name || 'Nome do Bot'}</div>
                      </div>
                    </div>
                    {/* Chat Body */}
                    <div className="flex-1 bg-[#ECE5DD] p-2 space-y-2 relative">
                       {deployMutation.isSuccess ? (
                         <>
                           <div className="bg-white p-2 rounded-lg rounded-tl-none self-start max-w-[80%] text-sm shadow-sm">
                             Olá! Sou o {config.name}. Como posso ajudar você a agendar sua consulta hoje?
                           </div>
                         </>
                       ) : (
                         <div className="flex items-center justify-center h-full text-slate-400 text-xs text-center px-4">
                           Configure e clique em "Criar" para ver a prévia
                         </div>
                       )}
                    </div>
                </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="manage">
          <div className="text-center py-12 text-slate-500">
            Você ainda não possui chatbots ativos. Crie um para começar.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}