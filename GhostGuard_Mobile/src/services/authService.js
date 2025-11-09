import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';

const USER_KEY = 'ghostguard_user';
const SESSION_KEY = 'ghostguard_session';
const USERS_DB_KEY = 'ghostguard_users_db'; // Store all registered users
const CREDENTIALS_KEY = 'ghostguard_credentials'; // Store email:password pairs

// Developer test account (pre-configured as subscribed)
const DEV_ACCOUNT = {
  id: 'dev_001',
  email: 'developer@ghostguard.com',
  name: 'Developer',
  isSubscribed: true,
  subscriptionPlan: 'premium',
  createdAt: new Date().toISOString(),
  biometricEnabled: false
};

// Check if biometric authentication is available
export const checkBiometricAvailability = async () => {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
  return { hasHardware, isEnrolled, supportedTypes, available: hasHardware && isEnrolled };
};

// Authenticate with biometrics
export const authenticateWithBiometrics = async () => {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to access GhostGuard',
      fallbackLabel: 'Use passcode',
      disableDeviceFallback: false,
    });
    return result.success;
  } catch (error) {
    console.error('Biometric auth error:', error);
    return false;
  }
};

// Enable/disable biometric login
export const setBiometricEnabled = async (enabled) => {
  try {
    const user = await getCurrentUser();
    if (user) {
      user.biometricEnabled = enabled;
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error setting biometric:', error);
    return false;
  }
};

// Sign up with email/password
export const signUpWithEmail = async (email, password, name) => {
  try {
    // Get existing users database
    const usersDbStr = await AsyncStorage.getItem(USERS_DB_KEY);
    const usersDb = usersDbStr ? JSON.parse(usersDbStr) : {};
    
    // Check if email already exists
    if (usersDb[email]) {
      return { success: false, error: 'Email already registered' };
    }
    
    // Create new user
    const user = {
      id: `user_${Date.now()}`,
      email,
      name,
      isSubscribed: false,
      subscriptionPlan: 'free',
      createdAt: new Date().toISOString(),
      biometricEnabled: false
    };
    
    // Store user in database
    usersDb[email] = { ...user, password }; // Store with password
    await AsyncStorage.setItem(USERS_DB_KEY, JSON.stringify(usersDb));
    
    // Set as current user
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify({ token: `token_${user.id}`, expiresAt: Date.now() + 86400000 }));
    
    return { success: true, user };
  } catch (error) {
    console.error('Signup error:', error);
    return { success: false, error: error.message };
  }
};

// Sign in with email/password
export const signInWithEmail = async (email, password) => {
  try {
    // Check if developer account
    if ((email === 'dev' || email === 'developer') && password === 'dev') {
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(DEV_ACCOUNT));
      await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify({ token: 'dev_token', expiresAt: Date.now() + 86400000 }));
      return { success: true, user: DEV_ACCOUNT };
    }
    
    // Get users database
    const usersDbStr = await AsyncStorage.getItem(USERS_DB_KEY);
    const usersDb = usersDbStr ? JSON.parse(usersDbStr) : {};
    
    // Check if user exists and password matches
    const userRecord = usersDb[email];
    if (userRecord && userRecord.password === password) {
      const { password: _, ...user } = userRecord; // Remove password from user object
      
      // Set as current user
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
      await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify({ token: `token_${user.id}`, expiresAt: Date.now() + 86400000 }));
      
      return { success: true, user };
    }
    
    return { success: false, error: 'Invalid email or password' };
  } catch (error) {
    console.error('Signin error:', error);
    return { success: false, error: error.message };
  }
};

// Sign in with Google (simulated)
export const signInWithGoogle = async () => {
  try {
    // In a real app, use @react-native-google-signin/google-signin or expo-auth-session
    // For now, create a Google-authenticated user simulation
    const user = {
      id: `google_${Date.now()}`,
      email: 'user@gmail.com',
      name: 'Google User',
      isSubscribed: false,
      subscriptionPlan: 'free',
      createdAt: new Date().toISOString(),
      authProvider: 'google',
      biometricEnabled: false
    };
    
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify({ token: `google_token_${user.id}`, expiresAt: Date.now() + 86400000 }));
    
    return { success: true, user };
  } catch (error) {
    console.error('Google signin error:', error);
    return { success: false, error: error.message };
  }
};

// Get current authenticated user
export const getCurrentUser = async () => {
  try {
    const userData = await SecureStore.getItemAsync(USER_KEY);
    const sessionData = await SecureStore.getItemAsync(SESSION_KEY);
    
    if (userData && sessionData) {
      const user = JSON.parse(userData);
      const session = JSON.parse(sessionData);
      
      // Check if session is still valid
      if (session.expiresAt > Date.now()) {
        return user;
      }
    }
    return null;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
};

// Sign out
export const signOut = async () => {
  try {
    // Clear current user session
    await SecureStore.deleteItemAsync(USER_KEY);
    await SecureStore.deleteItemAsync(SESSION_KEY);
    return { success: true };
  } catch (error) {
    console.error('Signout error:', error);
    return { success: false, error: error.message };
  }
};

// Update subscription status
export const updateSubscription = async (plan) => {
  try {
    const user = await getCurrentUser();
    if (user) {
      user.isSubscribed = plan !== 'free';
      user.subscriptionPlan = plan;
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
      return { success: true, user };
    }
    return { success: false, error: 'No user found' };
  } catch (error) {
    console.error('Update subscription error:', error);
    return { success: false, error: error.message };
  }
};

// Check if onboarding has been completed
export const hasCompletedOnboarding = async () => {
  try {
    const value = await AsyncStorage.getItem('ghostguard_onboarding_complete');
    return value === 'true';
  } catch (error) {
    return false;
  }
};

// Mark onboarding as completed
export const setOnboardingComplete = async () => {
  try {
    await AsyncStorage.setItem('ghostguard_onboarding_complete', 'true');
    return true;
  } catch (error) {
    console.error('Set onboarding error:', error);
    return false;
  }
};

