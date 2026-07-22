import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING, FONT_SIZES } from '../config/theme';
import { formatDistance } from '../utils/formatDistance';
import useSettings from '../hooks/useSettings';

// Small pill showing distance to a cache. Never the only indicator of lock state -
// always paired with text/icon, not colour alone (accessibility requirement).
export default function DistanceBadge({ meters, style }) {
  const { settings } = useSettings();
  return (
    <View style={[styles.badge, style]}>
      <Text style={styles.text}>📍 {formatDistance(meters, settings.units)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.full,
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  text: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text,
    fontWeight: '600',
  },
});
