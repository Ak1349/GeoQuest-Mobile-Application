import * as authService from './authService';
import * as eventService from './eventService';
import * as discoveryService from './discoveryService';

// Read-only aggregation layer for global and per-event rankings. Keeping this
// separate from authService/eventService/discoveryService means each screen doesn't
// have to re-implement the same "join users with points" logic.

export async function getGlobalLeaderboard() {
  return authService.getAllUsersPublic();
}

// Scoped ranking of only an event's participants, ranked by points earned within
// that event specifically (not their global total).
export async function getEventLeaderboard(eventId) {
  const participants = await eventService.getEventParticipants(eventId);

  const rows = await Promise.all(
    participants.map(async (p) => {
      const user = await authService.getUserById(p.userId);
      const eventPoints = await discoveryService.getUserPointsInEvent(p.userId, eventId);
      return {
        userId: p.userId,
        name: user?.name || 'Unknown player',
        avatar: user?.avatar || '?',
        points: eventPoints,
      };
    })
  );

  return rows.sort((a, b) => b.points - a.points);
}
