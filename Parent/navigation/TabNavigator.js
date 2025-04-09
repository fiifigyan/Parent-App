import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import CustomHeader from '../components/CustomHeader';

import HomeScreen from '../screens/Home';
import CalendarScreen from '../screens/Calendar';
import ProfileScreen from '../screens/ParentProfile';
import NotificationScreen from '../screens/Notification';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => ({
        animation: 'fade',
        headerShown: true,
        header: (props) => (
          <CustomHeader
            {...props}
            title={route.name}
            navigation={navigation} // Pass the navigation object
          />
        ),
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Home: 'home',
            Calendar: 'calendar',
            Profile: 'person',
            Notification: 'notifications',
          };
          return <Icon name={icons[route.name]} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#03C04A',
        tabBarInactiveTintColor: '#03AC13',
        tabBarLabelStyle: { fontWeight: 'bold' },
        tabBarStyle: { position: 'absolute' },
        tabBarBackground: () => (
          <BlurView
            tint="light"
            intensity={100}
            style={{
              flex: 1,
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: -1,
              backgroundColor: 'transparent',
              brightness: 0.1,
            }}
          />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Notification" component={NotificationScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;