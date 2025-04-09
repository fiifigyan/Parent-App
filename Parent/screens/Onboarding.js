import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    key: '1',
    title: 'Welcome to OAIS',
    text: 'Simplify admissions and manage school life in one place.',
    animation: require('../assets/animations/welcome.json'),
    backgroundColor: '#03AC13',
  },
  {
    key: '2',
    title: 'Simplified Admissions',
    text: 'Apply for admissions and track your application with ease.',
    animation: require('../assets/animations/admissions.json'),
    backgroundColor: '#03AC13',
  },
  {
    key: '3',
    title: 'Stay Connected',
    text: 'Get real-time updates and never miss important announcements.',
    animation: require('../assets/animations/notifications.json'),
    backgroundColor: '#03AC13',
  },
  {
    key: '4',
    title: 'Secure Document Storage',
    text: 'Your important documents are safe and accessible anytime.',
    animation: require('../assets/animations/security.json'),
    backgroundColor: '#03AC13',
  },
];

const Onboarding = ({ navigation }) => {
  const [showRealApp, setShowRealApp] = useState(false);

  const renderItem = ({ item }) => (
    <View style={[styles.slide, { backgroundColor: item.backgroundColor }]}>
      <LottieView
        source={item.animation}
        autoPlay
        loop
        style={styles.animation}
        resizeMode="contain"
      />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.text}>{item.text}</Text>
      </View>
    </View>
  );

  const renderDoneButton = () => (
    <TouchableOpacity 
      style={styles.doneButton}
      onPress={() => {
        setShowRealApp(true);
        navigation.navigate('Signup');
      }}
    >
      <Text style={styles.doneButtonText}>Get Started</Text>
    </TouchableOpacity>
  );

  const onDone = () => {
    setShowRealApp(true);
    navigation.navigate('Signup');
  };

  if (showRealApp) {
    return null;
  }

  return (
    <AppIntroSlider
      data={slides}
      renderItem={renderItem}
      onDone={onDone}
      showSkipButton={true}
      showNextButton={true}
      renderDoneButton={renderDoneButton}
      activeDotStyle={styles.activeDot}
      dotStyle={styles.dot}
      // bottomButton
    />
  );
};

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  animation: {
    width: width * 0.9,
    height: height * 0.4,
    marginBottom: 40,
  },
  textContainer: {
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
  },
  text: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  doneButton: {
    backgroundColor: '#03C013',
    padding: 10,
    borderRadius: 30,
    marginTop: 5,
    elevate: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  doneButtonText: {
    color: 'aliceblue',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  activeDot: {
    backgroundColor: '#FFF',
    width: 30,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  dot: {
    backgroundColor: 'rgba(255,255,255,0.4)',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});

export default Onboarding;