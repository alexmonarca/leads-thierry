import * as React from 'react';
import { Sun, Moon, LayoutDashboard, Send, Users, CheckSquare, LogOut, History } from 'lucide-react';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onLogout?: () => void;
}

export function Layout({ children, activeTab, onTabChange, theme, toggleTheme, onLogout }: LayoutProps) {
  return (
    <div className={cn(
      "min-h-screen flex flex-col transition-colors duration-300",
      theme === 'dark' ? "bg-zinc-950 text-zinc-100" : "bg-zinc-50 text-zinc-900"
    )}>
      {/* Header */}
      <header className={cn(
        "sticky top-0 z-40 border-b px-4 py-3 flex items-center justify-between backdrop-blur-md",
        theme === 'dark' ? "bg-zinc-950/80 border-zinc-800" : "bg-white/80 border-zinc-200"
      )}>
        <div className="flex items-center gap-3">
          <img src="https://app.monarcahub.com/logo-iara.png" alt="IARA Logo" className="h-8 w-auto" />
          <div className="h-4 w-[1px] bg-zinc-700 hidden sm:block" />
          <h1 className="text-sm font-medium tracking-tight hidden sm:block">IARA CRM - Prospecção</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className={cn(
              "p-2 rounded-full transition-colors",
              theme === 'dark' ? "hover:bg-zinc-800 text-zinc-400" : "hover:bg-zinc-100 text-zinc-600"
            )}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {onLogout && (
            <button
              onClick={onLogout}
              className={cn(
                "p-2 rounded-full transition-colors",
                theme === 'dark' ? "hover:bg-red-500/10 text-red-500" : "hover:bg-red-50 text-red-600"
              )}
              title="Sair"
            >
              <LogOut size={18} />
            </button>
          )}
          <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold border border-zinc-700">
            T
          </div>
        </div>
      </header>

      {/* Main Navigation Tab Bar */}
      <nav className={cn(
        "flex border-b px-4 overflow-x-auto no-scrollbar",
        theme === 'dark' ? "bg-zinc-950 border-zinc-800" : "bg-white border-zinc-200"
      )}>
        {[
          { id: 'dashboard', label: 'Painel', icon: LayoutDashboard },
          { id: 'prospecting', label: 'Prospecção', icon: Send },
          { id: 'leads', label: 'Leads', icon: Users },
          { id: 'tasks', label: 'Tarefas', icon: CheckSquare },
          { id: 'history', label: 'Histórico', icon: History },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "px-4 py-3 flex items-center gap-2 text-sm font-medium transition-all relative whitespace-nowrap",
              activeTab === item.id 
                ? (theme === 'dark' ? "text-zinc-100" : "text-zinc-900")
                : "text-zinc-500 hover:text-zinc-400"
            )}
          >
            <item.icon size={16} />
            {item.label}
            {activeTab === item.id && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-orange-500" />
            )}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className={cn(
        "border-t p-6 flex flex-col items-center gap-4",
        theme === 'dark' ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"
      )}>
        <img 
          src="https://raw.githubusercontent.com/monarcahub/agenciamonarca/refs/heads/main/_Logo-MonarcaHub-2024-A.png" 
          alt="Monarca Hub Logo" 
          className={cn("h-6 w-auto opacity-70", theme === 'dark' ? "invert" : "")} 
        />
        <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">
          Powered by Monarca Hub &copy; 2024
        </p>
      </footer>
    </div>
  );
}
