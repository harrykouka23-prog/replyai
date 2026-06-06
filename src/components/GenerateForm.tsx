import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, Pencil, Building2, Check } from 'lucide-react';
import type { ToneOption, EstablishmentType, Sentiment, BusinessProfile } from '../types';

const ESTABLISHMENT_TYPES: { value: EstablishmentType; label: string; emoji: string }[] = [
  { value: 'Restaurant', label: 'Restaurant', emoji: '🍽️' },
  { value: 'Coiffeur', label: 'Coiffeur / Beauté', emoji: '✂️' },
  { value: 'Hôtel', label: 'Hôtel / Hébergement', emoji: '🏨' },
  { value: 'Artisan', label: 'Artisan / BTP', emoji: '🔧' },
  { value: 'Autre', label: 'Autre commerce', emoji: '🏪' },
];

const TONES: { value: ToneOption; emoji: string; sub: string }[] = [
  { value: 'Professionnel', emoji: '💼', sub: 'Formel & soigné' },
  { value: 'Chaleureux', emoji: '🤝', sub: 'Humain & proche' },
  { value: 'Dynamique', emoji: '⚡', sub: 'Vif & moderne' },
];

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', fontSize: '14px', color: '#e2e8f0',
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px', outline: 'none', transition: 'all 0.3s ease',
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748b',
  textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px',
};

interface Props {
  profile: BusinessProfile | null;
  onSaveProfile: (name: string, type: EstablishmentType) => void;
  establishmentName: string;
  onNameChange: (v: string) => void;
  type: EstablishmentType;
  onTypeChange: (v: EstablishmentType) => void;
  review: string;
  onReviewChange: (v: string) => void;
  tone: ToneOption;
  onToneChange: (v: ToneOption) => void;
  sentiment: Sentiment;
  onSentimentChange: (v: Sentiment) => void;
  loading: boolean;
  creditsLeft: number;
  onSubmit: (e: React.FormEvent) => void;
}

