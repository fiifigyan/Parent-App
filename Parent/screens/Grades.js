import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, TextInput, Modal, Button } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, Feather } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const GradesScreen = () => {
  const [selectedTerm, setSelectedTerm] = useState('Term 1');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Sample data for grades
  const gradesData = {
    'Term 1': [
      { id: '1', subject: 'Mathematics', grade: 'A', progress: 90, details: { assignments: 95, exams: 85 } },
      { id: '2', subject: 'Science', grade: 'B+', progress: 85, details: { assignments: 80, exams: 90 } },
      { id: '3', subject: 'English', grade: 'A-', progress: 88, details: { assignments: 90, exams: 86 } },
      { id: '4', subject: 'History', grade: 'B', progress: 80, details: { assignments: 75, exams: 85 } },
      { id: '5', subject: 'Geography', grade: 'A', progress: 92, details: { assignments: 95, exams: 89 } },
    ],
    'Term 2': [
      { id: '6', subject: 'Mathematics', grade: 'A+', progress: 95, details: { assignments: 98, exams: 92 } },
      { id: '7', subject: 'Science', grade: 'A', progress: 90, details: { assignments: 85, exams: 95 } },
      { id: '8', subject: 'English', grade: 'B+', progress: 87, details: { assignments: 88, exams: 86 } },
      { id: '9', subject: 'History', grade: 'A-', progress: 89, details: { assignments: 90, exams: 88 } },
      { id: '10', subject: 'Geography', grade: 'B', progress: 82, details: { assignments: 80, exams: 84 } },
    ],
  };

  const terms = ['Term 1', 'Term 2'];

  // Filter grades based on search query
  const filteredGrades = gradesData[selectedTerm].filter((grade) =>
    grade.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle grade details modal
  const handleGradeDetails = (grade) => {
    setSelectedGrade(grade);
    setIsModalVisible(true);
  };

  // Generate and share PDF report
  const generateReport = async () => {
    const html = `
      <h1>Grade Report - ${selectedTerm}</h1>
      <table>
        <tr>
          <th>Subject</th>
          <th>Grade</th>
          <th>Progress</th>
        </tr>
        ${filteredGrades
          .map(
            (grade) => `
          <tr>
            <td>${grade.subject}</td>
            <td>${grade.grade}</td>
            <td>${grade.progress}%</td>
          </tr>
        `
          )
          .join('')}
      </table>
    `;

    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri);
  };

  const renderGradeItem = ({ item }) => (
    <TouchableOpacity style={styles.gradeItem} onPress={() => handleGradeDetails(item)}>
      <Text style={styles.subject}>{item.subject}</Text>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${item.progress}%` }]} />
      </View>
      <Text style={styles.gradeText}>{item.grade}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#03AC13', '#03C04A']} style={styles.header}>
        <Text style={styles.headerTitle}>Grades</Text>
      </LinearGradient>

      {/* Term Selector */}
      <View style={styles.termSelector}>
        {terms.map((term) => (
          <TouchableOpacity
            key={term}
            style={[styles.termButton, selectedTerm === term && styles.selectedTermButton]}
            onPress={() => setSelectedTerm(term)}
          >
            <Text style={[styles.termText, selectedTerm === term && styles.selectedTermText]}>
              {term}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by subject..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Grade Summary */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Overall Performance</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>GPA</Text>
            <Text style={styles.summaryValue}>3.8</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Marks</Text>
            <Text style={styles.summaryValue}>450/500</Text>
          </View>
        </View>
      </View>

      {/* Grades List */}
      <FlatList
        data={filteredGrades}
        renderItem={renderGradeItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.gradesList}
      />

      {/* Download Report Button */}
      <TouchableOpacity style={styles.downloadButton} onPress={generateReport}>
        <AntDesign name="download" size={20} color="#fff" />
        <Text style={styles.downloadButtonText}>Download Report</Text>
      </TouchableOpacity>

      {/* Grade Details Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedGrade?.subject} Details</Text>
            {selectedGrade && (
              <>
                <Text style={styles.modalText}>Grade: {selectedGrade.grade}</Text>
                <Text style={styles.modalText}>Assignments: {selectedGrade.details.assignments}%</Text>
                <Text style={styles.modalText}>Exams: {selectedGrade.details.exams}%</Text>
              </>
            )}
            <Button title="Close" onPress={() => setIsModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    borderBottomEndRadius: 80,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  termSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  termButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 5,
    backgroundColor: '#e0e0e0',
  },
  selectedTermButton: {
    backgroundColor: '#03AC13',
  },
  termText: {
    fontSize: 14,
    color: '#333',
  },
  selectedTermText: {
    color: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#333',
  },
  summaryContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#03AC13',
  },
  gradesList: {
    paddingHorizontal: 20,
  },
  gradeItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  subject: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#03AC13',
  },
  gradeText: {
    fontSize: 14,
    color: '#666',
  },
  downloadButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#03AC13',
    padding: 15,
    borderRadius: 10,
    margin: 20,
  },
  downloadButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
});

export default GradesScreen;