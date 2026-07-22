import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOW } from '../config/theme';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import EmptyState from '../components/EmptyState';
import LoadingScreen from '../components/LoadingScreen';
import useAuth from '../hooks/useAuth';
import * as eventService from '../services/eventService';

export default function EventsScreen({ navigation }) {
  const { user } = useAuth();
  const [events, setEvents] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      eventService.getUserEvents(user.id).then((result) => {
        if (isMounted) setEvents(result);
      });
      return () => {
        isMounted = false;
      };
    }, [user.id])
  );

  return (
    <View style={styles.container}>
      <View style={styles.actionsRow}>
        <PrimaryButton
          title="Create Event"
          onPress={() => navigation.navigate('CreateEvent')}
          style={styles.halfButton}
        />
        <SecondaryButton
          title="Join Event"
          onPress={() => navigation.navigate('JoinEvent')}
          style={[styles.halfButton, styles.gapLeft]}
        />
      </View>

      {events === null ? (
        <LoadingScreen message="Loading your events..." />
      ) : events.length === 0 ? (
        <EmptyState
          icon="🎟️"
          title="No events yet"
          message="Create a private event or join one with an invite code."
        />
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => navigation.navigate('EventDetails', { eventId: item.id })}
              accessibilityRole="button"
              accessibilityLabel={`Open event ${item.name}`}
            >
              <Text style={styles.name}>{item.name}</Text>
              {item.description ? (
                <Text style={styles.description} numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}
              <View style={styles.footerRow}>
                <Text style={styles.code}>Code: {item.inviteCode}</Text>
                {item.ownerId === user.id ? <Text style={styles.ownerTag}>Owner</Text> : null}
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  actionsRow: { flexDirection: 'row', padding: SPACING.lg },
  halfButton: { flex: 1 },
  gapLeft: { marginLeft: SPACING.sm },
  list: { padding: SPACING.lg, paddingTop: 0 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOW,
  },
  name: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  description: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted, marginTop: SPACING.xs },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  code: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, letterSpacing: 1 },
  ownerTag: { fontSize: FONT_SIZES.xs, color: COLORS.accentDark, fontWeight: '700' },
});
