import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, HelpCircle, BookOpen, Loader2 } from 'lucide-react';

export default function SupportPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Olá! Sou o assistente virtual da HealthAI. Como posso ajudar você hoje?' }
  ]);
  const [input, setInput] = useState('');

  const chatMutation = useMutation({
    mutationFn: async (userMessage) => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `
          Você é um assistente de suporte da plataforma HealthAI.
          Responda de forma prestativa, educada e concisa.
          A plataforma HealthAI oferece: Agendamento de consultas, Enfermeira Virtual (IA), Criação de Sites, Chatbots e Design para profissionais de saúde.
          
          Pergunta do usuário: "${userMessage}"
        `,
      });
      return response;
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, { role: 'assistant', content: data }]);
    }
  });

  const handleSend = () => {
    if (!input.trim()) return;
    const msg = input;
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setInput('');
    chatMutation.mutate(msg);
  };

  const handleTutorial = () => {
    const msg = "Como usar o HealthAI? Me explique as funcionalidades.";
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    chatMutation.mutate(msg);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Central de Suporte</h1>
        <Button variant="outline" onClick={handleTutorial} className="bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100">
           <BookOpen className="w-4 h-4 mr-2" /> Tutorial Completo
        </Button>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden shadow-md border-slate-200">
        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
           <CardTitle className="text-lg flex items-center gap-2">
              <div className="bg-emerald-100 p-2 rounded-full"><Bot className="w-5 h-5 text-emerald-600" /></div>
              HealthAI Assistant
           </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-0 relative">
           <ScrollArea className="h-full p-4">
              <div className="space-y-4 pb-4">
                 {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                       <div className={`max-w-[80%] p-3 rounded-2xl shadow-sm ${
                          m.role === 'user' 
                             ? 'bg-indigo-600 text-white rounded-br-none' 
                             : 'bg-white border border-slate-100 text-slate-800 rounded-bl-none'
                       }`}>
                          {m.content}
                       </div>
                    </div>
                 ))}
                 {chatMutation.isPending && (
                    <div className="flex justify-start">
                       <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-bl-none flex items-center gap-2 text-slate-500 text-sm">
                          <Loader2 className="w-4 h-4 animate-spin" /> Digitando...
                       </div>
                    </div>
                 )}
              </div>
           </ScrollArea>
        </CardContent>
        <div className="p-4 bg-white border-t border-slate-100">
           <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex gap-2"
           >
              <Input 
                 placeholder="Digite sua dúvida aqui..." 
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 className="flex-1"
              />
              <Button type="submit" disabled={!input.trim() || chatMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700">
                 <Send className="w-4 h-4" />
              </Button>
           </form>
        </div>
      </Card>
    </div>
  );
}