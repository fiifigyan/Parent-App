import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  ActivityIndicator, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  KeyboardAvoidingView 
} from 'react-native';
import CustomInput from '../components/CustomInput';
import SuccessModal from '../components/SuccessModal';
import { AuthContext } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/Ionicons';
import { API_CONFIG } from '../config';

const ResetPassword = ({ navigation, route }) => {
  const { token } = route.params;
  const [userInfo, setUserInfo] = useState({
    password: '',
    confirmPassword: '',
  });
  const [touched, setTouched] = useState({
    password: false,
    confirmPassword: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { resetPassword } = useContext(AuthContext);

  const validateField = (name, value) => {
    const { minLength, needsUppercase, needsNumber, needsSpecialChar } = API_CONFIG.PASSWORD_REQUIREMENTS;
    
    if (name === 'password') {
      if (value.length < minLength) return `Password must be at least ${minLength} characters`;
      if (needsUppercase && !/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter';
      if (needsNumber && !/\d/.test(value)) return 'Password must contain at least one number';
      if (needsSpecialChar && !/[@$!%*?&]/.test(value)) return 'Password must contain at least one special character';
    }
    if (name === 'confirmPassword' && value !== userInfo.password) {
      return 'Passwords do not match';
    }
    return '';
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(userInfo).forEach((key) => {
      const error = validateField(key, userInfo[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReset = async () => {
    setTouched({ password: true, confirmPassword: true });
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      await resetPassword(token, userInfo.password);
      setIsModalVisible(true);
    } catch (error) {
      setErrors({ submit: error.message || 'Unable to reset password. Please try again later.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (name, text) => {
    setUserInfo(prev => ({ ...prev, [name]: text }));
    if (touched[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create New Password</Text>
        <Text style={styles.subtitle}>
          Your new password must be different from previously used passwords.
        </Text>
      </View>
      <KeyboardAvoidingView style={styles.KeyboardAvoidingView}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <CustomInput
            label="New Password"
            placeholder="Enter new password"
            value={userInfo.password}
            onChangeText={(text) => handleInputChange('password', text)}
            error={touched.password && errors.password}
            secureTextEntry
            onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
            leftIcon={<Icon name="lock-closed" size={20} color="#666" />}
          />

          <CustomInput
            label="Confirm New Password"
            placeholder="Confirm new password"
            value={userInfo.confirmPassword}
            onChangeText={(text) => handleInputChange('confirmPassword', text)}
            error={touched.confirmPassword && errors.confirmPassword}
            secureTextEntry
            onBlur={() => setTouched(prev => ({ ...prev, confirmPassword: true }))}
            leftIcon={<Icon name="lock-closed" size={20} color="#666" />}
          />

          {errors.submit && (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle" size={20} color="#d32f2f" />
              <Text style={styles.errorText}>{errors.submit}</Text>
            </View>
          )}

          <TouchableOpacity 
            style={[styles.button, isLoading && styles.buttonDisabled]} 
            onPress={handleReset}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Reset Password</Text>
            )}
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.requirementsContainer}>
          <Text style={styles.requirementsTitle}>Password Requirements:</Text>
          <Text style={styles.requirementItem}>
            • Minimum {API_CONFIG.PASSWORD_REQUIREMENTS.minLength} characters
          </Text>
          {API_CONFIG.PASSWORD_REQUIREMENTS.needsUppercase && (
            <Text style={styles.requirementItem}>• At least one uppercase letter</Text>
          )}
          {API_CONFIG.PASSWORD_REQUIREMENTS.needsNumber && (
            <Text style={styles.requirementItem}>• At least one number</Text>
          )}
          {API_CONFIG.PASSWORD_REQUIREMENTS.needsSpecialChar && (
            <Text style={styles.requirementItem}>• At least one special character</Text>
          )}
        </View>
      </KeyboardAvoidingView>

      <SuccessModal
        visible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
          navigation.navigate('Login');
        }}
        title="Password Reset Successful"
        message="Your password has been reset successfully. You can now log in with your new password."
        buttonText="Go to Login"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'aliceblue',
  },
  header: {
    padding: 20,
    backgroundColor: '#03AC13',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
  KeyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  button: {
    backgroundColor: '#03AC13',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  requirementsContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    margin: 20,
  },
  requirementsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  requirementItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginLeft: 8,
  },
});

export default ResetPassword;