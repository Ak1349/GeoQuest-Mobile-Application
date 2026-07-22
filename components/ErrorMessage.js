import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '../config/theme';
import PrimaryButton from './PrimaryButton';

// Friendly, non-technical error banner. Never shows raw stack traces to the user.
export default function ErrorMessage({ title = 'Something went wrong', message, onRetry, retryLabel = 'Try again' }) {
  return (
    <View style={styles.container} accessibilityRole="alert">
      <Text style={styles.title}>⚠️ {title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {onRetry ? (
        <PrimaryButton title={retryLabel} onPress={onRetry} style={styles.action} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FCEBEC',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.danger,
    padding: SPACING.md,
    margin: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.danger,
  },
  message: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  action: {
    marginTop: SPACING.md,
  },
});
