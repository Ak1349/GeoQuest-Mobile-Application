import { View, Text, StyleSheet, Switch } from 'react-native';
import Constants from 'expo-constants';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOW } from '../config/theme';
import useSettings from '../hooks/useSettings';
import { UNITS } from '../config/constants';

export default function SettingsScreen() {
  const { settings, updateSettings } = useSettings();

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Preferences</Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Distance Units</Text>
          <View style={styles.unitToggle}>
            <UnitOption
              label="Metric"
              active={settings.units === UNITS.METRIC}
              onPress={() => updateSettings({ units: UNITS.METRIC })}
            />
            <UnitOption
              label="Imperial"
              active={settings.units === UNITS.IMPERIAL}
              onPress={() => updateSettings({ units: UNITS.IMPERIAL })}
            />
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Notifications</Text>
          <Switch
            value={settings.notificationsEnabled}
            onValueChange={(value) => updateSettings({ notificationsEnabled: value })}
          />
        </View>
      </View>

      <Text style={styles.sectionTitle}>About</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>App Version</Text>
          <Text style={styles.rowValue}>{Constants.expoConfig?.version || '1.0.0'}</Text>
        </View>
      </View>
    </View>
  );
}

function UnitOption({ label, active, onPress }) {
  return (
    <Text
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[styles.unitOption, active && styles.unitOptionActive]}
    >
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.lg },
  sectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOW,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  rowLabel: { fontSize: FONT_SIZES.sm, color: COLORS.text, fontWeight: '600' },
  rowValue: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted },
  divider: { height: 1, backgroundColor: COLORS.border },
  unitToggle: { flexDirection: 'row', gap: SPACING.xs },
  unitOption: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.full,
    paddingVertical: 6,
    paddingHorizontal: SPACING.sm,
    overflow: 'hidden',
  },
  unitOptionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    color: COLORS.textInverse,
  },
});
