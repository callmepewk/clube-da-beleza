import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  format, 
  startOfWeek, 
  addDays, 
  startOfDay, 
  isSameDay, 
  parseISO,
  addHours 
} from 'date-fns';
import { ptBR, enUS, es, fr, de, it, ja, zhCN, ru, ar as arSA } from 'date-fns/locale';
import { getCurrentLanguage } from '@/components/i18n/i18nUtils';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Plus, ChevronLeft, ChevronRight, Video, MapPin, Sparkles, Calendar as CalendarIcon, 
  Loader2, Globe, ExternalLink, Navigation, Search, ShieldCheck, Car, PawPrint, Sofa, 
  Wine, Music, Shield, Package, Wrench, Building, Scissors, BadgeCheck, DollarSign,
  Info, Lightbulb, HelpCircle, Star, Clock,
  Accessibility, Wifi, Baby, Home, CreditCard, QrCode, Handshake, Snowflake, Coffee, Moon, Siren, Gem, Languages, Bed, Crown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import ClubRegistration from '@/components/ClubRegistration';
import T from '@/components/TranslatedText';

// Tipos de profissionais de estética
const PROFESSIONAL_TYPES = [
  { value: 'dermatologista', label: 'Dermatologista' },
  { value: 'esteticista', label: 'Esteticista' },
  { value: 'cirurgiao_plastico', label: 'Cirurgião Plástico' },
  { value: 'biomédico', label: 'Biomédico Esteta' },
  { value: 'fisioterapeuta', label: 'Fisioterapeuta Dermato-funcional' },
  { value: 'nutricionista', label: 'Nutricionista Estético' },
  { value: 'enfermeiro', label: 'Enfermeiro Esteta' },
  { value: 'farmaceutico', label: 'Farmacêutico Esteta' },
  { value: 'dentista', label: 'Dentista (Harmonização Orofacial)' },
  { value: 'cosmetologo', label: 'Cosmetólogo' },
  { value: 'tricologista', label: 'Tricologista' },
  { value: 'massagista', label: 'Massoterapeuta' },
  { value: 'maquiador', label: 'Maquiador Profissional' },
  { value: 'micropigmentador', label: 'Micropigmentador' },
  { value: 'podólogo', label: 'Podólogo' },
  { value: 'designer_sobrancelha', label: 'Designer de Sobrancelhas' },
  { value: 'nail_designer', label: 'Nail Designer' },
  { value: 'cabeleireiro', label: 'Cabeleireiro/Hair Stylist' },
];

// Faixas de preço
const PRICE_RANGES = [
  { value: '500', label: '$ - Até R$ 500', description: 'Econômico' },
  { value: '1000', label: '$$ - R$ 500 a R$ 1.000', description: 'Intermediário' },
  { value: '2000', label: '$$$ - R$ 1.000 a R$ 2.000', description: 'Premium' },
  { value: '5000', label: '$$$$ - R$ 2.000 a R$ 5.000', description: 'Luxo' },
  { value: '5001', label: '$$$$$ - Acima de R$ 5.000', description: 'Ultra Premium' },
];

