import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ScopeGuard from '../components/ScopeGuard';
import DrawerNavigator from './DrawerNavigator';
import ParentProfile from '../screens/ParentProfile';
import NotificationScreen from '../screens/Notification';
import SettingScreen from '../screens/AppSetting';
import EventScreen from '../screens/Events';
import EditProfile from '../screens/EditProfile';
import HelpCenterScreen from '../screens/HelpCenter';
import NotificationSettings from '../screens/NotificationSettings';
import HomeWorkScreen from '../screens/HomeWork';
import StudentProfile from '../screens/StudentProfile';
import Fees from '../screens/FeeDetail';
import GradesScreen from '../screens/Grades';


const Stack = createNativeStackNavigator();

const MainAppStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Drawer">
        {() => (
          <ScopeGuard requiredScope="read:dashboard">
            <DrawerNavigator />
          </ScopeGuard>
        )}
      </Stack.Screen>
      
      <Stack.Screen name="Parent">
        {() => (
          <ScopeGuard requiredScope="read:profile">
            <ParentProfile />
          </ScopeGuard>
        )}
      </Stack.Screen>
      
      <Stack.Screen name="Notification">
        {() => (
          <ScopeGuard requiredScope="read:notifications">
            <NotificationScreen />
          </ScopeGuard>
        )}
      </Stack.Screen>
      
      <Stack.Screen name="Events">
        {() => (
          <ScopeGuard requiredScope="read:events">
            <EventScreen />
          </ScopeGuard>
        )}
      </Stack.Screen>
      
      <Stack.Screen name="Student">
        {() => (
          <ScopeGuard requiredScope="manage:children">
            <StudentProfile />
          </ScopeGuard>
        )}
      </Stack.Screen>

      
      {/* Other screens with appropriate scope checks */}
      <Stack.Screen name="AddAccount" component={AddAccountScreen} />
      <Stack.Screen name="SwitchAccount" component={SwitchAccountScreen} />
      <Stack.Screen name="Payment" component={PaymentMethod} />
      <Stack.Screen name="History" component={HistoryScreen} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
      <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettings} />
      <Stack.Screen name="Homework" component={HomeWorkScreen} />
      <Stack.Screen name="FeeDetail" component={Fees} />
      <Stack.Screen name="Grades" component={GradesScreen} />
      <Stack.Screen name="Settings" component={SettingScreen} />
      <Stack.Screen name="PaymentProcessing" component={PaymentProcessing} />
      <Stack.Screen name="PaymentSuccess" component={PaymentSuccess} />

    </Stack.Navigator>
  );
};

export default MainAppStack;