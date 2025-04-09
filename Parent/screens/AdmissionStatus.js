import React, { useContext, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { AdmissionContext } from '../context/AdmissionContext';
import { useAuth } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/Ionicons';

const AdmissionStatus = ({ route }) => {
  const { getAdmissionStatus } = useContext(AdmissionContext);
  const { userInfo } = useAuth();
  const [admissionData, setAdmissionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  const applicationId = route?.params?.applicationId;

  const fetchAdmissionStatus = async () => {
    try {
      setError(null);
      setIsLoading(true);
      
      const data = await getAdmissionStatus();
      
      if (applicationId && data) {
        const specificApp = Array.isArray(data) 
          ? data.find(app => app.id === applicationId) 
          : data;
        setAdmissionData(specificApp ? [specificApp] : []);
      } else {
        setAdmissionData(Array.isArray(data) ? data : (data ? [data] : []));
      }

      if (applicationId) {
        setShowSuccessBanner(true);
        setTimeout(() => setShowSuccessBanner(false), 3000);
      }
    } catch (error) {
      console.error('Failed to fetch admission status:', error);
      setError(error.message || 'Failed to load admission status');
      setAdmissionData([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAdmissionStatus();
  }, [applicationId, userInfo]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAdmissionStatus();
  };

  const renderStatusCard = (admission) => {
    const status = admission?.status?.toLowerCase() || 'pending';
    const formattedDate = admission?.submissionDate 
      ? new Date(admission.submissionDate).toLocaleDateString() 
      : 'N/A';

    return (
      <View key={admission.id} style={styles.statusCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.studentName}>
            {admission.student?.fullName || 'Student Application'}
          </Text>
          <View style={[styles.statusBadge, styles[`statusBadge_${status}`]]}>
            <Text style={styles.statusText}>
              {formatStatus(admission.status)}
            </Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Icon name="document-text-outline" size={16} color="#666" />
          <Text style={styles.detailLabel}>Reference:</Text>
          <Text style={styles.detailValue}>{admission.refNumber || 'N/A'}</Text>
        </View>

        <View style={styles.detailRow}>
          <Icon name="school-outline" size={16} color="#666" />
          <Text style={styles.detailLabel}>Class:</Text>
          <Text style={styles.detailValue}>
            {admission.admissionDetail?.classForAdmission || 'N/A'}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Icon name="calendar-outline" size={16} color="#666" />
          <Text style={styles.detailLabel}>Academic Year:</Text>
          <Text style={styles.detailValue}>
            {admission.admissionDetail?.academicYear || 'N/A'}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Icon name="time-outline" size={16} color="#666" />
          <Text style={styles.detailLabel}>Submitted:</Text>
          <Text style={styles.detailValue}>{formattedDate}</Text>
        </View>

        {admission.comments && (
          <View style={styles.commentsContainer}>
            <Text style={styles.commentsLabel}>
              <Icon name="chatbubble-outline" size={14} color="#666" /> Comments:
            </Text>
            <Text style={styles.commentsText}>{admission.comments}</Text>
          </View>
        )}
      </View>
    );
  };

  if (isLoading && !admissionData) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#007AFF"]}
          />
        }
      >
        {showSuccessBanner && (
          <View style={styles.successBanner}>
            <View style={styles.progressBar} />
            <Icon name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.successText}>Application submitted successfully!</Text>
          </View>
        )}

        <Text style={styles.title}>Admission Status</Text>
        
        {error && (
          <View style={styles.errorContainer}>
            <Icon name="warning-outline" size={20} color="#D32F2F" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={fetchAdmissionStatus}>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {admissionData?.length > 0 ? (
          admissionData.map(renderStatusCard)
        ) : (
          <View style={styles.emptyState}>
            <Icon name="document-outline" size={50} color="#999" />
            <Text style={styles.emptyText}>No admission applications found</Text>
            <Text style={styles.emptySubtext}>
              {error ? 'Could not load applications' : 'Submit an application to view status'}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const formatStatus = (status) => {
  if (!status) return 'Pending Review';
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#03AC13',
    marginBottom: 16,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  successText: {
    color: '#2E7D32',
    marginLeft: 8,
    fontWeight: '500',
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 12,
  },
  studentName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  statusBadge_pending: {
    backgroundColor: '#fff4e5',
  },
  statusBadge_approved: {
    backgroundColor: '#e6f7e6',
  },
  statusBadge_rejected: {
    backgroundColor: '#ffebee',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusText_pending: {
    color: '#ff9800',
  },
  statusText_approved: {
    color: '#4caf50',
  },
  statusText_rejected: {
    color: '#f44336',
  },
  progressBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 3,
    backgroundColor: '#4CAF50',
    width: '100%',
    animation: 'progress 3s linear',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    width: 100,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  commentsContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  commentsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  commentsText: {
    fontSize: 14,
    color: '#444',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: 'column',
    alignItems: 'center',
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
    marginVertical: 8,
  },
  retryText: {
    color: '#007AFF',
    fontWeight: '500',
  },
});

export default AdmissionStatus;