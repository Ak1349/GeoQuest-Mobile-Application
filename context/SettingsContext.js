import { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import * as settingsService from '../services/settingsService';
import { UNITS } from '../config/constants';

export const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    units: UNITS.METRIC,
    notificationsEnabled: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const loaded = await settingsService.getSettings();
      setSettings(loaded);
      setLoading(false);
    })();
  }, []);

  const updateSettings = useCallback(async (partial) => {
    const updated = await settingsService.updateSettings(partial);
    setSettings(updated);
    return updated;
  }, []);

  const value = useMemo(
    () => ({ settings, loading, updateSettings }),
    [settings, loading, updateSettings]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
