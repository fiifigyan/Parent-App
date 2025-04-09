import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, SafeAreaView, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ParentContext } from '../context/ParentContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { appConfig } from '../config';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const { parentInfo } = useContext(ParentContext);
  const profileImage = parentInfo?.profileImage || require('../assets/images/fiifi1.jpg');
  const fullName = [parentInfo?.firstName, parentInfo?.lastName].filter(Boolean).join(' ') || 'N/A';
  const relationship = parentInfo?.relationship || 'Parent/Guardian';

  const handleLogout = () => {
    navigation.replace('Login');
  };

  const settingsOptions = [
    {
      title: "Account",
      items: [
        { icon: "edit", name: "Edit Profile", screen: "EditProfile" },
        { icon: "lock", name: "Change Password", screen: "ChangePassword" },
        { icon: "notifications", name: "Notifications", screen: "NotificationSettings" }
      ]
    },
    {
      title: "App",
      items: [
        { icon: "info", name: "About", screen: "About" },
        { icon: "help", name: "Help & Support", screen: "Help" },
        { icon: "star", name: "Rate App", screen: "RateApp" }
      ]
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Profile Section */}
        <View style={styles.profileContainer}>
          <Image source={profileImage} style={styles.profileImage} />
          <View style={styles.profileTextContainer}>
            <Text style={styles.profileName}>{fullName}</Text>
            <Text style={styles.profileRole}>{relationship}</Text>
          </View>
        </View>

        {/* Settings Sections */}
        {settingsOptions.map((section, index) => (
          <View key={index} style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionItemsContainer}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity 
                  key={itemIndex} 
                  style={styles.settingItem}
                  onPress={() => navigation.navigate(item.screen)}
                >
                  <View style={styles.settingIconContainer}>
                    <Icon name={item.icon} size={22} color="#03AC13" />
                  </View>
                  <Text style={styles.settingText}>{item.name}</Text>
                  <Icon name="chevron-right" size={22} color="#ccc" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.versionText}>Version {appConfig.version}</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    paddingHorizontal: 20,
  },
  header: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212529',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginVertical: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 15,
  },
  profileTextContainer: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 14,
    color: '#6c757d',
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6c757d',
    marginBottom: 10,
    paddingLeft: 10,
  },
  sectionItemsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  settingIconContainer: {
    width: 36,
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: '#212529',
  },
  logoutButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonText: {
    color: '#dc3545',
    fontSize: 16,
    fontWeight: '600',
  },
  versionText: {
    textAlign: 'center',
    color: '#adb5bd',
    marginTop: 30,
    marginBottom: 20,
    fontSize: 12,
  },
});

export default SettingsScreen;