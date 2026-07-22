import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import { COLORS } from '../config/theme';

const Stack = createNativeStackNavigator();

// Shown when the user has no saved session yet.
export default function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.textInverse,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Log In' }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create Account' }} />
    </Stack.Navigator>
  );
}
