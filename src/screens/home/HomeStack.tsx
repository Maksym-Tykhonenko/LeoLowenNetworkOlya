
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../navigation/types';
import HomeListScreen from './HomeListScreen';
import NewMasterScreen from './NewMasterScreen';
import MasterAddedScreen from './MasterAddedScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeList" component={HomeListScreen} />
      <Stack.Screen name="NewMaster" component={NewMasterScreen} />
      <Stack.Screen name="MasterAdded" component={MasterAddedScreen} />
    </Stack.Navigator>
  );
}
