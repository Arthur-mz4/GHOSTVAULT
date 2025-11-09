import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, FlatList, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { setOnboardingComplete } from '../services/authService';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Welcome to GhostGuard',
    subtitle: 'Your Ultimate Mobile Security Companion',
    description: 'Protect yourself from malicious links, hidden malware, and privacy threats with advanced AI-powered security',
    icon: '🛡️',
    color1: '#667eea',
    color2: '#764ba2',
  },
  {
    id: '2',
    title: 'Real-Time Protection',
    subtitle: 'Stay Safe While Browsing',
    description: 'Automatic link scanning, tracker blocking, and malware detection keep you safe from threats before they reach you',
    icon: '⚡',
    color1: '#f093fb',
    color2: '#f5576c',
  },
  {
    id: '3',
    title: 'Comprehensive Scanning',
    subtitle: 'Full Device Security',
    description: 'Scan files, apps, downloads, and storage for hidden threats. Get instant alerts and recommendations',
    icon: '🔍',
    color1: '#4facfe',
    color2: '#00f2fe',
  },
  {
    id: '4',
    title: 'Smart Privacy Tools',
    subtitle: 'Take Control of Your Data',
    description: 'Block trackers, view threat history, and manage blocked content with an intuitive dashboard',
    icon: '🔒',
    color1: '#43e97b',
    color2: '#38f9d7',
  },
];

export default function OnboardingScreen({ onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef(null);

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = () => {
    if (currentIndex < slides.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    await setOnboardingComplete();
    onComplete();
  };

  const renderSlide = ({ item }) => (
    <View style={[styles.slide, { width }]}>
      <LinearGradient colors={[item.color1, item.color2]} style={styles.gradient}>
        <View style={styles.content}>
          <Text style={styles.icon}>{item.icon}</Text>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </LinearGradient>
    </View>
  );

  const Paginator = () => (
    <View style={styles.paginatorContainer}>
      {slides.map((_, index) => {
        const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [8, 24, 8],
          extrapolate: 'clamp',
        });
        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: 'clamp',
        });
        return <Animated.View style={[styles.dot, { width: dotWidth, opacity }]} key={index.toString()} />;
      })}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={slidesRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        scrollEventThrottle={32}
      />
      
      <View style={styles.footer}>
        <Paginator />
        
        <View style={styles.buttons}>
          {currentIndex < slides.length - 1 && (
            <TouchableOpacity onPress={() => handleComplete()} style={styles.skipButton}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity onPress={scrollTo} style={[styles.nextButton, currentIndex === slides.length - 1 && styles.getStartedButton]}>
            <Text style={styles.nextText}>
              {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1220',
  },
  slide: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  icon: {
    fontSize: 120,
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.9,
  },
  description: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  paginatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
    marginHorizontal: 4,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  skipText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  getStartedButton: {
    backgroundColor: '#ffffff',
  },
  nextText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});


