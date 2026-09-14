import React from 'react';
import { SvgProps } from 'react-native-svg';

import HomeIcon from '@/assets/icons/home.svg';
import CoursesIcon from '@/assets/icons/courses.svg';
import CalendarIcon from '@/assets/icons/calender.svg';
import TargetsIcon from '@/assets/icons/targets.svg';
import UserIcon from '@/assets/icons/user.svg';
import ArrowLeftIcon from '@/assets/icons/arrow-left.svg';
import CircleAddIcon from '@/assets/icons/circle-plus.svg';
import TrashIcon from '@/assets/icons/trash.svg';
import ChevronRightIcon from '@/assets/icons/angle-right.svg';
import LogoutIcon from '@/assets/icons/logout.svg';
import SettingsIcon from '@/assets/icons/settings.svg';

const ICONS: Record<string, React.FC<SvgProps>> = {
  home: HomeIcon,
  courses: CoursesIcon,
  calendar: CalendarIcon,
  targets: TargetsIcon,
  user: UserIcon,
  arrowLeft: ArrowLeftIcon,
  settings: SettingsIcon,
  circleAdd: CircleAddIcon,
  trash: TrashIcon,
  chevronRight: ChevronRightIcon,
  logout: LogoutIcon,
};

type IconName = keyof typeof ICONS;

type SvgIconProps = {
  size?: number;
  color: string;
} & (
    | { name: IconName; icon?: never }
    | { icon: React.FC<SvgProps>; name?: never }
  );

export function SvgIcon({ size = 24, color, ...props }: SvgIconProps) {
  const Icon = 'icon' in props ? props.icon : ICONS[props.name];
  if (!Icon) return null;
  return <Icon width={size} height={size} color={color} />;
}
