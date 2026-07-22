import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING, FONT_SIZES } from '../config/theme';

const DIFFICULTY_COLORS = {
  easy: COLORS.success,
  medium: COLORS.info,
  hard: COLORS.accentDark,
  expert: COLORS.danger,
};

// Shows a cache's point value with a difficulty-tinted background.
// Difficulty label text is always shown alongside colour (never colour-only).
export default function PointsBadge({ points, difficulty, style }) {
  const color = DIFFICULTY_COLORS[difficulty] || COLORS.textMuted;
  return (
    <View style={[styles.badge, { backgroundColor: `${color}1A`, borderColor: color }, style]}>
      <Text style={[styles.points, { color }]}>+{points} pts</Text>
      {difficulty ? <Text style={[styles.difficulty, { color }]}>{difficulty}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: RADIUS.full,
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  points: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
  },
  difficulty: {
    fontSize: FONT_SIZES.xs,
    textTransform: 'capitalize',
  },
});
