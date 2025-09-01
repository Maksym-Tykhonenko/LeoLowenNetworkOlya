
import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  Pressable,
  Image,
} from 'react-native';

type Master = {
  id: string;
  name: string;
  role: string;
  priceFrom: string; 
  category: string;
  photo?: any; 
};

const COLORS = {
  bg: '#FFFFFF',
  primary: '#DB043F',
  faintPink: 'rgba(219, 4, 63, 0.08)', 
  chipText: '#DB043F',
  chipBg: 'rgba(219,4,63,0.10)',
  chipStroke: 'rgba(219,4,63,0.25)',
  cardBg: '#FFFFFF',
  cardStroke: '#EDE3E3',
  text: '#1E1E1E',
  textMuted: '#8D8D8D',
};

const CATEGORIES = ['Plumbers', 'Electricians', 'Carpenters', 'Painters', 'Handymen'];

const SAMPLE: Master[] = [
  { id: '1', name: 'Ivan Ivanov', role: 'Plumber', priceFrom: 'from 29$/h', category: 'Plumbers' },
  { id: '2', name: 'Ivan Ivanov', role: 'Plumber', priceFrom: 'from 29$/h', category: 'Plumbers' },
  { id: '3', name: 'Ivan Ivanov', role: 'Plumber', priceFrom: 'from 29$/h', category: 'Plumbers' },
  { id: '4', name: 'Ivan Ivanov', role: 'Plumber', priceFrom: 'from 29$/h', category: 'Plumbers' },
];

const EMPTY = false;

export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string>(CATEGORIES[0]);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const data = EMPTY ? [] : SAMPLE;

  const filtered = useMemo(() => {
    if (!selectedCategory) return data;
    return data.filter(m => m.category === selectedCategory);
  }, [data, selectedCategory]);

  const toggleFav = (id: string) => {
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <SafeAreaView style={styles.safe}>
   
      <View style={styles.header}>
        <Pressable style={styles.backPlaceholder} hitSlop={10}>
        
        </Pressable>
        <Text style={styles.headerTitle}>Lowen masters</Text>
        <Pressable style={styles.headerHeart} hitSlop={10}>
          <Text style={{ fontSize: 18, color: COLORS.primary }}>♡</Text>
        </Pressable>
      </View>

      {filtered.length === 0 ? (
       
        <View style={styles.emptyWrap}>
   
          <View style={styles.emptyIcon}>
            <Text style={{ fontSize: 40, color: COLORS.primary }}>∅</Text>
          </View>
          <Text style={styles.emptyText}>
            There aren’t any masters you add, please add somebody
          </Text>
        </View>
      ) : (
   
        <FlatList
          data={filtered}
          numColumns={2}
          keyExtractor={item => item.id}
          columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
          contentContainerStyle={{ paddingBottom: 140, paddingTop: 8 }}
          ListHeaderComponent={
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
              style={{ paddingVertical: 10 }}
            >
              {CATEGORIES.map(cat => {
                const active = cat === selectedCategory;
                return (
                  <Pressable
                    key={cat}
                    onPress={() => setSelectedCategory(cat)}
                    style={[
                      styles.chip,
                      active && { backgroundColor: COLORS.faintPink, borderColor: COLORS.primary },
                    ]}
                  >
                    <Text style={[styles.chipText, active && { color: COLORS.primary }]}>{cat}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
        
              <View style={styles.photo}>
              </View>

              <View style={{ paddingHorizontal: 12, paddingTop: 10 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.fromText}>{item.priceFrom}</Text>
                <Text style={styles.role}>{item.role}</Text>
              </View>

              <View style={styles.cardFooter}>
                <Pressable onPress={() => {}} style={styles.shareBtn}>
                  <Text style={styles.shareText}>Share</Text>
                </Pressable>

                <Pressable onPress={() => toggleFav(item.id)} hitSlop={10} style={styles.heartBtn}>
                  <Text
                    style={{
                      fontSize: 18,
                      color: favorites[item.id] ? COLORS.primary : '#B9A9A9',
                    }}
                  >
                    {favorites[item.id] ? '♥' : '♡'}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      )}

      <View pointerEvents="box-none" style={styles.addWrap}>
        <Pressable style={styles.addBtn} onPress={() => {}}>
          <Text style={styles.addText}>Add master</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const CARD_RADIUS = 16;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backPlaceholder: { width: 28, height: 28 },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerHeart: { width: 28, alignItems: 'flex-end' },

  chip: {
    paddingHorizontal: 12,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.chipStroke,
    backgroundColor: COLORS.chipBg,
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7F4F59',
  },

  card: {
    flex: 1,
    minHeight: 210,
    backgroundColor: COLORS.cardBg,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: COLORS.cardStroke,
    marginBottom: 12,
    overflow: 'hidden',
  },
  photo: {
    height: 90,
    margin: 12,
    borderRadius: 12,
    backgroundColor: '#F7EFEF',
  },
  name: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  fromText: { marginTop: 2, fontSize: 12, color: COLORS.textMuted },
  role: { marginTop: 2, fontSize: 13, color: COLORS.text },

  cardFooter: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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

  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyIcon: {
    width: 90,
    height: 90,
    borderRadius: 20,
    backgroundColor: COLORS.faintPink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B6B6B',
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 16,
  },

  addWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24 + 100, 
  },
  addBtn: {
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
});
