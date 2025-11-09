import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { hasCompletedOnboarding } from '../services/authService';
import CustomDrawer from '../components/CustomDrawer';

// Auth Screens
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import SubscriptionScreen from '../screens/SubscriptionScreen';

// Main App Screens
import DashboardScreen from '../screens/DashboardScreen';
import SafeBrowserScreen from '../screens/SafeBrowserScreen';
import LinkScannerScreen from '../screens/LinkScannerScreen';
import StorageScannerScreen from '../screens/StorageScannerScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ProfileManagementScreen from '../screens/ProfileManagementScreen';
import LoginManagerScreen from '../screens/LoginManagerScreen';
import BreachCheckerScreen from '../screens/BreachCheckerScreen';
import TermsAnalyzerScreen from '../screens/TermsAnalyzerScreen';
import DeepSearchScreen from '../screens/DeepSearchScreen';
import SecurityQuizScreen from '../screens/SecurityQuizScreen';
import AboutScreen from '../screens/AboutScreen';

const Stack = createNativeStackNavigator();

function MainStack() {
  const { theme } = useTheme();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [currentRoute, setCurrentRoute] = useState('Home');
  const navigationRef = React.useRef(null);
  
  const screenOptions = {
    headerStyle: { backgroundColor: theme.surface },
    headerTintColor: theme.text,
    headerLeft: () => (
      <TouchableOpacity onPress={() => setDrawerVisible(true)} style={{ marginLeft: 15 }}>
        <Text style={{ fontSize: 24, color: theme.text }}>☰</Text>
      </TouchableOpacity>
    ),
  };
  
  return (
    <>
      <Stack.Navigator 
        screenOptions={screenOptions}
        screenListeners={{
          state: (e) => {
            const state = e.data.state;
            if (state) {
              const route = state.routes[state.index];
              setCurrentRoute(route.name);
            }
          }
        }}
      >
        <Stack.Screen name="Home" component={DashboardScreen} />
        <Stack.Screen name="Browser" component={SafeBrowserScreen} />
        <Stack.Screen name="Link Scanner" component={LinkScannerScreen} />
        <Stack.Screen name="Storage Scanner" component={StorageScannerScreen} />
        <Stack.Screen name="Scan History" component={HistoryScreen} />
        <Stack.Screen name="Login Manager" component={LoginManagerScreen} />
        <Stack.Screen name="Breach Checker" component={BreachCheckerScreen} />
        <Stack.Screen name="Terms Analyzer" component={TermsAnalyzerScreen} />
        <Stack.Screen name="DeepSearch" component={DeepSearchScreen} />
        <Stack.Screen name="Security Quiz" component={SecurityQuizScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
        <Stack.Screen name="Profile Management" component={ProfileManagementScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
      <CustomDrawer 
        visible={drawerVisible} 
        onClose={() => setDrawerVisible(false)}
        currentRoute={currentRoute}
      />
    </>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, user, loading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Show subscription screen for new non-subscribed users
      if (!user.isSubscribed && user.id !== 'dev_001') {
        setShowSubscription(true);
      }
    }
  }, [isAuthenticated, user]);

  const checkOnboardingStatus = async () => {
    const completed = await hasCompletedOnboarding();
    setShowOnboarding(!completed);
    setCheckingOnboarding(false);
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  const handleSubscriptionComplete = () => {
    setShowSubscription(false);
  };

  if (loading || checkingOnboarding) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0b1220' }}>
        <ActivityIndicator size="large" color="#60a5fa" />
      </View>
    );
  }

  if (showOnboarding) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  if (!isAuthenticated) {
    return <AuthStack />;
  }

  if (showSubscription) {
    return <SubscriptionScreen onComplete={handleSubscriptionComplete} />;
  }

  return <MainStack />;
}