// Amenidades (20+)
const AMENITIES = [
  { id: 'estacionamento', label: 'Estacionamento', icon: Car },
  { id: 'valet', label: 'Valet', icon: Car },
  { id: 'acessibilidade', label: 'Acessibilidade', icon: Accessibility },
  { id: 'wifi', label: 'Wi‑Fi', icon: Wifi },
  { id: 'sala_vip', label: 'Sala VIP', icon: Crown },
  { id: 'atendimento_infantil', label: 'Atendimento infantil', icon: Baby },
  { id: 'atendimento_domiciliar', label: 'Atendimento domiciliar', icon: Home },
  { id: 'parcelamento', label: 'Parcelamento', icon: CreditCard },
  { id: 'pix', label: 'Pix', icon: QrCode },
  { id: 'convenios', label: 'Convênios', icon: Handshake },
  { id: 'ambiente_climatizado', label: 'Ambiente climatizado', icon: Snowflake },
  { id: 'aceita_pets', label: 'Pet friendly', icon: PawPrint },
  { id: 'cafe_lounge', label: 'Café / lounge', icon: Coffee },
  { id: 'telemedicina', label: 'Telemedicina', icon: Video },
  { id: 'atendimento_noturno', label: 'Atendimento noturno', icon: Moon },
  { id: 'emergencia', label: 'Emergência', icon: Siren },
  { id: 'equipamentos_premium', label: 'Equipamentos premium', icon: Gem },
  { id: 'certificacoes', label: 'Certificações', icon: BadgeCheck },
  { id: 'multilingue', label: 'Atendimento multilíngue', icon: Languages },
  { id: 'area_recuperacao', label: 'Área de recuperação', icon: Bed },
  // Extras que já existiam
  { id: 'lounge', label: 'Lounge', icon: Sofa },
  { id: 'lounge_bar', label: 'Lounge Bar', icon: Wine },
  { id: 'musica_ambiente', label: 'Música Ambiente', icon: Music },
  { id: 'seguranca_24h', label: 'Segurança 24h', icon: Shield },
];

// Categorias de busca
const SEARCH_CATEGORIES = [
  { value: 'produto', label: 'Produto', icon: Package, description: 'Cosméticos, dermocosméticos, equipamentos' },
  { value: 'servico', label: 'Serviço', icon: Scissors, description: 'Tratamentos, massagens, procedimentos' },
  { value: 'local', label: 'Local', icon: Building, description: 'Clínicas, spas, salões de beleza' },
  { value: 'procedimento', label: 'Procedimento', icon: Wrench, description: 'Botox, preenchimento, laser, etc.' },
];

