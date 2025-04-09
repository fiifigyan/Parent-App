import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '../screens/Login';
import Signup from '../screens/Signup';
import ForgotPassword from '../screens/ForgotPassword';
import ResetPassword from '../screens/ResetPassword';
import Onboarding from '../screens/Onboarding';

const Stack = createNativeStackNavigator();

const AuthStack = ( { initialRouteName = 'Onboard' }) => {
  return (
    <Stack.Navigator 
      initialRouteName={initialRouteName} 
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Onboard" component={Onboarding} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Signup" component={Signup} />
      <Stack.Screen name="Forgot" component={ForgotPassword} />
      <Stack.Screen name="Reset" component={ResetPassword} />
    </Stack.Navigator>
  );
};

export default AuthStack;