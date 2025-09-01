
import React from 'react';
import { View, Image, Pressable, StyleSheet, ImageSourcePropType, Platform } from 'react-native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { MainTabParamList } from './types';

import HomeStack from '../screens/home/HomeStack';
import PostsStack from '../screens/posts/PostsStack';
import GroupsStack from '../screens/groups/GroupsStack';
import CalendarScreen from '../screens/CalendarScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

type IconPair = { active: ImageSourcePropType; inactive: ImageSourcePropType };
const ICONS: Record<keyof MainTabParamList, IconPair> = {
  Home:    { active: require('../assets/home_active.png'),     inactive: require('../assets/home.png') },
  Posts:   { active: require('../assets/posts_active.png'),    inactive: require('../assets/posts.png') },
  Groups:  { active: require('../assets/groups_active.png'),   inactive: require('../assets/groups.png') },
  Calendar:{ active: require('../assets/calendar_active.png'), inactive: require('../assets/calendar.png') },
  Profile: { active: require('../assets/profile_active.png'),  inactive: require('../assets/profile.png') },
};

const BAR_BG = Platform.select({ ios: 'rgba(219,4,63,0.08)', android: '#FCEBF0' }) as string;
const DIVIDER = 'rgba(255,255,255,0.7)';

function MyTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <>
      {Platform.OS === 'android' && (
        <View style={[StyleSheet.absoluteFill, { bottom: 0, top: undefined, height: 100 + Math.max(insets.bottom, 8), backgroundColor: '#FFF' }]} />
      )}

      <View
        style={[
          styles.bar,
          Platform.OS === 'ios' ? styles.barIOS : styles.barAndroid,
          { paddingBottom: Math.max(insets.bottom, 8) },
        ]}
      >
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const iconPair = ICONS[route.name as keyof MainTabParamList];

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name as never);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={[styles.item, index !== state.routes.length - 1 && styles.itemDivider]}
              android_ripple={{ color: 'rgba(0,0,0,0.06)', borderless: true }}
            >
              <Image source={isFocused ? iconPair.active : iconPair.inactive} style={styles.icon} resizeMode="contain" />
            </Pressable>
          );
        })}
      </View>
    </>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <MyTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Posts" component={PostsStack} />
      <Tab.Screen name="Groups" component={GroupsStack} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    height: 100,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    overflow: 'hidden',
  },
  barIOS: {
    backgroundColor: BAR_BG,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
  },
  barAndroid: {
    backgroundColor: BAR_BG,      
    elevation: 6,              
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 12,
  },
  itemDivider: {
    borderRightWidth: 1,
    borderRightColor: DIVIDER,
  },
  icon: { width: 78, height: 56 },
});
