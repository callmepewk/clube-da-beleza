import React from 'react';
import { Activity, Shield, Award, AlertTriangle, CheckCircle, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import T from '@/components/TranslatedText';

export default function RightDosePage() {
  const principles = [
    {
      icon: Shield,
      title: 'Segurança em Primeiro Lugar',
      description: 'Protocolos rigorosos e dosagens baseadas em evidências científicas para garantir procedimentos seguros.'
    },
    {
      icon: Brain,
      title: 'Conhecimento Técnico',
      description: 'Capacitação contínua de profissionais sobre dosagens corretas e técnicas de aplicação.'
    },
    {
      icon: Activity,
      title: 'Personalização',
      description: 'Cada paciente é único. Dosagens e tratamentos são personalizados segundo avaliação individual.'
    },
    {
      icon: CheckCircle,
      title: 'Qualidade Garantida',
      description: 'Uso de produtos certificados pela ANVISA e fornecedores homologados.'
    }
  ];

  const dangers = [
    {
      problem: 'Sobredosagem de Botox',
      risks: ['Assimetria facial', 'Paralisia excessiva', 'Aparência artificial', 'Complicações respiratórias'],
      prevention: 'Respeitar limites de unidades por área e anatomia facial individual'
    },
    {
      problem: 'Excesso de Preenchimento',
      risks: ['Efeito "bochecha de hamster"', 'Migração do produto', 'Oclusão vascular', 'Necrose tecidual'],
      prevention: 'Aplicar volume gradual com sessões espaçadas e avaliação contínua'
    },
    {
      problem: 'Bioestimuladores em Excesso',
      risks: ['Granulomas', 'Inflamação crônica', 'Endurecimento', 'Resultados irreversíveis'],
      prevention: 'Seguir protocolos de volume e diluição recomendados pelo fabricante'
    }
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <div className="relative h-[70vh] rounded-[2rem] overflow-hidden shadow-2xl bg-gradient-to-br from-[#2D2416] via-[#D4A574] to-[#C9A868]">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2000')] bg-cover bg-center opacity-10"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full p-12 text-center text-white">
          <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-8 border-4 border-white/30">
            <Activity className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-6xl font-light tracking-tight mb-6 leading-tight max-w-4xl">
            <T>Beleza na</T> <span className="font-normal text-[#E8E05C]"><T>Dose Certa</T></span>
          </h1>
          <T as="p" className="text-xl font-light leading-relaxed max-w-3xl opacity-95">
            Educação e conscientização sobre dosagens seguras e responsáveis em medicina estética
          </T>
        </div>
      </div>

      {/* Introduction */}
      <div className="max-w-4xl mx-auto text-center space-y-6">
        <div className="inline-block bg-[#E8E05C] text-[#2D2416] px-6 py-3 rounded-full font-light text-sm mb-4 uppercase tracking-wider">
          <T>Campanha Educativa</T>
        </div>
        <T as="h2" className="text-4xl font-light text-[#2D2416]">O Perigo da Sobredosagem</T>
        <T as="p" className="text-[#6B5D4F] font-light leading-relaxed text-lg">
          A medicina estética avançou muito, mas com ela veio a necessidade de conscientização sobre o uso responsável de procedimentos injetáveis. O programa "Beleza na Dose Certa" é uma iniciativa educativa do Clube da Beleza para orientar profissionais e pacientes sobre os riscos da sobredosagem e a importância de tratamentos equilibrados e naturais.
        </T>
        <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-xl text-left">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <T as="h3" className="font-bold text-amber-900 mb-2">Alerta Importante</T>
              <T as="p" className="text-amber-800 font-light text-sm">
                Mais nem sempre é melhor. Excesso de produtos injetáveis pode causar complicações graves, resultados artificiais e até danos irreversíveis. A beleza natural e harmoniosa deve ser sempre o objetivo.
              </T>
            </div>
          </div>
        </div>
      </div>

      {/* Principles */}
      <div>
        <T as="h2" className="text-4xl font-light text-[#2D2416] mb-10 text-center">Nossos Princípios</T>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {principles.map((principle, idx) => (
            <div key={idx} className="bg-[#FEFBF7] rounded-[1.5rem] p-8 border border-[#D4A574]/20 text-center hover:shadow-xl hover:-translate-y-2 transition-all">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D4A574] to-[#C9A868] flex items-center justify-center mx-auto mb-6 shadow-lg">
                <principle.icon className="w-8 h-8 text-white" />
              </div>
              <T as="h3" className="text-xl font-light text-[#2D2416] mb-3">{principle.title}</T>
              <T as="p" className="text-[#6B5D4F] font-light text-sm leading-relaxed">{principle.description}</T>
            </div>
          ))}
        </div>
      </div>

      {/* Dangers and Prevention */}
      <div>
        <div className="text-center mb-10">
          <T as="h2" className="text-4xl font-light text-[#2D2416] mb-4">Riscos e Prevenção</T>
          <T as="p" className="text-[#6B5D4F] font-light text-lg">Conheça os principais riscos da sobredosagem e como evitá-los</T>
        </div>
        <div className="space-y-6">
          {dangers.map((danger, idx) => (
            <div key={idx} className="bg-[#FEFBF7] rounded-[2rem] border border-[#D4A574]/20 overflow-hidden hover:shadow-xl transition-all">
              <div className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-[#D4A574]/20 p-6">
                <h3 className="text-2xl font-light text-[#2D2416] flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                  {danger.problem}
                </h3>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <T as="h4" className="text-sm font-bold text-[#2D2416] uppercase tracking-wide mb-4 text-red-600">Riscos Potenciais</T>
                  <ul className="space-y-2">
                    {danger.risks.map((risk, i) => (
                      <li key={i} className="flex items-start gap-2 text-[#6B5D4F] font-light">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0"></div>
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <T as="h4" className="text-sm font-bold text-[#2D2416] uppercase tracking-wide mb-4 text-green-600">Como Prevenir</T>
                  <p className="text-[#6B5D4F] font-light leading-relaxed bg-green-50 p-4 rounded-xl border border-green-200">
                    {danger.prevention}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Guidelines */}
      <div className="bg-gradient-to-br from-[#FFF9F0] to-[#FFF5E6] rounded-[2rem] p-12 border border-[#D4A574]/20">
        <T as="h2" className="text-4xl font-light text-[#2D2416] mb-8 text-center">Diretrizes de Ouro</T>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="flex items-start gap-4 bg-white p-6 rounded-xl border border-[#D4A574]/20">
            <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
            <div>
              <T as="h3" className="font-light text-[#2D2416] mb-2">Menos é Mais</T>
              <T as="p" className="text-sm text-[#6B5D4F] font-light">Começar com doses conservadoras e aumentar gradualmente se necessário.</T>
            </div>
          </div>
          <div className="flex items-start gap-4 bg-white p-6 rounded-xl border border-[#D4A574]/20">
            <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
            <div>
              <T as="h3" className="font-light text-[#2D2416] mb-2">Respeitar a Anatomia</T>
              <T as="p" className="text-sm text-[#6B5D4F] font-light">Cada rosto é único e requer abordagem personalizada.</T>
            </div>
          </div>
          <div className="flex items-start gap-4 bg-white p-6 rounded-xl border border-[#D4A574]/20">
            <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
            <div>
              <T as="h3" className="font-light text-[#2D2416] mb-2">Intervalos Adequados</T>
              <T as="p" className="text-sm text-[#6B5D4F] font-light">Respeitar tempo entre sessões para avaliação de resultados.</T>
            </div>
          </div>
          <div className="flex items-start gap-4 bg-white p-6 rounded-xl border border-[#D4A574]/20">
            <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
            <div>
              <T as="h3" className="font-light text-[#2D2416] mb-2">Produtos Certificados</T>
              <T as="p" className="text-sm text-[#6B5D4F] font-light">Sempre usar produtos aprovados pela ANVISA e autênticos.</T>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-[#D4A574] to-[#C9A868] rounded-[2rem] p-12 text-white text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative z-10">
          <Shield className="w-16 h-16 mx-auto mb-6 opacity-90" />
          <T as="h3" className="text-4xl font-light mb-4">Pratique a Beleza Responsável</T>
          <T as="p" className="text-white/90 text-lg font-light mb-8 max-w-2xl mx-auto">
            Profissionais e pacientes: comprometam-se com tratamentos seguros e resultados naturais.
          </T>
          <Button className="bg-white text-[#D4A574] hover:bg-[#FFF9F0] h-14 px-8 text-lg font-light rounded-xl shadow-xl">
            <T>Saiba Mais</T>
          </Button>
        </div>
      </div>
    </div>
  );
}