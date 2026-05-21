import * as React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, Users, Send, Target, ArrowUpRight, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { Lead, MessageLog } from '../types';

interface DashboardProps {
  leads: Lead[];
  messages: MessageLog[];
  dailyCount: number;
  limit: number;
  theme: 'light' | 'dark';
  isMock?: boolean;
  onViewHistory: () => void;
}

export function Dashboard({ leads, messages, dailyCount, limit, theme, isMock, onViewHistory }: DashboardProps) {
  const [tipIndex, setTipIndex] = React.useState(0);
  const respondedStatusCount = leads.filter(l => l.status === 'respondido').length;

  const tips = [
    "Lembre-se: você tem 10% de toda venda feita",
    "10 novos parceiros vendedores são $$$$ no seu bolso",
    "Cada dia de meta atingida é garantia de futuro melhor!",
    `Ao total já temos ${respondedStatusCount} respostas, muito bom!`
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [tips.length]);

  const stats = [
    { label: 'Total de Leads', value: leads.length, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Disparos Hoje', value: dailyCount, icon: Send, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { label: 'Meta Diária', value: limit, icon: Target, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Respostas Totais', value: respondedStatusCount, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/10' },
  ];

  // Dynamically calculate message counts over the last 7 days
  const chartData = React.useMemo(() => {
    const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      // subtract days: index 0 is 6 days ago, index 6 is today
      d.setDate(d.getDate() - (6 - i));
      
      const dayName = weekdays[d.getDay()];
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`; // ISO yyyy-mm-dd
      
      // Filter message logs on this day
      const count = (messages || []).filter(m => {
        if (!m.sent_at) return false;
        try {
          const mDateStr = m.sent_at.slice(0, 10); // e.g. "2026-05-20"
          return mDateStr === dateString;
        } catch {
          return false;
        }
      }).length;
      
      return {
        name: dayName,
        disparos: count,
      };
    });
  }, [messages]);

  return (
    <div className="space-y-8">
      {/* Welcome & Quick Action */}
      {isMock && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-2xl mb-4 text-yellow-500 text-xs font-bold text-center uppercase tracking-widest">
          ⚠️ Usando dados de demonstração. Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nos segredos/secrets para conectar seu banco real.
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Bom dia, Thierry 👋</h2>
          <p className="text-zinc-500 mt-1">Aqui está o resumo do seu desempenho de hoje.</p>
        </div>
        <div className={cn(
          "px-4 py-3 rounded-2xl border flex items-center gap-3",
          theme === 'dark' ? "bg-orange-500/10 border-orange-500/20" : "bg-orange-50 border-orange-100"
        )}>
          <Zap className="text-orange-500" size={20} />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-orange-500/70">Incentivo do dia</p>
            <p className="text-sm font-medium transition-all duration-500">{tips[tipIndex]}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className={cn(
            "p-6 rounded-3xl border transition-all duration-300",
            theme === 'dark' ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-100"
          )}>
            <div className="flex items-start justify-between mb-4">
              <div className={cn("p-3 rounded-2xl", stat.bg)}>
                <stat.icon className={stat.color} size={20} />
              </div>
              <div className="flex items-center text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
                <ArrowUpRight size={10} /> +2.5%
              </div>
            </div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">{stat.label}</p>
            <p className="text-3xl font-bold mt-1 tracking-tighter">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={cn(
          "lg:col-span-2 p-8 rounded-3xl border",
          theme === 'dark' ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-100"
        )}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold">Atividade de Mensagens</h3>
              <p className="text-zinc-500 text-xs">Evolução de mensagens enviadas na semana</p>
            </div>
            <select className={cn(
              "text-xs font-bold bg-transparent border-0 ring-0 focus:ring-0",
              theme === 'dark' ? "text-zinc-400" : "text-zinc-600"
            )}>
              <option>Últimos 7 dias</option>
              <option>Últimos 30 dias</option>
            </select>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorDisparos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#27272a' : '#f4f4f5'} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#71717a' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#71717a' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#18181b' : '#fff', 
                    borderColor: theme === 'dark' ? '#27272a' : '#f4f4f5',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="disparos" 
                  stroke="#f97316" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorDisparos)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={cn(
          "p-8 rounded-3xl border flex flex-col items-center justify-center text-center",
          theme === 'dark' ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-100"
        )}>
          <h3 className="text-lg font-bold mb-6">Meta Diária</h3>
          <div className="relative h-48 w-48 flex items-center justify-center">
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-4xl font-black tracking-tighter">{Math.round((dailyCount / limit) * 100)}%</p>
                  <p className="text-[10px] font-bold uppercase text-zinc-500">Concluído</p>
                </div>
             </div>
             <svg className="h-full w-full -rotate-90 transform">
                <circle
                  cx="50%"
                  cy="50%"
                  r="40%"
                  className={cn("fill-transparent stroke-[8px]", theme === 'dark' ? "stroke-zinc-800" : "stroke-zinc-100")}
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="40%"
                  className="fill-transparent stroke-orange-500 stroke-[8px] transition-all duration-1000 ease-out"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * (dailyCount / limit))}
                  strokeLinecap="round"
                />
             </svg>
          </div>
          <p className="mt-6 text-sm text-zinc-500">Faltam <span className="font-bold text-orange-500">{Math.max(0, limit - dailyCount)}</span> mensagens para atingir a meta de hoje.</p>
          <button 
            onClick={onViewHistory}
            className="mt-6 w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl text-xs font-bold transition-all uppercase tracking-widest"
          >
            Histórico completo
          </button>
        </div>
      </div>
    </div>
  );
}
