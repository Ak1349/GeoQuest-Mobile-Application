import AsyncStorage from '@react-native-async-storage/async-storage';
import { MOCK_CACHES } from '../data/caches';
import { STORAGE_KEYS } from '../config/constants';

// Cache data access layer. Public/mock caches ship with the app; user-created
// (event) caches are persisted locally with AsyncStorage. Kept as a single service
// so a later Firestore-backed implementation only needs to change this file.

async function getCustomCaches() {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.CUSTOM_CACHES);
  return raw ? JSON.parse(raw) : [];
}

export async function getAllCaches() {
  const customCaches = await getCustomCaches();
  return [...MOCK_CACHES, ...customCaches];
}

export async function getPublicCaches() {
  const all = await getAllCaches();
  return all.filter((cache) => cache.isPublic && !cache.eventId);
}

export async function getEventCaches(eventId) {
  const all = await getAllCaches();
  return all.filter((cache) => cache.eventId === eventId);
}

export async function getCacheById(cacheId) {
  const all = await getAllCaches();
  return all.find((cache) => cache.id === cacheId) || null;
}

function makeCacheId() {
  return `cache_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

export async function createCache(cacheData) {
  const customCaches = await getCustomCaches();
  const newCache = {
    id: makeCacheId(),
    isPublic: !cacheData.eventId,
    createdAt: new Date().toISOString(),
    ...cacheData,
  };
  customCaches.push(newCache);
  await AsyncStorage.setItem(STORAGE_KEYS.CUSTOM_CACHES, JSON.stringify(customCaches));
  return newCache;
}
