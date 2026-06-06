import { useState, useCallback } from 'react';
import type { BusinessProfile, EstablishmentType } from '../types';

const KEY = 'replyai_profile';

function loadProfile(): BusinessProfile | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function useProfile() {
  const [profile, setProfile] = useState<BusinessProfile | null>(loadProfile);

  const saveProfile = useCallback((name: string, type: EstablishmentType) => {
    const p: BusinessProfile = { name: name.trim(), type };
    localStorage.setItem(KEY, JSON.stringify(p));
    setProfile(p);
  }, []);

  const clearProfile = useCallback(() => {
    localStorage.removeItem(KEY);
    setProfile(null);
  }, []);

  return { profile, saveProfile, clearProfile };
}
