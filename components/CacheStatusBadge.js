import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING, FONT_SIZES } from '../config/theme';

const STATUS_CONFIG = {
  discovered: { label: 'Discovered', color: COLORS.discovered, icon: '✅' },
  unlocked: { label: 'Unlocked', color: COLORS.unlocked, icon: '🔓' },
  locked: { label: 'Locked', color: COLORS.locked, icon: '🔒' },
};

// Always pairs an icon + text label with colour so status is never colour-only.
export default function CacheStatusBadge({ status, style }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.locked;
  return (
    <View style={[styles.badge, { backgroundColor: `${config.color}1A`, borderColor: config.color }, style]}>
      <Text style={styles.icon}>{config.icon}</Text>
      <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
  },
  icon: { fontSize: FONT_SIZES.sm },
  label: { fontSize: FONT_SIZES.xs, fontWeight: '700' },
});
