import { formatRelativeDate, formatDate } from './formatDate';

describe('formatRelativeDate', () => {
  it('returns an empty string for missing input', () => {
    expect(formatRelativeDate(null)).toBe('');
  });

  it('returns "Just now" for a timestamp seconds ago', () => {
    const now = new Date().toISOString();
    expect(formatRelativeDate(now)).toBe('Just now');
  });

  it('returns minutes ago for a recent timestamp', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(formatRelativeDate(fiveMinutesAgo)).toBe('5m ago');
  });

  it('returns hours ago for a timestamp from earlier today', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeDate(twoHoursAgo)).toBe('2h ago');
  });

  it('returns days ago for a timestamp from a few days back', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeDate(threeDaysAgo)).toBe('3d ago');
  });
});

describe('formatDate', () => {
  it('returns an empty string for missing input', () => {
    expect(formatDate(null)).toBe('');
  });

  it('formats an ISO date string as a short readable date', () => {
    expect(formatDate('2026-01-05T09:00:00.000Z')).toMatch(/2026/);
  });
});
