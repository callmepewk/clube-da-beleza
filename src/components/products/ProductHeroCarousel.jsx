import React from 'react';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import T from '@/components/TranslatedText';

export default function ProductHeroCarousel({ items = [] }) {
  if (!items?.length) return null;

  return (
    <div className="relative rounded-2xl overflow-hidden border border-[#D4A574]/20 shadow-[0_8px_30px_rgba(212,165,116,0.15)]">
      <Carousel className="w-full">
        <CarouselContent>
          {items.map((p, idx) => (
            <CarouselItem key={p.title + idx} className="basis-full">
              <div className="relative w-full aspect-[16/9] bg-[#FEFBF7]">
                <img
                  src={p.image_url}
                  alt={p.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading={idx < 2 ? 'eager' : 'lazy'}
                  fetchpriority={idx < 2 ? 'high' : 'auto'}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/50 via-black/20 to-transparent" />
                <div className="absolute inset-0 p-6 sm:p-10 flex items-end">
                  <div className="max-w-2xl text-white space-y-3">
                    <h2 className="text-2xl sm:text-4xl font-light tracking-wide drop-shadow">{p.title}</h2>
                    {p.description && (
                      <p className="text-white/90 font-light drop-shadow-sm line-clamp-3">{p.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {Array.isArray(p.features) && p.features.slice(0,3).map((f,i)=>(
                        <span key={i} className="px-3 py-1 rounded-full text-xs bg-white/20 backdrop-blur border border-white/30">{f}</span>
                      ))}
                    </div>
                    {p.link_url && (
                      <Button asChild className="mt-3 bg-[#D4A574] hover:bg-[#C49565] text-white">
                        <a href={p.link_url} target="_blank" rel="noopener noreferrer"><T>Acessar</T></a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-3" />
        <CarouselNext className="right-3" />
      </Carousel>
    </div>
  );
}