import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOW } from '../config/theme';
import PrimaryButton from '../components/PrimaryButton';
import DistanceBadge from '../components/DistanceBadge';
import PointsBadge from '../components/PointsBadge';
import CacheStatusBadge from '../components/CacheStatusBadge';
import LoadingScreen from '../components/LoadingScreen';
import ErrorMessage from '../components/ErrorMessage';
import useLocation from '../hooks/useLocation';
import useAuth from '../hooks/useAuth';
import * as cacheService from '../services/cacheService';
import * as discoveryService from '../services/discoveryService';
import { calculateDistanceMeters, isWithinUnlockRadius } from '../utils/distanceCalculator';
import { getCacheStatus } from '../utils/cacheStatus';

export default function CacheDetailsScreen({ route, navigation }) {
  const { cacheId } = route.params;
  const { user } = useAuth();
  const { location } = useLocation();
  const [cache, setCache] = useState(null);
  const [isDiscovered, setIsDiscovered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [found, discovered] = await Promise.all([
          cacheService.getCacheById(cacheId),
          user ? discoveryService.hasDiscovered(user.id, cacheId) : Promise.resolve(false),
        ]);
        if (!isMounted) return;
        if (!found) {
          setError('This cache could not be found.');
        } else {
          setCache(found);
          setIsDiscovered(discovered);
        }
      } catch (e) {
        if (isMounted) setError('Could not load this cache. Please try again.');
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [cacheId, user]);

  if (loading) return <LoadingScreen message="Loading cache..." />;
  if (error || !cache) return <ErrorMessage message={error || 'Cache not found.'} />;

  const distanceMeters = location
    ? calculateDistanceMeters(location, { latitude: cache.latitude, longitude: cache.longitude })
    : null;
  const isUnlocked = isDiscovered || (location ? isWithinUnlockRadius(location, cache) : false);
  const status = getCacheStatus({ ...cache, isDiscovered, isUnlocked });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{cache.title}</Text>

      <View style={styles.badgeRow}>
        <PointsBadge points={cache.points} difficulty={cache.difficulty} />
        <DistanceBadge meters={distanceMeters} />
        <CacheStatusBadge status={status} />
      </View>

      <Text style={styles.sectionLabel}>Description</Text>
      <Text style={styles.description}>{cache.description}</Text>

      <Text style={styles.sectionLabel}>Clue</Text>
      <View style={styles.clueBox}>
        {isUnlocked ? (
          <Text style={styles.clueText}>{cache.clue}</Text>
        ) : (
          <Text style={styles.clueLocked}>
            🔒 Get within {cache.unlockRadius}m of this cache to reveal the clue.
          </Text>
        )}
      </View>

      {cache.photoRequired ? (
        <Text style={styles.photoNote}>📷 Photo evidence is required to complete this cache.</Text>
      ) : null}

      {isDiscovered ? (
        <View style={styles.discoveredBox}>
          <Text style={styles.discoveredText}>✅ You've already discovered this cache!</Text>
        </View>
      ) : isUnlocked ? (
        <PrimaryButton
          title="Discover This Cache"
          onPress={() => navigation.navigate('CacheDiscovery', { cacheId: cache.id })}
          style={styles.actionButton}
        />
      ) : (
        <PrimaryButton
          title="Navigate to Cache"
          onPress={() => navigation.navigate('Navigation', { cacheId: cache.id })}
          style={styles.actionButton}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: SPACING.lg, paddingBottom: SPACING.xxl, backgroundColor: COLORS.background },
  title: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.primary },
  badgeRow: { flexDirection: 'row', gap: SPACING.xs, marginTop: SPACING.md, flexWrap: 'wrap' },
  sectionLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginTop: SPACING.lg,
    textTransform: 'uppercase',
  },
  description: { fontSize: FONT_SIZES.md, color: COLORS.text, marginTop: SPACING.xs, lineHeight: 22 },
  clueBox: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.xs,
    ...SHADOW,
  },
  clueText: { fontSize: FONT_SIZES.md, color: COLORS.text, fontStyle: 'italic', lineHeight: 22 },
  clueLocked: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted },
  photoNote: { fontSize: FONT_SIZES.sm, color: COLORS.accentDark, marginTop: SPACING.md },
  discoveredBox: {
    backgroundColor: '#E7F6EC',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.xl,
  },
  discoveredText: { color: COLORS.success, fontWeight: '700' },
  actionButton: { marginTop: SPACING.xl },
});
