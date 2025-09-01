import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, Image, Pressable, Share, ScrollView, Alert, Platform } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { PostsStackParamList } from '../../navigation/types';
import { usePosts } from '../../store/posts';
import { findArticleIdByTitleOrCategory, ARTICLES, type ArticleId } from './articles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<PostsStackParamList, 'PostDetail'>;

const C = { primary: '#DB043F', stroke: '#EDE3E3', text: '#1E1E1E', muted: '#8D8D8D' };
const ARTICLE_IDS = Object.keys(ARTICLES) as ArticleId[];
const isArticleId = (v: unknown): v is ArticleId => typeof v === 'string' && ARTICLE_IDS.includes(v as ArticleId);

export default function PostDetailScreen({ navigation, route }: Props) {
  const { getPost, toggleLike, toggleArchive } = usePosts();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'android' ? insets.top + 30 : 0;


  const id = (route.params as any)?.id ?? (route.params as any)?.postId;
  const post = id ? getPost(id) : undefined;

  if (!post) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Post not found</Text>
      </SafeAreaView>
    );
  }

  const onShare = async () => {
    try {
      await Share.share({
        message: `${post.title}${post.masterName ? ` — ${post.masterName}` : ''}${post.excerpt ? `\n${post.excerpt}` : ''}`,
      });
    } catch {}
  };

  const handleReadArticle = () => {
    const fromPost = isArticleId(post.articleId) ? post.articleId : undefined;
    const guessed = findArticleIdByTitleOrCategory(post.title, post.category);
    const articleId: ArticleId | undefined = fromPost ?? guessed;
    if (!articleId) { Alert.alert('No article found for this post'); return; }
    navigation.navigate('Article', { id: articleId });
  };

  const isArchived = !!post.archived;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={[s.header, { paddingTop: 6 + topPad }]}>
        <Pressable onPress={() => navigation.goBack()}><Text style={{ fontSize: 16 }}>{'‹ Back'}</Text></Pressable>
        <Text style={s.headerTitle}>Heading</Text>
        <Pressable onPress={() => toggleLike(post.id)} style={{ width: 28, alignItems: 'flex-end' }}>
          <Text style={{ color: post.liked ? C.primary : '#B9A9A9', fontSize: 18 }}>{post.liked ? '♥' : '♡'}</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 140 }}
        scrollIndicatorInsets={{ top: topPad, bottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {post.imageUri ? (
          <Image source={{ uri: post.imageUri }} style={s.image} resizeMode="cover" />
        ) : null}

        <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
          <Text style={s.title}>{post.title}</Text>
          {!!post.excerpt && <Text style={s.excerpt}>{post.excerpt}</Text>}

          {!!post.masterName && (
            <View style={{ marginTop: 8 }}>
              <Text style={s.metaLabel}>Master</Text>
              <Text style={s.metaValue}>{post.masterName}</Text>
            </View>
          )}

          <View style={s.row}>
            <Pressable onPress={onShare} style={s.shareBtn}><Text style={s.shareText}>Share</Text></Pressable>
            <Pressable onPress={handleReadArticle} style={s.linkBtn}>
              <Text style={s.linkText}>Read article</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <View style={s.bottomBar}>
        <Pressable
          style={[s.bottomBtn, s.secondary, isArchived && { backgroundColor: '#EEE', borderColor: C.muted }]}
          onPress={() => toggleArchive(post.id)}
        >
          <Text style={[s.bottomText, { color: isArchived ? C.muted : C.primary }]}>{isArchived ? 'Unarchive' : 'Archive'}</Text>
        </Pressable>
        <Pressable style={s.bottomBtn} onPress={() => navigation.navigate('EditPost', { id: post.id })}>
          <Text style={s.bottomText}>Edit</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 12, flexDirection: 'row', alignItems: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 22, fontWeight: '700' },
  image: { marginHorizontal: 16, height: 180, borderRadius: 16, backgroundColor: '#F7EFEF' },
  title: { fontSize: 22, fontWeight: '800', color: C.text },
  excerpt: { marginTop: 8, fontSize: 14, color: C.muted },
  metaLabel: { color: C.muted, fontSize: 12 },
  metaValue: { color: C.text, fontSize: 14, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 },
  shareBtn: { paddingHorizontal: 14, height: 36, borderRadius: 18, borderWidth: 1, borderColor: C.stroke, justifyContent: 'center' },
  shareText: { color: '#6D6D6D', fontWeight: '600' },
  linkBtn: { paddingHorizontal: 14, height: 36, borderRadius: 18, backgroundColor: 'rgba(219,4,63,0.08)', justifyContent: 'center' },
  linkText: { color: C.primary, fontWeight: '700' },
  bottomBar: { position: 'absolute', left: 16, right: 16, bottom: 24 + 100, flexDirection: 'row', gap: 12 },
  bottomBtn: { flex: 1, height: 56, borderRadius: 28, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  secondary: { backgroundColor: 'rgba(219,4,63,0.08)', borderWidth: 1, borderColor: C.primary },
  bottomText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
