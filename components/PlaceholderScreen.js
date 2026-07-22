import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../config/theme';

// Temporary scaffold used by screens that haven't been fully built yet in the current
// development phase. Each real screen replaces this with its full implementation when
// its phase is reached - kept here only so navigation is fully wired and testable early.
export default function PlaceholderScreen({ title, phase, description, children }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {phase ? <Text style={styles.phase}>Coming in {phase}</Text> : null}
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.primary,
  },
  phase: {
    marginTop: SPACING.xs,
    fontSize: FONT_SIZES.sm,
    color: COLORS.accentDark,
    fontWeight: '600',
  },
  description: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    lineHeight: 22,
  },
});
