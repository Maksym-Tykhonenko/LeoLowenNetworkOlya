
import 'react-native-gesture-handler';
import 'react-native-get-random-values';
import React, { useEffect } from 'react';
import { UIManager, Platform } from 'react-native';
import { NavigationContainer, DefaultTheme, Theme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';


import RootNavigator from './src/navigation/RootNavigator';
import { MastersProvider } from './src/store/masters';
import { PostsProvider } from './src/store/posts';
import { GroupsProvider } from './src/store/groups';

const navTheme: Theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: '#FFFFFF' },
};

export default function App() {
  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  return (
    <SafeAreaProvider>
      <MastersProvider>
        <PostsProvider>
          <GroupsProvider>
            <NavigationContainer theme={navTheme}>
              <RootNavigator />
            </NavigationContainer>
          </GroupsProvider>
        </PostsProvider>
      </MastersProvider>
    </SafeAreaProvider>
  );
}
