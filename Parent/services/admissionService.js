import * as SecureStorage from 'expo-secure-store';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import axios from 'axios';
import { APIConfig } from '../config';
import { sanitizeError } from '../utils/helpers';

const logger = {
  error: (message, error) => console.error(`[AdmissionService] ${message}`, error),
  info: (message) => console.log(`[AdmissionService] ${message}`),
};

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;
const MAX_FILE_SIZE_MB = 10;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

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

const getAuthHeaders = async () => {
  try {
    const token = await SecureStorage.getItemAsync('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    return {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  } catch (error) {
    logger.error('Failed to get auth headers:', error);
    throw new Error('Authentication failed - please login again');
  }
};

const admissionService = {
  /**
   * Submits the complete admission form with documents
   * @param {Object} formData - The complete form data
   * @returns {Promise<Object>} - The server response
   */
async submitAdmissionForm(formData) {
  let retryCount = 0;
  
  while (retryCount <= MAX_RETRIES) {
    try {
      logger.info('Starting form submission attempt', { attempt: retryCount + 1 });
      
      const formSubmissionData = new FormData();
      const { documents, ...formFields } = formData;
      
      // Add all non-document fields as JSON
      formSubmissionData.append('data', JSON.stringify(formFields));

      // Process and append documents
      for (const [key, fileInfo] of Object.entries(documents)) {
        if (!fileInfo) {
          throw new Error(`Missing required document: ${key}`);
        }

        const resolvedUri = resolveFileUri(fileInfo);
        if (!resolvedUri) {
          throw new Error(`Invalid file information for ${key}`);
        }

        const mimeType = getMimeType(fileInfo.name);
        if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
          throw new Error(`Invalid file type for ${key}. Only PDF, JPEG, and PNG are allowed.`);
        }

        const fileStats = await FileSystem.getInfoAsync(resolvedUri);
        if (!fileStats.exists || !fileStats.size) {
          throw new Error(`File for ${key} does not exist or is empty`);
        }

        const fileSizeMB = fileStats.size / (1024 * 1024);
        if (fileSizeMB > MAX_FILE_SIZE_MB) {
          throw new Error(`File for ${key} exceeds ${MAX_FILE_SIZE_MB}MB size limit`);
        }

        formSubmissionData.append(key, {
          uri: resolvedUri,
          name: fileInfo.name,
          type: mimeType,
        });
      }

      const headers = await getAuthHeaders();
      headers['Content-Type'] = 'multipart/form-data';

      const response = await axios.post(
        `${APIConfig.BASE_URL}${APIConfig.ADMISSIONS.SUBMIT}`,
        formSubmissionData,
        { headers, timeout: 30000 }
      );

      logger.info('Form submitted successfully');
      return response.data;
    } catch (error) {
      if (retryCount >= MAX_RETRIES) {
        logger.error('Final form submission attempt failed');
        throw new Error(sanitizeError(error));
      }
      
      if (error.response && error.response.status === 401) {
        // Token might be expired, try to refresh
        try {
          const token = await SecureStorage.getItemAsync('authToken');
          if (token) {
            const newToken = await AuthService.refreshToken(token);
            await SecureStorage.setItemAsync('authToken', newToken);
          }
        } catch (refreshError) {
          logger.error('Token refresh failed during form submission', refreshError);
          throw new Error('Session expired. Please login again.');
        }
      }
      
      retryCount++;
      logger.info(`Retrying form submission in ${RETRY_DELAY}ms`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }
},

  /**
   * Saves the current form data as a draft
   * @param {Object} formData - The form data to save
   * @returns {Promise<boolean>} - True if successful
   */
  async saveFormDraft(formData) {
    try {
      await SecureStorage.setItemAsync(
        'admission_draft', 
        JSON.stringify({ 
          formData, 
          timestamp: new Date().toISOString() 
        })
      );
      logger.info('Draft saved successfully');
      return true;
    } catch (error) {
      logger.error('Failed to save draft:', error);
      throw new Error('Failed to save draft');
    }
  },

  /**
   * Loads the saved draft form data
   * @returns {Promise<Object|null>} - The saved form data or null if none exists
   */
  async loadFormDraft() {
    try {
      const draftString = await SecureStorage.getItemAsync('admission_draft');
      if (!draftString) {
        logger.info('No draft found');
        return null;
      }

      const draft = JSON.parse(draftString);
      logger.info('Loaded draft from storage');
      return draft.formData;
    } catch (error) {
      logger.error('Failed to load draft:', error);
      throw new Error('Failed to load saved information');
    }
  },

  /**
   * Clears the saved draft form data
   * @returns {Promise<boolean>} - True if successful
   */
  async clearFormDraft() {
    try {
      await SecureStorage.deleteItemAsync('admission_draft');
      logger.info('Draft cleared successfully');
      return true;
    } catch (error) {
      logger.error('Failed to clear draft:', error);
      throw new Error('Failed to clear saved information');
    }
  },

  /**
   * Validates a document file
   * @param {Object} fileInfo - The file information
   * @returns {Promise<boolean>} - True if valid
   */
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
  }
};

export default admissionService;