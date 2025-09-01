import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Switch,
  Dimensions,
  Alert,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Stagger from '../components/Stagger';

type Priority = 'red' | 'orange' | 'yellow';
type EventItem = {
  id: string;
  title: string;
  description?: string;
  dateKey: string;    
  notify: boolean;
  priority: Priority;
};

const C = {
  primary: '#DB043F',
  stroke: '#EDEDED',
  text: '#1E1E1E',
  muted: '#8D8D8D',
  bg: '#FFFFFF',
  chipBg: 'rgba(219,4,63,0.08)',
  dot: { red: '#DB043F', orange: '#F39C12', yellow: '#F1C40F' } as Record<Priority, string>,
};

const TAB_BAR_H = 100;

function pad(n: number) { return String(n).padStart(2, '0'); }
function ymd(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function monthLabel(d: Date) {
  return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}
function dayLabel(d: Date) {
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'long' });
}
function monthMatrix(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startOffset = first.getDay(); 
  const firstCell = new Date(year, month, 1 - startOffset);
  const weeks: Date[][] = [];
  for (let w = 0; w < 6; w++) {
    const row: Date[] = [];
    for (let d = 0; d < 7; d++) {
      row.push(new Date(firstCell.getFullYear(), firstCell.getMonth(), firstCell.getDate() + (w * 7 + d)));
    }
    weeks.push(row);
  }
  return weeks;
}

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'android' ? insets.top + 30 : 0;

  const { width } = useWindowDimensions();
  const BASE_W = 375;
  const SCALE = Math.min(width / BASE_W, 1);
  const s = (n: number) => Math.round(n * SCALE);
  const isSmall = width <= 360;

  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date(); return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDay, setSelectedDay] = useState<Date>(() => new Date());
  const [events, setEvents] = useState<EventItem[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [notify, setNotify] = useState(true);
  const [priority, setPriority] = useState<Priority>('red');

  const selectedKey = ymd(selectedDay);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, EventItem[]>();
    for (const e of events) {
      if (!map.has(e.dateKey)) map.set(e.dateKey, []);
      map.get(e.dateKey)!.push(e);
    }
    return map;
  }, [events]);

  const dayEvents = useMemo(() => {
    const arr = eventsByDay.get(selectedKey) ?? [];
    const order: Priority[] = ['red', 'orange', 'yellow'];
    return [...arr].sort(
      (a, b) => Number(b.notify) - Number(a.notify) || order.indexOf(a.priority) - order.indexOf(b.priority)
    );
  }, [eventsByDay, selectedKey]);

  const matrix = useMemo(
    () => monthMatrix(currentMonth.getFullYear(), currentMonth.getMonth()),
    [currentMonth]
  );

  const openForCreate = () => {
    setEditingId(null);
    setTitle('');
    setDesc('');
    setNotify(true);
    setPriority('red');
    setSheetOpen(true);
  };

  const openForEdit = (e: EventItem) => {
    setEditingId(e.id);
    setTitle(e.title);
    setDesc(e.description ?? '');
    setNotify(e.notify);
    setPriority(e.priority);
    setSheetOpen(true);
  };

  const saveEvent = () => {
    if (!title.trim()) return;
    if (editingId) {
      setEvents(prev =>
        prev.map(e => (e.id === editingId ? { ...e, title: title.trim(), description: desc.trim(), notify, priority } : e))
      );
    } else {
      const id = Math.random().toString(36).slice(2, 10);
      setEvents(prev => [
        ...prev,
        { id, title: title.trim(), description: desc.trim(), dateKey: selectedKey, notify, priority },
      ]);
    }
    setSheetOpen(false);
  };

  const toggleNotify = (id: string) => {
    setEvents(prev => prev.map(e => (e.id === id ? { ...e, notify: !e.notify } : e)));
  };
  const removeEvent = (id: string) => {
    Alert.alert('Delete event', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setEvents(prev => prev.filter(e => e.id !== id)) },
    ]);
  };

  const blockerH = TAB_BAR_H + insets.bottom;
  const contentBottomPad = blockerH + (sheetOpen ? s(320) : 0);

  const W = Dimensions.get('window').width;
  const cell = Math.floor((W - s(32) - 6 * 6) / 7);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <Stagger index={0} from="bottom" replayOnFocus>
        <View style={[styles.header, { paddingTop: 6 + topPad }]}>
          <Text style={[styles.headerTitle, { fontSize: s(22) }]}>Calendar events</Text>
        </View>
      </Stagger>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: contentBottomPad }}
        showsVerticalScrollIndicator={false}
        scrollIndicatorInsets={{ top: topPad, bottom: blockerH }}
      >
        <Stagger index={1} from="bottom" replayOnFocus>
          <View style={[styles.card, { padding: s(12), borderRadius: s(16) }]}>
            <View style={styles.monthRow}>
              <Text style={[styles.monthText, { fontSize: s(16) }]}>
                {monthLabel(currentMonth).replace(/^./, c => c.toUpperCase())}
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Pressable
                  style={[styles.navBtn, { width: s(28), height: s(28), borderRadius: s(14) }]}
                  onPress={() => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
                ><Text style={[styles.navTxt, { fontSize: s(16) }]}>‹</Text></Pressable>
                <Pressable
                  style={[styles.navBtn, { width: s(28), height: s(28), borderRadius: s(14) }]}
                  onPress={() => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
                ><Text style={[styles.navTxt, { fontSize: s(16) }]}>›</Text></Pressable>
              </View>
            </View>

            <View style={[styles.weekRow, { paddingBottom: 6, paddingHorizontal: 2 }]}>
              {['SUN','MON','TUE','WED','THU','FRI','SAT'].map((w) => (
                <Text key={w} style={[styles.weekTxt, { fontSize: s(10), width: s(32) }]}>{w}</Text>
              ))}
            </View>

            <View style={{ gap: 6 }}>
              {matrix.map((row, ri) => (
                <View key={ri} style={{ flexDirection: 'row', gap: 6, justifyContent: 'space-between' }}>
                  {row.map((d, di) => {
                    const inMonth = d.getMonth() === currentMonth.getMonth();
                    const isSelected = ymd(d) === selectedKey;
                    const hasEvents = (eventsByDay.get(ymd(d)) ?? []).length > 0;
                    const dotColor = (() => {
                      const list = eventsByDay.get(ymd(d)) ?? [];
                      if (!list.length) return undefined;
                      if (list.some(e => e.priority === 'red')) return C.dot.red;
                      if (list.some(e => e.priority === 'orange')) return C.dot.orange;
                      return C.dot.yellow;
                    })();

                    return (
                      <Pressable
                        key={di}
                        onPress={() => {
                          setSelectedDay(d);
                          setCurrentMonth(new Date(d.getFullYear(), d.getMonth(), 1));
                        }}
                        style={[
                          styles.dayCell,
                          { width: cell, height: cell, borderRadius: isSelected ? cell / 2 : s(12) },
                          isSelected && { backgroundColor: C.primary },
                        ]}
                      >
                        <Text
                          style={[
                            styles.dayTxt,
                            { fontSize: s(15) },
                            !inMonth && { color: '#C7C7C7' },
                            isSelected && { color: '#fff', fontWeight: '700' },
                          ]}
                        >
                          {d.getDate()}
                        </Text>
                        {hasEvents && <View style={[styles.dot, { width: s(6), height: s(6), borderRadius: s(3), backgroundColor: dotColor }]} />}
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </View>
          </View>
        </Stagger>

        <Stagger index={2} from="bottom" replayOnFocus>
          <View style={[styles.dayHeader, { marginTop: s(12) }]}>
            <Text style={[styles.dayHeaderText, { fontSize: s(18) }]} numberOfLines={1}>
              {dayLabel(selectedDay)}
            </Text>
            <Pressable style={[styles.plusBtn, { height: s(32), paddingHorizontal: s(14), borderRadius: s(16) }]} onPress={openForCreate}>
              <Text style={[styles.plusTxt, { fontSize: s(18) }]}>＋</Text>
            </Pressable>
          </View>
        </Stagger>
        
        {dayEvents.length === 0 ? (
          <Stagger index={3} from="bottom" replayOnFocus>
            <View style={[styles.empty, { paddingTop: s(36), paddingHorizontal: 32 }]}>
              <Text style={{ fontSize: s(52), color: '#E6833B' }}>⌀</Text>
              <Text style={[styles.emptyTxt, { fontSize: isSmall ? 14 : 15 }]}>
                There aren’t any events on this day, please add something
              </Text>
            </View>
          </Stagger>
        ) : (
          <View style={{ gap: 12 }}>
            {dayEvents.map((ev, idx) => (
              <Stagger key={ev.id} index={idx + 3} from="bottom" replayOnFocus>
                <View style={styles.eventRow}>
                  <View style={[styles.eventLeft, { width: s(110), height: s(58), borderTopLeftRadius: s(16), borderBottomLeftRadius: s(16) }]}>
                    <Text style={[styles.eventLeftTxt, { fontSize: s(12) }]}>
                      {selectedDay.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </Text>
                  </View>

                  <View style={{ flex: 1, paddingHorizontal: 12 }}>
                    <Text style={[styles.eventTitle, { fontSize: isSmall ? 14 : 15 }]} numberOfLines={1}>{ev.title}</Text>
                    {!!ev.description && <Text style={[styles.eventDesc, { fontSize: isSmall ? 11 : 12 }]} numberOfLines={1}>{ev.description}</Text>}
                  </View>

                  <View style={{ alignItems: 'center', gap: 10, paddingRight: 8 }}>
                    <Switch
                      value={ev.notify}
                      onValueChange={() => toggleNotify(ev.id)}
                      trackColor={{ false: '#D7D7D7', true: '#B7F4C3' }}
                      thumbColor={ev.notify ? '#2ECC71' : '#FFFFFF'}
                    />
                    <View style={[styles.priorityDot, { width: s(10), height: s(10), borderRadius: s(5), backgroundColor: C.dot[ev.priority] }]} />
                  </View>

                  <View style={styles.eventActions}>
                    <Pressable style={[styles.iconBtn, { width: s(46), height: s(58), backgroundColor: '#FFF4F7', borderTopRightRadius: 0, borderBottomRightRadius: 0 }]} onPress={() => openForEdit(ev)}>
                      <Text style={[styles.iconTxt, { color: C.primary, fontSize: s(16) }]}>✎</Text>
                    </Pressable>
                    <Pressable style={[styles.iconBtn, { width: s(46), height: s(58), backgroundColor: C.primary, borderTopRightRadius: s(16), borderBottomRightRadius: s(16) }]} onPress={() => removeEvent(ev.id)}>
                      <Text style={[styles.iconTxt, { color: '#fff', fontSize: s(16) }]}>🗑</Text>
                    </Pressable>
                  </View>
                </View>
              </Stagger>
            ))}
          </View>
        )}
      </ScrollView>

      {sheetOpen && (
        <Stagger index={999} from="bottom" replayOnFocus>
          <View style={[styles.sheet, { paddingBottom: 24 + TAB_BAR_H + insets.bottom }]}>
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { fontSize: s(16) }]}>{editingId ? 'Edit event' : 'Add new event'}</Text>
              <Pressable onPress={() => setSheetOpen(false)} hitSlop={10}>
                <Text style={{ fontSize: s(18), color: '#9B9B9B' }}>✕</Text>
              </Pressable>
            </View>

            <Text style={[styles.label, { fontSize: s(12) }]}>Name of event</Text>
            <View style={styles.inputWrap}>
              <TextInput
                placeholder="Text"
                placeholderTextColor="#A2A2A2"
                value={title}
                onChangeText={setTitle}
                style={[styles.input, { height: s(44), fontSize: s(16) }]}
              />
            </View>

            <Text style={[styles.label, { marginTop: 12, fontSize: s(12) }]}>Description</Text>
            <View style={styles.inputWrap}>
              <TextInput
                placeholder="Text"
                placeholderTextColor="#A2A2A2"
                value={desc}
                onChangeText={setDesc}
                style={[styles.input, { height: s(44), fontSize: s(16) }]}
              />
            </View>

            <View style={styles.row}>
              <Text style={[styles.label, { marginTop: 0, fontSize: s(12) }]}>Notification</Text>
              <Switch
                value={notify}
                onValueChange={setNotify}
                trackColor={{ false: '#D7D7D7', true: '#B7F4C3' }}
                thumbColor={notify ? '#2ECC71' : '#FFFFFF'}
              />
            </View>

            <Text style={[styles.label, { marginTop: 12, fontSize: s(12) }]}>Priority</Text>
            <View style={{ flexDirection: 'row', gap: 14, paddingVertical: 6 }}>
              {(['red','orange','yellow'] as Priority[]).map(p => (
                <Pressable key={p} onPress={() => setPriority(p)} style={styles.priBtn}>
                  <View style={[
                    styles.priDot,
                    { width: s(14), height: s(14), borderRadius: s(7), backgroundColor: C.dot[p], opacity: priority === p ? 1 : 0.5 }
                  ]} />
                </Pressable>
              ))}
            </View>

            <Pressable
              style={[styles.saveBtn, !title.trim() && { opacity: 0.5 }]}
              disabled={!title.trim()}
              onPress={saveEvent}
            >
              <Text style={[styles.saveTxt, { fontSize: s(16) }]}>Save</Text>
            </Pressable>
          </View>
        </Stagger>
      )}

      <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: blockerH, backgroundColor: '#fff' }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 8 },
  headerTitle: { fontWeight: '800', color: C.text },

  card: {
    borderWidth: 1, borderColor: C.stroke, backgroundColor: C.bg,
  },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 8 },
  monthText: { fontWeight: '700', color: C.text },
  navBtn: { borderWidth: 1, borderColor: C.stroke, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAFAFA' },
  navTxt: { color: C.text },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between' },
  weekTxt: { textAlign: 'center', color: C.muted, letterSpacing: 0.4 },

  dayCell: { alignItems: 'center', justifyContent: 'center', paddingVertical: 6 },
  dayTxt: { color: C.text },
  dot: { marginTop: 2 },

  dayHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dayHeaderText: { fontWeight: '800', color: C.text },
  plusBtn: { backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  plusTxt: { color: '#fff', fontWeight: '700' },

  empty: { alignItems: 'center', gap: 10 },
  emptyTxt: { textAlign: 'center', color: '#666' },

  eventRow: {
    borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: C.stroke,
    flexDirection: 'row', alignItems: 'center', overflow: 'hidden',
  },
  eventLeft: { backgroundColor: '#F7F7F7', alignItems: 'center', justifyContent: 'center' },
  eventLeftTxt: { color: '#8A8A8A', fontWeight: '700' },
  eventTitle: { fontWeight: '700', color: C.text },
  eventDesc: { color: C.muted, marginTop: 2 },
  priorityDot: {},

  eventActions: { height: '100%', flexDirection: 'row' },
  iconBtn: { alignItems: 'center', justifyContent: 'center', borderLeftWidth: 1, borderLeftColor: C.stroke },
  iconTxt: { fontWeight: '700' },

  sheet: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 18, borderTopRightRadius: 18,
    paddingHorizontal: 16, paddingTop: 12,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: -6 }, elevation: 12,
  },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  sheetTitle: { fontWeight: '800', color: C.text },

  label: { fontWeight: '700', color: C.text, marginBottom: 6 },
  inputWrap: { borderWidth: 1, borderColor: C.stroke, borderRadius: 12 },
  input: { paddingHorizontal: 12, color: C.text },

  row: { marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  priBtn: { width: 26, height: 26, borderRadius: 13, borderWidth: 1, borderColor: '#E6E6E6', alignItems: 'center', justifyContent: 'center' },
  priDot: {},

  saveBtn: { marginTop: 14, height: 50, borderRadius: 25, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  saveTxt: { color: '#fff', fontWeight: '800' },
});