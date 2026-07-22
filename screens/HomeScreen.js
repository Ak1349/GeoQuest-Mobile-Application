import { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOW } from '../config/theme';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import CacheCard from '../components/CacheCard';
import EmptyState from '../components/EmptyState';
import LoadingScreen from '../components/LoadingScreen';
import ErrorMessage from '../components/ErrorMessage';
import useAuth from '../hooks/useAuth';
import useLocation from '../hooks/useLocation';
import useCaches from '../hooks/useCaches';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { location } = useLocation();
  const { sortedByDistance, loading, error, reload } = useCaches({ location, userId: user?.id });

  // Refresh nearby caches/points whenever the user comes back to this tab (e.g. after
  // logging a discovery elsewhere), not just on first mount.
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const nearbyCaches = sortedByDistance.slice(0, 6);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={false} onRefresh={reload} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Welcome back,</Text>
          <Text style={styles.name}>{user?.name?.split(' ')[0] || 'Explorer'} 👋</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.avatar || '?'}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <Stat label="Points" value={user?.totalPoints ?? 0} />
        <Stat label="Caches Found" value={user?.cachesFound ?? 0} />
        <Stat label="Rank" value="—" />
      </View>

      <View style={styles.actionsRow}>
        <PrimaryButton
          title="Explore Map"
          onPress={() => navigation.getParent()?.navigate('ExploreTab')}
          style={styles.actionButton}
        />
      </View>
      <View style={styles.actionsRowSecondary}>
        <SecondaryButton
          title="Join Event"
          onPress={() => navigation.getParent()?.navigate('EventsTab', { screen: 'JoinEvent' })}
          style={styles.halfButton}
        />
        <SecondaryButton
          title="My Discoveries"
          onPress={() => navigation.navigate('DiscoveryHistory')}
          style={[styles.halfButton, styles.gapLeft]}
        />
      </View>

      <Text style={styles.sectionTitle}>Nearby Caches</Text>
      {loading ? (
        <LoadingScreen message="Finding caches near you..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={reload} />
      ) : nearbyCaches.length === 0 ? (
        <EmptyState
          icon="🧭"
          title="No caches yet"
          message="We couldn't find any nearby caches. Check back soon!"
        />
      ) : (
        <FlatList
          data={nearbyCaches}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.nearbyList}
          renderItem={({ item }) => (
            <CacheCard
              cache={item}
              onPress={() => navigation.navigate('CacheDetails', { cacheId: item.id })}
              style={styles.nearbyCard}
            />
          )}
        />
      )}

      <Text style={styles.sectionTitle}>Active Events</Text>
      <EmptyState
        icon="🎟️"
        title="No active events"
        message="Join a private event with an invite code to see it here."
      />

      <Text style={styles.sectionTitle}>Recent Discoveries</Text>
      <EmptyState
        icon="🏅"
        title="No discoveries yet"
        message="Head to the map and travel to a cache to make your first discovery!"
      />
    </ScrollView>
  );
}

function Stat({ label, value }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcome: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted },
  name: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.primary },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: COLORS.accent, fontSize: FONT_SIZES.lg, fontWeight: '800' },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginTop: SPACING.lg,
    ...SHADOW,
  },
  stat: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.primary },
  statLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginTop: 2 },
  actionsRow: { marginTop: SPACING.lg },
  actionButton: {},
  actionsRowSecondary: { flexDirection: 'row', marginTop: SPACING.sm },
  halfButton: { flex: 1 },
  gapLeft: { marginLeft: SPACING.sm },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
  },
  nearbyList: { gap: SPACING.md, paddingRight: SPACING.lg },
  nearbyCard: {},
});
