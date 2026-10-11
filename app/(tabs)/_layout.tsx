import { Tabs } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { SvgIcon } from '@/components/ui/SvgIcon';
import { FontFamily, Palette } from '@/constants/theme';

const TABS = [
  { name: 'index', title: 'Home', icon: 'home' },
  { name: 'courses', title: 'Courses', icon: 'courses' },
  { name: 'routine', title: 'Routine', icon: 'routine' },
  { name: 'attendance', title: 'Attendance', icon: 'calender' },
  { name: 'profile', title: 'Profile', icon: 'user' },
] as const;

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        animation: 'shift',
        tabBarActiveTintColor: Palette.teal,
        tabBarInactiveTintColor: Palette.faint,
        tabBarStyle: styles.bar,
        tabBarLabel: ({ focused, color, children }) => (
          <Text style={[styles.label, { color, fontFamily: focused ? FontFamily.semibold : FontFamily.medium }]}>
            {children}
          </Text>
        ),
      }}>
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, focused }) => (
              <View style={styles.iconWrap}>
                <View style={[styles.marker, focused && { backgroundColor: Palette.teal }]} />
                <SvgIcon name={tab.icon} size={24} color={color} />
              </View>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 72,
    paddingTop: 6,
    backgroundColor: Palette.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Palette.line,
    elevation: 0,
  },
  label: { fontSize: 11, paddingTop: 2 },
  iconWrap: { alignItems: 'center', gap: 4 },
  /** A short bar above the active tab's icon — the only active-state decoration. */
  marker: { width: 18, height: 3, borderRadius: 2, backgroundColor: 'transparent', marginTop: -6 },
});
