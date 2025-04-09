import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, SafeAreaView, KeyboardAvoidingView } from 'react-native';
import { CustomInput } from '../components/CustomInput';
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { API_CONFIG } from '../config';

const Login = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    studentID: '',
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const { login, isLoading } = useContext(AuthContext);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.studentID.trim()) {
      newErrors.studentID = 'Student ID is required';
    } else if (!/^OAIS-\d{4}$/.test(formData.studentID.trim())) {
      newErrors.studentID = 'Format: OAIS-XXXX (4 digits after hyphen)';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < API_CONFIG.PASSWORD_REQUIREMENTS.minLength) {
      newErrors.password = `Password must be at least ${API_CONFIG.PASSWORD_REQUIREMENTS.minLength} characters`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    
    try {
      const credentials = {
        email: formData.email.trim().toLowerCase(),
        studentID: formData.studentID.trim().toUpperCase(),
        password: formData.password
      };
      
      await login(credentials);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        submit: error.message || 'Login failed. Please try again.' 
      }));
    }
  };

  const handleStudentIDChange = (text) => {
    let formattedText = text.toUpperCase();
    
    if (formattedText.length === 4 && !formattedText.includes('-')) {
      formattedText = formattedText.slice(0, 4) + '-' + formattedText.slice(4);
    }

    if (formattedText.length > 9) {
      formattedText = formattedText.slice(0, 9);
    }
    
    setFormData(prev => ({ ...prev, studentID: formattedText }));
    if (errors.studentID) setErrors(prev => ({ ...prev, studentID: '' }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome!</Text>
        <Text style={styles.subtitle}>Login and get started</Text>
      </View>
      <KeyboardAvoidingView style={styles.KeyboardAvoidingView}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <CustomInput
            label="Student ID *"
            value={formData.studentID}
            onChangeText={handleStudentIDChange}
            error={touched.studentID && errors.studentID}
            placeholder="OAIS-0000"
            autoCapitalize="characters"
            leftIcon={<Icon name="id-card" size={20} color="#666" />}
          />

          <CustomInput
            label="Email *"
            value={formData.email}
            onChangeText={(text) => {
              setFormData(prev => ({ ...prev, email: text }));
              if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
            }}
            error={touched.email && errors.email}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Icon name="mail" size={20} color="#666" />}
          />
          
          <CustomInput
            label="Password *"
            value={formData.password}
            onChangeText={(text) => {
              setFormData(prev => ({ ...prev, password: text }));
              if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
            }}
            error={touched.password && errors.password}
            placeholder="Enter your password"
            secureTextEntry
            leftIcon={<Icon name="lock-closed" size={20} color="#666" />}
          />

          <TouchableOpacity 
            style={styles.forgotPassword} 
            onPress={() => navigation.navigate('Forgot')}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          {errors.submit && (
            <View style={styles.errorContainer}>
              <Icon name='sad-outline' size={20} color='#d32f2f' />
              <Text style={styles.errorText}>{errors.submit}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <View style={styles.buttonContent}>
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.submitButtonText}>Login</Text>
              )}
            </View>
          </TouchableOpacity>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signupLink}>Sign Up</Text>
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  forgotPasswordText: {
    color: '#03AC13',
    fontSize: 14,
    fontWeight: '500',
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
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  signupText: {
    color: '#666',
    fontSize: 16,
  },
  signupLink: {
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

export default Login;