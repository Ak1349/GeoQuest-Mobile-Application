import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, BONUS_POINTS } from '../config/constants';

// Discovery + scoring persistence. A "discovery" is only ever created after the real
// GPS proximity check has passed (see utils/distanceCalculator.js) and, when required,
// a photo has been captured - see CacheDiscoveryScreen/CameraEvidenceScreen (Phase 7-8).
// This service is also responsible for preventing duplicate-discovery point farming.

async function getAllDiscoveries() {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.DISCOVERIES);
  return raw ? JSON.parse(raw) : [];
}

export async function getUserDiscoveries(userId) {
  const all = await getAllDiscoveries();
  return all.filter((d) => d.userId === userId);
}

export async function hasDiscovered(userId, cacheId) {
  const discoveries = await getUserDiscoveries(userId);
  return discoveries.some((d) => d.cacheId === cacheId);
}

function makeDiscoveryId() {
  return `disc_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

/**
 * Records a discovery and returns the points breakdown. Throws if the user has already
 * discovered this cache, so a user can never earn points twice for the same cache.
 */
export async function recordDiscovery({ userId, cache, photoUri }) {
  const already = await hasDiscovered(userId, cache.id);
  if (already) {
    throw new Error('You have already discovered this cache.');
  }

  const all = await getAllDiscoveries();
  const isFirstDiscoverer = !all.some((d) => d.cacheId === cache.id);

  const basePoints = cache.points;
  const photoBonus = photoUri ? BONUS_POINTS.photoEvidence : 0;
  const firstDiscovererBonus = isFirstDiscoverer ? BONUS_POINTS.firstDiscoverer : 0;
  const totalPoints = basePoints + photoBonus + firstDiscovererBonus;

  const discovery = {
    id: makeDiscoveryId(),
    userId,
    cacheId: cache.id,
    eventId: cache.eventId || null,
    photoUri: photoUri || null,
    pointsBreakdown: {
      basePoints,
      photoBonus,
      firstDiscovererBonus,
      totalPoints,
    },
    pointsEarned: totalPoints,
    discoveredAt: new Date().toISOString(),
  };

  all.push(discovery);
  await AsyncStorage.setItem(STORAGE_KEYS.DISCOVERIES, JSON.stringify(all));

  return discovery;
}

// All discoveries made within a given event - used for the event-scoped leaderboard
// and the event owner's per-participant progress view.
export async function getEventDiscoveries(eventId) {
  const all = await getAllDiscoveries();
  return all.filter((d) => d.eventId === eventId);
}

export async function getUserPointsInEvent(userId, eventId) {
  const eventDiscoveries = await getEventDiscoveries(eventId);
  return eventDiscoveries
    .filter((d) => d.userId === userId)
    .reduce((sum, d) => sum + d.pointsEarned, 0);
}
