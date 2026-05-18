import * as React from 'react';
import { History, Search, Calendar, User, MessageSquare } from 'lucide-react';
import { MessageLog, Lead } from '../types';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MessageHistoryProps {
  messages: MessageLog[];
  leads: Lead[];
  theme: 'light' | 'dark';
}

export function MessageHistory({ messages, leads, theme }: MessageHistoryProps) {
  const [searchTerm, setSearchTerm] = React.useState('');

  const getLeadName = (leadId: string) => {
    return leads.find(l => l.id === leadId)?.name || 'Lead Removido';
  };

  const filteredMessages = messages.filter(msg => {
    const leadName = getLeadName(msg.lead_id).toLowerCase();
    return leadName.includes(searchTerm.toLowerCase()) || msg.message_text.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Histórico de Mensagens</h2>
          <p className="text-zinc-500 text-sm mt-1">Veja todos os disparos realizados pelo sistema.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
          <input 
            type="text" 
            placeholder="Buscar no histórico..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={cn(
              "pl-10 pr-4 py-2 rounded-xl border text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all",
              theme === 'dark' ? "bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-700" : "bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400"
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredMessages.map((msg) => (
          <div 
            key={msg.id} 
            className={cn(
              "p-6 rounded-3xl border flex flex-col sm:flex-row sm:items-start gap-4 transition-all hover:shadow-lg",
              theme === 'dark' ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-100"
            )}
          >
            <div className="h-12 w-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-400 shrink-0 border border-zinc-700">
              <MessageSquare size={20} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-orange-500">{getLeadName(msg.lead_id)}</span>
                  <div className="h-1 w-1 rounded-full bg-zinc-700" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Enviada por Thierry</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  <Calendar size={12} />
                  {format(new Date(msg.sent_at), "dd MMM yyyy, HH:mm", { locale: ptBR })}
                </div>
              </div>
              
              <div className={cn(
                "p-4 rounded-2xl text-sm leading-relaxed",
                theme === 'dark' ? "bg-zinc-950/50 text-zinc-400" : "bg-zinc-50 text-zinc-600"
              )}>
                {msg.message_text}
              </div>
            </div>
          </div>
        ))}

        {filteredMessages.length === 0 && (
          <div className="p-12 text-center text-zinc-500 italic border-2 border-dashed border-zinc-800 rounded-3xl">
            Nenhum registro de mensagem encontrado.
          </div>
        )}
      </div>
    </div>
  );
}
