import { useEffect, useState } from 'react';

const DEV_KEY = 'replyai_dev_pro';

/**
 * Détermine si l'utilisateur est Pro.
 * - Production : dérivé du champ `is_pro` dans la table Supabase `profiles`.
 * - Développement : peut être surchargé via le toggle dev (localStorage) ou Ctrl+Shift+P.
 */
export function useProStatus(isPro_fromDB: boolean) {
  // Override de dev : null = pas de surcharge, true/false = forcé
  const [devOverride, setDevOverride] = useState<boolean | null>(() => {
    const stored = localStorage.getItem(DEV_KEY);
    return stored !== null ? JSON.parse(stored) : null;
  });

  // Raccourci clavier Ctrl+Shift+P pour basculer
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setDevOverride((prev) => {
          const current = prev ?? isPro_fromDB;
          const next = !current;
          localStorage.setItem(DEV_KEY, JSON.stringify(next));
          return next;
        });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isPro_fromDB]);

  const toggle = () => {
    setDevOverride((prev) => {
      const current = prev ?? isPro_fromDB;
      const next = !current;
      localStorage.setItem(DEV_KEY, JSON.stringify(next));
      return next;
    });
  };

  const reset = () => {
    localStorage.removeItem(DEV_KEY);
    setDevOverride(null);
  };

  const isPro = devOverride ?? isPro_fromDB;
  const isDevMode = devOverride !== null;

  return { isPro, isDevMode, toggle, reset };
}
