import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Chip } from '@/components/ui/Chip';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Wrapper } from '@/components/ui/Wrapper';
import { PageHeader } from '@/components/ui/PageHeader';
import { UnifiedAttendanceCalendar } from '@/components/UnifiedAttendanceCalendar';
import { useAllCoursesAttendance, useMarkAttendance, type DaySession } from '@/hooks/useAllCoursesAttendance';
import { addDays, todayStr } from '@/lib/attendance';
import { formatTime12h } from '@/lib/routine';
import { parseTime } from '@/lib/validate';

export default function AttendanceScreen() {
  const { courseAttendance, sessionsByDate, overall, isLoading } = useAllCoursesAttendance();
  const markAttendance = useMarkAttendance();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const today = todayStr();

  const filteredSessionsByDate = useMemo(() => {
    if (!selectedCourseId) return sessionsByDate;
    const filtered = new Map<string, DaySession[]>();
    sessionsByDate.forEach((entries, date) => {
      const match = entries.filter((e) => e.courseId === selectedCourseId);
      if (match.length > 0) filtered.set(date, match);
    });
    return filtered;
  }, [sessionsByDate, selectedCourseId]);

  const bounds = useMemo(() => {
    const relevant = selectedCourseId
      ? courseAttendance.filter((c) => c.course.id === selectedCourseId)
      : courseAttendance;
    const starts = relevant.map((c) => c.sessions[0]?.date).filter(Boolean) as string[];
    const ends = relevant.map((c) => c.sessions[c.sessions.length - 1]?.date).filter(Boolean) as string[];
    if (starts.length === 0 || ends.length === 0) return null;
    return {
      start: starts.reduce((a, b) => (a < b ? a : b)),
      end: ends.reduce((a, b) => (a > b ? a : b)),
    };
  }, [courseAttendance, selectedCourseId]);

  const pendingToday = useMemo(() => {
    const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
    return (sessionsByDate.get(today) ?? []).filter(
      (d) => d.session.status === 'unmarked' && parseTime(d.session.endTime) <= nowMinutes,
    );
  }, [sessionsByDate, today]);

  const sortedCourses = useMemo(
    () => [...courseAttendance].sort((a, b) => a.stats.percent - b.stats.percent),
    [courseAttendance],
  );

  return (
    <Wrapper style={styles.safe}>
      <PageHeader title="Attendance" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading && <ThemedText style={styles.meta}>Loading attendance…</ThemedText>}

        <View style={styles.overviewCard}>
          <View style={styles.overviewRow}>
            <ThemedText type="subtitle">Overall</ThemedText>
            <ThemedText style={styles.overviewPercent}>{overall.percent}%</ThemedText>
          </View>
          <ProgressBar percent={overall.percent} color={overall.percent < 50 ? '#dc2626' : undefined} />
          {overall.atRiskCount > 0 && (
            <ThemedText style={styles.atRiskText}>
              {overall.atRiskCount} course{overall.atRiskCount > 1 ? 's' : ''} below exam eligibility.
            </ThemedText>
          )}
        </View>

        {pendingToday.length > 0 && (
          <View style={styles.pendingCard}>
            <ThemedText type="subtitle" style={styles.pendingTitle}>Mark today's attendance</ThemedText>
            {pendingToday.map((d) => (
              <View key={`${d.courseId}_${d.session.slotId}`} style={styles.pendingRow}>
                <View style={styles.pendingInfo}>
                  <ThemedText type="defaultSemiBold">{d.courseCode}</ThemedText>
                  <ThemedText style={styles.meta}>
                    {formatTime12h(d.session.startTime)} – {formatTime12h(d.session.endTime)}
                  </ThemedText>
                </View>
                <View style={styles.pendingChips}>
                  {(['present', 'absent', 'cancelled'] as const).map((status) => (
                    <Chip
                      key={status}
                      label={status === 'present' ? 'Present' : status === 'absent' ? 'Absent' : 'Cancelled'}
                      selected={false}
                      onPress={() => markAttendance.mutate({ courseId: d.courseId, date: d.session.date, slotId: d.session.slotId, status })}
                    />
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {courseAttendance.length === 0 ? (
          <ThemedText style={styles.meta}>Add a course and its routine to start tracking attendance.</ThemedText>
        ) : (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
              <Chip label="All" selected={!selectedCourseId} onPress={() => setSelectedCourseId(null)} />
              {courseAttendance.map(({ course }) => (
                <Chip
                  key={course.id}
                  label={course.code}
                  selected={selectedCourseId === course.id}
                  onPress={() => setSelectedCourseId(course.id)}
                />
              ))}
            </ScrollView>

            <UnifiedAttendanceCalendar
              sessionsByDate={filteredSessionsByDate}
              bounds={bounds}
              onMark={(courseId, date, slotId, status) => markAttendance.mutate({ courseId, date, slotId, status })}
            />

            <ThemedText type="subtitle" style={styles.breakdownTitle}>By course</ThemedText>
            {sortedCourses.map(({ course, stats }) => (
              <View key={course.id} style={styles.courseRow}>
                <View style={styles.courseRowTop}>
                  <ThemedText type="defaultSemiBold">{course.code}</ThemedText>
                  <ThemedText style={[styles.coursePercent, !stats.eligible && stats.held > 0 && styles.coursePercentAtRisk]}>
                    {stats.held > 0 ? `${stats.percent}%` : 'No data'}
                  </ThemedText>
                </View>
                <ProgressBar percent={stats.percent} color={!stats.eligible && stats.held > 0 ? '#dc2626' : undefined} />
                <ThemedText style={styles.meta}>mark {stats.mark}/10 · {stats.present} present · {stats.absent} absent</ThemedText>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    paddingVertical: 20,
  },
  overviewCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    gap: 8,
  },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  overviewPercent: {
    fontSize: 15,
    fontWeight: '600',
  },
  atRiskText: {
    color: '#b91c1c',
    fontSize: 13,
  },
  pendingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginBottom: 16,
  },
  pendingTitle: {
    marginBottom: 2,
  },
  pendingRow: {
    gap: 8,
  },
  pendingInfo: {
    gap: 2,
  },
  pendingChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterRow: {
    gap: 8,
    marginBottom: 16,
  },
  breakdownTitle: {
    marginBottom: 12,
  },
  courseRow: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 8,
  },
  courseRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coursePercent: {
    fontSize: 14,
    fontWeight: '600',
  },
  coursePercentAtRisk: {
    color: '#dc2626',
  },
  meta: {
    opacity: 0.6,
    fontSize: 13,
  },
});
