import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../config/constants';

// Private Event Mode data access layer. Events are user-created, invite-code-gated
// groups with their own scoped caches/leaderboard - entirely local/AsyncStorage backed,
// same "swap later for a real backend" design as the other services.

function makeEventId() {
  return `event_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

function makeInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous 0/O/1/I
  let code = '';
  for (let i = 0; i < 6; i += 1) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function getAllEvents() {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.EVENTS);
  return raw ? JSON.parse(raw) : [];
}

async function saveEvents(events) {
  await AsyncStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
}

async function getAllParticipants() {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.EVENT_PARTICIPANTS);
  return raw ? JSON.parse(raw) : [];
}

async function saveParticipants(participants) {
  await AsyncStorage.setItem(STORAGE_KEYS.EVENT_PARTICIPANTS, JSON.stringify(participants));
}

export { getAllEvents };

export async function getEventById(eventId) {
  const events = await getAllEvents();
  return events.find((e) => e.id === eventId) || null;
}

export async function getEventParticipants(eventId) {
  const participants = await getAllParticipants();
  return participants.filter((p) => p.eventId === eventId);
}

export async function isParticipant(eventId, userId) {
  const participants = await getEventParticipants(eventId);
  return participants.some((p) => p.userId === userId);
}

// Events a user owns or has joined - shown on the Events tab.
export async function getUserEvents(userId) {
  const [events, participants] = await Promise.all([getAllEvents(), getAllParticipants()]);
  const joinedEventIds = new Set(
    participants.filter((p) => p.userId === userId).map((p) => p.eventId)
  );
  return events.filter((e) => e.ownerId === userId || joinedEventIds.has(e.id));
}

export async function createEvent({ name, description, startDate, endDate, ownerId }) {
  const events = await getAllEvents();
  const newEvent = {
    id: makeEventId(),
    name: name.trim(),
    description: description?.trim() || '',
    startDate: startDate || null,
    endDate: endDate || null,
    ownerId,
    inviteCode: makeInviteCode(),
    createdAt: new Date().toISOString(),
  };
  events.push(newEvent);
  await saveEvents(events);

  // Owners are automatically participants of their own event.
  const participants = await getAllParticipants();
  participants.push({ eventId: newEvent.id, userId: ownerId, joinedAt: new Date().toISOString() });
  await saveParticipants(participants);

  return newEvent;
}

export async function joinEventByCode(code, userId) {
  const normalizedCode = code.trim().toUpperCase();
  const events = await getAllEvents();
  const event = events.find((e) => e.inviteCode === normalizedCode);

  if (!event) {
    throw new Error('No event found with that invite code.');
  }

  const alreadyJoined = await isParticipant(event.id, userId);
  if (!alreadyJoined) {
    const participants = await getAllParticipants();
    participants.push({ eventId: event.id, userId, joinedAt: new Date().toISOString() });
    await saveParticipants(participants);
  }

  return event;
}
