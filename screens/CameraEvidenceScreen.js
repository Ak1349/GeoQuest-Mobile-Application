import { useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, Linking } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { COLORS, SPACING, FONT_SIZES } from '../config/theme';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import ErrorMessage from '../components/ErrorMessage';
import LoadingScreen from '../components/LoadingScreen';
import useAuth from '../hooks/useAuth';
import * as cacheService from '../services/cacheService';
import * as discoveryService from '../services/discoveryService';
import * as authService from '../services/authService';

export default function CameraEvidenceScreen({ route, navigation }) {
  const { cacheId } = route.params;
  const { user, refreshUser } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [photoUri, setPhotoUri] = useState(null);
  const [capturing, setCapturing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!permission) return <LoadingScreen message="Checking camera permission..." />;

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.permissionTitle}>📷 Camera access needed</Text>
        <Text style={styles.permissionText}>
          GeoQuest needs your camera to capture photo evidence for this cache.
        </Text>
        {permission.canAskAgain ? (
          <PrimaryButton title="Grant Camera Access" onPress={requestPermission} style={styles.grantButton} />
        ) : (
          <>
            <Text style={[styles.permissionText, styles.permissionTextSpaced]}>
              Camera access was previously denied. Please enable it for GeoQuest in your
              device settings, then come back to this screen.
            </Text>
            <PrimaryButton title="Open Settings" onPress={() => Linking.openSettings()} style={styles.grantButton} />
          </>
        )}
      </View>
    );
  }

  async function handleCapture() {
    if (!cameraRef.current || !isCameraReady || capturing) return;
    setCapturing(true);
    setError(null);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.6 });
      setPhotoUri(photo.uri);
    } catch (e) {
      setError('Could not take the photo. Please try again.');
    } finally {
      setCapturing(false);
    }
  }

  async function handleConfirm() {
    setSubmitting(true);
    setError(null);
    try {
      const cache = await cacheService.getCacheById(cacheId);
      const discovery = await discoveryService.recordDiscovery({ userId: user.id, cache, photoUri });
      await authService.addPointsToUser(user.id, { points: discovery.pointsEarned });
      await refreshUser();
      navigation.replace('DiscoverySuccess', {
        cacheTitle: cache.title,
        breakdown: discovery.pointsBreakdown,
        photoUri,
      });
    } catch (e) {
      setError(e.message || 'Could not record this discovery.');
      setSubmitting(false);
    }
  }

  if (photoUri) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: photoUri }} style={styles.preview} />
        {error ? <ErrorMessage message={error} /> : null}
        <View style={styles.reviewActions}>
          <SecondaryButton
            title="Retake"
            onPress={() => setPhotoUri(null)}
            disabled={submitting}
            style={styles.halfButton}
          />
          <PrimaryButton
            title="Confirm"
            onPress={handleConfirm}
            loading={submitting}
            style={[styles.halfButton, styles.gapLeft]}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        onCameraReady={() => setIsCameraReady(true)}
        onMountError={() => setError('The camera could not be started on this device.')}
      />
      {!isCameraReady && !error ? (
        <View style={styles.readyOverlay}>
          <LoadingScreen message="Starting camera..." />
        </View>
      ) : null}
      <View style={styles.captureRow}>
        {error ? <ErrorMessage message={error} /> : null}
        <PrimaryButton
          title="Capture Photo"
          onPress={handleCapture}
          loading={capturing}
          disabled={!isCameraReady || capturing}
          style={styles.captureButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  permissionTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.primary },
  permissionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  permissionTextSpaced: { marginTop: SPACING.lg },
  grantButton: { marginTop: SPACING.xl, width: '100%' },
  camera: { flex: 1 },
  readyOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.background,
  },
  captureRow: { padding: SPACING.lg, backgroundColor: COLORS.background },
  captureButton: {},
  preview: { flex: 1 },
  reviewActions: { flexDirection: 'row', padding: SPACING.lg },
  halfButton: { flex: 1 },
  gapLeft: { marginLeft: SPACING.sm },
});
