import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Check, X, Loader2, Star, Lock, Building2 } from 'lucide-react';

type PlanId = 'monthly' | 'yearly' | 'agency';

interface Benefit {
  text: string;
  checked: boolean;
}

interface Plan {
  id: PlanId;
  name: string;
  badge?: string;
  price: string;
  period: string;
  bestFor: string;
  icon: React.ReactNode;
  color: string;
  glow: string;
  recommended?: boolean;
  benefits: Benefit[];
}

const CORE: Benefit[] = [
  { text: 'Générations illimitées', checked: true },
  { text: 'Analyse automatique du sentiment', checked: true },
  { text: 'Retouche rapide (traduction, ton, longueur)', checked: true },
  { text: 'Support prioritaire 7j/7', checked: true },
];

const PLANS: Plan[] = [
  {
    id: 'monthly',
    name: 'Lancement',
    badge: 'Prix bloqué à vie',
    price: '19€',
    period: '/ mois',
    bestFor: 'Idéal pour un commerce seul',
    icon: <Zap className="w-5 h-5" />,
    color: '#818cf8',
    glow: 'rgba(99,102,241,0.3)',
    benefits: [
      ...CORE,
      { text: '2 mois offerts', checked: false },
      { text: 'Multi-établissements (3–5 fiches)', checked: false },
    ],
  },
  {
    id: 'yearly',
    name: 'Annuel',
    badge: 'Recommandé',
    price: '190€',
    period: '/ an',
    bestFor: '~15,80€ / mois · le meilleur rapport',
    icon: <Star className="w-5 h-5 fill-current" />,
    color: '#34d399',
    glow: 'rgba(52,211,153,0.3)',
    recommended: true,
    benefits: [
      ...CORE,
      { text: '2 mois offerts', checked: true },
      { text: 'Multi-établissements (3–5 fiches)', checked: false },
    ],
  },
  {
    id: 'agency',
    name: 'Agence',
    badge: 'Multi-établissements',
    price: '49€',
    period: '/ mois',
    bestFor: 'Franchises & gestionnaires multi-sites',
    icon: <Building2 className="w-5 h-5" />,
    color: '#c084fc',
    glow: 'rgba(168,85,247,0.3)',
    benefits: [
      ...CORE,
      { text: '2 mois offerts', checked: false },
      { text: '3 à 5 fiches GMB incluses', checked: true },
    ],
  },
];

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
  token: string;
}

export default function PaywallModal({ open, onClose, token }: PaywallModalProps) {
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async (plan: PlanId) => {
    setLoadingPlan(plan);
    setError(null);
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erreur serveur');
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setLoadingPlan(null);
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
            initial={{ opacity: 0, scale: 0.94, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 overflow-y-auto pointer-events-none"
          >
            <div
              className="relative w-full max-w-4xl pointer-events-auto rounded-3xl p-7 overflow-hidden"
              style={{
                background: 'linear-gradient(160deg, #0f172a 0%, #0c1222 60%, #110d2a 100%)',
                border: '1px solid rgba(99,102,241,0.25)',
                boxShadow: '0 0 0 1px rgba(99,102,241,0.08), 0 40px 100px -20px rgba(99,102,241,0.2), 0 0 100px -30px rgba(139,92,246,0.15)',
              }}
            >
              {/* Top glow */}
              <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-64 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)' }} />

              {/* Close */}
              <button onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:bg-white/10 z-10"
                style={{ color: '#475569' }}>
                <X className="w-4 h-4" />
              </button>

              {/* Header */}
              <div className="flex flex-col items-center mb-7 relative">
                <div className="w-13 h-13 rounded-2xl flex items-center justify-center mb-3 p-3"
                  style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 8px 32px rgba(99,102,241,0.45)' }}>
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-extrabold tracking-tight text-white text-center leading-snug">
                  Choisissez votre formule
                </h2>
                <p className="text-sm text-center mt-1.5 max-w-sm" style={{ color: '#64748b' }}>
                  Générations illimitées dès aujourd'hui — répondez à tous vos avis en 10 secondes.
                </p>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="text-center text-xs mb-4 px-3 py-2 rounded-xl max-w-md mx-auto"
                    style={{ color: '#f87171', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Pricing cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {PLANS.map((plan, i) => {
                  const isLoading = loadingPlan === plan.id;
                  return (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
                      className="relative flex flex-col rounded-2xl p-5"
                      style={{
                        background: plan.recommended ? 'rgba(52,211,153,0.05)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${plan.recommended ? 'rgba(52,211,153,0.45)' : 'rgba(255,255,255,0.08)'}`,
                        boxShadow: plan.recommended ? `0 0 30px ${plan.glow}` : 'none',
                      }}
                    >
                      {plan.badge && (
                        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold px-2.5 py-1 rounded-full"
                          style={{ background: plan.color, color: '#0a0f1e' }}>
                          {plan.badge}
                        </div>
                      )}

                      {/* Header */}
                      <div className="flex flex-col items-center text-center pb-5 mb-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                        <div className="mb-3" style={{ color: plan.color }}>{plan.icon}</div>
                        <div className="text-sm font-semibold text-white">{plan.name}</div>
                        <div className="mt-2 flex items-baseline gap-1">
                          <span className="text-3xl font-extrabold tracking-tight" style={{ color: plan.color }}>{plan.price}</span>
                          <span className="text-xs" style={{ color: '#64748b' }}>{plan.period}</span>
                        </div>
                        <div className="text-[11px] mt-2 leading-snug" style={{ color: '#94a3b8' }}>{plan.bestFor}</div>
                      </div>

                      {/* Benefits */}
                      <div className="space-y-2.5 flex-1 mb-5">
                        {plan.benefits.map((b) => (
                          <div key={b.text} className="flex items-center gap-2.5">
                            <span className="grid place-content-center w-4 h-4 rounded-full flex-shrink-0"
                              style={b.checked
                                ? { background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)' }
                                : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                              {b.checked
                                ? <Check className="w-2.5 h-2.5 text-emerald-400" />
                                : <X className="w-2.5 h-2.5" style={{ color: '#475569' }} />}
                            </span>
                            <span className="text-xs font-medium" style={{ color: b.checked ? '#cbd5e1' : '#475569' }}>{b.text}</span>
                          </div>
                        ))}
                      </div>

                      {/* CTA */}
                      <motion.button
                        onClick={() => handleCheckout(plan.id)}
                        disabled={isLoading}
                        whileHover={isLoading ? {} : { scale: 1.02 }}
                        whileTap={isLoading ? {} : { scale: 0.97 }}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                        style={plan.recommended
                          ? { background: `linear-gradient(135deg, ${plan.color}, #7c3aed)`, color: 'white', boxShadow: `0 4px 24px ${plan.glow}` }
                          : { background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.12)' }}
                      >
                        {isLoading
                          ? <><Loader2 className="w-4 h-4 animate-spin" /> Redirection…</>
                          : <>Choisir {plan.name}</>}
                      </motion.button>
                    </motion.div>
                  );
                })}
              </div>

              {/* Trust */}
              <div className="flex items-center justify-center gap-5 mt-6 flex-wrap">
                {['🔒 Paiement sécurisé par Stripe', '✓ Annulation à tout moment', '🇫🇷 Support FR'].map(t => (
                  <span key={t} className="text-[11px] font-medium" style={{ color: '#64748b' }}>{t}</span>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
