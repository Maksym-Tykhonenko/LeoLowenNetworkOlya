
import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  FlatList,
  Dimensions,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGroups } from '../store/groups';
import type { Group } from '../store/groups';

const C = {
  primary: '#DB043F',
  stroke: '#E6E6E6',
  text: '#1E1E1E',
  muted: '#8D8D8D',
  chipBg: 'rgba(219,4,63,0.08)',
};

const TAB_BAR_H = 100; 

export default function GroupsScreen() {
  const insets = useSafeAreaInsets();
  const { groups, toggleFavorite } = useGroups();
  const [tab, setTab] = useState<'active' | 'archived'>('active');

  const data = useMemo(() => {
    const filtered = groups.filter(g => (tab === 'active' ? !g.isArchived : g.isArchived));

    return [...filtered].sort(
      (a, b) =>
        Number(b.isFavorite) - Number(a.isFavorite) || b.createdAt - a.createdAt
    );
  }, [groups, tab]);

  const blockerH = TAB_BAR_H + insets.bottom;
  const contentBottomPad = blockerH + 100; 

  const onShare = async (title: string) => {
    try {
      await Share.share({ message: title });
    } catch {}
  };

  const renderItem = ({ item }: { item: Group }) => {
    const W = Dimensions.get('window').width;
    const cardW = (W - 16 * 2 - 12) / 2; 
    return (
      <View style={[s.card, { width: cardW }]}>
        <View style={s.cover}>
          {item.coverUri ? (
            <Image source={{ uri: item.coverUri }} style={s.coverImg} />
          ) : (
            <View style={[s.coverImg, s.coverPlaceholder]} />
          )}
        </View>

        <View style={{ paddingHorizontal: 10 }}>
          <Text style={s.title} numberOfLines={1}>{item.title}</Text>
          {!!item.description && (
            <Text style={s.desc} numberOfLines={2}>{item.description}</Text>
          )}
        </View>

        <View style={s.cardFooter}>
          <Pressable style={s.shareBtn} onPress={() => onShare(item.title)}>
            <Text style={s.shareText}>Share</Text>
          </Pressable>

          <Pressable
            onPress={() => toggleFavorite(item.id)}
            style={[s.heart, item.isFavorite && s.heartActive]}
            hitSlop={10}
          >
            {item.isFavorite ? <View style={s.heartDot} /> : null}
          </Pressable>
        </View>
      </View>
    );
  };

  const Empty = () => (
    <View style={s.emptyWrap}>
      <Image
        source={require('../assets/lion2.png')}
        style={{ width: 180, height: 180 }}
        resizeMode="contain"
      />
      <Text style={s.emptyText}>
        There aren’t any groups you add, please add something
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Groups</Text>
      </View>

      <View style={s.tabs}>
        <Pressable
          onPress={() => setTab('active')}
          style={[s.tabBtn, tab === 'active' && s.tabActive]}
        >
          <Text style={[s.tabText, tab === 'active' && s.tabTextActive]}>Active</Text>
        </Pressable>
        <Pressable
          onPress={() => setTab('archived')}
          style={[s.tabBtn, tab === 'archived' && s.tabActive]}
        >
          <Text style={[s.tabText, tab === 'archived' && s.tabTextActive]}>Archived</Text>
        </Pressable>
      </View>

      <FlatList
        data={data}
        keyExtractor={(it) => it.id}
        numColumns={2}
        renderItem={renderItem}
        columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: contentBottomPad }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={<Empty />}
        showsVerticalScrollIndicator={false}
        scrollIndicatorInsets={{ bottom: blockerH }}
      />

      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: blockerH,
          backgroundColor: '#fff',
        }}
      />
      <View style={[s.bottom, { bottom: TAB_BAR_H + insets.bottom + 16 }]}>
        <Pressable style={s.createBtn} onPress={() => {}}>
          <Text style={s.createText}>Create a group</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 8 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: C.text },

  tabs: {
    marginHorizontal: 16,
    flexDirection: 'row',
    backgroundColor: '#F3F3F3',
    borderRadius: 16,
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: { backgroundColor: C.chipBg },
  tabText: { color: '#6B6B6B', fontWeight: '600' },
  tabTextActive: { color: C.primary },

  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 56,
    paddingHorizontal: 32,
  },
  emptyText: { marginTop: 10, textAlign: 'center', color: '#666' },

  card: {
    borderWidth: 1,
    borderColor: C.stroke,
    borderRadius: 16,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  cover: {
    height: 110,
    margin: 10,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F2F2F2',
  },
  coverImg: { width: '100%', height: '100%' },
  coverPlaceholder: { backgroundColor: '#EFEFEF', borderRadius: 12 },

  title: { fontSize: 15, fontWeight: '700', color: C.text },
  desc: { fontSize: 12, color: C.muted, marginTop: 2 },

  cardFooter: {
    marginTop: 10,
    paddingHorizontal: 10,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  shareBtn: {
    paddingHorizontal: 14,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.stroke,
    justifyContent: 'center',
  },
  shareText: { color: '#6D6D6D', fontWeight: '600' },

  heart: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: C.stroke,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartActive: { borderColor: C.primary, backgroundColor: 'rgba(219,4,63,0.10)' },
  heartDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: C.primary },

  bottom: { position: 'absolute', left: 16, right: 16 },
  createBtn: {
    height: 56,
    borderRadius: 28,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
