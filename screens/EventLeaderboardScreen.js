import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOW } from '../config/theme';
import LoadingScreen from '../components/LoadingScreen';
import EmptyState from '../components/EmptyState';
import useAuth from '../hooks/useAuth';
import * as leaderboardService from '../services/leaderboardService';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function EventLeaderboardScreen({ route }) {
  const { eventId } = route.params;
  const { user } = useAuth();
  const [rows, setRows] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      leaderboardService.getEventLeaderboard(eventId).then((result) => {
        if (isMounted) setRows(result);
      });
      return () => {
        isMounted = false;
      };
    }, [eventId])
  );

  if (rows === null) return <LoadingScreen message="Loading leaderboard..." />;
  if (rows.length === 0) {
    return <EmptyState icon="🏆" title="No rankings yet" message="No one has scored in this event yet." />;
  }

  return (
    <FlatList
      data={rows}
      keyExtractor={(item) => item.userId}
      contentContainerStyle={styles.list}
      renderItem={({ item, index }) => (
        <View style={[styles.row, item.userId === user?.id && styles.rowHighlight]}>
          <Text style={styles.rank}>{MEDALS[index] || `#${index + 1}`}</Text>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
            {item.userId === user?.id ? ' (You)' : ''}
          </Text>
          <Text style={styles.points}>{item.points} pts</Text>
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
  name: { flex: 1, fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  points: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.accentDark },
});
