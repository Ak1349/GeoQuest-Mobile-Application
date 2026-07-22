import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOW } from '../config/theme';
import LoadingScreen from '../components/LoadingScreen';
import EmptyState from '../components/EmptyState';
import useAuth from '../hooks/useAuth';
import * as leaderboardService from '../services/leaderboardService';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function LeaderboardScreen() {
  const { user } = useAuth();
  const [players, setPlayers] = useState(null);

  const load = useCallback(() => {
    leaderboardService.getGlobalLeaderboard().then(setPlayers);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (players === null) return <LoadingScreen message="Loading leaderboard..." />;

  if (players.length === 0) {
    return <EmptyState icon="🏆" title="No players yet" message="Be the first to discover a cache!" />;
  }

  return (
    <FlatList
      data={players}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={false} onRefresh={load} />}
      renderItem={({ item, index }) => (
        <View style={[styles.row, item.id === user?.id && styles.rowHighlight]}>
          <Text style={styles.rank}>{MEDALS[index] || `#${index + 1}`}</Text>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.avatar}</Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
              {item.id === user?.id ? ' (You)' : ''}
            </Text>
            <Text style={styles.caches}>{item.cachesFound || 0} caches found</Text>
          </View>
          <Text style={styles.points}>{item.totalPoints || 0} pts</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: SPACING.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOW,
  },
  rowHighlight: { borderWidth: 2, borderColor: COLORS.accent },
  rank: { fontSize: FONT_SIZES.md, width: 36, textAlign: 'center' },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  avatarText: { color: COLORS.accent, fontWeight: '800' },
  info: { flex: 1 },
  name: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  caches: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginTop: 2 },
  points: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.accentDark },
});
