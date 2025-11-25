import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Eye, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import T from '@/components/TranslatedText';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function HistoryPanel({ type, title, promptLabel = "Prompt" }) {
  const queryClient = useQueryClient();
  const [selectedItem, setSelectedItem] = React.useState(null);

  const { data: history, isLoading } = useQuery({
    queryKey: ['chatHistory', type],
    queryFn: async () => {
      const user = await base44.auth.me();
      if (!user) return [];
      const res = await base44.entities.ChatHistory.filter(
        { user_email: user.email, type },
        '-created_date',
        50
      );
      return res || [];
    }
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id) => {
      await base44.entities.ChatHistory.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['chatHistory', type]);
    }
  });

  const deleteAllMutation = useMutation({
    mutationFn: async () => {
      if (!history) return;
      for (const item of history) {
        await base44.entities.ChatHistory.delete(item.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['chatHistory', type]);
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-[#D4A574]" />
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="text-center py-12 text-[#6B5D4F]">
        <Clock className="w-12 h-12 mx-auto mb-4 opacity-30" />
        <T as="p" className="font-light">Nenhum histórico encontrado</T>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Delete All */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-light text-[#2D2416]">
          <T>{title}</T> ({history.length})
        </h3>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50">
              <Trash2 className="w-4 h-4 mr-2" />
              <T>Limpar Tudo</T>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle><T>Confirmar exclusão</T></AlertDialogTitle>
              <AlertDialogDescription>
                <T>Tem certeza que deseja excluir todo o histórico? Esta ação não pode ser desfeita.</T>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel><T>Cancelar</T></AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => deleteAllMutation.mutate()}
                className="bg-red-600 hover:bg-red-700"
              >
                <T>Excluir Tudo</T>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* History List */}
      <ScrollArea className="h-[400px]">
        <div className="space-y-3">
          {history.map((item) => (
            <Card key={item.id} className="bg-[#FEFBF7] border-[#D4A574]/20 hover:shadow-md transition-all">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-[#2D2416] truncate">
                      {item.title || 'Sem título'}
                    </h4>
                    <p className="text-sm text-[#6B5D4F] line-clamp-2 mt-1">
                      {item.prompt || item.response_preview || 'Sem conteúdo'}
                    </p>
                    <p className="text-xs text-[#A0937D] mt-2">
                      {format(new Date(item.created_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-[#D4A574] hover:bg-[#FFF9F0]"
                          onClick={() => setSelectedItem(item)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-[#2D2416]">
                            {item.title || 'Detalhes'}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                          <div>
                            <p className="text-sm font-medium text-[#6B5D4F] mb-1">{promptLabel}:</p>
                            <div className="bg-[#F5F1E8] p-4 rounded-xl text-[#2D2416] text-sm whitespace-pre-wrap">
                              {item.prompt || 'N/A'}
                            </div>
                          </div>
                          {item.response_preview && (
                            <div>
                              <p className="text-sm font-medium text-[#6B5D4F] mb-1"><T>Resultado</T>:</p>
                              <div className="bg-[#F5F1E8] p-4 rounded-xl text-[#2D2416] text-sm whitespace-pre-wrap">
                                {item.response_preview}
                              </div>
                            </div>
                          )}
                          {item.messages && item.messages.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-[#6B5D4F] mb-1"><T>Conversa</T>:</p>
                              <div className="space-y-2 max-h-60 overflow-y-auto">
                                {item.messages.map((msg, idx) => (
                                  <div 
                                    key={idx} 
                                    className={`p-3 rounded-xl text-sm ${
                                      msg.role === 'user' 
                                        ? 'bg-[#D4A574] text-white ml-8' 
                                        : 'bg-[#F5F1E8] text-[#2D2416] mr-8'
                                    }`}
                                  >
                                    {msg.content}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {item.full_data && (
                            <div>
                              <p className="text-sm font-medium text-[#6B5D4F] mb-1"><T>Dados Completos</T>:</p>
                              <pre className="bg-[#F5F1E8] p-4 rounded-xl text-xs overflow-x-auto text-[#2D2416]">
                                {JSON.stringify(item.full_data, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle><T>Excluir item</T></AlertDialogTitle>
                          <AlertDialogDescription>
                            <T>Tem certeza que deseja excluir este item do histórico?</T>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel><T>Cancelar</T></AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteItemMutation.mutate(item.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            <T>Excluir</T>
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}