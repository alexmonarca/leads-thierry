import * as React from 'react';
import { getSupabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { LogIn, Mail, Lock, AlertCircle, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginProps {
  onLoginSuccess: () => void;
  theme: 'light' | 'dark';
}

export function Login({ onLoginSuccess, theme }: LoginProps) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = getSupabase();
    if (!supabase) {
      setError('Supabase não configurado. Verifique as chaves VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.');
      setLoading(false);
      return;
    }

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw authError;
      }

      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center p-6",
      theme === 'dark' ? "bg-zinc-950 text-zinc-100" : "bg-white text-zinc-900"
    )}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={cn(
          "w-full max-w-md p-8 rounded-[2.5rem] border shadow-2xl relative overflow-hidden",
          theme === 'dark' ? "bg-zinc-900 border-zinc-800 shadow-orange-500/5" : "bg-white border-zinc-100 shadow-zinc-200/50"
        )}
      >
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-3xl rounded-full -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-500/5 blur-3xl rounded-full -ml-16 -mb-16" />

        <div className="text-center mb-8 relative">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/20 mb-6">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Acesso Restrito</h1>
          <p className="text-zinc-500 mt-2 text-sm">Entre com suas credenciais Thierry</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">E-mail</label>
            <div className="relative">
              <Mail className={cn(
                "absolute left-4 top-1/2 -translate-y-1/2",
                theme === 'dark' ? "text-zinc-600" : "text-zinc-400"
              )} size={18} />
              <input 
                required
                type="email" 
                placeholder="exemplo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={cn(
                  "w-full pl-12 pr-4 py-4 rounded-2xl border transition-all focus:outline-none focus:ring-4 focus:ring-orange-500/10",
                  theme === 'dark' 
                    ? "bg-zinc-950 border-zinc-800 text-zinc-100 focus:border-orange-500/50 placeholder:text-zinc-800" 
                    : "bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-orange-500/30 placeholder:text-zinc-400"
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Senha</label>
            <div className="relative">
              <Lock className={cn(
                "absolute left-4 top-1/2 -translate-y-1/2",
                theme === 'dark' ? "text-zinc-600" : "text-zinc-400"
              )} size={18} />
              <input 
                required
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn(
                  "w-full pl-12 pr-4 py-4 rounded-2xl border transition-all focus:outline-none focus:ring-4 focus:ring-orange-500/10",
                  theme === 'dark' 
                    ? "bg-zinc-950 border-zinc-800 text-zinc-100 focus:border-orange-500/50 placeholder:text-zinc-800" 
                    : "bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-orange-500/30 placeholder:text-zinc-400"
                )}
              />
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-start gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold leading-relaxed"
            >
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </motion.div>
          )}

          <button
            disabled={loading}
            type="submit"
            className={cn(
              "w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all shadow-xl active:scale-[0.98] mt-4",
              loading 
                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700" 
                : "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20"
            )}
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Validando...
              </>
            ) : (
              <>
                Acessar Plataforma
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-zinc-600">
          Protegido por criptografia LGPD.
          <br />
          Para THIERRY: Se esqueceu a senha, peça ao administrador.
        </p>
      </motion.div>
    </div>
  );
}
