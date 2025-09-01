import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { GroupsStackParamList } from '../../navigation/types';

import GroupsListScreen from './GroupsListScreen';
import NewGroupScreen from './NewGroupScreen';
import GroupDetailScreen from './GroupDetailScreen';
import EditGroupScreen from './EditGroupScreen';

const Stack = createNativeStackNavigator<GroupsStackParamList>();

export default function GroupsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GroupsList" component={GroupsListScreen} />
      <Stack.Screen name="NewGroup" component={NewGroupScreen} />
      <Stack.Screen name="GroupDetail" component={GroupDetailScreen} />
      <Stack.Screen name="EditGroup" component={EditGroupScreen} />
    </Stack.Navigator>
  );
}
