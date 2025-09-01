import React, { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  TextInput,
  Switch,
  Platform,
  PermissionsAndroid,
  Linking,
  Alert,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary, ImageLibraryOptions } from 'react-native-image-picker';
import Stagger from '../components/Stagger';

const C = {
  primary: '#DB043F',
  stroke: '#EDEDED',
  text: '#1E1E1E',
  muted: '#8D8D8D',
  bg: '#FFFFFF',
  rowBg: '#FFFFFF',
  rowPress: 'rgba(0,0,0,0.04)',
};

const TAB_BAR_H = 100;
const STORAGE_KEY = 'profile.v1';

type Profile = {
  name: string;
  avatarUri?: string;
  notifications: boolean;
};

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

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'android' ? insets.top + 30 : 0;
  const { width } = useWindowDimensions();

  const BASE_W = 375;
  const SCALE = Math.min(width / BASE_W, 1);
  const s = (n: number) => Math.round(n * SCALE);
  const blockerH = TAB_BAR_H + insets.bottom;

  const AVATAR = s(96);
  const R = Math.round(AVATAR / 2);
  const HEADER_FONT = s(22);
  const INPUT_H = Math.max(40, s(44));
  const SAVE_H = s(50);
  const NAME_FONT = s(18);
  const ROW_H = Math.max(52, s(56));
  const ROW_FONT = s(16);
  const LEADING_W = s(26);
  const CHEV_FONT = s(20);

  const [profile, setProfile] = useState<Profile>({ name: '', avatarUri: undefined, notifications: true });
  const [mode, setMode] = useState<'edit' | 'view'>('edit');

  const [name, setName] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | undefined>(undefined);
  const canSave = useMemo(() => name.trim().length > 0, [name]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const p: Profile = JSON.parse(raw);
          setProfile(p);
          setName(p.name);
          setAvatarUri(p.avatarUri);
          setMode(p.name ? 'view' : 'edit');
        }
      } catch {}
    })();
  }, []);

  const pickImage = async () => {
    const ok = await ensureGalleryPermission();
    if (!ok) {
      Alert.alert('Permission required', 'Please allow access to your photos.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open settings', onPress: () => Linking.openSettings() },
      ]);
      return;
    }
    const options: ImageLibraryOptions = { mediaType: 'photo', selectionLimit: 1, quality: 0.9 };
    const res = await launchImageLibrary(options);
    if (res.didCancel) return;
    const uri = res.assets?.[0]?.uri;
    if (uri) setAvatarUri(uri);
  };

  const save = async () => {
    if (!canSave) return;
    const next: Profile = { name: name.trim(), avatarUri, notifications: profile.notifications };
    setProfile(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setMode('view');
  };

  const toggleNotif = async (v: boolean) => {
    const next = { ...profile, notifications: v };
    setProfile(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const openUrl = (url: string) => {
    Linking.openURL(url).catch(() => Alert.alert('Cannot open the link'));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
   
      <Stagger index={0} from="bottom" replayOnFocus>
        <View style={[styles.header, { paddingTop: 6 + topPad }]}>
          <Text style={[styles.headerTitle, { fontSize: HEADER_FONT }]}>Profile</Text>
          {mode === 'view' && (
            <Pressable
              hitSlop={10}
              onPress={() => { setMode('edit'); setName(profile.name); setAvatarUri(profile.avatarUri); }}
            >
              <Text style={{ color: C.primary, fontWeight: '700', fontSize: s(14) }}>Edit</Text>
            </Pressable>
          )}
        </View>
      </Stagger>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: blockerH + 16 }}
        showsVerticalScrollIndicator={false}
        scrollIndicatorInsets={{ top: topPad, bottom: blockerH }}
      >
      
        <Stagger index={1} from="bottom" replayOnFocus>
          <View style={{ alignItems: 'center', marginTop: 8, marginBottom: 16 }}>
            {mode === 'edit' ? (
              <Pressable onPress={pickImage} style={[styles.avatarBtn, { width: AVATAR, height: AVATAR, borderRadius: R }]}>
                {avatarUri ? (
                  <>
                    <Image source={{ uri: avatarUri }} style={[styles.avatarImg, { borderRadius: R }]} />
                    <Pressable
                      onPress={() => setAvatarUri(undefined)}
                      hitSlop={10}
                      style={[styles.removeBadge, { width: s(26), height: s(26), borderRadius: s(13) }]}
                    >
                      <Text style={{ color: '#fff', fontWeight: '800' }}>×</Text>
                    </Pressable>
                  </>
                ) : (
                  <Text style={[styles.plus, { fontSize: s(34) }]}>＋</Text>
                )}
              </Pressable>
            ) : (
              <View style={[styles.avatarReadonly, { width: AVATAR, height: AVATAR, borderRadius: R }]}>
                {profile.avatarUri ? (
                  <Image source={{ uri: profile.avatarUri }} style={[styles.avatarImg, { borderRadius: R }]} />
                ) : (
                  <Text style={{ fontSize: s(26), color: '#fff' }}>
                    {profile.name ? profile.name[0].toUpperCase() : '🙂'}
                  </Text>
                )}
              </View>
            )}
          </View>
        </Stagger>

        {mode === 'edit' ? (
          <>
            <Stagger index={2} from="bottom" replayOnFocus>
              <Text style={[styles.label, { fontSize: s(14) }]}>Your name</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  placeholder="Text"
                  placeholderTextColor="#A2A2A2"
                  value={name}
                  onChangeText={setName}
                  style={[styles.input, { height: INPUT_H, fontSize: s(16) }]}
                />
                {!!name && (
                  <Pressable
                    style={[styles.clearBtn, { right: s(10), top: s(10), width: s(24), height: s(24), borderRadius: s(12) }]}
                    onPress={() => setName('')}
                  >
                    <Text style={[styles.clearTxt, { fontSize: s(16), lineHeight: s(16) }]}>×</Text>
                  </Pressable>
                )}
              </View>
            </Stagger>

            <Stagger index={3} from="bottom" replayOnFocus>
              <Pressable
                style={[styles.saveBtn, { height: SAVE_H, borderRadius: Math.round(SAVE_H / 2) }, !canSave && { opacity: 0.5 }]}
                disabled={!canSave}
                onPress={save}
              >
                <Text style={[styles.saveTxt, { fontSize: s(16) }]}>Save</Text>
              </Pressable>
            </Stagger>
          </>
        ) : (
          <Stagger index={2} from="bottom" replayOnFocus>
            <Text style={[styles.nameReadonly, { fontSize: NAME_FONT }]} numberOfLines={1}>
              {profile.name}
            </Text>
          </Stagger>
        )}

        <Stagger index={4} from="bottom" replayOnFocus>
          <View style={styles.list}>
            <Row
              title="Privacy policy"
              onPress={() => openUrl('https://www.termsfeed.com/live/74b3fa45-c1f5-469e-b993-9687b3be7d42')}
              leading="❗"
              rowHeight={ROW_H}
              leadingW={LEADING_W}
              fontSize={ROW_FONT}
              chevFont={CHEV_FONT}
            />
            <Divider />
            <Row
              title="Terms of use"
              onPress={() => openUrl('https://www.termsfeed.com/live/74b3fa45-c1f5-469e-b993-9687b3be7d42')}
              leading="📑"
              rowHeight={ROW_H}
              leadingW={LEADING_W}
              fontSize={ROW_FONT}
              chevFont={CHEV_FONT}
            />
            <Divider />
            <RowSwitch
              title="Notifications"
              value={profile.notifications}
              onValueChange={toggleNotif}
              leading="🔔"
              rowHeight={ROW_H}
              leadingW={LEADING_W}
              fontSize={ROW_FONT}
            />
          </View>
        </Stagger>
      </ScrollView>

      <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: blockerH, backgroundColor: '#fff' }} />
    </SafeAreaView>
  );
}

