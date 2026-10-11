/**
 * Lokkhyo's design tokens. Every colour, size and type style in the app comes
 * from here, so screens stay consistent and a change lands everywhere at once.
 *
 * Direction: quiet and precise. A cool mist page, white cards with hairlines
 * instead of shadows, one brand colour (deep teal) for action and focus, and
 * three status colours used only to mean something (on track / close / at
 * risk). The one signature: progress is always drawn against its *target*
 * (লক্ষ্য), so every figure shows where you are relative to where you need to be.
 */

export const Palette = {
  /** Body text and headings: near-black with a teal undertone. */
  ink: '#0F1E24',
  /** Secondary text, captions, inactive icons. */
  muted: '#62757C',
  /** Placeholder text and disabled foregrounds. */
  faint: '#9AAAB0',
  /** Page background behind cards: cool, not cream. */
  mist: '#F2F5F5',
  /** Card surfaces. */
  surface: '#FFFFFF',
  /** Hairline borders and dividers. */
  line: '#E2E8E9',

  /** Brand: primary actions, focus, the hero card. */
  teal: '#0A5566',
  /** Pressed / emphasised brand. */
  tealDeep: '#073F4C',
  /** Brand tint for selected chips, secondary buttons, rings' tracks. */
  tealSoft: '#E3F0F2',
  /** Light text and marks sitting on `teal`. */
  tealOnDark: '#9ED9E6',

  /** Status: on track. */
  good: '#1F8F6A',
  goodSoft: '#E2F3EC',
  /** Status: close to the target line. */
  warn: '#C27A12',
  warnSoft: '#FBF0DF',
  /** Status: below target, destructive actions. */
  risk: '#C8423B',
  riskSoft: '#FBE7E5',
} as const;

/**
 * Legacy names the screens already use, mapped onto the palette so older code
 * picks up the new look without a rewrite.
 */
export const Colors = {
  text: Palette.ink,
  background: Palette.mist,
  card: Palette.surface,
  tint: Palette.teal,
  icon: Palette.muted,
  tabIconDefault: Palette.faint,
  tabIconSelected: Palette.teal,
};

export const Brand = {
  teal: Palette.teal,
  accent: Palette.tealOnDark,
  page: Palette.mist,
  divider: Palette.line,
  danger: Palette.risk,
};

export const Radius = {
  sm: 10,
  md: 14,
  lg: 20,
  pill: 999,
} as const;

/** A 4-point spacing scale. */
export const Space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

/**
 * Two families with clear jobs. Sora (geometric, slightly wide) is the display
 * face — screen titles and the numbers that matter: times, percentages, GPA.
 * Inter carries everything you read.
 */
export const FontFamily = {
  display: 'SoraSemiBold',
  displayBold: 'SoraBold',
  regular: 'InterRegular',
  medium: 'InterMedium',
  semibold: 'InterSemiBold',
} as const;

export const Type = {
  /** Screen titles. */
  title: { fontFamily: FontFamily.display, fontSize: 26, lineHeight: 32, letterSpacing: -0.4 },
  /** Hero numbers: the next class's time, a CGPA. */
  figure: { fontFamily: FontFamily.displayBold, fontSize: 34, lineHeight: 38, letterSpacing: -0.8 },
  /** Inline numbers in rows: percentages, marks. */
  number: { fontFamily: FontFamily.display, fontSize: 15, lineHeight: 20 },
  /** Section headings. */
  heading: { fontFamily: FontFamily.semibold, fontSize: 16, lineHeight: 22 },
  body: { fontFamily: FontFamily.regular, fontSize: 15, lineHeight: 21 },
  bodyStrong: { fontFamily: FontFamily.semibold, fontSize: 15, lineHeight: 21 },
  caption: { fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 18 },
  /** Small caps-style labels above values ("NEXT CLASS"). */
  eyebrow: { fontFamily: FontFamily.semibold, fontSize: 11, lineHeight: 14, letterSpacing: 1.2 },
} as const;

/** Status colour for a value measured against a target, e.g. attendance %. */
export function statusColor(value: number, target: number, warnMargin = 10) {
  if (value < target) return { fg: Palette.risk, bg: Palette.riskSoft };
  if (value < target + warnMargin) return { fg: Palette.warn, bg: Palette.warnSoft };
  return { fg: Palette.good, bg: Palette.goodSoft };
}
