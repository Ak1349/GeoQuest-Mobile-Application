import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Magnetometer } from 'expo-sensors';
import { COLORS, SPACING, FONT_SIZES, SHADOW } from '../config/theme';
import LoadingScreen from '../components/LoadingScreen';
import ErrorMessage from '../components/ErrorMessage';
import PrimaryButton from '../components/PrimaryButton';
import DistanceBadge from '../components/DistanceBadge';
import useLocation, { LOCATION_STATUS } from '../hooks/useLocation';
import * as cacheService from '../services/cacheService';
import { calculateDistanceMeters, calculateBearing, isWithinUnlockRadius } from '../utils/distanceCalculator';
import { formatDirection } from '../utils/formatDistance';

// The compass/heading sensor is explicitly optional per the assignment spec - if the
// device doesn't support it (or the user denies motion access) we fall back to just
// showing the plain-text compass direction (e.g. "NE") instead of a rotating arrow.
function useDeviceHeading() {
  const [heading, setHeading] = useState(null);

  useEffect(() => {
    let subscription;
    Magnetometer.isAvailableAsync()
      .then((available) => {
        if (!available) return;
        subscription = Magnetometer.addListener(({ x, y }) => {
          let angle = Math.atan2(y, x) * (180 / Math.PI);
          angle = angle - 90; // adjust so 0deg = north-ish for typical device orientation
          if (angle < 0) angle += 360;
          setHeading(angle);
        });
        Magnetometer.setUpdateInterval(500);
      })
      .catch(() => setHeading(null));

    return () => subscription?.remove();
  }, []);

  return heading;
}

export default function NavigationScreen({ route, navigation }) {
  const { cacheId } = route.params;
  const { location, status, errorMessage, retry } = useLocation();
  const heading = useDeviceHeading();
  const [cache, setCache] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    cacheService
      .getCacheById(cacheId)
      .then((found) => {
        if (!isMounted) return;
        if (!found) setLoadError('This cache could not be found.');
        else setCache(found);
      })
      .catch(() => isMounted && setLoadError('Could not load this cache.'))
      .finally(() => isMounted && setLoading(false));
    return () => {
      isMounted = false;
    };
  }, [cacheId]);

  if (loading) return <LoadingScreen message="Loading cache..." />;
  if (loadError || !cache) return <ErrorMessage message={loadError || 'Cache not found.'} />;
  if (status === LOCATION_STATUS.LOADING) return <LoadingScreen message="Getting your location..." />;
  if (status !== LOCATION_STATUS.GRANTED) {
    return <ErrorMessage title="Location needed" message={errorMessage} onRetry={retry} />;
  }

  const destination = { latitude: cache.latitude, longitude: cache.longitude };
  const distanceMeters = calculateDistanceMeters(location, destination);
  const bearing = calculateBearing(location, destination);
  const hasArrived = isWithinUnlockRadius(location, cache);

  // Arrow points toward the cache relative to the phone's own heading when available,
  // otherwise it just points along the raw bearing (north-up).
  const arrowRotation = heading != null ? bearing - heading : bearing;

  return (
    <View style={styles.container}>
      <Text style={styles.cacheName}>{cache.title}</Text>
      <DistanceBadge meters={distanceMeters} style={styles.distanceBadge} />

      <View style={styles.compassWrap}>
        <View style={styles.compassCircle}>
          <Animated.Text style={[styles.arrow, { transform: [{ rotate: `${arrowRotation}deg` }] }]}>
            ⬆️
          </Animated.Text>
        </View>
        <Text style={styles.directionText}>{formatDirection(bearing)}</Text>
        {heading == null ? (
          <Text style={styles.hint}>Compass sensor unavailable - showing raw direction.</Text>
        ) : null}
      </View>

      {hasArrived ? (
        <View style={styles.arrivedBox}>
          <Text style={styles.arrivedText}>🎯 You've arrived at this cache!</Text>
          <PrimaryButton
            title="Discover This Cache"
            onPress={() => navigation.replace('CacheDiscovery', { cacheId: cache.id })}
            style={styles.actionButton}
          />
        </View>
      ) : (
        <Text style={styles.tip}>
          Keep walking toward the arrow. It'll unlock automatically once you're within{' '}
          {cache.unlockRadius}m.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    padding: SPACING.lg,
  },
  cacheName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: SPACING.lg,
    textAlign: 'center',
  },
  distanceBadge: { marginTop: SPACING.md },
  compassWrap: { alignItems: 'center', marginTop: SPACING.xxl },
  compassCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW,
  },
  arrow: { fontSize: 72 },
  directionText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: SPACING.md,
  },
  hint: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginTop: SPACING.sm, textAlign: 'center' },
  tip: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
  },
  arrivedBox: { marginTop: SPACING.xxl, alignItems: 'center', width: '100%' },
  arrivedText: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.success },
  actionButton: { marginTop: SPACING.lg, width: '100%' },
});
