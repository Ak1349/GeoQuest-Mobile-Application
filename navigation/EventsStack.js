import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EventsScreen from '../screens/EventsScreen';
import EventDetailsScreen from '../screens/EventDetailsScreen';
import CreateEventScreen from '../screens/CreateEventScreen';
import JoinEventScreen from '../screens/JoinEventScreen';
import EventLeaderboardScreen from '../screens/EventLeaderboardScreen';
import EventProgressScreen from '../screens/EventProgressScreen';
import CreateCacheScreen from '../screens/CreateCacheScreen';
import { defaultStackScreenOptions } from './navigationTheme';

const Stack = createNativeStackNavigator();

export default function EventsStack() {
  return (
    <Stack.Navigator screenOptions={defaultStackScreenOptions}>
      <Stack.Screen name="Events" component={EventsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EventDetails" component={EventDetailsScreen} options={{ title: 'Event' }} />
      <Stack.Screen name="CreateEvent" component={CreateEventScreen} options={{ title: 'Create Event' }} />
      <Stack.Screen name="JoinEvent" component={JoinEventScreen} options={{ title: 'Join Event' }} />
      <Stack.Screen name="EventLeaderboard" component={EventLeaderboardScreen} options={{ title: 'Event Leaderboard' }} />
      <Stack.Screen name="EventProgress" component={EventProgressScreen} options={{ title: 'Event Progress' }} />
      <Stack.Screen name="CreateCache" component={CreateCacheScreen} options={{ title: 'Create Cache' }} />
    </Stack.Navigator>
  );
}
