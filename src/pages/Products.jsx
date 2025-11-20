import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Plus, Package, FileText, Box } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Meus Produtos</h1>
          <p className="text-slate-500">Gerencie seus produtos digitais e físicos</p>
        </div>
        <Button className="bg-emerald-600">
          <Plus className="w-4 h-4 mr-2" /> Novo Produto
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Empty State / Create Cards */}
        <Card className="border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-emerald-400 transition-colors cursor-pointer flex flex-col items-center justify-center p-8 text-center h-[250px]">
          <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-emerald-600" />
          </div>
          <h3 className="font-medium text-slate-900">Criar E-book / PDF</h3>
          <p className="text-sm text-slate-500 mt-2">Use a IA para escrever e diagramar conteúdo educativo.</p>
        </Card>

        <Card className="border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-purple-400 transition-colors cursor-pointer flex flex-col items-center justify-center p-8 text-center h-[250px]">
          <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-4">
            <Box className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-medium text-slate-900">Modelar Produto 3D</h3>
          <p className="text-sm text-slate-500 mt-2">Gere visualizações 3D de embalagens ou próteses.</p>
        </Card>

        <Card className="border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-blue-400 transition-colors cursor-pointer flex flex-col items-center justify-center p-8 text-center h-[250px]">
           <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-4">
            <Package className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-medium text-slate-900">Curso Online</h3>
          <p className="text-sm text-slate-500 mt-2">Estruture módulos e aulas com ajuda da IA.</p>
        </Card>
      </div>
    </div>
  );
}