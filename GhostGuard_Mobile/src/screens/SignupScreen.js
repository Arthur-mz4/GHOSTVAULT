import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';

export default function SignupScreen({ navigation }) {
  const { signup, loginWithGoogle } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await signup(email, password, name);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Signup Failed', result.error || 'Could not create account');
    }
    // If successful, user will be auto-logged in and redirected to subscription
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    const result = await loginWithGoogle();
    setLoading(false);

    if (!result.success) {
      Alert.alert('Google Sign-Up Failed', result.error || 'Could not sign up with Google');
    }
  };

  return (
    <LinearGradient colors={['#f093fb', '#f5576c']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.logo}>👻</Text>
            <Text style={styles.title}>Join GhostVault</Text>
            <Text style={styles.subtitle}>GhostGuard Mobile Security</Text>
          </View>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#e8b4c0"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoCorrect={false}
            />

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#e8b4c0"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#e8b4c0"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#e8b4c0"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TouchableOpacity style={styles.signupButton} onPress={handleSignup} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#f093fb" />
              ) : (
                <Text style={styles.signupButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.linkText}>Already have an account? <Text style={styles.linkBold}>Sign In</Text></Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialButtons}>
            <TouchableOpacity style={styles.socialButton} onPress={handleGoogleSignUp} disabled={loading}>
              <Text style={styles.socialIcon}>G</Text>
              <Text style={styles.socialText}>Sign up with Google</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.termsText}>
            By signing up, you agree to our Terms of Service and Privacy Policy
          </Text>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    fontSize: 70,
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
  },
  form: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 14,
    color: '#333',
  },
  signupButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  signupButtonText: {
    color: '#f093fb',
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
    marginBottom: 20,
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
  termsText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});


