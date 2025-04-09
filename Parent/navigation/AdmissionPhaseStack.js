import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ScopeGuard from '../components/ScopeGuard';
import WelcomeScreen from '../screens/WelcomeScreen';
import Breakdown from '../screens/AdmissionBreakdown';
import AdmissionPurchase from '../screens/AdmissionPurchase';
import AdmissionForm from '../screens/AdmissionForm';
import AdmissionStatus from '../screens/AdmissionStatus';
import TourScreen from '../screens/TourScreen';

const Stack = createNativeStackNavigator();

const AdmissionPhaseStack = ({ initialRouteName = 'Welcome' }) => {
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName} 
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Tour" component={TourScreen} />
      
      <Stack.Screen name="AdmissionBreakdown">
        {() => (
          <ScopeGuard requiredScope="purchase:form">
            <Breakdown />
          </ScopeGuard>
        )}
      </Stack.Screen>
      
      <Stack.Screen name="AdmissionPurchase">
        {() => (
          <ScopeGuard requiredScope="purchase:form">
            <AdmissionPurchase />
          </ScopeGuard>
        )}
      </Stack.Screen>
      
      <Stack.Screen name="Admission">
        {() => (
          <ScopeGuard requiredScope="submit:admission">
            <AdmissionForm />
          </ScopeGuard>
        )}
      </Stack.Screen>
      
      <Stack.Screen name="AdmissionStatus">
        {() => (
          <ScopeGuard requiredScope="submit:admission">
            <AdmissionStatus />
          </ScopeGuard>
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export default AdmissionPhaseStack;