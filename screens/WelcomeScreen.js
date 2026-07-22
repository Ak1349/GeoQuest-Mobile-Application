import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, RADIUS } from '../config/theme';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';

export default function WelcomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.logo}>🗺️</Text>
        <Text style={styles.title}>GeoQuest</Text>
        <Text style={styles.subtitle}>
          Discover hidden caches, solve clues, and earn points by exploring the real world.
        </Text>

        <View style={styles.pointsRow}>
          <FeaturePill icon="📍" label="GPS Discovery" />
          <FeaturePill icon="📷" label="Photo Evidence" />
          <FeaturePill icon="🏆" label="Leaderboards" />
        </View>
      </View>

      <View style={styles.actions}>
        <PrimaryButton title="Log In" onPress={() => navigation.navigate('Login')} />
        <SecondaryButton
          title="Create Account"
          onPress={() => navigation.navigate('Register')}
          style={styles.registerButton}
        />
      </View>
    </SafeAreaView>
  );
}

function FeaturePill({ icon, label }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillIcon}>{icon}</Text>
      <Text style={styles.pillLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    justifyContent: 'space-between',
    padding: SPACING.lg,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 72,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.textInverse,
    marginTop: SPACING.md,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: '#C7D2E3',
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 22,
  },
  pointsRow: {
    flexDirection: 'row',
    marginTop: SPACING.xl,
    gap: SPACING.sm,
  },
  pill: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
  },
  pillIcon: {
    fontSize: FONT_SIZES.lg,
  },
  pillLabel: {
    color: COLORS.textInverse,
    fontSize: FONT_SIZES.xs,
    marginTop: 2,
  },
  actions: {
    paddingBottom: SPACING.lg,
  },
  registerButton: {
    marginTop: SPACING.md,
    borderColor: COLORS.textInverse,
  },
});
