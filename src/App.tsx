import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, FlaskConical } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import Header from './components/Header';
import GenerateForm from './components/GenerateForm';
import ResultsPanel from './components/ResultsPanel';
import PaywallModal from './components/PaywallModal';
import PaymentBanner from './components/PaymentBanner';
import { useGenerate } from './hooks/useGenerate';
import { useProfile } from './hooks/useProfile';
import { useRefine } from './hooks/useRefine';
import { useProStatus } from './hooks/useProStatus';
import type { ToneOption, EstablishmentType, Sentiment, RefineAction } from './types';

const KEYS = ['reponse_1', 'reponse_2', 'reponse_3'] as const;

export default function App() {
  const { user, token, loading: authLoading, logout, updateCredits } = useAuth();
  const { profile, saveProfile } = useProfile();
  const { generate, loading, streaming, responses, error, paywallOpen, setPaywallOpen, setResponses } = useGenerate();
  const { refining, refine } = useRefine();
  const { isPro, isDevMode, toggle: togglePro, reset: resetPro } = useProStatus(user?.is_pro ?? false);

  // ── Form state ────────────────────────────────────────────────────────────
  const [establishmentName, setEstablishmentName] = useState(profile?.name ?? '');
  const [type, setType]     = useState<EstablishmentType>(profile?.type ?? 'Restaurant');
  const [review, setReview] = useState('');
  const [tone, setTone]     = useState<ToneOption>('Professionnel');
  const [sentiment, setSentiment] = useState<Sentiment>('positif');
  const [editedResponses, setEditedResponses] = useState<Record<number, string>>({});

  // ── Merged responses (avec retouches in-place) ────────────────────────────
  const getResponseText = useCallback(
    (key: typeof KEYS[number], index: number) => editedResponses[index] ?? responses?.[key] ?? '',
    [editedResponses, responses],
  );

  const mergedResponses = responses
    ? { reponse_1: getResponseText('reponse_1', 0), reponse_2: getResponseText('reponse_2', 1), reponse_3: getResponseText('reponse_3', 2) }
    : null;

  const buildPayload = () => ({
    nom_etablissement: establishmentName,
    type_etablissement: type,
    avis_client: review,
    ton: tone,
    sentiment,
  });

  // ── Generate ──────────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setEditedResponses({});

    // Si Pro → crédits illimités, on passe un nombre fictif élevé pour bypasser le check
    const effectiveCredits = isPro ? Infinity : (user?.credits ?? 0);
    generate(buildPayload(), token, effectiveCredits, isPro ? () => {} : updateCredits);
  };

  const handleRegenerate = () => {
    if (!token) return;
    setEditedResponses({});
    setResponses(null);
    const effectiveCredits = isPro ? Infinity : (user?.credits ?? 0);
    generate(buildPayload(), token, effectiveCredits, isPro ? () => {} : updateCredits);
  };

  // ── Refine ────────────────────────────────────────────────────────────────
  const handleRefine = async (cardIndex: number, action: RefineAction) => {
    const currentText = editedResponses[cardIndex] ?? responses?.[KEYS[cardIndex]] ?? '';
    if (!currentText || !token) return;
    try {
      await refine(
        cardIndex, currentText, action, token,
        (idx, newText) => setEditedResponses(prev => ({ ...prev, [idx]: newText })),
        isPro ? () => {} : updateCredits,
      );
    } catch (err) { console.error('Refine error:', err); }
  };

  // ── Auth loading ──────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0f1e' }}>
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user || !token) return <AuthPage />;

  const creditsDisplay = isPro ? 999999 : (user.credits ?? 0);

  return (
    <div className="min-h-screen font-sans antialiased" style={{ background: '#0a0f1e' }}>
      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #3730a3 0%, transparent 70%)' }} />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #1d4ed8 0%, transparent 70%)' }} />
        <div className="absolute -bottom-20 left-1/3 w-[400px] h-[400px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />
      </div>

      {/* Banners & modals */}
      <PaymentBanner />
      <PaywallModal open={paywallOpen} onClose={() => setPaywallOpen(false)} token={token} />

      <div className="relative z-10">
        <Header
          actualCredits={creditsDisplay}
          userName={user.name}
          isPro={isPro}
          onLogout={logout}
          onUpgradeClick={() => setPaywallOpen(true)}
        />

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 border text-indigo-400 text-[11px] font-semibold px-3 py-1.5 rounded-full mb-4"
              style={{ background: 'rgba(99,102,241,0.1)', borderColor: 'rgba(99,102,241,0.25)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              {isPro
                ? `👑 Bonjour ${user.name} · Accès Pro illimité`
                : `Bonjour ${user.name} · ${user.credits} crédit${user.credits > 1 ? 's' : ''} disponible${user.credits > 1 ? 's' : ''}`
              }
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tighter text-white leading-tight">
              Répondez à vos avis Google
              <span className="text-transparent bg-clip-text block sm:inline"
                style={{ backgroundImage: 'linear-gradient(135deg, #818cf8, #a78bfa)' }}>
                {' '}en 10 secondes.
              </span>
            </h1>
            <p className="mt-3 text-sm sm:text-base max-w-md mx-auto leading-relaxed" style={{ color: '#94a3b8' }}>
              3 réponses naturelles générées en temps réel. Copiez, collez, publiez.
            </p>
          </motion.div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="mb-6 text-red-400 text-sm px-4 py-3 rounded-xl flex items-center gap-2 max-w-2xl mx-auto border"
                style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.2)' }}
              >
                <span className="font-semibold">Erreur :</span> {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5">
              <GenerateForm
                profile={profile}
                onSaveProfile={(name, t) => { saveProfile(name, t); setEstablishmentName(name); setType(t); }}
                establishmentName={establishmentName}
                onNameChange={setEstablishmentName}
                type={type}
                onTypeChange={setType}
                review={review}
                onReviewChange={setReview}
                tone={tone}
                onToneChange={setTone}
                sentiment={sentiment}
                onSentimentChange={setSentiment}
                loading={loading}
                creditsLeft={isPro ? Infinity : (user.credits ?? 0)}
                onSubmit={handleSubmit}
              />
            </div>
            <ResultsPanel
              loading={loading}
              streaming={streaming}
              responses={mergedResponses}
              refining={refining}
              isPro={isPro}
              onRegenerate={handleRegenerate}
              onRefine={handleRefine}
              onUpgradeClick={() => setPaywallOpen(true)}
            />
          </div>
        </main>

        {/* ── Footer ───────────────────────────────────────────── */}
        <footer
          className="py-5 mt-4 flex items-center justify-center gap-5"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          <p className="text-[11px] font-medium" style={{ color: '#334155' }}>
            © {new Date().getFullYear()} ReplyAI · Propulsé par Claude · Anthropic
          </p>
          <button onClick={logout}
            className="flex items-center gap-1 text-[11px] font-medium transition-colors duration-200 hover:text-slate-400"
            style={{ color: '#334155' }}>
            <LogOut className="w-3 h-3" /> Déconnexion
          </button>

          {/* ── Toggle DEV (toujours visible en dev, discret) ──── */}
          <AnimatePresence>
            <motion.button
              onClick={togglePro}
              title="Toggle isPro (dev only) — aussi Ctrl+Shift+P"
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all duration-200"
              style={isDevMode
                ? { background: 'rgba(234,179,8,0.12)', color: '#fbbf24', border: '1px solid rgba(234,179,8,0.25)' }
                : { background: 'rgba(255,255,255,0.03)', color: '#334155', border: '1px solid rgba(255,255,255,0.07)' }
              }
            >
              <FlaskConical className="w-3 h-3" />
              {isPro ? 'Mode PRO actif' : 'Mode FREE'} {isDevMode && '(surchargé)'}
            </motion.button>
          </AnimatePresence>

          {isDevMode && (
            <button onClick={resetPro} className="text-[10px] transition-colors duration-200"
              style={{ color: '#334155' }} title="Réinitialiser le toggle dev">
              reset
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
