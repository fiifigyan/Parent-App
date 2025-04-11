import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import { API_CONFIG, STORAGE_KEYS, SCOPES, safeTokenLog } from '../config';

const setAuthHeader = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization-Mobile'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization-Mobile'];
  }
};

const manageAuthToken = async (token) => {
  try {
    if (token) {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      setAuthHeader(token);
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      setAuthHeader(null);
    }
  } catch (error) {
    console.error('[Auth] Token management failed:', error);
    throw new Error('Failed to maintain your session. Please log in again.');
  }
};

const processAuthResponse = (response) => {
  if (!response.data) {
    throw new Error('We encountered a server issue. Please try again.');
  }

  if (typeof response.data === 'string') {
    const message = response.data.split('%')[0].trim();
    const tokenMatch = response.data.match(/eyJhbGciOiJIUzUxMiJ9\.[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+/);
    
    if (tokenMatch) {
      return { 
        message: message || 'Operation completed successfully', 
        token: tokenMatch[0] 
      };
    }
    throw new Error(message || 'Unexpected response from server');
  }

  if (response.data.token) {
    return response.data;
  }

  if (response.data.error) {
    switch (response.data.error) {
      case 'EMAIL_EXISTS':
        throw new Error('This email is already registered. Please log in or reset your password.');
      case 'INVALID_CREDENTIALS':
        throw new Error('The email or password is incorrect. Please try again.');
      case 'ACCOUNT_LOCKED':
        throw new Error('Too many failed attempts. Try again in 15 minutes or reset your password.');
      default:
        throw new Error(response.data.message || 'An unexpected error occurred');
    }
  }

  throw new Error(response.data.message || 'Unexpected response format');
};

const makeAuthRequest = async (endpoint, data) => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;

  // Debugging - only shown in development
  if (__DEV__) {
    console.groupCollapsed(`🌐 [Network] ${endpoint}`);
    console.log('Request to:', url);
    console.log('Payload:', { 
      ...data, 
      password: data.password ? '••••••' : undefined 
    });
    console.groupEnd();
  }

  try {
    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: API_CONFIG.REQUEST_TIMEOUT || 10000
    });

    return processAuthResponse(response);

  } catch (error) {
    if (__DEV__) {
      console.groupCollapsed(`❌ [Error Details] ${endpoint}`);
      console.log('Full Error:', error);
      console.log('Status Code:', error.response?.status);
      console.log('Server Response:', error.response?.data);
      console.groupEnd();
    }
    let userMessage = 'Something went wrong. Please try again.';
    
    if (error.code === 'ECONNABORTED') {
      userMessage = 'Connection timed out. Check your internet connection.';
    } else if (error.response) {
      switch (error.response.status) {
        case 400:
          userMessage = 'Invalid request. Please check your information.';
          break;
        case 401:
          userMessage = 'Session expired. Please log in again.';
          break;
        case 403:
          userMessage = 'You don\'t have permission for this action.';
          break;
        case 404:
          userMessage = 'Service unavailable. Please try later.';
          break;
        case 500:
          userMessage = 'Server error. Our team has been notified.';
          break;
      }
    } else if (error.request) {
      userMessage = 'No response from server. Check your network.';
    }

    throw new Error(userMessage);
  }
};

const AuthService = {
  async signup(userData) {
    try {
      const result = await makeAuthRequest(API_CONFIG.AUTH_ENDPOINTS.SIGNUP, userData);
      safeTokenLog(result.token, 'Signup');
      await manageAuthToken(result.token);
      return {
        ...result,
        message: result.message || 'Account created successfully!',
        scopes: SCOPES.ADMISSION_PHASE,
        user: {
          ...result.user,
          isAdmissionApproved: false,
          isNewUser: true,
        }
      };
    } catch (error) {
      console.error('Signup failed:', error);
      throw new Error(error.message || 'Registration failed. Please try again.');
    }
  },
  
  async login(credentials) {
    try {
      const result = await makeAuthRequest(API_CONFIG.AUTH_ENDPOINTS.LOGIN, credentials);
      safeTokenLog(result.token, 'Login');
      await manageAuthToken(result.token);

      const scopes = result.user?.isAdmissionApproved 
        ? SCOPES.MAIN_APP 
        : SCOPES.ADMISSION_PHASE;
  
      return {
        ...result,
        message: result.message || 'Logged in successfully!',
        scopes,
      };
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error(error.message || 'Login failed. Please check your credentials.');
    }
  },

  async forgotPassword(email) {
    try {
      const result = await makeAuthRequest(API_CONFIG.AUTH_ENDPOINTS.FORGOT_PASSWORD, { email });
      return {
        ...result,
        message: result.message || 'Password reset instructions sent to your email.'
      };
    } catch (error) {
      console.error('Forgot password failed:', error);
      throw new Error(error.message || 'Failed to send reset instructions. Please try again.');
    }
  },

  async resetPassword(token, newPassword) {
    try {
      const result = await makeAuthRequest(API_CONFIG.AUTH_ENDPOINTS.RESET_PASSWORD, { 
        token, 
        newPassword 
      });
      await manageAuthToken(result.token);
      return {
        ...result,
        message: result.message || 'Password reset successfully!'
      };
    } catch (error) {
      console.error('Reset password failed:', error);
      throw new Error(error.message || 'Password reset failed. Please try again.');
    }
  },

  async logout() {
    try {
      await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.AUTH_ENDPOINTS.LOGOUT}`);
      await manageAuthToken(null);
      return { 
        success: true,
        message: 'Logged out successfully' 
      };
    } catch (error) {
      console.error('Logout API failed:', error);
      await manageAuthToken(null);
      throw new Error('Logged out (connection issue)');
    }
  },

  async verifyToken() {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (!token) return null;
  
      const decoded = jwtDecode(token);
      if (decoded.exp && Date.now() >= decoded.exp * 1000) {
        await this.logout();
        return null;
      }
  
      return { 
        token, 
        payload: decoded,
        scopes: decoded.scope ? decoded.scope.split(' ') : []
      };
    } catch (error) {
      console.error('Token verification failed:', error);
      await this.logout();
      return null;
    }
  }
};

export default AuthService;