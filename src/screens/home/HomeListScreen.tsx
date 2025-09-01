import React, { useMemo, useState } from 'react';
import {
  SafeAreaView, View, Text, StyleSheet, FlatList, ScrollView,
  Pressable, Share, Image, Dimensions, Platform
} from 'react-native';
import { useMasters, type Master } from '../../store/masters';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../navigation/types';
import Stagger from '../../components/Stagger';

type Props = NativeStackScreenProps<HomeStackParamList, 'HomeList'>;

const COLORS = {
  bg: '#FFFFFF',
  primary: '#DB043F',
  faintPink: 'rgba(219, 4, 63, 0.08)',
  chipStroke: 'rgba(219,4,63,0.25)',
  cardStroke: '#EDE3E3',
  text: '#1E1E1E',
  textMuted: '#8D8D8D',
};

const TAB_BAR_H = 100;
const TOP_PAD = Platform.OS === 'android' ? 30 : 0;

export default function HomeListScreen({ navigation }: Props) {
  const { masters, categories, toggleFavorite } = useMasters();
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0] ?? '');

  const W = Dimensions.get('window').width;
  const isSmall = W < 360;
  const horizontalPad = 16;
  const gap = 12;
  const cardW = (W - horizontalPad * 2 - gap) / 2;
  const photoH = Math.round(cardW * (isSmall ? 0.46 : 0.52));

  const filtered = useMemo(() => {
    const base = selectedCategory ? masters.filter(m => m.category === selectedCategory) : masters;
    return [...base].sort((a, b) => Number(b.favorite) - Number(a.favorite));
  }, [masters, selectedCategory]);

  const isEmpty = masters.length === 0;

  const onShare = async (m: Master) => {
    try {
      await Share.share({
        message: `${m.name}\n${m.role}\nfrom ${m.price}${m.currency}/h\nCategory: ${m.category}`,
      });
    } catch {}
  };

  const Header = () => (
    <>
      <Stagger index={0} from="bottom" replayOnFocus>
        <View style={[styles.header, { paddingHorizontal: horizontalPad }]}>
          <View style={styles.sidePlaceholder} />
          <Text style={[styles.headerTitle, { fontSize: isSmall ? 20 : 22 }]}>Lowen masters</Text>
          <View style={styles.sidePlaceholder} />
        </View>
      </Stagger>

      {!!categories.length && (
        <Stagger index={1} from="bottom" replayOnFocus>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: horizontalPad, gap: 8 }}
            style={{ paddingVertical: 10 }}
          >
            {categories.map(cat => {
              const active = cat === selectedCategory;
              return (
                <Pressable
                  key={cat}
                  onPress={() => setSelectedCategory(cat)}
                  style={[
                    styles.chip,
                    active && { backgroundColor: COLORS.faintPink, borderColor: COLORS.primary },
                    isSmall && { height: 26, borderRadius: 13, paddingHorizontal: 10 },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      active && { color: COLORS.primary },
                      isSmall && { fontSize: 12 },
                    ]}
                  >
                    {cat}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Stagger>
      )}
    </>
  );

  const FooterButton = ({ startIndex }: { startIndex: number }) => (
    <Stagger index={startIndex} from="bottom" replayOnFocus>
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 }}>
        <Pressable style={styles.addBtn} onPress={() => navigation.navigate('NewMaster')}>
          <Text style={styles.addText}>Add master</Text>
        </Pressable>
      </View>
    </Stagger>
  );

  return (
    <SafeAreaView style={styles.safe}>
      {isEmpty ? (
        <ScrollView
          contentContainerStyle={{ paddingTop: TOP_PAD, paddingBottom: TAB_BAR_H + 24 }}
          showsVerticalScrollIndicator={false}
          scrollIndicatorInsets={{ top: TOP_PAD, bottom: TAB_BAR_H + 24 }}
        >
          <Header />
          <Stagger index={2} from="bottom" replayOnFocus>
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIcon}>
                <Image
                  source={require('../../assets/lion2.png')}
                  style={{ width: isSmall ? 76 : 90, height: isSmall ? 76 : 90 }}
                  resizeMode="contain"
                />
              </View>
              <Text style={[styles.emptyText, { fontSize: isSmall ? 14 : 15 }]}>
                There aren’t any masters you add, please add somebody
              </Text>
            </View>
          </Stagger>
          <FooterButton startIndex={3} />
        </ScrollView>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={i => i.id}
          numColumns={2}
          columnWrapperStyle={{ gap, paddingHorizontal: horizontalPad }}
          contentContainerStyle={{
            paddingTop: TOP_PAD,
            paddingBottom: TAB_BAR_H + 24, 
          }}
          ListHeaderComponent={<Header />}
          ListFooterComponent={<FooterButton startIndex={filtered.length + 2} />}
          renderItem={({ item, index }) => (
            <Stagger index={index + 2} from="bottom" replayOnFocus>
              <View style={[styles.card, { width: cardW }]}>
                <View style={[styles.photo, { height: photoH }]}>
                  {item.photoUri ? (
                    <Image source={{ uri: item.photoUri }} style={{ width: '100%', height: '100%', borderRadius: 12 }} />
                  ) : (
                    <View style={{ flex: 1, borderRadius: 12, backgroundColor: '#F7EFEF' }} />
                  )}
                </View>

                <View style={{ paddingHorizontal: 12, paddingTop: 10 }}>
                  <Text style={[styles.name, { fontSize: isSmall ? 15 : 16 }]} numberOfLines={1}>{item.name}</Text>
                  <Text style={[styles.fromText, { fontSize: isSmall ? 11 : 12 }]}>{`from ${item.price}${item.currency}/h`}</Text>
                  <Text style={[styles.role, { fontSize: isSmall ? 12 : 13 }]} numberOfLines={1}>{item.role}</Text>
                </View>

                <View style={styles.cardFooter}>
                  <Pressable onPress={() => onShare(item)} style={styles.shareBtn}>
                    <Text style={styles.shareText}>Share</Text>
                  </Pressable>

                  <Pressable onPress={() => toggleFavorite(item.id)} hitSlop={10} style={styles.heartBtn}>
                    <Text style={{ fontSize: 18, color: item.favorite ? COLORS.primary : '#B9A9A9' }}>
                      {item.favorite ? '♥' : '♡'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </Stagger>
          )}
          showsVerticalScrollIndicator={false}
          scrollIndicatorInsets={{ top: TOP_PAD, bottom: TAB_BAR_H + 24 }}
        />
      )}

      <View
        pointerEvents="none"
        style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: TAB_BAR_H, backgroundColor: COLORS.bg }}
      />
    </SafeAreaView>
  );
}

