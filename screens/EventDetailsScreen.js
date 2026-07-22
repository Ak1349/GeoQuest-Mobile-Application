import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOW } from '../config/theme';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import EmptyState from '../components/EmptyState';
import LoadingScreen from '../components/LoadingScreen';
import ErrorMessage from '../components/ErrorMessage';
import CacheCard from '../components/CacheCard';
import useAuth from '../hooks/useAuth';
import * as eventService from '../services/eventService';
import * as cacheService from '../services/cacheService';

export default function EventDetailsScreen({ route, navigation }) {
  const { eventId } = route.params;
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [caches, setCaches] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      setLoading(true);
      (async () => {
        try {
          const [foundEvent, eventCaches, eventParticipants] = await Promise.all([
            eventService.getEventById(eventId),
            cacheService.getEventCaches(eventId),
            eventService.getEventParticipants(eventId),
          ]);
          if (!isMounted) return;
          if (!foundEvent) setError('This event could not be found.');
          else {
            setEvent(foundEvent);
            setCaches(eventCaches);
            setParticipants(eventParticipants);
          }
        } catch (e) {
          if (isMounted) setError('Could not load this event.');
        } finally {
          if (isMounted) setLoading(false);
        }
      })();
      return () => {
        isMounted = false;
      };
    }, [eventId])
  );

  if (loading) return <LoadingScreen message="Loading event..." />;
  if (error || !event) return <ErrorMessage message={error || 'Event not found.'} />;

  const isOwner = event.ownerId === user.id;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{event.name}</Text>
      {event.description ? <Text style={styles.description}>{event.description}</Text> : null}

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>👥 {participants.length} participant(s)</Text>
        <Text style={styles.metaText}>🔑 Code: {event.inviteCode}</Text>
      </View>

      <View style={styles.actionsRow}>
        <SecondaryButton
          title="Event Leaderboard"
          onPress={() => navigation.navigate('EventLeaderboard', { eventId })}
          style={styles.halfButton}
        />
        {isOwner ? (
          <SecondaryButton
            title="Progress"
            onPress={() => navigation.navigate('EventProgress', { eventId })}
            style={[styles.halfButton, styles.gapLeft]}
          />
        ) : null}
      </View>

      {isOwner ? (
        <PrimaryButton
          title="Add Cache to Event"
          onPress={() => navigation.navigate('CreateCache', { eventId })}
          style={styles.createCacheButton}
        />
      ) : null}

      <Text style={styles.sectionTitle}>Event Caches</Text>
      {caches.length === 0 ? (
        <EmptyState icon="📦" title="No caches yet" message="This event has no caches yet." />
      ) : (
        <View style={styles.cachesWrap}>
          {caches.map((cache) => (
            <CacheCard
              key={cache.id}
              cache={{ ...cache, distanceMeters: null, isUnlocked: false, isDiscovered: false }}
              onPress={() => navigation.navigate('CacheDetails', { cacheId: cache.id })}
              style={styles.cacheCard}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: SPACING.lg, paddingBottom: SPACING.xxl, backgroundColor: COLORS.background },
  title: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.primary },
  description: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted, marginTop: SPACING.xs },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.lg,
    ...SHADOW,
  },
  metaText: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
  actionsRow: { flexDirection: 'row', marginTop: SPACING.lg },
  halfButton: { flex: 1 },
  gapLeft: { marginLeft: SPACING.sm },
  createCacheButton: { marginTop: SPACING.md },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
  },
  cachesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md },
  cacheCard: { width: '100%' },
});
