import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import T from '@/components/TranslatedText';
import ImageWithFallback from '@/components/common/ImageWithFallback';

export default function ProductCard({ product, onEdit, isAdmin }) {
  return (
    <Card className="bg-[#FEFBF7] border-[#D4A574]/20 hover:shadow-lg transition-all">
      <CardContent className="p-4 flex flex-col gap-3">
        <div className="aspect-[16/9] w-full overflow-hidden rounded-xl bg-[#FFF9F0] border border-[#D4A574]/20">
          <ImageWithFallback src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
        </div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <T as="h3" className="text-lg font-semibold text-[#2D2416]">{product.title}</T>
            {product.description && (
              <T as="p" className="text-sm text-[#6B5D4F] line-clamp-3">{product.description}</T>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Button asChild className="bg-[#D4A574] hover:bg-[#C49565] text-white">
            <a href={product.link_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" /> <T>Acessar</T>
            </a>
          </Button>
          {isAdmin && (
            <Button variant="outline" onClick={() => onEdit(product)} className="border-[#D4A574]/30 text-[#6B5D4F] hover:bg-[#FFF9F0]">
              <T>Editar</T>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}