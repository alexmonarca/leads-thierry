import * as React from 'react';
import { getSupabase } from './lib/supabase';
import { Lead, MessageLog, Task, LeadStatus } from './types';
import { Layout } from './components/Layout';
import { ProspectingCard } from './components/ProspectingCard';
import { Dashboard } from './components/Dashboard';
import { LeadTable } from './components/LeadTable';
import { TaskBoard } from './components/TaskBoard';
import { MessageHistory } from './components/MessageHistory';
import { Login } from './components/Login';

// Mock Data for initial preview if Supabase is not configured
const MOCK_LEADS: Lead[] = [
  { id: '1', name: 'Ricardo Santos', phone: '5511999991111', status: 'novo', created_at: new Date().toISOString() },
  { id: '2', name: 'Ana Beatriz', phone: '5511999992222', status: 'novo', created_at: new Date().toISOString() },
  { id: '3', name: 'Carla Souza', phone: '5511999993333', status: 'contactado', created_at: new Date().toISOString(), last_contact_at: new Date().toISOString() },
  { id: '4', name: 'Marcos Paulo', phone: '5511999994444', status: 'respondido', created_at: new Date().toISOString(), last_contact_at: new Date().toISOString() },
  { id: '5', name: 'Juliana Lima', phone: '5511999995555', status: 'fechado', created_at: new Date().toISOString() },
];

const MOCK_TASKS: Task[] = [
  { id: '1', title: 'Retornar ligação para Ricardo', status: 'pending', created_at: new Date().toISOString() },
  { id: '2', title: 'Enviar portfólio IARA para Ana', status: 'pending', description: 'Ela pediu mais detalhes sobre o agente SDR.', created_at: new Date().toISOString(), due_date: new Date().toISOString() },
  { id: '3', title: 'Configurar automação do lead Marcos', status: 'completed', created_at: new Date().toISOString() },
];

const MOCK_MESSAGES: MessageLog[] = [
  { id: 'm1', lead_id: '3', message_text: 'Olá Carla, estamos com uma oportunidade imperdível para novos parceiros!', sent_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'm2', lead_id: '4', message_text: 'Marcos, vi seu interesse no nosso sistema de vendas. Vamos agendar uma demonstração?', sent_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'm3', lead_id: '3', message_text: 'Perfeito Carla! Qual o melhor horário para ligarmos para você?', sent_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'm4', lead_id: '4', message_text: 'Excelente! A apresentação dura cerca de 15 minutos.', sent_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'm5', lead_id: '1', message_text: 'Oi Ricardo Santos, tudo bem? Me chamo Thierry, podemos conversar sobre vendas?', sent_at: new Date().toISOString() },
  { id: 'm6', lead_id: '2', message_text: 'Oi Ana Beatriz! Vamos impulsionar suas vendas hoje?', sent_at: new Date().toISOString() },
];

