import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { findArticleIdByTitleOrCategory, type ArticleId } from '../screens/posts/articles';
import 'react-native-get-random-values';
import { nanoid } from 'nanoid/non-secure';

export type Post = {
  id: string;
  title: string;
  excerpt?: string;
  body?: string;
  imageUri?: string;
  masterName?: string;
  category?: string;
  dateISO?: string;
  startISO?: string;
  endISO?: string;
  liked?: boolean;
  archived?: boolean; 
  createdAt: number;
  articleId?: ArticleId;
};

type Ctx = {
  posts: Post[];
  addPost: (p: Omit<Post, 'id' | 'liked' | 'archived' | 'createdAt' | 'articleId'>) => Promise<void>;
  toggleLike: (id: string) => void;
  updatePost: (id: string, patch: Partial<Post>) => void;
  archivePost: (id: string) => void;
  toggleArchive: (id: string) => void; 
  getPost: (id: string) => Post | undefined;
};

const PostsCtx = createContext<Ctx | null>(null);
const KEY = 'LLN_POSTS';

export function PostsProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) setPosts(JSON.parse(raw));
      } catch {}
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(KEY, JSON.stringify(posts)).catch(() => {});
  }, [posts]);

  const addPost = async (p: Omit<Post, 'id' | 'liked' | 'archived' | 'createdAt' | 'articleId'>) => {
    const articleId = findArticleIdByTitleOrCategory(p.title, p.category);
    setPosts(prev => [{
      id: nanoid(),
      liked: false,
      archived: false,
      createdAt: Date.now(),
      articleId,
      ...p
    }, ...prev]);
  };

  const toggleLike = (id: string) => {
    setPosts(prev => prev.map(x => (x.id === id ? { ...x, liked: !x.liked } : x)));
  };

  const updatePost = (id: string, patch: Partial<Post>) => {
    setPosts(prev => prev.map(x => (x.id === id ? { ...x, ...patch } : x)));
  };

  const archivePost = (id: string) => updatePost(id, { archived: true });

  const toggleArchive = (id: string) => {
    setPosts(prev => prev.map(x => (x.id === id ? { ...x, archived: !x.archived } : x)));
  };

  const getPost = (id: string) => posts.find(p => p.id === id);

  const value = useMemo(
    () => ({ posts, addPost, toggleLike, updatePost, archivePost, toggleArchive, getPost }),
    [posts]
  );
  return <PostsCtx.Provider value={value}>{children}</PostsCtx.Provider>;
}

export function usePosts() {
  const ctx = useContext(PostsCtx);
  if (!ctx) throw new Error('usePosts must be used within PostsProvider');
  return ctx;
}