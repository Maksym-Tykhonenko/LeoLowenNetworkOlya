import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Share,
  Image,
  Dimensions,
  ScrollView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePosts, type Post } from '../../store/posts';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { PostsStackParamList } from '../../navigation/types';
import Stagger from '../../components/Stagger';

type Props = NativeStackScreenProps<PostsStackParamList, 'PostsList'>;

const COLORS = {
  bg: '#FFFFFF',
  primary: '#DB043F',
  faintPink: 'rgba(219, 4, 63, 0.08)',
  cardStroke: '#EDE3E3',
  text: '#1E1E1E',
  textMuted: '#8D8D8D',
};

const LABELS = { all: 'Created', fav: 'Liked', arch: 'Archived' } as const;
type TabKey = keyof typeof LABELS;

const TAB_BAR_H = 100;
const EMPTY_BUTTON_SPACING = 80;

export default function PostsListScreen({ navigation }: Props) {
  const { posts, toggleLike } = usePosts();
  const [tab, setTab] = useState<TabKey>('all');
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'android' ? insets.top + 30 : 0;

  const W = Dimensions.get('window').width;
  const isSmall = W <= 360;
  const Hpad = 16;
  const listBottomPad = TAB_BAR_H + 24;

  const active = useMemo(() => posts.filter(p => !p.archived), [posts]);
  const archived = useMemo(() => posts.filter(p => p.archived), [posts]);

  const data = useMemo(() => {
    const subset =
      tab === 'all' ? active
      : tab === 'fav' ? active.filter(p => p.liked)
      : archived;
    return [...subset].sort(
      (a, b) => Number(b.liked) - Number(a.liked) || b.createdAt - a.createdAt
    );
  }, [active, archived, tab]);

  const showEmpty =
    (tab === 'all' && active.length === 0) ||
    (tab === 'fav' && data.length === 0) ||
    (tab === 'arch' && archived.length === 0);

  const onShare = async (p: Post) => {
    try {
      await Share.share({
        message:
          `${p.title}` +
          (p.masterName ? ` — ${p.masterName}` : '') +
          (p.excerpt ? `\n${p.excerpt}` : ''),
      });
    } catch {}
  };

  const Header = () => (
    <>
      <Stagger index={0} from="bottom" replayOnFocus>
        <View style={[s.header, { paddingTop: 6, paddingHorizontal: Hpad }]}>
          <View style={{ width: 28, height: 28 }} />
          <Text style={[s.headerTitle, { fontSize: isSmall ? 20 : 22 }]}>Posts</Text>
          <View style={{ width: 28, height: 28 }} />
        </View>
      </Stagger>

      <Stagger index={1} from="bottom" replayOnFocus>
        <View style={[s.tabs, { paddingHorizontal: Hpad }]}>
          <Pressable
            onPress={() => setTab('all')}
            style={[s.tab, tab === 'all' && s.tabActive, isSmall && { height: 26, borderRadius: 13 }]}
          >
            <Text style={[s.tabText, tab === 'all' && s.tabTextActive, isSmall && { fontSize: 12 }]}>
              {LABELS.all}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setTab('fav')}
            style={[s.tab, tab === 'fav' && s.tabActive, isSmall && { height: 26, borderRadius: 13 }]}
          >
            <Text style={[s.tabText, tab === 'fav' && s.tabTextActive, isSmall && { fontSize: 12 }]}>
              {LABELS.fav}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setTab('arch')}
            style={[s.tab, tab === 'arch' && s.tabActive, isSmall && { height: 26, borderRadius: 13 }]}
          >
            <Text style={[s.tabText, tab === 'arch' && s.tabTextActive, isSmall && { fontSize: 12 }]}>
              {LABELS.arch}
            </Text>
          </Pressable>
        </View>
      </Stagger>

      <View style={{ height: isSmall ? 8 : 12 }} />
    </>
  );

  const Empty = () => (
    <Stagger index={2} from="bottom" replayOnFocus>
      <View
        style={[
          s.emptyWrap,
          {
            justifyContent: 'center',
            paddingHorizontal: 24,
            transform: [{ translateY: isSmall ? 70 : 56 }],
          },
        ]}
      >
        <Image
          source={require('../../assets/lion2.png')}
          style={[s.emptyImg, { width: isSmall ? 140 : 160, height: isSmall ? 140 : 160 }]}
          resizeMode="contain"
        />
        <Text style={[s.emptyText, { fontSize: isSmall ? 14 : 15 }]}>
          {tab === 'all'
            ? 'There aren’t any posts yet, please add something'
            : tab === 'fav'
              ? 'No liked posts yet'
              : 'No archived posts'}
        </Text>
      </View>
    </Stagger>
  );

  return (
    <SafeAreaView style={s.safe}>
      {showEmpty ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: topPad, paddingBottom: listBottomPad }}
          scrollIndicatorInsets={{ top: topPad, bottom: listBottomPad }}
        >
          <Header />
          <Empty />
          {tab !== 'arch' && (
            <Stagger index={3} from="bottom" replayOnFocus>
              <View style={{ paddingHorizontal: Hpad, marginTop: EMPTY_BUTTON_SPACING, paddingBottom: 24 }}>
                <Pressable style={s.addBtn} onPress={() => navigation.navigate('NewPost')}>
                  <Text style={s.addText}>Add a post</Text>
                </Pressable>
              </View>
            </Stagger>
          )}
        </ScrollView>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ paddingTop: topPad, paddingBottom: listBottomPad }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          showsVerticalScrollIndicator={false}
          scrollIndicatorInsets={{ top: topPad, bottom: listBottomPad }}
          ListHeaderComponent={<Header />}
          ListFooterComponent={
            tab !== 'arch' ? (
              <Stagger index={data.length + 2} from="bottom" replayOnFocus>
                <View style={{ paddingHorizontal: Hpad, marginTop: 16, paddingBottom: 24 }}>
                  <Pressable style={s.addBtn} onPress={() => navigation.navigate('NewPost')}>
                    <Text style={s.addText}>Add a post</Text>
                  </Pressable>
                </View>
              </Stagger>
            ) : null
          }
          renderItem={({ item, index }) => (
            <Stagger index={index + 2} from="bottom" replayOnFocus>
              <Pressable
                onPress={() => navigation.navigate('PostDetail', { id: item.id })}
                style={s.card}
              >
                <View style={{ flex: 1, padding: 12 }}>
                  <Text style={[s.title, { fontSize: isSmall ? 15 : 16 }]} numberOfLines={2}>
                    {item.title}
                  </Text>
                  {!!item.excerpt && (
                    <Text style={[s.excerpt, { fontSize: isSmall ? 12 : 13 }]} numberOfLines={2}>
                      {item.excerpt}
                    </Text>
                  )}
                  {!!item.masterName && (
                    <Text style={[s.meta, { fontSize: isSmall ? 11 : 12 }]} numberOfLines={1}>
                      {item.masterName}
                    </Text>
                  )}

                  <View style={s.row}>
                    <Pressable onPress={() => onShare(item)} style={s.shareBtn}>
                      <Text style={s.shareText}>Share</Text>
                    </Pressable>

                    <Pressable
                      onPress={() => toggleLike(item.id)}
                      hitSlop={10}
                      style={s.heartBtn}
                    >
                      <Text
                        style={{
                          fontSize: 18,
                          color: item.liked ? COLORS.primary : '#B9A9A9',
                        }}
                      >
                        {item.liked ? '♥' : '♡'}
                      </Text>
                    </Pressable>
                  </View>
                </View>

                <View style={[s.thumb, { width: isSmall ? 100 : 120, height: isSmall ? 100 : 120 }]}>
                  {item.imageUri ? (
                    <Image
                      source={{ uri: item.imageUri }}
                      style={{ width: '100%', height: '100%', borderRadius: 12 }}
                    />
                  ) : (
                    <View style={{ flex: 1, borderRadius: 12, backgroundColor: '#F7EFEF' }} />
                  )}
                </View>
              </Pressable>
            </Stagger>
          )}
        />
      )}

      <View
        pointerEvents="none"
        style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: TAB_BAR_H, backgroundColor: COLORS.bg }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    paddingTop: 6,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '700',
    color: COLORS.text,
  },

  tabs: { flexDirection: 'row', gap: 8, paddingTop: 8 },
  tab: {
    paddingHorizontal: 12,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    justifyContent: 'center',
    backgroundColor: '#F9F1F3',
  },
  tabActive: { backgroundColor: COLORS.faintPink, borderColor: COLORS.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: '#7F4F59' },
  tabTextActive: { color: COLORS.primary },

  emptyWrap: { flex: 1, alignItems: 'center' },
  emptyImg: { width: 160, height: 160 },
  emptyText: { textAlign: 'center', color: '#6B6B6B', lineHeight: 20, marginTop: 10 },

  card: {
    flexDirection: 'row',
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.cardStroke,
    borderRadius: 16,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  title: { fontWeight: '700', color: COLORS.text },
  excerpt: { marginTop: 4, color: COLORS.textMuted },
  meta: { marginTop: 6, color: COLORS.textMuted },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  shareBtn: {
    paddingHorizontal: 14,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardStroke,
    justifyContent: 'center',
  },
  shareText: { color: '#6D6D6D', fontWeight: '600' },
  heartBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardStroke,
    alignItems: 'center',
    justifyContent: 'center',
  },

  thumb: { margin: 10, borderRadius: 12, overflow: 'hidden' },

  addBtn: {
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
});