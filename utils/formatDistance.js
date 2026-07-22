// Turns a raw metre value into a short, human-friendly string for badges/cards.
// Respects the user's metric/imperial unit preference (see SettingsScreen).
export function formatDistance(meters, units = 'metric') {
  if (meters == null || Number.isNaN(meters)) return '—';

  if (units === 'imperial') {
    const feet = meters * 3.28084;
    if (feet < 1000) return `${Math.round(feet)}ft`;
    return `${(feet / 5280).toFixed(1)}mi`;
  }

  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

// Turns a bearing in degrees into an 8-point compass direction (used by the treasure compass).
export function formatDirection(bearingDegrees) {
  if (bearingDegrees == null) return '';
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(bearingDegrees / 45) % 8;
  return directions[index];
}
