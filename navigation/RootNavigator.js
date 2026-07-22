import SplashScreen from '../screens/SplashScreen';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import useAuth from '../hooks/useAuth';

// Top-level switch: Splash while we check for a saved session, AuthStack when logged
// out, MainTabs when logged in. This is the single source of truth for "which part of
// the app the user sees" and reacts automatically whenever AuthContext's user changes.
export default function RootNavigator() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <SplashScreen />;

  return isAuthenticated ? <MainTabs /> : <AuthStack />;
}
