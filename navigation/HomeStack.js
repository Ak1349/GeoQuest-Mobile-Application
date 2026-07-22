import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import CacheDetailsScreen from '../screens/CacheDetailsScreen';
import NavigationScreen from '../screens/NavigationScreen';
import CacheDiscoveryScreen from '../screens/CacheDiscoveryScreen';
import CameraEvidenceScreen from '../screens/CameraEvidenceScreen';
import DiscoverySuccessScreen from '../screens/DiscoverySuccessScreen';
import DiscoveryHistoryScreen from '../screens/DiscoveryHistoryScreen';
import { defaultStackScreenOptions } from './navigationTheme';

const Stack = createNativeStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={defaultStackScreenOptions}>
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CacheDetails" component={CacheDetailsScreen} options={{ title: 'Cache Details' }} />
      <Stack.Screen name="Navigation" component={NavigationScreen} options={{ title: 'Navigate' }} />
      <Stack.Screen name="CacheDiscovery" component={CacheDiscoveryScreen} options={{ title: 'Discover Cache' }} />
      <Stack.Screen name="CameraEvidence" component={CameraEvidenceScreen} options={{ title: 'Photo Evidence' }} />
      <Stack.Screen name="DiscoverySuccess" component={DiscoverySuccessScreen} options={{ title: 'Success', headerBackVisible: false }} />
      <Stack.Screen name="DiscoveryHistory" component={DiscoveryHistoryScreen} options={{ title: 'My Discoveries' }} />
    </Stack.Navigator>
  );
}