const CARD_RADIUS = 16;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },

  header: { paddingTop: 6, paddingBottom: 8, flexDirection: 'row', alignItems: 'center' },
  sidePlaceholder: { width: 28, height: 28 },
  headerTitle: { flex: 1, textAlign: 'center', fontWeight: '700', color: COLORS.text },

  chip: {
    paddingHorizontal: 12,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.chipStroke,
    backgroundColor: 'rgba(219,4,63,0.10)',
    justifyContent: 'center',
  },
  chipText: { fontSize: 13, fontWeight: '600', color: '#7F4F59' },

  card: {
    backgroundColor: '#FFF',
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: COLORS.cardStroke,
    marginBottom: 12,
    overflow: 'hidden',
  },
  photo: { margin: 12, borderRadius: 12, backgroundColor: '#F7EFEF' },

  name: { fontWeight: '700', color: COLORS.text },
  fromText: { marginTop: 2, color: COLORS.textMuted },
  role: { marginTop: 2, color: COLORS.text },

  cardFooter: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  shareBtn: { paddingHorizontal: 14, height: 32, borderRadius: 16, borderWidth: 1, borderColor: COLORS.cardStroke, justifyContent: 'center' },
  shareText: { color: '#6D6D6D', fontWeight: '600' },
  heartBtn: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: COLORS.cardStroke, alignItems: 'center', justifyContent: 'center' },

  emptyWrap: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingTop: 40 },
  emptyIcon: {
    width: 90,
    height: 90,
    borderRadius: 20,
    backgroundColor: 'rgba(219,4,63,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyText: { textAlign: 'center', color: '#6B6B6B', lineHeight: 20, marginBottom: 16 },

  addBtn: { height: 56, borderRadius: 28, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  addText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
});