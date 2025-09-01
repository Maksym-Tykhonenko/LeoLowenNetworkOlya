import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Master = {
  id: string;
  name: string;
  role: string;
  price: string;
  currency: '$' | '€';
  category: string;
  photoUri?: string;
  favorite?: boolean;  
};

type Ctx = {
  masters: Master[];
  categories: string[];
  addMaster: (m: Omit<Master, 'id' | 'favorite'>) => Promise<void>;
  toggleFavorite: (id: string) => void;       
};

const MastersCtx = createContext<Ctx | null>(null);
const KEY = 'LLN_MASTERS';

export function MastersProvider({ children }: { children: React.ReactNode }) {
  const [masters, setMasters] = useState<Master[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) setMasters(JSON.parse(raw));
      } catch {}
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(KEY, JSON.stringify(masters)).catch(() => {});
  }, [masters]);

  const addMaster = async (m: Omit<Master, 'id' | 'favorite'>) => {
    setMasters(prev => [{ id: Date.now().toString(), favorite: false, ...m }, ...prev]);
  };

  const toggleFavorite = (id: string) => {
    setMasters(prev =>
      prev.map(m => (m.id === id ? { ...m, favorite: !m.favorite } : m))
    );
  };

  const categories = useMemo(() => {
    const set = new Set<string>();
    masters.forEach(m => set.add(m.category));
    return Array.from(set);
  }, [masters]);

  const value = useMemo(
    () => ({ masters, categories, addMaster, toggleFavorite }),
    [masters, categories]
  );

  return <MastersCtx.Provider value={value}>{children}</MastersCtx.Provider>;
}

export function useMasters() {
  const ctx = useContext(MastersCtx);
  if (!ctx) throw new Error('useMasters must be used within MastersProvider');
  return ctx;
}
