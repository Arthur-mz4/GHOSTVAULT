import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCurrentUser, signInWithEmail, signUpWithEmail, signInWithGoogle, signOut, updateSubscription, authenticateWithBiometrics, checkBiometricAvailability } from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    // Check auth state on mount
    checkAuthState();
    checkBiometrics();
  }, []);

  const checkAuthState = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkBiometrics = async () => {
    const { available } = await checkBiometricAvailability();
    setBiometricAvailable(available);
  };

  const login = async (email, password) => {
    const result = await signInWithEmail(email, password);
    if (result.success) {
      setUser(result.user);
    }
    return result;
  };

  const loginWithBiometric = async () => {
    try {
      const success = await authenticateWithBiometrics();
      if (success) {
        // Get the last logged in user and restore session
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          return true;
        }
        return false;
      }
      return false;
    } catch (error) {
      console.error('Biometric login error:', error);
      return false;
    }
  };

  const loginWithGoogle = async () => {
    const result = await signInWithGoogle();
    if (result.success) {
      setUser(result.user);
    }
    return result;
  };

  const signup = async (email, password, name) => {
    const result = await signUpWithEmail(email, password, name);
    if (result.success) {
      setUser(result.user);
    }
    return result;
  };

  const logout = async () => {
    await signOut();
    setUser(null);
  };

  const subscribe = async (plan) => {
    const result = await updateSubscription(plan);
    if (result.success) {
      setUser(result.user);
    }
    return result;
  };

  const value = {
    user,
    loading,
    biometricAvailable,
    isAuthenticated: !!user,
    isSubscribed: user?.isSubscribed || false,
    login,
    loginWithBiometric,
    loginWithGoogle,
    signup,
    logout,
    subscribe,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


