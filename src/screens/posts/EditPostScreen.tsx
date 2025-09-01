import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Image,
  Alert,
  useWindowDimensions,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { PostsStackParamList } from '../../navigation/types';
import { usePosts } from '../../store/posts';
import { launchImageLibrary } from 'react-native-image-picker';
import Stagger from '../../components/Stagger';

type Props = NativeStackScreenProps<PostsStackParamList, 'EditPost'>;

const C = { primary: '#DB043F', border: '#E6E6E6', hint: '#A2A2A2', text: '#1E1E1E', bg: '#FFFFFF' };
const TAB_BAR_H = 100;

function useSize() {
  const { width: SW, height: SH } = useWindowDimensions();
  const BASE_W = 390;
  const BASE_H = 844;
  const SCALE = Math.min(SW / BASE_W, SH / BASE_H, 1);
  const sz = (n: number) => Math.max(1, Math.round(n * SCALE));
  const isSmall = SW <= 360;
  return { sz, isSmall, SW };
}

export default function EditPostScreen({ navigation, route }: Props) {
  const { getPost, updatePost } = usePosts();

  const id = route?.params?.id;
  const post = id ? getPost(id) : undefined;

  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'android' ? insets.top + 30 : 0;

  const [title, setTitle] = useState(post?.title ?? '');
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? '');
  const [body, setBody] = useState(post?.body ?? '');
  const [masterName, setMasterName] = useState(post?.masterName ?? '');
  const [imageUri, setImageUri] = useState<string | undefined>(post?.imageUri);

  const { sz } = useSize();

 
  useEffect(() => {
    if (!post) navigation.goBack();
  }, [post, navigation]);

  const pick = async () => {
    const res = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 1, quality: 0.9, presentationStyle: 'fullScreen' });
    if (res.didCancel) return;
    const uri = res.assets?.[0]?.uri;
    if (uri) setImageUri(uri);
  };

  const canSave = !!title.trim() && !!masterName.trim();

  const onSave = () => {
    if (!post) return;
    if (!canSave) { Alert.alert('Please fill required fields'); return; }
    updatePost(post.id, {
      title: title.trim(),
      excerpt: excerpt.trim(),
      body: body.trim(),
      masterName: masterName.trim(),
      imageUri,
    });
    navigation.goBack();
  };

  if (!post) return null;

  const INPUT_H = Math.max(38, sz(44));
  const PHOTO_SIDE = Math.max(96, sz(120));

  const listBottomPad = TAB_BAR_H + sz(24);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={[styles.header, { paddingHorizontal: sz(16), paddingTop: sz(6) + topPad, paddingBottom: sz(12) }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <Text style={{ fontSize: sz(16) }}>{'‹ Back'}</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { fontSize: sz(22) }]}>Edit post</Text>
        <View style={{ width: sz(56) }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: sz(16), paddingBottom: listBottomPad, paddingTop: sz(8) }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          scrollIndicatorInsets={{ bottom: listBottomPad, top: topPad }}
        >
          <Stagger index={0} from="bottom">
            <Field label="Heading" labelSize={sz(14)}>
              <TextInput
                placeholder="Text"
                placeholderTextColor={C.hint}
                value={title}
                onChangeText={setTitle}
                style={[styles.input, { height: INPUT_H, fontSize: sz(16) }]}
              />
            </Field>
          </Stagger>

          <Stagger index={1} from="bottom">
            <Field label="Description" labelSize={sz(14)}>
              <TextInput
                placeholder="Text"
                placeholderTextColor={C.hint}
                value={excerpt}
                onChangeText={setExcerpt}
                style={[styles.input, { height: Math.max(72, sz(88)), fontSize: sz(16), textAlignVertical: 'top' }]}
                multiline
              />
            </Field>
          </Stagger>

          <Stagger index={2} from="bottom">
            <Field label="Master" labelSize={sz(14)}>
              <TextInput
                placeholder="Text"
                placeholderTextColor={C.hint}
                value={masterName}
                onChangeText={setMasterName}
                style={[styles.input, { height: INPUT_H, fontSize: sz(16) }]}
              />
            </Field>
          </Stagger>

          <Stagger index={3} from="bottom">
            <Field label="Body (long article)" labelSize={sz(14)}>
              <TextInput
                placeholder="Paste or type long text"
                placeholderTextColor={C.hint}
                value={body}
                onChangeText={setBody}
                style={[styles.input, { height: Math.max(180, sz(220)), fontSize: sz(16), textAlignVertical: 'top' }]}
                multiline
              />
            </Field>
          </Stagger>

          <Stagger index={4} from="bottom">
            <Field label="Photo" labelSize={sz(14)}>
              {imageUri ? (
                <View style={[styles.previewWrap, { width: PHOTO_SIDE, height: PHOTO_SIDE, borderRadius: sz(16) }]}>
                  <Image source={{ uri: imageUri }} style={styles.preview} />
                  <Pressable onPress={() => setImageUri(undefined)} style={[styles.removeBadge, { width: sz(28), height: sz(28), borderRadius: sz(14) }]} hitSlop={10}>
                    <Text style={{ color: '#fff', fontWeight: '800' }}>×</Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable onPress={pick} style={[styles.photoBtn, { width: Math.max(70, sz(80)), height: Math.max(70, sz(80)), borderRadius: sz(14) }]}>
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: sz(18) }}>＋</Text>
                </Pressable>
              )}
            </Field>
          </Stagger>

          <Stagger index={5} from="bottom">
            <View style={{ marginTop: sz(8) }}>
              <Pressable style={[styles.saveBtn, { height: sz(56), borderRadius: sz(28) }, !canSave && { opacity: 0.5 }]} disabled={!canSave} onPress={onSave}>
                <Text style={{ color: '#fff', fontSize: sz(18), fontWeight: '700' }}>Save</Text>
              </Pressable>
            </View>
          </Stagger>
        </ScrollView>
      </KeyboardAvoidingView>

      <View
        pointerEvents="none"
        style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: TAB_BAR_H, backgroundColor: C.bg }}
      />
    </SafeAreaView>
  );
}

function Field({
  label,
  children,
  labelSize = 14,
}: {
  label: string;
  children: React.ReactNode;
  labelSize?: number;
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: labelSize, fontWeight: '700', marginBottom: 8, color: C.text }}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontWeight: '700', color: C.text },

  input: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    color: C.text,
  },

  photoBtn: { backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },

  previewWrap: { overflow: 'hidden' },
  preview: { width: '100%', height: '100%' },
  removeBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  saveBtn: {
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});