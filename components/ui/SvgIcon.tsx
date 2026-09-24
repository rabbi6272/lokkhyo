import React from 'react';
import { SvgXml } from 'react-native-svg';

import { Icons } from '@/constants/icons';

const ICONS: Record<string, string> = {
  home: Icons.HOME,
  courses: Icons.COURSE,
  calender: Icons.CALENDER,
  user: Icons.PROFILE,
  arrowLeft: Icons.ARROW_LEFT,
  settings: Icons.SETTING,
  circleAdd: Icons.CIRCLE_PLUS,
  trash: Icons.TRASH,
  chevronRight: Icons.ANGLE_LEFT,
  logout: Icons.LOGOUT,
  routine: Icons.ROUTINE,
  empty: Icons.EMPTY,
};

type IconName = keyof typeof ICONS;

type SvgIconProps = {
  name: IconName;
  size?: number;
  color?: string;
}
export function SvgIcon({ size = 24, color, ...props }: SvgIconProps) {
  const xml = ICONS[props.name];
  if (!xml) return null;
  return <SvgXml xml={xml} width={size} height={size} fill={color} />;
}
