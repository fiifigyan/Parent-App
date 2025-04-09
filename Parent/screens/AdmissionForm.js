import React, { useContext, useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, SafeAreaView, Alert, Platform, KeyboardAvoidingView, Switch } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import { useNavigation } from '@react-navigation/native';
import { AdmissionContext } from '../context/AdmissionContext';
import { useAuth } from '../context/AuthContext';
import SuccessModal from '../components/SuccessModal';
import Icon from 'react-native-vector-icons/MaterialIcons';

const AdmissionForm = () => {
  const navigation = useNavigation();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [fileValidationErrors, setFileValidationErrors] = useState({});
  const [applicationId, setApplicationId] = useState(null);
  
  const { formData, isLoading, error, validationErrors, draftSaveStatus, updateFormData, submitForm, resetForm, clearError } = useContext(AdmissionContext);

  const { hasScope } = useAuth();

  useEffect(() => {
    setSubmitError(null);
  }, [formData]);

  useEffect(() => {
    if (error) {
      setSubmitError(error);
    }
  }, [error]);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      handleChange('student.dateOfBirth', formattedDate);
    }
  };

  const handleChange = (path, value) => {
    const buildNestedUpdate = (path, value) => {
      const keys = path.split('.');
      const lastKey = keys.pop();
      
      if (keys.length === 0) {
        return { [lastKey]: value };
      }
      
      let result = {};
      let current = result;
      
      for (const key of keys) {
        current[key] = {};
        current = current[key];
      }
      
      current[lastKey] = value;
      return result;
    };
    
    updateFormData(buildNestedUpdate(path, value));
  };

  const handleDocumentPick = async (field) => {
    try {
      setFileValidationErrors(prev => ({ ...prev, [field]: null }));
  
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
        copyToCacheDirectory: true,
        multiple: false,
      });
  
      if (result.canceled) {
        console.log('Document picking canceled');
        return;
      }
  
      if (result.assets && result.assets.length > 0) {
        const file = result.assets[0];
  
        if (!file.name || !file.uri || !file.size) {
          Alert.alert('Error', 'Invalid file selected. Please try again.');
          return;
        }
  
        const fileInfo = { name: file.name, uri: file.uri, size: file.size };
        handleChange(`documents.${field}`, fileInfo);
      }
    } catch (error) {
      console.error('Document picker error:', error);
      Alert.alert('Error', 'Failed to select document. Please try again.');
    }
  };

  const handleSubmit = async () => {
    try {
      // Check if user has required scope
      if (!hasScope('submit:admission')) {
        Alert.alert(
          'Permission Required',
          'You need to purchase admission first before submitting the form.',
          [
            {
              text: 'Cancel',
              style: 'cancel'
            },
            { 
              text: 'Purchase Admission', 
              onPress: () => navigation.navigate('AdmissionBreakdown') 
            }
          ]
        );
        return;
      }

      clearError();
      setSubmitError(null);
      
      const result = await submitForm();
      if (result && result.id) {
        setShowSuccessModal(true);
        setApplicationId(result.id);
      }
    } catch (error) {
      setSubmitError(error.message || 'An unexpected error occurred. Please try again.');
      Alert.alert('Submission Failed', error.message || 'An unexpected error occurred. Please try again.');
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigation.navigate('AdmissionStatus', { applicationId });
  };

  const renderInput = (label, path, keyboardType = 'default', placeholder = '') => {
    const getValue = (obj, path) => {
      return path.split('.').reduce((acc, part) => {
        return acc && acc[part] !== undefined ? acc[part] : '';
      }, obj);
    };
    
    const value = getValue(formData, path);
    const isRequired = label.includes('*');
    
    return (
      <View style={styles.inputContainer}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          style={[
            styles.input, 
            validationErrors[path] && styles.errorInput
          ]}
          value={String(value)}
          onChangeText={text => handleChange(path, text)}
          keyboardType={keyboardType}
          placeholder={placeholder}
          accessibilityLabel={label}
        />
        {validationErrors[path] && (
          <Text style={styles.errorText}>{validationErrors[path]}</Text>
        )}
      </View>
    );
  };

  const renderDateInput = (label, path) => {
    const value = path.split('.').reduce((obj, key) => obj?.[key], formData) || '';
    
    return (
      <View style={styles.inputContainer}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.dateInputContainer}>
          <TextInput
            style={[
              styles.input,
              styles.dateInput,
              validationErrors[path] && styles.errorInput
            ]}
            value={value}
            placeholder="YYYY-MM-DD"
            onChangeText={(text) => handleChange(path, text)}
            keyboardType={Platform.OS === 'ios' ? 'default' : 'numeric'}
            accessibilityLabel={label}
          />
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={styles.calendarButton}
            accessibilityLabel="Open date picker"
          >
            <Icon name="calendar-today" size={24} color="#03AC13" />
          </TouchableOpacity>
        </View>
        {showDatePicker && (
          <DateTimePicker
            value={value ? new Date(value) : new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}
        {validationErrors[path] && (
          <Text style={styles.errorText}>{validationErrors[path]}</Text>
        )}
      </View>
    );
  };

  const renderDocumentUpload = (label, field) => {
    const document = formData.documents?.[field] || {};
    const validationError = validationErrors[`documents.${field}`] || fileValidationErrors[field];
  
    return (
      <View style={styles.inputContainer}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.documentContainer}>
          <TouchableOpacity
            style={[
              styles.uploadButton,
              validationError && styles.errorInput,
              document.uri && !validationError && styles.uploadButtonSuccess,
            ]}
            onPress={() => handleDocumentPick(field)}
            accessibilityLabel={`Upload ${label}`}
          >
            <Text style={[
              styles.uploadText,
              document.uri && !validationError && styles.uploadTextSuccess,
            ]}>
              {document.uri ? '📎 Change file' : '📎 Select file'}
            </Text>
          </TouchableOpacity>
          {document.uri && (
            <View style={styles.fileDetails}>
              <Text style={styles.fileName} numberOfLines={1} ellipsizeMode="middle">
                {document.name}
              </Text>
              <Text style={styles.fileSize}>
                {(document.size / 1024 / 1024).toFixed(2)} MB
              </Text>
            </View>
          )}
        </View>
        {validationError && (
          <Text style={styles.errorText}>{validationError}</Text>
        )}
      </View>
    );
  };

  const renderSiblingFields = () => {
    const hasSiblingsInSchool = formData.admissionDetail?.hasSiblingsInSchool;
    
    if (hasSiblingsInSchool) {
      return (
        <View style={styles.siblingDetailsContainer}>
          <Text style={styles.sectionSubtitle}>Sibling Details</Text>
          {renderInput('Sibling Name *', 'admissionDetail.siblingName', 'default', 'Enter sibling name')}
          {renderInput('Sibling Class *', 'admissionDetail.siblingClass', 'default', 'Enter sibling class')}
        </View>
      );
    }
    
    return null;
  };

  const renderDraftStatus = () => {
    if (!draftSaveStatus) return null;
    
    return (
      <View style={styles.draftStatusContainer}>
        <Text style={[
          styles.draftStatusText,
          draftSaveStatus === 'saved' ? styles.draftSavedText : styles.draftErrorText
        ]}>
          {draftSaveStatus === 'saved' ? '✓ Draft saved' : '❌ Failed to save draft'}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}
      >
        <View style={styles.header}>
          <Text style={styles.title}>School Admission Application</Text>
          <Text style={styles.subtitle}>Please fill all required fields marked with *</Text>
          {renderDraftStatus()}
        </View>
        
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Student Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Student Information</Text>
            {renderInput('Full Name *', 'student.fullName', 'default', 'John Doe')}
            {renderDateInput('Date of Birth *', 'student.dateOfBirth')}
            {renderInput('Gender *', 'student.gender', 'default', 'MALE or FEMALE')}
            {renderInput('Nationality *', 'student.nationality', 'default', 'Enter nationality')}
            {renderInput('Religion *', 'student.religion', 'default', 'Enter religion')}

            {/* Address Fields */}
            <Text style={styles.sectionSubtitle}>Address</Text>
            {renderInput('Street Name', 'student.residentialAddress.streetName', 'default', 'Winskens Street')}
            {renderInput('House Number', 'student.residentialAddress.houseNumber', 'default', '123')}
            {renderInput('City *', 'student.residentialAddress.city', 'default', 'Mellow City')}
            {renderInput('Region/State *', 'student.residentialAddress.region', 'default', 'Enter region/state')}
            {renderInput('Country *', 'student.residentialAddress.country', 'default', 'Enter country')}

            {/* Medical Information */}
            <Text style={styles.sectionSubtitle}>Medical Information</Text>
            {renderInput('Blood Type *', 'student.medicalInformation.bloodType', 'default', 'A+ or A- or B+ or B- or AB+ or AB- or O+ or O-')}
            {renderInput('Allergies or Medical Conditions *', 'student.medicalInformation.allergiesOrConditions', 'default', 'Enter N/A if none')}
            {renderInput('Emergency Contact Name *', 'student.medicalInformation.emergencyContactName', 'default', 'Enter emergency contact name')}
            {renderInput('Emergency Contact Number *', 'student.medicalInformation.emergencyContactNumber', 'phone-pad', '0123456789')}
          </View>

          {/* Parent/Guardian Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Parent/Guardian Information</Text>
            {renderInput('First Name *', 'parentGuardian.firstName', 'default', 'Carl')}
            {renderInput('Last Name *', 'parentGuardian.lastName', 'default', 'Doe')}
            {renderInput('Contact Number *', 'parentGuardian.contactNumber', 'phone-pad', '0123456789')}
            {renderInput('Email Address *', 'parentGuardian.emailAddress', 'email-address', 'doe@example.com')}
            {renderInput('Occupation *', 'parentGuardian.occupation', 'default', 'Enter occupation')}
          </View>

          {/* Previous Academic Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Previous Academic Details</Text>
            {renderInput('Last School Attended *', 'previousAcademicDetail.lastSchoolAttended', 'default', 'High Town Academy')}
            {renderInput('Last Class Completed *', 'previousAcademicDetail.lastClassCompleted', 'default', '.eg.Grade 6')}
          </View>

          {/* Admission Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Admission Details</Text>
            {renderInput('Class for Admission *', 'admissionDetail.classForAdmission', 'default', ' .eg.Grade 1')}
            {renderInput('Academic Year *', 'admissionDetail.academicYear', 'default', 'Enter academic year (2013)')}
            {renderInput('Preferred Second Language *', 'admissionDetail.preferredSecondLanguage', 'default', 'Twi or English')}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Any Sibling in the School? *</Text>
              <Switch
                value={formData.admissionDetail?.hasSiblingsInSchool || false}
                onValueChange={(value) => handleChange('admissionDetail.hasSiblingsInSchool', value)}
                accessibilityLabel="Any Sibling in the School?"
              />
            </View>
            {renderSiblingFields()}
          </View>

          {/* Document Upload Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Required Documents</Text>
            <Text style={styles.documentNote}>Please upload PDF, JPEG or PNG files (max 10MB)</Text>

            {renderDocumentUpload('Passport Photo *', 'file1')}
            {renderDocumentUpload('Birth Certificate *', 'file2')}
            {renderDocumentUpload('Previous Results *', 'file3')}
          </View>

          {/* Error Message */}
          {submitError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{submitError}</Text>
            </View>
          )}

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={resetForm}
              disabled={isLoading}
              accessibilityLabel="Reset form"
            >
              <Text style={styles.resetButtonText}>Reset Form</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={isLoading}
              accessibilityLabel="Submit application"
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.submitButtonText}>Submit Application</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      {showSuccessModal && (
        <SuccessModal
          visible={showSuccessModal}
          onClose={handleSuccessModalClose}
          title="Application Submitted!"
          message="Your admission form was successfully processed. You'll receive a confirmation email shortly."
          iconName="checkmark-circle"
          iconColor="#4CAF50"
          autoDismiss={3000}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'aliceblue',
  },
  keyboardAvoidView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    padding: 20,
    backgroundColor: '#03AC13',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderBottomEndRadius: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'aliceblue',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'aliceblue',
    marginBottom: 8,
  },
  section: {
    backgroundColor: 'aliceblue',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#03AC13',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#03AC13',
    marginTop: 12,
    marginBottom: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#444',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    height: 40,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  dateInputContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  dateInput: {
    flex: 1,
  },
  documentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  uploadButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButtonSuccess: {
    backgroundColor: '#e6f7e6',
    borderColor: '#a3d9a3',
  },
  uploadText: {
    fontSize: 14,
    color: '#555',
  },
  uploadTextSuccess: {
    color: '#2e7d32',
  },
  fileDetails: {
    flex: 1,
    marginLeft: 8,
  },
  fileName: {
    fontSize: 14,
    color: '#333',
  },
  fileSize: {
    fontSize: 12,
    color: '#666',
  },
  documentNote: {
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  errorInput: {
    borderColor: '#d32f2f',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 12,
    marginTop: 4,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#d32f2f',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  resetButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#03AC13',
    borderRadius: 4,
    padding: 12,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#03AC13',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#03AC13',
    borderRadius: 4,
    padding: 12,
    flex: 2,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'aliceblue',
    fontWeight: '500',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
  siblingDetailsContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
    padding: 12,
    marginTop: 8,
  },
  draftStatusContainer: {
    marginTop: 8,
  },
  draftStatusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  draftSavedText: {
    color: 'aliceblue',
  },
  draftErrorText: {
    color: '#d32f2f',
  }
});

export default AdmissionForm;