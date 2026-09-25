import type { AssessmentType } from '@/lib/types';
import { DAY_SHORT_NAMES, MONTH_NAMES } from '@/lib/constants';
import { dateToWeekdayIndex } from '@/lib/routine';

export interface AssessmentReminder {
  assessmentId: string;
  courseId: string;
  type: AssessmentType;
  name: string;
  date: string;
  triggerDate: Date;
}

const REMINDER_LEAD_DAYS: Partial<Record<AssessmentType, number>> = {
  ct: 2,
  assignment: 2,
  quiz: 3,
  labFinal: 5,
};

const REMINDER_TYPES: AssessmentType[] = ['ct', 'assignment', 'quiz', 'labFinal'];

export function isReminderType(type: string): type is AssessmentType {
  return REMINDER_TYPES.includes(type as AssessmentType);
}

export function getReminderLeadDays(type: AssessmentType): number | undefined {
  return REMINDER_LEAD_DAYS[type];
}

/**
 * Computes the device-local reminder trigger Date at the given hour:minute
 * on (assessmentDate − leadDays).
 * Returns null if the assessment date is invalid or the trigger would be in the past.
 */
export function getAssessmentReminderTrigger(
  dateStr: string,
  type: AssessmentType,
  now: Date = new Date(),
  hour: number = 7,
  minute: number = 0,
): Date | null {
  const leadDays = REMINDER_LEAD_DAYS[type];
  if (leadDays === undefined) return null;

  const parts = dateStr.split('-');
  if (parts.length !== 3) return null;

  const year = Number(parts[0]);
  const month = Number(parts[1]) - 1;
  const day = Number(parts[2]);
  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) return null;

  const assessmentDate = new Date(year, month, day, hour, minute, 0, 0);
  const triggerDate = new Date(year, month, day - leadDays, hour, minute, 0, 0);

  if (Number.isNaN(assessmentDate.getTime()) || Number.isNaN(triggerDate.getTime())) return null;
  if (assessmentDate.getTime() <= now.getTime()) return null;
  if (triggerDate.getTime() <= now.getTime()) return null;

  return triggerDate;
}

/**
 * Returns assessments that have upcoming reminders (trigger time > now).
 */
export function getUpcomingAssessmentReminders(
  assessments: { id: string; type: string; name: string; date: string; courseId: string }[],
  now: Date = new Date(),
  hour: number = 7,
  minute: number = 0,
): {
  assessmentId: string;
  courseId: string;
  type: AssessmentType;
  name: string;
  date: string;
  triggerDate: Date;
}[] {
  const upcoming: {
    assessmentId: string;
    courseId: string;
    type: AssessmentType;
    name: string;
    date: string;
    triggerDate: Date;
  }[] = [];

  for (const a of assessments) {
    if (!isReminderType(a.type)) continue;
    if (typeof a.date !== 'string' || !a.date.trim()) continue;

    const triggerDate = getAssessmentReminderTrigger(a.date.trim(), a.type, now, hour, minute);
    if (triggerDate) {
      upcoming.push({
        assessmentId: a.id,
        courseId: a.courseId,
        type: a.type,
        name: a.name || 'Assessment',
        date: a.date.trim(),
        triggerDate,
      });
    }
  }

  return upcoming;
}

/**
 * Formats a "YYYY-MM-DD" date string to a friendly label like "Fri, Sep 12".
 */
export function formatDateLabel(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;

  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  if (Number.isNaN(d.getTime())) return dateStr;

  return `${DAY_SHORT_NAMES[dateToWeekdayIndex(d)]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
}

/**
 * Type-specific notification titles.
 */
const REMINDER_TITLES: Record<AssessmentType, string> = {
  ct: 'CT Reminder 📝',
  assignment: 'Assignment Reminder 📝',
  quiz: 'Quiz Reminder 📝',
  labFinal: 'Lab Final Reminder 📝',
};

/**
 * Builds notification content for an upcoming assessment reminder.
 */
export function buildAssessmentReminderContent(
  assessment: { type: AssessmentType; name: string; date: string },
  courseCode?: string,
): { title: string; body: string } {
  const title = REMINDER_TITLES[assessment.type] || 'Assessment Reminder 📝';
  const label = courseCode || assessment.name;
  const dateLabel = formatDateLabel(assessment.date);

  switch (assessment.type) {
    case 'ct':
      return {
        title,
        body: `${label} has a CT on ${dateLabel}. Tap to view details.`,
      };
    case 'assignment':
      return {
        title,
        body: `${label} · "${assessment.name}" is due on ${dateLabel}. Tap to view details.`,
      };
    case 'quiz':
      return {
        title,
        body: `${label} has a quiz on ${dateLabel}. Tap to view details.`,
      };
    case 'labFinal':
      return {
        title,
        body: `${label} has a lab final on ${dateLabel}. Tap to view details.`,
      };
    default:
      return {
        title: 'Assessment Reminder 📝',
        body: `${label} has an upcoming assessment on ${dateLabel}. Tap to view details.`,
      };
  }
}
