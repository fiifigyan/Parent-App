import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DrawerNavigator from './DrawerNavigator';
import AdmissionForm from '../screens/AdmissionForm';
import AddAccountScreen from '../screens/AddAccount';
import SwitchAccountScreen from '../screens/SwitchAccount';
import HistoryScreen from '../screens/History';
import ParentProfile from '../screens/ParentProfile';
import NotificationScreen from '../screens/Notification';
import SettingScreen from '../screens/AppSetting';
import EventScreen from '../screens/Events';
import EditProfile from '../screens/EditProfile';
import WelcomeScreen from '../screens/WelcomeScreen';
import HelpCenterScreen from '../screens/HelpCenter';
import TourScreen from '../screens/TourScreen';
import NotificationSettings from '../screens/NotificationSettings';
import HomeWorkScreen from '../screens/HomeWork';
import AdmissionStatus from '../screens/AdmissionStatus';
import StudentProfile from '../screens/StudentProfile';
import Fees from '../screens/FeeDetail';
import GradesScreen from '../screens/Grades';
import OTPVerificationScreen from '../screens/OTPVerification';
import PaymentProcessing from '../screens/PaymentProcessing';
import PaymentSuccess from '../components/PaymentSuccess';
import Breakdown from '../screens/AdmissionBreakdown';
import AdmissionPurchase from '../screens/AdmissionPurchase';
import PaymentMethod from '../screens/PaymentMethod';

const Stack = createNativeStackNavigator();

const StackNavigator = ({ initialRouteName = 'Home' }) => {
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Drawer" component={DrawerNavigator} />
      <Stack.Screen name="Parent" component={ParentProfile} />
      <Stack.Screen name="Notification" component={NotificationScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettings} />
      <Stack.Screen name="Settings" component={SettingScreen} />
      <Stack.Screen name="Admission" component={AdmissionForm} />
      <Stack.Screen name="AdmissionStatus" component={AdmissionStatus} />
      <Stack.Screen name="Student" component={StudentProfile} />
      <Stack.Screen name="AddAccount" component={AddAccountScreen} />
      <Stack.Screen name="SwitchAccount" component={SwitchAccountScreen} />
      <Stack.Screen name="FeeDetail" component={Fees} />
      <Stack.Screen name="Payment" component={PaymentMethod} />
      <Stack.Screen name="History" component={HistoryScreen} />
      <Stack.Screen name="Events" component={EventScreen} />
      <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Tour" component={TourScreen} />
      <Stack.Screen name="Homework" component={HomeWorkScreen} />
      <Stack.Screen name="Setting" component={SettingScreen} />
      <Stack.Screen name="Grades" component={GradesScreen} />
      <Stack.Screen name="OTP" component={OTPVerificationScreen} />
      <Stack.Screen name="PaymentProcessing" component={PaymentProcessing} />
      <Stack.Screen name="PaymentSuccess" component={PaymentSuccess} />
      <Stack.Screen name="AdmissionBreakdown" component={Breakdown} />
      <Stack.Screen name="AdmissionPurchase" component={AdmissionPurchase} />
    </Stack.Navigator>
  );
};

export default StackNavigator;