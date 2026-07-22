import { useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOW } from '../config/theme';
import { DEFAULT_REGION, DIFFICULTY } from '../config/constants';
import LoadingScreen from '../components/LoadingScreen';
import ErrorMessage from '../components/ErrorMessage';
import PrimaryButton from '../components/PrimaryButton';
import CacheMarker from '../components/CacheMarker';
import DistanceBadge from '../components/DistanceBadge';
import PointsBadge from '../components/PointsBadge';
import CacheStatusBadge from '../components/CacheStatusBadge';
import useAuth from '../hooks/useAuth';
import useLocation, { LOCATION_STATUS } from '../hooks/useLocation';
import useCaches from '../hooks/useCaches';
import { getCacheStatus } from '../utils/cacheStatus';

const LOCATION_ERROR_TITLES = {
  [LOCATION_STATUS.PERMISSION_DENIED]: 'Location permission needed',
  [LOCATION_STATUS.PERMISSION_DENIED_PERMANENTLY]: 'Location permission blocked',
  [LOCATION_STATUS.SERVICES_DISABLED]: 'GPS is turned off',
  [LOCATION_STATUS.ERROR]: 'Location unavailable',
};

export default function MapScreen({ navigation }) {
  const { user } = useAuth();
  const { location, status, errorMessage, retry } = useLocation();
  const { caches, sortedByDistance, loading, reload } = useCaches({ location, userId: user?.id });
  const [selectedCache, setSelectedCache] = useState(null);
  const [difficultyFilter, setDifficultyFilter] = useState(null); // null = all
  const [sortNearest, setSortNearest] = useState(false);
  const mapRef = useRef(null);
  const hasCenteredRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  // Centre the map on the user's location once we get a first fix, without fighting
  // the user if they've since panned/zoomed around manually.
  if (location && !hasCenteredRef.current) {
    hasCenteredRef.current = true;
    requestAnimationFrame(() => {
      mapRef.current?.animateToRegion(
        {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        400
      );
    });
  }

  function goToMyLocation() {
    if (!location) return;
    mapRef.current?.animateToRegion(
      {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      400
    );
  }

  const isLocationBlocked =
    status !== LOCATION_STATUS.LOADING && status !== LOCATION_STATUS.GRANTED;

  const baseCaches = sortNearest ? sortedByDistance : caches;
  const visibleCaches = difficultyFilter
    ? baseCaches.filter((cache) => cache.difficulty === difficultyFilter)
    : baseCaches;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={DEFAULT_REGION}
        showsUserLocation={false}
        showsMyLocationButton={false}
        onPress={() => setSelectedCache(null)}
      >
        {location ? (
          <Marker
            coordinate={location}
            anchor={{ x: 0.5, y: 0.5 }}
            accessibilityLabel="Your current location"
          >
            <View style={styles.userDot} />
          </Marker>
        ) : null}

        {visibleCaches.map((cache) => (
          <CacheMarker key={cache.id} cache={cache} onPress={() => setSelectedCache(cache)} />
        ))}
      </MapView>

      {status === LOCATION_STATUS.LOADING ? (
        <View style={styles.overlay}>
          <LoadingScreen message="Getting your location..." />
        </View>
      ) : null}

      {isLocationBlocked ? (
        <View style={styles.overlayTop}>
          <ErrorMessage
            title={LOCATION_ERROR_TITLES[status] || 'Location unavailable'}
            message={errorMessage}
            onRetry={status === LOCATION_STATUS.PERMISSION_DENIED_PERMANENTLY ? Linking.openSettings : retry}
            retryLabel={status === LOCATION_STATUS.PERMISSION_DENIED_PERMANENTLY ? 'Open Settings' : 'Try again'}
          />
        </View>
      ) : null}

      <Pressable
        onPress={goToMyLocation}
        style={styles.myLocationButton}
        accessibilityRole="button"
        accessibilityLabel="Centre map on my location"
      >
        <Text style={styles.myLocationIcon}>📍</Text>
      </Pressable>

      {!isLocationBlocked ? (
        <View style={styles.filterBar} pointerEvents="box-none">
          <FilterChip
            label="All"
            active={!difficultyFilter}
            onPress={() => setDifficultyFilter(null)}
          />
          {Object.values(DIFFICULTY).map((diff) => (
            <FilterChip
              key={diff}
              label={diff.charAt(0).toUpperCase() + diff.slice(1)}
              active={difficultyFilter === diff}
              onPress={() => setDifficultyFilter(difficultyFilter === diff ? null : diff)}
            />
          ))}
          <FilterChip
            label="Nearest first"
            active={sortNearest}
            onPress={() => setSortNearest((v) => !v)}
          />
        </View>
      ) : null}

      {selectedCache ? (
        <CacheBottomSheet
          cache={selectedCache}
          onClose={() => setSelectedCache(null)}
          onViewDetails={() =>
            navigation.navigate('CacheDetails', { cacheId: selectedCache.id })
          }
        />
      ) : null}

      {loading && !selectedCache ? (
        <View style={styles.loadingPill}>
          <Text style={styles.loadingPillText}>Loading caches...</Text>
        </View>
      ) : null}
    </View>
  );
}

function CacheBottomSheet({ cache, onClose, onViewDetails }) {
  const status = getCacheStatus(cache);
  return (
    <View style={styles.sheet}>
      <View style={styles.sheetHeaderRow}>
        <Text style={styles.sheetTitle} numberOfLines={1}>
          {cache.title}
        </Text>
        <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close">
          <Text style={styles.close}>✕</Text>
        </Pressable>
      </View>
      <Text style={styles.sheetDescription} numberOfLines={2}>
        {cache.description}
      </Text>
      <View style={styles.sheetBadgeRow}>
        <PointsBadge points={cache.points} difficulty={cache.difficulty} />
        <DistanceBadge meters={cache.distanceMeters} />
        <CacheStatusBadge status={status} />
      </View>
      <PrimaryButton title="View Details" onPress={onViewDetails} style={styles.sheetButton} />
    </View>
  );
}

function FilterChip({ label, active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={`Filter: ${label}${active ? ', selected' : ''}`}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  userDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.info,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(245,246,250,0.9)',
  },
  overlayTop: {
    position: 'absolute',
    top: SPACING.lg,
    left: 0,
    right: 0,
  },
  myLocationButton: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.xl,
    backgroundColor: COLORS.surface,
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW,
  },
  myLocationIcon: { fontSize: 22 },
  filterBar: {
    position: 'absolute',
    top: SPACING.lg,
    left: SPACING.lg,
    right: SPACING.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  chip: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.text },
  chipTextActive: { color: COLORS.textInverse },
  loadingPill: {
    position: 'absolute',
    top: SPACING.lg,
    alignSelf: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
  },
  loadingPillText: { color: COLORS.textInverse, fontSize: FONT_SIZES.xs, fontWeight: '600' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOW,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sheetTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.primary, flex: 1 },
  close: { fontSize: FONT_SIZES.lg, color: COLORS.textMuted, paddingLeft: SPACING.md },
  sheetDescription: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted, marginTop: SPACING.xs },
  sheetBadgeRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginTop: SPACING.md,
    flexWrap: 'wrap',
  },
  sheetButton: { marginTop: SPACING.lg },
});
