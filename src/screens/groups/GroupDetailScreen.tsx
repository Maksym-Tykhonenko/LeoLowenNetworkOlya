import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, Image, Pressable, ScrollView, Share, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useGroups } from '../../store/groups';
import { useMasters } from '../../store/masters';
import type { GroupsStackParamList } from '../../navigation/types';

const C = { primary: '#DB043F', stroke: '#E6E6E6', text: '#1E1E1E', muted: '#8D8D8D' };

type Props = NativeStackScreenProps<GroupsStackParamList, 'GroupDetail'>;

export default function GroupDetailScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'android' ? insets.top + 30 : 0;
  
  const { id } = route.params;
  const { getById, archiveGroup } = useGroups();
  const { masters } = useMasters();
  const group = getById(id);

  if (!group) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Group not found</Text>
      </SafeAreaView>
    );
  }

  const members = masters.filter(m => group.masterIds.includes(m.id));
  const onShare = async (name: string) => { try { await Share.share({ message: name }); } catch {} };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={[s.header, { paddingTop: 6 + topPad }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}><Text style={{ fontSize: 16 }}>{'‹ Back'}</Text></Pressable>
        <Text style={s.headerTitle}>{group.title}</Text>
        <View style={{ width: 56 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        <View style={s.cover}>
          {group.coverUri ? <Image source={{ uri: group.coverUri }} style={{ width: '100%', height: '100%' }} />
            : <View style={{ flex: 1, backgroundColor: '#F6ECEE', borderRadius: 16 }} />}
        </View>

        {!!group.description && (
          <>
            <Text style={[s.label, { marginTop: 12 }]}>Description</Text>
            <Text style={s.desc}>{group.description}</Text>
          </>
        )}

        <Text style={[s.label, { marginTop: 12 }]}>Masters in this group</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {members.map(m => (
            <View key={m.id} style={s.mCard}>
              <View style={s.mPhoto}>
                {m.photoUri ? <Image source={{ uri: m.photoUri }} style={s.mPhotoImg} /> : <View style={[s.mPhoto, { backgroundColor: '#F2F2F2' }]} />}
              </View>
              <View style={{ paddingHorizontal: 10 }}>
                <Text style={s.mName} numberOfLines={1}>{m.name}</Text>
                <Text style={s.mFrom}>{`from ${m.price}${m.currency}/h`}</Text>
              </View>
              <View style={s.mFooter}>
                <Pressable style={s.shareBtn} onPress={() => onShare(m.name)}>
                  <Text style={s.shareText}>Share</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={s.bottom}>
        <Pressable style={s.archiveBtn} onPress={() => { archiveGroup(group.id, !group.isArchived); navigation.goBack(); }}>
          <Text style={[s.btnText, { color: C.primary }]}>Archive</Text>
        </Pressable>
        <Pressable style={s.editBtn} onPress={() => navigation.navigate('EditGroup', { id: group.id })}>
          <Text style={[s.btnText, { color: '#fff' }]}>Edit</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 12, flexDirection: 'row', alignItems: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 22, fontWeight: '800' },

  label: { fontSize: 13, fontWeight: '700', color: C.text },
  desc: { fontSize: 14, color: C.text, marginTop: 4 },

  cover: { height: 160, borderRadius: 16, overflow: 'hidden', backgroundColor: '#F6ECEE' },

  mCard: { width: 160, borderWidth: 1, borderColor: C.stroke, borderRadius: 16, backgroundColor: '#fff', overflow: 'hidden' },
  mPhoto: { height: 90, margin: 10, borderRadius: 12, overflow: 'hidden' },
  mPhotoImg: { width: '100%', height: '100%' },
  mName: { fontSize: 15, fontWeight: '700', color: C.text },
  mFrom: { marginTop: 2, fontSize: 12, color: C.muted },
  mFooter: { marginTop: 8, paddingHorizontal: 10, paddingBottom: 10 },
  shareBtn: { paddingHorizontal: 14, height: 32, borderRadius: 16, borderWidth: 1, borderColor: C.stroke, justifyContent: 'center' },
  shareText: { color: '#6D6D6D', fontWeight: '600' },

  bottom: { position: 'absolute', left: 16, right: 16, bottom: 24 + 100, flexDirection: 'row', gap: 16 },
  archiveBtn: { flex: 1, height: 56, borderRadius: 28, borderWidth: 1, borderColor: C.primary, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFE9EF' },
  editBtn: { flex: 1, height: 56, borderRadius: 28, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontSize: 18, fontWeight: '700' },
});