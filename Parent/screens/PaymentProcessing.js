import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

const PaymentProcessing = ({ route, navigation }) => {
  const { method, amount } = route.params;
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputs, setInputs] = useState({
    phoneNumber: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
    accountNumber: ''
  });
  const [errors, setErrors] = useState({});

  const validateMoMo = () => {
    const newErrors = {};
    if (!inputs.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!inputs.phoneNumber.match(/^0[0-9]{9}$/)) {
      newErrors.phoneNumber = 'Enter a valid 10-digit Ghanaian number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCreditCard = () => {
    const newErrors = {};
    if (!inputs.cardNumber) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!inputs.cardNumber.match(/^[0-9]{16}$/)) {
      newErrors.cardNumber = 'Enter a valid 16-digit card number';
    }
    if (!inputs.expiry) {
      newErrors.expiry = 'Expiry date is required';
    } else if (!inputs.expiry.match(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/)) {
      newErrors.expiry = 'Enter valid expiry (MM/YY)';
    }
    if (!inputs.cvv) {
      newErrors.cvv = 'CVV is required';
    } else if (!inputs.cvv.match(/^[0-9]{3,4}$/)) {
      newErrors.cvv = 'Enter valid 3 or 4-digit CVV';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateBankTransfer = () => {
    const newErrors = {};
    if (!inputs.accountNumber) {
      newErrors.accountNumber = 'Account number is required';
    } else if (!inputs.accountNumber.match(/^[0-9]{10}$/)) {
      newErrors.accountNumber = 'Enter a valid 10-digit account number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitPayment = () => {
    let isValid = false;
    
    switch (method) {
      case 'MoMo':
        isValid = validateMoMo();
        break;
      case 'Credit Card':
        isValid = validateCreditCard();
        break;
      case 'Bank Transfer':
        isValid = validateBankTransfer();
        break;
      default:
        break;
    }

    if (!isValid) return;

    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      navigation.replace('PaymentSuccess', { 
        amount,
        method,
        reference: `TX-${Math.random().toString(36).slice(2, 10).toUpperCase()}`
      });
    }, 2000);
  };

  const handleInputChange = (name, value) => {
    // Format inputs as they're entered
    let formattedValue = value;
    
    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').slice(0, 16);
    } else if (name === 'expiry') {
      formattedValue = value
        .replace(/\D/g, '')
        .replace(/^(\d{2})/, '$1/')
        .slice(0, 5);
    } else if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    } else if (name === 'phoneNumber' || name === 'accountNumber') {
      formattedValue = value.replace(/\D/g, '');
    }

    setInputs(prev => ({ ...prev, [name]: formattedValue }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const renderMethodForm = () => {
    switch (method) {
      case 'MoMo':
        return (
          <>
            <Text style={styles.label}>MoMo Phone Number</Text>
            <TextInput
              style={[styles.input, errors.phoneNumber && styles.errorInput]}
              placeholder="e.g., 0551234567"
              keyboardType="phone-pad"
              value={inputs.phoneNumber}
              onChangeText={(text) => handleInputChange('phoneNumber', text)}
              maxLength={10}
            />
            {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
            <Text style={styles.note}>
              A prompt will appear on your mobile money app
            </Text>
          </>
        );
      
      case 'Credit Card':
        return (
          <>
            <Text style={styles.label}>Card Number</Text>
            <TextInput
              style={[styles.input, errors.cardNumber && styles.errorInput]}
              placeholder="4242 4242 4242 4242"
              keyboardType="number-pad"
              value={inputs.cardNumber.replace(/(.{4})/g, '$1 ').trim()}
              onChangeText={(text) => handleInputChange('cardNumber', text)}
              maxLength={19}
            />
            {errors.cardNumber && <Text style={styles.errorText}>{errors.cardNumber}</Text>}
            
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.label}>Expiry Date</Text>
                <TextInput
                  style={[styles.input, errors.expiry && styles.errorInput]}
                  placeholder="MM/YY"
                  keyboardType="number-pad"
                  value={inputs.expiry}
                  onChangeText={(text) => handleInputChange('expiry', text)}
                  maxLength={5}
                />
                {errors.expiry && <Text style={styles.errorText}>{errors.expiry}</Text>}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>CVV</Text>
                <TextInput
                  style={[styles.input, errors.cvv && styles.errorInput]}
                  placeholder="123"
                  keyboardType="number-pad"
                  secureTextEntry
                  value={inputs.cvv}
                  onChangeText={(text) => handleInputChange('cvv', text)}
                  maxLength={4}
                />
                {errors.cvv && <Text style={styles.errorText}>{errors.cvv}</Text>}
              </View>
            </View>
          </>
        );
      
      case 'Bank Transfer':
        return (
          <>
            <Text style={styles.label}>Account Number</Text>
            <TextInput
              style={[styles.input, errors.accountNumber && styles.errorInput]}
              placeholder="1234567890"
              keyboardType="number-pad"
              value={inputs.accountNumber}
              onChangeText={(text) => handleInputChange('accountNumber', text)}
              maxLength={10}
            />
            {errors.accountNumber && <Text style={styles.errorText}>{errors.accountNumber}</Text>}
            
            <View style={styles.transferDetails}>
              <Text style={styles.bankTitle}>Bank Details</Text>
              <DetailRow icon="home" label="Bank Name" value="Fidelity Bank Ghana" />
              <DetailRow icon="code" label="Branch Code" value="GH-ACC-100" />
              <DetailRow icon="person" label="Account Name" value="Ofori Atta Int. School" />
            </View>
          </>
        );
      
      default:
        return null;
    }
  };

  const DetailRow = ({ icon, label, value }) => (
    <View style={styles.detailRow}>
      <Icon name={icon} size={18} color="#03AC13" style={styles.rowIcon} />
      <Text style={styles.detailLabel}>{label}:</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );

  return (
    <LinearGradient colors={['#f8f9ff', '#e6e9ff']} style={styles.container}>
      <View style={styles.header}>
        <Icon 
          name="arrow-back" 
          size={24} 
          color="#03AC13" 
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>Complete Payment</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.card}>
        <Text style={styles.amount}>GHS {amount.toFixed(2)}</Text>
        <Text style={styles.method}>Paying with {method}</Text>
        
        {renderMethodForm()}
      </View>

      <TouchableOpacity
        style={[styles.button, isProcessing && styles.buttonDisabled]}
        onPress={handleSubmitPayment}
        disabled={isProcessing}
      >
        <LinearGradient
          colors={isProcessing ? ['#03c04a', '#03AC13'] : ['#03AC13', '#03c04A']}
          style={styles.buttonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {isProcessing ? (
            <Text style={styles.buttonText}>Processing...</Text>
          ) : (
            <Text style={styles.buttonText}>
              {method === 'Bank Transfer' ? 'Confirm Transfer' : 'Authorize Payment'}
            </Text>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.securityBadge}>
        <Icon name="shield-checkmark" size={16} color="#4CAF50" />
        <Text style={styles.securityText}>Secured by Ghana Premier Academy</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#03AC13',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  amount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 5,
  },
  method: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    marginBottom: 5,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  errorInput: {
    borderColor: '#ff4444',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  note: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 10,
  },
  transferDetails: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 20,
  },
  bankTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#03AC13',
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rowIcon: {
    marginRight: 10,
    width: 24,
  },
  detailLabel: {
    width: 100,
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  button: {
    borderRadius: 25,
    overflow: 'hidden',
    marginTop: 10,
  },
  buttonGradient: {
    padding: 18,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  securityBadge: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  securityText: {
    color: '#4CAF50',
    fontSize: 14,
    marginLeft: 8,
  },
});

export default PaymentProcessing;