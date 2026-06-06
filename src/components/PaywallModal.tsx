import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Check, X, Loader2, Star, Lock, Building2 } from 'lucide-react';

type PlanId = 'monthly' | 'yearly' | 'agency';

interface Plan {
  id: PlanId;
  name: string;
  badge?: string;
  badgeColor?: string;
  price: string;
  period: string;
  subline: string;
  icon: React.ReactNode;
  color: string;
  glow: string;
  border: string;
  borderActive: string;
  bgActive: string;
}

const PLANS: Plan[] = [
  {
    id: 'monthly',
    name: 'Lancement',
    badge: 'Prix bloqué à vie',
    badgeColor: 'rgba(251,191,36,0.15)',
    price: '19€',
    period: '/ mois',
    subline: 'Sans engagement · Prix garanti pour les premiers',
    icon: <Zap className="w-4 h-4" />,
    color: '#818cf8',
    glow: 'rgba(99,102,241,0.3)',
    border: 'rgba(99,102,241,0.15)',
    borderActive: 'rgba(99,102,241,0.5)',
    bgActive: 'rgba(99,102,241,0.08)',
  },
  {
    id: 'yearly',
    name: 'Annuel',
    badge: '✦ Recommandé',
    badgeColor: 'rgba(52,211,153,0.15)',
    price: '190€',
    period: '/ an',
    subline: '~15,80€ / mois · 2 mois offerts',
    icon: <Star className="w-4 h-4 fill-current" />,
    color: '#34d399',
    glow: 'rgba(52,211,153,0.25)',
    border: 'rgba(52,211,153,0.15)',
    borderActive: 'rgba(52,211,153,0.5)',
    bgActive: 'rgba(52,211,153,0.07)',
  },
  {
    id: 'agency',
    name: 'Agence',
    badge: '3–5 fiches GMB',
    badgeColor: 'rgba(168,85,247,0.15)',
    price: '49€',
    period: '/ mois',
    subline: 'Franchises & multi-établissements',
    icon: <Building2 className="w-4 h-4" />,
    color: '#c084fc',
    glow: 'rgba(168,85,247,0.25)',
    border: 'rgba(168,85,247,0.15)',
    borderActive: 'rgba(168,85,247,0.5)',
    bgActive: 'rgba(168,85,247,0.07)',
  },
];

const BENEFITS = [
  'Générations illimitées',
  'Analyse automatique du sentiment',
  'Retouche rapide (Traduction, Ton, Longueur)',
  'Support prioritaire 7j/7',
];

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
  token: string;
}

