import { useState, useCallback } from 'react';
import type { ResponseData } from '../types';

interface StreamState {
  reponse_1: string;
  reponse_2: string;
  reponse_3: string;
  activeIndex: number;
}

const KEYS = ['reponse_1', 'reponse_2', 'reponse_3'] as const;
const MARKERS = ['===1===', '===2===', '===3==='];

export function useGenerate() {
  const [streaming, setStreaming] = useState<StreamState | null>(null);
  const [responses, setResponses] = useState<ResponseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);

  const generate = useCallback(async (
    payload: { nom_etablissement: string; type_etablissement: string; avis_client: string; ton: string; sentiment: string },
    token: string,
    currentCredits: number,
    onCreditUpdate: (n: number) => void,
  ) => {
    // ── Bloquer si plus de crédits ──────────────────────────────
    if (currentCredits <= 0) {
      setPaywallOpen(true);
      return;
    }

    setLoading(true);
    setResponses(null);
    setStreaming({ reponse_1: '', reponse_2: '', reponse_3: '', activeIndex: 0 });
    setError(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      // 402 = crédits épuisés côté serveur
      if (res.status === 402) {
        setPaywallOpen(true);
        setStreaming(null);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `Erreur ${res.status}`);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let responseBuffer = '';
      let activeIndex = 0;
      const state: StreamState = { reponse_1: '', reponse_2: '', reponse_3: '', activeIndex: 0 };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        responseBuffer += decoder.decode(value, { stream: true });
        const lines = responseBuffer.split('\n');
        responseBuffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.error) throw new Error(event.error);

            if (event.delta) {
              buffer += event.delta;
              for (let i = activeIndex + 1; i < MARKERS.length; i++) {
                if (buffer.includes(MARKERS[i])) { activeIndex = i; break; }
              }
              const parts = buffer.split(/===\d===/).map(s => s.trim()).filter(Boolean);
              for (let i = 0; i < 3; i++) {
                if (parts[i] !== undefined) state[KEYS[i]] = parts[i];
              }
              state.activeIndex = activeIndex;
              setStreaming({ ...state });
            }

            if (event.done) onCreditUpdate(event.credits);
          } catch (parseErr) {
            if (parseErr instanceof Error && parseErr.message !== 'Unexpected end of JSON input') throw parseErr;
          }
        }
      }

      const final: ResponseData = {
        reponse_1: state.reponse_1.replace(/===\d===/g, '').trim(),
        reponse_2: state.reponse_2.replace(/===\d===/g, '').trim(),
        reponse_3: state.reponse_3.replace(/===\d===/g, '').trim(),
      };
      setResponses(final);
      setStreaming(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setStreaming(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { generate, loading, streaming, responses, error, paywallOpen, setPaywallOpen, setResponses };
}
