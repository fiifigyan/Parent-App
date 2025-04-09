import axios from 'axios';
import React, { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, STORAGE_KEYS } from '../config';
export const registerForPushNotifications = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    alert('Failed to get push token for push notification!');
    return;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  return token;
};

export const useNotificationListener = (navigation) => {
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification tapped:', response);
      navigation.navigate('Notification', { ...response.notification.request.content });
    });

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, [navigation]);
};

export const scheduleLocalNotification = async (title, body, data, trigger) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
    },
    trigger,
  });
};

export const saveSettings = async (settings) => {
  await AsyncStorage.setItem('notificationSettings', JSON.stringify(settings));
};

export const loadSettings = async () => {
  const settings = await AsyncStorage.getItem('notificationSettings');
  return settings ? JSON.parse(settings) : null;
};

export const sendPushTokenToBackend = async (token) => {
  try {
    await axios.post('https://your-api.com/push-token', { token });
  } catch (error) {
    throw new Error('Failed to send push token to backend');
    // console.error('Error sending push token:', error);
  }
};