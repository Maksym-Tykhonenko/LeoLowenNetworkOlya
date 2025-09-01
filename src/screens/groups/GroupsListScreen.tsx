import React, { useMemo, useState } from 'react';
import {
  SafeAreaView, View, Text, StyleSheet, Image, Pressable,
  FlatList, Dimensions, Share, ScrollView, Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useGroups, type Group } from '../../store/groups';
import type { GroupsStackParamList } from '../../navigation/types';
import Stagger from '../../components/Stagger';

const C = {
  primary: '#DB043F',
  stroke: '#E6E6E6',
  text: '#1E1E1E',
  muted: '#8D8D8D',
  chipBg: 'rgba(219,4,63,0.08)',
};

const TAB_BAR_H = 100;

export default function GroupsListScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'android' ? insets.top + 30 : 0;
  const nav = useNavigation<NativeStackNavigationProp<GroupsStackParamList>>();
  const { groups, toggleFavorite } = useGroups();
  const [tab, setTab] = useState<'active' | 'archived'>('active');

  const W = Dimensions.get('window').width;
  const isSmall = W <= 360;
  const Hpad = 16;

  const blockerH = TAB_BAR_H + insets.bottom;
  const listBottomPad = blockerH + 24;

  const data = useMemo(() => {
    const filtered = groups.filter(g => (tab === 'active' ? !g.isArchived : g.isArchived));
    return [...filtered].sort(
      (a, b) => Number(b.isFavorite) - Number(a.isFavorite) || b.createdAt - a.createdAt
    );
  }, [groups, tab]);

  const onShare = async (title: string) => {
    try { await Share.share({ message: title }); } catch {}
  };

  const Header = () => (
    <>
      <Stagger index={0} from="bottom" replayOnFocus>
        <View style={[s.header, { paddingHorizontal: Hpad, paddingTop: 6 + topPad }]}>
          <Text style={[s.headerTitle, { fontSize: isSmall ? 20 : 22 }]}>Groups</Text>
        </View>
      </Stagger>

      <Stagger index={1} from="bottom" replayOnFocus>
        <View style={[s.tabs, { marginHorizontal: Hpad }]}>
          <Pressable onPress={() => setTab('active')} style={[s.tabBtn, tab === 'active' && s.tabActive, isSmall && { height: 32 }]}>
            <Text style={[s.tabText, tab === 'active' && s.tabTextActive, isSmall && { fontSize: 13 }]}>Active</Text>
          </Pressable>
          <Pressable onPress={() => setTab('archived')} style={[s.tabBtn, tab === 'archived' && s.tabActive, isSmall && { height: 32 }]}>
            <Text style={[s.tabText, tab === 'archived' && s.tabTextActive, isSmall && { fontSize: 13 }]}>Archived</Text>
          </Pressable>
        </View>
      </Stagger>

      <View style={{ height: isSmall ? 8 : 12 }} />
    </>
  );

  const Empty = () => (
    <Stagger index={2} from="bottom" replayOnFocus>
      <View style={s.emptyWrap}>
        <Image
          source={require('../../assets/lion2.png')}
          style={{ width: isSmall ? 160 : 192, height: isSmall ? 160 : 192 }}
          resizeMode="contain"
        />
        <Text style={[s.emptyText, { fontSize: isSmall ? 14 : 15 }]}>
          There aren’t any groups you add, please add something
        </Text>
      </View>
    </Stagger>
  );

  const renderItem = ({ item, index }: { item: Group; index: number }) => {
    const gap = 12;
    const cardW = (W - Hpad * 2 - gap) / 2;
    const coverH = Math.round(cardW * (isSmall ? 0.46 : 0.52));

    return (
      <Stagger index={index + 2} from="bottom" replayOnFocus>
        <Pressable
          style={[s.card, { width: cardW }]}
          onPress={() => nav.navigate('GroupDetail', { id: item.id })}
        >
          <View style={[s.cover, { height: coverH }]}>
            {item.coverUri ? (
              <Image source={{ uri: item.coverUri }} style={s.coverImg} />
            ) : (
              <View style={[s.coverImg, s.coverPlaceholder]} />
            )}
          </View>

          <View style={{ paddingHorizontal: 10 }}>
            <Text style={[s.title, { fontSize: isSmall ? 14 : 15 }]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={[s.desc, { fontSize: isSmall ? 11 : 12 }]}>
              {`${item.masterIds.length} ${item.masterIds.length === 1 ? 'master' : 'masters'}`}
            </Text>
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
        </Pressable>
      </Stagger>
    );
  };

  const FooterButton = ({ idx = 3 }: { idx?: number }) => (
    <Stagger index={idx} from="bottom" replayOnFocus>
      <View style={{ paddingHorizontal: Hpad, paddingTop: 8, paddingBottom: 24 }}>
        <Pressable style={s.createBtn} onPress={() => nav.navigate('NewGroup')}>
          <Text style={s.createText}>Create a group</Text>
        </Pressable>
      </View>
    </Stagger>
  );

  const showEmpty = data.length === 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {showEmpty ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: listBottomPad }}
          scrollIndicatorInsets={{ top: topPad, bottom: listBottomPad }}
        >
          <Header />
          <Empty />
          <FooterButton idx={3} />
        </ScrollView>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(it) => it.id}
          numColumns={2}
          renderItem={renderItem}
          columnWrapperStyle={{ gap: 12, paddingHorizontal: Hpad }}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: listBottomPad }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          ListHeaderComponent={<Header />}
          ListFooterComponent={<FooterButton idx={data.length + 2} />}
          showsVerticalScrollIndicator={false}
          scrollIndicatorInsets={{ top: topPad, bottom: listBottomPad }}
        />
      )}

      <View
        pointerEvents="none"
        style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: blockerH, backgroundColor: '#fff' }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 8 },
  headerTitle: { fontWeight: '800', color: C.text, textAlign: 'center' },

  tabs: { flexDirection: 'row', backgroundColor: '#F3F3F3', borderRadius: 16, padding: 4 },
  tabBtn: { flex: 1, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  tabActive: { backgroundColor: C.chipBg },
  tabText: { color: '#6B6B6B', fontWeight: '600' },
  tabTextActive: { color: C.primary },

  emptyWrap: { alignItems: 'center', justifyContent: 'center', paddingTop: 40, paddingHorizontal: 32 },
  emptyText: { marginTop: 10, textAlign: 'center', color: '#666' },

  card: { borderWidth: 1, borderColor: C.stroke, borderRadius: 16, backgroundColor: '#fff', overflow: 'hidden', marginBottom: 12 },
  cover: { margin: 10, borderRadius: 12, overflow: 'hidden', backgroundColor: '#F2F2F2' },
  coverImg: { width: '100%', height: '100%' },
  coverPlaceholder: { backgroundColor: '#EFEFEF', borderRadius: 12 },

  title: { fontWeight: '700', color: C.text },
  desc: { color: C.muted, marginTop: 2 },

  cardFooter: { marginTop: 10, paddingHorizontal: 10, paddingBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  shareBtn: { paddingHorizontal: 14, height: 32, borderRadius: 16, borderWidth: 1, borderColor: C.stroke, justifyContent: 'center' },
  shareText: { color: '#6D6D6D', fontWeight: '600' },

  heart: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: C.stroke, alignItems: 'center', justifyContent: 'center' },
  heartActive: { borderColor: C.primary, backgroundColor: 'rgba(219,4,63,0.10)' },
  heartDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: C.primary },

  createBtn: { height: 56, borderRadius: 28, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  createText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});