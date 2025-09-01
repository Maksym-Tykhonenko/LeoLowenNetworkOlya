import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Dimensions,
  ScrollView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../navigation/types';
import Stagger from '../../components/Stagger';
import Appear from '../../components/Appear';

type Props = NativeStackScreenProps<HomeStackParamList, 'MasterAdded'>;
const { width: SW, height: SH } = Dimensions.get('window');
const BASE_W = 390;
const BASE_H = 844;
const SCALE = Math.min(SW / BASE_W, SH / BASE_H, 1);
const s = (n: number) => Math.round(n * SCALE);

const TAB_BAR_H = 100;
const TOP_PAD = Platform.OS === 'android' ? 30 : 0;

export default function MasterAddedScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const curtainH = TAB_BAR_H + insets.bottom;

  return (
    <SafeAreaView style={styles.safe}>
      <Stagger index={0} from="top">
        <View style={[styles.header, { paddingHorizontal: s(16), paddingBottom: s(12), paddingTop: s(6) }]}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
            <Text style={{ fontSize: s(16) }}>{'‹ Back'}</Text>
          </Pressable>
          <View style={{ flex: 1 }} />
          <View style={{ width: s(56) }} />
        </View>
      </Stagger>

      <ScrollView
        contentContainerStyle={{
          paddingTop: TOP_PAD,
          paddingBottom: s(24) + curtainH + s(56) + s(16), 
          paddingHorizontal: 0,
        }}
        showsVerticalScrollIndicator={false}
        scrollIndicatorInsets={{ top: TOP_PAD, bottom: curtainH }}
      >
        <Stagger index={1} from="bottom">
          <Text
            style={[
              styles.title,
              {
                fontSize: s(24),
                marginTop: s(8),
                marginBottom: s(12),
                marginHorizontal: s(16),
              },
            ]}
            numberOfLines={2}
            adjustsFontSizeToFit
          >
            Master is successfully{'\n'}added
          </Text>
        </Stagger>

        <Appear from="left" delay={160} distance={24}>
          <View style={{ alignItems: 'flex-start' }}>
            <Image
              source={require('../../assets/lion.png')}
              style={{
                width: SW,          
                height: s(520),    
                resizeMode: 'contain',
                alignSelf: 'flex-start',
              }}
            />
          </View>
        </Appear>
      </ScrollView>

      <Appear from="bottom" delay={220}>
        <View style={[styles.saveWrap, { left: s(16), right: s(16), bottom: s(24) + curtainH }]}>
          <Pressable
            style={[styles.saveBtn, { height: s(56), borderRadius: s(28) }]}
            onPress={() => navigation.replace('HomeList')}
          >
            <Text style={[styles.saveText, { fontSize: s(18) }]}>Save</Text>
          </Pressable>
        </View>
      </Appear>

      <View
        pointerEvents="none"
        style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: curtainH, backgroundColor: '#fff' }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center' },
  title: { fontWeight: '800', textAlign: 'center', color: '#1E1E1E' },
  saveWrap: { position: 'absolute' },
  saveBtn: { backgroundColor: '#DB043F', alignItems: 'center', justifyContent: 'center' },
  saveText: { color: '#fff', fontWeight: '700' },
});