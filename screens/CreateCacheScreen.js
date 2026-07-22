import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Pressable, Switch, KeyboardAvoidingView, Platform } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, RADIUS } from '../config/theme';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import ErrorMessage from '../components/ErrorMessage';
import useLocation from '../hooks/useLocation';
import * as cacheService from '../services/cacheService';
import { DIFFICULTY, DIFFICULTY_POINTS } from '../config/constants';

const DIFFICULTY_OPTIONS = [DIFFICULTY.EASY, DIFFICULTY.MEDIUM, DIFFICULTY.HARD, DIFFICULTY.EXPERT];

export default function CreateCacheScreen({ route, navigation }) {
  const { eventId } = route.params || {};
  const { location } = useLocation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [clue, setClue] = useState('');
  const [difficulty, setDifficulty] = useState(DIFFICULTY.EASY);
  const [unlockRadius, setUnlockRadius] = useState('40');
  const [photoRequired, setPhotoRequired] = useState(false);
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function useCurrentLocation() {
    if (!location) {
      setError('Your location is not available yet. Please wait a moment and try again.');
      return;
    }
    setCoords({ latitude: location.latitude, longitude: location.longitude });
    setError(null);
  }

  async function handleCreate() {
    if (!title.trim()) return setError('Please give this cache a title.');
    if (!clue.trim()) return setError('Please write a clue for this cache.');
    if (!coords) return setError('Please set this cache\'s location using your current position.');

    const radius = Number(unlockRadius);
    if (!radius || radius < 5) return setError('Unlock radius must be at least 5 metres.');

    setSubmitting(true);
    setError(null);
    try {
      await cacheService.createCache({
        title: title.trim(),
        description: description.trim(),
        clue: clue.trim(),
        difficulty,
        points: DIFFICULTY_POINTS[difficulty],
        unlockRadius: radius,
        photoRequired,
        latitude: coords.latitude,
        longitude: coords.longitude,
        eventId: eventId || null,
        createdBy: 'user',
      });
      navigation.goBack();
    } catch (e) {
      setError('Could not create this cache. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content}>
        {error ? <ErrorMessage message={error} /> : null}

        <Text style={styles.label}>Title</Text>
        <TextInput value={title} onChangeText={setTitle} style={styles.input} placeholder="Cache title" />

        <Text style={styles.label}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          style={[styles.input, styles.multiline]}
          placeholder="Short description"
          multiline
        />

        <Text style={styles.label}>Clue</Text>
        <TextInput
          value={clue}
          onChangeText={setClue}
          style={[styles.input, styles.multiline]}
          placeholder="The riddle/clue shown once unlocked"
          multiline
        />

        <Text style={styles.label}>Difficulty</Text>
        <View style={styles.chipRow}>
          {DIFFICULTY_OPTIONS.map((option) => (
            <Pressable
              key={option}
              onPress={() => setDifficulty(option)}
              style={[styles.chip, difficulty === option && styles.chipActive]}
            >
              <Text style={[styles.chipText, difficulty === option && styles.chipTextActive]}>
                {option} ({DIFFICULTY_POINTS[option]}pt)
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Unlock Radius (metres)</Text>
        <TextInput
          value={unlockRadius}
          onChangeText={setUnlockRadius}
          style={styles.input}
          keyboardType="numeric"
        />

        <View style={styles.switchRow}>
          <Text style={styles.label}>Require photo evidence</Text>
          <Switch value={photoRequired} onValueChange={setPhotoRequired} />
        </View>

        <Text style={styles.label}>Location</Text>
        {coords ? (
          <Text style={styles.coordsText}>
            {coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}
          </Text>
        ) : (
          <Text style={styles.coordsHint}>No location set yet.</Text>
        )}
        <SecondaryButton title="Use My Current Location" onPress={useCurrentLocation} style={styles.locationButton} />

        <PrimaryButton title="Create Cache" onPress={handleCreate} loading={submitting} style={styles.button} />
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
  multiline: { minHeight: 70, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
  chip: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: FONT_SIZES.xs, color: COLORS.text, textTransform: 'capitalize' },
  chipTextActive: { color: COLORS.textInverse },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  coordsText: { fontSize: FONT_SIZES.sm, color: COLORS.text },
  coordsHint: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted },
  locationButton: { marginTop: SPACING.sm },
  button: { marginTop: SPACING.xl },
});
