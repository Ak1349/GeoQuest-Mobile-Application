import Constants from 'expo-constants';

// Kingston University, Penrhyn Road campus - used as the default map region and as the
// centre point for generated mock cache data so the demo makes sense for markers/viva.
export const DEFAULT_REGION = {
  latitude: 51.4085,
  longitude: -0.3064,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

export const DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
  EXPERT: 'expert',
};

export const DIFFICULTY_POINTS = {
  [DIFFICULTY.EASY]: 50,
  [DIFFICULTY.MEDIUM]: 100,
  [DIFFICULTY.HARD]: 200,
  [DIFFICULTY.EXPERT]: 500,
};

export const BONUS_POINTS = {
  firstDiscoverer: 50,
  photoEvidence: 25,
  eventCompletion: 100,
};

// Read from app.config.js `extra.devMode` (backed by EXPO_PUBLIC_DEV_MODE in .env).
// This only ever affects developer-only conveniences (e.g. the map "teleport" tool) -
// it never changes the real GPS distance formula used to unlock caches.
export const DEV_MODE_ENABLED = Boolean(Constants.expoConfig?.extra?.devMode);

export const STORAGE_KEYS = {
  CURRENT_USER: 'geoquest.currentUser',
  USERS: 'geoquest.users',
  DISCOVERIES: 'geoquest.discoveries',
  EVENTS: 'geoquest.events',
  EVENT_PARTICIPANTS: 'geoquest.eventParticipants',
  CUSTOM_CACHES: 'geoquest.customCaches',
  SETTINGS: 'geoquest.settings',
};

export const UNITS = {
  METRIC: 'metric',
  IMPERIAL: 'imperial',
};
