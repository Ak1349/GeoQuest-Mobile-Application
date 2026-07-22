import { useState, useEffect, useRef, useCallback } from 'react';
import * as Location from 'expo-location';

export const LOCATION_STATUS = {
  LOADING: 'loading',
  GRANTED: 'granted',
  PERMISSION_DENIED: 'permission_denied',
  PERMISSION_DENIED_PERMANENTLY: 'permission_denied_permanently',
  SERVICES_DISABLED: 'services_disabled',
  ERROR: 'error',
};

/**
 * Wraps expo-location to provide a live, continuously-updating GPS position plus a
 * clear status for every failure mode the assignment requires us to handle:
 * permission denied, permanently denied, GPS disabled, and unavailable/error.
 *
 * Deliberately keeps a fairly relaxed update interval (see options below) - the
 * assignment asks us to avoid excessive GPS polling for battery/performance reasons.
 */
export default function useLocation({ enabled = true } = {}) {
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState(LOCATION_STATUS.LOADING);
  const [errorMessage, setErrorMessage] = useState(null);
  const subscriptionRef = useRef(null);

  const start = useCallback(async () => {
    setStatus(LOCATION_STATUS.LOADING);
    setErrorMessage(null);

    try {
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        setStatus(LOCATION_STATUS.SERVICES_DISABLED);
        setErrorMessage('Location services are turned off on this device. Please enable GPS.');
        return;
      }

      const { status: permissionStatus, canAskAgain } =
        await Location.requestForegroundPermissionsAsync();

      if (permissionStatus !== 'granted') {
        setStatus(
          canAskAgain
            ? LOCATION_STATUS.PERMISSION_DENIED
            : LOCATION_STATUS.PERMISSION_DENIED_PERMANENTLY
        );
        setErrorMessage(
          canAskAgain
            ? 'GeoQuest needs location access to find nearby caches and check proximity.'
            : 'Location permission was permanently denied. Please enable it in your device settings.'
        );
        return;
      }

      // Get a first fix immediately so the UI isn't stuck on "loading" while waiting
      // for the watch callback to fire.
      const initial = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation(initial.coords);
      setStatus(LOCATION_STATUS.GRANTED);

      subscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 4000, // ms - avoids excessive GPS polling/battery drain
          distanceInterval: 5, // metres
        },
        (update) => {
          setLocation(update.coords);
        }
      );
    } catch (e) {
      setStatus(LOCATION_STATUS.ERROR);
      setErrorMessage('Unable to get your location right now. Please try again.');
    }
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;
    start();
    return () => {
      subscriptionRef.current?.remove();
      subscriptionRef.current = null;
    };
  }, [enabled, start]);

  return {
    location, // { latitude, longitude, accuracy, ... } | null
    status,
    errorMessage,
    isLoading: status === LOCATION_STATUS.LOADING,
    retry: start,
  };
}
