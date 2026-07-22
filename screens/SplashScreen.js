import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../config/theme';
import LoadingScreen from '../components/LoadingScreen';

// Shown briefly on app start while AuthContext checks AsyncStorage for a saved session.
export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🗺️</Text>
      <Text style={styles.title}>GeoQuest</Text>
      <Text style={styles.subtitle}>Location-based treasure hunting</Text>
      <View style={styles.loadingWrap}>
        <LoadingScreen message="Starting up..." />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  logo: {
    fontSize: 64,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.textInverse,
    marginTop: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.accent,
    marginTop: SPACING.xs,
  },
  loadingWrap: {
    marginTop: SPACING.xxl,
  },
});
