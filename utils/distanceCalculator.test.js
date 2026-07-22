import {
  calculateDistanceMeters,
  isWithinUnlockRadius,
  calculateBearing,
} from './distanceCalculator';

const KINGSTON = { latitude: 51.4085, longitude: -0.3064 };
// Roughly 111m north of KINGSTON (1 degree of latitude ~= 111km).
const NEARBY_POINT = { latitude: 51.4095, longitude: -0.3064 };

describe('calculateDistanceMeters', () => {
  it('returns 0 for identical coordinates', () => {
    expect(calculateDistanceMeters(KINGSTON, KINGSTON)).toBeCloseTo(0, 5);
  });

  it('returns null when either coordinate is missing', () => {
    expect(calculateDistanceMeters(null, KINGSTON)).toBeNull();
    expect(calculateDistanceMeters(KINGSTON, null)).toBeNull();
  });

  it('calculates a realistic distance between two nearby points', () => {
    const distance = calculateDistanceMeters(KINGSTON, NEARBY_POINT);
    // ~0.001 degrees latitude is roughly 111 metres.
    expect(distance).toBeGreaterThan(100);
    expect(distance).toBeLessThan(120);
  });
});

describe('isWithinUnlockRadius', () => {
  const cache = { latitude: KINGSTON.latitude, longitude: KINGSTON.longitude, unlockRadius: 50 };

  it('returns true when the user is standing on the cache', () => {
    expect(isWithinUnlockRadius(KINGSTON, cache)).toBe(true);
  });

  it('returns false when the user is far outside the unlock radius', () => {
    expect(isWithinUnlockRadius(NEARBY_POINT, cache)).toBe(false);
  });

  it('returns false when location is missing', () => {
    expect(isWithinUnlockRadius(null, cache)).toBe(false);
  });
});

describe('calculateBearing', () => {
  it('returns a bearing close to 0 (north) for a point directly north', () => {
    const bearing = calculateBearing(KINGSTON, NEARBY_POINT);
    expect(bearing).toBeGreaterThanOrEqual(0);
    expect(bearing).toBeLessThan(10);
  });

  it('returns null when either coordinate is missing', () => {
    expect(calculateBearing(null, KINGSTON)).toBeNull();
  });
});
