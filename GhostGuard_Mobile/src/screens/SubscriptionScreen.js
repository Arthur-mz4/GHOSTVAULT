import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';

const plans = [
  {
    id: 'free',
    name: 'Basic',
    price: 'Free',
    period: 'Forever',
    features: [
      '✓ Basic link scanning',
      '✓ Limited threat detection',
      '✓ View-only mode',
      '✗ Real-time protection',
      '✗ Advanced malware scanning',
      '✗ Tracker blocking',
      '✗ Priority support',
    ],
    color1: '#8e9eab',
    color2: '#eef2f3',
    recommended: false,
  },
  {
    id: 'monthly',
    name: 'Premium',
    price: 'R10',
    period: 'per month',
    features: [
      '✓ Real-time threat protection',
      '✓ Advanced malware scanning',
      '✓ Comprehensive tracker blocking',
      '✓ Unlimited scans',
      '✓ File & app protection',
      '✓ Blocked content manager',
      '✓ Priority support',
    ],
    color1: '#667eea',
    color2: '#764ba2',
    recommended: true,
  },
  {
    id: 'yearly',
    name: 'Premium Annual',
    price: 'R100',
    period: 'per year',
    savings: 'Save R20',
    features: [
      '✓ All Premium features',
      '✓ 17% discount',
      '✓ Advanced threat intelligence',
      '✓ Biometric quick access',
      '✓ Multiple device support',
      '✓ VIP support channel',
      '✓ Early access to features',
    ],
    color1: '#f093fb',
    color2: '#f5576c',
    recommended: false,
  },
];

export default function SubscriptionScreen({ onComplete }) {
  const { subscribe, user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (selectedPlan === 'free') {
      onComplete();
      return;
    }

    setLoading(true);
    
    // Simulate payment processing
    setTimeout(async () => {
      const result = await subscribe(selectedPlan);
      setLoading(false);

      if (result.success) {
        Alert.alert(
          'Subscription Successful!',
          `You're now subscribed to ${plans.find(p => p.id === selectedPlan)?.name}`,
          [{ text: 'Start Protecting', onPress: onComplete }]
        );
      } else {
        Alert.alert('Subscription Failed', result.error || 'Could not process subscription');
      }
    }, 1500);
  };

  const handleSkip = () => {
    Alert.alert(
      'Continue with Basic?',
      'You can upgrade to Premium anytime from Settings to unlock all features.',
      [
        { text: 'Stay on Basic', onPress: onComplete, style: 'cancel' },
        { text: 'Choose Plan', style: 'default' },
      ]
    );
  };

  return (
    <LinearGradient colors={['#0b1220', '#1e3a5f']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Protection</Text>
          <Text style={styles.subtitle}>Unlock full security features with Premium</Text>
        </View>

        <View style={styles.plansContainer}>
          {plans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                selectedPlan === plan.id && styles.selectedPlan,
              ]}
              onPress={() => setSelectedPlan(plan.id)}
            >
              {plan.recommended && (
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedText}>MOST POPULAR</Text>
                </View>
              )}
              
              <LinearGradient
                colors={[plan.color1, plan.color2]}
                style={styles.planGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.planName}>{plan.name}</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.price}>{plan.price}</Text>
                  <Text style={styles.period}>{plan.period}</Text>
                </View>
                {plan.savings && (
                  <View style={styles.savingsBadge}>
                    <Text style={styles.savingsText}>{plan.savings}</Text>
                  </View>
                )}
              </LinearGradient>

              <View style={styles.featuresContainer}>
                {plan.features.map((feature, index) => (
                  <Text
                    key={index}
                    style={[
                      styles.feature,
                      feature.startsWith('✗') && styles.featureDisabled,
                    ]}
                  >
                    {feature}
                  </Text>
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.subscribeButton, loading && styles.subscribeButtonDisabled]}
          onPress={handleSubscribe}
          disabled={loading}
        >
          <Text style={styles.subscribeButtonText}>
            {loading ? 'Processing...' : selectedPlan === 'free' ? 'Continue with Basic' : 'Subscribe Now'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>I'll decide later</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          • Cancel anytime from Settings{'\n'}
          • 14-day money-back guarantee{'\n'}
          • Secure payment processing
        </Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
  },
  plansContainer: {
    gap: 16,
    marginBottom: 30,
  },
  planCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  selectedPlan: {
    borderColor: '#60a5fa',
    transform: [{ scale: 1.02 }],
  },
  recommendedBadge: {
    backgroundColor: '#f59e0b',
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    position: 'absolute',
    top: 12,
    right: 12,
    borderRadius: 12,
    zIndex: 1,
  },
  recommendedText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  planGradient: {
    padding: 20,
  },
  planName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  period: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  savingsBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.8)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  savingsText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  featuresContainer: {
    padding: 20,
    gap: 8,
  },
  feature: {
    fontSize: 14,
    color: '#e6eef3',
  },
  featureDisabled: {
    color: '#64748b',
  },
  subscribeButton: {
    backgroundColor: '#60a5fa',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  subscribeButtonDisabled: {
    opacity: 0.6,
  },
  subscribeButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  skipButton: {
    padding: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  skipText: {
    color: '#94a3b8',
    fontSize: 16,
  },
  disclaimer: {
    color: '#64748b',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 20,
  },
});


