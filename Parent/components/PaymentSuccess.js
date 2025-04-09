import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

const PaymentSuccess = ({ route, navigation }) => {
  const { amount, method, reference } = route.params;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#03AC13', '#03C04A']} style={styles.header}>
        <Icon name="checkmark-circle" size={80} color="#fff" />
        <Text style={styles.successText}>Payment Successful!</Text>
      </LinearGradient>

      <View style={styles.card}>
        <DetailRow icon="cash" label="Amount" value={`GHS ${amount.toFixed(2)}`} />
        <DetailRow icon="card" label="Method" value={method} />
        <DetailRow icon="receipt" label="Reference" value={reference} />
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.replace('Admission')}
      >
        <Text style={styles.buttonText}>Done</Text>
      </TouchableOpacity>
    </View>
  );
};

// Reuse DetailRow component from PaymentProcessingScreen.
const DetailRow = ({ icon, label, value }) => (
  <View style={styles.detailRow}>
    <View style={styles.containerRow}>
      <Icon name={icon} size={18} color="#03AC13" style={styles.rowIcon} />
      <Text style={styles.detailLabel}>{label}:</Text>
    </View>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'aliceblue',
    gap: 20,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    borderBottomEndRadius: 30,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  containerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  detailValue: {
    fontSize: 16,
    color: '#2c3e50',
    flex: 1,
    textAlign: 'right',
  },
  successText: {
    color: 'aliceblue',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'aliceblue',
    borderRadius: 15,
    padding: 25,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  button: {
    backgroundColor: '#03AC13',
    borderRadius: 25,
    padding: 18,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: 'aliceblue',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PaymentSuccess;