import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, Image, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { PostsStackParamList } from '../../navigation/types';
import { ARTICLES, type ArticleId } from './articles';

type Props = NativeStackScreenProps<PostsStackParamList, 'Article'>;

export default function ArticleScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'android' ? insets.top + 30 : 0;
  const { id } = route.params; 
  const art = ARTICLES[id];

  const TAB_BAR_H = 100;
  const blockerH = TAB_BAR_H + insets.bottom;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={[s.header, { paddingTop: 6 + topPad }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <Text style={s.back}>{'‹ Back'}</Text>
        </Pressable>
        <Text style={s.headerTitle} numberOfLines={1}>{art.title}</Text>
        <View style={{ width: 56 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: blockerH + 16 }}
        scrollIndicatorInsets={{ bottom: blockerH }}
      >
        <Text style={s.title}>{art.title}</Text>
        <Image source={art.hero} style={s.hero} resizeMode="cover" />
        {art.body.map((p: string, i: number) => (
          <Text key={i} style={[s.paragraph, i === 0 && { marginTop: 12 }]}>{p}</Text>
        ))}
      </ScrollView>

      <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: blockerH, backgroundColor: '#fff' }} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 12, flexDirection: 'row', alignItems: 'center' },
  back: { fontSize: 16 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', paddingHorizontal: 8 },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 10, color: '#111' },
  hero: { width: '100%', height: 200, borderRadius: 14, backgroundColor: '#f5eded', marginBottom: 12 },
  paragraph: { fontSize: 16, lineHeight: 23, color: '#222', marginBottom: 10 },
});