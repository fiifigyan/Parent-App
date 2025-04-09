import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import axios from 'axios';
import AuthService from './AuthenService';
import { API_CONFIG } from '../config';

const logger = {
  error: (message, error) => console.error(`[AdmissionService] ${message}`, error),
  info: (message) => console.log(`[AdmissionService] ${message}`),
};

const REQUIRED_FIELDS = {
  student: [
    'fullName', 'dateOfBirth', 'gender', 'nationality', 'religion',
    'residentialAddress.streetName', 'residentialAddress.houseNumber', 
    'residentialAddress.city', 'residentialAddress.region', 'residentialAddress.country',
    'medicalInformation.bloodType', 
    'medicalInformation.emergencyContactName', 
    'medicalInformation.emergencyContactNumber', 
    'medicalInformation.allergiesOrConditions'
  ],
  previousAcademicDetail: [
    'lastSchoolAttended', 
    'lastClassCompleted'
  ],
  admissionDetail: [
    'classForAdmission', 
    'academicYear', 
    'preferredSecondLanguage'
  ],
  parentGuardian: [
    'firstName', 
    'lastName', 
    'contactNumber', 
    'emailAddress', 
    'occupation'
  ],
  documents: [
    'file1', 
    'file2', 
    'file3'
  ],
};

const MAX_FILE_SIZE_MB = 10;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

const sanitizeError = (error) => {
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

const resolveFileUri = (fileInfo) => {
  if (!fileInfo) {
    logger.error('File info is missing');
    return null;
  }

  const uri = fileInfo.uri || fileInfo.assets?.[0]?.uri || (typeof fileInfo === 'string' ? fileInfo : null);
  if (!uri) {
    logger.error('File URI is missing');
    return null;
  }

  let resolvedUri = uri;

  if (Platform.OS === 'android' && !uri.startsWith('file://') && !uri.startsWith('content://')) {
    resolvedUri = `file://${uri}`;
  } else if (Platform.OS === 'ios' && !uri.startsWith('file://')) {
    resolvedUri = `file://${uri}`;
  }

  logger.info(`Resolved URI: ${resolvedUri}`);
  return resolvedUri;
};

const getMimeType = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();
  switch (extension) {
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'png': return 'image/png';
    case 'pdf': return 'application/pdf';
    default: throw new Error(`Unsupported file type: ${extension}`);
  }
};

const inspectFormData = async (formData) => {
  const parts = [];
  for (const [key, value] of formData._parts) {
    parts.push(`${key}: ${value instanceof Object ? `FILE (${value.name})` : value}`);
  }
  logger.info('FormData Content:\n' + parts.join('\n'));
};

const getAuthHeaders = async () => {
  try {
    const verification = await AuthService.verifyToken();
    if (!verification) {
      throw new Error('Authentication required - please try again');
    }
    return {
      'Accept': 'application/json',
      'Authorization-Mobile': `Bearer ${verification.token}`,
    };
  } catch (error) {
    logger.error('Failed to get auth headers:', error);
    throw new Error('Authentication failed');
  }
};

