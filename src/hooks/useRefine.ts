import { useState, useCallback } from 'react';
import type { RefineAction } from '../types';

async function streamRefine(
  text: string,
  action: RefineAction,
  token: string,
  onDelta: (t: string) => void,
  onDone: (credits: number) => void,
): Promise<void> {
  const res = await fetch('/api/refine', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ text, action }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `Erreur ${res.status}`);
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let lineBuffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    lineBuffer += decoder.decode(value, { stream: true });
    const lines = lineBuffer.split('\n');
    lineBuffer = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      try {
        const event = JSON.parse(line.slice(6));
        if (event.error) throw new Error(event.error);
        if (event.delta) onDelta(event.delta);
        if (event.done) onDone(event.credits);
      } catch {}
    }
  }
}

export function useRefine() {
  const [refining, setRefining] = useState<{ cardIndex: number; action: RefineAction } | null>(null);

  const refine = useCallback(async (
    cardIndex: number,
    text: string,
    action: RefineAction,
    token: string,
    onUpdate: (cardIndex: number, newText: string) => void,
    onCreditUpdate: (n: number) => void,
  ) => {
    setRefining({ cardIndex, action });
    let accumulated = '';
    try {
      await streamRefine(
        text,
        action,
        token,
        (delta) => {
          accumulated += delta;
          onUpdate(cardIndex, accumulated);
        },
        (credits) => {
          onCreditUpdate(credits);
          setRefining(null);
        },
      );
    } catch (err) {
      setRefining(null);
      throw err;
    }
  }, []);

  return { refining, refine };
}
