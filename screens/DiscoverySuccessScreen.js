import { View, Text, StyleSheet, Image } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOW } from '../config/theme';
import PrimaryButton from '../components/PrimaryButton';

export default function DiscoverySuccessScreen({ route, navigation }) {
  const { cacheTitle, breakdown, photoUri } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.celebration}>🏆</Text>
      <Text style={styles.title}>Cache Discovered!</Text>
      <Text style={styles.cacheName}>{cacheTitle}</Text>

      {photoUri ? <Image source={{ uri: photoUri }} style={styles.photo} /> : null}

      <View style={styles.breakdownBox}>
        <Row label="Base points" value={breakdown.basePoints} />
        {breakdown.photoBonus > 0 ? <Row label="Photo evidence bonus" value={breakdown.photoBonus} /> : null}
        {breakdown.firstDiscovererBonus > 0 ? (
          <Row label="First discoverer bonus" value={breakdown.firstDiscovererBonus} />
        ) : null}
        <View style={styles.divider} />
        <Row label="Total earned" value={breakdown.totalPoints} bold />
      </View>

      <PrimaryButton
        title="Back to Home"
        onPress={() => navigation.popToTop()}
        style={styles.actionButton}
      />
    </View>
  );
}

function Row({ label, value, bold }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, bold && styles.rowBold]}>{label}</Text>
      <Text style={[styles.rowValue, bold && styles.rowBold]}>+{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', padding: SPACING.xl },
  celebration: { fontSize: 64, marginTop: SPACING.xl },
  title: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.primary, marginTop: SPACING.md },
  cacheName: { fontSize: FONT_SIZES.md, color: COLORS.textMuted, marginTop: SPACING.xs, textAlign: 'center' },
  photo: {
    width: 160,
    height: 160,
    borderRadius: RADIUS.md,
    marginTop: SPACING.lg,
  },
  breakdownBox: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginTop: SPACING.xl,
    ...SHADOW,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  rowLabel: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted },
  rowValue: { fontSize: FONT_SIZES.sm, color: COLORS.accentDark, fontWeight: '700' },
  rowBold: { fontSize: FONT_SIZES.md, color: COLORS.primary, fontWeight: '800' },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.sm },
  actionButton: { marginTop: SPACING.xxl, width: '100%' },
});
