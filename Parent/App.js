import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdmissionProvider } from './context/AdmissionContext';
import AuthStack from './navigation/AuthStack';
import AdmissionPhaseStack from './navigation/AdmissionPhaseStack';
import MainAppStack from './navigation/MainAppStack';
import StackNavigator from './navigation/StackNavigator';
import { registerForPushNotifications, useNotificationListener, sendPushTokenToBackend } from './services/NotificationService';
import { StudentProvider } from './context/StudentContext';
import { ParentProvider } from './context/ParentContext';
import { PaymentProvider } from './context/PaymentContext';
import { NotificationProvider } from './context/NotificationContext';

function MainAppContent() {
  const { userInfo, isNewUser } = useAuth();
  const [expoPushToken, setExpoPushToken] = React.useState('');

  React.useEffect(() => {
    registerForPushNotifications()
      .then((token) => {
        if (token) {
          setExpoPushToken(token);
          sendPushTokenToBackend(token);
        }
      })
      .catch((error) => console.error('Push registration error:', error));
  }, []);

  return (
    <NavigationContainer>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#03AC13' }}>
        <StatusBar barStyle="default"/>
        {!userInfo ? (
          <AuthStack initialRouteName='Onboard' />
        ) : isNewUser ? (
          <AdmissionPhaseStack initialRouteName="Welcome" />
        ) : (
          <MainAppStack initialRouteName="Drawer" />
        )}
        <NotificationListener />
      </SafeAreaView>
    </NavigationContainer>
  );
}

function NotificationListener() {
  const navigation = useNavigation();
  useNotificationListener(navigation);
  return null;
}

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
        <NotificationProvider>
          <AuthProvider>
            <AdmissionProvider>
              <ParentProvider>
                <StudentProvider>
                  <PaymentProvider>
                    <MainAppContent />
                  </PaymentProvider>
                </StudentProvider>
              </ParentProvider>
            </AdmissionProvider>
          </AuthProvider>
        </NotificationProvider>
    </GestureHandlerRootView>
  );
}

export default App;