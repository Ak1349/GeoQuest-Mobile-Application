// Single source of truth for turning a cache's derived flags (isDiscovered/isUnlocked)
// into the three visual states used across the map, cards, and details screen.
export function getCacheStatus(cache) {
  if (cache.isDiscovered) return 'discovered';
  if (cache.isUnlocked) return 'unlocked';
  return 'locked';
}
