import React, { useContext, useState } from 'react';
import { View, StyleSheet, Image, Text, TouchableOpacity, Animated } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AuthContext } from '../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { appConfig } from '../config';
import * as Haptics from 'expo-haptics';

const CustomDrawer = (props) => {
  const navigation = useNavigation();
  const { userInfo, logout } = useContext(AuthContext);
  const [scaleValue] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navigateWithHaptic = (screenName) => {
    Haptics.selectionAsync();
    navigation.navigate(screenName);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#03AC13', '#03C04A']} style={{ flex: 1 }}>

          <View style={styles.drawerHeader}>
            <Image
              source={require('../assets/icons/OAIS-logo.png')}
              style={styles.logo}
            />
            <Text style={styles.appName}>{appConfig.APP_NAME}</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.profileSection}>
            <Image
              source={userInfo?.profileImageUrl || require('../assets/images/fiifi1.jpg')}
              style={styles.avatar}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.userName} numberOfLines={1}>
                {userInfo?.fname || 'John Doe'}
              </Text>
              <Text style={styles.userEmail} numberOfLines={1}>
                {userInfo?.email || 'user@example.com'}
              </Text>
              <TouchableOpacity 
                onPress={() => navigateWithHaptic('Student')}
                activeOpacity={0.7}
              >
                <View style={styles.profileButton}>
                  <Text style={styles.viewProfile}>View Profile</Text>
                  <Icon name="keyboard-arrow-right" size={16} color="aliceblue" />
                </View>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.divider} />
        <DrawerContentScrollView 
          {...props} 
          contentContainerStyle={styles.scrollContainer}
        >
          <DrawerItemList {...props} />
        </DrawerContentScrollView>

        <View style={styles.divider} />
        <View style={styles.drawerFooter}>
          <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
            <TouchableOpacity
              style={styles.footerItem}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              onPress={() => navigateWithHaptic('Settings')}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Icon name="settings" size={20} color="#03CA13" />
              </View>
              <Text style={styles.footerItemText}>Settings</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
            <TouchableOpacity
              style={styles.footerItem}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              onPress={() => navigateWithHaptic('HelpCenter')}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Icon name="help" size={20} color="#03CA13" />
              </View>
              <Text style={styles.footerItemText}>Help Center</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
            <TouchableOpacity
              style={[styles.footerItem, styles.logoutItem]}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, styles.logoutIcon]}>
                <Icon name="logout" size={20} color="#ef4444" />
              </View>
              <Text style={[styles.footerItemText, styles.logoutText]}>Logout</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 10,
    padding: 15,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 12,
  },
  appName: {
    fontSize: 18,
    fontWeight: '700',
    color: 'aliceblue',
    textAlign: 'center',
    flex: 1,
  },
  profileSection: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#e0e7ff',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'aliceblue',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewProfile: {
    fontSize: 14,
    color: 'aliceblue',
    fontWeight: '500',
    marginRight: 4,
  },

  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 10,
  },
  drawerFooter: {
    padding: 10,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  footerItemText: {
    fontSize: 15,
    fontWeight: '500',
    color: 'aliceblue',
  },
  logoutItem: {
    marginTop: 8,
    backgroundColor: '#fee2e2',
  },
  logoutText: {
    color: '#ef4444',
  },
});

export default CustomDrawer;