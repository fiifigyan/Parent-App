import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, SafeAreaView, KeyboardAvoidingView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CustomInput } from '../components/CustomInput';
import { AuthContext } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/Ionicons';

const PasswordRequirements = ({ password }) => {
  const requirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One number', met: /\d/.test(password) },
    { label: 'One special character', met: /[@$!%*?&]/.test(password) }
  ];

  return (
    <View style={styles.requirementsContainer}>
      {requirements.map(({ label, met }, index) => (
        <View key={label + index} style={styles.requirementRow}>
          <Text style={[styles.requirementDot, met ? styles.requirementMet : styles.requirementUnmet]}>
            {met ? '●' : '○'}
          </Text>
          <Text style={[styles.requirementText, met ? styles.requirementMet : styles.requirementUnmet]}>
            {label}
          </Text>
        </View>
      ))}
    </View>
  );
};

const SignupScreen = () => {
  const navigation = useNavigation();
  const [userInfo, setUserInfo] = useState({
    email: '',
    password: '',
  });
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const { register, isLoading } = useContext(AuthContext);

  const validatePassword = (password) => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /\d/.test(password) &&
      /[@$!%*?&]/.test(password)
    );
  };

  const validateForm = () => {
    const newErrors = {};
    const trimmedEmail = userInfo.email.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.email = 'Valid email is required';
    }
    if (!validatePassword(userInfo.password)) {
      newErrors.password = 'Password requirements not met';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    setTouched(Object.keys(userInfo).reduce((touched, field) => ({ ...touched, [field]: true }), {}));
    
    if (!validateForm()) return;

    try {
      await register({
        email: userInfo.email.trim().toLowerCase(),
        password: userInfo.password,
      });
      setUserInfo({
        email: '',
        password: '',
      });
      console.log('User registered successfully: ', userInfo);
    } catch (error) {
      console.error('Signup Error:', error);
      setErrors(prev => ({
        ...prev,
        submit: error.message || 'Account creation failed. Please try again.'
      }));
    }
  };

  const handleInputChange = (name, value) => {
    setUserInfo(prev => ({ ...prev, [name]: value }));
    if (touched[name]) validateForm();
  };

  const handleInputBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    validateForm();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>New Account</Text>
        <Text style={styles.subtitle}>Sign up and get started</Text>
      </View>
      <KeyboardAvoidingView style={styles.KeyboardAvoidingView}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
          <CustomInput
            label="Email *"
            value={userInfo.email}
            onChangeText={(text) => handleInputChange('email', text)}
            onBlur={() => handleInputBlur('email')}
            error={touched.email && errors.email}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Icon name="mail" size={20} color="#666" />}
          />

          <CustomInput
            label="Password *"
            value={userInfo.password}
            onChangeText={(text) => handleInputChange('password', text)}
            onBlur={() => handleInputBlur('password')}
            error={touched.password && errors.password}
            placeholder="Create a password"
            secureTextEntry
            leftIcon={<Icon name="lock-closed" size={20} color="#666" />}
          />

          {userInfo.password.length > 0 && (
            <PasswordRequirements password={userInfo.password} />
          )}

          {errors.submit && (
            <View style={styles.errorContainer}>
              <Icon style={styles.errorIcon} name="sad-outline" size={20} color="red" />
              <Text style={styles.errorText}>{errors.submit}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSignup}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Log In</Text>
            </TouchableOpacity>
          </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'aliceblue',
  },
  KeyboardAvoidingView: {
    flex: 1
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    padding: 20,
    backgroundColor: '#000080',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderBottomEndRadius: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#ffffff',
  },
  form: {
    flex: 1,
    padding: 20,
    gap: 10,
    backgroundColor: '#ffffff',
  },
  requirementsContainer: {
    marginVertical: 8,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  requirementDot: {
    fontSize: 12,
    marginRight: 8,
  },
  requirementText: {
    fontSize: 14,
  },
  requirementMet: {
    color: '#4CAF50',
  },
  requirementUnmet: {
    color: '#757575',
  },
  submitButton: {
    backgroundColor: '#000080',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign:'center'
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  loginText: {
    color: '#666',
    fontSize: 16,
  },
  loginLink: {
    color: '#000080',
    fontSize: 16,
    fontWeight: '600',
  },
  errorInput: {
    borderColor: '#d32f2f',
  },
  errorIcon: {
    marginRight: 8,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 12,
    marginTop: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffebee',
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#d32f2f',
  },
});

export default SignupScreen;