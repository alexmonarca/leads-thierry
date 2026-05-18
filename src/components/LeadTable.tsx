import * as React from 'react';
import { Search, Filter, MoreHorizontal, Phone, Mail, Calendar, ArrowUpDown } from 'lucide-react';
import { Lead, LeadStatus } from '../types';
import { cn, formatPhone } from '../lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LeadTableProps {
  leads: Lead[];
  onUpdateStatus: (leadId: string, newStatus: LeadStatus) => void;
  theme: 'light' | 'dark';
}

const statusColors: Record<LeadStatus, string> = {
  novo: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  contactado: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  respondido: 'bg-green-500/10 text-green-500 border-green-500/20',
  agendado: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  fechado: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  perdido: 'bg-red-500/10 text-red-500 border-red-500/20',
};

const statusLabels: Record<LeadStatus, string> = {
  novo: 'Novo',
  contactado: 'Contactado',
  respondido: 'Respondido',
  agendado: 'Agendado',
  fechado: 'Fechado',
  perdido: 'Perdido',
};

export function LeadTable({ leads, onUpdateStatus, theme }: LeadTableProps) {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.phone.includes(searchTerm)
  );

  const handleWhatsApp = (phone: string, name: string) => {
    const message = `Olá, ${name.split(' ')[0]}! Tudo bem? Me chamo Thierry, podemos conversar sobre vendas?`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Base de Leads</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <input 
              type="text" 
              placeholder="Buscar por nome ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(
                "pl-10 pr-4 py-2 rounded-xl border text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all",
                theme === 'dark' ? "bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600" : "bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400"
              )}
            />
          </div>
          <button className={cn(
            "p-2 rounded-xl border flex items-center justify-center transition-all",
            theme === 'dark' ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800" : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50"
          )}>
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className={cn(
        "rounded-3xl border overflow-hidden",
        theme === 'dark' ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
      )}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={cn(
                "border-b text-[10px] uppercase font-bold tracking-widest text-zinc-500",
                theme === 'dark' ? "bg-zinc-950/50 border-zinc-800" : "bg-zinc-50 border-zinc-100"
              )}>
                <th className="px-6 py-4">Lead</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Último Contato</th>
                <th className="px-6 py-4">Data de Criação</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredLeads.map((lead) => (
                <tr 
                  key={lead.id} 
                  className={cn(
                    "group transition-colors",
                    theme === 'dark' ? "hover:bg-zinc-800/50 border-zinc-800" : "hover:bg-zinc-50 border-zinc-100"
                  )}
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 font-bold border border-orange-500/20">
                        {lead.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{lead.name}</p>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
                          <Phone size={10} className="opacity-70" />
                          {formatPhone(lead.phone)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <select
                      value={lead.status}
                      onChange={(e) => onUpdateStatus(lead.id, e.target.value as LeadStatus)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border focus:outline-none focus:ring-2 focus:ring-orange-500/20 cursor-pointer transition-all",
                        statusColors[lead.status]
                      )}
                    >
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <option key={value} value={value} className={theme === 'dark' ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
                      <Calendar size={12} />
                      {lead.last_contact_at 
                        ? format(new Date(lead.last_contact_at), "dd MMM, HH:mm", { locale: ptBR }) 
                        : "Nunca"}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-xs text-zinc-500 font-medium">
                      {format(new Date(lead.created_at), "dd/MM/yyyy")}
                    </p>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button 
                      onClick={() => handleWhatsApp(lead.phone, lead.name)}
                      title="Enviar mensagem novamente"
                      className={cn(
                        "p-2 rounded-xl transition-all shadow-sm active:scale-95 flex items-center justify-center ml-auto",
                        theme === 'dark' ? "bg-zinc-800 text-orange-500 hover:bg-zinc-700" : "bg-zinc-50 text-orange-500 hover:bg-zinc-100"
                      )}
                    >
                      <Phone size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500 italic text-sm">
                    Nenhum lead encontrado com os filtros atuais.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
