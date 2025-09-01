import React, { useMemo, useState } from 'react';
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
  Share,
  PermissionsAndroid,
  Platform,
  Linking,
  KeyboardAvoidingView,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
  DateTimePickerAndroid,
} from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { PostsStackParamList } from '../../navigation/types';
import { usePosts } from '../../store/posts';
import { useMasters } from '../../store/masters';
import { launchImageLibrary, ImageLibraryOptions } from 'react-native-image-picker';

type Props = NativeStackScreenProps<PostsStackParamList, 'NewPost'>;

const C = {
  primary: '#DB043F',
  stroke: '#E6E6E6',
  hint: '#A2A2A2',
  text: '#1E1E1E',
  muted: '#8D8D8D',
  chipBg: '#F9F1F3',
  chipActiveBg: 'rgba(219,4,63,0.08)',
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

function fmtDate(iso?: string) {
  if (!iso) return 'DD/MM/YY';
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
}
function fmtTime(iso?: string) {
  if (!iso) return 'HH/MM';
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}/${mm}`;
}

export default function NewPostScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'android' ? insets.top + 30 : 0;

  const TAB_BAR_H = 100;

  const blockerH = TAB_BAR_H + insets.bottom;

  const { addPost } = usePosts();
  const { masters, categories } = useMasters();

  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState<'$' | '€'>('$');

  const [category, setCategory] = useState('');
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);

  const [selectedMasterId, setSelectedMasterId] = useState<string | undefined>(undefined);

  const [dateISO, setDateISO] = useState<string | undefined>(undefined);
  const [startISO, setStartISO] = useState<string | undefined>(undefined);
  const [endISO, setEndISO] = useState<string | undefined>(undefined);

  const [activeIOSPicker, setActiveIOSPicker] = useState<null | 'date' | 'start' | 'end'>(null);

  const canSave = !!title.trim() && !!selectedMasterId;

  const chosenMaster = useMemo(
    () => masters.find(m => m.id === selectedMasterId),
    [masters, selectedMasterId]
  );

  const onPickImage = async () => {
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
    const options: ImageLibraryOptions = { mediaType: 'photo', selectionLimit: 1, quality: 0.9 };
    const res = await launchImageLibrary(options);
    if (res.didCancel) return;
    const uri = res.assets?.[0]?.uri;
    if (uri) setPhotoUri(uri);
  };

  const handlePick = (mode: 'date' | 'start' | 'end', e: DateTimePickerEvent, d?: Date) => {
    if (e.type === 'dismissed') {
      setActiveIOSPicker(null);
      return;
    }
    if (!d) return;

    if (mode === 'date') {
      const onlyDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
      setDateISO(onlyDate.toISOString());
      if (startISO) {
        const t = new Date(startISO);
        setStartISO(new Date(onlyDate.getFullYear(), onlyDate.getMonth(), onlyDate.getDate(), t.getHours(), t.getMinutes()).toISOString());
      }
      if (endISO) {
        const t = new Date(endISO);
        setEndISO(new Date(onlyDate.getFullYear(), onlyDate.getMonth(), onlyDate.getDate(), t.getHours(), t.getMinutes()).toISOString());
      }
      setActiveIOSPicker(null);
      return;
    }

    const base = dateISO ? new Date(dateISO) : new Date();
    const val = new Date(
      base.getFullYear(),
      base.getMonth(),
      base.getDate(),
      d.getHours(),
      d.getMinutes(),
      0,
      0
    ).toISOString();

    if (mode === 'start') setStartISO(val);
    if (mode === 'end') setEndISO(val);
    setActiveIOSPicker(null);
  };

  const openDatePicker = () => {
    const value = dateISO ? new Date(dateISO) : new Date();
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value,
        mode: 'date',
        display: 'calendar',
        onChange: (e: DateTimePickerEvent, d?: Date) => handlePick('date', e, d),
        is24Hour: true,
      });
    } else {
      setActiveIOSPicker(prev => (prev === 'date' ? null : 'date'));
    }
  };

  const openStartTimePicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: startISO ? new Date(startISO) : new Date(),
        mode: 'time',
        display: 'clock',
        onChange: (e: DateTimePickerEvent, d?: Date) => handlePick('start', e, d),
        is24Hour: true,
      });
    } else {
      setActiveIOSPicker(prev => (prev === 'start' ? null : 'start'));
    }
  };

  const openEndTimePicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: endISO ? new Date(endISO) : new Date(),
        mode: 'time',
        display: 'clock',
        onChange: (e: DateTimePickerEvent, d?: Date) => handlePick('end', e, d),
        is24Hour: true,
      });
    } else {
      setActiveIOSPicker(prev => (prev === 'end' ? null : 'end'));
    }
  };

  const onSave = async () => {
    if (!canSave) {
      Alert.alert('Please fill the required fields');
      return;
    }
    await addPost({
      title: title.trim(),
      excerpt: comment.trim(),
      imageUri: photoUri,
      masterName: chosenMaster?.name ?? '',
      category: category.trim(),
      dateISO,
      startISO,
      endISO,
    });
    navigation.replace('PostAdded');
  };

  const shareMaster = async (id: string) => {
    const m = masters.find(x => x.id === id);
    if (!m) return;
    try {
      await Share.share({
        message: `${m.name}\nfrom ${m.price}${m.currency}/h\n${m.role}`,
      });
    } catch {}
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={[s.header, { paddingTop: 6 + topPad }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <Text style={{ fontSize: 16 }}>{'‹ Back'}</Text>
        </Pressable>
        <Text style={s.headerTitle}>New post</Text>
        <View style={{ width: 56 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: blockerH + 16 }}
          scrollIndicatorInsets={{ top: topPad, bottom: blockerH }}
          keyboardShouldPersistTaps="handled"
          style={{ backgroundColor: '#fff' }}
        >
          <Field label="Heading">
            <View style={s.inputWrap}>
              <TextInput
                placeholder="Text"
                placeholderTextColor={C.hint}
                value={title}
                onChangeText={setTitle}
                style={s.input}
              />
              {!!title && (
                <Pressable style={s.clearBtn} onPress={() => setTitle('')}>
                  <Text style={s.clearCross}>×</Text>
                </Pressable>
              )}
            </View>
          </Field>

          <Field label="Choose master">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              {masters.map(m => {
                const selected = m.id === selectedMasterId;
                return (
                  <View key={m.id} style={[s.masterCard, selected && s.masterCardSelected]}>
                    <View style={s.masterPhoto}>
                      {m.photoUri
                        ? <Image source={{ uri: m.photoUri }} style={s.masterPhotoImg} />
                        : <View style={[s.masterPhoto, { backgroundColor: '#F2F2F2' }]} />}
                    </View>
                    <View style={{ paddingHorizontal: 12 }}>
                      <Text style={s.mName} numberOfLines={1}>{m.name}</Text>
                      <Text style={s.mFrom}>{`from ${m.price}${m.currency}/h`}</Text>
                      <Text style={s.mRole} numberOfLines={1}>{m.role}</Text>
                    </View>
                    <View style={s.mFooter}>
                      <Pressable style={s.shareBtn} onPress={() => shareMaster(m.id)}>
                        <Text style={s.shareText}>Share</Text>
                      </Pressable>
                      <Pressable onPress={() => setSelectedMasterId(m.id)} style={[s.radio, selected && s.radioActive]} hitSlop={10}>
                        {selected && <View style={s.radioDot} />}
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </Field>

          <Field label="Comment">
            <View style={s.inputWrap}>
              <TextInput
                placeholder="How was it be?"
                placeholderTextColor={C.hint}
                value={comment}
                onChangeText={setComment}
                style={[s.input, { height: 48 }]}
              />
              {!!comment && (
                <Pressable style={s.clearBtn} onPress={() => setComment('')}>
                  <Text style={s.clearCross}>×</Text>
                </Pressable>
              )}
            </View>
          </Field>

          <Field label="Cost of service">
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={[s.inputWrap, { flex: 1 }]}>
                <TextInput
                  placeholder="Text"
                  placeholderTextColor={C.hint}
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                  style={s.input}
                />
                {!!price && (
                  <Pressable style={s.clearBtn} onPress={() => setPrice('')}>
                    <Text style={s.clearCross}>×</Text>
                  </Pressable>
                )}
              </View>

              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Pressable style={[s.currBtn, currency === '$' && s.currActive]} onPress={() => setCurrency('$')}>
                  <Text style={[s.currText, currency === '$' && s.currTextActive]}>$</Text>
                </Pressable>
                <Pressable style={[s.currBtn, currency === '€' && s.currActive]} onPress={() => setCurrency('€')}>
                  <Text style={[s.currText, currency === '€' && s.currTextActive]}>€</Text>
                </Pressable>
              </View>
            </View>
          </Field>

          <Field label="Category">
            <View style={s.inputWrap}>
              <TextInput
                placeholder="Text"
                placeholderTextColor={C.hint}
                value={category}
                onChangeText={setCategory}
                style={s.input}
              />
              {!!category && (
                <Pressable style={s.clearBtn} onPress={() => setCategory('')}>
                  <Text style={s.clearCross}>×</Text>
                </Pressable>
              )}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 8 }}>
              {categories.map(cat => {
                const active = cat === category;
                return (
                  <Pressable
                    key={cat}
                    onPress={() => setCategory(cat)}
                    style={[s.chip, { backgroundColor: C.chipBg }, active && { borderColor: C.primary, backgroundColor: C.chipActiveBg }]}
                  >
                    <Text style={{ fontWeight: '600', color: active ? C.primary : '#6B6B6B' }}>{cat}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Field>

          <Field label="Photo">
            {photoUri ? (
              <View style={s.photoPreviewWrap}>
                <Image source={{ uri: photoUri }} style={s.photoPreview} />
                <Pressable onPress={() => setPhotoUri(undefined)} style={s.removeBadge} hitSlop={10}>
                  <Text style={{ color: '#fff', fontWeight: '800' }}>×</Text>
                </Pressable>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                <Pressable onPress={onPickImage} style={s.photoBtn}>
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 18 }}>＋</Text>
                </Pressable>
              </View>
            )}
          </Field>

          <Field label="Date">
            <View style={s.pickerRow}>
              <Pressable style={[s.pickerBtn, { flex: 1 }]} onPress={openDatePicker}>
                <Text style={[s.pickerText, !dateISO && { color: C.hint }]}>{fmtDate(dateISO)}</Text>
              </Pressable>
              {!!dateISO && (
                <Pressable style={s.pickerClear} onPress={() => setDateISO(undefined)}>
                  <Text style={s.clearCross}>×</Text>
                </Pressable>
              )}
            </View>

            {Platform.OS === 'ios' && activeIOSPicker === 'date' && (
              <View style={s.iosPickerHolder}>
                <DateTimePicker
                  value={dateISO ? new Date(dateISO) : new Date()}
                  mode="date"
                  display="inline"
                  onChange={(e: DateTimePickerEvent, d?: Date) => handlePick('date', e, d)}
                  style={s.iosPicker}
                />
              </View>
            )}
          </Field>

          <View style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={s.label}>Start</Text>
                <View style={s.pickerRow}>
                  <Pressable style={[s.pickerBtn, { flex: 1 }]} onPress={openStartTimePicker}>
                    <Text style={[s.pickerText, !startISO && { color: C.hint }]}>{fmtTime(startISO)}</Text>
                  </Pressable>
                  {!!startISO && (
                    <Pressable style={s.pickerClear} onPress={() => setStartISO(undefined)}>
                      <Text style={s.clearCross}>×</Text>
                    </Pressable>
                  )}
                </View>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={s.label}>Finish</Text>
                <View style={s.pickerRow}>
                  <Pressable style={[s.pickerBtn, { flex: 1 }]} onPress={openEndTimePicker}>
                    <Text style={[s.pickerText, !endISO && { color: C.hint }]}>{fmtTime(endISO)}</Text>
                  </Pressable>
                  {!!endISO && (
                    <Pressable style={s.pickerClear} onPress={() => setEndISO(undefined)}>
                      <Text style={s.clearCross}>×</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            </View>

            {Platform.OS === 'ios' && (activeIOSPicker === 'start' || activeIOSPicker === 'end') && (
              <View style={s.iosPickerHolder}>
                <DateTimePicker
                  value={
                    activeIOSPicker === 'start'
                      ? (startISO ? new Date(startISO) : new Date())
                      : (endISO ? new Date(endISO) : new Date())
                  }
                  mode="time"
                  display="spinner"
                  onChange={(e: DateTimePickerEvent, d?: Date) =>
                    handlePick(activeIOSPicker, e, d)
                  }
                  style={s.iosPicker}
                />
              </View>
            )}
          </View>

          <Pressable
            style={[s.saveBtn, !canSave && { opacity: 0.5 }]}
            disabled={!canSave}
            onPress={onSave}
          >
            <Text style={s.saveText}>Save</Text>
          </Pressable>

          <View style={{ height: blockerH, backgroundColor: '#fff' }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: blockerH,
          backgroundColor: '#fff',
        }}
      />
    </SafeAreaView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={s.label}>{label}</Text>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    paddingHorizontal: 16, paddingTop: 6, paddingBottom: 12, flexDirection: 'row', alignItems: 'center',
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 22, fontWeight: '700' },

  label: { fontSize: 14, fontWeight: '700', marginBottom: 8, color: C.text },

  inputWrap: { position: 'relative' },
  input: {
    borderWidth: 1, borderColor: C.stroke, borderRadius: 12, paddingHorizontal: 12, height: 44, fontSize: 16, color: C.text,
  },
  clearBtn: {
    position: 'absolute', right: 10, top: 10, width: 24, height: 24, borderRadius: 12, backgroundColor: '#EFEFEF',
    alignItems: 'center', justifyContent: 'center',
  },
  clearCross: { fontSize: 16, lineHeight: 16, color: '#6B6B6B' },

  masterCard: { width: 220, borderWidth: 1, borderColor: C.stroke, borderRadius: 16, backgroundColor: '#fff', overflow: 'hidden' },
  masterCardSelected: { borderColor: C.primary },
  masterPhoto: { height: 110, margin: 12, borderRadius: 12, overflow: 'hidden' },
  masterPhotoImg: { width: '100%', height: '100%', borderRadius: 12 },
  mName: { fontSize: 16, fontWeight: '700', color: C.text },
  mFrom: { marginTop: 2, fontSize: 12, color: C.muted },
  mRole: { marginTop: 2, fontSize: 13, color: C.text },

  mFooter: {
    marginTop: 10, paddingHorizontal: 12, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  shareBtn: { paddingHorizontal: 14, height: 32, borderRadius: 16, borderWidth: 1, borderColor: C.stroke, justifyContent: 'center' },
  shareText: { color: '#6D6D6D', fontWeight: '600' },
  radio: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: C.stroke, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: C.primary, backgroundColor: 'rgba(219,4,63,0.10)' },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: C.primary },

  currBtn: {
    width: 44, height: 44, borderRadius: 12, borderWidth: 1, borderColor: C.stroke, alignItems: 'center', justifyContent: 'center',
  },
  currActive: { borderColor: C.primary, backgroundColor: C.chipActiveBg },
  currText: { fontSize: 16, color: '#6B6B6B' },
  currTextActive: { color: C.primary, fontWeight: '700' },

  chip: { paddingHorizontal: 12, height: 28, borderRadius: 14, borderWidth: 1, borderColor: C.stroke, alignItems: 'center', justifyContent: 'center' },

  photoBtn: { width: 64, height: 36, borderRadius: 18, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  photoPreviewWrap: { width: 120, height: 120, borderRadius: 16, overflow: 'hidden' },
  photoPreview: { width: '100%', height: '100%' },
  removeBadge: {
    position: 'absolute', top: -8, right: -8, width: 28, height: 28, borderRadius: 14, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center',
  },

  pickerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pickerBtn: { height: 44, borderRadius: 12, borderWidth: 1, borderColor: C.stroke, paddingHorizontal: 12, justifyContent: 'center' },
  pickerText: { fontSize: 16, color: C.text },
  pickerClear: { marginLeft: 8, width: 32, height: 32, borderRadius: 16, backgroundColor: '#EFEFEF', alignItems: 'center', justifyContent: 'center' },

  iosPickerHolder: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: C.stroke,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#FFF',
  },
  iosPicker: { width: '100%', alignSelf: 'stretch' },

  saveBtn: { height: 56, borderRadius: 28, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  saveText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});