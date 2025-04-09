import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { DataTable } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import { shareAsync } from 'expo-sharing';
import PaymentMethod from '../screens/PaymentMethod';

const AdmissionPurchase = ({ route, navigation }) => {
  const { level, gender, amount, feeDetails, admissionFormPrice } = route.params;
  
  const [studentName, setStudentName] = useState('');
  const [parentName, setParentName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [showPaymentMethod, setShowPaymentMethod] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const validateForm = () => {
    if (!studentName.trim()) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please enter student name' });
      return false;
    }
    if (!parentName.trim()) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please enter parent/guardian name' });
      return false;
    }
    if (!phoneNumber.trim() || phoneNumber.length < 10) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please enter a valid phone number' });
      return false;
    }
    return true;
  };

  const handlePaymentInitiation = () => {
    if (!validateForm()) return;
    setShowPaymentMethod(true);
  };

  const handlePaymentSuccess = async () => {
    setIsProcessing(true);
    try {
      await generateReceipt();
      
      Toast.show({
        type: 'success',
        text1: 'Payment Successful',
        text2: `Admission form for ${level} purchased successfully!`,
      });
      
      navigation.goBack();
    } catch (error) {
      console.error('Payment failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Payment Failed',
        text2: 'Could not complete payment. Please try again.',
      });
    } finally {
      setIsProcessing(false);
      setShowPaymentMethod(false);
    }
  };

  const generateReceipt = async () => {
    try {
      const html = `
        <html>
          <head>
            <style>
              body { font-family: Arial; padding: 20px; }
              .header { text-align: center; margin-bottom: 20px; }
              h1 { color: #03AC13; margin-bottom: 5px; }
              h2 { color: #333; margin-top: 0; }
              .info { margin-bottom: 20px; }
              .info-item { margin-bottom: 5px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
              th { background-color: #f2f2f2; font-weight: bold; }
              .total-row { font-weight: bold; background-color: #E8F5E9; }
              .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>OFORI-ATTAH INTERNATIONAL SCHOOL</h1>
              <h2>Admission Form Purchase Receipt</h2>
            </div>
            
            <div class="info">
              <div class="info-item"><strong>Date:</strong> ${new Date().toLocaleDateString()}</div>
              <div class="info-item"><strong>Transaction ID:</strong> OAIS-${Math.floor(Math.random() * 1000000)}</div>
              <div class="info-item"><strong>Student Name:</strong> ${studentName}</div>
              <div class="info-item"><strong>Parent/Guardian:</strong> ${parentName}</div>
              <div class="info-item"><strong>Contact:</strong> ${phoneNumber}</div>
              <div class="info-item"><strong>Level:</strong> ${level} ${gender !== 'Unisex' ? `(${gender})` : ''}</div>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Amount (GHC)</th>
                </tr>
              </thead>
              <tbody>
                ${feeDetails.filter(item => item.id !== 'total').map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.amount.toFixed(2)}</td>
                  </tr>
                `).join('')}
                
                <tr class="total-row">
                  <td>TOTAL PAID</td>
                  <td>${amount.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
            
            <div class="footer">
              <p>This is an official receipt for your records</p>
              <p>Please present this receipt when submitting the admission form</p>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      const fileName = `OAIS_Receipt_${studentName.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
      const newUri = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.copyAsync({ from: uri, to: newUri });
      await shareAsync(newUri);

    } catch (error) {
      console.error('Receipt generation failed:', error);
      throw error;
    }
  };

  if (showPaymentMethod) {
    return (
      <PaymentMethod 
        route={{ params: { totalAmount: amount } }}
        navigation={{
          ...navigation,
          replace: (screen, params) => {
            if (screen === 'PaymentSuccess') {
              handlePaymentSuccess();
            }
          }
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.header}>Purchase Admission Form</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>STUDENT INFORMATION</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Student Full Name</Text>
            <TextInput
              style={styles.input}
              value={studentName}
              onChangeText={setStudentName}
              placeholder="Enter student's full name"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Parent/Guardian Name</Text>
            <TextInput
              style={styles.input}
              value={parentName}
              onChangeText={setParentName}
              placeholder="Enter parent/guardian name"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email (Optional)</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter email address"
              keyboardType="email-address"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ORDER SUMMARY</Text>
          
          <DataTable style={styles.dataTable}>
            <DataTable.Header style={styles.tableHeader}>
              <DataTable.Title style={styles.tableHeaderTitle}>Description</DataTable.Title>
              <DataTable.Title numeric style={styles.tableHeaderTitle}>Amount (GHS)</DataTable.Title>
            </DataTable.Header>

            <DataTable.Row style={styles.tableRow}>
              <DataTable.Cell style={styles.tableCell}>
                <Text style={styles.itemName}>Admission Form</Text>
              </DataTable.Cell>
              <DataTable.Cell numeric style={styles.tableCell}>
                <Text style={styles.amountText}>{amount.toFixed(2)}</Text>
              </DataTable.Cell>
            </DataTable.Row>

            <DataTable.Row style={styles.totalRow}>
              <DataTable.Cell style={styles.totalCell}>
                <Text style={styles.totalText}>TOTAL</Text>
              </DataTable.Cell>
              <DataTable.Cell numeric style={styles.totalCell}>
                <Text style={styles.totalAmount}>{amount.toFixed(2)}</Text>
              </DataTable.Cell>
            </DataTable.Row>
          </DataTable>
        </View>

        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            By proceeding, you agree to our Terms of Service and Privacy Policy. 
          </Text>
          <View style={styles.securityInfo}>
            <Icon name="shield-checkmark" size={18} color="#4CAF50" />
            <Text style={styles.securityText}>Secure payment encrypted with SSL</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
      <TouchableOpacity 
        style={[styles.payButton, isProcessing && styles.disabledButton]}
        onPress={handlePaymentInitiation}
        disabled={isProcessing}
      >
        <Icon name="wallet-outline" size={20} color="aliceblue" />
        <Text style={styles.buttonText}>
          {isProcessing ? 'Processing...' : `Pay GHS ${amount.toFixed(2)}`}
        </Text>
      </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 80
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#03AC13',
    textAlign: 'center'
  },
  section: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#03AC13',
    fontSize: 16
  },
  inputContainer: {
    marginBottom: 15
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    color: '#555',
    fontWeight: '500'
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16
  },
  dataTable: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden'
  },
  tableHeader: {
    backgroundColor: '#03AC13',
  },
  tableHeaderTitle: {
    fontWeight: 'bold',
    color: 'aliceblue'
  },
  tableRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  tableCell: {
    justifyContent: 'center'
  },
  itemName: {
    color: '#333'
  },
  amountText: {
    color: '#333'
  },
  totalRow: {
    backgroundColor: '#E8F5E9',
    borderTopWidth: 1,
    borderTopColor: '#ddd'
  },
  totalCell: {
    justifyContent: 'center'
  },
  totalText: {
    fontWeight: 'bold',
    color: '#03AC13'
  },
  totalAmount: {
    fontWeight: 'bold',
    color: '#03AC13'
  },
  termsContainer: {
    padding: 10,
    marginBottom: 15
  },
  termsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center'
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10
  },
  securityText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0
  },
  payButton: {
    backgroundColor: '#03AC13',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8
  },
  disabledButton: {
    opacity: 0.6
  },
  buttonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: 'bold',
    fontSize: 16
  }
});

export default AdmissionPurchase;