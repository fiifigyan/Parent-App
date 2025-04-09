import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icons from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../context/AuthContext';

const ScopeGuard = ({ children, requiredScope, fallbackComponent }) => {
  const { hasScope } = useAuth();

  if (hasScope(requiredScope)) {
    return children;
  }

  return fallbackComponent || (
    <View style={styles.container}>
      <Icons name="lock" size={50} color="#D32F2F" />
      <Text style={styles.text}>Access Denied!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 18,
    textAlign: 'center',
    color: '#D32F2F',
  },
});

export default ScopeGuard;