import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, UNITS } from '../config/constants';

const DEFAULT_SETTINGS = {
  units: UNITS.METRIC,
  notificationsEnabled: true,
};

export async function getSettings() {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
  return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
}

export async function updateSettings(partial) {
  const current = await getSettings();
  const updated = { ...current, ...partial };
  await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
  return updated;
}
