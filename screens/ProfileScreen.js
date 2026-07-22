import { View, Text, StyleSheet, Alert } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOW } from '../config/theme';
import SecondaryButton from '../components/SecondaryButton';
import useAuth from '../hooks/useAuth';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();

  function handleLogout() {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: logout },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.avatar || '?'}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.statsRow}>
        <Stat label="Points" value={user?.totalPoints ?? 0} />
        <Stat label="Caches Found" value={user?.cachesFound ?? 0} />
        <Stat label="Rank" value="—" />
      </View>

      <View style={styles.actions}>
        <SecondaryButton
          title="Discovery History"
          onPress={() => navigation.navigate('DiscoveryHistory')}
        />
        <SecondaryButton
          title="Settings"
          onPress={() => navigation.navigate('Settings')}
          style={styles.spaced}
        />
        <SecondaryButton
          title="Log Out"
          onPress={handleLogout}
          style={[styles.spaced, styles.logout]}
        />
      </View>
    </View>
  );
}

function Stat({ label, value }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.lg },
  header: { alignItems: 'center', marginTop: SPACING.lg },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: COLORS.accent, fontSize: FONT_SIZES.xxl, fontWeight: '800' },
  name: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text, marginTop: SPACING.md },
  email: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted, marginTop: 2 },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginTop: SPACING.xl,
    ...SHADOW,
  },
  stat: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.primary },
  statLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginTop: 2 },
  actions: { marginTop: SPACING.xl },
  spaced: { marginTop: SPACING.md },
  logout: { borderColor: COLORS.danger },
});
