import React from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { BadgeCheck, FileCheck, ShieldCheck, Bot, RefreshCw, IdCard } from 'lucide-react';
import T from '@/components/TranslatedText';

export default function VerifiedInfoModal({ open, onOpenChange }) {
  const criteria = [
    { icon: FileCheck, title: 'Documentação profissional validada', desc: 'Diplomas, certificados e comprovantes revisados.' },
    { icon: IdCard, title: 'Identidade confirmada', desc: 'Validação de identidade com múltiplas camadas.' },
    { icon: ShieldCheck, title: 'Registro profissional ativo', desc: 'Consulta a conselhos e bases oficiais.' },
    { icon: Bot, title: 'Validação manual e por IA', desc: 'Checagens automatizadas somadas à revisão humana.' },
    { icon: RefreshCw, title: 'Auditoria periódica', desc: 'Revalidação recorrente para manter o selo atualizado.' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#2D2416]">
            <BadgeCheck className="w-5 h-5 text-[#D4A574]" />
            <T>O que é um Profissional Verificado?</T>
          </DialogTitle>
          <DialogDescription className="text-[#6B5D4F]">
            <T>Transparência total sobre os critérios e o processo de verificação na plataforma.</T>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {criteria.map((c, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[#FEFBF7] border border-[#D4A574]/20">
              <c.icon className="w-5 h-5 text-[#D4A574] flex-shrink-0 mt-0.5" />
              <div>
                <T as="h4" className="font-semibold text-[#2D2416] text-sm">{c.title}</T>
                <T as="p" className="text-xs text-[#6B5D4F]">{c.desc}</T>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-xs text-[#6B5D4F]">
          <T>
            Importante: nenhum selo substitui a consulta médica adequada. Ele indica maior confiabilidade
            com base em critérios objetivos e revisões contínuas.
          </T>
          <div className="mt-3 text-right">
            <a href="/verifiedprofessionals" className="text-sm text-[#D4A574] hover:underline"><T>Ver página de transparência</T></a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}