import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Bot, MessageCircle, Instagram, Settings, Loader2, Plus, Wand2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import UsageLimitBanner from '@/components/usage/UsageLimitBanner';
import { getPlanLimits, canUseFeature, getCurrentMonth, sendWhatsAppMessage } from '@/components/usage/usageLimits';
import T from '@/components/TranslatedText';
import { getCurrentLanguage } from '@/components/i18n/i18nUtils';

export default function ChatbotsPage() {
  const [activeTab, setActiveTab] = useState('config');
  const [config, setConfig] = useState({
    name: '',
    personality: 'friendly',
    instructions: '',
    platform: 'whatsapp',
    phone: '',
    instagram: '',
    avatar: ''
  });
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['userProfileChatbots'],
    queryFn: async () => {
      const user = await base44.auth.me();
      if (!user) return null;
      const profiles = await base44.entities.UserProfile.list({ query: { user_email: user.email } });
      return profiles?.data?.[0] || null;
    },
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const planLimits = getPlanLimits(profile?.plan);
  const currentMonth = getCurrentMonth();
  const currentUsage = profile?.monthly_usage?.month === currentMonth ? profile?.monthly_usage?.chatbots_created || 0 : 0;
  const canCreate = canUseFeature(currentUsage, planLimits.chatbots);

  const deployMutation = useMutation({
    mutationFn: async () => {
      if (!canCreate) {
        if (planLimits.chatbots >= 5) {
          sendWhatsAppMessage(user?.full_name || 'Usuário', 'criação de mais chatbots');
          throw new Error('Limite atingido. Mensagem enviada à secretaria.');
        }
        throw new Error('Limite atingido. Faça upgrade para criar mais chatbots.');
      }
      
      await new Promise(r => setTimeout(r, 2000));
      
      const month = getCurrentMonth();
      const usage = profile.monthly_usage || {};
      if (usage.month !== month) {
        await base44.entities.UserProfile.update(profile.id, {
          monthly_usage: { month, chatbots_created: 1, nurse_conversations: 0, sites_created: 0, designs_created: 0, products_created: 0, ai_packages_created: 0 }
        });
      } else {
        await base44.entities.UserProfile.update(profile.id, {
          monthly_usage: { ...usage, chatbots_created: (usage.chatbots_created || 0) + 1 }
        });
      }
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userProfileChatbots']);
      alert('Chatbot criado com sucesso!');
    },
    onError: (error) => {
      alert(error.message);
    }
  });

  return (
    <div className="space-y-6">
      <T as="h1" className="text-2xl font-bold text-[#0F172A]">Meus Chatbots</T>
      
      <UsageLimitBanner 
        currentUsage={currentUsage}
        limit={planLimits.chatbots}
        resourceName="Chatbots Criados"
        planName={planLimits.name}
      />
      
      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="create"><T>Criar Novo</T></TabsTrigger>
          <TabsTrigger value="manage"><T>Gerenciar</T></TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <T as={CardTitle}>Configuração do Assistente</T>
                <T as={CardDescription}>Defina como seu bot irá interagir com os pacientes.</T>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <T as="label" className="text-sm font-medium">Nome do Chatbot</T>
                  <input 
                    className="w-full p-2 border rounded-md"
                    placeholder="Ex: Atendente Virtual Dr. Silva"
                    value={config.name}
                    onChange={(e) => setConfig({...config, name: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                   <T as="label" className="text-sm font-medium">Foto de Perfil (Avatar)</T>
                   <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-slate-100 border flex items-center justify-center overflow-hidden relative">
                        {config.avatar ? (
                          <img src={config.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <Bot className="w-8 h-8 text-slate-300" />
                        )}
                      </div>
                      <div className="relative flex gap-2">
                         <Button variant="outline" size="sm" className="relative cursor-pointer">
                            <input 
                              type="file" 
                              className="absolute inset-0 opacity-0 cursor-pointer" 
                              onChange={async (e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  const res = await base44.integrations.Core.UploadFile({ file });
                                  setConfig({...config, avatar: res.file_url});
                                }
                              }}
                            />
                            <Plus className="w-4 h-4 mr-2" /> Upload
                         </Button>
                         <Button 
                           variant="outline" 
                           size="sm" 
                           onClick={async () => {
                              if (!config.name) { alert("Defina um nome primeiro para gerar o avatar."); return; }
                              const res = await base44.integrations.Core.GenerateImage({
                                 prompt: `Professional avatar for a medical chatbot named ${config.name}, style ${config.personality}, clean background, friendly face, high quality.`
                              });
                              setConfig({...config, avatar: res.url});
                           }}
                         >
                            <Wand2 className="w-4 h-4 mr-2" /> Gerar com IA
                         </Button>
                      </div>
                      </div>
                      </div>
                
                <div className="space-y-2">
                  <T as="label" className="text-sm font-medium">Personalidade / Tom de Voz</T>
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
                  <T as="label" className="text-sm font-medium">Instruções do Sistema (Prompt)</T>
                  <textarea
                    className="w-full p-2 border rounded-md h-24 text-sm"
                    placeholder="Descreva como o bot deve se comportar..."
                    value={config.instructions}
                    onChange={(e) => setConfig({...config, instructions: e.target.value})}
                  />
                  <div className="flex flex-wrap gap-2">
                     <button onClick={() => setConfig({...config, instructions: "Você é um assistente médico focado em triagem inicial. Seja empático e faça perguntas sobre sintomas."})} className="text-xs bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-full">Triagem</button>
                     <button onClick={() => setConfig({...config, instructions: "Seu objetivo é agendar consultas. Ofereça horários disponíveis e confirme dados do paciente."})} className="text-xs bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-full">Agendamento</button>
                     <button onClick={() => setConfig({...config, instructions: "Tire dúvidas sobre procedimentos estéticos como Botox e Preenchimento. Use linguagem simples."})} className="text-xs bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-full">Dúvidas Estéticas</button>
                  </div>
                </div>

                <div className="space-y-2">
                  <T as="label" className="text-sm font-medium">Plataforma de Integração</T>
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

                {config.platform === 'whatsapp' && (
                   <div className="space-y-2 animate-in fade-in">
                      <label className="text-sm font-medium">Número do WhatsApp Business</label>
                      <input 
                        className="w-full p-2 border rounded-md"
                        placeholder="+55 (11) 99999-9999"
                        value={config.phone}
                        onChange={(e) => setConfig({...config, phone: e.target.value})}
                      />
                   </div>
                )}

                {config.platform === 'instagram' && (
                   <div className="space-y-2 animate-in fade-in">
                      <label className="text-sm font-medium">Usuário do Instagram</label>
                      <div className="flex items-center border rounded-md overflow-hidden">
                         <div className="bg-slate-100 p-2 text-slate-500">@</div>
                         <input 
                           className="w-full p-2 outline-none"
                           placeholder="seu.perfil"
                           value={config.instagram}
                           onChange={(e) => setConfig({...config, instagram: e.target.value})}
                         />
                      </div>
                   </div>
                )}

                <Button 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 mt-4"
                  onClick={() => deployMutation.mutate()}
                  disabled={deployMutation.isPending || !config.name}
                >
                  {deployMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2" /> <T>Implementando IA...</T></>
                  ) : (
                    <><Bot className="w-4 h-4 mr-2" /> <T>Criar e Integrar</T></>
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
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                          {config.avatar ? (
                            <img src={config.avatar} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <Bot className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                           <div className="text-sm font-medium">{config.name || 'Nome do Bot'}</div>
                           {config.platform === 'whatsapp' && config.phone && <div className="text-[10px] opacity-80">{config.phone}</div>}
                           {config.platform === 'instagram' && config.instagram && <div className="text-[10px] opacity-80">@{config.instagram}</div>}
                        </div>
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
            <T>Você ainda não possui chatbots ativos. Crie um para começar.</T>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}