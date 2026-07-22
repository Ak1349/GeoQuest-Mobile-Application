import { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOW } from '../config/theme';
import LoadingScreen from '../components/LoadingScreen';
import ErrorMessage from '../components/ErrorMessage';
import PrimaryButton from '../components/PrimaryButton';
import useAuth from '../hooks/useAuth';
import useLocation, { LOCATION_STATUS } from '../hooks/useLocation';
import * as cacheService from '../services/cacheService';
import * as discoveryService from '../services/discoveryService';
import * as authService from '../services/authService';
import { isWithinUnlockRadius } from '../utils/distanceCalculator';

// The last real GPS gate before a discovery is recorded: even if a user reaches this
// screen, we re-check their live distance so a discovery can never be logged from
// somewhere they aren't actually standing (no "unlock from anywhere" shortcuts).
export default function CacheDiscoveryScreen({ route, navigation }) {
  const { cacheId } = route.params;
  const { user, refreshUser } = useAuth();
  const { location, status } = useLocation();
  const [cache, setCache] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    cacheService
      .getCacheById(cacheId)
      .then((found) => {
        if (!isMounted) return;
        if (!found) setError('This cache could not be found.');
        else setCache(found);
      })
      .catch(() => isMounted && setError('Could not load this cache.'))
      .finally(() => isMounted && setLoading(false));
    return () => {
      isMounted = false;
    };
  }, [cacheId]);

  if (loading || status === LOCATION_STATUS.LOADING) {
    return <LoadingScreen message="Confirming your location..." />;
  }
  if (error || !cache) return <ErrorMessage message={error || 'Cache not found.'} />;

  const withinRange = isWithinUnlockRadius(location, cache);

  if (!withinRange) {
    return (
      <ErrorMessage
        title="Too far away"
        message={`You need to be within ${cache.unlockRadius}m of this cache to discover it. Head back to the map and navigate there.`}
      />
    );
  }

  async function handleConfirm() {
    setSubmitting(true);
    setError(null);
    try {
      const discovery = await discoveryService.recordDiscovery({ userId: user.id, cache, photoUri: null });
      await authService.addPointsToUser(user.id, { points: discovery.pointsEarned });
      await refreshUser();
      navigation.replace('DiscoverySuccess', {
        cacheTitle: cache.title,
        breakdown: discovery.pointsBreakdown,
        photoUri: null,
      });
    } catch (e) {
      setError(e.message || 'Could not record this discovery.');
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.arrived}>🎯 You made it!</Text>
      <Text style={styles.title}>{cache.title}</Text>

      <View style={styles.clueBox}>
        <Text style={styles.clueLabel}>THE CLUE</Text>
        <Text style={styles.clueText}>{cache.clue}</Text>
      </View>

      {cache.photoRequired ? (
        <>
          <Text style={styles.note}>📷 This cache requires photo evidence to complete.</Text>
          <PrimaryButton
            title="Take Photo Evidence"
            onPress={() => navigation.replace('CameraEvidence', { cacheId: cache.id })}
            style={styles.actionButton}
          />
        </>
      ) : (
        <PrimaryButton
          title="Confirm Discovery"
          onPress={handleConfirm}
          loading={submitting}
          style={styles.actionButton}
        />
      )}

      {error ? <ErrorMessage message={error} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.lg },
  arrived: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.success, marginTop: SPACING.lg },
  title: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.primary, marginTop: SPACING.xs },
  clueBox: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginTop: SPACING.xl,
    ...SHADOW,
  },
  clueLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 1 },
  clueText: { fontSize: FONT_SIZES.md, color: COLORS.text, marginTop: SPACING.sm, fontStyle: 'italic', lineHeight: 22 },
  note: { fontSize: FONT_SIZES.sm, color: COLORS.accentDark, marginTop: SPACING.xl },
  actionButton: { marginTop: SPACING.xl },
});
