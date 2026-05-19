import * as React from 'react';
import { Copy, ExternalLink, CheckCircle2, AlertTriangle, ArrowRight, User, Phone, Send, Info, Loader2 } from 'lucide-react';
import { Lead } from '../types';
import { cn, formatPhone, getWhatsAppUrl } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface ProspectingCardProps {
  lead: Lead | null;
  onSend: (leadId: string, message: string) => void;
  dailyCount: number;
  limit: number;
  theme: 'light' | 'dark';
}

export function ProspectingCard({ lead, onSend, dailyCount, limit, theme }: ProspectingCardProps) {
  const [copied, setCopied] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [showTooltip, setShowTooltip] = React.useState(false);

  React.useEffect(() => {
    if (lead) {
      // Personalized greeting message
      const greeting = `Olá, ${lead.name.split(' ')[0]}! Tudo bem? Me chamo Thierry, podemos conversar sobre vendas?`;
      setMessage(greeting);
    }
  }, [lead]);

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    if (!lead) return;
    const url = getWhatsAppUrl(lead.phone, message);
    window.open(url, '_blank');
  };

  const [isSending, setIsSending] = React.useState(false);

  const handleConfirmContact = async () => {
    if (!lead || isSending) return;
    setIsSending(true);
    try {
      await onSend(lead.id, message);
    } catch (err) {
      console.error('Error in handleConfirmContact:', err);
    } finally {
      // We don't reset isSending immediately because the lead will change
      // and the component will re-render with the new lead
      setTimeout(() => setIsSending(false), 500);
    }
  };

  React.useEffect(() => {
    setIsSending(false);
  }, [lead?.id]);

  if (!lead) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center p-12 rounded-3xl border-2 border-dashed transition-all",
        theme === 'dark' ? "border-zinc-800 bg-zinc-900/50" : "border-zinc-200 bg-zinc-50"
      )}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <CheckCircle2 size={64} className="text-green-500 mb-6 opacity-40 mx-auto" />
        </motion.div>
        <p className="text-zinc-500 font-bold text-lg text-center">Nenhum lead pendente para contato.</p>
        <div className="max-w-xs text-center mt-3 space-y-2">
          <p className="text-zinc-600 text-sm italic">
            "Para THIERRY: Se você já cadastrou leads e eles não aparecem aqui, verifique se o status deles na tabela está como 'novo' ou em branco."
          </p>
          <div className="pt-4">
             <button 
              onClick={() => window.location.reload()}
              className="text-orange-500 text-xs font-bold uppercase tracking-widest hover:underline"
            >
              Recarregar base
            </button>
          </div>
        </div>
      </div>
    );
  }

  const reachedLimit = dailyCount >= limit;

  return (
    <div className="max-w-xl mx-auto">
      {reachedLimit && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3"
        >
          <AlertTriangle className="text-red-500 shrink-0" size={20} />
          <div>
            <p className="text-red-500 font-bold text-sm">Limite diário atingido!</p>
            <p className="text-red-500/80 text-xs">Você enviou {dailyCount} mensagens hoje. Para evitar bloqueios no WhatsApp, pare por agora e retorne amanhã.</p>
          </div>
        </motion.div>
      )}

      <div className={cn(
        "rounded-3xl border overflow-hidden transition-all duration-500 shadow-xl",
        theme === 'dark' ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-100"
      )}>
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20">
                <User size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight leading-tight">{lead.name}</h3>
                <div className="flex items-center gap-1.5 text-zinc-500 text-sm mt-1">
                  <Phone size={14} className="opacity-70" />
                  <span>{formatPhone(lead.phone)}</span>
                </div>
              </div>
            </div>
            <div className={cn(
              "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
              theme === 'dark' ? "bg-zinc-800 text-zinc-400" : "bg-zinc-100 text-zinc-500"
            )}>
              Lead #{lead.id.slice(0, 4)}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3 block">
                Mensagem de Abordagem
              </label>
              <div className={cn(
                "p-5 rounded-2xl border font-sans text-sm leading-relaxed relative group",
                theme === 'dark' ? "bg-zinc-950/50 border-zinc-800 text-zinc-300" : "bg-zinc-50 border-zinc-200 text-zinc-700"
              )}>
                {message}
                <button 
                  onClick={handleCopy}
                  className="absolute bottom-3 right-3 p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2 text-xs font-medium"
                >
                  <AnimatePresence mode="wait">
                    {copied ? (
                      <motion.span 
                        key="copied" 
                        initial={{ opacity: 0, scale: 0.8 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-1"
                      >
                        <CheckCircle2 size={14} className="text-green-400" /> Copiado
                      </motion.span>
                    ) : (
                      <motion.span 
                        key="copy" 
                        initial={{ opacity: 0, scale: 0.8 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-1"
                      >
                        <Copy size={14} /> Copiar
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                disabled={reachedLimit}
                onClick={handleOpenWhatsApp}
                className={cn(
                  "w-full py-4 px-6 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all shadow-lg active:scale-[0.98]",
                  reachedLimit 
                    ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700" 
                    : "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20"
                )}
              >
                <Send size={18} />
                Abrir WhatsApp
                <ExternalLink size={16} className="opacity-50" />
              </button>

              <div className="relative group">
                <button
                  disabled={reachedLimit || isSending}
                  onClick={handleConfirmContact}
                  className={cn(
                    "w-full py-4 px-6 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all border-2 active:scale-[0.98]",
                    (reachedLimit || isSending)
                      ? "border-zinc-800 text-zinc-600 cursor-not-allowed" 
                      : (theme === 'dark' 
                          ? "border-zinc-800 hover:bg-zinc-800 text-zinc-100" 
                          : "border-zinc-100 hover:bg-zinc-50 text-zinc-900 shadow-sm")
                  )}
                >
                  {isSending ? (
                    <>
                      <Loader2 size={18} className="animate-spin text-orange-500" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} className="text-green-500" />
                      Contato feito com sucesso!
                    </>
                  )}
                  <div 
                    className="ml-auto relative"
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                  >
                    <Info size={16} className="text-zinc-500 hover:text-orange-500 transition-colors" />
                    
                    <AnimatePresence>
                      {showTooltip && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className={cn(
                            "absolute bottom-full right-0 mb-4 w-64 p-3 rounded-xl text-xs font-medium shadow-2xl z-50 pointer-events-none",
                            theme === 'dark' ? "bg-zinc-800 text-zinc-200 border border-zinc-700" : "bg-white text-zinc-600 border border-zinc-100"
                          )}
                        >
                          Se a mensagem foi enviada, você pode marcar essa opção e o sistema vai te passar o próximo contato.
                          <div className={cn(
                            "absolute top-full right-4 -mt-1 h-3 w-3 rotate-45 border-r border-b",
                            theme === 'dark' ? "bg-zinc-800 border-zinc-700" : "bg-white border-zinc-100"
                          )} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className={cn(
          "px-8 py-4 border-t flex items-center justify-between",
          theme === 'dark' ? "bg-zinc-950/30 border-zinc-800" : "bg-zinc-50/50 border-zinc-100"
        )}>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-zinc-500 italic">Progresso diário</span>
            <div className="h-1.5 w-32 bg-zinc-800 rounded-full overflow-hidden">
               <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(dailyCount / limit) * 100}%` }}
                className={cn("h-full transition-all duration-1000", dailyCount > limit * 0.8 ? "bg-red-500" : "bg-orange-500")}
               />
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold text-zinc-400">{dailyCount}/{limit}</span>
        </div>
      </div>
    </div>
  );
}
