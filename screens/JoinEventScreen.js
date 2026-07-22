import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, RADIUS } from '../config/theme';
import PrimaryButton from '../components/PrimaryButton';
import ErrorMessage from '../components/ErrorMessage';
import useAuth from '../hooks/useAuth';
import * as eventService from '../services/eventService';
import { validateEventCode } from '../utils/validation';

export default function JoinEventScreen({ navigation }) {
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleJoin() {
    const validationError = validateEventCode(code);
    if (validationError) {
      setError(validationError);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const event = await eventService.joinEventByCode(code, user.id);
      navigation.replace('EventDetails', { eventId: event.id });
    } catch (e) {
      setError(e.message || 'Could not join this event.');
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Join a Private Event</Text>
        <Text style={styles.subtitle}>Enter the invite code shared by the event organiser.</Text>

        {error ? <ErrorMessage message={error} /> : null}

        <TextInput
          value={code}
          onChangeText={(text) => setCode(text.toUpperCase())}
          style={styles.input}
          placeholder="e.g. AB12CD"
          autoCapitalize="characters"
          maxLength={6}
          accessibilityLabel="Event invite code"
        />

        <PrimaryButton title="Join Event" onPress={handleJoin} loading={submitting} style={styles.button} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg },
  title: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.primary },
  subtitle: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted, marginTop: SPACING.xs },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginTop: SPACING.lg,
    letterSpacing: 2,
    textAlign: 'center',
  },
  button: { marginTop: SPACING.xl },
});
