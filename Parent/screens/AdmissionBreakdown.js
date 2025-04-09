import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { DataTable } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import { shareAsync } from 'expo-sharing';
import Toast from 'react-native-toast-message';

const Breakdown = ({ navigation }) => {

  const [selectedLevel, setSelectedLevel] = useState('Creche');
  const [selectedGender, setSelectedGender] = useState('Unisex');
  const [expandedSections, setExpandedSections] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  const feeStructure = {
    levels: ['Creche', 'N1-KG2', 'Grade1-3', 'Grade4-6', 'JHS'],
    genders: ['Unisex', 'Boys', 'Girls'],
    items: [
      { 
        id: 'admission', 
        name: 'Admission Process', 
        creche: 500, 
        n1_kg2_boys: 500, n1_kg2_girls: 500,
        grade1_3_boys: 500, grade1_3_girls: 500,
        grade4_6_boys: 500, grade4_6_girls: 500,
        jhs_boys: 500, jhs_girls: 500,
        description: 'Covers registration, processing, and student ID card'
      },
      { 
        id: 'items', 
        name: 'Admission Items', 
        creche: 500,
        n1_kg2_boys: 500, n1_kg2_girls: 500,
        grade1_3_boys: 500, grade1_3_girls: 500,
        grade4_6_boys: 500, grade4_6_girls: 500,
        jhs_boys: 500, jhs_girls: 500,
        description: 'Includes school prospectus and necessary materials'
      },
      { 
        id: 'uniforms', 
        name: 'Uniforms (3 Pieces)', 
        creche: 450,
        n1_kg2_boys: 545, n1_kg2_girls: 505,
        grade1_3_boys: 585, grade1_3_girls: 558,
        grade4_6_boys: 625, grade4_6_girls: 598,
        jhs_boys: 765, jhs_girls: 725,
        description: 'Complete school uniform set'
      },
      { 
        id: 'tuition', 
        name: 'Tuition Fee', 
        creche: 220,
        n1_kg2_boys: 220, n1_kg2_girls: 220,
        grade1_3_boys: 190, grade1_3_girls: 190,
        grade4_6_boys: 240, grade4_6_girls: 240,
        jhs_boys: 340, jhs_girls: 340,
        description: 'Termly tuition fees'
      },
      { 
        id: 'sanitation', 
        name: 'Sanitation, Health & Safety', 
        creche: 10,
        n1_kg2_boys: 10, n1_kg2_girls: 10,
        grade1_3_boys: 10, grade1_3_girls: 10,
        grade4_6_boys: 40, grade4_6_girls: 40,
        jhs_boys: 40, jhs_girls: 40,
        description: 'Health and safety maintenance'
      },
      { 
        id: 'exams', 
        name: 'Exams/Stationeries', 
        creche: 50,
        n1_kg2_boys: 50, n1_kg2_girls: 50,
        grade1_3_boys: 50, grade1_3_girls: 50,
        grade4_6_boys: 50, grade4_6_girls: 50,
        jhs_boys: 50, jhs_girls: 50,
        description: 'Examination fees and stationery'
      },
      { 
        id: 'facility', 
        name: 'Academic Facility', 
        creche: 50,
        n1_kg2_boys: 50, n1_kg2_girls: 50,
        grade1_3_boys: 60, grade1_3_girls: 60,
        grade4_6_boys: 60, grade4_6_girls: 60,
        jhs_boys: 70, jhs_girls: 70,
        description: 'Maintenance of academic facilities'
      },
      { 
        id: 'levy', 
        name: 'Usage/Maintenance Development Levy', 
        creche: 30,
        n1_kg2_boys: 30, n1_kg2_girls: 30,
        grade1_3_boys: 30, grade1_3_girls: 30,
        grade4_6_boys: 30, grade4_6_girls: 30,
        jhs_boys: 30, jhs_girls: 30,
        description: 'School development and maintenance'
      },
      { 
        id: 'pta', 
        name: 'P.T.A', 
        creche: 20,
        n1_kg2_boys: 20, n1_kg2_girls: 20,
        grade1_3_boys: 20, grade1_3_girls: 20,
        grade4_6_boys: 20, grade4_6_girls: 20,
        jhs_boys: 20, jhs_girls: 20,
        description: 'Parent Teacher Association dues'
      },
      { 
        id: 'gnaps', 
        name: 'GNAPS', 
        creche: 10,
        n1_kg2_boys: 10, n1_kg2_girls: 10,
        grade1_3_boys: 10, grade1_3_girls: 10,
        grade4_6_boys: 10, grade4_6_girls: 10,
        jhs_boys: 10, jhs_girls: 10,
        description: 'Ghana National Association of Private Schools dues'
      },
      { 
        id: 'utility', 
        name: 'Utility', 
        creche: 50,
        n1_kg2_boys: 50, n1_kg2_girls: 50,
        grade1_3_boys: 50, grade1_3_girls: 50,
        grade4_6_boys: 50, grade4_6_girls: 50,
        jhs_boys: 50, jhs_girls: 50,
        description: 'School utility bills'
      },
      { 
        id: 'motivation', 
        name: 'Staff Motivation', 
        creche: 10,
        n1_kg2_boys: 10, n1_kg2_girls: 10,
        grade1_3_boys: 20, grade1_3_girls: 20,
        grade4_6_boys: 20, grade4_6_girls: 20,
        jhs_boys: 20, jhs_girls: 20,
        description: 'Staff welfare and motivation'
      },
      { 
        id: 'total', 
        name: 'TOTAL (GHC)', 
        creche: 1900,
        n1_kg2_boys: 1995, n1_kg2_girls: 1955,
        grade1_3_boys: 2025, grade1_3_girls: 1998,
        grade4_6_boys: 2145, grade4_6_girls: 2118,
        jhs_boys: 2395, jhs_girls: 2355
      }
    ]
  };

  // Let's calculate fees based on selections
  const calculateCurrentFees = () => {
    if (selectedLevel === 'Creche') {
      return {
        items: feeStructure.items.map(item => ({
          ...item,
          amount: item.creche || 0,
          description: item.description || ''
        })),
        total: feeStructure.items.find(item => item.id === 'total').creche
      };
    }

    const genderSuffix = selectedGender === 'Boys' ? '_boys' : '_girls';
    const levelKey = selectedLevel.toLowerCase().replace('-', '_') + genderSuffix;
    
    return {
      items: feeStructure.items.map(item => ({
        ...item,
        amount: item[levelKey] || 0,
        description: item.description || ''
      })),
      total: feeStructure.items.find(item => item.id === 'total')[levelKey]
    };
  };

  const currentFees = calculateCurrentFees();
  const admissionFormPrice = 100;

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const generatePDF = async () => {
    try {
      setIsProcessing(true);

      const html = `
        <html>
          <head>
            <style>
              body { font-family: Arial; padding: 20px; }
              .header { text-align: center; margin-bottom: 20px; }
              h1 { color: #03AC13; margin-bottom: 5px; }
              h2 { color: #333; margin-top: 0; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
              th { background-color: #f2f2f2; font-weight: bold; }
              .total-row { font-weight: bold; background-color: #E8F5E9; }
              .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
              .note { font-style: italic; margin-top: 5px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>OFORI-ATTAH INTERNATIONAL SCHOOL</h1>
              <h2>Fee Breakdown - Academic Year 2024/2025</h2>
              <p>${selectedLevel} ${selectedGender !== 'Unisex' ? `(${selectedGender})` : ''}</p>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Amount (GHC)</th>
                </tr>
              </thead>
              <tbody>
                ${currentFees.items.filter(item => item.id !== 'total').map(item => `
                  <tr>
                    <td>${item.name}${item.description ? `<div class="note">${item.description}</div>` : ''}</td>
                    <td>${item.amount.toFixed(2)}</td>
                  </tr>
                `).join('')}
                
                <tr class="total-row">
                  <td>TOTAL FEES</td>
                  <td>${currentFees.total.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
            
            <div class="footer">
              <p>Generated on ${new Date().toLocaleDateString()}</p>
              <p>This is a computer generated document - No signature required</p>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });

      const fileName = `OAIS_Fees_${selectedLevel}_${selectedGender}_${Date.now()}.pdf`;
      const newUri = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.copyAsync({ from: uri, to: newUri });

      await shareAsync(newUri);

      Toast.show({
        type: 'success',
        text1: 'PDF Saved Successfully',
        text2: 'The fee breakdown has been saved and shared.',
      });

    } catch (error) {
      console.error('PDF generation failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Generation Failed',
        text2: 'Could not generate PDF. Please try again.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const navigateToAdmissionPurchase = () => {
    navigation.navigate('AdmissionPurchase', {
      level: selectedLevel,
      gender: selectedGender,
      amount: currentFees.total,
      feeDetails: currentFees.items,
      admissionFormPrice: admissionFormPrice
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.header}>Bill For New Admissions</Text>
        
        {/* Selection Controls */}
        <View style={styles.controlsContainer}>
          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Select Level:</Text>
            <Picker
              selectedValue={selectedLevel}
              style={styles.picker}
              onValueChange={setSelectedLevel}
              dropdownIconColor="#03AC13"
            >
              {feeStructure.levels.map(level => (
                <Picker.Item key={level} label={level} value={level} />
              ))}
            </Picker>
          </View>

          {selectedLevel !== 'Creche' && (
            <View style={styles.pickerContainer}>
              <Text style={styles.label}>Select Gender:</Text>
              <Picker
                selectedValue={selectedGender}
                style={styles.picker}
                onValueChange={setSelectedGender}
                dropdownIconColor="#03AC13"
              >
                {feeStructure.genders.filter(g => g !== 'Unisex').map(gender => (
                  <Picker.Item key={gender} label={gender} value={gender} />
                ))}
              </Picker>
            </View>
          )}
        </View>
        {/* Price og the Admission Form */}
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Price of Admission Form: </Text>
          <Text style={styles.priceAmt}>GHC {admissionFormPrice.toFixed(2)}</Text>
        </View>
        {/* Fee Breakdown Table */}
        <DataTable style={styles.dataTable}>
          <DataTable.Header style={styles.tableHeader}>
            <DataTable.Title style={styles.tableHeaderTitle}>Description</DataTable.Title>
            <DataTable.Title numeric style={styles.tableHeaderTitle}>Amount (GHS)</DataTable.Title>
          </DataTable.Header>

          {currentFees.items.filter(item => item.id !== 'total').map(item => (
            <React.Fragment key={item.id}>
              <DataTable.Row 
                onPress={() => toggleSection(item.id)}
                style={styles.tableRow}
              >
                <DataTable.Cell style={styles.tableCell}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Icon 
                      name={expandedSections[item.id] ? 'expand-less' : 'expand-more'} 
                      size={22} 
                      color="#03AC13" 
                    />
                  </View>
                </DataTable.Cell>
                <DataTable.Cell numeric style={styles.tableCell}>
                  <Text style={styles.amountText}>{item.amount.toFixed(2)}</Text>
                </DataTable.Cell>
              </DataTable.Row>
              
              {expandedSections[item.id] && item.description && (
                <DataTable.Row style={styles.detailsRow}>
                  <DataTable.Cell style={styles.detailsCell}>
                    <Text style={styles.detailsText}>{item.description}</Text>
                  </DataTable.Cell>
                </DataTable.Row>
              )}
            </React.Fragment>
          ))}

          {/* Total Row */}
          <DataTable.Row style={styles.totalRow}>
            <DataTable.Cell style={styles.totalCell}>
              <Text style={styles.totalText}>TOTAL FEES</Text>
            </DataTable.Cell>
            <DataTable.Cell numeric style={styles.totalCell}>
              <Text style={styles.totalAmount}>{currentFees.total.toFixed(2)}</Text>
            </DataTable.Cell>
          </DataTable.Row>
        </DataTable>

        {/* Required Items Section */}
        <View style={styles.itemsSection}>
          <Text style={styles.sectionTitle}>REQUIRED ITEMS</Text>
          {getRequiredItems(selectedLevel).map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <Icon name="check-circle" size={18} color="#4CAF50" />
              <Text style={styles.itemText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Important Notes */}
        <View style={styles.notesSection}>
          <Text style={styles.sectionTitle}>IMPORTANT NOTES</Text>
          <View style={styles.noteItem}>
            <Text style={styles.noteText}>• Fees are payable in full at the beginning of each term</Text>
          </View>
          <View style={styles.noteItem}>
            <Text style={styles.noteText}>• 10% discount for siblings</Text>
          </View>
          <View style={styles.noteItem}>
            <Text style={styles.noteText}>• Payment plans available upon request</Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons - Fixed at bottom */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.saveButton, isProcessing && styles.disabledButton]}
          onPress={generatePDF}
          disabled={isProcessing}
        >
          <Icon name="picture-as-pdf" size={20} color="#03AC13" />
          <Text style={styles.saveButtonText}>
            {isProcessing ? 'Processing...' : 'Save as PDF'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.buyButton}
          onPress={navigateToAdmissionPurchase}
          disabled={isProcessing}
        >
          <Icon name="shopping-cart" size={20} color="aliceblue" />
          <Text style={styles.buyButtonText}>Buy Admission</Text>
        </TouchableOpacity>
        
      </View>
    </View>
  );
};

const getRequiredItems = (level) => {
  const baseItems = [
    'Passport Size Photo',
    'Birth Certificate (Photocopy)',
    'Immunization Records',
    'Previous School Report Card (if applicable)'
  ];
  
  if (level === 'Creche' || level === 'N1-KG2') {
    return [...baseItems, '1 Bowl with cover', '1 Stainless steel spoon'];
  }
  return baseItems;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'aliceblue',
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
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15
  },
  pickerContainer: {
    flex: 1,
    marginHorizontal: 5
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    color: '#555',
    fontWeight: '500'
  },
  picker: {
    backgroundColor: 'aliceblue',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#03AC13'
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'aliceblue',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15
  },
  priceLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#03AC13'
  },
  priceAmt: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#03AC13'
  },
  dataTable: {
    backgroundColor: 'aliceblue',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 20
  },
  tableHeader: {
    backgroundColor: '#03AC13'
  },
  tableHeaderTitle: {
    color: 'aliceblue',
    fontWeight: 'bold',
    fontSize: 16
  },
  tableRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  tableCell: {
    justifyContent: 'center'
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1
  },
  itemName: {
    flex: 1,
    marginRight: 10
  },
  amountText: {
    color: '#333'
  },
  detailsRow: {
    backgroundColor: '#f9f9f9'
  },
  detailsCell: {
    paddingVertical: 8
  },
  detailsText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic'
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
  itemsSection: {
    backgroundColor: 'aliceblue',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15
  },
  notesSection: {
    backgroundColor: 'aliceblue',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#03AC13',
    fontSize: 16
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5
  },
  itemText: {
    marginLeft: 10
  },
  noteItem: {
    marginBottom: 5
  },
  noteText: {
    color: '#555'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0
  },
  buyButton: {
    flex: 1,
    backgroundColor: '#03AC13',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
  },
  saveButton: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#03AC13',
  },
  disabledButton: {
    opacity: 0.6
  },
  buyButtonText: {
    color: 'aliceblue',
    marginLeft: 8,
    fontWeight: 'bold',
    fontSize: 16
  },
   saveButtonText: {
    color: '#03AC13',
    marginLeft: 8,
    fontWeight: 'bold',
    fontSize: 16
  }
});

export default Breakdown;