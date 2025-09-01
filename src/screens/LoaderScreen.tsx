
import React, { useEffect } from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  Text,
  ImageBackground,
  SafeAreaView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Loader'>;

export default function LoaderScreen({ navigation }: Props) {
  useEffect(() => {
    const t = setTimeout(() => {

      //navigation.replace('MainTabs');
    }, 3000);
    return () => clearTimeout(t);
  }, [navigation]);

  return (
    <ImageBackground
      source={require('../assets/loader.png')}
      style={styles.bg}
      resizeMode="cover"
    >
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>{'Leo Lowen\nNetwork'}</Text>
          <ActivityIndicator size="large" color="#DB043F" style={styles.spinner} />
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1 },
  header: {
    alignItems: 'center',
    marginTop: 66, 
  },
  title: {
    fontSize: 44,
    lineHeight: 48,
    fontWeight: '800',
    color: '#DB043F',
    textAlign: 'center',
  },
  spinner: {
    marginTop: 32, 
  },
});
