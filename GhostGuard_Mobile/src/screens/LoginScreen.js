import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const { login, loginWithGoogle, loginWithBiometric, biometricAvailable } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [biometricPrompted, setBiometricPrompted] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Login Failed', result.error || 'Invalid credentials');
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const result = await loginWithGoogle();
    setLoading(false);

    if (!result.success) {
      Alert.alert('Google Sign-In Failed', result.error || 'Could not sign in with Google');
    }
  };

  const handleBiometricLogin = async () => {
    setLoading(true);
    const success = await loginWithBiometric();
    setLoading(false);

    if (!success) {
      Alert.alert('Authentication Failed', 'Biometric authentication was unsuccessful');
    }
  };

  const handleDevLogin = async () => {
    setLoading(true);
    const result = await login('dev', 'dev');
    setLoading(false);
    
    if (!result.success) {
      Alert.alert('Login Failed', 'Developer login failed');
    }
  };

  // Check for biometric-enabled user on mount
  useEffect(() => {
    const checkBiometricUser = async () => {
      if (biometricAvailable && !biometricPrompted) {
        try {
          const biometricEnabledStr = await AsyncStorage.getItem('ghostguard_biometric_enabled');
          if (biometricEnabledStr === 'true') {
            setBiometricPrompted(true);
            // Auto-prompt biometric
            setTimeout(() => handleBiometricLogin(), 500);
          }
        } catch (error) {
          console.log('Error checking biometric user:', error);
        }
      }
    };
    checkBiometricUser();
  }, [biometricAvailable]);

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.logo}>👻</Text>
            <Text style={styles.title}>GhostVault</Text>
            <Text style={styles.subtitle}>GhostGuard Mobile Security</Text>
          </View>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#b4b4d4"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#b4b4d4"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#667eea" />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.linkText}>Don't have an account? <Text style={styles.linkBold}>Sign Up</Text></Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialButtons}>
            <TouchableOpacity style={styles.socialButton} onPress={handleGoogleSignIn} disabled={loading}>
              <Text style={styles.socialIcon}>G</Text>
              <Text style={styles.socialText}>Continue with Google</Text>
            </TouchableOpacity>

            {biometricAvailable && (
              <TouchableOpacity style={styles.socialButton} onPress={handleBiometricLogin} disabled={loading}>
                <Text style={styles.socialIcon}>👆</Text>
                <Text style={styles.socialText}>Use Biometrics</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity onPress={handleDevLogin} style={styles.devButton}>
            <Text style={styles.devButtonText}>Developer Login</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 80,
    marginBottom: 10,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    color: '#ffffff',
    opacity: 0.9,
  },
  form: {
    marginBottom: 30,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    color: '#333',
  },
  loginButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  loginButtonText: {
    color: '#667eea',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 14,
  },
  linkBold: {
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dividerText: {
    color: '#ffffff',
    paddingHorizontal: 15,
    fontSize: 14,
    opacity: 0.8,
  },
  socialButtons: {
    gap: 12,
  },
  socialButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  socialIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  socialText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  devButton: {
    marginTop: 20,
    padding: 8,
    alignItems: 'center',
  },
  devButtonText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
  },
});


