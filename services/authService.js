import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../config/constants';

// Local/mock authentication service.
//
// This is a deliberate, clearly-isolated fallback: the assignment allows either Firebase
// Authentication or a "clean mock/local authentication fallback that allows the application
// to be demonstrated" when Firebase cannot be configured. Users and the current session are
// persisted with AsyncStorage so login state survives app restarts, exactly like a real
// backend-backed session would from the UI's point of view.
//
// Swapping this for real Firebase Authentication later only requires changing the functions
// below - nothing in the UI/context layer needs to know how auth is implemented.

function makeId() {
  return `u_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

async function getUsers() {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
  return raw ? JSON.parse(raw) : [];
}

async function saveUsers(users) {
  await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

export async function getCurrentUser() {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return raw ? JSON.parse(raw) : null;
}

export async function register({ name, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const users = await getUsers();

  if (users.some((u) => u.email === normalizedEmail)) {
    throw new Error('An account with this email already exists.');
  }

  const newUser = {
    id: makeId(),
    name: name.trim(),
    email: normalizedEmail,
    // NOTE: this is a demo/local fallback only - passwords are never sent anywhere.
    // In a real deployment this would be replaced entirely by Firebase Authentication,
    // which handles password hashing/storage server-side.
    password,
    avatar: name.trim().charAt(0).toUpperCase(),
    totalPoints: 0,
    cachesFound: 0,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  await saveUsers(users);

  const { password: _pw, ...publicUser } = newUser;
  await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(publicUser));
  return publicUser;
}

export async function login({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const users = await getUsers();
  const found = users.find((u) => u.email === normalizedEmail);

  if (!found || found.password !== password) {
    throw new Error('Incorrect email or password.');
  }

  const { password: _pw, ...publicUser } = found;
  await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(publicUser));
  return publicUser;
}

export async function logout() {
  await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

// Public (password-stripped) list of every registered user, sorted by points
// descending - backs the global leaderboard.
export async function getAllUsersPublic() {
  const users = await getUsers();
  return users
    .map(({ password: _pw, ...publicUser }) => publicUser)
    .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
}

export async function getUserById(userId) {
  const users = await getAllUsersPublic();
  return users.find((u) => u.id === userId) || null;
}

// Applies a discovery's points/cache-count to a user's stored stats, and keeps the
// active session (CURRENT_USER) in sync if it's the same user. Kept in authService
// (rather than discoveryService) since it's the only place that owns the users list.
export async function addPointsToUser(userId, { points, cachesFoundDelta = 1 } = {}) {
  const users = await getUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) return null;

  users[index] = {
    ...users[index],
    totalPoints: (users[index].totalPoints || 0) + points,
    cachesFound: (users[index].cachesFound || 0) + cachesFoundDelta,
  };
  await saveUsers(users);

  const { password: _pw, ...publicUser } = users[index];

  const current = await getCurrentUser();
  if (current && current.id === userId) {
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(publicUser));
  }

  return publicUser;
}

export async function updateCurrentUser(patch) {
  const current = await getCurrentUser();
  if (!current) return null;

  const updated = { ...current, ...patch };
  await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updated));

  const users = await getUsers();
  const idx = users.findIndex((u) => u.id === current.id);
  if (idx !== -1) {
    users[idx] = { ...users[idx], ...patch };
    await saveUsers(users);
  }
  return updated;
}
