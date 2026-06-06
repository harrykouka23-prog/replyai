import { motion } from 'framer-motion';
import { Sparkles, Zap, Crown } from 'lucide-react';

interface HeaderProps {
  actualCredits: number;
  userName: string;
  isPro: boolean;
  onLogout?: () => void;
  onUpgradeClick?: () => void;
  creditsUsed?: number;
  totalCredits?: number;
}

export default function Header({
  actualCredits,
  userName,
  isPro,
  onUpgradeClick,
}: HeaderProps) {
  const MAX = 20;
  const pct = Math.max(0, Math.min(100, (actualCredits / MAX) * 100));
  const low = actualCredits <= 3 && !isPro;

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-xl"
      style={{ background: 'rgba(10,15,30,0.85)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">

        {/* ── Logo ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, #1e3a5f, #4f46e5)' }}>
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-[15px] font-bold tracking-tight text-white">
            Reply<span style={{ color: '#818cf8' }}>AI</span>
          </span>
          <span className="hidden sm:inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full tracking-wide"
            style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)' }}>
            BETA
          </span>
        </div>

        {/* ── Right section ────────────────────────────────────── */}
        <div className="flex items-center gap-3">

          {isPro ? (
            /* ── Badge PRO ──────────────────────────────────────── */
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
              style={{
                background: 'linear-gradient(135deg, rgba(234,179,8,0.15), rgba(161,140,8,0.1))',
                border: '1px solid rgba(234,179,8,0.35)',
                color: '#fbbf24',
                boxShadow: '0 0 16px rgba(234,179,8,0.12)',
              }}
            >
              <Crown className="w-3.5 h-3.5 fill-current" />
              PRO
            </motion.div>
          ) : (
            /* ── Barre de crédits ───────────────────────────────── */
            <div className="hidden sm:flex flex-col items-end gap-1">
              <div className="flex items-center justify-between w-full gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>
                  Crédits
                </span>
                <span className={`text-xs font-bold tabular-nums ${low ? 'text-red-400' : 'text-slate-300'}`}>
                  {actualCredits}
                </span>
              </div>
              <div className="w-24 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: low
                      ? 'linear-gradient(90deg, #ef4444, #f97316)'
                      : 'linear-gradient(90deg, #6366f1, #a78bfa)',
                  }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>
            </div>
          )}

          {/* ── Avatar utilisateur ──────────────────────────────── */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
            style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
              style={{ background: isPro ? 'linear-gradient(135deg, #d97706, #b45309)' : 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
            >
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:inline">{userName}</span>
          </div>

          {/* ── Bouton upgrade (seulement si pas Pro) ───────────── */}
          {!isPro && actualCredits === 0 && (
            <motion.button
              onClick={onUpgradeClick}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
                color: 'white',
                boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
              }}
            >
              <Zap className="w-3.5 h-3.5" /> Passer à Pro
            </motion.button>
          )}
        </div>
      </div>
    </header>
  );
}
