import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { PaymentContext } from '../context/PaymentContext';

const Fees = ({ navigation }) => {
  const { payments, error } = useContext(PaymentContext);

  // Mock fee data (replace with actual data from your backend)
  const fees = [
    { id: '1', description: 'Tuition Fee', amount: 500, status: 'Pending', dueDate: '2023-12-15' },
    { id: '2', description: 'Library Fee', amount: 50, status: 'Paid', paidDate: '2023-11-20' },
    { id: '3', description: 'Sports Fee', amount: 30, status: 'Pending', dueDate: '2023-12-10' },
  ];

  const totalAmount = fees
    .filter((fee) => fee.status === 'Pending')
    .reduce((sum, fee) => sum + fee.amount, 0);

  const handlePayNow = () => {
    navigation.navigate('Payment', { totalAmount });
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#03AC13', '#03C04A']} style={styles.header}>
        <Text style={styles.headerTitle}>Fee Details</Text>
        <Text style={styles.headerSubtitle}>Outstanding balance</Text>
        <Text style={styles.totalAmount}>GHS {totalAmount.toFixed(2)}</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Fee List */}
        {fees.map((fee) => (
          <View key={fee.id} style={[
            styles.feeItem,
            fee.status === 'Paid' && styles.paidFeeItem
          ]}>
            <View style={styles.feeIconContainer}>
              <Icon 
                name={fee.status === 'Paid' ? 'checkmark-circle' : 'time'} 
                size={24} 
                color={fee.status === 'Paid' ? '#4CAF50' : '#FF9800'} 
              />
            </View>
            <View style={styles.feeDetails}>
              <Text style={styles.feeDescription}>{fee.description}</Text>
              <Text style={styles.feeDate}>
                {fee.status === 'Paid' ? `Paid on ${fee.paidDate}` : `Due by ${fee.dueDate}`}
              </Text>
            </View>
            <View style={styles.feeAmountContainer}>
              <Text style={styles.feeAmount}>GHS {fee.amount.toFixed(2)}</Text>
              <Text style={[
                styles.feeStatus,
                fee.status === 'Paid' ? styles.paidStatus : styles.pendingStatus
              ]}>
                {fee.status}
              </Text>
            </View>
          </View>
        ))}

        {/* Pay Now Button */}
        <TouchableOpacity 
          style={styles.payButton} 
          onPress={handlePayNow}
          disabled={totalAmount <= 0}
        >
          <LinearGradient
            colors={['#03C04A', '#03AC13']}
            style={styles.payButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.payButtonText}>
              {totalAmount > 0 ? 'Pay Now' : 'All Fees Paid'}
            </Text>
            {totalAmount > 0 && <Icon name="arrow-forward" size={20} color="#fff" />}
          </LinearGradient>
        </TouchableOpacity>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Icon name="sad-outline" size={20} color="#FF5252" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9ff',
  },
  header: {
    padding: 25,
    paddingBottom: 30,
    borderBottomEndRadius: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 10,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  feeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  paidFeeItem: {
    opacity: 0.7,
  },
  feeIconContainer: {
    marginRight: 15,
  },
  feeDetails: {
    flex: 1,
  },
  feeDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  feeDate: {
    fontSize: 14,
    color: '#666',
  },
  feeAmountContainer: {
    alignItems: 'flex-end',
  },
  feeAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#03AC13',
    marginBottom: 5,
  },
  feeStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  paidStatus: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    color: '#4CAF50',
  },
  pendingStatus: {
    backgroundColor: 'rgba(255, 82, 82, 0.2)',
    color: '#FF5252',
  },
  payButton: {
    marginTop: 25,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  payButtonGradient: {
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  errorText: {
    color: '#d32f2f',
    marginLeft: 10,
    fontSize: 14,
  },
});

export default Fees;