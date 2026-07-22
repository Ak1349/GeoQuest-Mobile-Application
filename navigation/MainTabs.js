import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import HomeStack from './HomeStack';
import ExploreStack from './ExploreStack';
import EventsStack from './EventsStack';
import LeaderboardStack from './LeaderboardStack';
import ProfileStack from './ProfileStack';
import { COLORS } from '../config/theme';

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  HomeTab: '🏠',
  ExploreTab: '🗺️',
  EventsTab: '🎟️',
  LeaderboardTab: '🏆',
  ProfileTab: '👤',
};

// Bottom tab navigator shown once the user is authenticated. Each tab owns its own
// stack navigator so detail screens (cache details, camera, etc.) push on top with a
// back button while the tab bar itself stays part of the same navigation tree.
export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.6 }}>{TAB_ICONS[route.name]}</Text>
        ),
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="ExploreTab" component={ExploreStack} options={{ tabBarLabel: 'Explore' }} />
      <Tab.Screen name="EventsTab" component={EventsStack} options={{ tabBarLabel: 'Events' }} />
      <Tab.Screen
        name="LeaderboardTab"
        component={LeaderboardStack}
        options={{ tabBarLabel: 'Leaderboard' }}
      />
      <Tab.Screen name="ProfileTab" component={ProfileStack} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}