export default function PaywallModal({ open, onClose, token }: PaywallModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('yearly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activePlan = PLANS.find(p => p.id === selectedPlan)!;

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan: selectedPlan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erreur serveur');
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50"
            style={{ backdropFilter: 'blur(14px)', background: 'rgba(2,6,23,0.88)' }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.92, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none"
          >
            <div
              className="relative w-full max-w-lg pointer-events-auto rounded-3xl p-7 overflow-hidden"
              style={{
                background: 'linear-gradient(160deg, #0f172a 0%, #0c1222 60%, #110d2a 100%)',
                border: '1px solid rgba(99,102,241,0.25)',
                boxShadow: `0 0 0 1px rgba(99,102,241,0.08), 0 40px 100px -20px rgba(99,102,241,0.2), 0 0 100px -30px rgba(139,92,246,0.15)`,
              }}
            >
              {/* Top glow */}
              <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-80 h-64 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)' }} />

              {/* Close */}
              <button onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:bg-white/10"
                style={{ color: '#475569' }}>
                <X className="w-4 h-4" />
              </button>

              {/* Header */}
              <div className="flex flex-col items-center mb-6">
                <motion.div
                  animate={{ rotate: [0, -6, 6, -3, 3, 0] }}
                  transition={{ duration: 0.7, delay: 0.3 }}
                  className="relative mb-4"
                >
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                      boxShadow: '0 8px 32px rgba(99,102,241,0.45)',
                    }}>
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} className="absolute"
                      style={{ top: i === 0 ? -5 : i === 1 ? 3 : -2, right: i === 0 ? -4 : i === 1 ? -9 : 5 }}
                      animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.6 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}>
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    </motion.div>
                  ))}
                </motion.div>
                <h2 className="text-xl font-extrabold tracking-tight text-white text-center leading-snug">
                  Vous avez débloqué<br />le potentiel de vos avis&nbsp;!
                </h2>
                <p className="text-sm text-center mt-1.5 max-w-xs" style={{ color: '#64748b' }}>
                  Choisissez votre formule et continuez à répondre en 10 secondes.
                </p>
              </div>

              {/* ── Plan selector ─────────────────────────────────── */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                {PLANS.map((plan) => {
                  const active = selectedPlan === plan.id;
                  return (
                    <motion.button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelectedPlan(plan.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="relative flex flex-col items-center py-4 px-2 rounded-2xl transition-all duration-300 text-center overflow-hidden"
                      style={{
                        background: active ? plan.bgActive : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${active ? plan.borderActive : plan.border}`,
                        boxShadow: active ? `0 0 20px ${plan.glow}` : 'none',
                      }}
                    >
                      {/* Badge */}
                      {plan.badge && (
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{ background: plan.badgeColor, color: plan.color }}>
                          {plan.badge}
                        </div>
                      )}

                      <div className="mt-4" style={{ color: active ? plan.color : '#475569' }}>
                        {plan.icon}
                      </div>
                      <div className="text-xs font-semibold mt-1.5" style={{ color: active ? 'white' : '#64748b' }}>
                        {plan.name}
                      </div>
                      <div className="text-lg font-extrabold tracking-tight mt-1" style={{ color: active ? plan.color : '#475569' }}>
                        {plan.price}
                      </div>
                      <div className="text-[10px]" style={{ color: active ? plan.color : '#334155', opacity: 0.8 }}>
                        {plan.period}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Selected plan subline */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={selectedPlan}
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="text-center text-xs mb-5 font-medium"
                  style={{ color: activePlan.color }}
                >
                  {activePlan.subline}
                </motion.p>
              </AnimatePresence>

              {/* Benefits */}
              <ul className="space-y-2 mb-5">
                {BENEFITS.map((text, i) => (
                  <motion.li key={text}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.06 }}
                    className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)' }}>
                      <Check className="w-2.5 h-2.5 text-emerald-400" />
                    </div>
                    <span className="text-xs font-medium" style={{ color: '#94a3b8' }}>{text}</span>
                  </motion.li>
                ))}
              </ul>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="text-center text-xs mb-3 px-3 py-2 rounded-xl"
                    style={{ color: '#f87171', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* CTA */}
              <motion.button
                onClick={handleCheckout}
                disabled={loading}
                whileHover={loading ? {} : { scale: 1.02 }}
                whileTap={loading ? {} : { scale: 0.97 }}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-sm font-bold text-white transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: loading
                    ? 'rgba(99,102,241,0.35)'
                    : `linear-gradient(135deg, ${activePlan.color}cc 0%, #7c3aed 100%)`,
                  boxShadow: loading ? 'none' : `0 4px 28px ${activePlan.glow}`,
                  border: `1px solid ${activePlan.borderActive}`,
                }}
              >
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Redirection vers Stripe…</>
                  : <><Zap className="w-4 h-4 fill-current" /> Choisir {activePlan.name} · {activePlan.price}{activePlan.period}</>
                }
              </motion.button>

              {/* Trust */}
              <div className="flex items-center justify-center gap-5 mt-4">
                {['🔒 Paiement sécurisé', '✓ Annulation facile', '🇫🇷 Support FR'].map(t => (
                  <span key={t} className="text-[10px] font-medium" style={{ color: '#334155' }}>{t}</span>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
