import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOW } from '../config/theme';
import EmptyState from '../components/EmptyState';
import LoadingScreen from '../components/LoadingScreen';
import PointsBadge from '../components/PointsBadge';
import useAuth from '../hooks/useAuth';
import * as discoveryService from '../services/discoveryService';
import * as cacheService from '../services/cacheService';
import { formatRelativeDate } from '../utils/formatDate';

export default function DiscoveryHistoryScreen() {
  const { user } = useAuth();
  const [discoveries, setDiscoveries] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      (async () => {
        const [userDiscoveries, allCaches] = await Promise.all([
          discoveryService.getUserDiscoveries(user.id),
          cacheService.getAllCaches(),
        ]);
        if (!isMounted) return;
        const cacheById = Object.fromEntries(allCaches.map((c) => [c.id, c]));
        const enriched = userDiscoveries
          .map((d) => ({ ...d, cache: cacheById[d.cacheId] }))
          .sort((a, b) => new Date(b.discoveredAt) - new Date(a.discoveredAt));
        setDiscoveries(enriched);
      })();
      return () => {
        isMounted = false;
      };
    }, [user.id])
  );

  if (discoveries === null) return <LoadingScreen message="Loading your discoveries..." />;

  if (discoveries.length === 0) {
    return (
      <EmptyState
        icon="🏅"
        title="No discoveries yet"
        message="Head to the map and travel to a cache to make your first discovery!"
      />
    );
  }

  return (
    <FlatList
      data={discoveries}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <View style={styles.card}>
          {item.photoUri ? <Image source={{ uri: item.photoUri }} style={styles.thumb} /> : null}
          <View style={styles.cardBody}>
            <Text style={styles.cacheTitle} numberOfLines={1}>
              {item.cache?.title || 'Unknown cache'}
            </Text>
            <Text style={styles.date}>{formatRelativeDate(item.discoveredAt)}</Text>
            <PointsBadge points={item.pointsEarned} difficulty={item.cache?.difficulty} style={styles.badge} />
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: SPACING.lg, gap: SPACING.md },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOW,
  },
  thumb: { width: 56, height: 56, borderRadius: RADIUS.sm, marginRight: SPACING.md },
  cardBody: { flex: 1, justifyContent: 'center' },
  cacheTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  date: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginTop: 2 },
  badge: { marginTop: SPACING.xs, alignSelf: 'flex-start' },
});
