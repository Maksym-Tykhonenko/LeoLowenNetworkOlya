import type { ArticleId } from '../screens/posts/articles';

export type PostsStackParamList = {
  PostsList: undefined;
  NewPost: undefined;
  PostAdded: undefined;
  PostDetail: { id: string };
  EditPost: { id: string };
  Article: { id: ArticleId };
};

export type RootStackParamList = {
  Loader: undefined;
  MainTabs: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Posts: undefined;
  Groups: undefined;
  Calendar: undefined;
  Profile: undefined;
};

export type HomeStackParamList = {
  HomeList: undefined;
  NewMaster: undefined;
  MasterAdded: { name: string } | undefined;
};
export type GroupsStackParamList = {
  GroupsList: undefined;
  NewGroup: undefined;
  GroupDetail: { id: string };
  EditGroup: { id: string };
};
