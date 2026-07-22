// Haversine formula: calculates the great-circle distance between two lat/lng points.
// Pure function (no I/O, no React) so it's easy to unit test and to reason about during
// a viva - this is the single source of truth for "how far is the user from a cache",
// which is what all proximity/unlock decisions are based on.

const EARTH_RADIUS_METERS = 6371000;

function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

/**
 * Returns the distance between two coordinates in metres.
 * @param {{latitude:number, longitude:number}} from
 * @param {{latitude:number, longitude:number}} to
 */
export function calculateDistanceMeters(from, to) {
  if (!from || !to) return null;

  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);
  const deltaLat = toRadians(to.latitude - from.latitude);
  const deltaLon = toRadians(to.longitude - from.longitude);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
}

/**
 * The actual real unlock condition used everywhere in the app: a cache is only
 * unlocked when the user's live GPS distance to it is within its unlockRadius.
 * There is deliberately no other way to unlock a cache.
 */
export function isWithinUnlockRadius(userLocation, cache) {
  if (!userLocation || !cache) return false;
  const distance = calculateDistanceMeters(userLocation, {
    latitude: cache.latitude,
    longitude: cache.longitude,
  });
  if (distance == null) return false;
  return distance <= cache.unlockRadius;
}

/**
 * Compass bearing in degrees (0-360, 0 = North) from `from` towards `to`.
 * Used by the treasure compass to point toward the selected cache.
 */
export function calculateBearing(from, to) {
  if (!from || !to) return null;

  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);
  const deltaLon = toRadians(to.longitude - from.longitude);

  const y = Math.sin(deltaLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon);
  const bearing = (Math.atan2(y, x) * 180) / Math.PI;

  return (bearing + 360) % 360;
}
