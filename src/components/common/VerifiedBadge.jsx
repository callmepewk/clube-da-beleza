import React from 'react';
import { BadgeCheck } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import T from '@/components/TranslatedText';

export default function VerifiedBadge({ size = 16, className = '', contentPlacement = 'top' }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`inline-flex items-center gap-1 cursor-help ${className}`}>
            <BadgeCheck className="text-[#D4A574]" style={{ width: size, height: size }} />
            <span className="text-xs text-[#2D2416]">
              <T>Verificado</T>
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side={contentPlacement} className="max-w-xs">
          <T>
            Profissional Verificado: documentação validada, identidade confirmada, registro ativo, checagens por IA e auditorias periódicas.
          </T>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}