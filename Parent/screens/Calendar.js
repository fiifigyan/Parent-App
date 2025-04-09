import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import AttendanceScreen from '../screens/Attendance';
import TimetableScreen from '../screens/TimeTable';
import EventsScreen from '../screens/Events';

const Tab = createMaterialTopTabNavigator();

const CalendarScreen = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <Tab.Navigator
        screenOptions={{
          tabBarLabelStyle: { fontSize: 14, fontWeight: '600' },
          tabBarStyle: { 
            backgroundColor: '#ffffff',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: '#f0f0f0',
          },
          tabBarIndicatorStyle: { 
            backgroundColor: '#03AC13',
            height: 3,
          },
          tabBarActiveTintColor: '#03AC13',
          tabBarInactiveTintColor: '#666',
        }}
      >
        <Tab.Screen name="Attendance" component={AttendanceScreen} />
        <Tab.Screen name="Timetable" component={TimetableScreen} />
        <Tab.Screen name="Events" component={EventsScreen} />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

export default CalendarScreen;