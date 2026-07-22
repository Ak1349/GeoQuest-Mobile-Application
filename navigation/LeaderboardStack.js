import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import { defaultStackScreenOptions } from './navigationTheme';

const Stack = createNativeStackNavigator();

export default function LeaderboardStack() {
  return (
    <Stack.Navigator screenOptions={defaultStackScreenOptions}>
      <Stack.Screen name="Leaderboard" component={LeaderboardScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
