import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowUpCircle, AlertTriangle, Crown, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import T from '@/components/TranslatedText';

export default function UsageLimitBanner({ 
  currentUsage, 
  limit, 
  resourceName, 
  planName = 'free',
  isUnlimited = false 
}) {
  const navigate = useNavigate();
  
  if (isUnlimited) {
    return (
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-full">
              <Crown className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <T as="p" className="font-bold text-purple-900">Plano {planName}</T>
              <p className="text-sm text-purple-600"><T>{resourceName}</T>: <T>Ilimitado</T> ✨</p>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  const percentage = (currentUsage / limit) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = currentUsage >= limit;

  return (
    <Card className={`p-4 mb-6 border-2 ${
      isAtLimit 
        ? 'bg-red-50 border-red-300' 
        : isNearLimit 
          ? 'bg-orange-50 border-orange-300' 
          : 'bg-blue-50 border-blue-300'
    }`}>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {isAtLimit && <AlertTriangle className="w-5 h-5 text-red-600" />}
            <p className="font-bold text-sm text-slate-700">
              <T>{resourceName}</T> - <T>Plano</T> {planName}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-slate-200 h-3 rounded-full overflow-hidden max-w-xs">
              <div 
                className={`h-full transition-all ${
                  isAtLimit 
                    ? 'bg-red-500' 
                    : isNearLimit 
                      ? 'bg-orange-500' 
                      : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
            <span className="text-sm font-bold text-slate-700 whitespace-nowrap">
              {currentUsage} / {limit}
            </span>
          </div>
          {isAtLimit && (
            <T as="p" className="text-xs text-red-600 mt-2 font-semibold">
              ⚠️ Limite atingido! Faça upgrade para continuar usando.
            </T>
          )}
        </div>
        
        <Button
          onClick={() => navigate(createPageUrl('Plans'))}
          className={`whitespace-nowrap ${
            isAtLimit 
              ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
          } text-white font-bold shadow-lg`}
        >
          {isAtLimit ? (
            <>
              <Zap className="w-4 h-4 mr-2" />
              <T>Fazer Upgrade Agora</T>
            </>
          ) : (
            <>
              <ArrowUpCircle className="w-4 h-4 mr-2" />
              <T>Ver Planos</T>
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}