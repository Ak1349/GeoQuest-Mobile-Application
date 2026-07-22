import { Pressable, View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING, FONT_SIZES, SHADOW } from '../config/theme';
import DistanceBadge from './DistanceBadge';
import PointsBadge from './PointsBadge';
import CacheStatusBadge from './CacheStatusBadge';
import { getCacheStatus } from '../utils/cacheStatus';

// Reusable card for a cache, used in the Home "Nearby Caches" horizontal list and
// anywhere else a compact cache summary is needed.
export default function CacheCard({ cache, onPress, style }) {
  const status = getCacheStatus(cache);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${cache.title}, ${status}, ${cache.points} points`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}
    >
      <Text style={styles.title} numberOfLines={1}>
        {cache.title}
      </Text>
      <Text style={styles.description} numberOfLines={2}>
        {cache.description}
      </Text>
      <View style={styles.badgeRow}>
        <PointsBadge points={cache.points} difficulty={cache.difficulty} />
        <DistanceBadge meters={cache.distanceMeters} />
      </View>
      <CacheStatusBadge status={status} style={styles.statusBadge} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    width: 220,
    ...SHADOW,
  },
  pressed: { opacity: 0.85 },
  title: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  description: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
    minHeight: 32,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
    flexWrap: 'wrap',
  },
  statusBadge: {
    marginTop: SPACING.sm,
    alignSelf: 'flex-start',
  },
});
