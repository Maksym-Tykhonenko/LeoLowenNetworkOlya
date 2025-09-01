import React, { createContext, useContext, useMemo, useState } from 'react';

export type Group = {
  id: string;
  title: string;
  description?: string;
  coverUri?: string;
  masterIds: string[];    
  isFavorite: boolean;    
  isArchived: boolean;  
  createdAt: number;
};

type AddGroupInput = {
  title: string;
  description?: string;
  coverUri?: string;
  masterIds: string[];
};

type UpdateGroupInput = {
  id: string;
  title?: string;
  description?: string;
  coverUri?: string | null; 
  masterIds?: string[];
  isFavorite?: boolean;
  isArchived?: boolean;
};

type GroupsCtx = {
  groups: Group[];
  addGroup: (g: AddGroupInput) => string;
  updateGroup: (patch: UpdateGroupInput) => void;
  archiveGroup: (id: string, value?: boolean) => void;
  toggleFavorite: (id: string) => void;
  getById: (id: string) => Group | undefined;
};

const Ctx = createContext<GroupsCtx | null>(null);

export function GroupsProvider({ children }: { children: React.ReactNode }) {
  const [groups, setGroups] = useState<Group[]>([]); 

  const api: GroupsCtx = useMemo(() => ({
    groups,
    addGroup: (g) => {
      const id = Math.random().toString(36).slice(2, 10);
      const next: Group = {
        id,
        title: g.title,
        description: g.description,
        coverUri: g.coverUri,
        masterIds: g.masterIds,
        isFavorite: false,
        isArchived: false,
        createdAt: Date.now(),
      };
      setGroups(prev => [next, ...prev]);
      return id;
    },
    updateGroup: (patch) => {
      setGroups(prev =>
        prev.map(it => {
          if (it.id !== patch.id) return it;
          return {
            ...it,
            title: patch.title ?? it.title,
            description: patch.description ?? it.description,
            coverUri: patch.coverUri === null ? undefined : (patch.coverUri ?? it.coverUri),
            masterIds: patch.masterIds ?? it.masterIds,
            isFavorite: patch.isFavorite ?? it.isFavorite,
            isArchived: patch.isArchived ?? it.isArchived,
          };
        })
      );
    },
    archiveGroup: (id, value) => {
      setGroups(prev => prev.map(g => g.id === id ? { ...g, isArchived: value ?? !g.isArchived } : g));
    },
    toggleFavorite: (id) => {
      setGroups(prev => prev.map(g => g.id === id ? { ...g, isFavorite: !g.isFavorite } : g));
    },
    getById: (id) => groups.find(g => g.id === id),
  }), [groups]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useGroups(): GroupsCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useGroups must be used within GroupsProvider');
  return ctx;
}
