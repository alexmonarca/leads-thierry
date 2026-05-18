import * as React from 'react';
import { Plus, Clock, CheckCircle2, Circle, Calendar, AlertCircle } from 'lucide-react';
import { X } from 'lucide-react';
import { Task } from '../types';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';

interface TaskBoardProps {
  tasks: Task[];
  onAddTask: (title: string, description?: string) => void;
  onToggleTask: (taskId: string, currentStatus: string) => void;
  theme: 'light' | 'dark';
}

export function TaskBoard({ tasks, onAddTask, onToggleTask, theme }: TaskBoardProps) {
  const [isAdding, setIsAdding] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState('');
  const [newDesc, setNewDesc] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddTask(newTitle, newDesc);
    setNewTitle('');
    setNewDesc('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Suas Tarefas</h2>
          <p className="text-zinc-500 text-sm mt-1">Gerencie seus lembretes e acompanhamentos de leads.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95"
        >
          <Plus size={18} /> Nova Tarefa
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form 
              onSubmit={handleSubmit}
              className={cn(
                "p-6 rounded-3xl border space-y-4 mb-4",
                theme === 'dark' ? "bg-zinc-900 border-zinc-700" : "bg-white border-zinc-200 shadow-md"
              )}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-widest text-orange-500">Adicionar Tarefa</h3>
                <button type="button" onClick={() => setIsAdding(false)} className="text-zinc-500 hover:text-zinc-300">
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-3">
                <input 
                  autoFocus
                  type="text" 
                  placeholder="O que precisa ser feito? (Ex: Retornar para João)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className={cn(
                    "w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20",
                    theme === 'dark' ? "bg-zinc-950 border-zinc-700 text-zinc-100" : "bg-zinc-50 border-zinc-200 text-zinc-900"
                  )}
                />
                <textarea 
                  placeholder="Mais detalhes (opcional)"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className={cn(
                    "w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 h-24 resize-none",
                    theme === 'dark' ? "bg-zinc-950 border-zinc-700 text-zinc-100" : "bg-zinc-50 border-zinc-200 text-zinc-900"
                  )}
                />
                <button 
                  type="submit"
                  className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold shadow-lg"
                >
                  Criar Tarefa
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pending Tasks */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Clock size={16} className="text-orange-500" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Pendentes</h3>
            <span className={cn(
              "px-1.5 py-0.5 rounded-md text-[10px] font-bold",
              theme === 'dark' ? "bg-zinc-800 text-zinc-400" : "bg-zinc-100 text-zinc-500"
            )}>
              {tasks.filter(t => t.status === 'pending').length}
            </span>
          </div>

          <div className="space-y-3">
            {tasks.filter(t => t.status === 'pending').map((task) => (
              <div 
                key={task.id} 
                onClick={() => onToggleTask(task.id, task.status)}
                className={cn(
                  "p-4 rounded-2xl border flex items-start gap-4 transition-all group cursor-pointer",
                  theme === 'dark' ? "bg-zinc-900 border-zinc-800 hover:border-orange-500/50" : "bg-white border-zinc-200 hover:border-orange-500/50 shadow-sm"
                )}
              >
                <div className="mt-1 text-zinc-600 group-hover:text-orange-500 transition-colors">
                  <Circle size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold truncate">{task.title}</h4>
                  {task.description && <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{task.description}</p>}
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 uppercase">
                      <Calendar size={12} />
                      {format(new Date(task.created_at), "dd MMM", { locale: ptBR })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {tasks.filter(t => t.status === 'pending').length === 0 && (
              <div className="p-8 text-center text-zinc-500 text-xs italic border-2 border-dashed border-zinc-800 rounded-2xl">
                Nenhuma tarefa pendente! Aproveite para organizar seus próximos leads.
              </div>
            )}
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <CheckCircle2 size={16} className="text-green-500" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Concluídas</h3>
            <span className={cn(
              "px-1.5 py-0.5 rounded-md text-[10px] font-bold",
              theme === 'dark' ? "bg-zinc-800 text-zinc-400" : "bg-zinc-100 text-zinc-500"
            )}>
              {tasks.filter(t => t.status === 'completed').length}
            </span>
          </div>

          <div className="space-y-3">
            {tasks.filter(t => t.status === 'completed').map((task) => (
              <div 
                key={task.id} 
                onClick={() => onToggleTask(task.id, task.status)}
                className={cn(
                  "p-4 rounded-2xl border flex items-start gap-4 transition-all opacity-60 cursor-pointer hover:opacity-100",
                  theme === 'dark' ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
                )}
              >
                <div className="mt-1 text-green-500">
                  <CheckCircle2 size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold line-through text-zinc-500">{task.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