export default function App() {
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [theme, setTheme] = React.useState<'light' | 'dark'>('dark');
  const [leads, setLeads] = React.useState<Lead[]>([]);
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [messages, setMessages] = React.useState<MessageLog[]>([]);
  const [dailyCount, setDailyCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [session, setSession] = React.useState<any>(null);
  const [authChecking, setAuthChecking] = React.useState(true);

  const isMock = !getSupabase();
  const SEND_LIMIT = 100;

  React.useEffect(() => {
    const supabase = getSupabase();
    if (supabase) {
      // Auth check
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setAuthChecking(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setAuthChecking(false);
      });

      // Data fetching
      fetchData();

      // Realtime subscription
      const channel = supabase
        .channel('db-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'leads' },
          () => fetchData(true)
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'messages_log' },
          () => fetchData(true)
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'tasks' },
          () => fetchData(true)
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
        supabase.removeChannel(channel);
      };
    } else {
      setAuthChecking(false);
      fetchData();
    }
  }, []);

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    const supabase = getSupabase();
    try {
      if (!supabase) {
        console.warn('Supabase not configured. Using mock data.');
        setLeads(MOCK_LEADS);
        setTasks(MOCK_TASKS);
        setMessages(MOCK_MESSAGES);
        setDailyCount(2); // Since MOCK_MESSAGES has 2 messages for today (m5 and m6)
      } else {
        // Real fetch from Supabase
        const { data: leadsData, error: leadsError } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
        const { data: tasksData, error: tasksError } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
        const { data: logsData, error: logsError } = await supabase.from('messages_log').select('*').order('sent_at', { ascending: false });
        
        if (leadsError) console.error('Erro ao buscar leads:', leadsError.message, leadsError.details);
        if (tasksError) console.error('Erro ao buscar tarefas:', tasksError.message, tasksError.details);
        if (logsError) console.error('Erro ao buscar logs:', logsError.message);
        
        // Get daily count
        const today = new Date().toISOString().split('T')[0];
        const { count, error: countError } = await supabase
          .from('messages_log')
          .select('*', { count: 'exact', head: true })
          .gte('sent_at', `${today}T00:00:00`)
          .lte('sent_at', `${today}T23:59:59`);

        if (countError) console.error('Erro ao contar mensagens:', countError.message);

        if (leadsData) setLeads(leadsData);
        if (tasksData) setTasks(tasksData);
        if (logsData) setMessages(logsData);
        if (count !== null) setDailyCount(count);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleSendMessage = async (leadId: string, text: string) => {
    const supabase = getSupabase();
    
    // Optimistic UI update for status and count
    setDailyCount(prev => prev + 1);
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: 'contactado', last_contact_at: new Date().toISOString() } : l));
    
    if (supabase) {
      try {
        console.log(`Updating lead ${leadId} to contactado...`);
        
        // 1. Update lead status FIRST so any concurrent/realtime queries immediately see the update
        const { error: updateError } = await supabase.from('leads').update({
          status: 'contactado' as LeadStatus,
          last_contact_at: new Date().toISOString()
        }).eq('id', leadId);

        if (updateError) {
          console.error('Error updating lead status:', updateError);
        } else {
          console.log(`Lead ${leadId} updated successfully.`);
        }

        // 2. Log the message
        const { error: logError } = await supabase.from('messages_log').insert({
          lead_id: leadId,
          message_text: text,
        });
        
        if (logError) {
          console.error('Error recording message log:', logError);
        }

        // 3. Refresh data to sync everything (silently)
        fetchData(true);
      } catch (error) {
        console.error('Unexpected error in handleSendMessage:', error);
      }
    }
  };

  const handleAddTask = async (title: string, description?: string) => {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.from('tasks').insert({ title, description, status: 'pending' });
    } else {
      const newTask: Task = {
        id: Math.random().toString(),
        title,
        description,
        status: 'pending',
        created_at: new Date().toISOString()
      };
      setTasks(prev => [newTask, ...prev]);
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
    const supabase = getSupabase();
    if (supabase) {
      await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);
    } else {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus as 'pending' | 'completed' } : t));
    }
  };

  const handleUpdateStatus = async (leadId: string, newStatus: LeadStatus) => {
    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase.from('leads').update({ status: newStatus }).eq('id', leadId);
      if (error) console.error('Error updating lead status:', error);
      fetchData(true); // Refresh to ensure data consistency silently
    } else {
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
    }
  };

  const getNextLead = () => {
    return leads.find(l => !l.status || l.status === 'novo' || l.status.toLowerCase() === 'novo') || null;
  };

  const renderContent = () => {
    if (authChecking) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-zinc-500 font-medium text-sm">Verificando segurança...</p>
          </div>
        </div>
      );
    }

    if (!session && !isMock) {
      return <Login theme={theme} onLoginSuccess={() => fetchData()} />;
    }

    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-zinc-500 font-medium text-sm">Carregando painel...</p>
          </div>
        </div>
      );
    }


    switch (activeTab) {
      case 'dashboard':
        return <Dashboard leads={leads} messages={messages} dailyCount={dailyCount} limit={SEND_LIMIT} theme={theme} isMock={isMock} onViewHistory={() => setActiveTab('history')} />;
      case 'prospecting':
        return (
          <ProspectingCard 
            lead={getNextLead()} 
            onSend={handleSendMessage} 
            dailyCount={dailyCount} 
            limit={SEND_LIMIT} 
            theme={theme}
          />
        );
      case 'leads':
        return <LeadTable leads={leads} onUpdateStatus={handleUpdateStatus} theme={theme} />;
      case 'tasks':
        return <TaskBoard tasks={tasks} onAddTask={handleAddTask} onToggleTask={handleToggleTask} theme={theme} />;
      case 'history':
        return <MessageHistory messages={messages} leads={leads} theme={theme} />;
      default:
        return null;
    }
  };

  const content = renderContent();
  
  if (!session && !isMock) {
    return content;
  }

  return (
    <Layout 
      activeTab={activeTab} 
      onTabChange={setActiveTab} 
      theme={theme} 
      toggleTheme={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
      onLogout={async () => {
        const supabase = getSupabase();
        if (supabase) await supabase.auth.signOut();
      }}
    >
      {content}
    </Layout>
  );
}