// Dias da semana
const WEEKDAYS = [
  { value: 'domingo', label: 'Domingo' },
  { value: 'segunda', label: 'Segunda-feira' },
  { value: 'terca', label: 'Terça-feira' },
  { value: 'quarta', label: 'Quarta-feira' },
  { value: 'quinta', label: 'Quinta-feira' },
  { value: 'sexta', label: 'Sexta-feira' },
  { value: 'sabado', label: 'Sábado' },
];

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const queryClient = useQueryClient();
  const [userProfile, setUserProfile] = useState(null);
  const [clubDialogOpen, setClubDialogOpen] = useState(false);
  
  // Search States
  const [searchCategory, setSearchCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [dateMode, setDateMode] = useState('calendar'); // 'calendar' or 'weekday'
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedWeekdays, setSelectedWeekdays] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [professionalType, setProfessionalType] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [locationInput, setLocationInput] = useState({ city: '', state: '' });
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  const getDateLocale = () => {
    const lang = getCurrentLanguage();
    const locales = {
      'pt-BR': ptBR, 'pt-PT': ptBR, 'en': enUS, 'es': es, 
      'fr': fr, 'de': de, 'it': it, 'ja': ja, 'zh': zhCN, 'ru': ru, 'ar': arSA
    };
    return locales[lang] || ptBR;
  };

  // Fetch Profile for Access Control
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const user = await base44.auth.me();
        const res = await base44.entities.UserProfile.list({ query: { user_email: user.email }});
        setUserProfile(res?.data?.[0]);
      } catch (e) {
        console.log('User not logged in');
      }
    };
    loadProfile();
  }, []);
  
  // Utils
  const getWeekDays = (date) => {
    const start = startOfWeek(date, { weekStartsOn: 0 });
    return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
  };

  const weekDays = getWeekDays(currentDate);
  const nextWeek = () => setCurrentDate(addDays(currentDate, 7));
  const prevWeek = () => setCurrentDate(addDays(currentDate, -7));

  // Fetch Appointments
  const { data: events = [] } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const res = await base44.entities.Appointment.list({ limit: 100 });
      return res.data.map(evt => ({
        ...evt,
        start: new Date(evt.start_time),
        end: new Date(evt.end_time),
      }));
    }
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Appointment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['appointments']);
    }
  });

  // Mock Integrations State
  const [integrations, setIntegrations] = useState({ google: false, outlook: false });
  const [isSyncing, setIsSyncing] = useState(false);

  const handleConnect = (type) => {
    setIsSyncing(true);
    setTimeout(() => {
      setIntegrations(prev => ({ ...prev, [type]: !prev[type] }));
      setIsSyncing(false);
      alert(`${type === 'google' ? 'Google Calendar' : 'Outlook'} ${!integrations[type] ? 'conectado e sincronizado' : 'desconectado'} com sucesso!`);
      if (!integrations[type]) {
         createMutation.mutate({
            title: "Feriado Nacional (Importado)",
            type: 'consultation',
            modality: 'in_person',
            start_time: addDays(startOfDay(new Date()), 2).toISOString(),
            end_time: addDays(startOfDay(new Date()), 2).toISOString(),
            patient_email: 'system',
            professional_email: userProfile?.user_email,
            status: 'scheduled'
         });
      }
    }, 1500);
  };

  // Professional: AI Availability Setup
  const [aiPrompt, setAiPrompt] = useState('');
  const aiAvailabilityMutation = useMutation({
    mutationFn: async () => {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `O profissional médico informou sua disponibilidade: "${aiPrompt}". 
        Data de referência: ${new Date().toISOString()}.
        Gere uma lista JSON de objetos de disponibilidade para os próximos 7 dias.
        Exemplo: [{"title": "Disponível - Consulta", "start": "ISO_DATE", "end": "ISO_DATE", "type": "consultation"}]`,
        response_json_schema: {
          type: "object",
          properties: {
            slots: { 
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: {type: "string"},
                  start: {type: "string"},
                  end: {type: "string"},
                  type: {type: "string"}
                }
              }
            }
          }
        }
      });
      return res.slots;
    },
    onSuccess: (slots) => {
      slots.forEach(slot => {
        createMutation.mutate({
          title: slot.title,
          type: slot.type,
          modality: 'in_person',
          start_time: slot.start,
          end_time: slot.end,
          patient_email: 'available_slot',
          professional_email: userProfile?.user_email,
          location_details: userProfile?.service_address?.street || 'Consultório',
          status: 'scheduled'
        });
      });
      setAiPrompt('');
      alert('Agenda configurada com sucesso pela IA!');
    }
  });

  const getEventsForDay = (day) => {
    return events.filter(evt => isSameDay(evt.start, day));
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'surgery': return 'bg-red-100 text-red-800 border-red-200';
      case 'exam': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'procedure': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'consultation': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  // AI Search Handler
  const handleSearchChange = async (value) => {
    setSearchQuery(value);
    if (value.length > 2 && searchCategory) {
      setIsLoadingSuggestions(true);
      try {
        const categoryLabel = SEARCH_CATEGORIES.find(c => c.value === searchCategory)?.label || '';
        const res = await base44.integrations.Core.InvokeLLM({
          prompt: `O usuário está buscando por "${value}" na categoria "${categoryLabel}" no ramo de estética e beleza. 
          Liste 6 sugestões relevantes com nome e descrição curta. 
          Se for produto: liste produtos cosméticos ou equipamentos.
          Se for serviço: liste tratamentos e serviços estéticos.
          Se for local: liste tipos de estabelecimentos.
          Se for procedimento: liste procedimentos estéticos específicos.
          Retorne JSON com nome e descrição.`,
          response_json_schema: {
            type: "object",
            properties: {
              suggestions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    description: { type: "string" }
                  }
                }
              }
            }
          }
        });
        setAiSuggestions(res.suggestions || []);
      } catch (e) {
        console.error('Erro ao buscar sugestões:', e);
        setAiSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    } else {
      setAiSuggestions([]);
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocalização não suportada.");
      return;
    }
    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await response.json();
        if (data && data.address) {
          setLocationInput({
            city: data.address.city || data.address.town || '',
            state: data.address.state || '',
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingLocation(false);
      }
    }, () => {
      setIsLoadingLocation(false);
      alert("Não foi possível obter sua localização.");
    });
  };

  const toggleWeekday = (day) => {
    setSelectedWeekdays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const toggleAmenity = (amenityId) => {
    setSelectedAmenities(prev => 
      prev.includes(amenityId) 
        ? prev.filter(a => a !== amenityId)
        : [...prev, amenityId]
    );
  };

  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      alert('Funcionalidade de busca em desenvolvimento. Em breve você poderá encontrar os melhores profissionais e estabelecimentos!');
    }, 1500);
  };

  // Render for Professional (Availability Manager)
  if (userProfile?.type === 'professional') {
    return (
      <div className="h-[calc(100vh-8rem)] flex flex-col space-y-6">
        <ClubRegistration open={clubDialogOpen} onOpenChange={setClubDialogOpen} />
        
        <div className="flex justify-between items-start">
           <div>
             <T as="h1" className="text-2xl font-bold text-[#2D2416]">Gestão de Agenda</T>
             <T as="p" className="text-[#6B5D4F]">Configure seus horários e disponibilidades.</T>
           </div>
           <div className="flex gap-3">
              <Button 
               onClick={() => setClubDialogOpen(true)}
               variant="outline"
               className="bg-gradient-to-r from-[#D4A574] to-[#8B6F47] text-white border-0 hover:opacity-90 font-bold shadow-lg"
              >
               <Globe className="w-4 h-4 mr-2" />
               <T>Club da Beleza</T>
              </Button>
              <div className="bg-[#FFF9F0] p-2 rounded border border-[#D4A574]/30 text-sm text-[#6B5D4F] max-w-md">
               <T as="span" className="font-bold">Local:</T> {userProfile?.service_address?.street || <T>Não definido</T>}
              </div>
           </div>
        </div>

        {/* Integrations Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <Card className="bg-[#FEFBF7] border-[#E8DCC8]">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                 <div>
                   <T as="h3" className="font-bold text-[#2D2416] mb-2 flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5 text-[#D4A574]" /> Integrações de Calendário
                   </T>
                   <T as="p" className="text-sm text-[#6B5D4F] mb-4">Conecte suas agendas externas para sincronizar feriados, aniversários e compromissos automaticamente.</T>
                 </div>
                 <div className="flex gap-3">
                    <Button 
                      variant="outline"
                      className={`flex-1 border-[#D4A574]/30 text-[#6B5D4F] hover:bg-[#FFF9F0] ${integrations.google ? 'bg-green-50 text-green-700 border-green-200' : ''}`}
                      onClick={() => handleConnect('google')}
                      disabled={isSyncing}
                    >
                       <ExternalLink className="w-4 h-4 mr-2" />
                       {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : (integrations.google ? <T>✓ Conectado</T> : <T>Conectar Google Agenda</T>)}
                    </Button>
                    <Button 
                      variant="outline"
                      className={`flex-1 border-[#D4A574]/30 text-[#6B5D4F] hover:bg-[#FFF9F0] ${integrations.outlook ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}`}
                      onClick={() => handleConnect('outlook')}
                      disabled={isSyncing}
                    >
                       <ExternalLink className="w-4 h-4 mr-2" />
                       {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : (integrations.outlook ? <T>✓ Conectado</T> : <T>Conectar Outlook</T>)}
                    </Button>
                 </div>
              </CardContent>
           </Card>

           <Card className="bg-gradient-to-r from-[#FFF9F0] to-[#F5F1E8] border-[#D4A574]/30">
             <CardContent className="p-6">
               <div className="flex gap-4 items-start">
                 <div className="bg-white p-3 rounded-full shadow-sm text-[#D4A574]">
                   <Sparkles className="w-6 h-6" />
                 </div>
                 <div className="flex-1 space-y-3">
                   <T as="h3" className="font-semibold text-lg text-[#2D2416]">Assistente de Agenda Inteligente</T>
                   <T as="p" className="text-sm text-[#6B5D4F]">
                     Diga-me quais dias e horários você atende e para quais procedimentos. Eu organizarei sua grade automaticamente com as cores corretas.
                   </T>
                   <div className="flex gap-2">
                     <Input 
                       placeholder="Ex: Atendo consultas segunda e quarta das 08h às 12h..." 
                       value={aiPrompt}
                       onChange={(e) => setAiPrompt(e.target.value)}
                       className="bg-white border-[#E8DCC8]"
                     />
                     <Button 
                       onClick={() => aiAvailabilityMutation.mutate()} 
                       disabled={!aiPrompt || aiAvailabilityMutation.isPending}
                       className="bg-[#D4A574] hover:bg-[#C49565] text-white"
                     >
                       {aiAvailabilityMutation.isPending ? <T>Configurando...</T> : <T>Gerar Agenda</T>}
                     </Button>
                   </div>
                 </div>
               </div>
             </CardContent>
           </Card>
        </div>

        <div className="flex-1 bg-[#FEFBF7] rounded-xl shadow-sm border border-[#E8DCC8] p-4 flex flex-col">
           <div className="flex items-center justify-between mb-4">
              <T as="h3" className="font-semibold text-[#2D2416]">Sua Grade Semanal</T>
              <div className="flex items-center bg-white border border-[#E8DCC8] rounded-lg p-1">
                <Button variant="ghost" size="icon" onClick={prevWeek}><ChevronLeft className="w-4 h-4" /></Button>
                <span className="px-4 font-medium text-sm min-w-[120px] text-center capitalize text-[#6B5D4F]">
                  {format(currentDate, "MMMM yyyy", { locale: getDateLocale() })}
                </span>
                <Button variant="ghost" size="icon" onClick={nextWeek}><ChevronRight className="w-4 h-4" /></Button>
              </div>
           </div>
           
           <div className="flex-1 overflow-x-auto">
              <div className="grid grid-cols-7 gap-4 min-w-[800px] h-full">
                {weekDays.map((day, i) => {
                  const dayEvents = getEventsForDay(day);
                  return (
                    <div key={i} className="flex flex-col h-full border-r border-[#E8DCC8] last:border-0 pr-2">
                      <div className="text-center py-2 mb-2">
                           <div className="text-xs font-bold text-[#6B5D4F] uppercase">{format(day, 'EEE', { locale: getDateLocale() })}</div>
                           <div className="text-lg font-bold text-[#2D2416]">{format(day, 'dd')}</div>
                      </div>
                      <div className="space-y-2">
                        {dayEvents.map(evt => (
                          <div key={evt.id} className={`p-2 rounded text-xs border ${getTypeColor(evt.type)}`}>
                            <div className="font-bold">{evt.title}</div>
                            <div>{format(evt.start, 'HH:mm')} - {format(evt.end, 'HH:mm')}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
           </div>
        </div>
      </div>
    );
  }

  // Patient/User Search Interface
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#D4A574] to-[#B8935C] rounded-xl md:rounded-2xl p-4 sm:p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <Search className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" />
            <T as="h1" className="text-xl sm:text-2xl md:text-3xl font-light tracking-wide">Pesquisa Detalhada</T>
          </div>
          <T as="p" className="text-white/90 max-w-2xl font-light text-sm sm:text-base">
            Encontre os melhores profissionais, clínicas, produtos e procedimentos estéticos. 
            Nossa IA ajuda você a encontrar exatamente o que precisa com filtros avançados.
          </T>
          <div className="mt-3 sm:mt-4 flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 w-fit">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <T as="span" className="text-xs sm:text-sm font-light">
              Esta pesquisa é realizada no Mapa da Estética - nossa plataforma de busca especializada
            </T>
          </div>
        </div>
        <div className="absolute -bottom-10 -right-10 w-24 sm:w-40 h-24 sm:h-40 bg-white/10 rounded-full"></div>
        <div className="absolute -top-5 -right-20 w-20 sm:w-32 h-20 sm:h-32 bg-white/5 rounded-full"></div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card className="bg-[#FFF9F0] border-[#D4A574]/20">
          <CardContent className="p-3 sm:p-4 flex items-start gap-3">
            <div className="bg-[#D4A574]/20 p-2 rounded-full flex-shrink-0">
              <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4A574]" />
            </div>
            <div className="min-w-0">
              <T as="h4" className="font-semibold text-[#2D2416] text-xs sm:text-sm">Como Funciona</T>
              <T as="p" className="text-xs text-[#6B5D4F] line-clamp-2">Selecione uma categoria, descreva o que procura e deixe nossa IA sugerir as melhores opções.</T>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#FFF9F0] border-[#D4A574]/20">
          <CardContent className="p-3 sm:p-4 flex items-start gap-3">
            <div className="bg-[#D4A574]/20 p-2 rounded-full flex-shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4A574]" />
            </div>
            <div className="min-w-0">
              <T as="h4" className="font-semibold text-[#2D2416] text-xs sm:text-sm">Profissionais Verificados</T>
              <T as="p" className="text-xs text-[#6B5D4F] line-clamp-2">Filtre apenas profissionais com selo de qualidade Clube da Beleza.</T>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#FFF9F0] border-[#D4A574]/20 sm:col-span-2 lg:col-span-1">
          <CardContent className="p-3 sm:p-4 flex items-start gap-3">
            <div className="bg-[#D4A574]/20 p-2 rounded-full flex-shrink-0">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4A574]" />
            </div>
            <div className="min-w-0">
              <T as="h4" className="font-semibold text-[#2D2416] text-xs sm:text-sm">Avaliações Reais</T>
              <T as="p" className="text-xs text-[#6B5D4F] line-clamp-2">Veja avaliações e comentários de outros usuários da plataforma.</T>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Search Form */}
      <Card className="bg-[#FEFBF7] border-[#E8DCC8] shadow-lg">
        <CardHeader className="border-b border-[#E8DCC8]">
          <CardTitle className="flex items-center gap-2 text-[#2D2416]">
            <Sparkles className="w-5 h-5 text-[#D4A574]" />
            <T>Busca Inteligente com IA</T>
          </CardTitle>
          <CardDescription className="text-[#6B5D4F]">
            <T>Preencha os campos abaixo para encontrar o que você precisa</T>
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          
          {/* Category Selection */}
          <div className="space-y-3">
            <T as={Label} className="text-[#2D2416] font-semibold text-sm sm:text-base">O que você está procurando?</T>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
              {SEARCH_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSearchCategory(cat.value)}
                  className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all text-left ${
                    searchCategory === cat.value 
                      ? 'border-[#D4A574] bg-[#FFF9F0] shadow-md' 
                      : 'border-[#E8DCC8] bg-white hover:border-[#D4A574]/50'
                  }`}
                >
                  <cat.icon className={`w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-2 ${searchCategory === cat.value ? 'text-[#D4A574]' : 'text-[#6B5D4F]'}`} />
                  <T as="p" className="font-semibold text-xs sm:text-sm text-[#2D2416]">{cat.label}</T>
                  <T as="p" className="text-xs text-[#6B5D4F] mt-1 hidden sm:block">{cat.description}</T>
                </button>
              ))}
            </div>
          </div>

          {/* AI Search Input */}
          {searchCategory && (
            <div className="space-y-3">
              <T as={Label} className="text-[#2D2416] font-semibold">Descreva o que você precisa</T>
              <div className="relative">
                <Input 
                  placeholder="Ex: Botox, Limpeza de pele, Clínica com estacionamento..." 
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="bg-white border-[#E8DCC8] h-12 text-base pr-10"
                />
                {isLoadingSuggestions && (
                  <Loader2 className="absolute right-3 top-4 w-5 h-5 animate-spin text-[#D4A574]" />
                )}
                {aiSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-[#E8DCC8] rounded-xl shadow-lg mt-2 z-50 max-h-60 overflow-y-auto">
                    {aiSuggestions.map((sug, i) => (
                      <div 
                        key={i}
                        className="p-4 hover:bg-[#FFF9F0] cursor-pointer border-b border-[#E8DCC8] last:border-0 transition-colors"
                        onClick={() => {
                          setSearchQuery(sug.name);
                          setAiSuggestions([]);
                        }}
                      >
                        <div className="font-medium text-[#2D2416]">{sug.name}</div>
                        <div className="text-xs text-[#6B5D4F] mt-1">{sug.description}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-[#6B5D4F]">
                <Sparkles className="w-3 h-3 text-[#D4A574]" />
                <T>A IA irá sugerir opções enquanto você digita</T>
              </div>
            </div>
          )}

          {/* Date Selection */}
          <div className="space-y-3">
            <T as={Label} className="text-[#2D2416] font-semibold flex items-center gap-2 text-sm sm:text-base">
              <Clock className="w-4 h-4 text-[#D4A574]" />
              Quando?
            </T>
            <Tabs value={dateMode} onValueChange={setDateMode} className="w-full">
              <TabsList className="grid w-full grid-cols-2 max-w-full sm:max-w-md bg-[#F5F1E8]">
                <TabsTrigger value="calendar" className="data-[state=active]:bg-[#D4A574] data-[state=active]:text-white text-xs sm:text-sm">
                  <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> <T>Data Específica</T>
                </TabsTrigger>
                <TabsTrigger value="weekday" className="data-[state=active]:bg-[#D4A574] data-[state=active]:text-white text-xs sm:text-sm">
                  <T>Dia da Semana</T>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="calendar" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <T as={Label}>Data</T>
                    <Input 
                      type="date" 
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="bg-white border-[#E8DCC8]"
                    />
                  </div>
                  <div className="space-y-2">
                    <T as={Label}>Horário Preferido</T>
                    <Select value={selectedTime} onValueChange={setSelectedTime}>
                      <SelectTrigger className="bg-white border-[#E8DCC8]">
                        <SelectValue placeholder="Selecione o horário" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manha">Manhã (08h - 12h)</SelectItem>
                        <SelectItem value="tarde">Tarde (12h - 18h)</SelectItem>
                        <SelectItem value="noite">Noite (18h - 22h)</SelectItem>
                        <SelectItem value="qualquer">Qualquer horário</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="weekday" className="mt-4 space-y-4">
                <div className="space-y-3">
                  <T as="p" className="text-xs sm:text-sm text-[#6B5D4F]">Selecione os dias da semana de sua preferência:</T>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {WEEKDAYS.map((day) => (
                      <button
                        key={day.value}
                        onClick={() => toggleWeekday(day.value)}
                        className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                          selectedWeekdays.includes(day.value)
                            ? 'bg-[#D4A574] text-white shadow-md'
                            : 'bg-white border border-[#E8DCC8] text-[#6B5D4F] hover:border-[#D4A574]'
                        }`}
                      >
                        <T>{day.label}</T>
                      </button>
                    ))}
                  </div>
                </div>
                {selectedWeekdays.length > 0 && (
                  <div className="space-y-2">
                    <T as={Label}>Horário Preferido</T>
                    <Select value={selectedTime} onValueChange={setSelectedTime}>
                      <SelectTrigger className="bg-white border-[#E8DCC8]">
                        <SelectValue placeholder="Selecione o horário" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manha">Manhã (08h - 12h)</SelectItem>
                        <SelectItem value="tarde">Tarde (12h - 18h)</SelectItem>
                        <SelectItem value="noite">Noite (18h - 22h)</SelectItem>
                        <SelectItem value="qualquer">Qualquer horário</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Professional Type */}
          <div className="space-y-3">
            <T as={Label} className="text-[#2D2416] font-semibold">Tipo de Profissional</T>
            <Select value={professionalType} onValueChange={setProfessionalType}>
              <SelectTrigger className="bg-white border-[#E8DCC8]">
                <SelectValue placeholder="Selecione o tipo de profissional" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {PROFESSIONAL_TYPES.map((prof) => (
                  <SelectItem key={prof.value} value={prof.value}>
                    {prof.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <T as={Label} className="text-[#2D2416] font-semibold flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#D4A574]" />
                Localização
              </T>
              <Button 
                type="button"
                variant="outline"
                size="sm"
                onClick={handleUseMyLocation}
                disabled={isLoadingLocation}
                className="text-xs border-[#D4A574]/30 text-[#D4A574] hover:bg-[#FFF9F0]"
              >
                {isLoadingLocation ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-2" />
                ) : (
                  <Navigation className="w-3 h-3 mr-2" />
                )}
                <T>Usar minha localização</T>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input 
                placeholder="Cidade" 
                value={locationInput.city}
                onChange={(e) => setLocationInput({...locationInput, city: e.target.value})}
                className="bg-white border-[#E8DCC8]"
              />
              <Input 
                placeholder="Estado" 
                value={locationInput.state}
                onChange={(e) => setLocationInput({...locationInput, state: e.target.value})}
                className="bg-white border-[#E8DCC8]"
              />
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-3">
            <T as={Label} className="text-[#2D2416] font-semibold flex items-center gap-2 text-sm sm:text-base">
              <DollarSign className="w-4 h-4 text-[#D4A574]" />
              Faixa de Preço Média
            </T>
            <RadioGroup value={priceRange} onValueChange={setPriceRange} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {PRICE_RANGES.map((range) => (
                <div 
                  key={range.value}
                  className={`flex items-center space-x-2 sm:space-x-3 p-2.5 sm:p-3 rounded-lg border transition-all cursor-pointer ${
                    priceRange === range.value 
                      ? 'border-[#D4A574] bg-[#FFF9F0]' 
                      : 'border-[#E8DCC8] bg-white hover:border-[#D4A574]/50'
                  }`}
                  onClick={() => setPriceRange(range.value)}
                >
                  <RadioGroupItem value={range.value} id={`price-${range.value}`} />
                  <Label htmlFor={`price-${range.value}`} className="flex-1 cursor-pointer">
                    <span className="font-semibold text-[#2D2416] text-xs sm:text-sm">{range.label}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Amenities */}
          <div className="space-y-3">
            <T as={Label} className="text-[#2D2416] font-semibold text-sm sm:text-base">Amenidades do Estabelecimento (Opcional)</T>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
              {AMENITIES.map((amenity) => (
                <div 
                  key={amenity.id}
                  className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedAmenities.includes(amenity.id)
                      ? 'border-[#D4A574] bg-[#FFF9F0]'
                      : 'border-[#E8DCC8] bg-white hover:border-[#D4A574]/50'
                  }`}
                  onClick={() => toggleAmenity(amenity.id)}
                >
                  <Checkbox 
                    checked={selectedAmenities.includes(amenity.id)}
                    onCheckedChange={() => toggleAmenity(amenity.id)}
                    className="flex-shrink-0"
                  />
                  <amenity.icon className={`w-4 h-4 flex-shrink-0 ${selectedAmenities.includes(amenity.id) ? 'text-[#D4A574]' : 'text-[#6B5D4F]'}`} />
                  <T as="span" className="text-xs sm:text-sm text-[#2D2416] truncate">{amenity.label}</T>
                </div>
              ))}
            </div>
          </div>

          {/* Verified Only */}
          <div 
            className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl border cursor-pointer transition-all ${
              verifiedOnly 
                ? 'border-[#D4A574] bg-[#FFF9F0]' 
                : 'border-[#E8DCC8] bg-white hover:border-[#D4A574]/50'
            }`}
            onClick={() => setVerifiedOnly(!verifiedOnly)}
          >
            <Checkbox 
              checked={verifiedOnly}
              onCheckedChange={setVerifiedOnly}
              className="flex-shrink-0"
            />
            <BadgeCheck className={`w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 ${verifiedOnly ? 'text-[#D4A574]' : 'text-[#6B5D4F]'}`} />
            <div className="flex-1 min-w-0">
              <T as="p" className="font-semibold text-[#2D2416] text-sm sm:text-base">Apenas Profissionais Verificados</T>
              <T as="p" className="text-xs text-[#6B5D4F] line-clamp-1">Mostrar apenas profissionais com Selo de Qualidade Clube da Beleza</T>
            </div>
          </div>

          {/* Search Button */}
          <Button 
            className="w-full h-12 sm:h-14 bg-[#D4A574] hover:bg-[#C49565] text-white text-base sm:text-lg font-semibold shadow-lg"
            onClick={handleSearch}
            disabled={isSearching}
          >
            {isSearching ? (
              <>
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                <T>Buscando...</T>
              </>
            ) : (
              <>
                <Search className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <T>Pesquisar</T>
              </>
            )}
          </Button>
        </CardContent>
      </Card>

    </div>
  );
}