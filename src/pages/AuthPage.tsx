import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Mail, Lock, User, Eye, EyeOff, Loader2, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import WaveCanvas from '../components/WaveCanvas';

type Tab = 'login' | 'register';

export default function AuthPage() {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<Tab>('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (tab === 'register') await register(name, email, password);
      else await login(email, password);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      if (msg === '__EMAIL_CONFIRM__') {
        setEmailSent(true); // Affiche l'écran de confirmation
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `
    w-full pl-10 pr-4 py-3 text-sm rounded-xl transition-all duration-300
    bg-white/5 border border-white/10 text-white placeholder:text-slate-600
    focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20
  `;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
      style={{ background: '#0a0f1e' }}>

      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #3730a3 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />
      </div>

      {/* Fond animé (vagues réactives à la souris) */}
      <WaveCanvas className="fixed inset-0 pointer-events-none" style={{ zIndex: 0, opacity: 0.9 }} />

      <div className="relative z-10 w-full max-w-md">

        {/* ── Écran confirmation email ───────────────────────────── */}
        <AnimatePresence>
          {emailSent && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl p-8 text-center"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)' }}
            >
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
                <CheckCircle className="w-7 h-7" style={{ color: '#818cf8' }} />
              </div>
              <h2 className="text-lg font-bold text-white mb-2">Vérifiez votre email</h2>
              <p className="text-sm mb-1" style={{ color: '#94a3b8' }}>
                Un lien de confirmation a été envoyé à
              </p>
              <p className="text-sm font-semibold mb-5" style={{ color: '#818cf8' }}>{email}</p>
              <p className="text-xs leading-relaxed" style={{ color: '#475569' }}>
                Cliquez sur le lien dans l'email pour activer votre compte.<br />
                Ensuite revenez ici et connectez-vous.
              </p>
              <button
                onClick={() => { setEmailSent(false); setTab('login'); }}
                className="mt-6 w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-300"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
              >
                J'ai confirmé → Se connecter
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {emailSent ? null : (<>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-xl"
            style={{ background: 'linear-gradient(135deg, #1e3a5f, #4f46e5)' }}>
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-white">
            Reply<span style={{ color: '#818cf8' }}>AI</span>
          </span>
          <p className="text-base font-semibold mt-2 text-center max-w-xs" style={{ color: '#cbd5e1' }}>
            Répondez à tous vos avis Google en 10 secondes.
          </p>
          <p className="text-sm mt-1.5" style={{ color: '#64748b' }}>
            {tab === 'register'
              ? 'Créez votre compte gratuit — 20 crédits offerts'
              : 'Bon retour 👋 Connectez-vous à votre compte'}
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="rounded-2xl p-7"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)' }}
        >
          {/* Tabs */}
          <div className="flex rounded-xl p-1 mb-6" style={{ background: 'rgba(255,255,255,0.04)' }}>
            {(['register', 'login'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(null); }}
                className="relative flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-300 z-10"
                style={{ color: tab === t ? 'white' : '#475569' }}
              >
                {tab === t && (
                  <motion.div
                    layoutId="tab-bg"
                    className="absolute inset-0 rounded-lg"
                    style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <span className="relative z-10">
                  {t === 'register' ? 'Créer un compte' : 'Se connecter'}
                </span>
              </button>
            ))}
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 px-4 py-3 rounded-xl text-sm overflow-hidden"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence initial={false}>
              {tab === 'register' && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#475569' }} />
                    <input
                      type="text"
                      required={tab === 'register'}
                      placeholder="Votre prénom"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#475569' }} />
              <input
                type="email"
                required
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#475569' }} />
              <input
                type={showPw ? 'text' : 'password'}
                required
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputClass} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-200"
                style={{ color: '#475569' }}
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={loading ? {} : { scale: 1.01 }}
              whileTap={loading ? {} : { scale: 0.97 }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 mt-2"
              style={{
                background: 'linear-gradient(135deg, #1e3a5f, #4f46e5, #7c3aed)',
                boxShadow: '0 4px 24px rgba(99,102,241,0.35)',
              }}
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Chargement…</>
                : tab === 'register'
                  ? <><Sparkles className="w-4 h-4" /> Créer mon compte gratuit</>
                  : <><ArrowRight className="w-4 h-4" /> Se connecter</>
              }
            </motion.button>
          </form>

          {tab === 'register' && (
            <p className="text-center text-[11px] mt-4" style={{ color: '#334155' }}>
              En créant un compte vous acceptez nos conditions d'utilisation.
            </p>
          )}
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col items-center gap-3 mt-6"
        >
          <div className="flex items-center justify-center gap-4">
            {['🍽️ Restaurateurs', '✂️ Coiffeurs', '🏨 Hôteliers'].map((label) => (
              <span key={label} className="text-[11px] font-medium" style={{ color: '#64748b' }}>{label}</span>
            ))}
          </div>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {['⚡ 3 réponses en 10s', '🎯 Ton sur-mesure', '✓ Prêt à publier'].map((label) => (
              <span
                key={label}
                className="text-[11px] font-medium px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(99,102,241,0.10)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.20)' }}
              >
                {label}
              </span>
            ))}
          </div>
        </motion.div>

        </>)}
      </div>
    </div>
  );
}
