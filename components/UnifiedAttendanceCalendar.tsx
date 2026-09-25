import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Chip } from '@/components/ui/Chip';
import { SvgIcon } from '@/components/ui/SvgIcon';
import { Colors } from '@/constants/theme';
import { buildMonthGrid, todayStr, type AttendanceSession } from '@/lib/attendance';
import { DAY_SHORT_NAMES, MONTH_NAMES } from '@/lib/constants';
import { formatTime12h } from '@/lib/routine';
import type { AttendanceStatus } from '@/lib/types';
import type { DaySession } from '@/hooks/useAllCoursesAttendance';

const STATUS_COLORS: Record<'present' | 'absent' | 'cancelled' | 'needsAction' | 'future', string> = {
  present: '#16a34a',
  absent: '#dc2626',
  cancelled: '#9ca3af',
  needsAction: '#f59e0b',
  future: '#d1d5db',
};

const STATUS_OPTIONS: { label: string; value: AttendanceStatus }[] = [
  { label: 'Present', value: 'present' },
  { label: 'Absent', value: 'absent' },
  { label: 'Cancelled', value: 'cancelled' },
];

function dayCellStatus(sessions: AttendanceSession[]): keyof typeof STATUS_COLORS | null {
  if (sessions.length === 0) return null;
  if (sessions[0].isFuture) return 'future';
  if (sessions.some((s) => s.status === 'unmarked')) return 'needsAction';
  if (sessions.some((s) => s.status === 'absent')) return 'absent';
  if (sessions.some((s) => s.status === 'present')) return 'present';
  return 'cancelled';
}

export function UnifiedAttendanceCalendar({
  sessionsByDate,
  bounds,
  onMark,
}: {
  sessionsByDate: Map<string, DaySession[]>;
  bounds: { start: string; end: string } | null;
  onMark: (courseId: string, date: string, slotId: string, status: AttendanceStatus) => void;
}) {
  const today = todayStr();

  const initial = today.slice(0, 7);
  const [viewMonth, setViewMonth] = useState(() => {
    const clampedStart = bounds?.start.slice(0, 7);
    const clampedEnd = bounds?.end.slice(0, 7);
    if (clampedStart && initial < clampedStart) return clampedStart;
    if (clampedEnd && initial > clampedEnd) return clampedEnd;
    return initial;
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    const clampedStart = bounds?.start.slice(0, 7);
    const clampedEnd = bounds?.end.slice(0, 7);
    if (clampedStart && viewMonth < clampedStart) setViewMonth(clampedStart);
    else if (clampedEnd && viewMonth > clampedEnd) setViewMonth(clampedEnd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bounds?.start, bounds?.end]);

  const [year, month] = viewMonth.split('-').map(Number);
  const grid = useMemo(() => buildMonthGrid(year, month - 1), [year, month]);

  const canGoPrev = !bounds || `${viewMonth}-01` > bounds.start;
  const canGoNext = !bounds || `${viewMonth}-01` < bounds.end;

  const changeMonth = (delta: number) => {
    const d = new Date(year, month - 1 + delta, 1);
    setViewMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const selectedSessions = selectedDate ? sessionsByDate.get(selectedDate) ?? [] : [];

  return (
    <View style={styles.card}>
      <View style={styles.monthHeader}>
        <Pressable onPress={() => canGoPrev && changeMonth(-1)} hitSlop={8} disabled={!canGoPrev}>
          <SvgIcon name="arrowLeft" size={18} color={canGoPrev ? Colors.text : Colors.icon} />
        </Pressable>
        <ThemedText type="defaultSemiBold">{MONTH_NAMES[month - 1]} {year}</ThemedText>
        <Pressable onPress={() => canGoNext && changeMonth(1)} hitSlop={8} disabled={!canGoNext}>
          <View style={{ transform: [{ rotate: '180deg' }] }}>
            <SvgIcon name="arrowLeft" size={18} color={canGoNext ? Colors.text : Colors.icon} />
          </View>
        </Pressable>
      </View>

      <View style={styles.weekRow}>
        {DAY_SHORT_NAMES.map((d) => (
          <ThemedText key={d} style={styles.weekLabel}>{d}</ThemedText>
        ))}
      </View>

      <View style={styles.grid}>
        {grid.map((date, i) => {
          if (!date) return <View key={i} style={styles.cell} />;
          const daySessions = (sessionsByDate.get(date) ?? []).map((d) => d.session);
          const status = dayCellStatus(daySessions);
          const isToday = date === today;
          const dayNum = Number(date.slice(8, 10));

          return (
            <Pressable
              key={i}
              style={[styles.cell, isToday && styles.cellToday]}
              disabled={daySessions.length === 0}
              onPress={() => setSelectedDate(date)}>
              <ThemedText style={styles.cellText}>{dayNum}</ThemedText>
              {status && <View style={[styles.dot, { backgroundColor: STATUS_COLORS[status] }]} />}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.legend}>
        {(['present', 'absent', 'cancelled', 'needsAction', 'future'] as const).map((key) => (
          <View key={key} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: STATUS_COLORS[key] }]} />
            <ThemedText style={styles.legendLabel}>
              {key === 'needsAction' ? 'Needs marking' : key[0].toUpperCase() + key.slice(1)}
            </ThemedText>
          </View>
        ))}
      </View>

      <Modal visible={!!selectedDate} transparent animationType="fade" onRequestClose={() => setSelectedDate(null)}>
        <Pressable style={styles.modalOverlay} onPress={() => setSelectedDate(null)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <ThemedText type="subtitle" style={styles.modalTitle}>{selectedDate}</ThemedText>
            {selectedSessions.map((d) => (
              <View key={`${d.courseId}_${d.session.slotId}`} style={styles.sessionRow}>
                <ThemedText type="defaultSemiBold">{d.courseCode}</ThemedText>
                <ThemedText style={styles.meta}>
                  {formatTime12h(d.session.startTime)} – {formatTime12h(d.session.endTime)}
                </ThemedText>
                <View style={styles.chips}>
                  {STATUS_OPTIONS.map((opt) => (
                    <Chip
                      key={opt.value}
                      label={opt.label}
                      selected={d.session.status === opt.value}
                      onPress={() => onMark(d.courseId, d.session.date, d.session.slotId, opt.value)}
                    />
                  ))}
                </View>
              </View>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  weekLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    opacity: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  cellToday: {
    borderWidth: 1,
    borderColor: Colors.tint,
    borderRadius: 8,
  },
  cellText: {
    fontSize: 13,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendLabel: {
    fontSize: 11,
    opacity: 0.6,
  },
  meta: {
    opacity: 0.6,
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    gap: 12,
  },
  modalTitle: {
    marginBottom: 4,
  },
  sessionRow: {
    gap: 6,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
