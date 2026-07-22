import { formatDistance, formatDirection } from './formatDistance';

describe('formatDistance', () => {
  it('returns a dash for null/NaN input', () => {
    expect(formatDistance(null)).toBe('—');
    expect(formatDistance(NaN)).toBe('—');
  });

  it('formats metric distances under 1km in metres', () => {
    expect(formatDistance(245)).toBe('245m');
  });

  it('formats metric distances of 1km or more in kilometres', () => {
    expect(formatDistance(1200)).toBe('1.2km');
  });

  it('formats imperial distances under ~305m in feet', () => {
    expect(formatDistance(100, 'imperial')).toBe('328ft');
  });

  it('formats large imperial distances in miles', () => {
    expect(formatDistance(2000, 'imperial')).toBe('1.2mi');
  });
});

describe('formatDirection', () => {
  it('returns an empty string when bearing is missing', () => {
    expect(formatDirection(null)).toBe('');
  });

  it('maps 0 degrees to North', () => {
    expect(formatDirection(0)).toBe('N');
  });

  it('maps 90 degrees to East', () => {
    expect(formatDirection(90)).toBe('E');
  });

  it('maps 180 degrees to South', () => {
    expect(formatDirection(180)).toBe('S');
  });
});
