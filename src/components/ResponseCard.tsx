import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Loader2, Lock } from 'lucide-react';
import type { RefineAction } from '../types';

const OPTION_META = [
  { label: 'Option 1 · Direct et professionnel', dot: '#818cf8', bg: 'rgba(99,102,241,0.08)',  border: 'rgba(99,102,241,0.2)',  text: '#a5b4fc' },
  { label: 'Option 2 · Chaleureux et personnel',  dot: '#a78bfa', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.2)', text: '#c4b5fd' },
  { label: 'Option 3 · Dynamique et engageant',   dot: '#60a5fa', bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.2)',  text: '#93c5fd' },
];

const REFINE_ACTIONS: { action: RefineAction; icon: string; label: string; tooltip: string }[] = [
  { action: 'translate', icon: '🇬🇧', label: 'EN',     tooltip: 'Traduire en anglais' },
  { action: 'shorten',   icon: '✂️',  label: 'Court',  tooltip: 'Raccourcir' },
  { action: 'formalize', icon: '👔',  label: 'Formel', tooltip: 'Plus formel' },
];

interface ResponseCardProps {
  index: number;
  text: string;
  streaming?: boolean;
  refining?: RefineAction | null;
  isPro: boolean;
  onRefine: (action: RefineAction) => void;
  onUpgradeClick: () => void;
}

export default function ResponseCard({
  index, text, streaming = false,
  refining, isPro, onRefine, onUpgradeClick,
}: ResponseCardProps) {
  const [copied, setCopied] = useState(false);
  const meta = OPTION_META[index] ?? OPTION_META[0];
  const isRefining = !!refining;

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefineClick = (action: RefineAction) => {
    if (!isPro) { onUpgradeClick(); return; }
    if (!isRefining) onRefine(action);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08, ease: 'easeOut' }}
      className="glow-border rounded-2xl p-5 transition-all duration-300"
      style={{
        background: streaming ? 'rgba(99,102,241,0.04)' : 'rgba(255,255,255,0.03)',
        border: streaming ? '1px solid rgba(99,102,241,0.25)' : '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Label */}
      <div
        className="inline-flex items-center gap-1.5 text-[10px] font-semibold rounded-full px-2.5 py-1 mb-3 tracking-wide"
        style={{ background: meta.bg, border: `1px solid ${meta.border}`, color: meta.text }}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${streaming ? 'animate-pulse' : ''}`} style={{ background: meta.dot }} />
        {meta.label}
      </div>

      {/* Text */}
      <p
        className="text-sm leading-relaxed whitespace-pre-line pb-4 min-h-[60px] transition-colors duration-300"
        style={{ color: isRefining ? '#64748b' : '#cbd5e1' }}
      >
        {text}
        {streaming && (
          <span className="inline-block w-0.5 h-4 ml-0.5 rounded-full animate-pulse align-middle" style={{ background: '#818cf8' }} />
        )}
      </p>

      {/* Footer */}
      <div className="pt-3 space-y-2.5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>

        {/* ── Toolbar retouche ──────────────────────────────────── */}
        {!streaming && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-semibold uppercase tracking-widest mr-1" style={{ color: '#334155' }}>
              Retoucher :
            </span>

            {REFINE_ACTIONS.map(({ action, icon, label, tooltip }) => {
              const active = refining === action;
              const locked = !isPro;

              return (
                <motion.button
                  key={action}
                  type="button"
                  onClick={() => handleRefineClick(action)}
                  disabled={isRefining && !active}
                  whileHover={{ scale: locked ? 1 : 1.05 }}
                  whileTap={{ scale: locked ? 0.98 : 0.93 }}
                  title={locked ? '🔒 Fonctionnalité Pro' : tooltip}
                  className="relative flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all duration-200"
                  style={
                    locked
                      ? { background: 'rgba(255,255,255,0.02)', color: '#334155', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }
                      : active
                        ? { background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.35)' }
                        : { background: 'rgba(255,255,255,0.04)', color: '#64748b', border: '1px solid rgba(255,255,255,0.07)' }
                  }
                >
                  {active
                    ? <Loader2 className="w-3 h-3 animate-spin" />
                    : locked
                      ? <Lock className="w-3 h-3" style={{ color: '#334155' }} />
                      : <span>{icon}</span>
                  }
                  <span>{label}</span>
                </motion.button>
              );
            })}

            {/* Hint upgrade si pas Pro */}
            {!isPro && (
              <button
                onClick={onUpgradeClick}
                className="text-[10px] font-semibold ml-auto transition-colors duration-200"
                style={{ color: '#4f46e5' }}
              >
                Débloquer avec Pro →
              </button>
            )}
          </div>
        )}

        {/* ── Copie + compteur ──────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium" style={{ color: '#334155' }}>
            {text.length} caractères
          </span>

          <motion.button
            onClick={handleCopy}
            disabled={streaming || !text || isRefining}
            whileTap={{ scale: 0.93 }}
            className="relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
            style={
              copied
                ? { background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.25)' }
                : { background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }
            }
          >
            <AnimatePresence mode="wait" initial={false}>
              {copied ? (
                <motion.span key="check"
                  initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }} transition={{ duration: 0.15 }}
                  className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" /> Copié !
                </motion.span>
              ) : (
                <motion.span key="copy"
                  initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }} transition={{ duration: 0.15 }}
                  className="flex items-center gap-1.5">
                  <Copy className="w-3.5 h-3.5" /> Copier
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
