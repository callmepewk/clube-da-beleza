import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Instagram, Facebook, Mail } from 'lucide-react';
import T from '@/components/TranslatedText';
import ImageWithFallback from '@/components/common/ImageWithFallback';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const navigationLinks = [
    { label: 'Início', path: 'Dashboard' },
    { label: 'Notícias', path: 'news' },
    { label: 'Agendamentos', path: 'schedule' },
    { label: 'Sobre Nós', path: 'about' }
  ];

  const toolsLinks = [
    { label: 'Enfermeira Virtual', path: 'nurse' },
    { label: 'Chatbots', path: 'chatbots' },
    { label: 'Sites', path: 'sites' },
    { label: 'Design', path: 'design' },
    { label: 'Produtos', path: 'products' }
  ];

  const communityLinks = [
    { label: 'Planos', path: 'plans' },
    { label: 'Suporte', path: 'support' }
  ];

  return (
    <footer className="bg-[#2D2416] text-[#E8DCC8] border-t border-[#D4A574]/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <ImageWithFallback 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691e6fc102be2b10ba4e6392/aee9cf465_clubeimg.jpeg" 
                alt="Clube da Beleza"
                className="h-12 w-12 rounded-full"
              />
              <div className="text-xl font-light tracking-wider text-[#D4A574]">
                Clube da<br/>Beleza
              </div>
            </div>
            <p className="text-sm font-light text-[#B8935C] leading-relaxed">
              O maior clube de benefícios em beleza e estética do Brasil. Transforme sua rotina de autocuidado.
            </p>
            <div className="flex gap-3">
              <a href="#" className="bg-[#3E3224] p-2 rounded-full hover:bg-[#D4A574] transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="bg-[#3E3224] p-2 rounded-full hover:bg-[#D4A574] transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="bg-[#3E3224] p-2 rounded-full hover:bg-[#D4A574] transition-colors">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <T as="h4" className="text-[#D4A574] font-light text-sm uppercase tracking-wider mb-4">Navegação</T>
            <ul className="space-y-2">
              {navigationLinks.map((link) => (
                <li key={link.path}>
                  <Link 
                    to={createPageUrl(link.path)} 
                    className="text-sm font-light hover:text-[#D4A574] transition-colors"
                  >
                    • {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tools */}
          <div>
            <T as="h4" className="text-[#D4A574] font-light text-sm uppercase tracking-wider mb-4">Ferramentas</T>
            <ul className="space-y-2">
              {toolsLinks.map((link) => (
                <li key={link.path}>
                  <Link 
                    to={createPageUrl(link.path)} 
                    className="text-sm font-light hover:text-[#D4A574] transition-colors"
                  >
                    • {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <T as="h4" className="text-[#D4A574] font-light text-sm uppercase tracking-wider mb-4">Comunidade</T>
            <ul className="space-y-2">
              {communityLinks.map((link) => (
                <li key={link.path}>
                  <Link 
                    to={createPageUrl(link.path)} 
                    className="text-sm font-light hover:text-[#D4A574] transition-colors"
                  >
                    • {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#D4A574]/30 to-transparent mb-6"></div>

        {/* Copyright */}
        <div className="text-center">
          <p className="text-sm font-light text-[#B8935C]">
            © {currentYear} <span className="text-[#D4A574]">Clube da Beleza</span>. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}