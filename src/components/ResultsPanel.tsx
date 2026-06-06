import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Clock, Heart, TrendingUp, Link } from 'lucide-react';
import type { ResponseData, RefineAction } from '../types';
import SkeletonCard from './SkeletonCard';
import ResponseCard from './ResponseCard';

interface StreamState {
  reponse_1: string;
  reponse_2: string;
  reponse_3: string;
  activeIndex: number;
}

interface RefiningState {
  cardIndex: number;
  action: RefineAction;
}

interface ResultsPanelProps {
  loading: boolean;
  streaming: StreamState | null;
  responses: ResponseData | null;
  refining: RefiningState | null;
  isPro: boolean;
  onRegenerate: () => void;
  onRefine: (cardIndex: number, action: RefineAction) => void;
  onUpgradeClick: () => void;
}

const KEYS = ['reponse_1', 'reponse_2', 'reponse_3'] as const;

const B2B_BENEFITS = [
  { icon: Clock,     title: 'Gagnez 3h par semaine',      desc: 'Finies les heures perdues à chercher les bons mots. Une réponse pro en 10 secondes.',             color: '#818cf8', bg: 'rgba(99,102,241,0.08)',  border: 'rgba(99,102,241,0.15)' },
  { icon: Heart,     title: 'Fidélisez votre clientèle',   desc: 'Un client qui reçoit une réponse personnalisée revient 2× plus souvent.',                          color: '#f472b6', bg: 'rgba(244,114,182,0.08)', border: 'rgba(244,114,182,0.15)' },
  { icon: TrendingUp, title: 'Améliorez votre SEO Local', desc: 'Google favorise les fiches avec des réponses régulières. Remontez dans les résultats.',             color: '#34d399', bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.15)' },
];

export default function ResultsPanel({
  loading, streaming, responses, refining,
  isPro, onRegenerate, onRefine, onUpgradeClick,
}: ResultsPanelProps) {
  const showSkeleton  = loading && !streaming;
  const showStreaming  = !!streaming;
  const showResults   = !!responses && !streaming;

  return (
    <div className="lg:col-span-7 space-y-3">
      <AnimatePresence mode="wait">

        {/* ── Empty state B2B ───────────────────────────────────── */}
        {!loading && !streaming && !responses && (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            {B2B_BENEFITS.map(({ icon: Icon, title, desc, color, bg, border }, i) => (
              <motion.div key={title}
                initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="flex items-start gap-4 p-4 rounded-2xl"
                style={{ background: bg, border: `1px solid ${border}` }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white leading-tight">{title}</p>
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: '#64748b' }}>{desc}</p>
                </div>
              </motion.div>
            ))}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="relative rounded-2xl p-4 flex items-center gap-3 cursor-not-allowed"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.12)' }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(234,67,53,0.1)', border: '1px solid rgba(234,67,53,0.2)' }}>
                <Link className="w-4 h-4" style={{ color: '#f87171' }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: '#64748b' }}>Lier mon compte Google My Business</p>
                <p className="text-xs mt-0.5" style={{ color: '#334155' }}>Publiez vos réponses directement depuis ReplyAI</p>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex-shrink-0"
                style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)' }}>
                ✨ Bientôt
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ── Skeletons ─────────────────────────────────────────── */}
        {showSkeleton && (
          <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            <div className="shimmer h-3 w-40 rounded-md" />
            {[0, 1, 2].map(n => <SkeletonCard key={n} index={n} />)}
          </motion.div>
        )}

        {/* ── Streaming ─────────────────────────────────────────── */}
        {showStreaming && (
          <motion.div key="streaming" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            <div className="flex items-center gap-2 pb-1">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>
                Génération en cours…
              </span>
            </div>
            {KEYS.map((key, i) =>
              (streaming[key] || streaming.activeIndex >= i) && (
                <ResponseCard key={key} index={i} text={streaming[key]}
                  streaming={streaming.activeIndex === i}
                  isPro={isPro} onRefine={() => {}} onUpgradeClick={onUpgradeClick}
                />
              )
            )}
          </motion.div>
        )}

        {/* ── Résultats finaux ──────────────────────────────────── */}
        {showResults && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>
                  3 suggestions générées
                </span>
              </div>
              <motion.button onClick={onRegenerate}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
                className="flex items-center gap-1.5 text-[11px] font-semibold"
                style={{ color: '#818cf8' }}>
                <RefreshCw className="w-3 h-3" /> Régénérer
              </motion.button>
            </div>

            {KEYS.map((key, i) => (
              <ResponseCard
                key={key} index={i} text={responses![key]}
                refining={refining?.cardIndex === i ? refining.action : null}
                isPro={isPro}
                onRefine={action => onRefine(i, action)}
                onUpgradeClick={onUpgradeClick}
              />
            ))}
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
