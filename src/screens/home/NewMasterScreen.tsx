import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  Image,
  PermissionsAndroid,
  Platform,
  Linking,
  KeyboardAvoidingView,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../navigation/types';
import { useMasters } from '../../store/masters';
import { launchImageLibrary, ImageLibraryOptions, Asset } from 'react-native-image-picker';
import Stagger from '../../components/Stagger';

type Props = NativeStackScreenProps<HomeStackParamList, 'NewMaster'>;

const COLORS = {
  primary: '#DB043F',
  border: '#E6E6E6',
  hint: '#A2A2A2',
  chipActiveBg: 'rgba(219,4,63,0.08)',
  text: '#1E1E1E',
};

const PRESET_CATEGORIES = ['Plumbers', 'Electricians', 'Carpenters', 'Painters', 'Handymen'];

const TAB_BAR_H = 100;

async function ensureGalleryPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  try {
    if (Platform.Version >= 33) {
      const res = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
      );
      return res === PermissionsAndroid.RESULTS.GRANTED;
    } else {
      const res = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
      );
      return res === PermissionsAndroid.RESULTS.GRANTED;
    }
  } catch {
    return false;
  }
}

export default function NewMasterScreen({ navigation }: Props) {
  const { categories, addMaster } = useMasters();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const topPad = Platform.OS === 'android' ? (insets.top + 20) : 0;

  const scale = Math.min(width / 375, 1);
  const isSmall = width < 360;
  const INPUT_H = Math.max(38, Math.round(44 * scale));
  const CHIP_H = Math.max(24, Math.round(28 * scale));
  const PHOTO = Math.max(68, Math.round(84 * scale));
  const FS_LABEL = Math.round(14 * Math.max(scale, 0.85));
  const FS_INPUT = Math.round(16 * Math.max(scale, 0.85));
  const FS_HEADER = Math.round((isSmall ? 20 : 22) * Math.max(scale, 0.9));
  const FS_SAVE = Math.round(18 * Math.max(scale, 0.9));

  const padH = 16;

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState<'$' | '€'>('$');
  const [category, setCategory] = useState('');
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);

  const allCats = useMemo(
    () => Array.from(new Set([...PRESET_CATEGORIES, ...categories])),
    [categories]
  );

  const pickImage = async () => {
    const ok = await ensureGalleryPermission();
    if (!ok) {
      Alert.alert(
        'Permission required',
        'Please allow access to your photos to select an image.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open settings', onPress: () => Linking.openSettings() },
        ]
      );
      return;
    }
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      selectionLimit: 1,
      quality: 0.9,
      presentationStyle: 'fullScreen',
    };
    const res = await launchImageLibrary(options);
    if (res.didCancel) return;
    if (res.errorCode) {
      Alert.alert('Error', res.errorMessage || res.errorCode);
      return;
    }
    const asset: Asset | undefined = res.assets?.[0];
    if (asset?.uri) setPhotoUri(asset.uri);
  };

  const onSave = async () => {
    if (!name.trim() || !role.trim() || !price.trim() || !category.trim()) {
      Alert.alert('Please fill all required fields');
      return;
    }
    await addMaster({
      name: name.trim(),
      role: role.trim(),
      price: price.trim(),
      currency,
      category: category.trim(),
      photoUri,
    });
    navigation.replace('MasterAdded', { name: name.trim() });
  };

  const canSave = !!(name.trim() && role.trim() && price.trim() && category.trim());

  const curtainH = TAB_BAR_H + insets.bottom;
  const contentPadBottom = curtainH + 16;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ flex: 1, paddingTop: topPad }}>
        <Stagger index={0}>
          <View style={[s.header, { paddingHorizontal: padH }]}>
            <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
              <Text style={{ fontSize: Math.round(16 * Math.max(scale, 0.9)) }}>{'‹ Back'}</Text>
            </Pressable>
            <Text style={[s.headerTitle, { fontSize: FS_HEADER }]}>New master</Text>
            <View style={{ width: 56 }} />
          </View>
        </Stagger>

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: padH, paddingBottom: contentPadBottom }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            scrollIndicatorInsets={{ top: topPad, bottom: curtainH }}
          >
            <Stagger index={1}>
              <Field label="Name" labelSize={FS_LABEL}>
                <TextInput
                  placeholder="Text"
                  placeholderTextColor={COLORS.hint}
                  value={name}
                  onChangeText={setName}
                  style={[s.input, { height: INPUT_H, fontSize: FS_INPUT }]}
                />
              </Field>
            </Stagger>

            <Stagger index={2}>
              <Field label="Role" labelSize={FS_LABEL}>
                <TextInput
                  placeholder="Text"
                  placeholderTextColor={COLORS.hint}
                  value={role}
                  onChangeText={setRole}
                  style={[s.input, { height: INPUT_H, fontSize: FS_INPUT }]}
                />
              </Field>
            </Stagger>

            <Stagger index={3}>
              <Field label="Cost of service" labelSize={FS_LABEL}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TextInput
                    placeholder="Text"
                    placeholderTextColor={COLORS.hint}
                    value={price}
                    onChangeText={setPrice}
                    keyboardType="numeric"
                    style={[s.input, { flex: 1, height: INPUT_H, fontSize: FS_INPUT }]}
                  />
                  <Pressable
                    style={[s.currBtn, { height: INPUT_H }, currency === '$' && s.currActive]}
                    onPress={() => setCurrency('$')}
                  >
                    <Text style={[s.currText, currency === '$' && s.currTextActive, { fontSize: FS_INPUT - 1 }]}>$</Text>
                  </Pressable>
                  <Pressable
                    style={[s.currBtn, { height: INPUT_H }, currency === '€' && s.currActive]}
                    onPress={() => setCurrency('€')}
                  >
                    <Text style={[s.currText, currency === '€' && s.currTextActive, { fontSize: FS_INPUT - 1 }]}>€</Text>
                  </Pressable>
                </View>
              </Field>
            </Stagger>

            <Stagger index={4}>
              <Field label="Category" labelSize={FS_LABEL}>
                <TextInput
                  placeholder="Text"
                  placeholderTextColor={COLORS.hint}
                  value={category}
                  onChangeText={setCategory}
                  style={[s.input, { height: INPUT_H, fontSize: FS_INPUT }]}
                />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 8, paddingTop: 8 }}
                >
                  {allCats.map((c) => {
                    const active = c === category;
                    return (
                      <Pressable
                        key={c}
                        onPress={() => setCategory(c)}
                        style={[
                          s.chip,
                          {
                            height: CHIP_H,
                            paddingHorizontal: Math.round(12 * scale),
                            borderRadius: Math.round(14 * scale),
                          },
                          active && { borderColor: COLORS.primary, backgroundColor: COLORS.chipActiveBg },
                        ]}
                      >
                        <Text style={{ color: active ? COLORS.primary : '#6B6B6B', fontWeight: '600', fontSize: Math.round(13 * Math.max(scale, 0.9)) }}>
                          {c}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </Field>
            </Stagger>

            <Stagger index={5}>
              <Field label="Photo" labelSize={FS_LABEL}>
                {photoUri ? (
                  <View
                    style={[
                      s.photoWrap,
                      { width: PHOTO + 20, height: PHOTO + 20, borderRadius: Math.round(16 * scale) },
                    ]}
                  >
                    <Image source={{ uri: photoUri }} style={{ width: '100%', height: '100%' }} />
                    <Pressable
                      onPress={() => setPhotoUri(undefined)}
                      style={[
                        s.removeBadge,
                        {
                          width: Math.round(28 * scale),
                          height: Math.round(28 * scale),
                          borderRadius: Math.round(14 * scale),
                        },
                      ]}
                      hitSlop={10}
                    >
                      <Text style={{ color: '#fff', fontWeight: '800' }}>×</Text>
                    </Pressable>
                  </View>
                ) : (
                  <Pressable
                    onPress={pickImage}
                    style={[
                      s.photoBtn,
                      { width: PHOTO, height: PHOTO, borderRadius: Math.round(14 * scale) },
                    ]}
                  >
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: Math.round(18 * Math.max(scale, 0.9)) }}>
                      ＋
                    </Text>
                  </Pressable>
                )}
              </Field>
            </Stagger>

            <Stagger index={6}>
              <View style={{ marginTop: 8 }}>
                <Pressable
                  style={[s.saveBtn, !canSave && { opacity: 0.5 }, { height: Math.round(56 * Math.max(scale, 0.9)), borderRadius: Math.round(28 * Math.max(scale, 0.9)) }]}
                  onPress={onSave}
                  disabled={!canSave}
                >
                  <Text style={[s.saveText, { fontSize: FS_SAVE }]}>Save</Text>
                </Pressable>
              </View>
            </Stagger>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>

      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: curtainH,
          backgroundColor: '#fff',
        }}
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
      <Text style={[s.label, { fontSize: labelSize }]}>{label}</Text>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    paddingTop: 6,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: { flex: 1, textAlign: 'center', fontWeight: '700', color: COLORS.text },

  label: { fontWeight: '700', marginBottom: 8, color: COLORS.text },

  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    color: COLORS.text,
  },

  currBtn: {
    width: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currActive: { borderColor: COLORS.primary, backgroundColor: COLORS.chipActiveBg },
  currText: { color: '#6B6B6B' },
  currTextActive: { color: COLORS.primary, fontWeight: '700' },

  chip: {
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  photoBtn: { backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  photoWrap: { overflow: 'hidden' },

  removeBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  saveBtn: {
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: { color: '#fff', fontWeight: '700' },
});