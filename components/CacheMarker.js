import { View, Text, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { COLORS } from '../config/theme';
import { getCacheStatus } from '../utils/cacheStatus';

const STATUS_STYLE = {
  discovered: { background: COLORS.discovered, icon: '✅' },
  unlocked: { background: COLORS.unlocked, icon: '🔓' },
  locked: { background: COLORS.locked, icon: '🔒' },
};

// Custom map marker whose colour + icon reflect the cache's real status
// (locked/unlocked/discovered), driven by the same getCacheStatus() helper used
// everywhere else so the map, cards, and details screen never disagree.
export default function CacheMarker({ cache, onPress }) {
  const status = getCacheStatus(cache);
  const { background, icon } = STATUS_STYLE[status];

  return (
    <Marker
      coordinate={{ latitude: cache.latitude, longitude: cache.longitude }}
      onPress={onPress}
      accessibilityLabel={`${cache.title}, ${status}`}
      tracksViewChanges={false}
    >
      <View style={[styles.pin, { backgroundColor: background }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  pin: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  icon: { fontSize: 16 },
});
