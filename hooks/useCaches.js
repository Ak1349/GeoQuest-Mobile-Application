import { useState, useEffect, useCallback } from 'react';
import * as cacheService from '../services/cacheService';
import * as discoveryService from '../services/discoveryService';
import { calculateDistanceMeters, isWithinUnlockRadius } from '../utils/distanceCalculator';

/**
 * Loads public caches and enriches each one with the user's live distance to it,
 * whether it's currently within unlock range, and whether it's already been
 * discovered. Re-computes distance/unlock status whenever `location` changes so the
 * UI (map markers, cache list, cache details) always reflects the real GPS position.
 */
export default function useCaches({ location, userId } = {}) {
  const [caches, setCaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [publicCaches, discoveries] = await Promise.all([
        cacheService.getPublicCaches(),
        userId ? discoveryService.getUserDiscoveries(userId) : Promise.resolve([]),
      ]);
      const discoveredIds = new Set(discoveries.map((d) => d.cacheId));

      setCaches(
        publicCaches.map((cache) => ({
          ...cache,
          isDiscovered: discoveredIds.has(cache.id),
        }))
      );
    } catch (e) {
      setError('Could not load caches. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const enriched = caches.map((cache) => {
    const distanceMeters = location
      ? calculateDistanceMeters(location, { latitude: cache.latitude, longitude: cache.longitude })
      : null;
    const isUnlocked = cache.isDiscovered || (location ? isWithinUnlockRadius(location, cache) : false);

    return { ...cache, distanceMeters, isUnlocked };
  });

  const sortedByDistance = [...enriched].sort((a, b) => {
    if (a.distanceMeters == null) return 1;
    if (b.distanceMeters == null) return -1;
    return a.distanceMeters - b.distanceMeters;
  });

  return { caches: enriched, sortedByDistance, loading, error, reload: load };
}
