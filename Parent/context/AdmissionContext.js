import React, { createContext, useState, useCallback, useEffect, useRef } from 'react';
import AdmissionService from '../services/Admission';
import { useAuth } from '../context/AuthContext';

export const AdmissionContext = createContext();

const INITIAL_FORM_STATE = {
  student: {
    fullName: '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    religion: '',
    residentialAddress: { 
      streetName: '', 
      houseNumber: '', 
      city: '', 
      region: '', 
      country: ''
    },
    medicalInformation: {
      bloodType: '',
      allergiesOrConditions: '',
      emergencyContactName: '',
      emergencyContactNumber: '',
    },
  },
  parentGuardian: {
    firstName: '',
    lastName: '',
    contactNumber: '',
    emailAddress: '',
    occupation: '',
  },
  previousAcademicDetail: {
    lastSchoolAttended: '',
    lastClassCompleted: '',
  },
  admissionDetail: {
    classForAdmission: '',
    academicYear: '',
    preferredSecondLanguage: '',
    hasSiblingsInSchool: false,
    siblingName: '',
    siblingClass: '',
  },
  documents: {
    file1: null,
    file2: null,
    file3: null,
  },
};

export const AdmissionProvider = ({ children }) => {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [draftSaveStatus, setDraftSaveStatus] = useState(null);
  const isMounted = useRef(true);
  const draftSaveTimer = useRef(null);
  const { userInfo } = useAuth();

  useEffect(() => {
    return () => { 
      isMounted.current = false;
      if (draftSaveTimer.current) {
        clearTimeout(draftSaveTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isLoading || JSON.stringify(formData) === JSON.stringify(INITIAL_FORM_STATE)) {
      return;
    }
    
    if (draftSaveTimer.current) {
      clearTimeout(draftSaveTimer.current);
    }
    
    draftSaveTimer.current = setTimeout(async () => {
      try {
        const result = await AdmissionService.saveFormDraft(formData);
        if (isMounted.current && result) {
          setDraftSaveStatus('saved');
          setTimeout(() => {
            if (isMounted.current) {
              setDraftSaveStatus(null);
            }
          }, 3000);
        }
      } catch (error) {
        if (isMounted.current) {
          setDraftSaveStatus('error');
        }
      }
    }, 5000);
    
    return () => {
      if (draftSaveTimer.current) clearTimeout(draftSaveTimer.current);
    };
  }, [formData, isLoading]);

  useEffect(() => {
    const loadDraft = async () => {
      try {
        setIsLoading(true);
        const draft = await AdmissionService.loadFormDraft();
        if (isMounted.current) {
          setFormData(draft || INITIAL_FORM_STATE);
          setHasLoaded(true);
        }
      } catch (error) {
        if (isMounted.current) {
          setError('Could not load your saved information');
        }
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    };
    
    if (!hasLoaded) {
      loadDraft();
    }
  }, [hasLoaded]);

  const deepMerge = useCallback((target, source) => {
    if (typeof target !== 'object' || typeof source !== 'object') {
      return source;
    }
    
    const output = { ...target };
    for (const key in source) {
      if (source[key] instanceof Object && key in target) {
        output[key] = deepMerge(target[key], source[key]);
      } else {
        output[key] = source[key];
      }
    }
    return output;
  }, []);

  const updateFormData = useCallback((updates) => {
    setFormData(prev => deepMerge(prev || INITIAL_FORM_STATE, updates));
    setValidationErrors({});
  }, [deepMerge]);

  const validateForm = useCallback(async () => {
    try {
      const validation = await AdmissionService.validateForm(formData || INITIAL_FORM_STATE);
      if (isMounted.current) {
        setValidationErrors(validation.errors);
      }
      return validation;
    } catch (error) {
      if (isMounted.current) {
        setError('Could not validate your form. Please try again.');
      }
      return { isValid: false, errors: {} };
    }
  }, [formData]);

  const submitForm = useCallback(async () => {
    if (isLoading) return null;
  
    setIsLoading(true);
    setError(null);
    setValidationErrors({});
  
    try {
      const validation = await validateForm();
      if (!validation.isValid) {
        setIsLoading(false);
        throw new Error('Please fix the validation errors');
      }
  
      const response = await AdmissionService.submitAdmissionForm(formData);
  
      if (isMounted.current) {
        setFormData(INITIAL_FORM_STATE);
      }
  
      await AdmissionService.clearFormDraft();
      return response;
    } catch (error) {
      if (isMounted.current) {
        setError(error.message || 'Could not submit your form. Please try again.');
      }
      return null;
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [formData, validateForm, isLoading]);  

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_STATE);
    setValidationErrors({});
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const getAdmissionStatus = useCallback(async () => {
    if (!userInfo?.id) return null;
    
    try {
      setIsLoading(true);
      const response = await AdmissionService.getAdmissionStatus(
        userInfo.id,
        userInfo.token
      );
      return response;
    } catch (error) {
      setError(error.message || 'Could not fetch admission status');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userInfo?.id, userInfo?.token]);

  return (
    <AdmissionContext.Provider value={{
      formData,
      isLoading,
      error,
      validationErrors,
      draftSaveStatus,
      updateFormData,
      validateForm,
      submitForm,
      resetForm,
      clearError,
      getAdmissionStatus
    }}>
      {children}
    </AdmissionContext.Provider>
  );
};