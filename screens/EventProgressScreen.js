import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOW } from '../config/theme';
import LoadingScreen from '../components/LoadingScreen';
import EmptyState from '../components/EmptyState';
import * as eventService from '../services/eventService';
import * as discoveryService from '../services/discoveryService';
import * as cacheService from '../services/cacheService';
import * as authService from '../services/authService';

export default function EventProgressScreen({ route }) {
  const { eventId } = route.params;
  const [rows, setRows] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      (async () => {
        const [participants, eventDiscoveries, eventCaches] = await Promise.all([
          eventService.getEventParticipants(eventId),
          discoveryService.getEventDiscoveries(eventId),
          cacheService.getEventCaches(eventId),
        ]);

        const result = await Promise.all(
          participants.map(async (p) => {
            const user = await authService.getUserById(p.userId);
            const userDiscoveries = eventDiscoveries.filter((d) => d.userId === p.userId);
            const points = userDiscoveries.reduce((sum, d) => sum + d.pointsEarned, 0);
            return {
              userId: p.userId,
              name: user?.name || 'Unknown player',
              cachesDiscovered: userDiscoveries.length,
              totalCaches: eventCaches.length,
              points,
            };
          })
        );

        if (isMounted) setRows(result.sort((a, b) => b.points - a.points));
      })();
      return () => {
        isMounted = false;
      };
    }, [eventId])
  );

  if (rows === null) return <LoadingScreen message="Loading participant progress..." />;
  if (rows.length === 0) {
    return <EmptyState icon="👥" title="No participants yet" message="No one has joined this event yet." />;
  }

  return (
    <FlatList
      data={rows}
      keyExtractor={(item) => item.userId}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.progress}>
            {item.cachesDiscovered}/{item.totalCaches} caches
          </Text>
          <Text style={styles.points}>{item.points} pts</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: SPACING.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOW,
  },
  name: { flex: 1, fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  progress: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginRight: SPACING.md },
  points: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.accentDark },
});