export default function GenerateForm({
  profile, onSaveProfile,
  establishmentName, onNameChange,
  type, onTypeChange,
  review, onReviewChange,
  tone, onToneChange,
  sentiment, onSentimentChange,
  loading, creditsLeft, onSubmit,
}: Props) {
  const [editingProfile, setEditingProfile] = useState(!profile);
  const disabled = loading || creditsLeft === 0;

  const handleSaveProfile = () => {
    if (establishmentName.trim()) {
      onSaveProfile(establishmentName, type);
      setEditingProfile(false);
    }
  };

  const typeEmoji = ESTABLISHMENT_TYPES.find(t => t.value === type)?.emoji ?? '🏢';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="rounded-2xl p-6 sm:p-7 space-y-5"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}
    >
      {/* ── Section Profil ─────────────────────────────────────── */}
      <div>
        <label style={labelStyle}>Mon établissement</label>

        <AnimatePresence mode="wait">
          {/* Mode compact */}
          {profile && !editingProfile ? (
            <motion.div
              key="compact"
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{typeEmoji}</span>
                <div>
                  <p className="text-sm font-semibold text-white leading-tight">{profile.name}</p>
                  <p className="text-[11px]" style={{ color: '#6366f1' }}>{profile.type}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingProfile(true)}
                className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-lg transition-all duration-200"
                style={{ color: '#818cf8', background: 'rgba(99,102,241,0.1)' }}
              >
                <Pencil className="w-3 h-3" /> Modifier
              </button>
            </motion.div>
          ) : (
            /* Mode édition */
            <motion.div
              key="edit"
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
              className="space-y-3"
            >
              <input
                type="text"
                required
                placeholder="Ex : Le Bistrot des Artistes"
                value={establishmentName}
                onChange={(e) => onNameChange(e.target.value)}
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = 'rgba(99,102,241,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
              />
              <div className="relative">
                <select
                  value={type}
                  onChange={(e) => onTypeChange(e.target.value as EstablishmentType)}
                  style={{ ...inputStyle, appearance: 'none', paddingRight: '36px', cursor: 'pointer' }}
                  onFocus={(e) => { e.target.style.borderColor = 'rgba(99,102,241,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                >
                  {ESTABLISHMENT_TYPES.map(({ value, label, emoji }) => (
                    <option key={value} value={value} style={{ background: '#111827' }}>{emoji} {label}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center" style={{ color: '#64748b' }}>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {profile && (
                <div className="flex gap-2">
                  <button type="button" onClick={handleSaveProfile}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
                    style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.25)' }}>
                    <Check className="w-3.5 h-3.5" /> Enregistrer
                  </button>
                  <button type="button" onClick={() => setEditingProfile(false)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
                    style={{ background: 'rgba(255,255,255,0.05)', color: '#64748b', border: '1px solid rgba(255,255,255,0.08)' }}>
                    Annuler
                  </button>
                </div>
              )}
              {!profile && establishmentName.trim() && (
                <button type="button" onClick={handleSaveProfile}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
                  style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>
                  <Building2 className="w-3.5 h-3.5" /> Mémoriser ce profil
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        {/* ── Avis + Sentiment ───────────────────────────────────── */}
        <div>
          <label style={labelStyle}>Avis client à traiter</label>
          <textarea
            required
            rows={4}
            placeholder="Collez l'avis Google ici… ex : « Super restaurant, le personnel est adorable ! »"
            value={review}
            onChange={(e) => onReviewChange(e.target.value)}
            style={{ ...inputStyle, resize: 'none', lineHeight: '1.6' }}
            onFocus={(e) => { e.target.style.borderColor = 'rgba(99,102,241,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'; }}
            onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
          />

          {/* Sentiment badges */}
          <div className="flex gap-2 mt-2.5">
            {([
              { value: 'positif' as Sentiment, label: '👍 Avis positif', sub: 'Remercier', activeBg: 'rgba(16,185,129,0.1)', activeBorder: 'rgba(16,185,129,0.3)', activeText: '#34d399' },
              { value: 'negatif' as Sentiment, label: '⚠️ Avis négatif', sub: 'Désamorcer', activeBg: 'rgba(245,158,11,0.1)', activeBorder: 'rgba(245,158,11,0.3)', activeText: '#fbbf24' },
            ]).map(({ value, label, sub, activeBg, activeBorder, activeText }) => {
              const active = sentiment === value;
              return (
                <motion.button
                  key={value}
                  type="button"
                  onClick={() => onSentimentChange(value)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  className="flex-1 py-2 px-3 rounded-xl text-left transition-all duration-300"
                  style={{
                    background: active ? activeBg : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${active ? activeBorder : 'rgba(255,255,255,0.07)'}`,
                  }}
                >
                  <div className="text-xs font-semibold" style={{ color: active ? activeText : '#64748b' }}>{label}</div>
                  <div className="text-[10px] mt-0.5" style={{ color: active ? activeText : '#334155', opacity: active ? 0.8 : 1 }}>{sub}</div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* ── Ton ───────────────────────────────────────────────── */}
        <div>
          <label style={labelStyle}>Ton de la réponse</label>
          <div className="grid grid-cols-3 gap-2">
            {TONES.map(({ value, emoji, sub }) => {
              const active = tone === value;
              return (
                <motion.button
                  key={value} type="button" onClick={() => onToneChange(value)}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}
                  className="relative py-3 px-2 rounded-xl text-center transition-all duration-300"
                  style={{
                    background: active ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
                    border: active ? '1px solid rgba(99,102,241,0.45)' : '1px solid rgba(255,255,255,0.07)',
                    boxShadow: active ? '0 0 16px rgba(99,102,241,0.15)' : 'none',
                  }}
                >
                  <div className="text-base mb-0.5">{emoji}</div>
                  <div className="text-[11px] font-semibold" style={{ color: active ? '#a5b4fc' : '#94a3b8' }}>{value}</div>
                  <div className="text-[9px] mt-0.5 font-medium" style={{ color: active ? '#6366f1' : '#475569' }}>{sub}</div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* ── CTA ───────────────────────────────────────────────── */}
        <motion.button
          type="submit"
          disabled={disabled}
          whileHover={disabled ? {} : { scale: 1.01 }}
          whileTap={disabled ? {} : { scale: 0.97 }}
          className="w-full flex items-center justify-center gap-2 text-white text-sm font-semibold py-3 px-4 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
          style={{
            background: disabled ? 'rgba(99,102,241,0.3)' : 'linear-gradient(135deg, #1e3a5f 0%, #4f46e5 60%, #7c3aed 100%)',
            boxShadow: disabled ? 'none' : '0 4px 24px rgba(99,102,241,0.35)',
          }}
        >
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Génération en cours…</span></>
            : <><Sparkles className="w-4 h-4" /><span>Générer les réponses</span></>
          }
        </motion.button>
      </form>
    </motion.div>
  );
}
