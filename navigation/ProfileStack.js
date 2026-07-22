import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import DiscoveryHistoryScreen from '../screens/DiscoveryHistoryScreen';
import { defaultStackScreenOptions } from './navigationTheme';

const Stack = createNativeStackNavigator();

export default function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={defaultStackScreenOptions}>
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
      <Stack.Screen name="DiscoveryHistory" component={DiscoveryHistoryScreen} options={{ title: 'My Discoveries' }} />
    </Stack.Navigator>
  );
}
