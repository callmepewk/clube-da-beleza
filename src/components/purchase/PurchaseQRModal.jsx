import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Copy, Check, QrCode, Timer } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const SERVICES = [
  { key: 'chatbot', label: 'Criação de Chatbot', price: 500 },
  { key: 'site', label: 'Criação de Site', price: 2500 },
  { key: 'design', label: 'Design', price: 500 },
  { key: 'product_ebook', label: 'Produto: Ebook', price: 200 },
  { key: 'product_3d', label: 'Produto: 3D', price: 250 },
  { key: 'product_course', label: 'Produto: Curso', price: 500 },
];

export default function PurchaseQRModal({ open, onOpenChange }) {
  const [ticket, setTicket] = React.useState(null);
  const [secondsLeft, setSecondsLeft] = React.useState(0);
  const [copied, setCopied] = React.useState(false);
  const [status, setStatus] = React.useState('');

  React.useEffect(() => {
    let interval;
    if (ticket?.expires_at) {
      const tick = () => {
        const diff = Math.max(0, Math.floor((new Date(ticket.expires_at) - new Date()) / 1000));
        setSecondsLeft(diff);
        if (diff === 0 && ticket.status === 'pending') {
          setStatus('expirado');
        }
      };
      tick();
      interval = setInterval(tick, 1000);
    }
    return () => clearInterval(interval);
  }, [ticket?.expires_at, ticket?.status]);

  const createTicket = async (serviceKey, price) => {
    const token = Math.random().toString(36).slice(2, 10).toUpperCase();
    const expiresAt = new Date(Date.now() + 60 * 1000).toISOString();
    const res = await base44.entities.PurchaseTicket.create({
      service_type: serviceKey,
      price,
      token,
      expires_at: expiresAt,
      status: 'pending',
      metadata: {}
    });
    setTicket(res);
    setStatus('pendente');
    setCopied(false);
  };

  const verifyTicket = async () => {
    if (!ticket) return;
    const found = await base44.entities.PurchaseTicket.list({ query: { token: ticket.token }, limit: 1 });
    const current = found?.data?.[0];
    if (!current) {
      setStatus('inválido');
      return;
    }
    if (new Date(current.expires_at) < new Date()) {
      await base44.entities.PurchaseTicket.update(current.id, { status: 'expired' });
      setStatus('expirado');
      setTicket({ ...current, status: 'expired' });
      return;
    }
    setStatus(current.status === 'validated' ? 'validado' : 'válido');
    setTicket(current);
  };

  const copyToken = async () => {
    if (!ticket?.token) return;
    await navigator.clipboard.writeText(ticket.token);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const qrUrl = ticket ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(ticket.token)}` : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-[#2D2416]">Contratar Criação via QR</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            {SERVICES.map(s => (
              <Card key={s.key} className="p-3 flex items-center justify-between bg-[#FEFBF7] border-[#D4A574]/30">
                <div>
                  <div className="text-sm text-[#2D2416]">{s.label}</div>
                  <div className="text-xs text-[#6B5D4F]">R$ {s.price.toFixed(2)}</div>
                </div>
                <Button onClick={() => createTicket(s.key, s.price)} className="bg-[#D4A574] hover:bg-[#C49565] text-white h-9 px-3">
                  Gerar QR
                </Button>
              </Card>
            ))}
          </div>

          <div className="bg-[#FEFBF7] border border-[#D4A574]/30 rounded-xl p-4 flex flex-col items-center justify-center text-center min-h-[280px]">
            {!ticket ? (
              <div className="text-[#6B5D4F] text-sm">
                <QrCode className="w-10 h-10 mx-auto mb-2 text-[#D4A574]" />
                Gere um QR para iniciar
              </div>
            ) : (
              <div className="w-full">
                <img src={qrUrl} alt="QR" className="mx-auto rounded-lg border border-[#D4A574]/30 bg-white" />
                <div className="mt-3 flex items-center gap-2 justify-center">
                  <Input value={ticket.token} readOnly className="w-40 h-9 text-center bg-white" />
                  <Button onClick={copyToken} variant="outline" className="h-9">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="mt-2 text-xs text-[#6B5D4F] flex items-center justify-center gap-1">
                  <Timer className="w-4 h-4" /> Válido por: {secondsLeft}s
                </div>
                <div className="mt-3 flex gap-2 justify-center">
                  <Button onClick={verifyTicket} variant="outline" className="h-9">Verificar</Button>
                  {status && <span className={`text-xs px-2 py-1 rounded ${status.includes('exp')? 'bg-red-100 text-red-700':'bg-green-100 text-green-700'}`}>{status}</span>}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}