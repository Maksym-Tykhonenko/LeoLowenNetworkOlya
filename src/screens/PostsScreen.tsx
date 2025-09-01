import React from 'react';
import { SafeAreaView, StyleSheet, Text, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PostsScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'android' ? insets.top + 20 : 0;

  return (
    <SafeAreaView style={[styles.container, { paddingTop: topPad }]}>
      <Text style={styles.title}>Posts Screen</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700' },
});