import React, { useMemo, useState } from 'react';
import {
  SafeAreaView, View, Text, StyleSheet, TextInput, Pressable, Image,
  Platform, PermissionsAndroid, Linking, Alert, ScrollView, useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGroups } from '../../store/groups';
import { useMasters, type Master } from '../../store/masters';
import { launchImageLibrary, type ImageLibraryOptions } from 'react-native-image-picker';
import Stagger from '../../components/Stagger';

const C = {
  primary: '#DB043F',
  stroke: '#E6E6E6',
  hint: '#A2A2A2',
  text: '#1E1E1E',
  muted: '#8D8D8D',
};

const TAB_BAR_H = 100; 

async function ensureGalleryPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  try {
    if (Platform.Version >= 33) {
      const r = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES);
      return r === PermissionsAndroid.RESULTS.GRANTED;
    } else {
      const r = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
      return r === PermissionsAndroid.RESULTS.GRANTED;
    }
  } catch {
    return false;
  }
}

export default function NewGroupScreen({ navigation }: any) {
  const { addGroup } = useGroups();
  const { masters } = useMasters();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'android' ? insets.top + 30 : 0;
  const { width } = useWindowDimensions();

  const BASE_W = 375;
  const SCALE = Math.min(width / BASE_W, 1);
  const s = (n: number) => Math.round(n * SCALE);
  const isSmall = width <= 360;

  const INPUT_H = Math.max(38, s(44));
  const RADIO = Math.max(22, s(26));
  const RADIO_DOT = Math.max(10, s(12));
  const CARD_W = Math.max(180, s(220));
  const CARD_PH = Math.max(90, s(110));
  const COVER_H = Math.max(150, s(180));

  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [coverUri, setCoverUri] = useState<string | undefined>(undefined);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const canSave = !!title.trim(); 

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const pickCover = async () => {
    const ok = await ensureGalleryPermission();
    if (!ok) {
      Alert.alert('Permission required', 'Allow access to photos in Settings.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open settings', onPress: () => Linking.openSettings() },
      ]);
      return;
    }
    const opts: ImageLibraryOptions = { mediaType: 'photo', quality: 0.9, selectionLimit: 1, presentationStyle: 'fullScreen' };
    const res = await launchImageLibrary(opts);
    if (res.didCancel) return;
    const uri = res.assets?.[0]?.uri;
    if (uri) setCoverUri(uri);
  };

  const save = () => {
    if (!canSave) return;
    addGroup({
      title: title.trim(),
      description: desc.trim(),
      coverUri,
      masterIds: Array.from(selected),
    });
    navigation.goBack();
  };

  const MasterCard = ({ m, idx }: { m: Master; idx: number }) => {
    const chosen = selected.has(m.id);
    return (
      <Stagger index={idx} from="bottom" replayOnFocus>
        <View style={[styles.mCard, { width: CARD_W }, chosen && styles.mCardActive]}>
          <View style={[styles.mPhoto, { height: CARD_PH }]}>
            {m.photoUri
              ? <Image source={{ uri: m.photoUri }} style={styles.mPhotoImg} />
              : <View style={[styles.mPhoto, { height: CARD_PH, backgroundColor: '#F2F2F2' }]} />
            }
          </View>
          <View style={{ paddingHorizontal: 12 }}>
            <Text style={[styles.mName, { fontSize: isSmall ? 15 : 16 }]} numberOfLines={1}>{m.name}</Text>
            <Text style={[styles.mFrom, { fontSize: isSmall ? 11 : 12 }]}>{`from ${m.price}${m.currency}/h`}</Text>
            <Text style={[styles.mRole, { fontSize: isSmall ? 12 : 13 }]} numberOfLines={1}>{m.role}</Text>
          </View>
          <View style={styles.mFooter}>
            <Pressable onPress={() => toggle(m.id)} hitSlop={10}
              style={[
                styles.radio,
                { width: RADIO, height: RADIO, borderRadius: RADIO / 2 },
                chosen && styles.radioActive,
              ]}
            >
              {chosen && <View style={{ width: RADIO_DOT, height: RADIO_DOT, borderRadius: RADIO_DOT / 2, backgroundColor: C.primary }} />}
            </Pressable>
          </View>
        </View>
      </Stagger>
    );
  };

  const blockerH = TAB_BAR_H + insets.bottom;
  const listBottomPad = blockerH + s(24);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <Stagger index={0} from="bottom" replayOnFocus>
        <View style={[styles.header, { paddingTop: 6 + topPad }]}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
            <Text style={{ fontSize: s(16) }}>{'‹ Back'}</Text>
          </Pressable>
          <Text style={[styles.headerTitle, { fontSize: s(22) }]}>New group</Text>
          <View style={{ width: s(56) }} />
        </View>
      </Stagger>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: listBottomPad }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        scrollIndicatorInsets={{ top: topPad, bottom: blockerH }}
      >
        <Stagger index={1} from="bottom" replayOnFocus>
          <Text style={[styles.label, { fontSize: s(14) }]}>Heading</Text>
        </Stagger>
        <Stagger index={2} from="bottom" replayOnFocus>
          <View style={styles.inputWrap}>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Text"
              placeholderTextColor={C.hint}
              style={[styles.input, { height: INPUT_H, fontSize: s(16) }]}
            />
          </View>
        </Stagger>

        <Stagger index={3} from="bottom" replayOnFocus>
          <Text style={[styles.label, { marginTop: 16, fontSize: s(14) }]}>Choose masters</Text>
        </Stagger>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12 }}
          style={{ paddingTop: 4 }}
        >
          {masters.map((m, i) => (
            <MasterCard key={m.id} m={m} idx={i + 4} />
          ))}
        </ScrollView>

        <Stagger index={masters.length + 5} from="bottom" replayOnFocus>
          <Text style={[styles.label, { marginTop: 16, fontSize: s(14) }]}>Description</Text>
        </Stagger>
        <Stagger index={masters.length + 6} from="bottom" replayOnFocus>
          <View style={styles.inputWrap}>
            <TextInput
              value={desc}
              onChangeText={setDesc}
              placeholder="Text"
              placeholderTextColor={C.hint}
              style={[styles.input, { height: Math.max(88, s(100)), textAlignVertical: 'top', paddingTop: 10, fontSize: s(16) }]}
              multiline
            />
          </View>
        </Stagger>

        <Stagger index={masters.length + 7} from="bottom" replayOnFocus>
          <Text style={[styles.label, { marginTop: 16, fontSize: s(14) }]}>Cover</Text>
        </Stagger>
        <Stagger index={masters.length + 8} from="bottom" replayOnFocus>
          {coverUri ? (
            <View style={[styles.coverWrap, { height: COVER_H, borderRadius: s(16) }]}>
              <Image source={{ uri: coverUri }} style={styles.coverImg} />
              <Pressable
                style={[styles.removeBadge, { width: s(28), height: s(28), borderRadius: s(14) }]}
                onPress={() => setCoverUri(undefined)}
                hitSlop={10}
              >
                <Text style={{ color: '#fff', fontWeight: '800' }}>×</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable style={[styles.addCoverBtn, { width: s(64), height: s(36), borderRadius: s(18) }]} onPress={pickCover}>
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: s(16) }}>＋</Text>
            </Pressable>
          )}
        </Stagger>

        <Stagger index={masters.length + 9} from="bottom" replayOnFocus>
          <Pressable style={[styles.saveBtn, { height: s(56), borderRadius: s(28) }, !canSave && { opacity: 0.5 }]} disabled={!canSave} onPress={save}>
            <Text style={[styles.saveText, { fontSize: s(18) }]}>Save</Text>
          </Pressable>
        </Stagger>
      </ScrollView>

      <View
        pointerEvents="none"
        style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: blockerH, backgroundColor: '#fff' }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 12, flexDirection: 'row', alignItems: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontWeight: '700', color: C.text },

  label: { fontWeight: '700', color: C.text, marginBottom: 8 },
  inputWrap: { position: 'relative' },
  input: {
    borderWidth: 1,
    borderColor: C.stroke,
    borderRadius: 12,
    paddingHorizontal: 12,
    color: C.text,
  },

  mCard: { borderWidth: 1, borderColor: C.stroke, borderRadius: 16, backgroundColor: '#fff', overflow: 'hidden' },
  mCardActive: { borderColor: C.primary },
  mPhoto: { margin: 12, borderRadius: 12, overflow: 'hidden' },
  mPhotoImg: { width: '100%', height: '100%', borderRadius: 12 },
  mName: { fontWeight: '700', color: C.text },
  mFrom: { marginTop: 2, color: C.muted },
  mRole: { marginTop: 2, color: C.text },
  mFooter: { marginTop: 10, paddingHorizontal: 12, paddingBottom: 12, flexDirection: 'row', justifyContent: 'flex-end' },

  radio: { borderWidth: 2, borderColor: C.stroke, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: C.primary, backgroundColor: 'rgba(219,4,63,0.10)' },

  addCoverBtn: { backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  coverWrap: { width: '100%', overflow: 'hidden', backgroundColor: '#F2F2F2' },
  coverImg: { width: '100%', height: '100%' },
  removeBadge: { position: 'absolute', top: -8, right: -8, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },

  saveBtn: { marginTop: 24, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  saveText: { color: '#fff', fontWeight: '700' },
});