function Row({
  title,
  onPress,
  leading,
  rowHeight,
  leadingW,
  fontSize,
  chevFont,
}: {
  title: string;
  onPress: () => void;
  leading?: string;
  rowHeight: number;
  leadingW: number;
  fontSize: number;
  chevFont: number;
}) {
  return (
    <Pressable onPress={onPress} android_ripple={{ color: C.rowPress }}>
      <View style={[styles.row, { height: rowHeight, paddingHorizontal: 14 }]}>
        <Text style={[styles.leading, { width: leadingW, fontSize }]}>{leading ?? '•'}</Text>
        <Text style={[styles.rowTitle, { fontSize }]} numberOfLines={1}>{title}</Text>
        <Text style={[styles.chev, { fontSize: chevFont }]}>{'›'}</Text>
      </View>
    </Pressable>
  );
}

function RowSwitch({
  title,
  value,
  onValueChange,
  leading,
  rowHeight,
  leadingW,
  fontSize,
}: {
  title: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  leading?: string;
  rowHeight: number;
  leadingW: number;
  fontSize: number;
}) {
  return (
    <View style={[styles.row, { height: rowHeight, paddingHorizontal: 14 }]}>
      <Text style={[styles.leading, { width: leadingW, fontSize }]}>{leading ?? '•'}</Text>
      <Text style={[styles.rowTitle, { fontSize }]} numberOfLines={1}>{title}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#D7D7D7', true: '#B7F4C3' }}
        thumbColor={value ? '#2ECC71' : '#FFFFFF'}
      />
    </View>
  );
}

function Divider() {
  return <View style={{ height: 1, backgroundColor: C.stroke }} />;
}


const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontWeight: '800', color: C.text },

  avatarBtn: {
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarReadonly: {
    backgroundColor: '#C5D6E5',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%' },
  plus: { color: '#fff', fontWeight: '800', marginTop: -2 },
  removeBadge: {
    position: 'absolute', top: -6, right: -6, alignItems: 'center', justifyContent: 'center',
  },

  label: { marginBottom: 8, color: C.text, fontWeight: '700' },
  inputWrap: { position: 'relative' },
  input: { borderWidth: 1, borderColor: C.stroke, borderRadius: 12, paddingHorizontal: 12, color: C.text },
  clearBtn: { position: 'absolute', backgroundColor: '#EFEFEF', alignItems: 'center', justifyContent: 'center' },
  clearTxt: { color: '#6B6B6B' },

  saveBtn: { marginTop: 12, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  saveTxt: { color: '#fff', fontWeight: '800' },

  nameReadonly: { textAlign: 'center', color: C.text, marginBottom: 8, fontWeight: '800' },

  list: {
    marginTop: 16,
    backgroundColor: C.rowBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.stroke,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  leading: { textAlign: 'center' },
  rowTitle: { flex: 1, marginLeft: 8, color: C.text },
  chev: { color: '#9B9B9B' },
});