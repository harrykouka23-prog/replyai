import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, X } from 'lucide-react';

export default function PaymentBanner() {
  const [status, setStatus] = useState<'success' | 'cancelled' | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    if (payment === 'success') setStatus('success');
    else if (payment === 'cancelled') setStatus('cancelled');

    // Clean URL without reload
    if (payment) {
      const clean = window.location.pathname;
      window.history.replaceState({}, '', clean);
    }
  }, []);

  return (
    <AnimatePresence>
      {status && (
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl max-w-sm w-full"
          style={status === 'success'
            ? { background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', backdropFilter: 'blur(16px)' }
            : { background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', backdropFilter: 'blur(16px)' }
          }
        >
          {status === 'success'
            ? <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-400" />
            : <XCircle className="w-5 h-5 flex-shrink-0 text-amber-400" />
          }
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: status === 'success' ? '#34d399' : '#fbbf24' }}>
              {status === 'success' ? 'Paiement confirmé — Bienvenue en Pro !' : 'Paiement annulé'}
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>
              {status === 'success'
                ? 'Vos crédits illimités sont actifs. Rechargez la page si besoin.'
                : 'Votre abonnement n\'a pas été activé. Vous pouvez réessayer.'}
            </p>
          </div>
          <button onClick={() => setStatus(null)} style={{ color: '#475569' }}>
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
