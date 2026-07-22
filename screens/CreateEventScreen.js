import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, RADIUS } from '../config/theme';
import PrimaryButton from '../components/PrimaryButton';
import ErrorMessage from '../components/ErrorMessage';
import useAuth from '../hooks/useAuth';
import * as eventService from '../services/eventService';

export default function CreateEventScreen({ navigation }) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate() {
    if (!name.trim()) {
      setError('Please give your event a name.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const event = await eventService.createEvent({
        name,
        description,
        startDate: startDate || null,
        endDate: endDate || null,
        ownerId: user.id,
      });
      navigation.replace('EventDetails', { eventId: event.id });
    } catch (e) {
      setError('Could not create this event. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content}>
        {error ? <ErrorMessage message={error} /> : null}

        <Text style={styles.label}>Event Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          style={styles.input}
          placeholder="e.g. Freshers' Week Treasure Hunt"
          accessibilityLabel="Event name"
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          style={[styles.input, styles.multiline]}
          placeholder="What's this event about?"
          multiline
          accessibilityLabel="Event description"
        />

        <Text style={styles.label}>Start Date (optional)</Text>
        <TextInput
          value={startDate}
          onChangeText={setStartDate}
          style={styles.input}
          placeholder="YYYY-MM-DD"
          accessibilityLabel="Start date"
        />

        <Text style={styles.label}>End Date (optional)</Text>
        <TextInput
          value={endDate}
          onChangeText={setEndDate}
          style={styles.input}
          placeholder="YYYY-MM-DD"
          accessibilityLabel="End date"
        />

        <PrimaryButton
          title="Create Event"
          onPress={handleCreate}
          loading={submitting}
          style={styles.button}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  button: { marginTop: SPACING.xl },
});
