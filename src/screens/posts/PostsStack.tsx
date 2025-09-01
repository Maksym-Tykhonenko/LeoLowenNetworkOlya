
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { PostsStackParamList } from '../../navigation/types';
import PostsListScreen from './PostsListScreen';
import NewPostScreen from './NewPostScreen';
import PostAddedScreen from './PostAddedScreen';
import PostDetailScreen from './PostDetailScreen';
import EditPostScreen from './EditPostScreen';
import ArticleScreen from './ArticleScreen';

const Stack = createNativeStackNavigator<PostsStackParamList>();
export default function PostsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PostsList" component={PostsListScreen} />
      <Stack.Screen name="NewPost" component={NewPostScreen} />
      <Stack.Screen name="PostAdded" component={PostAddedScreen} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} />
      <Stack.Screen name="EditPost" component={EditPostScreen} />
      <Stack.Screen name="Article" component={ArticleScreen} />
    </Stack.Navigator>
  );
}
