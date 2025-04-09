import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, SafeAreaView, KeyboardAvoidingView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CustomInput } from '../components/CustomInput';
import { AuthContext } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/Ionicons';
import { API_CONFIG } from '../config';

const PasswordRequirements = ({ password }) => {
  const requirements = [
    { 
      label: `At least ${API_CONFIG.PASSWORD_REQUIREMENTS.minLength} characters`, 
      met: password.length >= API_CONFIG.PASSWORD_REQUIREMENTS.minLength 
    },
    { 
      label: 'One uppercase letter', 
      met: API_CONFIG.PASSWORD_REQUIREMENTS.needsUppercase ? /[A-Z]/.test(password) : true 
    },
    { 
      label: 'One number', 
      met: API_CONFIG.PASSWORD_REQUIREMENTS.needsNumber ? /\d/.test(password) : true 
    },
    { 
      label: 'One special character', 
      met: API_CONFIG.PASSWORD_REQUIREMENTS.needsSpecialChar ? /[@$!%*?&]/.test(password) : true 
    }
  ];

  return (
    <View style={styles.requirementsContainer}>
      {requirements.map(({ label, met }, index) => (
        <View key={index} style={styles.requirementRow}>
          <Icon 
            name={met ? 'checkmark-circle' : 'close-circle'} 
            size={16} 
            color={met ? '#4CAF50' : '#757575'} 
          />
          <Text style={[styles.requirementText, met && styles.requirementMet]}>
            {label}
          </Text>
        </View>
      ))}
    </View>
  );
};

const SignupScreen = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const { register, isLoading } = useContext(AuthContext);

  const validatePassword = (password) => {
    const { minLength, needsUppercase, needsNumber, needsSpecialChar } = API_CONFIG.PASSWORD_REQUIREMENTS;
    
    return (
      password.length >= minLength &&
      (!needsUppercase || /[A-Z]/.test(password)) &&
      (!needsNumber || /\d/.test(password)) &&
      (!needsSpecialChar || /[@$!%*?&]/.test(password))
    );
  };

  const validateForm = () => {
    const newErrors = {};
    const trimmedEmail = formData.email.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.email = 'Valid email is required';
    }
    if (!validatePassword(formData.password)) {
      newErrors.password = 'Password requirements not met';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;
    
    try {
      await register({
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      });
      navigation.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
    } catch (error) {
      setErrors({ submit: error.message || 'Signup failed. Please try again.' });
    }
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
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
            value={formData.email}
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
            value={formData.password}
            onChangeText={(text) => handleInputChange('password', text)}
            onBlur={() => handleInputBlur('password')}
            error={touched.password && errors.password}
            placeholder="Create a password"
            secureTextEntry
            leftIcon={<Icon name="lock-closed" size={20} color="#666" />}
          />

          {formData.password.length > 0 && (
            <PasswordRequirements password={formData.password} />
          )}

          {errors.submit && (
            <View style={styles.errorContainer}>
              <Icon name="sad-outline" size={20} color="#d32f2f" />
              <Text style={styles.errorText}>{errors.submit}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSignup}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
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
    backgroundColor: '#03AC13',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderBottomEndRadius: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: 'white',
  },
  requirementsContainer: {
    marginVertical: 8,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  requirementText: {
    fontSize: 14,
    color: '#757575',
    marginLeft: 8,
  },
  requirementMet: {
    color: '#4CAF50',
  },
  submitButton: {
    backgroundColor: '#03AC13',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center'
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
    color: '#03AC13',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#ffebee',
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#d32f2f',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
  },
});

export default SignupScreen;