import React, { createContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthService from '../services/AuthenService';
import jwtDecode from 'jwt-decode';
import { STORAGE_KEYS } from '../config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [authToken , setAuthToken] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  const hasScope = useCallback((requiredScope) => {
    if (!authToken) return false;
    
    try {
      const decoded = jwtDecode(authToken);
      const tokenScopes = decoded.scope ? decoded.scope.split(' ') : [];
      return tokenScopes.includes(requiredScope);
    } catch (error) {
      console.error('Scope check error:', error);
      return false;
    }
  }, [authToken]);

  const saveUserData = useCallback(async (data) => {
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.USER_INFO, JSON.stringify(data)],
        [STORAGE_KEYS.AUTH_TOKEN, data.token]
      ]);
    } catch (error) {
      console.error('Failed to save user data:', error);
      throw error;
    }
  }, []);

  const loadUserData = useCallback(async () => {
    try {
      const [userInfoString, token] = await AsyncStorage.multiGet([
        STORAGE_KEYS.USER_INFO, 
        STORAGE_KEYS.AUTH_TOKEN
      ]);
      
      if (userInfoString[1] && token[1]) {
        return JSON.parse(userInfoString[1]);
      }
      return null;
    } catch (error) {
      console.error('Failed to load user data:', error);
      return null;
    }
  }, []);

  const clearAuthData = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_INFO, 
        STORAGE_KEYS.AUTH_TOKEN
      ]);
      setUserInfo(null);
      setIsNewUser(false);
    } catch (error) {
      console.error('Failed to clear auth data:', error);
    }
  }, []);

  const initializeAuth = useCallback(async () => {
    try {
      const storedUser = await loadUserData();
      if (storedUser) {
        const tokenStatus = await AuthService.verifyToken();
        if (tokenStatus?.token) {
          setUserInfo(storedUser);
        } else {
          await clearAuthData();
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      setInitialLoading(false);
    }
  }, [loadUserData, clearAuthData]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const authActionWrapper = async (action, ...args) => {
    setIsLoading(true);
    try {
      return await action(...args);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = (credentials) => authActionWrapper(async () => {
    const userData = await AuthService.login(credentials);
    await saveUserData(userData);
    setUserInfo(userData);
    setIsNewUser(false);
    return userData;
  });

  const register = (userData) => authActionWrapper(async () => {
    const response = await AuthService.signup(userData);
    await saveUserData(response);
    setUserInfo(response);
    setIsNewUser(true);
    return response;
  });

  const forgotPassword = (email) => authActionWrapper(() => 
    AuthService.forgotPassword(email)
  );

  const resetPassword = (token, password) => authActionWrapper(() => 
    AuthService.resetPassword(token, password)
  );

  const logout = () => authActionWrapper(async () => {
    try {
      await AuthService.logout();
    } finally {
      await clearAuthData();
    }
  });

  return (
    <AuthContext.Provider
      value={{
        userInfo,
        initialLoading,
        isLoading,
        isNewUser,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        hasScope,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};