const AdmissionService = {
  async submitAdmissionForm(formData) {
    try {
      const validation = await this.validateForm(formData);
      if (!validation.isValid) {
        throw new Error('Form validation failed: ' + Object.values(validation.errors).join(', '));
      }

      await Promise.all(Object.entries(formData.documents || {}).map(async ([key, fileInfo]) => {
        await this.validateDocument(fileInfo);
      }));

      const formSubmissionData = new FormData();
      formSubmissionData.append('data', JSON.stringify({ ...formData, documents: undefined }));

      for (const [key, fileInfo] of Object.entries(formData.documents || {})) {
        const resolvedUri = resolveFileUri(fileInfo);
        if (!resolvedUri) throw new Error(`Invalid file information for ${key}`);

        const mimeType = getMimeType(fileInfo.name);
        if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
          throw new Error(`Invalid file type for ${key}`);
        }

        logger.info(`Appending file: ${fileInfo.name}, MIME type: ${mimeType}, URI: ${resolvedUri}`);
        formSubmissionData.append(key, {
          uri: resolvedUri,
          name: fileInfo.name,
          type: mimeType,
        });
      }

      await inspectFormData(formSubmissionData);

      const headers = await getAuthHeaders();
      headers['Content-Type'] = 'multipart/form-data';

      const response = await axios.post(
        API_CONFIG.ADMISSION_ENDPOINTS.SUBMIT_ADMISSION_FORM,
        formSubmissionData,
        { headers }
      );

      await this.clearFormDraft();
      return response.data;
    } catch (error) {
      logger.error('Admission Form Submission Failed:', error);
      if (error.response) {
        logger.error('Response data:', error.response.data);
        logger.error('Response status:', error.response.status);
        logger.error('Response headers:', error.response.headers);
      } else if (error.request) {
        logger.error('No response received:', error.request);
      } else {
        logger.error('Request setup error:', error.message);
      }
      throw new Error(sanitizeError(error));
    }
  },

  async validateDocument(fileInfo) {
    try {
      if (!fileInfo) throw new Error('Invalid file information');

      const resolvedUri = resolveFileUri(fileInfo);
      if (!resolvedUri) throw new Error('Missing file URI');

      if (!fileInfo.name) throw new Error('Missing file name');
      if (!fileInfo.size) throw new Error('Missing file size');

      const mimeType = getMimeType(fileInfo.name);
      if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
        throw new Error(`Invalid file type: ${mimeType}`);
      }

      const fileStats = await FileSystem.getInfoAsync(resolvedUri);
      if (!fileStats.exists || !fileStats.size) {
        throw new Error('Invalid file');
      }

      const fileSizeMB = fileStats.size / (1024 * 1024);
      if (fileSizeMB > MAX_FILE_SIZE_MB) {
        throw new Error(`File size exceeds ${MAX_FILE_SIZE_MB}MB limit`);
      }

      return true;
    } catch (error) {
      logger.error('Document validation failed', error);
      throw new Error(sanitizeError(error));
    }
  },

  async validateForm(formData) {
    const errors = {};
    const checkField = (obj, path) => {
      return path.split('.').reduce((current, part) => (current ? current[part] : null), obj);
    };

    const isEmptyValue = (value) => !value || (typeof value === 'string' && value.trim() === '') || (Array.isArray(value) && value.length === 0);

    Object.entries(REQUIRED_FIELDS).forEach(([section, fields]) => {
      fields.forEach((field) => {
        const fullPath = `${section}.${field}`;
        const value = checkField(formData, fullPath);
        if (isEmptyValue(value)) {
          const fieldName = field.split('.').pop();
          const readableName = fieldName
            .replace(/([A-Z])/g, ' $1')
            .replace(/_/g, ' ')
            .toLowerCase();
          errors[fullPath] = `${readableName} is required`;
        }
      });
    });

    if (formData.admissionDetail?.hasSiblingsInSchool) {
      if (isEmptyValue(formData.admissionDetail.siblingName)) {
        errors['admissionDetail.siblingName'] = 'sibling name is required';
      }
      if (isEmptyValue(formData.admissionDetail.siblingClass)) {
        errors['admissionDetail.siblingClass'] = 'sibling class is required';
      }
    }

    return { isValid: Object.keys(errors).length === 0, errors };
  },

  async saveFormDraft(formData) {
    try {
      await AsyncStorage.setItem('admission_draft', JSON.stringify({ formData, timestamp: new Date().toISOString() }));
      return true;
    } catch (error) {
      logger.error('Failed to save draft', error);
      throw new Error('Failed to save draft');
    }
  },

  async loadFormDraft() {
    try {
      const draft = await AsyncStorage.getItem('admission_draft');
      return draft ? JSON.parse(draft).formData : null;
    } catch (error) {
      logger.error('Failed to load draft', error);
      return null;
    }
  },

  async clearFormDraft() {
    try {
      await AsyncStorage.removeItem('admission_draft');
      return true;
    } catch (error) {
      logger.error('Failed to clear draft', error);
      return false;
    }
  },

  async getAdmissionStatusById(id) {
    try {
      if (!id) throw new Error('Application ID is required');
      const headers = await getAuthHeaders();
      const endpoint = API_CONFIG.ADMISSION_ENDPOINTS.GET_ADMISSION_STATUS.BY_APPLICATION.replace('${applicationId}', id);
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}${endpoint}`,
        { headers }
      );

      return response.data;
    } catch (error) {
      logger.error('Failed to fetch admission status by ID:', error);
      throw new Error(sanitizeError(error));
    }
  },

  async getAdmissionStatus(parentId) {
    try {
      if (!parentId) throw new Error('Parent ID is required');

      const headers = await getAuthHeaders();
      const endpoint = API_CONFIG.ADMISSION_ENDPOINTS.GET_ADMISSION_STATUS.BY_PARENT.replace('${parentId}', parentId);
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}${endpoint}/${parentId}`,
        { headers }
      );

      return response.data;
    } catch (error) {
      logger.error('Failed to fetch admission status:', error);
      throw new Error(sanitizeError(error));
    }
  },
};

export default AdmissionService;